# Upgrade Myself — AI Learning Studio

A 16-week (4-month) learning app for the vocabulary of **AI, vibe-coding, full-stack and design/UX**.
128 concepts · 12 interactive labs · weekly planner · saved gallery · spaced-repetition review · import your own PDF / JSON / Markdown.

One codebase → **web** (Netlify / Vercel, installable PWA, works offline) and **Android** (Capacitor).

## Run it

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # production build → dist/
npm run validate     # check every concept in src/content/week-*.md
```

## What's inside

| Area | Where |
|---|---|
| Course map (months → weeks → concept ids) | `src/content/curriculum.ts` |
| Course text (128 concepts) | `src/content/week-01.md … week-16.md` |
| Interactive labs (GSAP + Three.js) | `src/labs/` |
| Pages | `src/pages/` (Home, Roadmap, Week, Concept, Plan, Gallery, Review, Glossary, Import, Settings) |
| State (IndexedDB, offline) | `src/lib/store.ts` |
| Importers (MD / JSON / PDF) | `src/lib/importers/`, `src/lib/mdPack.ts` |

Stack: Vite · React 19 · TypeScript · Tailwind 4 · GSAP (+ScrollTrigger, Flip) · Three.js · Zustand · Capacitor · vite-plugin-pwa.

## Adding / updating course material

**In the app:** *Import* page → drop a `.pdf`, `.json`, `.md` or `.txt` (or paste text). You get a review step, then:
- concepts with a **new id** are added (into a new week under "Your Library", or any existing week you pick);
- concepts whose **id already exists** are **updated in place** (non-empty fields override; the rest is kept);
- removing the imported pack reverts built-ins to the original text. Progress is never lost.

The Import page has a ready-made **AI prompt** — paste it into any chat, get back a valid pack, drop it in.

**In the repo:** edit `src/content/week-NN.md` (format in `docs/CONTENT_GUIDE.md`) and run `npm run validate`.

Markdown format (also what imports use):

```md
# Week 17: Security Deep Dive          ← optional: starts a week
## Passkeys {#passkeys}                ← one concept (id optional)
<!-- emoji: 🗝️ | minutes: 8 | lab: tokenizer | related: some-id -->
**TL;DR:** one sentence.
### Explain / Analogy / Why it matters / Example / Takeaways / Glossary / Quiz
```

PDFs: headings are detected by font size; scanned (image-only) PDFs have no text and can't be read — OCR them first.

## Deploy the web app

- **Netlify:** connect the repo (config in `netlify.toml`), or `npx netlify deploy --prod --dir=dist` after `npm run build`.
- **Vercel:** import the repo (config in `vercel.json`), or `npx vercel --prod`.

It uses hash routing, so it works on any static host without rewrite rules.

## Build the Android app

Needs Android Studio (it bundles the JDK and SDK tooling).

```bash
npm run cap:sync          # build web + copy into android/
npm run android:open      # opens Android Studio → press Run ▶ (emulator or phone)
npm run android:apk       # or CLI: android/app/build/outputs/apk/debug/app-debug.apk
```

App id `com.upgrademyself.app` (change in `capacitor.config.ts`). Icons/splash are generated from `public/icon.svg`:
`npm run icons && npx capacitor-assets generate --android`.

## Your data

Everything (progress, notes, saved items, plan, imported packs) is stored on-device in IndexedDB.
Settings → **Export backup** / **Restore backup** moves it between phone and laptop.

## Notes

- Lab numbers (token IDs, attention weights, prices, latencies) are **illustrative teaching models**, not real model output.
- Pricing examples in the cost lab are round numbers, not any provider's current rates.
