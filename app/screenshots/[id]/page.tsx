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

    useEffect(() => {
        async function fetchScreenshot() {
            try {
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
            <div className="container mx-auto p-8">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        );
    }

    if (!screenshot) {
        return (
            <div className="container mx-auto p-8">
                <div className="alert alert-error">
                    <span>Screenshot not found</span>
                </div>
                <Link href="/screenshots" className="btn btn-primary mt-4">
                    Back to Screenshots
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Screenshot Details</h1>
                <div className="flex gap-2">
                    <button onClick={downloadScreenshot} className="btn btn-primary">
                        Download
                    </button>
                    <Link href="/screenshots" className="btn btn-ghost">
                        Back
                    </Link>
                </div>
            </div>

            <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <span className="font-bold">Workflow ID:</span>
                            <p>{screenshot.workflowId}</p>
                        </div>
                        <div>
                            <span className="font-bold">Captured At:</span>
                            <p>{new Date(screenshot.createdAt).toLocaleString()}</p>
                        </div>
                    </div>

                    <figure className="mt-4">
                        <img
                            src={`data:image/png;base64,${screenshot.base64Data}`}
                            alt={`Screenshot ${screenshot.workflowId}`}
                            className="w-full rounded-lg border"
                        />
                    </figure>
                </div>
            </div>
        </div>
    );
}
