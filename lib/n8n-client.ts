interface N8nWorkflow {
    id: string;
    name: string;
    active: boolean;
    nodes: any[];
    tags: any[];
    createdAt: string;
    updatedAt: string;
}

export interface WorkflowSummary {
    id: string;
    name: string;
    active: boolean;
    nodesCount: number;
    triggersCount: number;
    nodeTypes: string[];
    tags: { id: string; name: string; createdAt: string; updatedAt: string }[];
    nodes: { name: string; type: string }[];
    createdAt: string;
    updatedAt: string;
}

export async function fetchWorkflows(baseUrl: string, apiKey: string): Promise<WorkflowSummary[]> {
    // Ensure baseUrl doesn't have trailing slash
    const cleanUrl = baseUrl.replace(/\/$/, '');

    try {
        let allWorkflows: N8nWorkflow[] = [];
        let cursor: string | undefined = undefined;
        let hasMore = true;

        // Fetch all pages using cursor-based pagination
        while (hasMore) {
            const url: string = cursor
                ? `${cleanUrl}/api/v1/workflows?limit=250&cursor=${cursor}`
                : `${cleanUrl}/api/v1/workflows?limit=250`;

            console.log(`[n8n-client] Fetching workflows from: ${url}`);

            const response: Response = await fetch(url, {
                headers: {
                    'X-N8N-API-KEY': apiKey,
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch workflows: ${response.statusText}`);
            }

            const data: any = await response.json();
            console.log(`[n8n-client] API Response structure:`, {
                hasData: !!data.data,
                dataLength: data.data?.length || 0,
                nextCursor: data.nextCursor,
                totalCount: allWorkflows.length + (data.data?.length || 0),
                responseKeys: Object.keys(data)
            });

            // n8n API returns { data: [...], nextCursor?: string }
            const workflows: N8nWorkflow[] = data.data || data;

            allWorkflows.push(...workflows);

            // Check if there's more data to fetch
            if (data.nextCursor) {
                cursor = data.nextCursor;
                console.log(`[n8n-client] Found nextCursor, continuing to next page...`);
            } else {
                hasMore = false;
                console.log(`[n8n-client] No nextCursor found, stopping pagination`);
            }

            // Safety check: if we got less than limit, probably no more pages
            if (workflows.length < 250) {
                hasMore = false;
                console.log(`[n8n-client] Got ${workflows.length} workflows (less than 250), stopping pagination`);
            }
        }

        console.log(`[n8n-client] Total workflows fetched: ${allWorkflows.length}`);

        return allWorkflows.map(wf => {
            const nodes = wf.nodes || [];
            const triggersCount = nodes.filter((n: any) => n.type.includes('Trigger') || n.type.includes('webhook')).length;
            const nodeTypes = Array.from(new Set(nodes.map((n: any) => n.type)));

            return {
                id: wf.id,
                name: wf.name,
                active: wf.active,
                nodesCount: nodes.length,
                triggersCount,
                nodeTypes,
                tags: wf.tags, // Return full tag objects
                nodes: nodes.map((n: any) => ({ name: n.name, type: n.type })),
                createdAt: wf.createdAt,
                updatedAt: wf.updatedAt,
            };
        });

    } catch (error) {
        console.error('Error fetching n8n workflows:', error);
        throw error;
    }
}
