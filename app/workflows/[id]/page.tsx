"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
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
    base64Data: string;
    createdAt: string;
}

export default function WorkflowDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const { showBrowser } = useApp();
    const workflowId = params.id as string;

    const [workflow, setWorkflow] = useState<Workflow | null>(null);
    const [screenshots, setScreenshots] = useState<Screenshot[]>([]);
    const [loading, setLoading] = useState(true);
    const [capturing, setCapturing] = useState(false);
    const [settings, setSettings] = useState<any>(null);

    const fetchData = useCallback(async () => {
        try {
            // Fetch Settings
            const settingsRes = await fetch('/api/settings');
            const settingsData = await settingsRes.json();
            setSettings(settingsData);

            // Fetch Workflows to find current one
            // Fetch Workflows to find current one
            const workflowsRes = await fetch('/api/n8n/workflows');
            let foundWorkflow = null;

            if (workflowsRes.ok) {
                const workflowsData = await workflowsRes.json();
                if (Array.isArray(workflowsData)) {
                    foundWorkflow = workflowsData.find((w: Workflow) => w.id === workflowId);
                }
            }

            setWorkflow(foundWorkflow || null);

            // Fetch Screenshots
            const screenshotsRes = await fetch('/api/screenshots');
            const allScreenshots: Screenshot[] = await screenshotsRes.json();
            const workflowScreenshots = allScreenshots
                .filter(s => s.workflowId === workflowId)
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setScreenshots(workflowScreenshots);

        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setLoading(false);
        }
    }, [workflowId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleCapture = async () => {
        if (!settings?.n8nUrl) return;
        setCapturing(true);
        try {
            await fetch('/api/scraper', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    siteUrl: settings.n8nUrl,
                    email: settings.email,
                    password: settings.password,
                    workflowId: workflowId,
                    showBrowser: showBrowser,
                }),
            });
            // Refresh data
            await new Promise(resolve => setTimeout(resolve, 1000));
            fetchData();
        } catch (error) {
            console.error('Failed to capture screenshot', error);
            alert('Failed to capture screenshot');
        } finally {
            setCapturing(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-base-200 flex items-center justify-center">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        );
    }

    if (!workflow) {
        return (
            <div className="min-h-screen bg-base-200 p-8">
                <div className="alert alert-error">
                    <span>Workflow not found.</span>
                    <Link href="/" className="btn btn-sm">Go Home</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-base-200 p-4 lg:p-8">
            <div className="max-w-7xl mx-auto">

                {/* Breadcrumbs */}
                <div className="flex justify-between items-center mb-4">
                    <div className="text-sm breadcrumbs">
                        <ul>
                            <li><Link href="/">Workflows</Link></li>
                            <li>{workflow.name}</li>
                        </ul>
                    </div>
                    <button onClick={() => router.back()} className="btn btn-sm btn-ghost">
                        ← Back
                    </button>
                </div>

                {/* Header Card */}
                <div className="card bg-base-100 shadow-xl mb-8">
                    <div className="card-body">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <h1 className="text-3xl font-bold flex items-center gap-3">
                                    {workflow.name}
                                    {workflow.active ? (
                                        <span className="badge badge-success">Active</span>
                                    ) : (
                                        <span className="badge badge-ghost">Inactive</span>
                                    )}
                                </h1>
                                <p className="text-sm opacity-50 font-mono mt-1">ID: {workflow.id}</p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleCapture}
                                    className={`btn btn-primary ${capturing ? 'loading' : ''}`}
                                    disabled={capturing}
                                >
                                    {capturing ? 'Capturing...' : '📸 Capture Now'}
                                </button>
                                {settings?.n8nUrl && (
                                    <a
                                        href={`${settings.n8nUrl}/workflow/${workflow.id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-outline"
                                    >
                                        Open in n8n ↗
                                    </a>
                                )}
                            </div>
                        </div>

                        <div className="divider my-4"></div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="stat p-0">
                                <div className="stat-title">Nodes</div>
                                <div className="stat-value text-2xl">{workflow.nodesCount}</div>
                            </div>
                            <div className="stat p-0">
                                <div className="stat-title">Screenshots</div>
                                <div className="stat-value text-2xl">{screenshots.length}</div>
                            </div>
                            <div className="stat p-0">
                                <div className="stat-title">Created</div>
                                <div className="stat-value text-lg font-normal">
                                    {new Date(workflow.createdAt).toLocaleDateString()}
                                </div>
                            </div>
                            <div className="stat p-0">
                                <div className="stat-title">Updated</div>
                                <div className="stat-value text-lg font-normal">
                                    {new Date(workflow.updatedAt).toLocaleDateString()}
                                </div>
                            </div>
                        </div>

                        {/* Tags */}
                        {workflow.tags && workflow.tags.length > 0 && (
                            <div className="mt-4 flex flex-wrap gap-2">
                                {workflow.tags.map(tag => (
                                    <span key={tag.id} className="badge badge-outline">{tag.name}</span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Screenshots Gallery */}
                <h2 className="text-2xl font-bold mb-4">Screenshot History</h2>

                {screenshots.length === 0 ? (
                    <div className="alert alert-info">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        <span>No screenshots captured yet. Click "Capture Now" to take one!</span>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {screenshots.map((screenshot) => (
                            <Link
                                key={screenshot.id}
                                href={`/screenshots/${screenshot.id}`}
                                className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 duration-200"
                            >
                                <figure className="relative h-48 bg-base-300">
                                    <img
                                        src={`data:image/png;base64,${screenshot.base64Data}`}
                                        alt={`Screenshot from ${screenshot.createdAt}`}
                                        className="w-full h-full object-cover object-top"
                                        loading="lazy"
                                    />
                                </figure>
                                <div className="card-body p-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-mono opacity-70">
                                            {new Date(screenshot.createdAt).toLocaleString()}
                                        </span>
                                        <span className="badge badge-sm badge-ghost">View Details</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
