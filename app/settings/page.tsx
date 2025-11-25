"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
    // ----- Settings form state -----
    const [formData, setFormData] = useState({
        n8nUrl: "",
        n8nApiKey: "",
        email: "",
        password: "",
        webhookUrl: "",
        scheduleCron: "",
        browserlessUrl: "",
        browserlessApiKey: "",
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const router = useRouter();

    // ----- Load existing settings -----
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

    // ----- Submit settings -----
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

    // ----- API Key management -----
    const [keys, setKeys] = useState<any[]>([]);
    const [keysLoading, setKeysLoading] = useState(true);
    const [newKey, setNewKey] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);

    // Load API keys on mount
    useEffect(() => {
        fetch("/api/apikeys")
            .then((res) => res.json())
            .then((data) => {
                if (Array.isArray(data)) setKeys(data);
                setKeysLoading(false);
            })
            .catch(() => setKeysLoading(false));
    }, []);

    async function generateKey() {
        const nameInput = document.getElementById("newKeyName") as HTMLInputElement;
        const name = nameInput?.value?.trim();
        if (!name) return;
        try {
            const res = await fetch("/api/apikeys", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name }),
            });
            const data = await res.json();
            if (data.key) {
                setNewKey(data.key);
                setShowModal(true);
                nameInput.value = "";
                // Refresh list
                const refreshed = await fetch("/api/apikeys").then((r) => r.json());
                setKeys(refreshed);
            }
        } catch (e) {
            alert("Failed to generate key");
        }
    }

    async function revokeKey(id: string) {
        if (!confirm("Are you sure you want to revoke this key? Access will be lost immediately.")) return;
        try {
            await fetch(`/api/apikeys?id=${id}`, { method: "DELETE" });
            setKeys(keys.filter((k) => k.id !== id));
        } catch (e) {
            alert("Failed to revoke key");
        }
    }

    return (
        <div className="container mx-auto p-8">
            <h1 className="text-3xl font-bold mb-6">Settings</h1>

            {/* ----- Settings Form ----- */}
            <form onSubmit={handleSubmit} className="max-w-2xl">
                {/* n8n URL */}
                <div className="form-control w-full mb-4">
                    <label className="label"><span className="label-text">n8n URL</span></label>
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
                {/* n8n API Key */}
                <div className="form-control w-full mb-4">
                    <label className="label"><span className="label-text">n8n API Key</span></label>
                    <input
                        type="text"
                        name="n8nApiKey"
                        value={formData.n8nApiKey}
                        onChange={handleChange}
                        className="input input-bordered w-full"
                        placeholder="n8n_api_..."
                    />
                    <label className="label"><span className="label-text-alt">Generate from n8n Settings → API</span></label>
                </div>
                {/* Email */}
                <div className="form-control w-full mb-4">
                    <label className="label"><span className="label-text">Email</span></label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="input input-bordered w-full"
                        required
                    />
                </div>
                {/* Password */}
                <div className="form-control w-full mb-4">
                    <label className="label"><span className="label-text">Password</span></label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="input input-bordered w-full"
                        required
                    />
                </div>
                {/* Webhook URL */}
                <div className="form-control w-full mb-4">
                    <label className="label"><span className="label-text">Webhook URL (Optional)</span></label>
                    <input
                        type="url"
                        name="webhookUrl"
                        value={formData.webhookUrl}
                        onChange={handleChange}
                        className="input input-bordered w-full"
                        placeholder="https://webhook.site/..."
                    />
                </div>
                {/* Schedule Cron */}
                <div className="form-control w-full mb-4">
                    <label className="label"><span className="label-text">Schedule Cron (Optional)</span></label>
                    <input
                        type="text"
                        name="scheduleCron"
                        value={formData.scheduleCron}
                        onChange={handleChange}
                        className="input input-bordered w-full"
                        placeholder="0 * * * * (every hour)"
                    />
                    <label className="label"><span className="label-text-alt">Use crontab.guru to build cron expressions</span></label>
                </div>
                {/* Browserless */}
                <div className="divider">Browserless (Optional)</div>
                <div className="form-control w-full mb-4">
                    <label className="label"><span className="label-text">Browserless URL</span></label>
                    <input
                        type="url"
                        name="browserlessUrl"
                        value={formData.browserlessUrl || ""}
                        onChange={handleChange}
                        className="input input-bordered w-full"
                        placeholder="wss://chrome.browserless.io"
                    />
                </div>
                <div className="form-control w-full mb-4">
                    <label className="label"><span className="label-text">Browserless API Key</span></label>
                    <input
                        type="password"
                        name="browserlessApiKey"
                        value={formData.browserlessApiKey || ""}
                        onChange={handleChange}
                        className="input input-bordered w-full"
                        placeholder="Your API Key"
                    />
                </div>
                {message && (
                    <div className={`alert ${message.includes("success") ? "alert-success" : "alert-error"} mb-4`}>{message}</div>
                )}
                <button type="submit" className={`btn btn-primary ${loading ? "loading" : ""}`}>Save Settings</button>
            </form>

            {/* ----- API Key Management ----- */}
            <div className="divider my-8" />
            <div className="max-w-4xl">
                <h2 className="text-2xl font-bold mb-4">API Access</h2>
                <p className="mb-4 text-sm opacity-70">
                    Manage API keys for external access. Include the key in the <code>x-api-key</code> header of your requests.
                </p>
                {/* Generate new key */}
                <div className="card bg-base-100 shadow-xl mb-6">
                    <div className="card-body">
                        <h3 className="card-title text-lg">Generate New Key</h3>
                        <div className="flex gap-2 items-end">
                            <div className="form-control w-full max-w-xs">
                                <label className="label"><span className="label-text">Key Name</span></label>
                                <input type="text" placeholder="e.g. CI/CD Pipeline" className="input input-bordered w-full" id="newKeyName" />
                            </div>
                            <button className="btn btn-secondary" onClick={generateKey}>Generate</button>
                        </div>
                    </div>
                </div>
                {/* List of keys */}
                {keysLoading ? (
                    <span className="loading loading-spinner" />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="table table-zebra w-full bg-base-100 rounded-box shadow">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Key Prefix</th>
                                    <th>Created</th>
                                    <th>Last Used</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {keys.length === 0 ? (
                                    <tr><td colSpan={5} className="text-center opacity-50">No API keys found</td></tr>
                                ) : (
                                    keys.map((key) => (
                                        <tr key={key.id}>
                                            <td className="font-bold">{key.name}</td>
                                            <td className="font-mono text-xs">{key.key.substring(0, 8)}...</td>
                                            <td className="text-sm">{new Date(key.createdAt).toLocaleDateString()}</td>
                                            <td className="text-sm">{key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleString() : "Never"}</td>
                                            <td>
                                                <button className="btn btn-xs btn-error btn-outline" onClick={() => revokeKey(key.id)}>
                                                    Revoke
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* ----- Modal for newly generated key ----- */}
            {showModal && newKey && (
                <dialog className="modal" open>
                    <form method="dialog" className="modal-box">
                        <h3 className="font-bold text-lg mb-4">New API Key</h3>
                        <p className="mb-2">This is the only time the key will be shown. Copy it now.</p>
                        <input
                            type="text"
                            readOnly
                            value={newKey}
                            className="input input-bordered w-full mb-4"
                            onFocus={(e) => e.target.select()}
                        />
                        <div className="modal-action">
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={() => {
                                    navigator.clipboard.writeText(newKey);
                                    alert("Key copied to clipboard");
                                }}
                            >
                                Copy
                            </button>
                            <button className="btn" onClick={() => setShowModal(false)}>
                                Close
                            </button>
                        </div>
                    </form>
                </dialog>
            )}
        </div>
    );
}
