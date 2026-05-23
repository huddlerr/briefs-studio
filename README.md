# Briefs Studio Narrative Strategy Maps

A collection of bespoke digital briefs ("Narrative Strategy Maps") created for Briefs Studio clients. These briefs serve as a strategic "North Star," operationalizing the insights gathered during foundation sessions.

**Live Directory:** [https://briefs.Briefs Studiostudio.com](https://briefs.Briefs Studiostudio.com) (or your Netlify URL)

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











