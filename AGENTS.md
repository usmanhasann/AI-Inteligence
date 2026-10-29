# AI & Agent Guidelines: Upgrade Myself

Welcome! This repository houses **Upgrade Myself**, a modern weekly learning studio for AI, vibe-coding, full-stack systems, and design vocabulary.

---

## 🛠️ Technology Stack
- **Framework:** React 19 + TypeScript + Vite
- **Styling:** TailwindCSS v4 + Space Grotesk / Inter / JetBrains Mono fonts
- **Animations & 3D:** GSAP + Three.js (3D Vector Embedding Space)
- **Mobile & Offline:** Capacitor (Android) + Progressive Web App (PWA with Workbox + idb-keyval)
- **Backend / Data:** Supabase (PostgreSQL schema in `docs/supabase-schema.sql`)

---

## ⚡ Development Workflow
- `npm install` — Install dependencies
- `npm run dev` — Launch Vite dev server (port 5173 by default)
- `npm run build` — Compile TypeScript and Vite production bundle to `dist/`
- `npm run typecheck` — Run TypeScript type checking
- `npm run validate` — Validate curriculum content structure

---

## 🎬 Video & Launch Generation (/brag)
This repository includes the **`/brag`** and **`/brag-slim`** agent skills located in `.agents/skills/`.
- **Location:** `.agents/skills/brag/` and `.agents/skills/brag-slim/`
- **Render Engine:** Hyperframes (`npx -y hyperframes`)
- **Workflow:** When asked to generate launch videos or product reels, follow the rubric in `.agents/skills/brag/SKILL.md` to produce storyboard compositions in `brag-output/composition/` and render outputs with `npx -y hyperframes render`.
