# 🧬 Briefs Studio // Self-Improving Ingestion Platform

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/huddlerr/briefs-studio)

A premium, self-improving digital strategy map directory and central ingestion platform that translates raw meeting notes and client interviews into high-stakes strategic positioning maps using linguistic Story Forensics, Narrative Architecture, and a vector memory database.


## 🏗️ How It Works

This project is designed for **speed and flexibility**. Instead of a complex build system, it uses a lightweight approach:

*   **Structure:** Each client gets their own folder (e.g., `/tricia-ratliffe/`) containing a self-contained `index.html`.
*   **Styling:** Tailwind CSS is loaded via CDN for instant prototyping and easy AI editing.
*   **Workflow:** We use **Cursor + AI** to generate and tweak these briefs in real-time based on client transcripts.

## 📂 Project Structure

```
.
├── _template/           # The Master Template (V1 - Linear Scroll)
├── susan-2/             # Experimental Template (V2 - Strategic Dossier)
├── faizan-ahmed/        # Client Brief
├── susan-malandrino/    # Client Brief
├── tricia-ratliffe/     # Client Brief
├── index.html           # Main Directory / Landing Page
├── WORKFLOW.md          # ⚡️ Detailed guide on how to generate briefs
└── netlify.toml         # Deployment configuration
```

## 🚀 Creating a New Brief

> **See [WORKFLOW.md](./WORKFLOW.md) for the complete guide and AI prompts.**

**Quick Summary:**
1.  **Duplicate** the `_template` folder and rename it (e.g., `client-name`).
2.  **Open** the new `index.html` in Cursor.
3.  **Prompt** the AI (Cmd+I): *"Update this brief for [Client Name] based on these notes..."*
4.  **Commit & Push** to publish.

## 🎨 Templates

*   **Standard (V1):** Located in `_template/`. A long-form, editorial scroll. Best for narrative storytelling.
*   **Dossier (V2):** Located in `susan-2/`. A split-screen, technical dashboard. Best for "Operator" archetypes.

## 🌐 Deployment

This site is deployed automatically via **Netlify** whenever changes are pushed to the `main` branch.

*   **Repo:** [github.com/mikemarrotte/Briefs Studio-briefs](https://github.com/mikemarrotte/Briefs Studio-briefs)
*   **Configuration:** Settings are handled in `netlify.toml` (Build image: Ubuntu Noble 24.04+).

---
*Last updated: Jan 4, 2026*











