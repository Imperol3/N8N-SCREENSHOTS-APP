"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const scraper_service_1 = require("./lib/scraper-service");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use(express_1.default.json());
// Main Health Check / Landing
app.get('/', (req, res) => {
    res.send(`
        <h1>n8n Screenshot API</h1>
        <p>Status: Active</p>
        <p>POST to /api/scraper to take screenshots.</p>
    `);
});
// The Scraper Endpoint
app.post('/api/scraper', async (req, res) => {
    try {
        const body = req.body;
        const { siteUrl, email, password, workflowUrl, workflowId, showBrowser } = body;
        if (!siteUrl || !email || !password) {
            return res.status(400).json({ error: 'Missing required fields: siteUrl, email, password' });
        }
        const result = await (0, scraper_service_1.runScraper)({
            siteUrl,
            email,
            password,
            workflowUrl,
            workflowId,
            showBrowser
        });
        res.json(result);
    }
    catch (error) {
        console.error('API Error:', error);
        res.status(500).json({
            error: 'Failed to take screenshot',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
