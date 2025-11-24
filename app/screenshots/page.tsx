"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

interface Screenshot {
    id: string;
    workflowId: string;
    base64Data: string;
    createdAt: string;
}

export default function ScreenshotsPage() {
    const [screenshots, setScreenshots] = useState<Screenshot[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchScreenshots() {
            try {
                const res = await fetch("/api/screenshots");
                const data = await res.json();
                setScreenshots(data);
            } catch (error) {
                console.error("Failed to fetch screenshots", error);
            } finally {
                setLoading(false);
            }
        }
        fetchScreenshots();
    }, []);

    if (loading) {
        return (
            <div className="container mx-auto p-8">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-8">
            <h1 className="text-3xl font-bold mb-6">Screenshots</h1>

            {screenshots.length === 0 ? (
                <div className="alert alert-info">
                    <span>No screenshots yet. Take your first screenshot from the Workflows page!</span>
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
                                    alt={`Screenshot ${screenshot.workflowId}`}
                                    className="w-full h-full object-cover"
                                />
                            </figure>
                            <div className="card-body">
                                <h2 className="card-title text-sm">Workflow: {screenshot.workflowId}</h2>
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
