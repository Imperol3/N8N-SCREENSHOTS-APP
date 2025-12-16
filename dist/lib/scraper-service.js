"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runScraper = runScraper;
const puppeteer_1 = __importDefault(require("puppeteer"));
async function runScraper({ siteUrl, email, password, workflowUrl, workflowId, showBrowser = false, }) {
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
    // Launch local Puppeteer
    console.log('[Scraper] Using local Puppeteer');
    const browser = await puppeteer_1.default.launch({
        args: ['--hide-scrollbars', '--incognito', '--no-sandbox'],
        headless: !showBrowser,
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
    });
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
        }
        catch {
            console.log('[Scraper] Using fallback submit button');
            await page.click('button[type="submit"]');
        }
        // Wait for navigation
        console.log('[Scraper] Waiting for navigation after login');
        if (showBrowser) {
            try {
                await page.waitForNetworkIdle({ timeout: 10000 });
            }
            catch {
                console.log('Network idle timeout, proceeding anyway');
            }
        }
        else {
            await page.waitForNavigation({ waitUntil: 'networkidle2' });
        }
        console.log('[Scraper] Login navigation complete');
        // Go to Workflow
        console.log(`[Scraper] Navigating to workflow: ${targetUrl}`);
        // Use domcontentloaded instead of networkidle2 because n8n likely has polling/websockets
        // that keep the network active, causing networkidle2 to hang/timeout.
        await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });
        console.log('[Scraper] Workflow page loaded (DOM content)');
        // Smart Wait: Wait for nodes to appear instead of hard sleep
        console.log('[Scraper] Waiting for workflow canvas (smart wait)...');
        try {
            // Wait for at least one node to be rendered
            await page.waitForSelector('.react-flow__node', { timeout: 15000 });
            // Give a small buffer for the final render cycle/animations to finish
            await new Promise((r) => setTimeout(r, 1000));
        }
        catch (e) {
            console.warn('[Scraper] Warning: Timed out waiting for .react-flow__node, proceeding to screenshot anyway');
        }
        console.log('[Scraper] Taking screenshot');
        const screenshotBuffer = await page.screenshot({ encoding: 'base64' });
        const pageTitle = await page.title();
        console.log(`[Scraper] Screenshot taken. Title: ${pageTitle}`);
        return {
            success: true,
            pageTitle,
            screenshot: `data:image/png;base64,${screenshotBuffer}`,
        };
    }
    catch (error) {
        console.error('Scraper Error:', error);
        throw error;
    }
    finally {
        // Properly clean up browser connection
        try {
            if (browser) {
                await browser.close();
                console.log('[Scraper] Closed local browser');
            }
        }
        catch (closeError) {
            console.warn('[Scraper] Error during browser cleanup:', closeError);
        }
    }
}
