---
name: mission-ops
description: Managing the technical infrastructure of the Signalform Briefs platform.
---

# Mission Operations Skill

Use this skill when moving folders, updating the dashboard, or managing URLs.

## 1. The Manifest (`briefs.json`)
Every time a new folder is created in `active/`, `archive/`, `internal/`, or `labs/`:
1. Open `briefs.json`.
2. Add a unique object with `id`, `title`, `client`, `path`, `status`, `category`, and `tags`.
3. Verify JSON validity.

## 2. URL Hygiene (`netlify.toml`)
NEVER move a folder without updating the `netlify.toml` redirects.
- If `/active/josh-bryan` moves to `/archive/josh-bryan`:
- Add a redirect from `/active/josh-bryan/*` to `/archive/josh-bryan/:splat`.
- Add a redirect from `/josh-bryan/*` to `/archive/josh-bryan/:splat`.

## 3. Core Engine Integrity
Avoid adding local CSS/JS to individual briefs. 
- Always reference `../../core/core.css` and `../../core/core.js`.
- If a new feature is needed for multiple briefs (e.g., a new charting library), add it to `/core/` and update the template.

## 4. Organization
- **Active:** Highest priority, live client work.
- **Archive:** Historical artifacts for reference.
- **Labs:** Shared components and experiments.
- **Internal:** Team identities and branding.
