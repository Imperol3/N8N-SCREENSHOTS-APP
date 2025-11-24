"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Workflow {
    id: string;
    name: string;
    active: boolean;
    nodesCount: number;
    tags: { id: string; name: string; createdAt: string; updatedAt: string }[];
    createdAt: string;
    updatedAt: string;
}

type SortField = 'name' | 'createdAt' | 'updatedAt';
type SortOrder = 'asc' | 'desc';

export default function Home() {
    // UI State
    const [searchQuery, setSearchQuery] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [globalShowBrowser, setGlobalShowBrowser] = useState(false);

    // Data State
    const [result, setResults] = useState<object | null>(null);
    const [screenshot, setScreenshot] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        siteUrl: "https://n8n.victorkituku.dev",
        email: "",
        password: "",
        workflowUrl: "",
        showBrowser: false,
    });

    // Workflows list state
    const [workflows, setWorkflows] = useState<Workflow[]>([]);
    const [workflowsLoading, setWorkflowsLoading] = useState(false);
    const [screenshotingAll, setScreenshotingAll] = useState(false);
    const [screenshotProgress, setScreenshotProgress] = useState({ current: 0, total: 0 });
    const [settings, setSettings] = useState<any>(null);
    const [sortField, setSortField] = useState<SortField>('updatedAt');
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

    const router = useRouter();

    // --- Helpers ---

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const formatDate = (dateInput: string | Date | null | undefined) => {
        if (!dateInput) return { date: '-', time: '' };
        try {
            const date = new Date(dateInput);
            if (isNaN(date.getTime())) return { date: '-', time: '' };
            return {
                date: date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
                time: date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
            };
        } catch (e) {
            return { date: '-', time: '' };
        }
    };

    // --- API Calls ---

    const fetchWorkflows = useCallback(async (forceRefresh = false) => {
        setWorkflowsLoading(true);
        try {
            const settingsRes = await fetch('/api/settings');
            const settingsData = await settingsRes.json();
            setSettings(settingsData);

            if (settingsData.n8nApiKey) {
                const url = forceRefresh ? '/api/n8n/workflows?refresh=true' : '/api/n8n/workflows';
                const workflowsRes = await fetch(url);
                if (workflowsRes.ok) {
                    const workflowsData = await workflowsRes.json();
                    setWorkflows(workflowsData);
                }
            }
        } catch (error) {
            console.error('Failed to fetch workflows', error);
        } finally {
            setWorkflowsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchWorkflows();
    }, [fetchWorkflows]);

    async function fetchScreenshot(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setScreenshot(null);
        setResults(null);

        try {
            const res = await fetch("/api/scraper", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (data.screenshot) {
                setScreenshot(data.screenshot);
            }
            setResults(data);
        } catch (error) {
            console.error("Error fetching screenshot:", error);
            setResults({ error: "Failed to fetch screenshot" });
        } finally {
            setLoading(false);
        }
    }

    function downloadScreenshot() {
        if (!screenshot) return;
        const link = document.createElement("a");
        link.href = screenshot;
        link.download = "screenshot.png";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    const handleScreenshotWorkflow = async (workflowId: string) => {
        if (!settings?.n8nUrl) return;
        try {
            await fetch('/api/scraper', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    siteUrl: settings.n8nUrl,
                    email: settings.email,
                    password: settings.password,
                    workflowId: workflowId,
                    showBrowser: globalShowBrowser,
                }),
            });
            await new Promise(resolve => setTimeout(resolve, 500));
            const screenshotsRes = await fetch('/api/screenshots');
            if (screenshotsRes.ok) {
                const screenshots = await screenshotsRes.json();
                const latestScreenshot = screenshots
                    .filter((s: any) => s.workflowId === workflowId)
                    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
                if (latestScreenshot) router.push(`/screenshots/${latestScreenshot.id}`);
            }
        } catch (error) {
            console.error('Failed to screenshot workflow', error);
            alert('Failed to take screenshot');
        }
    };

    const handleScreenshotAll = async () => {
        if (!settings?.n8nUrl || workflows.length === 0) return;
        setScreenshotingAll(true);
        setScreenshotProgress({ current: 0, total: workflows.length });
        for (let i = 0; i < workflows.length; i++) {
            const workflow = workflows[i];
            setScreenshotProgress({ current: i + 1, total: workflows.length });
            try {
                await fetch('/api/scraper', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        siteUrl: settings.n8nUrl,
                        email: settings.email,
                        password: settings.password,
                        workflowId: workflow.id,
                        showBrowser: globalShowBrowser,
                    }),
                });
                await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (error) {
                console.error(`Failed to screenshot workflow ${workflow.name}`, error);
            }
        }
        setScreenshotingAll(false);
        setScreenshotProgress({ current: 0, total: 0 });
        router.push('/screenshots');
    };

    // --- Derived State ---

    const filteredWorkflows = useMemo(() => {
        return workflows.filter(wf =>
            wf.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            wf.id.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [workflows, searchQuery]);

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
        inactive: workflows.filter(w => !w.active).length,
    };

    return (
        <div className="min-h-screen bg-base-200 p-4 lg:p-8" suppressHydrationWarning>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 max-w-7xl mx-auto">
                <div className="stat bg-base-100 shadow rounded-box">
                    <div className="stat-figure text-primary">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                    </div>
                    <div className="stat-title">Total Workflows</div>
                    <div className="stat-value text-primary">{stats.total}</div>
                    <div className="stat-desc">Synced from n8n</div>
                </div>
                <div className="stat bg-base-100 shadow rounded-box">
                    <div className="stat-figure text-success">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </div>
                    <div className="stat-title">Active</div>
                    <div className="stat-value text-success">{stats.active}</div>
                </div>
                <div className="stat bg-base-100 shadow rounded-box">
                    <div className="stat-figure text-secondary">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path></svg>
                    </div>
                    <div className="stat-title">Inactive</div>
                    <div className="stat-value text-secondary">{stats.inactive}</div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto bg-base-100 rounded-box shadow-xl overflow-hidden">

                {/* Toolbar */}
                <div className="p-4 border-b border-base-200 flex flex-col lg:flex-row justify-between items-center gap-4 bg-base-100">
                    <div className="flex items-center gap-4 w-full lg:w-auto">
                        <h2 className="text-2xl font-bold">Workflows</h2>
                        <div className="join">
                            <input
                                type="text"
                                placeholder="Search workflows..."
                                className="input input-bordered input-sm join-item w-full max-w-xs"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-end">
                        {/* Sort Controls */}
                        <select
                            className="select select-bordered select-sm"
                            value={sortField}
                            onChange={(e) => setSortField(e.target.value as SortField)}
                        >
                            <option value="updatedAt">Updated Date</option>
                            <option value="createdAt">Created Date</option>
                            <option value="name">Name</option>
                        </select>
                        <button
                            className="btn btn-sm btn-ghost btn-square"
                            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                            title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                        >
                            {sortOrder === 'asc' ? '↑' : '↓'}
                        </button>

                        <div className="divider divider-horizontal mx-0"></div>

                        <div className="form-control">
                            <label className="label cursor-pointer gap-2">
                                <span className="label-text text-xs">Show Browser</span>
                                <input
                                    type="checkbox"
                                    className="toggle toggle-xs toggle-primary"
                                    checked={globalShowBrowser}
                                    onChange={(e) => setGlobalShowBrowser(e.target.checked)}
                                />
                            </label>
                        </div>

                        <div className="divider divider-horizontal mx-0"></div>

                        <button
                            onClick={() => fetchWorkflows(true)}
                            className={`btn btn-sm btn-ghost ${workflowsLoading ? 'loading' : ''}`}
                            title="Refresh List"
                        >
                            ↻
                        </button>

                        <button
                            onClick={handleScreenshotAll}
                            className={`btn btn-sm btn-primary ${screenshotingAll ? 'loading' : ''}`}
                            disabled={screenshotingAll || workflows.length === 0}
                        >
                            {screenshotingAll ? `Capturing ${screenshotProgress.current}/${screenshotProgress.total}` : 'Capture All'}
                        </button>

                        <button
                            className="btn btn-sm btn-outline"
                            onClick={() => setIsModalOpen(true)}
                        >
                            Manual Capture
                        </button>
                    </div>
                </div>

                {/* Debug View (Collapsible) */}
                <details className="bg-base-200 border-b border-base-300">
                    <summary className="px-4 py-2 text-xs opacity-50 cursor-pointer hover:opacity-100">Debug: View Raw Data</summary>
                    <pre className="p-4 text-xs overflow-auto max-h-40">
                        {workflows.length > 0 ? JSON.stringify(workflows[0], null, 2) : 'No data'}
                    </pre>
                </details>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="table table-zebra w-full">
                        <thead>
                            <tr className="bg-base-200/50">
                                <th>Name</th>
                                <th>Nodes</th>
                                <th>Tags</th>
                                <th>Status</th>
                                <th>Created</th>
                                <th>Updated</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {workflowsLoading && workflows.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-8">
                                        <span className="loading loading-spinner loading-lg"></span>
                                    </td>
                                </tr>
                            ) : sortedWorkflows.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-8 text-opacity-50">
                                        No workflows found matching your criteria.
                                    </td>
                                </tr>
                            ) : (
                                sortedWorkflows.map((wf) => {
                                    const created = formatDate(wf.createdAt);
                                    const updated = formatDate(wf.updatedAt);
                                    return (
                                        <tr key={wf.id} className="hover">
                                            <td>
                                                <div className="font-bold text-base">{wf.name}</div>
                                                <div className="text-xs opacity-50 font-mono">{wf.id}</div>
                                            </td>
                                            <td>
                                                <div className="badge badge-ghost gap-1">
                                                    {wf.nodesCount}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="flex flex-wrap gap-1">
                                                    {wf.tags && wf.tags.length > 0 ? (
                                                        wf.tags.map(tag => (
                                                            <span key={tag.id} className="badge badge-xs badge-outline" title={`ID: ${tag.id}\nCreated: ${tag.createdAt}`}>
                                                                {tag.name}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className="text-xs opacity-30">-</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td>
                                                {wf.active ? (
                                                    <div className="badge badge-success gap-1 text-xs">Active</div>
                                                ) : (
                                                    <div className="badge badge-ghost gap-1 text-xs">Inactive</div>
                                                )}
                                            </td>
                                            <td className="text-sm">
                                                <div className="font-medium">{created.date}</div>
                                                <div className="text-xs opacity-50">{created.time}</div>
                                            </td>
                                            <td className="text-sm">
                                                <div className="font-medium">{updated.date}</div>
                                                <div className="text-xs opacity-50">{updated.time}</div>
                                            </td>
                                            <td className="text-right">
                                                <div className="join">
                                                    <button
                                                        onClick={() => handleScreenshotWorkflow(wf.id)}
                                                        className="btn btn-sm btn-ghost join-item tooltip"
                                                        data-tip="Take Screenshot"
                                                    >
                                                        📸
                                                    </button>
                                                    <Link
                                                        href={`/history/${wf.id}`}
                                                        className="btn btn-sm btn-ghost join-item tooltip"
                                                        data-tip="View History"
                                                    >
                                                        🕒
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Manual Screenshot Modal */}
            {isModalOpen && (
                <dialog className="modal modal-open">
                    <div className="modal-box">
                        <h3 className="font-bold text-lg mb-4">Manual Screenshot</h3>
                        <form onSubmit={fetchScreenshot}>
                            <div className="form-control w-full mb-2">
                                <label className="label"><span className="label-text">n8n Site URL</span></label>
                                <input type="url" name="siteUrl" value={formData.siteUrl} onChange={handleInputChange} className="input input-bordered w-full" required />
                            </div>
                            <div className="form-control w-full mb-2">
                                <label className="label"><span className="label-text">Email</span></label>
                                <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="input input-bordered w-full" required />
                            </div>
                            <div className="form-control w-full mb-2">
                                <label className="label"><span className="label-text">Password</span></label>
                                <input type="password" name="password" value={formData.password} onChange={handleInputChange} className="input input-bordered w-full" required />
                            </div>
                            <div className="form-control w-full mb-4">
                                <label className="label"><span className="label-text">Workflow URL</span></label>
                                <input type="url" name="workflowUrl" value={formData.workflowUrl} onChange={handleInputChange} className="input input-bordered w-full" required />
                            </div>

                            <div className="form-control w-full mb-4">
                                <label className="label cursor-pointer justify-start gap-4">
                                    <span className="label-text">Show Browser (Debug)</span>
                                    <input type="checkbox" name="showBrowser" checked={formData.showBrowser} onChange={handleInputChange} className="checkbox checkbox-primary" />
                                </label>
                            </div>

                            {screenshot && (
                                <div className="mb-4">
                                    <img src={screenshot} alt="Screenshot" className="w-full rounded border" />
                                    <button type="button" className="btn btn-sm btn-secondary mt-2 w-full" onClick={downloadScreenshot}>Download</button>
                                </div>
                            )}

                            {result && !screenshot && (
                                <div className="alert alert-info text-xs mb-4">
                                    <pre>{JSON.stringify(result, null, 2)}</pre>
                                </div>
                            )}

                            <div className="modal-action">
                                <button type="button" className="btn" onClick={() => setIsModalOpen(false)}>Close</button>
                                <button type="submit" className={`btn btn-primary ${loading ? "loading" : ""}`}>
                                    {loading ? "Capturing..." : "Take Screenshot"}
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
