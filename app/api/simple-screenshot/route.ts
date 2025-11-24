// app/api/simple-screenshot/route.ts
import { db } from '@/lib/db';

/**
 * Simple screenshot endpoint that forwards a request to Browserless's REST /screenshot API.
 * This is intended for static pages that do not require login or interaction.
 *
 * Expected POST body:
 * {
 *   "url": "https://example.com",
 *   "options": { "fullPage": true, "type": "png" } // optional puppeteer screenshot options
 * }
 */
export async function POST(request: Request) {
    try {
        const { url, options } = await request.json();
        if (!url) {
            return Response.json({ error: 'Missing required field: url' }, { status: 400 });
        }

        const settings = await db.settings.findFirst();
        if (!settings?.browserlessUrl || !settings?.browserlessApiKey) {
            return Response.json({ error: 'Browserless configuration missing' }, { status: 500 });
        }

        const endpoint = `${settings.browserlessUrl}/screenshot?token=${settings.browserlessApiKey}`;
        const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url, options: options ?? { fullPage: true, type: 'png' } }),
        });

        if (!res.ok) {
            const errText = await res.text();
            return Response.json({ error: 'Browserless request failed', details: errText }, { status: 502 });
        }

        const data = await res.json();
        // Browserless returns { data: '<base64>' }
        const screenshotBase64 = data.data || data.screenshot || data;
        return Response.json({ success: true, screenshot: `data:image/png;base64,${screenshotBase64}` });
    } catch (error: any) {
        console.error('Simple screenshot error:', error);
        return Response.json({ error: error.message || 'Unexpected error' }, { status: 500 });
    }
}
