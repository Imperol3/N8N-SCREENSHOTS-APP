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

    const browser = await puppeteer.launch({
        args: ['--hide-scrollbars', '--incognito', '--no-sandbox'],
        headless: !showBrowser,
    });

    try {
        const page = await browser.newPage();
        await page.setViewport({
            width: 1920,
            height: 1080,
            deviceScaleFactor: 2,
        });

        await page.goto(siteUrl, { waitUntil: 'networkidle2' });

        // Login
        await page.waitForSelector('input[name="emailOrLdapLoginId"]');
        await page.type('input[name="emailOrLdapLoginId"]', email);

        await page.waitForSelector('input[name="password"]');
        await page.type('input[name="password"]', password);

        try {
            await page.waitForSelector('[data-test-id="form-submit-button"]');
            await page.click('[data-test-id="form-submit-button"]');
        } catch {
            await page.click('button[type="submit"]');
        }

        // Wait for navigation
        if (showBrowser) {
            try {
                await page.waitForNetworkIdle({ timeout: 10000 });
            } catch {
                console.log('Network idle timeout, proceeding anyway');
            }
        } else {
            await page.waitForNavigation({ waitUntil: 'networkidle2' });
        }

        // Go to Workflow
        await page.goto(targetUrl, { waitUntil: 'networkidle2' });

        // Wait for canvas/elements to load
        await new Promise((r) => setTimeout(r, 5000));

        const screenshotBuffer = await page.screenshot({ encoding: 'base64' });
        const pageTitle = await page.title();

        // Save to DB
        const finalWorkflowId = workflowId || (targetUrl.split('/').pop() || 'unknown');
        const savedRecord = await db.screenshot.create({
            data: {
                workflowId: finalWorkflowId,
                base64Data: screenshotBuffer,
            },
        });

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
        await browser.close();
    }
}
