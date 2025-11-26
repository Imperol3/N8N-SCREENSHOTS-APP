import { db } from '@/lib/db';
import { syncWorkflowsFromN8n } from '@/lib/sync-service';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const refresh = searchParams.get('refresh') === 'true';

        // 1. Try to get from DB first
        const cachedWorkflows = await db.workflow.findMany({
            orderBy: { updatedAt: 'desc' }
        });

        const hasCache = cachedWorkflows.length > 0;

        // Check if cache is stale (older than 5 minutes)
        const oldestSync = cachedWorkflows.reduce((oldest, wf) => {
            return wf.lastSyncedAt < oldest ? wf.lastSyncedAt : oldest;
        }, new Date());

        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        const isStale = oldestSync < fiveMinutesAgo;

        // 2. If we have cache and not forcing refresh, return it immediately
        if (hasCache && !refresh) {
            // Trigger background sync if stale
            if (isStale) {
                console.log('[API] Cache stale, triggering background sync...');
                syncWorkflowsFromN8n().catch(err => console.error('[API] Background sync failed:', err));
            }

            return Response.json(cachedWorkflows.map(wf => ({
                ...wf,
                nodeTypes: JSON.parse(wf.nodeTypes),
                tags: JSON.parse(wf.tags),
            })));
        }

        // 3. If no cache or forced refresh, sync and wait
        console.log('[API] No cache or refresh requested, syncing...');
        const workflows = await syncWorkflowsFromN8n();
        return Response.json(workflows);

    } catch (error: any) {
        console.error('API Error:', error);

        // Fallback: if sync fails but we have cache, return it
        try {
            const fallbackCache = await db.workflow.findMany({ orderBy: { updatedAt: 'desc' } });
            if (fallbackCache.length > 0) {
                console.warn('[API] Sync failed, returning stale cache');
                return Response.json(fallbackCache.map(wf => ({
                    ...wf,
                    nodeTypes: JSON.parse(wf.nodeTypes),
                    tags: JSON.parse(wf.tags),
                })));
            }
        } catch (dbError) {
            console.error('[API] DB Fallback failed:', dbError);
        }

        return Response.json({ error: error.message || 'Failed to fetch workflows' }, { status: 500 });
    }
}
