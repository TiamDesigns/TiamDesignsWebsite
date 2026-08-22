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

## ⚡ Neo-Street & Tactical Telemetry (Matte Sage & Muted Industrial Edition)

### 1. Color Tokens
- **Background & Surfaces**:
  - `Void Base`: `#090a0d` (Deep carbon / dark graphite void)
  - `Tactical Surface`: `#141822` (Recessed & container fill)
  - `Elevated Card Surface`: `#181d28` (Tactical card body)
  - `Structural Border Frame`: `rgba(255, 255, 255, 0.18)` (Crisp high-contrast chamfer outline)
- **Primary Accents (Matte Tactical)**:
  - `Matte Sage / Olive Green`: `#8fa876` (Primary active state, tactical buttons, and hardware highlights)
  - `Muted Industrial Orange`: `#d96b34` (Warm terracotta hazard delimiters, warning badges, and secondary highlights)
  - `Pure White`: `#ffffff` (High-contrast typography)
  - `Tactical Slate`: `#9aa3b5` (Readable secondary metadata and body copy)
- **Text on Accents**: Jet black `#090a0d` on sage/orange badges.

### 2. Graphic Motifs & Geometry
- **Chamfered 45° Corners**: Use `clip-path: polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))` on cards and buttons with crisp `1.5px` inner inset borders.
- **Directional & Category Markers**: Chevrons (`>>>`), slashes (`////`), and status indicators (`● COMPLETED`).
- **Clean Containers**: Avoid repeating redundant `XXXX` corner decals to keep card content clean and focused.
- **Hard Offsets**: 2px–4px hard solid drop shadows (`box-shadow: 4px 4px 0px #000000` or `4px 4px 0px var(--accent-lime)`).

### 3. Typography & Terminology Rules
- **No Over-Abbreviation**: Spell out words fully and clearly (e.g. `LOCATION` instead of `LOC`, `ENGINEERING` instead of `ENG`, `SPECIFICATIONS` instead of `SPECS`, `PRODUCT DESIGN` instead of `PROD`).
- **Grounded Student Experience**: Accurately reflect hands-on student engineering projects, lab coursework, and prototyping experience without inflating roles or using buzzword bloat (e.g. avoid "Bare-metal", "Analog Signal Chain", "Embedded Telemetry").
- **Display**: Ultra-bold geometric / distressed gothic sans in UPPERCASE (`text-wrap: balance`).
- **Banners & Marquees**: 15° slanted/italic bold sans with authentic student technical terms.
- **Body & Descriptions**: Clean grotesque sans (`Plus Jakarta Sans` / `Inter`) with `text-wrap: pretty;` and `&nbsp;` to strictly avoid lonely single-word orphan lines.
