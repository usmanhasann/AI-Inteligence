# 🎬 60-Second Flagship Product Overview: Instructions for Jules

> **Target Agent:** Google Jules (Secondary / Alternate Account)  
> **Target Video:** 60-Second Full Product Deep Dive (High Quality / Delivery Grade)  
> **Output Path:** `brag-output/upgrade-myself-overview-60s.mp4`

---

## 🎯 Mission
Generate an exhaustive, high-production 60-second flagship launch video showcasing **Upgrade Myself** using real UI screens, 3D visualizations, and interactive lab mechanics directly from the codebase.

---

## 📂 Required Source Files for This Run

The second Jules agent **must read and reference the following specific files** to accurately reproduce the product's real UI, terminology, and interactive features:

| File Path | What to Extract & Show in Video |
| :--- | :--- |
| [`src/index.css`](src/index.css) | Core color tokens: Background `#07070d`, surface `#12121f`, neon violet `#8b5cf6`, cyan `#22d3ee`, fonts: *Space Grotesk*, *Inter*, *JetBrains Mono*. |
| [`src/pages/Home.tsx`](src/pages/Home.tsx) | Hero UI, current week progress card, streak tracker, and study cadence. |
| [`src/pages/Roadmap.tsx`](src/pages/Roadmap.tsx) | The full 16-week curriculum visual timeline across all 4 pillars. |
| [`src/content/curriculum.ts`](src/content/curriculum.ts) | Verbatim concept titles (Inside LLM, RAG, MCP Agents, Vector Embeddings). |
| [`src/labs/EmbeddingSpace.tsx`](src/labs/EmbeddingSpace.tsx) | Real Three.js 3D Vector Space visualization (clusters, cosine similarity, dimensions). |
| [`src/labs/Attention.tsx`](src/labs/Attention.tsx) | Multi-Head Attention query/key/value weight matrix and heatmap. |
| [`src/labs/RagPipeline.tsx`](src/labs/RagPipeline.tsx) | Document chunking slider, embedding generation, and top-k retrieval stages. |
| [`src/labs/AgentLoop.tsx`](src/labs/AgentLoop.tsx) | Thought ➜ Tool Call ➜ Observation ➜ Response cycle. |
| [`src/pages/Review.tsx`](src/pages/Review.tsx) | Spaced-repetition flashcards with flip animations. |
| [`src/pages/Plan.tsx`](src/pages/Plan.tsx) | The 20-min weekday / 2-hour weekend schedule planner. |
| [`src/pages/Import.tsx`](src/pages/Import.tsx) | Custom PDF/Markdown/JSON syllabus importer. |

---

## ⏱️ 60-Second Scene-by-Scene Storyboard (1800 Frames @ 30fps)

### Scene 1: The Problem & The Provocative Hook (0:00 – 0:08 | 8s)
- **Visuals:** Dark obsidian canvas (`#07070d`). A wall of repetitive code boilerplate scrolls and flickers red. Bold headline appears: *"LLMs ALREADY WRITE SYNTAX. WHY ARE YOU STILL MEMORIZING IT?"*
- **Action:** A neon laser cuts across the screen, dissolving the code into a glowing violet-cyan prism. Punchline: *"UPGRADE YOUR ARCHITECTURAL INTUITION."*
- **Sound:** Ambient hum rising into a sharp sub-bass drop at 0:04.

### Scene 2: The 16-Week Curriculum Architecture (0:08 – 0:20 | 12s)
- **Visuals:** A full interactive roadmap UI expands into view, showing the 4 core pillars with real lesson chips:
  1. **Foundations (Weeks 1–4):** Transformer internals, tokenizer byte-pairs, prompt engineering.
  2. **Context & Retrieval (Weeks 5–8):** Production RAG, hybrid search, reranking, safety evals.
  3. **Agents & Vibe-Coding (Weeks 9–12):** MCP tools, autonomous agent loops, shipping AI products.
  4. **Full-Stack & Design (Weeks 13–16):** React 19, Supabase schema, DevOps security, design vocabulary.
- **Action:** Camera smoothly pans through the roadmap timeline as progress badges illuminate.
- **Sound:** 124 BPM tech groove begins with punchy kick drum and synchronized UI clicks.

### Scene 3: The 12 Interactive Visual Labs in Action (0:20 – 0:38 | 18s)
*This is the centerpiece of the 1-minute video.*
- **Sub-scene A (3D Vector Space):** A live 3D coordinate cluster of high-dimensional embeddings rotating in space. A cursor drags the cosine similarity slider: points light up cyan and violet.
- **Sub-scene B (Attention Heatmap):** Matrix tokens light up demonstrating how GPT connects *"attention"* to context.
- **Sub-scene C (RAG Retrieval Flow):** Shows a document splitting into semantic chunks, vectorizing, and answering a prompt in real-time.
- **Sub-scene D (Autonomous Agent Loop):** Step-by-step telemetry visualizing: `THOUGHT` ➜ `TOOL CALL` ➜ `OBSERVATION`.
- **Sound:** Fast rhythmic percussion, dynamic synth arpeggios, and crisp UI audio clicks on each slider move.

### Scene 4: Daily Learning Engine & Flashcards (0:38 – 0:50 | 12s)
- **Visuals:** Split screen showing how real engineers use the product daily:
  - **Left:** The Habit System — *"20 minutes on weekdays (1 concept) · 2 hours on weekends (deep labs)"*.
  - **Right:** Spaced repetition flashcards with a card flipping from *"What is Cosine Distance?"* to the formula and visual diagram.
  - **Bottom Banner:** Custom Knowledge Importer (dragging in a PDF textbook or markdown notes to auto-generate quizzes).
- **Sound:** Satisfying card flip swoosh, high-tech chimes for completed streak milestones.

### Scene 5: 100% Offline Freedom & Native Mobile (0:50 – 0:55 | 5s)
- **Visuals:** Mobile device mockup running the Capacitor Android build side-by-side with desktop PWA.
- **Feature highlights:** Airplane mode icon toggled ON ➜ *"100% Offline Persistence (IndexedDB). No cloud lock-in. Study anywhere."*
- **Sound:** Crisp switch click, warm synth pads.

### Scene 6: Outro Brand Lockup & Call to Action (0:55 – 1:00 | 5s)
- **Visuals:** Central glowing hero lockup:
  - **Upgrade Myself**
  - *"Fluent in AI. Fluent in code."*
  - Badge row: `16 WEEKS · 12 VISUAL LABS · OFFLINE PWA & ANDROID`
  - Call to action: *"Open the studio · Upgrade your engineering stack"*
- **Sound:** Full musical swell resolving into a warm, resonant final chord with smooth fade to black.

---

## ⚙️ Hyperframes Render Instructions for Jules

1. **Composition Directory:** Write the composition to `brag-output/composition-60s/`.
2. **Quality Settings:** Use maximum delivery quality:
   ```bash
   cd brag-output/composition-60s
   npx -y hyperframes check
   npx -y hyperframes render --quality delivery --output ../upgrade-myself-overview-60s.mp4
   ```
3. **Poster Extraction:**
   ```bash
   ffmpeg -y -ss 24.0 -i ../upgrade-myself-overview-60s.mp4 -frames:v 1 -q:v 2 ../upgrade-myself-overview-60s.jpg
   ```
4. **Resolution:** 1920×1080 (Landscape 16:9).
