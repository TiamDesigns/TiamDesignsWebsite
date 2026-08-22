---
name: tiam-portfolio-design
description: Guidelines and patterns for designing and updating Tiam Designs industrial design project pages, hardware specs, and interactive portfolio galleries.
---

# Tiam Designs Portfolio Engineering & Case Study Design

Use this workspace skill when adding new project showcases, updating project case studies, or building interactive hardware/CAD showcases for Tiam Designs.

## Case Study Page Structure
1. **Hero Header**: High-impact hero render with CAD wireframe ghosting, aggressive uppercase display typography, status chips (`[STATUS: ACTIVE]`, `0x4B29`), and telemetry metadata.
2. **Design Problem & Objectives**: Concise problem statement, user needs, engineering constraints framed with industrial chamfered containers.
3. **Ideation & Prototyping**: Sketching, iterative 3D CAD modeling, ergonomics exploration, breadboard/functional testing with multi-layer screenprint/halftone treatments.
4. **Engineering Details & Specifications**: Telemetry spec tables (`[STR: 99%]`, `TOLERANCE ±0.02mm`), exploded assembly diagrams, Bill of Materials (BOM), CMF (Color, Material, Finish).
5. **Interactive Media**: Chamfered media cards with hover inversions, tactile buttons, modal lightboxes, and smooth interactive carousels.

## ⚡ Neo-Street & Tactical Telemetry (ZZZ & 2XKO Aesthetic - High-Voltage Edition)

### 1. Color Tokens
- **Background & Surfaces**:
  - `Void Base`: `#090a0d` (Deep carbon / dark graphite void)
  - `Tactical Surface`: `#141822` (Recessed & container fill)
  - `Elevated Card Surface`: `#181d28` (Tactical card body)
  - `Structural Border Frame`: `rgba(255, 255, 255, 0.18)` (Crisp high-contrast chamfer outline)
- **Primary Accents (High-Voltage Tactical)**:
  - `High-Voltage Neon Green / Acid Lime`: `#b4f326` (Signature active state, primary buttons, and telemetry highlights)
  - `Safety Hazard Orange`: `#ff5500` (Hazard delimiters, warning badges, and secondary highlights)
  - `Bone White / Pure White`: `#ffffff` (High-contrast typography)
  - `Tactical Slate`: `#9aa3b5` (Readable secondary metadata and body copy)
- **Text on Accents**: Jet black `#090a0d` on neon badges.

### 2. Graphic Motifs & Geometry
- **Chamfered 45° Corners**: Use `clip-path: polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))` on cards and buttons with crisp `1.5px` inner inset borders.
- **Directional & Telemetry Markers**: Chevrons (`>>>`), slashes (`////`), and status indicators (`● DEPLOYED`).
- **Clean Containers**: Avoid repeating redundant `XXXX` corner decals to keep card content clean and focused.
- **Hard Offsets**: 2px–4px hard solid drop shadows (`box-shadow: 4px 4px 0px #000000` or `4px 4px 0px var(--accent-lime)`).

### 3. Typography & Typesetting (Anti-Orphan Rules)
- **Display**: Ultra-bold geometric / distressed gothic sans in UPPERCASE (`text-wrap: balance`).
- **Banners & Marquees**: 15° slanted/italic bold sans with authentic EE student technical terms.
- **Telemetry**: Wide-tracked monospace (`JetBrains Mono` / `Share Tech Mono`).
- **Body & Descriptions**: Clean grotesque sans (`Plus Jakarta Sans` / `Inter`) with `text-wrap: pretty;` and `&nbsp;` to strictly avoid lonely single-word orphan lines.
- **Avoid Single-Word Wrap**: Always ensure headlines, project cards, and bio paragraphs have balanced line lengths without dangling single words.
