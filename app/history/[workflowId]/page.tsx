"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface Screenshot {
    id: string;
    workflowId: string;
    base64Data: string;
    createdAt: string;
}

export default function WorkflowHistoryPage() {
    const params = useParams();
    const [screenshots, setScreenshots] = useState<Screenshot[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchWorkflowScreenshots() {
            try {
                const res = await fetch("/api/screenshots");
                const allScreenshots = await res.json();
                const workflowScreenshots = allScreenshots.filter(
                    (s: Screenshot) => s.workflowId === params.workflowId
                );
                setScreenshots(workflowScreenshots);
            } catch (error) {
                console.error("Failed to fetch screenshots", error);
            } finally {
                setLoading(false);
            }
        }
        fetchWorkflowScreenshots();
    }, [params.workflowId]);

    if (loading) {
        return (
            <div className="container mx-auto p-8">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Workflow History</h1>
                <Link href="/" className="btn btn-ghost">
                    Back to Workflows
                </Link>
            </div>

            <div className="mb-4">
                <span className="font-bold">Workflow ID:</span> {params.workflowId}
            </div>

            {screenshots.length === 0 ? (
                <div className="alert alert-info">
                    <span>No screenshots for this workflow yet.</span>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {screenshots.map((screenshot) => (
                        <Link
                            key={screenshot.id}
                            href={`/screenshots/${screenshot.id}`}
                            className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow"
                        >
                            <figure className="relative h-48">
                                <img
                                    src={`data:image/png;base64,${screenshot.base64Data}`}
                                    alt={`Screenshot from ${screenshot.createdAt}`}
                                    className="w-full h-full object-cover"
                                />
                            </figure>
                            <div className="card-body">
                                <p className="text-xs opacity-70">
                                    {new Date(screenshot.createdAt).toLocaleString()}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
