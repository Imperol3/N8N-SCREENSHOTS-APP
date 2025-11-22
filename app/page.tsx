"use client";
import { useState } from "react";

export default function Home() {
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  async function fetchScreenshot(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setScreenshot(null);
    setResults(null);

    try {
      const res = await fetch("/api/scraper", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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

  return (
    <main className="hero bg-base-200 min-h-screen">
      <div className="hero-content flex-col lg:flex-row-reverse w-full max-w-5xl">
        <div className="text-center lg:text-left lg:w-1/2">
          <h1 className="text-5xl font-bold mb-4">n8n Scraper</h1>
          <p className="py-6">
            Enter your n8n credentials and the workflow URL you want to capture.
          </p>
          {screenshot && (
            <div className="flex flex-col gap-4 items-center lg:items-start">
              <img
                src={screenshot}
                alt="Workflow Screenshot"
                className="rounded-lg shadow-2xl border border-base-300"
              />
              <button className="btn btn-secondary" onClick={downloadScreenshot}>
                Download Screenshot
              </button>
            </div>
          )}
          {result && !screenshot && (
            <div className="mockup-code text-left">
              <pre data-prefix="$">
                <code>{JSON.stringify(result, null, 2)}</code>
              </pre>
            </div>
          )}
        </div>
        <div className="card shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
          <form className="card-body" onSubmit={fetchScreenshot}>
            <div className="form-control">
              <label className="label">
                <span className="label-text">n8n Site URL</span>
              </label>
              <input
                type="url"
                name="siteUrl"
                placeholder="https://n8n.example.com"
                className="input input-bordered"
                required
                value={formData.siteUrl}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              <input
                type="email"
                name="email"
                placeholder="email@example.com"
                className="input input-bordered"
                required
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Password</span>
              </label>
              <input
                type="password"
                name="password"
                placeholder="password"
                className="input input-bordered"
                required
                value={formData.password}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Workflow URL</span>
              </label>
              <input
                type="url"
                name="workflowUrl"
                placeholder="https://n8n.example.com/workflow/..."
                className="input input-bordered"
                required
                value={formData.workflowUrl}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-control">
              <label className="cursor-pointer label">
                <span className="label-text">Show Browser (Debug)</span>
                <input
                  type="checkbox"
                  name="showBrowser"
                  className="checkbox checkbox-primary"
                  checked={formData.showBrowser}
                  onChange={handleInputChange}
                />
              </label>
            </div>
            <div className="form-control mt-6">
              <button
                className={`btn btn-primary ${loading ? "loading" : ""}`}
                type="submit"
                disabled={loading}
              >
                {loading ? "Scraping..." : "Take Screenshot"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
