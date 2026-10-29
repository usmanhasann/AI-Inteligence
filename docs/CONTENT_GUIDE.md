# Content guide — how course concepts are written

Built-in course = `src/content/week-NN.md` (16 files). User imports use the **same Markdown format**.
Validate with: `node --experimental-strip-types scripts/validate-content.ts week-05.md`

## Audience
Sam: a working professional who builds software by "vibe coding" (directing AI assistants), so does NOT need to memorise syntax.
Needs to **know the terms, what each thing does, why it exists, and how to talk about it** — across AI, full-stack and design/UX.
Wants to sound fluent in a meeting and to give an AI agent precise instructions.

## Voice
Clear, vivid, friendly, zero fluff. Second person ("you"). Concrete before abstract. Explain jargon the first time it appears.
No hype, no filler like "In today's fast-paced world". Accurate as of late 2026; don't quote model version numbers, prices or benchmark scores that age — speak in principles, orders of magnitude and "typically".
Product names may be used as examples (Cursor, Claude Code, Postgres, Vercel…) but the concept must stand without them.

## Per-concept template (all sections required)
```
## Title {#id-from-curriculum}
<!-- emoji: 🔤 | minutes: 9 | lab: tokenizer | related: id1, id2 -->      (lab is optional; related = 2-4 ids that exist in curriculum.ts)

**TL;DR:** one plain sentence, <= 28 words.

### Explain          110–190 words. Markdown: short paragraphs, a bullet list or small table is welcome. Define the mechanism, not just the label.
### Analogy          1–2 sentences, a genuinely helpful everyday comparison.
### Why it matters  1–3 sentences for a vibe coder: what you'll hear an AI/agent say, what to do/ask, what mistake it prevents.
### Example         A concrete scenario, a tiny table, a prompt you could paste, or a short code/JSON/CLI snippet in a fenced block.
### Takeaways       3 bullets, each a complete useful fact.
### Glossary        2–4 neighbouring terms:  - **Term** — definition (<= 22 words)
### Quiz            2 questions. Format exactly:
**Q:** question text
- [ ] wrong
- [x] right      <- vary the position of the correct option across questions
- [ ] wrong
- [ ] wrong
*Why:* one or two sentences explaining the right answer (and why the tempting wrong one is wrong).
```
- Use exactly the heading names above (H3). H1 = week title (already present at top of file). H2 per concept, in the order given in `src/content/curriculum.ts`.
- `minutes`: 6–14 (reading + quiz). `emoji`: one emoji that represents the concept (distinct within the week).
- Allowed Markdown: bold, italics, `inline code`, lists, tables, fenced code, blockquote. No images, no raw HTML (except the one meta comment).
- Quiz: test understanding, not trivia. Distractors must be plausible. 3–4 options.
- Lab concepts: when `lab:` is set, the Example section should say what to try in the interactive lab ("Drag the slider and notice…").

## Labs available (set `lab:` only on these concepts)
token→tokenizer · context-window→context-window · sampling-temperature→sampling · embedding→embedding-space · similarity-search→embedding-space ·
attention-transformer→attention · rag-overview→rag-pipeline · chunking→chunking · what-is-agent→agent-loop · token-pricing→cost-calculator ·
token-budgeting→context-window · client-server-http→request-flow · color-contrast-a11y→contrast · responsive-layout→flexbox
