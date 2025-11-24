import { db } from '@/lib/db';
import { fetchWorkflows } from '@/lib/n8n-client';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const refresh = searchParams.get('refresh') === 'true';

        const settings = await db.settings.findFirst();

        if (!settings || !settings.n8nUrl || !settings.n8nApiKey) {
            return Response.json({ error: 'n8n URL and API Key are required in settings' }, { status: 400 });
        }

        // Check cache first if not forcing refresh
        if (!refresh) {
            // @ts-ignore: Workflow model might not exist in client yet
            if (db.workflow) {
                // @ts-ignore: Workflow model exists
                const cachedWorkflows = await db.workflow.findMany();
                if (cachedWorkflows.length > 0) {
                    // Check if cache is stale (older than 6 hours)
                    const oldestSync = cachedWorkflows.reduce((oldest: any, wf: any) => {
                        return wf.lastSyncedAt < oldest ? wf.lastSyncedAt : oldest;
                    }, new Date());

                    const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);

                    if (oldestSync > sixHoursAgo) {
                        // Return cached data, parsing JSON fields
                        return Response.json(cachedWorkflows.map((wf: any) => ({
                            ...wf,
                            nodeTypes: JSON.parse(wf.nodeTypes),
                            tags: JSON.parse(wf.tags),
                        })));
                    }
                }
            }
        }

        // Fetch from API
        const workflows = await fetchWorkflows(settings.n8nUrl, settings.n8nApiKey as string);

        if (workflows.length > 0) {
            console.log('[DEBUG] First workflow from n8n:', JSON.stringify(workflows[0], null, 2));
        }

        // Update Cache (if model exists)
        // @ts-ignore: Workflow model might not exist in client yet
        if (db.workflow) {
            for (const wf of workflows) {
                try {
                    // @ts-ignore: Workflow model exists
                    await db.workflow.upsert({
                        where: { id: wf.id },
                        update: {
                            name: wf.name,
                            active: wf.active,
                            nodesCount: wf.nodesCount,
                            triggersCount: wf.triggersCount,
                            nodeTypes: JSON.stringify(wf.nodeTypes),
                            tags: JSON.stringify(wf.tags),
                            lastSyncedAt: new Date(),
                            createdAt: wf.createdAt ? new Date(wf.createdAt) : null,
                            updatedAt: wf.updatedAt ? new Date(wf.updatedAt) : null,
                        },
                        create: {
                            id: wf.id,
                            name: wf.name,
                            active: wf.active,
                            nodesCount: wf.nodesCount,
                            triggersCount: wf.triggersCount,
                            nodeTypes: JSON.stringify(wf.nodeTypes),
                            tags: JSON.stringify(wf.tags),
                            lastSyncedAt: new Date(),
                            createdAt: wf.createdAt ? new Date(wf.createdAt) : null,
                            updatedAt: wf.updatedAt ? new Date(wf.updatedAt) : null,
                        },
                    });
                } catch (e) {
                    console.error('Cache update failed:', e);
                }
            }
        } else {
            console.warn('Prisma Client not updated with Workflow model. Caching disabled until restart.');
        }

        return Response.json(workflows);

    } catch (error: any) {
        console.error('API Error:', error);
        return Response.json({ error: error.message || 'Failed to fetch workflows' }, { status: 500 });
    }
}
