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

## 🎬 Video & Launch Generation Instructions (For Google Jules & AI Agents)

This repository includes the **`/brag`** and **`/brag-slim`** agent skills committed directly in `.agents/skills/`.

### 1. How Jules Finds & Runs the Skill
- **Skill Location in Repo:**
  - Full workflow: `.agents/skills/brag/SKILL.md`
  - Lean single-file workflow: `.agents/skills/brag-slim/SKILL.md`
- **Execution in Cloud:**
  When Jules executes in a Google Cloud VM, it has Node.js and full shell access. It can read `.agents/skills/brag/SKILL.md` directly.
  - Pre-render check: `npx -y hyperframes check`
  - Video rendering: `npx -y hyperframes render --output ../brag.mp4`

---

### 2. Video Length & Storyboard Pacing Guidelines

Agents should tailor video pacing and scene structure based on the requested duration:

| Duration | Best For | Recommended Pacing & Structure |
| :--- | :--- | :--- |
| **15 – 20s (Fast Hook)** | Twitter/X & Stories | **0–3s:** Hook ("Stop Memorizing Syntax")<br/>**3–8s:** 4 Core Pillars<br/>**8–14s:** 12 Visual Labs showcase<br/>**14–17s:** Offline PWA + Daily Habit<br/>**17–20s:** Brand outro & URL |
| **30s (Social Reels Standard)** | Instagram Reels, TikTok, YouTube Shorts | **0–4s:** Provocative Hook (Syntax trap vs. Mental models)<br/>**4–10s:** 16-Week Roadmap breakdown<br/>**10–18s:** Interactive Labs in action (3D Embedding Space, Transformer Attention)<br/>**18–25s:** Daily Habit loop (20 min weekdays / 2h weekends) + 100% Offline PWA<br/>**25–30s:** Outro badge & Early Access CTA |
| **45 – 60s (Deep Showcase)** | LinkedIn, Product Hunt, YouTube Landscape | **0–5s:** The problem with syntax tutorials<br/>**5–15s:** Overview of the 4 Pillars & 64 concepts<br/>**15–30s:** Hands-on demo of interactive labs (Sliders, cosine similarity, agent loops)<br/>**30–45s:** Daily study system, flashcards, glossary & custom note imports<br/>**45–55s:** Native Android & Offline persistence<br/>**55–60s:** Call to action & community links |

---

### 3. Soundtrack & Audio Design Instructions

Do NOT use generic corporate elevator music. Match the audio to the project's futuristic, dark-mode engineering aesthetic:

* **Musical Genre & Energy:**
  * **Preferred:** 120–128 BPM electronic groove, futuristic synthwave, cyberpunk lo-fi, or clean ambient tech pulse with punchy kicks.
  * **Vibe:** Technical, sophisticated, and forward-looking.
* **Beat-Aligned Animation:**
  * Lock major card entrances, laser strike-throughs, and counter rollups to the rhythm's downbeats (e.g. at 3.0s, 7.0s, 11.5s, 16.0s).
* **Sound Effects (SFX) Accents:**
  * **Hook:** Deep sub-bass impact or laser whoosh when the headline transitions.
  * **Curriculum & Labs:** Subtle, crisp UI clicks (`click_001.ogg`) as cards pop into view.
  * **Checklist / Features:** Soft harmonic chime or high-tech ping when items tick green.
* **Audio Mixing:**
  * Music volume: 75–85% during beats.
  * If voiceover is enabled (`--voice`), duck music volume to 30–35% during spoken lines.

---

### 4. Output Deliverables Rule
All generated video artifacts, frames, and audio exports must reside strictly in:
```text
brag-output/
```
Ensure `brag-output/brag.mp4`, `brag-output/brag.jpg`, and the composition files are staged and committed (`git add brag-output/`) so that the final video and assets are viewable, previewable, and downloadable directly on GitHub and in PRs.
