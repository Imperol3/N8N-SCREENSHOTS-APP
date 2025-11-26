"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useApp } from "@/context/AppContext";

interface Workflow {
    id: string;
    name: string;
    active: boolean;
    nodesCount: number;
    tags: { id: string; name: string; createdAt: string; updatedAt: string }[];
    createdAt: string;
    updatedAt: string;
}

interface Screenshot {
    id: string;
    workflowId: string;
    createdAt: string;
}

type SortField = 'name' | 'createdAt' | 'updatedAt';
type SortOrder = 'asc' | 'desc';

export default function Home() {
    // Global State
    const { showBrowser } = useApp();
    const router = useRouter();

    // UI State
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Data State
    const [workflows, setWorkflows] = useState<Workflow[]>([]);
    const [workflowsLoading, setWorkflowsLoading] = useState(false);
    const [screenshotsMap, setScreenshotsMap] = useState<Record<string, Screenshot>>({});
    const [screenshotCounts, setScreenshotCounts] = useState<Record<string, number>>({});
    const [settings, setSettings] = useState<any>(null);
    const [sessionKey, setSessionKey] = useState<string | null>(null);

    // Bulk Actions State
    const [selectedWorkflows, setSelectedWorkflows] = useState<Set<string>>(new Set());
    const [isBulkCapturing, setIsBulkCapturing] = useState(false);
    const [bulkProgress, setBulkProgress] = useState({ current: 0, total: 0 });

    // Sorting
    const [sortField, setSortField] = useState<SortField>('updatedAt');
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

    // Manual Capture Form
    const [manualFormData, setManualFormData] = useState({
        siteUrl: "",
        email: "",
        password: "",
        workflowUrl: "",
    });
    const [manualLoading, setManualLoading] = useState(false);
    const [manualResult, setManualResult] = useState<any>(null);
    const [manualScreenshot, setManualScreenshot] = useState<string | null>(null);

    // --- Data Fetching ---

    // 1. Get Session Key on Mount
    useEffect(() => {
        const initSession = async () => {
            try {
                const res = await fetch('/api/auth/session');
                if (res.ok) {
                    const data = await res.json();
                    setSessionKey(data.apiKey);
                } else {
                    console.error('Failed to init session');
                }
            } catch (e) {
                console.error('Session init error', e);
            }
        };
        initSession();
    }, []);

    const fetchWorkflows = useCallback(async (forceRefresh = false) => {
        if (!sessionKey) return; // Wait for session

        setWorkflowsLoading(true);
        try {
            // Fetch Settings
            const settingsRes = await fetch('/api/settings');
            const settingsData = await settingsRes.json();
            setSettings(settingsData);

            if (settingsData.n8nApiKey) {
                // Fetch Workflows
                const url = forceRefresh ? '/api/n8n/workflows?refresh=true' : '/api/n8n/workflows';
                const workflowsRes = await fetch(url, {
                    headers: { 'x-api-key': sessionKey }
                });

                if (workflowsRes.ok) {
                    const workflowsData = await workflowsRes.json();
                    setWorkflows(workflowsData);
                }
            }

            // Fetch Screenshots for mapping
            const screenshotsRes = await fetch('/api/screenshots', {
                headers: { 'x-api-key': sessionKey }
            });

            if (screenshotsRes.ok) {
                const screenshotsData: Screenshot[] = await screenshotsRes.json();

                // Map latest screenshot per workflow AND count them
                const map: Record<string, Screenshot> = {};
                const counts: Record<string, number> = {};

                screenshotsData.forEach(s => {
                    // Update latest map
                    if (!map[s.workflowId] || new Date(s.createdAt) > new Date(map[s.workflowId].createdAt)) {
                        map[s.workflowId] = s;
                    }
                    // Update counts
                    counts[s.workflowId] = (counts[s.workflowId] || 0) + 1;
                });

                setScreenshotsMap(map);
                setScreenshotCounts(counts);
            }

        } catch (error) {
            console.error('Failed to fetch data', error);
        } finally {
            setWorkflowsLoading(false);
        }
    }, [sessionKey]);

    useEffect(() => {
        if (sessionKey) {
            fetchWorkflows();
        }
    }, [fetchWorkflows, sessionKey]);

    // --- Handlers ---

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedWorkflows(new Set(workflows.map(w => w.id)));
        } else {
            setSelectedWorkflows(new Set());
        }
    };

    const handleSelectWorkflow = (id: string, checked: boolean) => {
        const newSelected = new Set(selectedWorkflows);
        if (checked) {
            newSelected.add(id);
        } else {
            newSelected.delete(id);
        }
        setSelectedWorkflows(newSelected);
    };

    const handleTagToggle = (tagName: string) => {
        const newTags = new Set(selectedTags);
        if (newTags.has(tagName)) {
            newTags.delete(tagName);
        } else {
            newTags.add(tagName);
        }
        setSelectedTags(newTags);
    };

    const handleBulkCapture = async () => {
        if (!settings?.n8nUrl || selectedWorkflows.size === 0 || !sessionKey) return;

        setIsBulkCapturing(true);
        setBulkProgress({ current: 0, total: selectedWorkflows.size });

        const idsToCapture = Array.from(selectedWorkflows);

        for (let i = 0; i < idsToCapture.length; i++) {
            const workflowId = idsToCapture[i];
            setBulkProgress({ current: i + 1, total: idsToCapture.length });

            try {
                const res = await fetch('/api/scraper', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': sessionKey
                    },
                    body: JSON.stringify({
                        siteUrl: settings.n8nUrl,
                        email: settings.email,
                        password: settings.password,
                        workflowId: workflowId,
                        showBrowser: showBrowser, // Use global setting
                    }),
                });

                if (!res.ok) {
                    const errorText = await res.text();
                    let errorJson;
                    try {
                        errorJson = JSON.parse(errorText);
                    } catch {
                        // ignore
                    }
                    console.error(`Failed to capture workflow ${workflowId}:`, errorJson || errorText);
                    continue;
                }
                // Small delay to prevent overwhelming
                await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (error) {
                console.error(`Failed to capture workflow ${workflowId}`, error);
            }
        }

        setIsBulkCapturing(false);
        setBulkProgress({ current: 0, total: 0 });
        setSelectedWorkflows(new Set()); // Clear selection
        fetchWorkflows(); // Refresh to show new screenshots
    };

    const handleManualCapture = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!sessionKey) return;

        setManualLoading(true);
        setManualScreenshot(null);
        setManualResult(null);

        try {
            const res = await fetch("/api/scraper", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": sessionKey
                },
                body: JSON.stringify({
                    ...manualFormData,
                    showBrowser: showBrowser // Use global setting
                }),
            });

            let data;
            const text = await res.text();
            try {
                data = JSON.parse(text);
            } catch (e) {
                console.error("Failed to parse response as JSON:", text);
                setManualResult({ error: "Invalid server response", details: text });
                return;
            }

            if (!res.ok) {
                setManualResult(data);
                return;
            }
            if (data.screenshot) {
                setManualScreenshot(data.screenshot);
            }
            setManualResult(data);
        } catch (error) {
            console.error("Error fetching screenshot:", error);
            setManualResult({ error: "Failed to fetch screenshot" });
        } finally {
            setManualLoading(false);
        }
    };

    const formatDate = (dateInput: string | null) => {
        if (!dateInput) return '-';
        return new Date(dateInput).toLocaleDateString(undefined, {
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    // --- Derived State ---

    const allTags = useMemo(() => {
        const tags = new Set<string>();
        workflows.forEach(wf => {
            wf.tags?.forEach(t => tags.add(t.name));
        });
        return Array.from(tags).sort();
    }, [workflows]);

    const filteredWorkflows = useMemo(() => {
        return workflows.filter(wf => {
            const matchesSearch = wf.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                wf.id.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesTags = selectedTags.size === 0 ||
                (wf.tags && wf.tags.some(t => selectedTags.has(t.name)));

            return matchesSearch && matchesTags;
        });
    }, [workflows, searchQuery, selectedTags]);

    const sortedWorkflows = useMemo(() => {
        return [...filteredWorkflows].sort((a, b) => {
            let comparison = 0;
            if (sortField === 'name') {
                comparison = a.name.localeCompare(b.name);
            } else if (sortField === 'createdAt') {
                comparison = new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
            } else if (sortField === 'updatedAt') {
                comparison = new Date(a.updatedAt || 0).getTime() - new Date(b.updatedAt || 0).getTime();
            }
            return sortOrder === 'asc' ? comparison : -comparison;
        });
    }, [filteredWorkflows, sortField, sortOrder]);

    const stats = {
        total: workflows.length,
        active: workflows.filter(w => w.active).length,
        screenshots: Object.keys(screenshotsMap).length,
    };

    return (
        <div className="min-h-screen bg-base-200 p-4 lg:p-8">

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 max-w-7xl mx-auto">
                <div className="stat bg-base-100 shadow rounded-box border-l-4 border-primary">
                    <div className="stat-figure text-primary">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                    </div>
                    <div className="stat-title">Total Workflows</div>
                    <div className="stat-value">{stats.total}</div>
                    <div className="stat-desc">Synced from n8n</div>
                </div>
                <div className="stat bg-base-100 shadow rounded-box border-l-4 border-success">
                    <div className="stat-figure text-success">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </div>
                    <div className="stat-title">Active Workflows</div>
                    <div className="stat-value">{stats.active}</div>
                    <div className="stat-desc">Running in production</div>
                </div>
                <div className="stat bg-base-100 shadow rounded-box border-l-4 border-secondary">
                    <div className="stat-figure text-secondary">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    </div>
                    <div className="stat-title">Screenshots</div>
                    <div className="stat-value">{stats.screenshots}</div>
                    <div className="stat-desc">Latest captures</div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto bg-base-100 rounded-box shadow-xl overflow-hidden">

                {/* Toolbar */}
                <div className="p-4 border-b border-base-200 flex flex-col lg:flex-row justify-between items-center gap-4 bg-base-100 sticky top-0 z-10 shadow-sm">
                    <div className="flex flex-col gap-2 w-full lg:w-auto flex-1 mr-4">
                        <div className="flex items-center gap-4">
                            <h2 className="text-2xl font-bold">Workflows</h2>
                            <input
                                type="text"
                                placeholder="Search..."
                                className="input input-bordered input-sm w-full max-w-xs"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        {/* Tag Filter */}
                        {allTags.length > 0 && (
                            <div className="collapse collapse-arrow bg-base-200 rounded-box mt-2">
                                <input type="checkbox" />
                                <div className="collapse-title text-sm font-medium py-2 min-h-0">
                                    Filter by Tags ({selectedTags.size > 0 ? `${selectedTags.size} selected` : 'All'})
                                </div>
                                <div className="collapse-content">
                                    <div className="flex flex-wrap gap-1 pt-2 max-h-32 overflow-y-auto">
                                        {allTags.map(tag => (
                                            <button
                                                key={tag}
                                                onClick={() => handleTagToggle(tag)}
                                                className={`badge badge-sm cursor-pointer hover:scale-105 transition-transform ${selectedTags.has(tag) ? 'badge-primary' : 'badge-outline bg-base-100'}`}
                                            >
                                                {tag}
                                            </button>
                                        ))}
                                        {selectedTags.size > 0 && (
                                            <button onClick={() => setSelectedTags(new Set())} className="badge badge-sm badge-error badge-outline cursor-pointer">Clear All</button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        {selectedWorkflows.size > 0 && (
                            <div className="join mr-4">
                                <button
                                    className={`btn btn-sm btn-primary join-item ${isBulkCapturing ? 'loading' : ''}`}
                                    onClick={handleBulkCapture}
                                    disabled={isBulkCapturing}
                                >
                                    {isBulkCapturing ? `Capturing ${bulkProgress.current}/${bulkProgress.total}` : `Capture Selected (${selectedWorkflows.size})`}
                                </button>
                                <button
                                    className="btn btn-sm btn-outline join-item"
                                    onClick={() => setSelectedWorkflows(new Set())}
                                >
                                    Clear
                                </button>
                            </div>
                        )}

                        <button onClick={() => fetchWorkflows(true)} className="btn btn-sm btn-ghost btn-square" title="Refresh">
                            ↻
                        </button>

                        <button onClick={() => {
                            setManualFormData(prev => ({
                                ...prev,
                                siteUrl: settings?.n8nUrl || prev.siteUrl,
                                email: settings?.email || prev.email,
                                // Don't pre-fill password for security, let backend handle it if empty
                            }));
                            setIsModalOpen(true);
                        }} className="btn btn-sm btn-secondary">
                            + Manual Capture
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="table table-zebra w-full">
                        <thead>
                            <tr className="bg-base-200/50">
                                <th className="w-10">
                                    <label>
                                        <input
                                            type="checkbox"
                                            className="checkbox checkbox-sm"
                                            checked={workflows.length > 0 && selectedWorkflows.size === workflows.length}
                                            onChange={handleSelectAll}
                                        />
                                    </label>
                                </th>
                                <th className="cursor-pointer hover:bg-base-200" onClick={() => setSortField('name')}>Name {sortField === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}</th>
                                <th>Nodes / Screenshots</th>
                                <th>Status</th>
                                <th className="cursor-pointer hover:bg-base-200" onClick={() => setSortField('updatedAt')}>Updated {sortField === 'updatedAt' && (sortOrder === 'asc' ? '↑' : '↓')}</th>
                                <th>Last Screenshot</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {workflowsLoading ? (
                                <tr><td colSpan={7} className="text-center py-8"><span className="loading loading-spinner loading-lg"></span></td></tr>
                            ) : sortedWorkflows.length === 0 ? (
                                <tr><td colSpan={7} className="text-center py-8 opacity-50">No workflows found.</td></tr>
                            ) : (
                                sortedWorkflows.map((wf) => {
                                    const lastScreenshot = screenshotsMap[wf.id];
                                    const count = screenshotCounts[wf.id] || 0;
                                    return (
                                        <tr key={wf.id} className="hover group">
                                            <td>
                                                <label>
                                                    <input
                                                        type="checkbox"
                                                        className="checkbox checkbox-sm"
                                                        checked={selectedWorkflows.has(wf.id)}
                                                        onChange={(e) => handleSelectWorkflow(wf.id, e.target.checked)}
                                                    />
                                                </label>
                                            </td>
                                            <td className="cursor-pointer" onClick={() => router.push(`/workflows/${wf.id}`)}>
                                                <div className="font-bold">{wf.name}</div>
                                                <div className="text-xs opacity-50 font-mono">{wf.id}</div>
                                                {wf.tags && wf.tags.length > 0 && (
                                                    <div className="flex gap-1 mt-1">
                                                        {wf.tags.map(t => (
                                                            <span key={t.id} className="badge badge-xs badge-ghost opacity-70">{t.name}</span>
                                                        ))}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="cursor-pointer" onClick={() => router.push(`/workflows/${wf.id}`)}>
                                                <div className="flex items-center gap-2">
                                                    <div className="badge badge-ghost" title="Node Count">{wf.nodesCount} nodes</div>
                                                    <div className={`badge ${count > 0 ? 'badge-secondary' : 'badge-ghost opacity-50'}`} title="Screenshot Count">
                                                        {count} 📸
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="cursor-pointer" onClick={() => router.push(`/workflows/${wf.id}`)}>
                                                {wf.active ? <span className="badge badge-success badge-xs gap-1">Active</span> : <span className="badge badge-ghost badge-xs">Inactive</span>}
                                            </td>
                                            <td className="text-sm cursor-pointer" onClick={() => router.push(`/workflows/${wf.id}`)}>
                                                {formatDate(wf.updatedAt)}
                                            </td>
                                            <td className="text-sm cursor-pointer" onClick={() => router.push(`/workflows/${wf.id}`)}>
                                                {lastScreenshot ? (
                                                    <span className="text-success">{formatDate(lastScreenshot.createdAt)}</span>
                                                ) : (
                                                    <span className="text-warning text-xs">Missing</span>
                                                )}
                                            </td>
                                            <td className="text-right">
                                                <Link href={`/workflows/${wf.id}`} className="btn btn-sm btn-ghost">
                                                    Details
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Manual Capture Modal */}
            {isModalOpen && (
                <dialog className="modal modal-open">
                    <div className="modal-box">
                        <h3 className="font-bold text-lg mb-4">Manual Screenshot</h3>
                        <form onSubmit={handleManualCapture}>
                            <div className="form-control w-full mb-2">
                                <label className="label"><span className="label-text">n8n Site URL</span></label>
                                <input type="url" value={manualFormData.siteUrl} onChange={e => setManualFormData({ ...manualFormData, siteUrl: e.target.value })} className="input input-bordered w-full" placeholder={settings?.n8nUrl} />
                            </div>
                            <div className="form-control w-full mb-2">
                                <label className="label"><span className="label-text">Email (Optional if saved)</span></label>
                                <input type="email" value={manualFormData.email} onChange={e => setManualFormData({ ...manualFormData, email: e.target.value })} className="input input-bordered w-full" placeholder={settings?.email} />
                            </div>
                            <div className="form-control w-full mb-2">
                                <label className="label"><span className="label-text">Password (Optional if saved)</span></label>
                                <input type="password" value={manualFormData.password} onChange={e => setManualFormData({ ...manualFormData, password: e.target.value })} className="input input-bordered w-full" placeholder="••••••••" />
                            </div>
                            <div className="form-control w-full mb-4">
                                <label className="label"><span className="label-text">Workflow URL</span></label>
                                <input type="url" value={manualFormData.workflowUrl} onChange={e => setManualFormData({ ...manualFormData, workflowUrl: e.target.value })} className="input input-bordered w-full" required />
                            </div>

                            {manualScreenshot && (
                                <div className="mb-4">
                                    <img src={manualScreenshot} alt="Screenshot" className="w-full rounded border" />
                                    <a href={manualScreenshot} download="screenshot.png" className="btn btn-sm btn-secondary mt-2 w-full">Download</a>
                                </div>
                            )}

                            {manualResult && !manualScreenshot && (
                                <div className="alert alert-error text-xs mb-4">
                                    <pre>{JSON.stringify(manualResult, null, 2)}</pre>
                                </div>
                            )}

                            <div className="modal-action">
                                <button type="button" className="btn" onClick={() => setIsModalOpen(false)}>Close</button>
                                <button type="submit" className={`btn btn-primary ${manualLoading ? "loading" : ""}`}>
                                    {manualLoading ? "Capturing..." : "Take Screenshot"}
                                </button>
                            </div>
                        </form>
                    </div>
                    <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}></div>
                </dialog>
            )}
        </div>
    );
}
