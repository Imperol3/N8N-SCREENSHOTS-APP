import { runScraper } from '@/lib/scraper-service';

export async function POST(request: Request) {
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
    } catch (error: any) {
        console.error('Scraper API Error:', error);
        console.error('Error stack:', error.stack);
        console.error('Error details:', JSON.stringify(error, null, 2));
        return Response.json(
            {
                error: error.message || 'Failed to capture screenshot',
                details: error.stack || String(error)
            },
            { status: 500 }
        );
    }
}
