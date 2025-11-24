"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
    const [formData, setFormData] = useState({
        n8nUrl: "",
        n8nApiKey: "",
        browserlessUrl: "",
        browserlessApiKey: "",
        email: "",
        password: "",
        webhookUrl: "",
        scheduleCron: "",
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const router = useRouter();

    useEffect(() => {
        async function loadSettings() {
            try {
                const res = await fetch("/api/settings");
                const data = await res.json();
                setFormData(data);
            } catch (error) {
                console.error("Failed to load settings", error);
            }
        }
        loadSettings();
    }, []);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        try {
            const res = await fetch("/api/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                setMessage("Settings saved successfully!");
                setTimeout(() => router.push("/"), 1500);
            } else {
                setMessage("Failed to save settings");
            }
        } catch (error) {
            console.error("Error saving settings:", error);
            setMessage("Error saving settings");
        } finally {
            setLoading(false);
        }
    }

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    }

    return (
        <div className="container mx-auto p-8">
            <h1 className="text-3xl font-bold mb-6">Settings</h1>

            <form onSubmit={handleSubmit} className="max-w-2xl">
                <div className="form-control w-full mb-4">
                    <label className="label">
                        <span className="label-text">n8n URL</span>
                    </label>
                    <input
                        type="url"
                        name="n8nUrl"
                        value={formData.n8nUrl}
                        onChange={handleChange}
                        className="input input-bordered w-full"
                        placeholder="https://n8n.yourdomain.com"
                        required
                    />
                </div>

                <div className="form-control w-full mb-4">
                    <label className="label">
                        <span className="label-text">n8n API Key</span>
                    </label>
                    <input
                        type="text"
                        name="n8nApiKey"
                        value={formData.n8nApiKey}
                        onChange={handleChange}
                        className="input input-bordered w-full"
                        placeholder="n8n_api_..."
                    />
                    <div className="form-control w-full mb-4">
                        <label className="label">
                            <span className="label-text">Browserless URL</span>
                        </label>
                        <input
                            type="url"
                            name="browserlessUrl"
                            value={formData.browserlessUrl}
                            onChange={handleChange}
                            className="input input-bordered w-full"
                            placeholder="wss://chrome.browserless.io"
                            required
                        />
                    </div>
                    <div className="form-control w-full mb-4">
                        <label className="label">
                            <span className="label-text">Browserless API Key</span>
                        </label>
                        <input
                            type="text"
                            name="browserlessApiKey"
                            value={formData.browserlessApiKey}
                            onChange={handleChange}
                            className="input input-bordered w-full"
                            placeholder="your_api_key"
                        />
                    </div>
                    <label className="label">
                        <span className="label-text-alt">Generate from n8n Settings → API</span>
                    </label>
                </div>

                <div className="form-control w-full mb-4">
                    <label className="label">
                        <span className="label-text">Email</span>
                    </label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="input input-bordered w-full"
                        required
                    />
                </div>

                <div className="form-control w-full mb-4">
                    <label className="label">
                        <span className="label-text">Password</span>
                    </label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="input input-bordered w-full"
                        required
                    />
                </div>

                <div className="form-control w-full mb-4">
                    <label className="label">
                        <span className="label-text">Webhook URL (Optional)</span>
                    </label>
                    <input
                        type="url"
                        name="webhookUrl"
                        value={formData.webhookUrl}
                        onChange={handleChange}
                        className="input input-bordered w-full"
                        placeholder="https://webhook.site/..."
                    />
                </div>

                <div className="form-control w-full mb-4">
                    <label className="label">
                        <span className="label-text">Schedule Cron (Optional)</span>
                    </label>
                    <input
                        type="text"
                        name="scheduleCron"
                        value={formData.scheduleCron}
                        onChange={handleChange}
                        className="input input-bordered w-full"
                        placeholder="0 * * * * (every hour)"
                    />
                    <label className="label">
                        <span className="label-text-alt">Use crontab.guru to build cron expressions</span>
                    </label>
                </div>

                {message && (
                    <div className={`alert ${message.includes("success") ? "alert-success" : "alert-error"} mb-4`}>
                        {message}
                    </div>
                )}

                <button type="submit" className={`btn btn-primary ${loading ? "loading" : ""}`}>
                    Save Settings
                </button>
            </form>
        </div>
    );
}
