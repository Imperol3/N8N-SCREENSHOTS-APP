import puppeteer from 'puppeteer';

async function testPuppeteer() {
    console.log('Starting Puppeteer test...');
    try {
        const browser = await puppeteer.launch({
            args: ['--hide-scrollbars', '--incognito', '--no-sandbox'],
            headless: true,
        });
        console.log('Browser launched successfully');

        const page = await browser.newPage();
        console.log('New page created');

        await page.goto('https://example.com');
        console.log('Navigated to example.com');

        const title = await page.title();
        console.log(`Page title: ${title}`);

        await browser.close();
        console.log('Browser closed');
        console.log('TEST PASSED');
    } catch (error) {
        console.error('TEST FAILED:', error);
    }
}

testPuppeteer();
