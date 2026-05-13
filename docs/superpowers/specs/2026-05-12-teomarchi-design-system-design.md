# TEOMARCHI Design System & Module Identity Design

**Goal:** Build a stronger TEOMARCHI visual system and give each main module a distinct architectural identity without adding a framework or destabilizing the SPA.

**Context:** TEOMARCHI is a Vanilla JS architectural platform using `index.html`, `style.css`, and `app.js` as central files. Firebase Auth, Firestore, Stripe Payment Links, SPA navigation, modal overlays, and delegated click handling must remain stable.

---

## Creative Direction

TEOMARCHI must feel like an architectural digital infrastructure: minimal, premium, technical, immersive, editorial, and credible. The visual field should mix an architecture studio, a design laboratory, a contemporary museum, a premium architecture review, and a modern software interface.

The design should evoke matter, structural logic, plans, geography, time, constructive systems, precision, and controlled creativity. It must not feel like a generic SaaS dashboard, a Bootstrap template, a gaming interface, or a Notion clone.

## Global Design System

The global system will extend the current CSS variables instead of replacing them. It will add a small token layer for:

- deep black surfaces;
- off-white typography;
- concrete greys;
- architectural beige;
- light metallic accents;
- restrained gold highlights;
- thin borders;
- editorial serif titles;
- technical sans labels;
- numeric/data styles.

The component language will standardize:

- editorial section headers;
- architectural cards;
- technical badges and tags;
- panels and side sheets;
- timeline blocks;
- module-specific hero areas;
- empty states;
- hover states;
- modal/overlay behavior;
- responsive grid rules.

Animations must stay subtle: opacity, transform, border-color, background-position, and small reveal transitions only. No heavy 3D engine, no large animation library, no saturated visual effects.

## Module Identities

### Atlas

Atlas becomes an immersive geographical architecture encyclopedia. Its atmosphere is topographic, cartographic, and exploratory.

Implementation direction:

- add a lightweight abstract projection/globe visual using CSS/SVG, not a heavy WebGL dependency;
- keep the existing data-driven cards and filters;
- add a module intro panel that frames geography, climate, matter, structure, and constructive intelligence;
- give Atlas cards a topographic visual motif, subtle contour lines, and location/material hierarchy.

### Chronos

Chronos becomes a temporal architecture experience. Its atmosphere is a matter-era timeline.

Implementation direction:

- keep the existing `DATA_CHRONOS` and comparison logic;
- present entries through a stronger timeline shell;
- use a long horizontal or stacked temporal spine depending on viewport;
- make material eras visually distinct with restrained surface treatments;
- keep comparison readable and lightweight.

### Panthéon

Panthéon becomes a contemporary museum/archive of architectural figures, not a simple list.

Implementation direction:

- keep the current architect dataset and filters;
- shift the card layout toward gallery/archive cards;
- add movement/doctrine hierarchy;
- add an influence/archive visual language using thin lines, plaque-like labels, and editorial spacing;
- prepare for future biographies, projects, influences, and linked architects.

### Journalier

Journalier remains the productive heart of TEOMARCHI. Its atmosphere is an architectural project atelier.

Implementation direction:

- keep localStorage project state and all existing task/calendar/deadline behavior;
- make calendar and progress visually central;
- add a project timeline/workbench feel through layout, labels, and progress strips;
- preserve drag/drop, checklist, project categories, deadlines, and responsive behavior.

### Feed

Feed becomes a wall of architectural evolution, not a Twitter clone.

Implementation direction:

- keep Firestore realtime behavior and moderation rules;
- present posts as editorial project updates;
- prioritize sketches, plans, renders, models, concepts, and progress;
- maintain anti-plagiarism certification, comments, likes, reports, and empty states;
- use a gallery/editorial hierarchy that stays lightweight.

### Showroom

Showroom becomes a premium gallery for materials, furniture, agencies, sponsors, and creators.

Implementation direction:

- keep the future marketplace shell already present;
- strengthen the gallery language with category covers, partner plaques, material surfaces, and premium sponsor cards;
- preserve Stripe plan CTAs and premium gating architecture;
- avoid intrusive advertising.

## Technical Architecture

The implementation should remain scoped to:

- `style.css` for global tokens, components, responsive rules, and module visual systems;
- `app.js` for lightweight module-specific wrapper markup or renderer options where necessary;
- `index.html` only for stable static shell additions if a module needs a semantic container;
- tests for SPA integrity, overlays, and module identity tokens.

No framework will be added. No new external visual library will be added. The existing SPA navigation, `data-nav`, `data-module`, Firebase Auth, Firestore social features, Stripe Payment Links, legal slider, sidebar, theme toggle, and overlays must remain compatible.

## Performance Rules

Use:

- CSS gradients, thin SVGs, and pseudo-elements;
- small inline SVG motifs when useful;
- GPU-friendly transforms and opacity;
- responsive CSS grids;
- lazy module initialization already present through MutationObserver hooks.

Avoid:

- heavy WebGL scenes;
- continuous high-cost animations;
- large image assets;
- new dependencies;
- layout shifts from unstable dimensions;
- listeners attached repeatedly on navigation.

## Acceptance Criteria

- TEOMARCHI has a clearer global design system in CSS.
- Atlas visually reads as geographical/cartographic.
- Chronos visually reads as temporal/timeline-based.
- Panthéon visually reads as museum/archive/gallery.
- Journalier visually reads as project atelier/workbench.
- Feed visually reads as architectural evolution wall.
- Showroom visually reads as premium architectural gallery.
- Existing SPA navigation continues working.
- Existing Firebase Auth and Stripe Checkout remain unchanged behaviorally.
- Closed overlays remain non-blocking.
- Tests continue passing with `node --test`.

