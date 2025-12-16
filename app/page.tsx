export default function Home() {
    return (
        <div className="min-h-screen bg-base-200 p-8 flex flex-col items-center justify-center">
            <div className="max-w-2xl bg-base-100 p-8 rounded-box shadow-xl">
                <h1 className="text-3xl font-bold mb-4">n8n Screenshot Scraper API</h1>
                <p className="mb-4">The persistence layer and UI have been removed. This service now functions solely as a stateless API.</p>

                <h2 className="text-xl font-bold mb-2">Usage</h2>
                <p className="mb-4">Send a POST request to <code className="bg-base-300 p-1 rounded">/api/scraper</code> with the following JSON body:</p>

                <div className="mockup-code">
                    <pre data-prefix="1"><code>{`{`}</code></pre>
                    <pre data-prefix="2"><code>  "siteUrl": "https://n8n.your-domain.com",</code></pre>
                    <pre data-prefix="3"><code>  "email": "user@example.com",</code></pre>
                    <pre data-prefix="4"><code>  "password": "your_password",</code></pre>
                    <pre data-prefix="5"><code>  "workflowUrl": "https://n8n.example.com/workflow/123",</code></pre>
                    <pre data-prefix="6"><code>  "showBrowser": false</code></pre>
                    <pre data-prefix="7"><code>{`}`}</code></pre>
                </div>
            </div>
        </div>
    );
}
