"use client";
import { useState } from "react";

export default function DocsPage() {
    const [activeSection, setActiveSection] = useState("overview");
    const [apiTab, setApiTab] = useState("curl"); // State for API example tabs

    const sections = [
        { id: "overview", title: "Overview", icon: "📖" },
        { id: "tech-stack", title: "Tech Stack", icon: "⚙️" },
        { id: "setup", title: "Installation & Setup", icon: "🚀" },
        { id: "dependencies", title: "Dependencies", icon: "📦" },
        { id: "screenshot-process", title: "Screenshot Process", icon: "📸" },
        { id: "api", title: "API Reference", icon: "🔌" },
        { id: "best-practices", title: "Best Practices", icon: "✨" },
    ];

    return (
        <div className="min-h-screen bg-base-200 p-4 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col lg:flex-row gap-6">

                    {/* Sidebar Navigation */}
                    <aside className="lg:w-64 flex-shrink-0">
                        <div className="bg-base-100 rounded-box shadow-xl p-4 sticky top-4 h-fit max-h-[90vh] overflow-y-auto">
                            <h2 className="text-lg font-bold mb-4">Documentation</h2>
                            <ul className="menu menu-compact">
                                {sections.map((section) => (
                                    <li key={section.id}>
                                        <a
                                            href={`#${section.id}`}
                                            className={activeSection === section.id ? "active" : ""}
                                            onClick={() => setActiveSection(section.id)}
                                        >
                                            <span className="mr-2">{section.icon}</span>
                                            {section.title}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                            <div className="divider"></div>
                            <a
                                href="/documentation/README.md"
                                target="_blank"
                                className="btn btn-sm btn-outline w-full"
                            >
                                📄 View Raw Markdown
                            </a>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1 bg-base-100 rounded-box shadow-xl p-6 lg:p-10 space-y-16">

                        {/* Overview */}
                        <section id="overview" className="scroll-mt-20">
                            <h1 className="text-4xl font-bold mb-6">📖 n8n Screenshot App</h1>

                            <div className="prose max-w-none">
                                <h3 className="text-2xl font-bold mb-3">What the App Does</h3>
                                <p className="text-lg opacity-80 mb-6">
                                    The n8n Screenshot App is an automated screenshot capture and management system designed specifically for n8n workflow visualizations.
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                                    <div className="alert alert-info shadow-sm">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                        <div>
                                            <h3 className="font-bold">Automated & Manual</h3>
                                            <div className="text-xs">Capture workflows on a schedule or on-demand.</div>
                                        </div>
                                    </div>
                                    <div className="alert alert-success shadow-sm text-white">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        <div>
                                            <h3 className="font-bold">Visual Dashboard</h3>
                                            <div className="text-xs">Browse workflow history and metadata.</div>
                                        </div>
                                    </div>
                                </div>

                                <h3 className="text-2xl font-bold mb-4">Key Features</h3>
                                <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 list-disc list-inside">
                                    <li><strong>Automated Scheduling:</strong> Cron-based capture</li>
                                    <li><strong>Batch Processing:</strong> Capture all workflows at once</li>
                                    <li><strong>Rich Metadata:</strong> Store tags, creation dates, node info</li>
                                    <li><strong>Visual Dashboard:</strong> Modern UI to browse history</li>
                                    <li><strong>Debug Mode:</strong> Optional browser visibility</li>
                                    <li><strong>Webhook Support:</strong> Trigger external actions</li>
                                </ul>
                            </div>
                        </section>

                        <div className="divider"></div>

                        {/* Tech Stack */}
                        <section id="tech-stack" className="scroll-mt-20">
                            <h2 className="text-3xl font-bold mb-6">⚙️ Tech Stack</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="card bg-base-200 shadow-sm">
                                    <div className="card-body">
                                        <h3 className="card-title text-primary">Core Framework</h3>
                                        <ul className="list-disc list-inside text-sm opacity-80">
                                            <li><span className="font-bold">Next.js 15+</span> (App Router)</li>
                                            <li><span className="font-bold">React 18+</span></li>
                                            <li><span className="font-bold">TypeScript</span></li>
                                        </ul>
                                    </div>
                                </div>
                                <div className="card bg-base-200 shadow-sm">
                                    <div className="card-body">
                                        <h3 className="card-title text-primary">Backend & Data</h3>
                                        <ul className="list-disc list-inside text-sm opacity-80">
                                            <li><span className="font-bold">Prisma ORM</span></li>
                                            <li><span className="font-bold">SQLite</span> (Local DB)</li>
                                            <li><span className="font-bold">n8n REST API</span></li>
                                        </ul>
                                    </div>
                                </div>
                                <div className="card bg-base-200 shadow-sm">
                                    <div className="card-body">
                                        <h3 className="card-title text-primary">Automation</h3>
                                        <ul className="list-disc list-inside text-sm opacity-80">
                                            <li><span className="font-bold">Puppeteer</span> (Headless Browser)</li>
                                            <li><span className="font-bold">node-cron</span> (Scheduling)</li>
                                        </ul>
                                    </div>
                                </div>
                                <div className="card bg-base-200 shadow-sm">
                                    <div className="card-body">
                                        <h3 className="card-title text-primary">Deployment</h3>
                                        <ul className="list-disc list-inside text-sm opacity-80">
                                            <li><span className="font-bold">Docker</span> (Containerization)</li>
                                            <li><span className="font-bold">PM2</span> (Process Management)</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <div className="divider"></div>

                        {/* Installation */}
                        <section id="setup" className="scroll-mt-20">
                            <h2 className="text-3xl font-bold mb-6">🚀 Installation & Setup</h2>

                            <h3 className="text-xl font-bold mb-2">1. Clone & Install</h3>
                            <div className="mockup-code mb-6">
                                <pre data-prefix="$"><code>git clone &lt;your-repo-url&gt;</code></pre>
                                <pre data-prefix="$"><code>cd n8n-screenshot-app</code></pre>
                                <pre data-prefix="$"><code>npm install</code></pre>
                            </div>

                            <h3 className="text-xl font-bold mb-2">2. Database Setup</h3>
                            <div className="mockup-code mb-6">
                                <pre data-prefix="$"><code>npx prisma generate</code></pre>
                                <pre data-prefix="$"><code>npx prisma migrate dev</code></pre>
                            </div>

                            <h3 className="text-xl font-bold mb-2">3. Configure Application</h3>
                            <div className="alert alert-warning mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                <span>Navigate to <code>http://localhost:3000/settings</code> after starting the server.</span>
                            </div>
                            <ul className="list-disc list-inside mb-4 space-y-1 ml-4">
                                <li><strong>n8n URL:</strong> e.g., <code>https://n8n.yourdomain.com</code></li>
                                <li><strong>API Key:</strong> From n8n Settings → API</li>
                                <li><strong>Credentials:</strong> n8n Email & Password (for Puppeteer login)</li>
                                <li><strong>Schedule:</strong> Cron expression (e.g., <code>0 * * * *</code>)</li>
                            </ul>
                        </section>

                        <div className="divider"></div>

                        {/* Dependencies */}
                        <section id="dependencies" className="scroll-mt-20">
                            <h2 className="text-3xl font-bold mb-6">📦 Dependencies</h2>
                            <div className="mockup-code text-sm">
                                <pre data-prefix="" className="bg-warning/20 text-warning-content"><code>// Production</code></pre>
                                <pre data-prefix=""><code>"next": "^15.0.0",</code></pre>
                                <pre data-prefix=""><code>"react": "^18.3.0",</code></pre>
                                <pre data-prefix=""><code>"@prisma/client": "^6.0.0",</code></pre>
                                <pre data-prefix=""><code>"puppeteer": "^23.0.0",</code></pre>
                                <pre data-prefix=""><code>"node-cron": "^3.0.0"</code></pre>
                                <pre data-prefix="" className="bg-warning/20 text-warning-content mt-4"><code>// Development</code></pre>
                                <pre data-prefix=""><code>"tailwindcss": "^3.4.0",</code></pre>
                                <pre data-prefix=""><code>"daisyui": "^4.0.0",</code></pre>
                                <pre data-prefix=""><code>"@types/node": "^20"</code></pre>
                            </div>
                        </section>

                        <div className="divider"></div>

                        {/* Screenshot Process */}
                        <section id="screenshot-process" className="scroll-mt-20">
                            <h2 className="text-3xl font-bold mb-6">📸 Screenshot Process</h2>

                            <div className="flex flex-col md:flex-row gap-4 mb-8">
                                <div className="card flex-1 bg-base-200">
                                    <div className="card-body p-4">
                                        <h3 className="font-bold border-b pb-2 border-base-300">1. Authentication</h3>
                                        <p className="text-sm">Puppeteer launches, navigates to n8n, and performs login.</p>
                                    </div>
                                </div>
                                <div className="card flex-1 bg-base-200">
                                    <div className="card-body p-4">
                                        <h3 className="font-bold border-b pb-2 border-base-300">2. Navigation</h3>
                                        <p className="text-sm">Navigates to workflow URL and waits for canvas load (5s buffer).</p>
                                    </div>
                                </div>
                                <div className="card flex-1 bg-base-200">
                                    <div className="card-body p-4">
                                        <h3 className="font-bold border-b pb-2 border-base-300">3. Capture</h3>
                                        <p className="text-sm">1920x1080 Full page screenshot saved as base64 PNG.</p>
                                    </div>
                                </div>
                            </div>

                            <h3 className="text-xl font-bold mb-3">Capture Modes</h3>
                            <div className="join join-vertical w-full">
                                <div className="collapse collapse-arrow join-item border border-base-300">
                                    <input type="radio" name="my-accordion-4" defaultChecked />
                                    <div className="collapse-title text-lg font-medium">Manual Capture</div>
                                    <div className="collapse-content">
                                        <p>Click the camera icon (📸) on any workflow. Uses "Show Browser" toggle for debug.</p>
                                    </div>
                                </div>
                                <div className="collapse collapse-arrow join-item border border-base-300">
                                    <input type="radio" name="my-accordion-4" />
                                    <div className="collapse-title text-lg font-medium">Batch Capture</div>
                                    <div className="collapse-content">
                                        <p>Processes all workflows sequentially with 1-second delay between them.</p>
                                    </div>
                                </div>
                                <div className="collapse collapse-arrow join-item border border-base-300">
                                    <input type="radio" name="my-accordion-4" />
                                    <div className="collapse-title text-lg font-medium">Scheduled Capture</div>
                                    <div className="collapse-content">
                                        <p>Runs automatically based on the configured cron expression.</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <div className="divider"></div>

                        {/* API Reference */}
                        <section id="api" className="scroll-mt-20">
                            <h2 className="text-3xl font-bold mb-6">🔌 API Reference</h2>

                            <p className="mb-4">Use these endpoints to integrate with the screenshot system programmatically.</p>

                            <div className="overflow-x-auto mb-8">
                                <table className="table bg-base-200 rounded-box">
                                    <thead>
                                        <tr>
                                            <th>Method</th>
                                            <th>Endpoint</th>
                                            <th>Description</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td><span className="badge badge-success">GET</span></td>
                                            <td className="font-mono text-sm">/api/n8n/workflows</td>
                                            <td>Get all synced workflows (add <code>?refresh=true</code> to sync)</td>
                                        </tr>
                                        <tr>
                                            <td><span className="badge badge-warning">POST</span></td>
                                            <td className="font-mono text-sm">/api/scraper</td>
                                            <td>Trigger screenshot capture for a workflow</td>
                                        </tr>
                                        <tr>
                                            <td><span className="badge badge-success">GET</span></td>
                                            <td className="font-mono text-sm">/api/screenshots</td>
                                            <td>Get all screenshots</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <h3 className="text-xl font-bold mb-4">Usage Examples</h3>

                            <div className="tabs tabs-boxed mb-2">
                                <a className={`tab ${apiTab === 'curl' ? 'tab-active' : ''}`} onClick={() => setApiTab('curl')}>cURL</a>
                                <a className={`tab ${apiTab === 'js' ? 'tab-active' : ''}`} onClick={() => setApiTab('js')}>JavaScript</a>
                                <a className={`tab ${apiTab === 'ts' ? 'tab-active' : ''}`} onClick={() => setApiTab('ts')}>TypeScript</a>
                                <a className={`tab ${apiTab === 'py' ? 'tab-active' : ''}`} onClick={() => setApiTab('py')}>Python</a>
                            </div>

                            <div className="mockup-code">
                                {apiTab === 'curl' && (
                                    <pre data-prefix="$"><code>{`# Capture Screenshot
curl -X POST http://localhost:3000/api/scraper \\
  -H "Content-Type: application/json" \\
  -d '{
    "siteUrl": "https://n8n.yourdomain.com",
    "email": "your@email.com",
    "password": "yourpassword",
    "workflowId": "abc123"
  }'

# Get Workflows
curl -X GET "http://localhost:3000/api/n8n/workflows?refresh=true"`}</code></pre>
                                )}

                                {apiTab === 'js' && (
                                    <pre><code>{`async function captureScreenshot(workflowId) {
  const response = await fetch('http://localhost:3000/api/scraper', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      siteUrl: 'https://n8n.yourdomain.com',
      email: 'user@email.com',
      password: 'password',
      workflowId: workflowId
    }),
  });
  return await response.json();
}`}</code></pre>
                                )}

                                {apiTab === 'ts' && (
                                    <pre><code>{`interface ScreenshotResponse {
  success: boolean;
  pageTitle: string;
  screenshot: string;
  recordId: string;
}

async function capture(id: string): Promise<ScreenshotResponse> {
  // Implementation...
}`}</code></pre>
                                )}

                                {apiTab === 'py' && (
                                    <pre><code>{`import requests

def capture_screenshot(workflow_id):
    url = "http://localhost:3000/api/scraper"
    payload = {
        "siteUrl": "https://n8n.domain.com",
        "email": "user@email.com",
        "password": "password",
        "workflowId": workflow_id
    }
    response = requests.post(url, json=payload)
    return response.json()`}</code></pre>
                                )}
                            </div>
                        </section>

                        <div className="divider"></div>

                        {/* Best Practices */}
                        <section id="best-practices" className="scroll-mt-20">
                            <h2 className="text-3xl font-bold mb-6">✨ Best Practices</h2>

                            <div className="space-y-4">
                                <div className="collapse collapse-plus bg-base-200">
                                    <input type="radio" name="bp-accordion" defaultChecked />
                                    <div className="collapse-title text-xl font-medium">
                                        ⏰ Optimize Cron Schedule
                                    </div>
                                    <div className="collapse-content">
                                        <p className="mb-2">Choose a schedule that matches your activity:</p>
                                        <ul className="list-disc list-inside text-sm font-mono">
                                            <li>Hourly: 0 * * * * (Active Dev)</li>
                                            <li>Daily: 0 0 * * * (Stable)</li>
                                            <li>Business Hours: 0 9 * * 1-5</li>
                                        </ul>
                                    </div>
                                </div>

                                <div className="collapse collapse-plus bg-base-200">
                                    <input type="radio" name="bp-accordion" />
                                    <div className="collapse-title text-xl font-medium">
                                        🏷️ Use Tags Effectively
                                    </div>
                                    <div className="collapse-content">
                                        <p>Organize workflows with n8n tags (e.g., <code>Production</code>, <code>Staging</code>). The app syncs these automatically for better filtering.</p>
                                    </div>
                                </div>

                                <div className="collapse collapse-plus bg-base-200">
                                    <input type="radio" name="bp-accordion" />
                                    <div className="collapse-title text-xl font-medium">
                                        🔒 Security & Performance
                                    </div>
                                    <div className="collapse-content">
                                        <ul className="list-disc list-inside space-y-1">
                                            <li><strong>Credentials:</strong> Use Env variables or Settings. Never commit them.</li>
                                            <li><strong>Debug Mode:</strong> Only use "Show Browser" for troubleshooting; it is slower.</li>
                                            <li><strong>Database:</strong> Periodically clean up old screenshots to save space.</li>
                                        </ul>
                                    </div>
                                </div>

                                <div className="collapse collapse-plus bg-base-200">
                                    <input type="radio" name="bp-accordion" />
                                    <div className="collapse-title text-xl font-medium">
                                        🔔 Webhook Integration
                                    </div>
                                    <div className="collapse-content">
                                        <p>Configure the Webhook URL in settings to receive payloads when screenshots are captured (useful for Slack/Discord notifications).</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Footer */}
                        <div className="divider mt-16"></div>
                        <div className="text-center opacity-60">
                            <p className="text-sm">Created for the n8n community. <br />View the <a href="/documentation/README.md" target="_blank" className="link link-primary">full README</a> for more.</p>
                        </div>

                    </main>
                </div>
            </div>
        </div>
    );
}