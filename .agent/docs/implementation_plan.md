# Implementation Plan - Production-Grade & Agent-Friendly Backend Upgrades

This plan details the steps required to transform the simple Express/Serverless backend of **Briefs Studio** into a production-grade, enterprise-ready, and exceptionally **agent-friendly** platform. The upgrades focus on high-performance database connectivity, comprehensive API documentation, strict request validation, developer-friendly CLI tooling, and centralized error handling.

---

## User Review Required

> [!IMPORTANT]
> **API Upgrades & Client Compatibility**
> - All new features maintain **100% backward-compatibility** with the current frontend dashboard.
> - The local and serverless endpoints will remain exactly the same (`GET /api/briefs` and `POST /api/incubate`), but will gain strict request-body validation and descriptive JSON error responses.

> [!TIP]
> **Agent Discoverability**
> - The new `GET /api/openapi.json` and interactive Swagger UI dashboard at `/api/docs` will make the entire backend fully discoverable and self-documenting for any future AI agents or developer integrations.

---

## Proposed Changes

### 1. High-Performance Database Pooling

#### [MODIFY] [db-adapter.js](file:///c:/Users/Aidan/Downloads/signalform-briefs-main%20%282%29/server/db-adapter.js)
- Upgrade from simple, stateless `fetch` REST queries to **native PostgreSQL connection pooling** (using the `pg` library) when running under the persistent Express server environment.
- Maintain the lightweight, zero-dependency `fetch` fallback for the Vercel/Netlify Serverless runtimes to keep cold-start times extremely fast.
- Automatically seed database tables, manage connections, and optimize query latency.

---

### 2. Interactive Documentation & Discoverability (OpenAPI / Swagger)

#### [MODIFY] [server.js](file:///c:/Users/Aidan/Downloads/signalform-briefs-main%20%282%29/server/server.js)
- Define a complete, compliant **OpenAPI 3.0 Specification** describing both the briefs directory queries and the AI Sandbox incubator.
- Serve the raw OpenAPI JSON specification at `GET /api/openapi.json`.
- Serve a gorgeous, interactive, zero-dependency **Swagger UI** style dashboard at `GET /api/docs` to allow humans and AI agents to visually explore and test endpoints in real time.

---

### 3. Strict Request Validation & Robust Error Middlewares

#### [NEW] [validation.js](file:///c:/Users/Aidan/Downloads/signalform-briefs-main%20%282%29/server/validation.js)
- Build a lightweight request-body validator to validate incoming POST transcripts and archetype payloads.
- Ensure only properly formatted requests reach the LLM pipeline, preventing waste of API tokens on malformed notes.

#### [MODIFY] [server.js](file:///c:/Users/Aidan/Downloads/signalform-briefs-main%20%282%29/server/server.js)
- Wire up a **centralized global error-handling middleware** to intercept exceptions and return structured, standardized JSON error messages (e.g. `{ error: "Validation Error", details: [...] }`) with appropriate HTTP status codes instead of HTML stack traces.

---

### 4. Interactive Agent Command Line Interface (CLI)

#### [NEW] [briefs.js](file:///c:/Users/Aidan/Downloads/signalform-briefs-main%20%282%29/bin/briefs.js)
- Create a powerful, zero-dependency terminal binary in `bin/` so agents and developers can interact with the server natively from command shells.
- Support core operations:
  *   `npm run briefs -- list` — Pretty-prints the entire strategy directory in the terminal as a structured table.
  *   `npm run briefs -- search "query"` — Executes semantic vector similarity search or keyword filters directly from the terminal.
  *   `npm run briefs -- incubate "notes" "archetype"` — Triggers the AI pipeline and prints the compiled output.

#### [MODIFY] [package.json](file:///c:/Users/Aidan/Downloads/signalform-briefs-main%20%282%29/package.json)
- Wire the binary to an easy-to-use npm script: `"briefs": "node bin/briefs.js"`.

---

## Verification Plan

### Automated Verification
1.  **Swagger Audit:** Use standard browser queries to request `GET /api/openapi.json` and verify the spec is perfectly compliant.
2.  **CLI Tests:** Run terminal scripts (`npm run briefs -- list` and `npm run briefs -- search "Elizabeth"`) to confirm the terminal utility interacts perfectly with the local Express server.
3.  **Validation Check:** Send a malformed POST request to `http://localhost:4000/api/incubate` (e.g. missing `notes`) and verify the server responds with a structured `400 Bad Request` validation error.

### Manual Verification
- Open the interactive API documentation at `http://localhost:4000/api/docs` and execute a manual Strategy Incubation using the browser UI.
