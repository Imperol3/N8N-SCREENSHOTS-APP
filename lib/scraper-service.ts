import puppeteer from 'puppeteer';

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
    const executionId = Math.random().toString(36).substring(7);
    console.log(`[Scraper ${executionId}] Starting scraper for ${siteUrl}`);

    // Construct target URL
    let targetUrl = workflowUrl;
    if (workflowId) {
        const cleanSiteUrl = siteUrl.replace(/\/$/, '');
        targetUrl = `${cleanSiteUrl}/workflow/${workflowId}`;
    }

    if (!targetUrl) {
        throw new Error("Either workflowUrl or workflowId must be provided");
    }

    // Initialize Browser
    let browser;
    const browserlessUrl = process.env.BROWSERLESS_URL;

    if (browserlessUrl) {
        const token = process.env.BROWSERLESS_TOKEN;
        const params = new URLSearchParams();
        if (token) params.append('token', token);
        // params.append('--ignore-certificate-errors', 'true'); // Removed as per user request
        params.append('timeout', '120000');

        const connectionUrl = `${browserlessUrl.replace(/\/$/, '')}?${params.toString()}`;

        console.log(`[Scraper ${executionId}] Connecting to remote Browserless: ${browserlessUrl}`);
        browser = await puppeteer.connect({
            browserWSEndpoint: connectionUrl,
            defaultViewport: null,
        });
    } else {
        // Launch local Puppeteer
        console.log(`[Scraper ${executionId}] Using local Puppeteer`);
        browser = await puppeteer.launch({
            args: ['--hide-scrollbars', '--incognito', '--no-sandbox'],
            headless: !showBrowser,
            executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
        });
    }

    try {
        const page = await browser.newPage();
        page.setDefaultNavigationTimeout(60000);
        console.log(`[Scraper ${executionId}] New page created`);

        await page.setViewport({
            width: 1280,
            height: 800,
        });

        console.log(`[Scraper ${executionId}] Navigating to ${siteUrl}`);
        // Use domcontentloaded for faster initial load
        await page.goto(siteUrl, { waitUntil: 'domcontentloaded' });
        console.log(`[Scraper ${executionId}] Navigation complete`);

        // Login
        console.log(`[Scraper ${executionId}] Waiting for login form`);
        await page.waitForSelector('input[name="emailOrLdapLoginId"]');
        await page.type('input[name="emailOrLdapLoginId"]', email);

        await page.waitForSelector('input[name="password"]');
        await page.type('input[name="password"]', password);

        console.log(`[Scraper ${executionId}] Submitting login form`);
        try {
            // Try the specific n8n test ID first (more reliable)
            await page.waitForSelector('[data-test-id="form-submit-button"]', { timeout: 5000 });
            await page.click('[data-test-id="form-submit-button"]');
        } catch (e) {
            // Fallback to generic submit button
            console.log(`[Scraper ${executionId}] Specific submit button not found, trying generic...`);
            await page.waitForSelector('button[type="submit"]', { timeout: 5000 });
            await page.click('button[type="submit"]');
        }

        // Wait for navigation after login
        // NOTE: networkidle2 does NOT work with Browserless for n8n (persistent WebSockets)
        // Use a fixed wait instead (3s is enough for redirect to start)
        console.log(`[Scraper ${executionId}] Waiting for login redirect...`);
        await new Promise(r => setTimeout(r, 3000));

        // Go to Workflow
        console.log(`[Scraper ${executionId}] Navigating to workflow: ${targetUrl}`);
        // Use domcontentloaded for faster workflow page load (networkidle2 hangs on Browserless)
        await page.goto(targetUrl, { waitUntil: 'networkidle2', timeout: 60000 });
        console.log(`[Scraper ${executionId}] Workflow page loaded (networkidle2)`);

        // Wait for 5 seconds as a safety buffer
        console.log(`[Scraper ${executionId}] Waiting 5 seconds for canvas to settle...`);
        await new Promise((r) => setTimeout(r, 5000));

        console.log(`[Scraper ${executionId}] Taking screenshot`);
        const screenshotBuffer = await page.screenshot({ encoding: 'base64' });
        const pageTitle = await page.title();
        console.log(`[Scraper ${executionId}] Screenshot taken. Title: ${pageTitle}`);

        // Prepare the response
        const result = {
            success: true,
            pageTitle,
            screenshot: `data:image/png;base64,${screenshotBuffer}`,
        };

        // Close browser in background (don't wait for it)
        // This saves 30+ seconds on the API response time
        browser.close().then(() => {
            console.log(`[Scraper ${executionId}] Browser closed (background)`);
        }).catch((err) => {
            console.warn(`[Scraper ${executionId}] Error closing browser:`, err);
        });

        // Return immediately
        return result;

    } catch (error) {
        console.error(`[Scraper ${executionId}] Error:`, error);
        // Only close browser on error (synchronously)
        if (browser) {
            try {
                await browser.close();
                console.log(`[Scraper ${executionId}] Browser closed after error`);
            } catch (closeErr) {
                console.warn(`[Scraper ${executionId}] Error closing browser after error:`, closeErr);
            }
        }
        throw error;
    }
}
