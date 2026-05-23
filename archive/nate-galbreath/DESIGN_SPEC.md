# Narrative Maps — Leadership Philosophy Brief
## Complete Design Specification

---

## COLOR PALETTE

### Primary Colors
| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| **Slate** | `#0F172A` | 15, 23, 42 | Primary background |
| **Steel** | `#1E293B` | 30, 41, 59 | Secondary background, cards |
| **Bone** | `#F8FAFC` | 248, 250, 252 | Primary text |
| **Fog** | `#94A3B8` | 148, 163, 184 | Secondary text, muted elements |
| **Signal** | `#F59E0B` | 245, 158, 11 | Primary accent (amber/orange) |
| **Command** | `#DC2626` | 220, 38, 38 | Secondary accent (red, for "resists") |

### Opacity Variants Used
- `fog/90` — 90% opacity fog for hero quote
- `fog/80` — 80% opacity fog for body text
- `fog/70` — 70% opacity fog for italic supporting text
- `fog/60` — 60% opacity fog for descriptions
- `fog/50` — 50% opacity fog for metadata labels, attribution
- `fog/40` — 40% opacity fog for section labels, dividers
- `fog/20` — 20% opacity fog for faded timeline markers
- `fog/10` — 10% opacity fog for borders, dividers
- `signal/30` — 30% opacity signal for pillar numbers
- `signal/10` — 10% opacity signal for tag backgrounds
- `steel/50` — 50% opacity steel for alternate section backgrounds
- `steel/30` — 30% opacity steel for card backgrounds

### Gradients
**Hero Text Gradient:**
```
background: linear-gradient(135deg, #F59E0B 0%, #DC2626 100%);
```
Applied as text gradient on "Accessible" in hero.

**Pillar Card Background:**
```
background: linear-gradient(180deg, rgba(30,41,59,0.8) 0%, rgba(15,23,42,0.95) 100%);
```

**Timeline Bars:**
- Immediate: `linear-gradient(to bottom, #F59E0B, #F59E0B at 20% opacity)`
- Medium: `linear-gradient(to bottom, fog/40, fog/10)`
- Long-term: `linear-gradient(to bottom, fog/20, transparent)`

### Additional Accent Colors (Tailwind defaults used)
| Name | Hex | Usage |
|------|-----|-------|
| Emerald 400 | `#34D399` | "He Values" checkmarks, positive items |
| Emerald 500/10 | 10% opacity | Positive item backgrounds |
| Red 400 | `#F87171` | Priority #1 tag |
| Red 500/10 | 10% opacity | Priority tag background |

---

## TYPOGRAPHY

### Font Stack
| Role | Font Family | Google Fonts Link |
|------|-------------|-------------------|
| **Sans** (UI, body) | IBM Plex Sans | `family=IBM+Plex+Sans:wght@300;400;500;600;700` |
| **Serif** (Headlines, quotes) | Newsreader | `family=Newsreader:ital,wght@0,400;0,500;0,600;1,400` |
| **Mono** (Labels, data) | JetBrains Mono | `family=JetBrains+Mono:wght@400;500` |

### Type Scale

#### Hero Section
| Element | Font | Size | Weight | Line Height | Tracking | Color |
|---------|------|------|--------|-------------|----------|-------|
| Top label | Mono | 10px | 400 | — | 0.3em | Signal |
| Main headline | Serif | 56px (mobile) / 80px (desktop) | 600 | 1.1 | normal | Bone |
| Gradient word | Serif | 56px / 80px | 600 | 1.1 | normal | Gradient |
| Hero quote | Serif | 20px / 24px | 400 | relaxed (~1.625) | normal | Fog/90, italic |
| Attribution | Mono | 12px | 400 | — | normal | Fog/50 |
| Metadata label | Mono | 10px | 400 | — | wider (0.05em) | Fog/40, uppercase |
| Metadata value | Sans | 14px | 500 | — | normal | Bone |

#### Section Headers
| Element | Font | Size | Weight | Tracking | Color |
|---------|------|------|--------|----------|-------|
| Section number | Mono | 12px | 400 | normal | Signal |
| Section title | Sans | 14px | 700 | 0.2em | Bone, uppercase |
| Section intro | Serif | 24px / 30px | 400 | normal | Fog/90 |

#### Pillar Cards
| Element | Font | Size | Weight | Color |
|---------|------|------|--------|-------|
| Pillar number | Mono | 36px | 700 | Signal/30 |
| Tag | Mono | 10px | 400 | Signal (or variant), uppercase |
| Card title | Serif | 24px | 600 | Bone |
| Card body | Sans | 14px (implied base) | 400 | Fog/80 |
| Footer label | Mono | 10px | 400 | Fog/40, uppercase |
| Footer text | Sans | 14px | 400 | Fog/70, italic |

#### Timeline Section
| Element | Font | Size | Weight | Color |
|---------|------|------|--------|-------|
| Phase label | Mono | 10px | 400 | Signal (or Fog/60, Fog/40) |
| Phase title | Serif | 20px | 600 | Bone |
| List items | Sans | 14px | 400 | Fog/80 |
| Arrow bullets | — | — | — | Signal (or faded variants) |

#### Stats Grid (Origin Story)
| Element | Font | Size | Weight | Color |
|---------|------|------|--------|-------|
| Number | Mono | 24px | 700 | Signal (or Fog/60) |
| Label | Sans | 10px | 400 | Fog/50, uppercase |

#### Values/Resists Cards
| Element | Font | Size | Weight | Color |
|---------|------|------|--------|-------|
| Section header | Serif | 24px | 600 | Bone |
| Checkmark/X | — | 20px | — | Emerald 400 / Command |
| Item title | Sans | 14px | 500 | Bone |
| Item description | Sans | 14px | 400 | Fog/60 |

#### Table (Connection Point)
| Element | Font | Size | Weight | Color |
|---------|------|------|--------|-------|
| Table header | Mono | 12px | 400 | Signal / Fog/60, uppercase |
| Table cell left | Sans | 14px | 400 | Fog/80 |
| Table cell right | Sans | 14px | 400 | Bone |

#### Footer
| Element | Font | Size | Weight | Color |
|---------|------|------|--------|-------|
| Brand label | Mono | 12px | 400 | Fog/40, uppercase, tracking 0.2em |
| Tagline | Serif | 14px | 400 | Fog/60, italic |
| Version | Mono | 12px | 400 | Fog/40 |

---

## SPACING SYSTEM

### Page Layout
- **Max content width:** 1152px (max-w-6xl)
- **Hero max width:** 1024px (max-w-5xl)
- **Prose max width:** 768px (max-w-3xl)
- **Horizontal padding:** 24px
- **Section vertical padding:** 96px (py-24)

### Section Headers
- **Gap between number and title:** 16px
- **Margin below header row:** 64px (mb-16)

### Cards & Grids
- **Card padding:** 32px (p-8)
- **Grid gap:** 24px (gap-6) to 32px (gap-8)
- **Card internal margin between elements:** 16px (mb-4) to 24px (mb-6)

### List Items
- **Vertical spacing between items:** 12px (space-y-3) to 16px (space-y-4)
- **Gap between bullet and text:** 8px (gap-2)

### Borders
- **Standard divider:** 1px, Fog/10
- **Accent border left:** 2px, Signal
- **Card border:** 1px, Fog/10 or Fog/5
- **Feature box border:** 2px, Signal/30

---

## COMPONENT SPECIFICATIONS

### Background Pattern (Hero)
```css
background-image: radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0);
background-size: 40px 40px;
opacity: 0.05;
```

### Pillar Card
```css
background: linear-gradient(180deg, rgba(30,41,59,0.8) 0%, rgba(15,23,42,0.95) 100%);
border: 1px solid rgba(148,163,184,0.1);
padding: 32px;
transition: all 0.3s;

/* Hover state */
border-color: rgba(245,158,11,0.3);
```

### Tag/Pill
```css
padding: 4px 12px;
background: rgba(245,158,11,0.1); /* or variant color */
color: #F59E0B;
font-family: JetBrains Mono;
font-size: 10px;
text-transform: uppercase;
letter-spacing: wider;
border-radius: 4px;
```

### Timeline Vertical Bar
```css
position: absolute;
left: -12px;
top: 0;
bottom: 0;
width: 4px;
border-radius: 9999px;
background: linear-gradient(to bottom, #F59E0B, rgba(245,158,11,0.2));
```

### Stats Box
```css
text-align: center;
padding: 16px;
background: rgba(30,41,59,0.3);
border-radius: 4px;
```

### Values/Resists Item Card
```css
/* Values (positive) */
padding: 16px;
background: rgba(52,211,153,0.05);
border: 1px solid rgba(52,211,153,0.1);
border-radius: 4px;

/* Resists (negative) */
padding: 16px;
background: rgba(220,38,38,0.05);
border: 1px solid rgba(220,38,38,0.1);
border-radius: 4px;
```

### Feature Box (The Opportunity)
```css
padding: 32px;
border: 2px solid rgba(245,158,11,0.3);
background: rgba(245,158,11,0.05);
border-radius: 8px;
```

### Pulsing Dot Animation
```css
@keyframes pulse-slow {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.pulse-slow {
  animation: pulse-slow 3s ease-in-out infinite;
}
```

### Quote Block
```css
padding: 32px;
background: #0F172A;
border: 1px solid rgba(148,163,184,0.1);
border-radius: 8px;
```

---

## RESPONSIVE BREAKPOINTS

| Breakpoint | Width | Usage |
|------------|-------|-------|
| Mobile (default) | < 768px | Single column, smaller type |
| Tablet/Desktop (md:) | ≥ 768px | Multi-column grids, larger type |

### Key Responsive Changes
- **Hero headline:** 56px → 80px
- **Section intro:** 24px → 30px  
- **Quote text:** 20px → 24px
- **Grids:** 1 column → 2-3 columns
- **Timeline layout:** Stacked → 12-column grid (3 + 9 split)

---

## ICON/SYMBOL REFERENCE

| Symbol | Usage | Color |
|--------|-------|-------|
| → | List bullet (arrow) | Signal / Fog variants |
| ✓ | Values checkmark | Emerald 400 |
| ✗ | Resists X | Command |
| • | Bullet point | Signal / Fog/40 |

---

## FILE ASSETS NEEDED FOR ILLUSTRATOR

1. **Fonts to install:**
   - IBM Plex Sans (Light 300, Regular 400, Medium 500, SemiBold 600, Bold 700)
   - Newsreader (Regular 400, Medium 500, SemiBold 600, Regular Italic 400)
   - JetBrains Mono (Regular 400, Medium 500)

2. **Color swatches to create:**
   - Slate: #0F172A
   - Steel: #1E293B
   - Bone: #F8FAFC
   - Fog: #94A3B8
   - Signal: #F59E0B
   - Command: #DC2626
   - Emerald: #34D399

3. **Gradient definitions:**
   - Hero text: 135° from Signal to Command
   - Pillar cards: 180° from Steel/80% to Slate/95%

---

## NOTES FOR ILLUSTRATOR REBUILD

1. **Artboard size recommendation:** 1440px wide for desktop view
2. **Use paragraph styles** for each type level to maintain consistency
3. **Use character styles** for inline elements (bold, signal-colored text)
4. **Create symbols** for repeated components (pillar cards, stat boxes, list items)
5. **The dot grid pattern** can be created as a pattern swatch
6. **Export settings:** For PDF, embed fonts and use RGB color mode

---

*Spec generated December 2025 for Illustrator production.*






