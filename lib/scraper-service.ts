import puppeteer from 'puppeteer';
import { db } from './db';

interface ScraperOptions {
    siteUrl: string;
    email: string;
    password: string;
    workflowUrl?: string;
    workflowId?: string;
    showBrowser?: boolean;
}

export async function runScraper({
    siteUrl,
    email,
    password,
    workflowUrl,
    workflowId,
    showBrowser = false,
}: ScraperOptions) {
    // Construct target URL
    let targetUrl = workflowUrl;
    if (workflowId) {
        // Ensure siteUrl doesn't have trailing slash
        const cleanSiteUrl = siteUrl.replace(/\/$/, '');
        targetUrl = `${cleanSiteUrl}/workflow/${workflowId}`;
    }

    if (!targetUrl) {
        throw new Error("Either workflowUrl or workflowId must be provided");
    }

    // Fetch settings to determine Browserless configuration
    const settings = await db.settings.findFirst();
    let browser;
    let isBrowserless = false;

    if (settings?.browserlessUrl && settings?.browserlessApiKey) {
        // Try to connect to Browserless if configured
        try {
            // Convert http:// to ws:// and https:// to wss:// for WebSocket connection
            let wsUrl = settings.browserlessUrl;
            if (wsUrl.startsWith('http://')) {
                wsUrl = wsUrl.replace('http://', 'ws://');
            } else if (wsUrl.startsWith('https://')) {
                wsUrl = wsUrl.replace('https://', 'wss://');
            }

            const endpoint = `${wsUrl}?token=${settings.browserlessApiKey}`;
            console.log('[Scraper] Attempting to connect to Browserless:', endpoint);
            console.log('[Scraper] Connection options:', {
                browserWSEndpoint: endpoint,
                timeout: 60000 // 60 second timeout
            });

            // Use puppeteer-core for remote browser connections
            // Note: We need to import puppeteer-core dynamically or ensure it's imported at top
            const puppeteerCore = require('puppeteer-core');
            browser = await puppeteerCore.connect({
                browserWSEndpoint: endpoint,
                protocolTimeout: 60000, // Increase timeout to 60 seconds
            });
            isBrowserless = true;
            console.log('[Scraper] Successfully connected to Browserless');
        } catch (browserlessError: any) {
            console.error('[Scraper] Browserless connection failed with details:');
            console.error('  Error type:', browserlessError?.constructor?.name);
            console.error('  Error message:', browserlessError?.message);
            console.warn('[Scraper] Falling back to local Puppeteer');

            // Use puppeteer for local browser
            browser = await puppeteer.launch({
                args: ['--hide-scrollbars', '--incognito', '--no-sandbox'],
                headless: !showBrowser,
            });
            isBrowserless = false;
        }
    } else {
        // Fall back to local Puppeteer
        console.log('[Scraper] Using local Puppeteer (no Browserless configured)');
        // Use puppeteer for local browser
        browser = await puppeteer.launch({
            args: ['--hide-scrollbars', '--incognito', '--no-sandbox'],
            headless: !showBrowser,
        });
        isBrowserless = false;
    }

    try {
        const page = await browser.newPage();
        console.log('[Scraper] New page created');

        await page.setViewport({
            width: 1920,
            height: 1080,
            deviceScaleFactor: 2,
        });

        console.log(`[Scraper] Navigating to ${siteUrl}`);
        await page.goto(siteUrl, { waitUntil: 'networkidle2' });
        console.log('[Scraper] Navigation complete');

        // Login
        console.log('[Scraper] Waiting for login form');
        await page.waitForSelector('input[name="emailOrLdapLoginId"]');
        await page.type('input[name="emailOrLdapLoginId"]', email);

        await page.waitForSelector('input[name="password"]');
        await page.type('input[name="password"]', password);

        console.log('[Scraper] Submitting login form');
        try {
            await page.waitForSelector('[data-test-id="form-submit-button"]');
            await page.click('[data-test-id="form-submit-button"]');
        } catch {
            console.log('[Scraper] Using fallback submit button');
            await page.click('button[type="submit"]');
        }

        // Wait for navigation
        console.log('[Scraper] Waiting for navigation after login');
        if (showBrowser) {
            try {
                await page.waitForNetworkIdle({ timeout: 10000 });
            } catch {
                console.log('Network idle timeout, proceeding anyway');
            }
        } else {
            await page.waitForNavigation({ waitUntil: 'networkidle2' });
        }
        console.log('[Scraper] Login navigation complete');

        // Go to Workflow
        console.log(`[Scraper] Navigating to workflow: ${targetUrl}`);
        await page.goto(targetUrl, { waitUntil: 'networkidle2' });
        console.log('[Scraper] Workflow page loaded');

        // Wait for canvas/elements to load
        console.log('[Scraper] Waiting 5s for canvas to render');
        await new Promise((r) => setTimeout(r, 5000));

        console.log('[Scraper] Taking screenshot');
        const screenshotBuffer = await page.screenshot({ encoding: 'base64' });
        const pageTitle = await page.title();
        console.log(`[Scraper] Screenshot taken. Title: ${pageTitle}`);

        // Save to DB
        const finalWorkflowId = workflowId || (targetUrl.split('/').pop() || 'unknown');
        const savedRecord = await db.screenshot.create({
            data: {
                workflowId: finalWorkflowId,
                base64Data: screenshotBuffer,
            },
        });
        console.log(`[Scraper] Screenshot saved to DB with ID: ${savedRecord.id}`);

        // Trigger Webhook if configured
        const settings = await db.settings.findFirst();
        if (settings?.webhookUrl) {
            try {
                await fetch(settings.webhookUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        workflowId: finalWorkflowId,
                        pageTitle,
                        screenshotId: savedRecord.id,
                        timestamp: new Date().toISOString(),
                    }),
                });
                console.log('Webhook triggered successfully');
            } catch (err) {
                console.error('Failed to trigger webhook:', err);
            }
        }

        return {
            success: true,
            pageTitle,
            screenshot: `data:image/png;base64,${screenshotBuffer}`,
            recordId: savedRecord.id,
        };
    } catch (error) {
        console.error('Scraper Error:', error);
        throw error;
    } finally {
        // Properly clean up browser connection
        try {
            if (browser) {
                if (isBrowserless) {
                    // For Browserless, use disconnect() instead of close()
                    await browser.disconnect();
                    console.log('[Scraper] Disconnected from Browserless');
                } else {
                    // For local Puppeteer, use close()
                    await browser.close();
                    console.log('[Scraper] Closed local browser');
                }
            }
        } catch (closeError) {
            console.warn('[Scraper] Error during browser cleanup:', closeError);
        }
    }
}
