import { db } from '@/lib/db';
import { fetchWorkflows } from '@/lib/n8n-client';

export async function syncWorkflowsFromN8n() {
    const settings = await db.settings.findFirst();

    if (!settings || !settings.n8nUrl || !settings.n8nApiKey) {
        throw new Error('n8n URL and API Key are required in settings');
    }

    // Fetch from API
    const workflows = await fetchWorkflows(settings.n8nUrl, settings.n8nApiKey);

    if (workflows.length > 0) {
        console.log(`[Sync] Fetched ${workflows.length} workflows from n8n`);
    }

    // Update Cache
    for (const wf of workflows) {
        try {
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
            console.error(`[Sync] Failed to update workflow ${wf.id}:`, e);
        }
    }

    return workflows;
}
