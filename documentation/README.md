# n8n Screenshot App - Technical Documentation

## Table of Contents
- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Installation & Setup](#installation--setup)
- [Dependencies](#dependencies)
- [Screenshot Process](#screenshot-process)
- [API Reference](#api-reference)
- [Best Practices](#best-practices)

---

## Overview

### What the App Does

The n8n Screenshot App is an automated screenshot capture and management system designed specifically for n8n workflow visualizations. It provides:

- **Automated Workflow Screenshots**: Capture screenshots of n8n workflows on a scheduled basis
- **Manual Screenshot Capture**: On-demand screenshot functionality for individual workflows
- **Workflow Management**: Sync and display workflow metadata from n8n instances
- **Screenshot History**: Track and view historical screenshots for each workflow
- **API Integration**: RESTful API for programmatic access to screenshots and workflow data

### Key Features

1. **Automated Scheduling**: Use cron expressions to schedule automatic screenshot captures
2. **Batch Processing**: Capture screenshots of all workflows at once
3. **Rich Metadata**: Store workflow tags, creation dates, and node information
4. **Visual Dashboard**: Modern UI to browse workflows and screenshots
5. **Debug Mode**: Optional browser visibility for troubleshooting
6. **Webhook Support**: Trigger external workflows when screenshots are captured

---

## Tech Stack

### Core Framework
- **Next.js 15+** - React framework with App Router
- **React 18+** - UI library
- **TypeScript** - Type-safe development

### Backend & Data
- **Prisma ORM** - Database management and migrations
- **SQLite** - Local database (easily swappable for PostgreSQL/MySQL)
- **n8n REST API** - Workflow data source

### Automation & Scraping
- **Puppeteer** - Headless browser automation for screenshots
- **node-cron** - Scheduled task execution

### UI & Styling
- **Tailwind CSS** - Utility-first CSS framework
- **DaisyUI** - Component library built on Tailwind

### Deployment (Optional)
- **Docker** - Containerization support
- **PM2** - Process management (via ecosystem.config.js)

---

## Installation & Setup

### Prerequisites

- **Node.js** 18+ and npm/yarn
- **n8n Instance** with API access
- **Git** for cloning the repository

### Step 1: Clone and Install

```bash
# Clone the repository
git clone <your-repo-url>
cd n8n-screenshot-app

# Install dependencies
npm install
```

### Step 2: Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev
```

### Step 3: Environment Configuration (Optional)

Create a `.env` file if you need custom database configuration:

```env
DATABASE_URL="file:./prisma/dev.db"
```

### Step 4: Configure Application Settings

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3000/settings`

3. Configure the following:
   - **n8n URL**: Your n8n instance URL (e.g., `https://n8n.yourdomain.com`)
   - **n8n API Key**: Generate from your n8n instance (Settings → API)
   - **Email**: n8n login email
   - **Password**: n8n login password
   - **Webhook URL** (optional): URL to receive screenshot notifications
   - **Schedule Cron**: Cron expression for automatic captures (e.g., `0 * * * *` for hourly)

### Step 5: Verify Setup

1. Go to the home page (`/`)
2. Click the **Refresh** button (↻) to sync workflows from n8n
3. Click the camera icon (📸) on any workflow to test screenshot capture

---

## Dependencies

### Production Dependencies

```json
{
  "next": "^15.0.0",
  "react": "^18.3.0",
  "react-dom": "^18.3.0",
  "@prisma/client": "^6.0.0",
  "puppeteer": "^23.0.0",
  "node-cron": "^3.0.0"
}
```

### Development Dependencies

```json
{
  "typescript": "^5.0.0",
  "prisma": "^6.0.0",
  "@types/node": "^20",
  "@types/react": "^18",
  "@types/react-dom": "^18",
  "@types/node-cron": "^3.0.0",
  "tailwindcss": "^3.4.0",
  "daisyui": "^4.0.0"
}
```

### Key Dependency Details

- **Puppeteer**: Automatically downloads Chromium (~170MB). For Alpine Linux, use `puppeteer-core` with manually installed Chromium.
- **Prisma**: ORM with support for SQLite, PostgreSQL, MySQL, and more.
- **node-cron**: Lightweight cron scheduler that runs in-process.

---

## Screenshot Process

### How It Works

1. **Authentication**:
   - Puppeteer launches a headless (or visible) browser
   - Navigates to your n8n instance
   - Logs in using provided credentials

2. **Navigation**:
   - Navigates to the specific workflow URL
   - Waits for canvas and nodes to fully load (5-second buffer)

3. **Capture**:
   - Takes a full-page screenshot at 1920x1080 resolution
   - Encodes as base64 PNG
   - Saves to database with workflow ID reference

4. **Post-Processing**:
   - Triggers optional webhook with screenshot metadata
   - Screenshot becomes available via `/screenshots` page

### Screenshot Modes

#### Manual Capture
- Click camera icon (📸) on any workflow
- Uses global "Show Browser" toggle for debug mode
- Redirects to screenshot detail page on completion

#### Batch Capture
- Click "Capture All" button
- Processes all workflows sequentially with 1-second delay
- Progress indicator shows current/total
- Redirects to screenshots gallery on completion

#### Scheduled Capture
- Runs automatically based on cron expression
- Executes at server startup if schedule is configured
- Logs execution to console/server logs

---

## API Reference

The app exposes several REST API endpoints for programmatic access.

### Authentication

Currently, the API uses cookie-based authentication from the Next.js session. For programmatic access, you can make requests directly to the local server.

### Endpoints

#### 1. Get All Workflows

**GET** `/api/n8n/workflows`

Retrieves all synced workflows from the database.

**Query Parameters:**
- `refresh=true` (optional) - Force refresh from n8n API

**Response:**
```json
[
  {
    "id": "workflow-id",
    "name": "My Workflow",
    "active": true,
    "nodesCount": 5,
    "tags": [
      {
        "id": "tag-id",
        "name": "Production",
        "createdAt": "2025-11-23T...",
        "updatedAt": "2025-11-23T..."
      }
    ],
    "createdAt": "2025-11-23T...",
    "updatedAt": "2025-11-23T..."
  }
]
```

#### 2. Capture Screenshot

**POST** `/api/scraper`

Triggers a screenshot capture for a specific workflow.

**Request Body:**
```json
{
  "siteUrl": "https://n8n.yourdomain.com",
  "email": "your@email.com",
  "password": "yourpassword",
  "workflowId": "workflow-id",
  "showBrowser": false
}
```

**Response:**
```json
{
  "success": true,
  "pageTitle": "My Workflow - n8n",
  "screenshot": "data:image/png;base64,...",
  "recordId": "screenshot-uuid"
}
```

#### 3. Get All Screenshots

**GET** `/api/screenshots`

Retrieves all captured screenshots.

**Response:**
```json
[
  {
    "id": "screenshot-uuid",
    "workflowId": "workflow-id",
    "base64Data": "base64-encoded-png",
    "createdAt": "2025-11-23T..."
  }
]
```

#### 4. Get Single Screenshot

**GET** `/api/screenshots/[id]`

Retrieves a specific screenshot by ID.

**Response:**
```json
{
  "id": "screenshot-uuid",
  "workflowId": "workflow-id",
  "base64Data": "base64-encoded-png",
  "createdAt": "2025-11-23T..."
}
```

#### 5. Get/Update Settings

**GET** `/api/settings`
**POST** `/api/settings`

Retrieve or update application settings.

**POST Request Body:**
```json
{
  "n8nUrl": "https://n8n.yourdomain.com",
  "n8nApiKey": "your-api-key",
  "email": "your@email.com",
  "password": "yourpassword",
  "webhookUrl": "https://webhook.site/...",
  "scheduleCron": "0 * * * *"
}
```

---

## API Usage Examples

### cURL

#### Refresh Workflows
```bash
curl -X GET "http://localhost:3000/api/n8n/workflows?refresh=true"
```

#### Capture Screenshot
```bash
curl -X POST http://localhost:3000/api/scraper \
  -H "Content-Type: application/json" \
  -d '{
    "siteUrl": "https://n8n.yourdomain.com",
    "email": "your@email.com",
    "password": "yourpassword",
    "workflowId": "abc123",
    "showBrowser": false
  }'
```

#### Get All Screenshots
```bash
curl -X GET http://localhost:3000/api/screenshots
```

### JavaScript (Fetch API)

```javascript
// Refresh workflows from n8n
async function refreshWorkflows() {
  const response = await fetch('http://localhost:3000/api/n8n/workflows?refresh=true');
  const workflows = await response.json();
  console.log(workflows);
}

// Capture a screenshot
async function captureScreenshot(workflowId) {
  const response = await fetch('http://localhost:3000/api/scraper', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      siteUrl: 'https://n8n.yourdomain.com',
      email: 'your@email.com',
      password: 'yourpassword',
      workflowId: workflowId,
      showBrowser: false,
    }),
  });
  
  const result = await response.json();
  console.log('Screenshot captured:', result.recordId);
  return result;
}

// Get all screenshots
async function getScreenshots() {
  const response = await fetch('http://localhost:3000/api/screenshots');
  const screenshots = await response.json();
  return screenshots;
}
```

### TypeScript (with type safety)

```typescript
interface WorkflowResponse {
  id: string;
  name: string;
  active: boolean;
  nodesCount: number;
  tags: Array<{
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface ScreenshotRequest {
  siteUrl: string;
  email: string;
  password: string;
  workflowId: string;
  showBrowser?: boolean;
}

interface ScreenshotResponse {
  success: boolean;
  pageTitle: string;
  screenshot: string;
  recordId: string;
}

async function captureWorkflowScreenshot(
  workflowId: string
): Promise<ScreenshotResponse> {
  const requestBody: ScreenshotRequest = {
    siteUrl: process.env.N8N_URL || '',
    email: process.env.N8N_EMAIL || '',
    password: process.env.N8N_PASSWORD || '',
    workflowId,
    showBrowser: false,
  };

  const response = await fetch('http://localhost:3000/api/scraper', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    throw new Error(`Failed to capture screenshot: ${response.statusText}`);
  }

  return response.json();
}

async function getWorkflows(): Promise<WorkflowResponse[]> {
  const response = await fetch('http://localhost:3000/api/n8n/workflows');
  return response.json();
}
```

### Python (requests library)

```python
import requests
import json

BASE_URL = "http://localhost:3000"

def get_workflows(refresh=False):
    """Fetch all workflows from the API"""
    url = f"{BASE_URL}/api/n8n/workflows"
    params = {"refresh": "true"} if refresh else {}
    
    response = requests.get(url, params=params)
    response.raise_for_status()
    return response.json()

def capture_screenshot(workflow_id, show_browser=False):
    """Capture a screenshot for a specific workflow"""
    url = f"{BASE_URL}/api/scraper"
    
    payload = {
        "siteUrl": "https://n8n.yourdomain.com",
        "email": "your@email.com",
        "password": "yourpassword",
        "workflowId": workflow_id,
        "showBrowser": show_browser
    }
    
    headers = {"Content-Type": "application/json"}
    
    response = requests.post(url, json=payload, headers=headers)
    response.raise_for_status()
    return response.json()

def get_screenshots():
    """Fetch all screenshots"""
    url = f"{BASE_URL}/api/screenshots"
    response = requests.get(url)
    response.raise_for_status()
    return response.json()

def get_screenshot_by_id(screenshot_id):
    """Fetch a specific screenshot by ID"""
    url = f"{BASE_URL}/api/screenshots/{screenshot_id}"
    response = requests.get(url)
    response.raise_for_status()
    return response.json()

# Example usage
if __name__ == "__main__":
    # Get all workflows
    workflows = get_workflows(refresh=True)
    print(f"Found {len(workflows)} workflows")
    
    # Capture screenshot for first workflow
    if workflows:
        result = capture_screenshot(workflows[0]["id"])
        print(f"Screenshot captured: {result['recordId']}")
    
    # Get all screenshots
    screenshots = get_screenshots()
    print(f"Total screenshots: {len(screenshots)}")
```

---

## Best Practices

### Getting the Most Out of the App

#### 1. Optimize Cron Schedule

Choose a cron schedule that matches your needs:

- **Hourly**: `0 * * * *` - Good for active development
- **Daily at midnight**: `0 0 * * *` - Good for stable workflows
- **Every 6 hours**: `0 */6 * * *` - Balanced approach
- **Weekdays at 9 AM**: `0 9 * * 1-5` - Business hours only

**Tip**: Use [crontab.guru](https://crontab.guru) to validate your cron expressions.

#### 2. Use Tags Effectively

Organize your n8n workflows with tags:
- **Environment tags**: `Production`, `Staging`, `Development`
- **Team tags**: `Marketing`, `Sales`, `Engineering`
- **Status tags**: `Active`, `Deprecated`, `Testing`

The app will sync and display these tags automatically.

#### 3. Enable Debug Mode Selectively

Use the "Show Browser" toggle when:
- ✅ Debugging login issues
- ✅ Verifying workflow rendering
- ✅ Troubleshooting screenshot quality
- ❌ **NOT** for production/scheduled captures (slower)

#### 4. Monitor Screenshot History

Regularly check the `/screenshots` page to:
- Compare workflow changes over time
- Validate scheduled captures are working
- Identify workflows that fail to capture

#### 5. Use Webhooks for Integration

Configure a webhook URL to:
- Trigger notifications in Slack/Discord when screenshots are captured
- Update external dashboards
- Archive screenshots to cloud storage
- Send alerts on capture failures

**Example Webhook Payload**:
```json
{
  "workflowId": "abc123",
  "pageTitle": "My Workflow - n8n",
  "screenshotId": "uuid-here",
  "timestamp": "2025-11-23T19:00:00.000Z"
}
```

#### 6. Database Maintenance

Screenshots are stored as base64 in SQLite. To prevent database bloat:

```bash
# Periodically clean up old screenshots
# (Implement your own cleanup logic or script)

# Example: Delete screenshots older than 30 days
# Add this to your codebase or run manually
```

#### 7. Performance Optimization

For large n8n instances:

- **Refresh strategically**: Use manual refresh instead of automatic on every page load
- **Batch captures wisely**: Consider capturing only changed workflows
- **Monitor memory**: Puppeteer can use significant RAM; ensure adequate resources

#### 8. Deployment Recommendations

**Development**:
```bash
npm run dev
```

**Production** (with PM2):

1. Install PM2 globally:
   ```bash
   npm install -g pm2
   ```

2. Build the application:
   ```bash
   npm run build
   ```

3. Start the application:
   ```bash
   pm2 start ecosystem.config.js
   ```

4. Save the process list (so it restarts on reboot):
   ```bash
   pm2 save
   ```

5. Generate startup script (optional, for auto-start on boot):
   ```bash
   pm2 startup
   # Run the command output by this step
   ```

**Docker**:
```bash
docker-compose up -d
```

#### 9. Security Best Practices

- 🔒 **Never commit credentials** - Use environment variables or the settings page
- 🔒 **Restrict API access** - Deploy behind a firewall or VPN for sensitive instances
- 🔒 **Use HTTPS** - Especially when accessing remote n8n instances
- 🔒 **Rotate API keys** - Regularly update your n8n API key
- 🔒 **Secure the database** - Ensure `prisma/dev.db` is not publicly accessible

#### 10. Troubleshooting Checklist

**Workflows not syncing?**
- ✅ Verify n8n URL and API key in Settings
- ✅ Check n8n instance is accessible
- ✅ Look for errors in browser console

**Screenshots failing?**
- ✅ Verify email/password credentials
- ✅ Enable "Show Browser" to see what's happening
- ✅ Check server logs for Puppeteer errors
- ✅ Ensure sufficient disk space and memory

**Cron not running?**
- ✅ Verify `next.config.ts` has instrumentation enabled
- ✅ Check server logs for "Scheduling scraper" message
- ✅ Validate cron expression syntax
- ✅ Restart the server after changing settings

---

## Support & Contributing

For issues, feature requests, or contributions, please refer to the project repository.

**Happy Screenshotting! 📸**
