UI Refinements & Workflow Caching
Goal
Restore the "Screenshot" button to the main list, improve the Workflow Details layout (Latest Screenshot first), and implement database caching for workflows to reduce API calls.

Proposed Changes
1. Database Schema
[MODIFY] 
prisma/schema.prisma
New Model: 
Workflow
id (String, @id, n8n ID)
name (String)
active (Boolean)
nodesCount (Int)
triggersCount (Int)
nodeTypes (String) // JSON string
tags (String) // JSON string
lastSyncedAt (DateTime)
2. Backend Logic
[MODIFY] 
app/api/n8n/workflows/route.ts
GET:
Check lastSyncedAt of workflows.
If > 6 hours or ?refresh=true, fetch from n8n API and upsert to DB.
Else, return from DB.
3. Frontend - Workflows List
[MODIFY] 
app/page.tsx
Restore: "Screenshot" button in the actions column.
New: "Refresh List" button in the header (calls API with ?refresh=true).
4. Frontend - Workflow Details
[MODIFY] 
app/workflows/[workflowId]/page.tsx
Layout:
Latest Screenshot (Large, prominent).
Stats Cards.
History Grid (Items link to /screenshots/[id]).
Auto-Open:
After scraping, automatically redirect to the new screenshot page.
5. Frontend - Screenshot Details
[NEW] app/screenshots/[id]/page.tsx
Content:
Full-size image.
Date Taken.
Workflow Name (Link to /workflows/[workflowId]).
Navigation:
Back to Gallery / Back to Workflow.
6. Frontend - Gallery
[MODIFY] 
app/screenshots/page.tsx
Update "View" button to link to /screenshots/[id] instead of opening a modal.
Verification Plan
Caching: Reload page, verify no API call to n8n (fast load). Click "Refresh", verify API call.
Main Page: Click "Screenshot" button, verify it works.
Details Page: Run scraper, verify the new screenshot appears at the top and opens automatically.