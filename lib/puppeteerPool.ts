import puppeteer from 'puppeteer';
import puppeteerCore, { Browser, Page } from 'puppeteer-core';
import { db } from './db';

// -------------------------------------------------------------------
// Configuration – adjust based on your environment / resources
// -------------------------------------------------------------------
const MAX_CONCURRENT = 6; // safe number of simultaneous tabs (see docs)

let browser: Browser | null = null;
const idlePages: Page[] = [];

/**
 * Initialise (or reuse) a single Chromium instance.
 * The browser is launched lazily on first request.
 * Checks for Browserless settings and connects accordingly.
 */
export async function getBrowser(): Promise<Browser> {
    if (!browser) {
        // Fetch settings to check for Browserless configuration
        const settings = await db.settings.findFirst();

        if (settings?.browserlessUrl && settings?.browserlessApiKey) {
            // Connect to Browserless
            const wsEndpoint = `${settings.browserlessUrl}?token=${settings.browserlessApiKey}`;

            // Allow self-signed certificates for Browserless WebSocket connection
            const originalRejectUnauthorized = process.env.NODE_TLS_REJECT_UNAUTHORIZED;
            process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

            try {
                browser = await puppeteerCore.connect({
                    browserWSEndpoint: wsEndpoint,
                    ignoreHTTPSErrors: true
                });
            } finally {
                // Restore original setting
                if (originalRejectUnauthorized !== undefined) {
                    process.env.NODE_TLS_REJECT_UNAUTHORIZED = originalRejectUnauthorized;
                } else {
                    delete process.env.NODE_TLS_REJECT_UNAUTHORIZED;
                }
            }
        } else {
            // Launch local Chromium (type assertion needed due to puppeteer vs puppeteer-core types)
            browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox', '--hide-scrollbars', '--incognito'],
            }) as unknown as Browser;
        }
    }
    return browser;
}

/** Acquire a page (tab) from the pool. Creates a new one if we are under the limit. */
async function acquirePage(): Promise<Page> {
    if (idlePages.length) return idlePages.pop()!;

    const currentPages = (await (await getBrowser()).pages()).length;
    if (currentPages < MAX_CONCURRENT) {
        return (await getBrowser()).newPage();
    }

    // Wait for a page to become free
    return new Promise<Page>((resolve) => {
        const interval = setInterval(() => {
            if (idlePages.length) {
                clearInterval(interval);
                resolve(idlePages.pop()!);
            }
        }, 100);
    });
}

/** Return a page to the pool (or close it if we have too many). */
function releasePage(page: Page) {
    if (idlePages.length < MAX_CONCURRENT) {
        idlePages.push(page);
    } else {
        page.close().catch(() => { });
    }
}

/**
 * Public helper – run any async work that needs a Puppeteer Page.
 * The page is automatically reset (navigated to about:blank) before being returned to the pool.
 */
export async function runWithPage<T>(fn: (page: Page) => Promise<T>): Promise<T> {
    const page = await acquirePage();
    try {
        return await fn(page);
    } finally {
        await page.goto('about:blank');
        releasePage(page);
    }
}
