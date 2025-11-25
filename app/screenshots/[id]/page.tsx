"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface Screenshot {
    id: string;
    workflowId: string;
    base64Data: string;
    createdAt: string;
}

export default function ScreenshotDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [screenshot, setScreenshot] = useState<Screenshot | null>(null);
    const [loading, setLoading] = useState(true);
    const [lightboxOpen, setLightboxOpen] = useState(false);

    useEffect(() => {
        async function fetchScreenshot() {
            try {
                // Note: Ideally we should have an endpoint for a single screenshot
                // But for now we fetch all and find (optimization needed for large datasets)
                const res = await fetch(`/api/screenshots`);
                const screenshots = await res.json();
                const found = screenshots.find((s: Screenshot) => s.id === params.id);
                setScreenshot(found || null);
            } catch (error) {
                console.error("Failed to fetch screenshot", error);
            } finally {
                setLoading(false);
            }
        }
        fetchScreenshot();
    }, [params.id]);

    function downloadScreenshot() {
        if (!screenshot) return;
        const link = document.createElement("a");
        link.href = `data:image/png;base64,${screenshot.base64Data}`;
        link.download = `screenshot-${screenshot.workflowId}-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-base-200 flex items-center justify-center">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        );
    }

    if (!screenshot) {
        return (
            <div className="min-h-screen bg-base-200 p-8">
                <div className="alert alert-error max-w-2xl mx-auto">
                    <span>Screenshot not found</span>
                    <Link href="/screenshots" className="btn btn-sm">Back to Gallery</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-base-200 p-4 lg:p-8">
            <div className="max-w-7xl mx-auto">

                {/* Breadcrumbs */}
                <div className="text-sm breadcrumbs mb-4">
                    <ul>
                        <li><Link href="/">Workflows</Link></li>
                        <li><Link href={`/workflows/${screenshot.workflowId}`}>{screenshot.workflowId}</Link></li>
                        <li>Screenshot Details</li>
                    </ul>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Sidebar / Details */}
                    <div className="w-full lg:w-1/3 space-y-4">
                        <div className="card bg-base-100 shadow-xl">
                            <div className="card-body">
                                <h2 className="card-title">Details</h2>
                                <div className="divider my-2"></div>

                                <div className="space-y-4">
                                    <div>
                                        <div className="text-xs opacity-50 uppercase font-bold">Workflow ID</div>
                                        <div className="font-mono text-sm break-all">{screenshot.workflowId}</div>
                                        <Link href={`/workflows/${screenshot.workflowId}`} className="link link-primary text-xs">
                                            View Workflow History
                                        </Link>
                                    </div>

                                    <div>
                                        <div className="text-xs opacity-50 uppercase font-bold">Captured At</div>
                                        <div>{new Date(screenshot.createdAt).toLocaleString()}</div>
                                    </div>

                                    <div>
                                        <div className="text-xs opacity-50 uppercase font-bold">Image Size</div>
                                        <div>{Math.round(screenshot.base64Data.length * 0.75 / 1024)} KB</div>
                                    </div>
                                </div>

                                <div className="card-actions justify-end mt-6">
                                    <button onClick={downloadScreenshot} className="btn btn-primary w-full">
                                        Download Image
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="card bg-base-100 shadow-xl">
                            <div className="card-body">
                                <h2 className="card-title text-sm">Navigation</h2>
                                <div className="flex flex-col gap-2">
                                    <Link href={`/workflows/${screenshot.workflowId}`} className="btn btn-outline btn-sm justify-start">
                                        ← Back to Workflow
                                    </Link>
                                    <Link href="/screenshots" className="btn btn-ghost btn-sm justify-start">
                                        ← Back to Gallery
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Image */}
                    <div className="w-full lg:w-2/3">
                        <div className="card bg-base-100 shadow-xl overflow-hidden">
                            <figure className="relative bg-base-300 cursor-zoom-in group" onClick={() => setLightboxOpen(true)}>
                                <img
                                    src={`data:image/png;base64,${screenshot.base64Data}`}
                                    alt={`Screenshot ${screenshot.workflowId}`}
                                    className="w-full h-auto object-contain"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                    <span className="opacity-0 group-hover:opacity-100 bg-black/50 text-white px-3 py-1 rounded-full text-sm transition-opacity">
                                        Click to Expand
                                    </span>
                                </div>
                            </figure>
                        </div>
                    </div>
                </div>
            </div>

            {/* Lightbox Modal */}
            {lightboxOpen && (
                <div
                    className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 cursor-zoom-out"
                    onClick={() => setLightboxOpen(false)}
                >
                    <img
                        src={`data:image/png;base64,${screenshot.base64Data}`}
                        alt="Full size"
                        className="max-w-full max-h-full object-contain shadow-2xl"
                    />
                    <button
                        className="absolute top-4 right-4 btn btn-circle btn-ghost text-white"
                        onClick={() => setLightboxOpen(false)}
                    >
                        ✕
                    </button>
                </div>
            )}
        </div>
    );
}
