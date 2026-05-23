---
name: tactical-viz
description: Designing high-end, "Blueprint-style" visual assets and interactive components.
---

# Tactical Visualization Skill

Use this skill when designing the visual layer of a brief or dashboard.

## 1. The Palette (Signalform Core)
- **Primary:** Navy (#0F172A) / Slate-950 (#020617)
- **Signal:** Signal Gold (#F59E0B) / Electric Emerald (#10B981)
- **Base:** Bone White (#F8FAFC)
- **Ghost:** Slate-400 (#94A3B8)

## 2. Visual Elements
- **Schematics:** Use thin lines (0.5px - 1px) and technical callouts. 
- **Grids:** Always place elements on a 20px or 40px grid.
- **Micro-animations:** Use GSAP or CSS transitions for "smooth reveal" on scroll.
- **Glassmorphism:** Use `backdrop-filter: blur(12px)` for all cards.

## 3. Image Generation Prompting
When using `generate_image`, use these specific style keywords:
- "Technical blueprint design"
- "Topographic map schematic"
- "Minimalist vector illustration"
- "Cinematic dark-mode UI"
- "Abstract network nodes"
- **AVOID:** "Cartoonish," "Bright," "Stock Photo," "Illustration."

## 4. Interactive Components
- **Parallax:** Use `mouse-parallax` for background orbs.
- **States:** Hover states should feel "magnetic" or "illuminated."
- **Typography:** Contrast `JetBrains Mono` (technical) with `Newsreader` (human/narrative).
