import puppeteer from "puppeteer";

// Optional: If you'd like to disable webgl, true is the default.

export async function POST(request: Request) {
  try {
    // Parse request body
    const { siteUrl, email, password, workflowUrl, showBrowser } =
      await request.json();

    if (!siteUrl || !email || !password || !workflowUrl) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    // Optional: Load any fonts you need. Open Sans is included by default in AWS Lambda instances

    const browser = await puppeteer.launch({
      args: ["--hide-scrollbars", "--incognito"],

      headless: !showBrowser,
    });
    console.log("enter");
    const page = await browser.newPage();
    await page.setViewport({
      width: 1920,
      height: 1080,
      deviceScaleFactor: 4,
    });
    console.log("going in");
    await page.goto(siteUrl, { waitUntil: "networkidle2" });
    console.log("looking for the elements");
    // Wait for the email input field and type the email
    await page.waitForSelector('input[name="emailOrLdapLoginId"]');
    await page.type('input[name="emailOrLdapLoginId"]', email);
    console.log("email");
    // Wait for the password input field and type the password
    await page.waitForSelector('input[name="password"]');
    await page.type('input[name="password"]', password);
    console.log("password");

    // Click the login button
    try {
      await page.waitForSelector('[data-test-id="form-submit-button"]');
      await page.click('[data-test-id="form-submit-button"]');
    } catch {
      // Fallback to a generic submit button if specific ID is not found
      await page.click('button[type="submit"]');
    }
    console.log("clicked");

    // Wait for navigation or just a delay if showing browser to allow manual intervention
    if (showBrowser) {
      // Give user time to intervene if needed, or wait for network idle
      try {
        await page.waitForNetworkIdle({ timeout: 10000 });
      } catch {
        console.log("Network idle timeout, proceeding anyway");
      }
    } else {
      await page.waitForNavigation({ waitUntil: "networkidle2" });
    }

    await page.goto(workflowUrl, {
      waitUntil: "networkidle2",
    });
    await new Promise((r) => setTimeout(r, 10000));
    console.log("workflow page");
    const pageTitle = await page.content();

    const screenshot = await page.screenshot({ encoding: "base64" });
    await browser.close();

    return Response.json({
      pageTitle,
      screenshot: `data:image/png;base64,${screenshot}`,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in scraper:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
