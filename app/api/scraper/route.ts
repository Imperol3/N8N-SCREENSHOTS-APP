import { runScraper } from '@/lib/scraper-service';
import { validateApiKey } from '@/lib/auth';

export async function POST(request: Request) {
    // Check for API Key
    const isValid = await validateApiKey(request);
    if (!isValid) {
        return Response.json({ error: 'Unauthorized: Invalid API Key' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { siteUrl, email, password, workflowUrl, workflowId, showBrowser } = body;

        if (!siteUrl || !email || !password) {
            return Response.json(
                { error: 'Missing required fields: siteUrl, email, password' },
                { status: 400 }
            );
        }

        if (!workflowUrl && !workflowId) {
            return Response.json(
                { error: 'Either workflowUrl or workflowId must be provided' },
                { status: 400 }
            );
        }

        const result = await runScraper({
            siteUrl,
            email,
            password,
            workflowUrl,
            workflowId,
            showBrowser,
        });

        return Response.json(result);
    } catch (error: unknown) {
        console.error('Scraper API Error:', error);
        const err = error as Error;
        console.error('Error stack:', err.stack);
        console.error('Error details:', JSON.stringify(error, null, 2));
        return Response.json(
            {
                error: err.message || 'Failed to capture screenshot',
                details: err.stack || String(error)
            },
            { status: 500 }
        );
    }
}
