# Hyperframes Composition Brief: Upgrade Myself

## Objective
Create a short 30-second vertical launch-style brag video (1080x1920) for Upgrade Myself aimed at Instagram Reels / TikTok / YouTube Shorts.

## Output
- Composition directory: `brag-output/composition/`
- Rendered video: `brag-output/brag.mp4`
- Poster frame: `brag-output/brag.jpg`
- Format: vertical — 1080x1920
- Duration: 30 seconds (30fps)

## Source Material
- Project root: `./`
- Primary files read: `README.md`, `src/index.css`, `src/content/curriculum.ts`, `AGENTS.md`
- Product name: Upgrade Myself
- Tagline / strongest claim: "Stop Memorizing Syntax. Upgrade Your Mental Models & AI Systems."
- Key UI or visual moments to recreate:
  - 16-Week Roadmap & 4 Pillars (Foundations, Context & RAG, Agents & Vibe-Coding, Full-Stack & UX)
  - Interactive Visual Labs (3D Vector Embedding Space, Transformer Multi-Head Attention, Tokenizer)
  - Daily Habit Loop (20 min Weekdays / 2h Weekends)
  - 100% Offline PWA & Android Badge + PDF/MD Importer
  - Outro badge & CTA

## Creative Direction
- Tone preset: `polished`
- Creative direction: Cyberpunk synthwave technical studio, dark mode (`#07070d`), vibrant neon accents (`#8b5cf6`, `#22d3ee`, `#f472b6`).
- Angle: Modern weekly learning studio for AI engineering, vibe-coding, full-stack systems, and design vocabulary.
- Hook: 0–4s laser strike-through on "STOP MEMORIZING SYNTAX".
- Outro: 25–30s "UPGRADE MYSELF" glowing logo badge and CTA.

## Visual Identity
- Background: `#07070d` with animated aurora gradient blur
- Cards: `rgba(255, 255, 255, 0.045)` with `1px solid rgba(255, 255, 255, 0.09)` border & glassmorphism
- Text: Primary `#ededf7`, Muted `#a2a2bd`
- Accents: Electric Violet `#8b5cf6`, Cyan `#22d3ee`, Pink `#f472b6`, Green `#34d399`
- Fonts: `@fontsource-variable/space-grotesk`, `@fontsource-variable/inter`, `@fontsource-variable/jetbrains-mono`

## Storyboard
Use `brag-output/brag-plan.md` as the creative contract.

Scene summary:
1. Provocative Hook (0.0s – 4.0s) — "STOP MEMORIZING SYNTAX" strike-through → Mental Models & Systems.
2. 16-Week Roadmap & 4 Pillars (4.0s – 10.0s) — 4 Pillar cards arrive sequentially on synthwave beats.
3. Interactive Visual Labs (10.0s – 18.0s) — 3D Embedding Space, Transformer Attention heatmap, live Tokenizer.
4. Daily Habit & 100% Offline PWA (18.0s – 25.0s) — Study schedule, offline PWA/Android badge, custom document importer.
5. Outro Badge & CTA (25.0s – 30.0s) — Glowing Upgrade Myself logo badge & "Start Free" CTA.

## Audio
- Audio role: Futuristic Synthwave 124 BPM track bed + beat-aligned SFX accents.
- Music file: `assets/music/synthwave.wav`
- Music volume: `data-volume="0.38"`
- SFX files copied to `assets/sfx/`:
  - `impact/impactSoft_medium_000.ogg` (hook laser impact)
  - `interface/glitch_002.ogg` (hook transition)
  - `interface/drop_001.ogg` (card pop-ins)
  - `interface/click_001.ogg` (lab interactions)
  - `interface/select_008.ogg` (metric reveals)
  - `interface/bong_001.ogg` (checklist items)
  - `impact/impactBell_heavy_000.ogg` (outro logo lock)

## Hyperframes Instructions
- Composition dimensions: `1080x1920` (vertical).
- Exact 30-second duration (`data-duration="30"`).
- All CSS fonts and assets served locally or embedded.
- Pre-render check: run `npx hyperframes check` on `brag-output/composition`.
