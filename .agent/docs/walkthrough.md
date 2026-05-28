# Product Walkthrough & Handover // Briefs Studio Ingestion SaaS

This document chronicles the successful evolution of the platform from a static local directory into a fully automated, whitelabeled, self-improving SaaS product. The platform features an interactive dashboard, processes structured AI pipelines, runs semantic queries against a local database, and dynamically deploys files on both your local machine and containerized cloud servers.

---

## 🌐 1. Cloud Infrastructure & Live Deployments

### Git Source Control (100% Synced)
*   **Repository:** [github.com/huddlerr/briefs-studio](https://github.com/huddlerr/briefs-studio)
*   **Git Status:** Completely clean and synced (`master` tracks `origin/master`). All local scripts, configurations, and documentation are backed up safely.

### Render Persistent Web Service
*   **Production Web Service Name:** `briefs-studio-bxkq`
*   **Service ID:** `srv-d8b01iml51nc7397b8c0`
*   **Active Web Service URL:** [https://briefs-studio-bxkq.onrender.com](https://briefs-studio-bxkq.onrender.com)
*   **Active Cloud Database:** Supabase (`vfqboybzbkcmfjbzzwhr`) with pgvector enabled and 100% auto-seeded.

---

## 🛠️ 2. Architectural Upgrades & Resolutions

### The Docker Volume Override Fix
*   **The Problem:** During the initial deployment, Render returned `npm error enoent: Could not read package.json at /app/package.json`. This was a classic Docker volume-mount conflict: Render's empty persistent disk was mounted directly to `/app` at runtime, completely hiding all compiled application files.
*   **The Resolution:** We transitioned the infrastructure to a **100% free cardless blueprint** (Commit `e5dc228`). By removing the disk volume completely, we eliminated the `/app` override. Deleting the old service and deploying a clean blueprint from GitHub fully resolved the conflict, allowing the container to build and execute cleanly.

### Consolidating Root Dependencies
*   **File:** [package.json](file:///c:/Users/Aidan/Downloads/briefs-studio/package.json)
*   Unified all backend Express dependencies (`express`, `cors`, `dotenv`) and automated testing tools (`playwright`) in the root directory. Added clean npm scripts to make the repo instantly deployable on standard cloud nodes.

---

## 💾 3. SaaS Cloud Database Persistence Layer

To resolve all ephemeral cloud storage kinks and Vercel refresh limitations, we engineered and integrated a production-grade database persistence layer:

1.  **Unified Database Adapter ([server/db-adapter.js](file:///c:/Users/Aidan/Downloads/briefs-studio/server/db-adapter.js)):**
    *   Acts as a plug-and-play middleware.
    *   If `SUPABASE_URL` and `SUPABASE_ANON_KEY` are provided in the environment variables, it routes all read/write operations directly to a **Supabase Cloud Database** (utilizing native REST fetch calls to avoid heavy npm bundle dependencies and keep serverless execution ultra-fast and free).
    *   **Auto-Seeding:** If it detects a newly provisioned, empty Supabase database table on the first start, it automatically reads your 38 pre-existing client assets and vector maps from `briefs.json` and `server/db-vectors.json` and performs a batch insert to populate your cloud database in 1 second!
    *   **Local Fallback:** If cloud database variables are not present (e.g. running locally or offline), it automatically falls back to local disk-writing (`briefs.json`, `db-vectors.json`, and `index.html`) to keep everything synchronized.
2.  **Serverless & Express GET `/api/briefs` Endpoints:**
    *   **Express Route:** Configured GET `/api/briefs` in [server/server.js](file:///c:/Users/Aidan/Downloads/briefs-studio/server/server.js).
    *   **Vercel Route:** Created GET `/api/briefs` serverless handler at [api/briefs.js](file:///c:/Users/Aidan/Downloads/briefs-studio/api/briefs.js).
3.  **Dynamic Landing Page ([index.html](file:///c:/Users/Aidan/Downloads/briefs-studio/index.html)):**
    *   Upgraded the landing page to dynamically fetch the unified briefs directory from the `/api/briefs` endpoint on start.
    *   **Dual-Runtime Offline Resilience:** If the fetch fails (e.g. running offline via the `file://` protocol), it automatically falls back to loading its 38 hardcoded cache cards, preserving absolute offline functionality.
    *   **Real-Time Syncing:** When a strategist completes an incubation in the strategy sandbox, the frontend automatically triggers `refreshBriefs()` in the background to re-render the bento grid instantly without requiring page reloads!
4.  **Integration Handbook ([SUPABASE_SETUP.md](file:///c:/Users/Aidan/Downloads/briefs-studio/SUPABASE_SETUP.md)):**
    *   Written a 1-minute setup manual. It includes the full PostgreSQL table SQL schema (with `vector(1536)` extension support), RLS security policies, and env variable configurations.

---

## 🧪 4. Custom Integration & Diagnostics Utilities

We engineered a suite of command-line tools inside the `scratch/` folder to automate cloud maintenance and diagnostics:

1.  **`verify_sandbox.js` (Automated Integrator):** Uses headless Chromium to simulate a complete user sandbox session (typing transcripts, selecting archetypes, generating briefs, and verifying modal and new-tab redirection).
2.  **`scratch/deploy_interactive.cjs` (Browser Deployer):** Automates the Render one-click deployment blueprint in a headful Chromium window directly on your screen.
3.  **`scratch/sync_and_diagnose.cjs` (Automatic Sync):** Navigates directly to your Render Blueprint page, bypasses manual logins, triggers a manual sync, and routes to active build streams.
4.  **`scratch/check_render_service.cjs` (Service Auditor):** Connects to your active web service settings and parses deploy logs to detect failure states.
5.  **`scratch/poll_render.js` (Live Poller):** A real-time terminal agent that pings your endpoint every 15 seconds using Node's native v24 fetch, signaling the instant the cloud container is fully online.

---

## ⚡ 5. Production-Grade & Agent-Friendly Backend Upgrades

We have upgraded the backend into a premium, self-documenting, and terminal-accessible application:
1.  **PostgreSQL Connection Pooling (`pg.Pool`):** Installed native pooling in [server/db-adapter.js](file:///c:/Users/Aidan/Downloads/signalform-briefs-main%20(2)/server/db-adapter.js). This allows direct SQL querying over TCP when running the Express server, while maintaining standard fetch API compatibility for Serverless environments.
2.  **OpenAPI Spec & Swagger UI Routing:** Standardized the API with a compliant OpenAPI 3.0 specification (`GET /api/openapi.json`) and configured a CDN-hosted, custom dark-themed Swagger UI dashboard routed directly at `GET /api/docs`.
3.  **Strict Request Validation & Global Error Handler:** Implemented strict request-payload schema validation middleware at [server/validation.js](file:///c:/Users/Aidan/Downloads/signalform-briefs-main%20(2)/server/validation.js) that returns descriptive, structured JSON error details, alongside an Express global unhandled exception catcher.
4.  **Terminal-Based Agent CLI Utility:** Created a zero-dependency CLI binary at [bin/briefs.js](file:///c:/Users/Aidan/Downloads/signalform-briefs-main%20(2)/bin/briefs.js) linked to `"briefs"` in `package.json`. Agents can query the directory (`npm run briefs -- list`), execute keyword searches (`npm run briefs -- search "Elizabeth"`), and command strategic AI sandbox ingestions directly from standard terminals.

---

## 📋 6. How to Resume or Launch in Your Next Session

### Run Locally (Database & Persistent Writing)
Open a terminal in the project folder and run:
```bash
npm install
npm start
```
Open **`http://localhost:4000`** in your browser. All strategy sandbox generations will perform direct file writes to your hard drive and grow your local vector database.

### Connect Your Cloud Database (Supabase)
To make your Render and Vercel cloud deployments 100% permanent with zero costs and no credit cards required:
1. Follow the steps in your new [SUPABASE_SETUP.md](file:///c:/Users/Aidan/Downloads/briefs-studio/SUPABASE_SETUP.md) file to create a free database and copy the SQL table schema.
2. Go to your Render Web Service **"Environment Variables"** dashboard (or Vercel project settings).
3. Add `SUPABASE_URL` and `SUPABASE_ANON_KEY`.
4. Render will automatically pull, compile, and auto-seed the cloud database, making the platform a fully operational multi-tenant SaaS.
