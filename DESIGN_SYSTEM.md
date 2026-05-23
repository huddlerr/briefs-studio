# Patch Briefs Design System
## A Living Reference for Award-Winning Brief Design

*Last updated: January 30, 2026*

---

## Table of Contents

1. [Design Philosophy](#design-philosophy)
2. [Typography](#typography)
3. [Color Systems](#color-systems)
4. [Layout Patterns](#layout-patterns)
5. [Animation & Motion](#animation--motion)
6. [Micro-interactions](#micro-interactions)
7. [Visual Effects](#visual-effects)
8. [Hero Sections](#hero-sections)
9. [Accessibility](#accessibility)
10. [Performance](#performance)
11. [Code Snippets](#code-snippets)
12. [Resources & Inspiration](#resources--inspiration)

---

## Design Philosophy

### Core Principles

**1. Emergent Design**
Each brief should feel like it emerged from the conversation itself. The visual language should reflect the person's essence, their field, and the themes discussed.

**2. Serious Play**
Award-winning design balances professionalism with experimentation. Don't be afraid to break conventions purposefully.

**3. Typography as Hero**
In 2026, the best sites let typography carry the design. Words aren't just content—they're visual architecture.

**4. Motion as Identity**
Animation isn't decoration; it's a defining part of brand identity. Every movement should feel intentional and characteristic.

**5. Less, But Better**
Minimal interfaces load 35% faster and increase user retention by 22% (Google UX Research 2025). Reduce mental overload.

---

## Typography

### Font Pairing Strategy

**The Three-Font System:**
```
1. Display/Headlines: Expressive serif (Fraunces, Newsreader, Playfair)
2. Body: Clean sans-serif (Inter, Satoshi, General Sans)
3. Accent/Code: Monospace (JetBrains Mono, IBM Plex Mono)
```

### Variable Fonts (Essential for 2026)

Variable fonts are now the standard—they enable infinite weight/width variations from a single file.

**Recommended Variable Fonts:**
- GT Ultra (Grilli Type)
- Fragment (Pangram Pangram)
- Fraunces (Google Fonts - free)
- Inter (Google Fonts - free)

**Benefits:**
- Single file = multiple weights = faster loading
- Fluid responsive typography
- Smooth weight transitions on hover/scroll
- Better accessibility (adjustable for visual impairments)

### Fluid Typography

Scale typography fluidly between viewport sizes:

```css
/* Fluid type scale */
.hero-title {
  font-size: clamp(2.5rem, 8vw, 6rem);
  line-height: 1.05;
  letter-spacing: -0.03em;
}

.section-title {
  font-size: clamp(1.8rem, 5vw, 3.5rem);
  line-height: 1.2;
}

.body-text {
  font-size: clamp(1rem, 1.5vw, 1.125rem);
  line-height: 1.7;
}
```

### Typography Trends 2026

1. **Kinetic Typography** - Text that moves, morphs, or responds to scroll
2. **Anti-Design/Imperfection** - Deliberate friction signals authenticity
3. **Extreme Weight Contrast** - Ultralight (200) headlines with medium (500) body
4. **Oversized Display Type** - 6-8rem+ headlines that dominate the viewport

---

## Color Systems

### Dark Mode Foundation

**91% of users prefer dark mode** (Android Authority 2025). Design dark-first.

**Base Palette Structure:**
```css
:root {
  /* Backgrounds - Never pure black */
  --void: #050507;        /* Deepest - use sparingly */
  --midnight: #0a0a0f;    /* Primary background */
  --deep: #101018;        /* Elevated surfaces */
  --surface: #18181f;     /* Cards, containers */
  --elevated: #222230;    /* Hover states, highlights */

  /* Borders & Muted */
  --border: #2a2a3a;
  --muted: #6a6a8a;

  /* Text Hierarchy */
  --text: #c8c8d8;        /* Body text */
  --bright: #f0f0f8;      /* Emphasized text */
  --white: #ffffff;       /* Headlines only */
}
```

### Accent Colors

**Rule: Desaturate by 20-30% for dark backgrounds**

Saturated colors "vibrate" against dark surfaces. Use pastels/muted tones.

```css
:root {
  /* Warm Accents */
  --coral: #ff6b6b;
  --coral-dim: rgba(255, 107, 107, 0.15);
  --peach: #ffa07a;
  --gold: #ffd700;
  --amber: #f59e0b;

  /* Cool Accents */
  --sage: #10b981;
  --sky: #38bdf8;
  --lavender: #a78bfa;

  /* Gradients */
  --gradient-warm: linear-gradient(135deg, #ff6b6b 0%, #ffa07a 50%, #ffd700 100%);
  --gradient-sunset: linear-gradient(135deg, #ff6b6b 0%, #a78bfa 100%);
  --gradient-ocean: linear-gradient(135deg, #38bdf8 0%, #a78bfa 50%, #fb7185 100%);
}
```

### Depth Through Lightness

In dark mode, elevation = lightness (not shadows).

```css
/* Higher elevation = lighter surface */
.card { background: var(--surface); }           /* Base */
.card:hover { background: var(--elevated); }    /* Raised */
.modal { background: var(--deep); }             /* Overlay */
```

### Contrast Requirements (WCAG)

- **Regular text**: Minimum 4.5:1 contrast ratio
- **Large text (18px+)**: Minimum 3:1 contrast ratio
- **UI components**: Minimum 3:1 against adjacent colors

**Tool**: [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

---

## Layout Patterns

### Bento Grid (Dominant 2026 Trend)

Modular, asymmetric card layouts inspired by Japanese lunch boxes.

**Key Principles:**
- Important content gets bigger cards
- Consistent spacing (16px or 24px gaps)
- Mixed content types coexist naturally
- Responsive by nature

```css
.bento-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-auto-rows: minmax(200px, auto);
  gap: 1.5rem;
}

.bento-item.featured {
  grid-column: span 2;
  grid-row: span 2;
}

@media (max-width: 968px) {
  .bento-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
```

### Interactive Bento (2026 Evolution)

Cards aren't static anymore:
- Hover expands tiles
- Video plays on interaction
- Secondary layers reveal on click
- Micro-animations throughout

### Broken/Anti-Grid Layouts

For expressive, editorial designs:
- Intentional asymmetry
- Overlapping elements
- Strategic whitespace
- Floating/scattered positioning

```css
.broken-grid-item {
  position: relative;
  /* Intentional offset */
  transform: translateX(-20px) rotate(-2deg);
}

.broken-grid-item:nth-child(even) {
  transform: translateX(30px) rotate(1deg);
}
```

### Split-Screen Hero

Two-column layouts for hero sections:

```css
.hero {
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 100vh;
}

.hero-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 4rem;
}

.hero-visual {
  position: relative;
  overflow: hidden;
}

@media (max-width: 968px) {
  .hero {
    grid-template-columns: 1fr;
  }
}
```

---

## Animation & Motion

### GSAP ScrollTrigger (Industry Standard)

Free since Webflow's 2024 acquisition. Essential for scroll-driven animations.

**Basic Setup:**
```javascript
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Fade in on scroll
gsap.from(".reveal", {
  opacity: 0,
  y: 50,
  duration: 1,
  stagger: 0.2,
  scrollTrigger: {
    trigger: ".reveal",
    start: "top 80%",
    end: "bottom 20%",
    toggleActions: "play none none reverse"
  }
});
```

**Scrubbing (Animation linked to scroll position):**
```javascript
gsap.to(".parallax-element", {
  y: -200,
  scrollTrigger: {
    trigger: ".parallax-section",
    start: "top bottom",
    end: "bottom top",
    scrub: 1  // 1 second catch-up delay
  }
});
```

**Pinning:**
```javascript
ScrollTrigger.create({
  trigger: ".pinned-section",
  start: "top top",
  end: "+=1000",
  pin: true,
  scrub: true
});
```

### CSS-Only Scroll Animations

For simpler effects without JavaScript:

```css
.reveal {
  opacity: 0;
  transform: translateY(40px);
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.reveal.visible {
  opacity: 1;
  transform: translateY(0);
}
```

```javascript
// Intersection Observer
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
```

### Motion Timing Guidelines

| Animation Type | Duration | Easing |
|---------------|----------|--------|
| Micro-interaction | 150-300ms | ease-out |
| UI feedback | 200-400ms | ease-in-out |
| Page transitions | 400-600ms | cubic-bezier(0.4, 0, 0.2, 1) |
| Scroll animations | 600-1000ms | cubic-bezier(0.4, 0, 0.2, 1) |

### Easing Functions

```css
/* Standard easings */
--ease-out: cubic-bezier(0.0, 0.0, 0.2, 1);
--ease-in: cubic-bezier(0.4, 0.0, 1, 1);
--ease-in-out: cubic-bezier(0.4, 0.0, 0.2, 1);

/* Expressive easings */
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
--ease-smooth: cubic-bezier(0.25, 0.1, 0.25, 1);
```

---

## Micro-interactions

### Best Practices

1. **Keep them short** - Under 500ms, ideally 200-400ms
2. **Purposeful** - Every animation should communicate something
3. **Consistent** - Same elements animate the same way
4. **Accessible** - Respect `prefers-reduced-motion`

### Common Patterns

**Button Hover:**
```css
.button {
  transition: all 0.3s ease;
}

.button:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}
```

**Card Lift:**
```css
.card {
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1),
              box-shadow 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 40px 80px rgba(255, 107, 107, 0.15);
}
```

**Gradient Border Reveal:**
```css
.card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--gradient-warm);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.4s ease;
}

.card:hover::before {
  transform: scaleX(1);
}
```

**Staggered Reveals:**
```css
.reveal-delay-1 { transition-delay: 0.1s; }
.reveal-delay-2 { transition-delay: 0.2s; }
.reveal-delay-3 { transition-delay: 0.3s; }
```

---

## Visual Effects

### Noise/Grain Texture

Adds organic, tactile quality. Essential for premium feel.

**SVG Noise Overlay:**
```css
body::before {
  content: '';
  position: fixed;
  inset: 0;
  opacity: 0.03;
  z-index: 10000;
  pointer-events: none;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
}
```

**Tools:**
- [fffuel nnnoise](https://www.fffuel.co/nnnoise/) - SVG noise generator
- [fffuel gggrain](https://www.fffuel.co/gggrain/) - Grainy gradient generator

### Glassmorphism

Frosted glass effect for cards and overlays.

```css
.glass-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
}

/* Fallback for unsupported browsers */
@supports not (backdrop-filter: blur(12px)) {
  .glass-card {
    background: rgba(30, 30, 40, 0.95);
  }
}
```

**Guidelines:**
- Limit to 2-3 glassmorphic elements per viewport
- Reduce blur to 6-8px on mobile
- Never animate elements with backdrop-filter
- Ensure text contrast remains accessible

### Floating Background Elements

Soft, blurred shapes that drift slowly:

```css
.float-shape {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  animation: float-drift 20s ease-in-out infinite;
}

.float-shape.one {
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(255, 107, 107, 0.12) 0%, transparent 70%);
  top: -200px;
  right: -200px;
}

@keyframes float-drift {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -30px) scale(1.05); }
  66% { transform: translate(-20px, 20px) scale(0.95); }
}
```

### Progress Bar

Scroll progress indicator:

```css
.progress-bar {
  position: fixed;
  top: 0;
  left: 0;
  height: 2px;
  background: var(--gradient-warm);
  z-index: 9999;
  transform-origin: left;
  transform: scaleX(0);
}
```

```javascript
window.addEventListener('scroll', () => {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollTop / docHeight;
  progressBar.style.transform = `scaleX(${progress})`;
});
```

---

## Hero Sections

### Essential Elements

1. **Headline** - Powerful, concise, value-focused
2. **Subheadline** - Supporting context (keep it short)
3. **Visual** - Image, video, animation, or illustration
4. **Tags/Categories** - Quick context pills
5. **CTA** (if applicable) - Single, clear action

### Above-the-Fold Rule

Everything essential should be visible without scrolling:
- Headline
- Key visual
- Primary context

### Hero Patterns

**1. Split Screen**
```
[Content] | [Visual]
```

**2. Centered**
```
        [Visual/Animation]
           [Headline]
           [Subhead]
            [Tags]
```

**3. Full-Bleed Visual + Overlay**
```
[Background Image/Video]
[Overlay with Text]
```

**4. Asymmetric/Editorial**
```
[Large Headline]
        [Offset Visual]
[Subtext]
```

### Technical Best Practices

- Compress hero images aggressively
- Use `loading="eager"` for hero images
- Consider WebP/AVIF formats
- Lazy load everything below the fold
- Test on mobile first

---

## Accessibility

### Reduced Motion

**Always respect user preferences:**

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

**Alternative: Provide gentler alternatives**
```css
@media (prefers-reduced-motion: reduce) {
  .animated-element {
    /* Replace motion with opacity change */
    animation: none;
    opacity: 1;
  }
}
```

### Animation Guidelines (WCAG)

1. **No flashing** - Nothing flashes more than 3x per second
2. **Pause controls** - Auto-playing animations >5s need pause button
3. **Avoid parallax** - Or provide alternative
4. **No scroll-jacking** - Let users control scroll
5. **Slow, predictable motion** - 200-500ms for UI animations

### Color Contrast

- Body text: 4.5:1 minimum
- Large text: 3:1 minimum
- UI elements: 3:1 minimum

### Focus States

```css
:focus-visible {
  outline: 2px solid var(--coral);
  outline-offset: 2px;
}
```

---

## Performance

### Key Metrics

- **LCP** (Largest Contentful Paint): <2.5s
- **FID** (First Input Delay): <100ms
- **CLS** (Cumulative Layout Shift): <0.1

### Optimization Checklist

- [ ] Compress all images (WebP/AVIF)
- [ ] Lazy load below-fold images
- [ ] Use `font-display: swap`
- [ ] Minimize CSS (remove unused)
- [ ] Defer non-critical JavaScript
- [ ] Use CSS animations over JS when possible
- [ ] Limit glassmorphism effects
- [ ] Test on 3G throttling

### Animation Performance

**Animate only:**
- `transform`
- `opacity`

**Avoid animating:**
- `width`, `height`
- `top`, `left`, `right`, `bottom`
- `margin`, `padding`
- `backdrop-filter`

---

## Code Snippets

### Complete Card Component

```css
.card {
  background: linear-gradient(135deg, var(--surface) 0%, var(--deep) 100%);
  border: 1px solid var(--border);
  border-radius: 24px;
  padding: 2.5rem;
  position: relative;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--gradient-warm);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.4s ease;
}

.card:hover {
  transform: translateY(-8px);
  border-color: transparent;
  box-shadow: 0 40px 80px rgba(255, 107, 107, 0.15);
}

.card:hover::before {
  transform: scaleX(1);
}
```

### Animated Ring Visualization

```css
.ring {
  position: absolute;
  border-radius: 50%;
  border: 1px solid rgba(255, 107, 107, 0.3);
  animation: ring-pulse 4s ease-in-out infinite;
}

@keyframes ring-pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.6; }
}
```

### Quote Block

```css
.quote {
  position: relative;
  padding: 3rem;
  background: var(--surface);
  border-radius: 24px;
  border: 1px solid var(--border);
}

.quote::before {
  content: '"';
  position: absolute;
  top: 1rem;
  left: 2rem;
  font-family: 'Fraunces', serif;
  font-size: 8rem;
  line-height: 1;
  background: var(--gradient-warm);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  opacity: 0.15;
}

.quote-text {
  font-family: 'Fraunces', serif;
  font-size: 1.4rem;
  font-style: italic;
  line-height: 1.6;
  color: var(--bright);
}
```

---

## Resources & Inspiration

### Award Sites
- [Awwwards](https://www.awwwards.com/) - The gold standard
- [CSS Design Awards](https://www.cssdesignawards.com/)
- [FWA](https://thefwa.com/)
- [Godly](https://godly.website/)
- [Unsection](https://www.unsection.com/) - Hero section inspiration

### Tutorials & Learning
- [Codrops](https://tympanus.net/codrops/) - Advanced CSS/JS tutorials
- [GSAP Docs](https://gsap.com/docs/) - Animation mastery
- [CSS-Tricks](https://css-tricks.com/) - CSS deep dives
- [Frontend Masters](https://frontendmasters.com/) - Courses

### Tools
- [fffuel](https://www.fffuel.co/) - SVG generators (noise, gradients, shapes)
- [Colorffy](https://colorffy.com/) - Dark theme generator
- [Coolors](https://coolors.co/) - Color palette generator
- [Fontjoy](https://fontjoy.com/) - Font pairing with ML
- [Type-Scale](https://type-scale.com/) - Typography scale calculator

### Code Collections
- [CodeMyUI](https://codemyui.com/) - Micro-interaction snippets
- [UI Verse](https://uiverse.io/) - Copy-paste UI elements
- [FreeFrontend](https://freefrontend.com/) - CSS examples

### Animation Libraries
- **GSAP** - Industry standard, now free
- **Framer Motion** - React-focused
- **Anime.js** - Lightweight, flexible
- **Lottie** - After Effects → Web
- **Motion One** - Modern, performance-focused

---

## Quality Assurance Checklist

### Post-Creation Review Process

After generating any brief, run through this checklist before deploying:

#### 1. Structural Integrity
- [ ] Page loads without console errors
- [ ] All fonts load correctly (check Network tab)
- [ ] No broken/missing images or assets
- [ ] Scroll behavior works smoothly
- [ ] All animations trigger correctly
- [ ] No layout shifts during load

#### 2. Responsive Testing
Check at these breakpoints:
- [ ] 1440px (Desktop large)
- [ ] 1024px (Desktop small / Tablet landscape)
- [ ] 768px (Tablet portrait)
- [ ] 375px (Mobile)

Common breakage points:
- Hero text overflow
- Grid collapse behavior
- Card padding on mobile
- Navigation functionality
- Quote text sizing

#### 3. Content Accuracy
- [ ] Name spelled correctly
- [ ] Date is accurate
- [ ] Quotes are verbatim from transcript
- [ ] No hallucinated details
- [ ] Context matches the conversation

#### 4. Visual Polish
- [ ] Consistent spacing throughout
- [ ] Text hierarchy is clear
- [ ] Color contrast passes WCAG
- [ ] Hover states work on all interactive elements
- [ ] No orphaned words in headlines
- [ ] Cards/sections feel balanced

#### 5. Performance
- [ ] File size under 100KB (HTML)
- [ ] No render-blocking resources
- [ ] Animations are smooth (60fps)
- [ ] Page loads in <3s on 3G

#### 6. Originality Check (NEW - Critical)
- [ ] What makes this brief visually unique?
- [ ] Did I use more than 3 "default" techniques?
- [ ] Could this pass as human-designed?
- [ ] Is there at least one unexpected design choice?

---

## Avoiding the AI Aesthetic

### The Problem

AI-generated designs have tells. Recognizing them is the first step to avoiding them.

### Common AI Design Tells

| Tell | Why It Happens | How to Avoid |
|------|----------------|--------------|
| Warm gradient on everything | Training data overfit to Dribbble 2020-2023 | Single accent color, or unexpected palette |
| Emoji as icons | Low-effort visual shorthand | No icons, or custom SVG, or Unicode symbols |
| Symmetrical bento grids | Safe, predictable layout | Break the grid, overlap elements, extreme whitespace |
| Dark mode + noise + glass | "Premium" aesthetic clichés stacked | Pick ONE effect, do it exceptionally |
| Floating gradient orbs | Every AI landing page has them | Remove entirely, or use photography/illustration |
| Perfect polish | No intentional imperfection | Add tension, asymmetry, hand-drawn elements |
| Predictable section order | Hero→Stats→Cards→Quotes→CTA | Unexpected flow, editorial pacing |
| Generic metaphors | "Keys to castle", "bridge", "journey" | Specific, weird, memorable concepts |

### Constraint = Creativity

The best way to avoid AI aesthetic: **impose constraints**.

**Color constraint:**
- Only black + one accent color
- Only warm tones OR only cool tones
- Monochrome with texture variation

**Layout constraint:**
- Single column only
- No cards at all
- Everything left-aligned
- Massive whitespace (80% of viewport)

**Typography constraint:**
- One font family only
- Only two sizes (huge headlines, small body)
- No bold weights anywhere

**Effect constraint:**
- No gradients
- No animations
- No rounded corners
- No shadows

### What Real Designers Do Differently

1. **Reference obsessively** - Study one specific site and emulate its choices
2. **Limit the palette** - 2-3 colors max, used with discipline
3. **Create tension** - Something should feel slightly "wrong" but intentional
4. **Embrace imperfection** - Hand-drawn lines, irregular shapes, texture
5. **Editorial thinking** - Design like a magazine spread, not a SaaS landing page
6. **Kill your darlings** - Remove the thing you're most attached to
7. **Whitespace courage** - Leave more empty than filled

### Anti-Pattern Exercises

Before each brief, try one of these:

1. **The Subtraction Game**: Design it, then remove 50% of the elements
2. **The One-Color Challenge**: Entire design with single hue
3. **The No-Cards Rule**: Convey all information without card containers
4. **The Print Test**: Design as if it will be printed in a magazine
5. **The Brutalist Sprint**: Deliberately ugly, but intentional

---

## Creative Direction Framework

### How We Should Collaborate

The briefs improve when Mike provides specific creative direction. Here's a framework:

### Direction Levels

**Level 1: Vibe Words**
Give me 2-3 adjectives:
- "Brutal, minimal, confident"
- "Warm, organic, handmade"
- "Corporate but weird"
- "90s web revival"

**Level 2: Reference Sites**
Point me to 1-2 specific sites to emulate:
- "Make it feel like [specific Awwwards site]"
- "The typography treatment from [specific portfolio]"
- "The scroll behavior on [specific URL]"

**Level 3: Anti-Direction**
Tell me what to avoid:
- "No gradients"
- "Don't use the standard section order"
- "No rounded corners"
- "Kill the noise texture"

**Level 4: Concept Direction**
Give me a metaphor or concept to design around:
- "Design it like a ransom note"
- "This person is a knife, not a butter knife"
- "Think Wes Anderson credits"
- "Make it feel like a classified document"

### Feedback Loop

After each brief, quick feedback:

1. **What worked?** (Keep for next time)
2. **What felt AI-ish?** (Avoid next time)
3. **What was missing?** (Add to the system)
4. **Wild card idea?** (Let's try something weird)

### Per-Brief Creative Brief

For important briefs, give me:

```
NAME: [Full name]
VIBE: [2-3 adjectives]
REFERENCE: [URL or "surprise me"]
AVOID: [Things not to do]
CONCEPT: [Optional metaphor/theme]
RISK LEVEL: [Safe / Medium / Weird]
```

Example:
```
NAME: Carrie Williams
VIBE: Academic, warm, subversive
REFERENCE: https://godly.website/website/831-monopo-tokyo
AVOID: Gradients, floating orbs, bento grid
CONCEPT: A dissertation that became a zine
RISK LEVEL: Medium-Weird
```

---

## Changelog

| Date | Update |
|------|--------|
| 2026-01-30 | Initial creation with comprehensive research |
| 2026-01-31 | Added QA Checklist, Anti-AI Aesthetic guide, Creative Direction Framework |

---

*This is a living document. Update it as new trends emerge and techniques evolve.*
