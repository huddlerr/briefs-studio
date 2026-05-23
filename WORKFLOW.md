# Mission Control Workflow

This repository is organized as a **Narrative Engine**. Follow these steps to maintain high hygiene and scalability.

## 1. Directory Structure

*   `/active/` — Current, high-stakes client briefs.
*   `/archive/` — Completed legacy artifacts.
*   `/labs/` — Experimental layouts, design systems, and templates.
*   `/internal/` — Briefs for Briefs Studio internal use or team profiles.
*   `/core/` — **The Engine.** Shared CSS/JS used by all modern briefs.

## 2. Creating a New Brief

1.  **Duplicate the Template:**
    *   Copy the `labs/_template` folder.
    *   Paste it into the appropriate directory (usually `active/`).
    *   Rename the folder (e.g., `active/acme-corp`).

2.  **Register the Asset:**
    *   Open `briefs.json` in the root directory.
    *   Add a new entry with the project metadata.
    *   *This automatically adds it to the Mission Control Dashboard.*

3.  **Update Content:**
    *   Open `active/acme-corp/index.html`.
    *   Fill in the client details and narrative points.

## 3. The "Engine" Advantage

Instead of copying CSS into every folder, modern briefs link to `/core/core.css` and `/core/core.js`.
*   To update the **Global Brand Color**, edit `core/core.css`.
*   To add a **New Interactive Feature**, edit `core/core.js`.
*   Changes propagate to all connected briefs instantly.

## 4. Maintenance & Publishing

1.  **URL Redirection:** If you move a folder (e.g., from `active/` to `archive/`), update `netlify.toml` with a redirect to prevent broken links.
2.  **Dashboard Health:** Ensure `briefs.json` is always valid JSON. The dashboard will show an error if the manifest is broken.
