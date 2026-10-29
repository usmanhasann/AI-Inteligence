# Week 5: Context Engineering

## Context Engineering {#context-engineering}
<!-- emoji: 🧩 | minutes: 9 | related: context-window, context-layers, token-budgeting -->

**TL;DR:** Context engineering is deciding, for every model call, exactly which instructions, data, tools and history go into the context window — and what to leave out.

### Explain
A model only knows what is in its context window right now. It has no hidden memory of your project. So the quality of an answer depends less on clever wording and more on **what you put in front of the model**.

Prompt engineering asks, "How do I phrase this?" Context engineering asks, "What does the model need to see to succeed — and nothing more?"

For each call you are curating:
- **Instructions** — the rules and goals
- **Knowledge** — documents, code files, search results
- **Tools** — which functions it may call, and their descriptions
- **History** — earlier turns, trimmed or summarised
- **State** — notes, plans, results from previous steps

Too little context and the model guesses. Too much and it gets distracted, slow and expensive. The skill is selecting the smallest set of high-signal information.

### Analogy
Briefing a new contractor. You don't hand them every document the company owns, and you don't say "just build it". You give them the brief, the three relevant files, and the rules — the right folder on the desk.

### Why it matters
Most "the AI got dumb" moments in long coding sessions are context problems, not model problems. When an agent forgets a rule or hallucinates a file, the fix is usually "put the right thing in context", not "write a longer prompt".

### Example
Bad: pasting the whole repo and saying "fix the login bug".

Better context for the same task:
```
Goal: fix login redirect loop
Relevant files: auth/middleware.ts, pages/login.tsx
Error log: (last 20 lines only)
Rule: don't change the session cookie name
```
Four small, high-signal pieces beat 50,000 tokens of noise.

### Takeaways
- The model only sees what's in its window; curate it on purpose.
- Aim for the smallest set of high-signal tokens, not the largest.
- Instructions, knowledge, tools, history and state are the five things you manage.

### Glossary
- **Prompt engineering** — crafting the wording of instructions to get better outputs.
- **Signal vs noise** — useful information versus irrelevant tokens that dilute attention.
- **Working set** — the files and facts currently relevant to the task at hand.

### Quiz
**Q:** An agent keeps ignoring a project rule in a long session. What is the best first fix?
- [ ] Switch to a bigger model immediately
- [ ] Repeat the rule ten times in capitals
- [x] Check whether the rule is still present and prominent in the current context
- [ ] Restart the computer
*Why:* Rules fall out of context or get buried; making sure the rule is actually in the window is cheaper and more reliable than swapping models.

**Q:** Which description best fits context engineering?
- [x] Selecting what information the model sees on each call
- [ ] Training a model on your own data
- [ ] Writing shorter sentences in prompts
- [ ] Increasing the model's temperature
*Why:* It's about curating inputs (instructions, data, tools, history), not changing the model or its sampling.

## Context Rot {#context-rot}
<!-- emoji: 🥀 | minutes: 8 | related: context-window, compaction-summarization, long-context-vs-rag -->

**TL;DR:** Context rot is the drop in model quality as the window fills up with long, messy or irrelevant material — even when everything technically fits.

### Explain
A bigger window doesn't mean the model uses it equally well. As context grows, models tend to get less accurate and less focused. People call this **context rot**.

Common causes:
- **Lost in the middle** — models attend best to the start and the end of the context; facts buried in the middle are recalled less reliably.
- **Distraction** — irrelevant text (old errors, dead-end attempts) pulls the model toward wrong answers.
- **Contradiction** — an early instruction and a later one disagree, and the model blends them.
- **Poisoning** — one wrong "fact" gets repeated and then treated as truth.

The effect is gradual: nothing breaks, the answers just get sloppier. Symptoms are the model repeating itself, forgetting earlier decisions, or confidently re-introducing a bug you already fixed.

### Analogy
A desk piled with every paper you've touched this week. The one invoice you need is technically on the desk, but you'll find it slower — and might grab the wrong one.

### Why it matters
In a long vibe-coding session, quality slowly decays. Knowing about rot tells you when to start a fresh chat, summarise, or reset — instead of arguing with a confused assistant.

### Example
Signs you should start fresh:
```
- "Fixed!" … the same bug returns two messages later
- The agent re-proposes an approach you rejected 30 turns ago
- Responses ignore a rule from the top of the chat
```
Fix: ask for a 10-line summary of decisions, open a new session, paste the summary plus the relevant files.

### Takeaways
- Quality can degrade as context grows, even below the window limit.
- Information in the middle of a long context is recalled less reliably.
- Reset or compact when a session gets long, repetitive or contradictory.

### Glossary
- **Lost in the middle** — the tendency to under-use information placed in the middle of long input.
- **Context distraction** — irrelevant content steering the model off-task.
- **Context poisoning** — an incorrect statement in context that keeps being reused as fact.

### Quiz
**Q:** Why can a 200k-token window still give worse answers when it's nearly full?
- [ ] The model runs out of electricity
- [x] Attention gets diluted by long, noisy context, so quality degrades
- [ ] Tokens expire after 100 messages
- [ ] Long contexts are always blocked by safety filters
*Why:* Fitting in the window and being used well are different things; noise and distance reduce effective recall.

**Q:** Where in a long prompt are facts most likely to be under-used?
- [ ] The very beginning
- [ ] The very end
- [x] The middle
- [ ] Anywhere equally
*Why:* The "lost in the middle" effect favours the start and end of the input.

## Compaction and Summarization {#compaction-summarization}
<!-- emoji: 🗜️ | minutes: 9 | related: context-rot, memory-short-long, plan-build-review -->

**TL;DR:** Compaction shrinks a long conversation into a short summary of what matters so work can continue without carrying every old token.

### Explain
When history grows too big, you have three choices: drop it, keep it, or **compress** it. Compaction is the third: the model (or a rule) rewrites the conversation into a compact form and replaces the original.

Typical techniques:
- **Summarising** — "Here's what we decided, what's done, what's left."
- **Trimming** — delete old tool outputs (a 5,000-line log no longer needs to sit there).
- **Scratchpads / notes files** — the agent writes key facts to a file like `NOTES.md` or `progress.md`, then reads it back later instead of remembering everything.
- **Sliding window** — keep only the most recent N turns.

What a good summary keeps: goals, decisions and the reasons for them, file names, open problems, constraints. What it drops: failed attempts, chit-chat, raw dumps.

Risk: summaries are lossy. A detail left out is gone for good, so keep critical rules in files, not only in chat.

### Analogy
Meeting minutes. Nobody replays the whole three-hour meeting; the minutes capture decisions and action items.

### Why it matters
Tools like Claude Code have a "compact" step; now you know it's summarising to free space. You can also guide it: "When compacting, keep the list of modified files and the test commands."

### Example
Prompt you can paste near the end of a long session:
```
Summarise this session for a fresh start. Include:
1. Goal  2. Decisions + why  3. Files changed
4. What's still broken  5. Next 3 steps
Max 200 words.
```
Start a new chat with that summary plus the current files.

### Takeaways
- Compaction replaces long history with a shorter summary to free context.
- Notes files let an agent keep durable state outside the window.
- Summaries lose detail — store important rules and decisions in files.

### Glossary
- **Sliding window** — keeping only the latest part of the conversation.
- **Scratchpad** — a place (often a file) where the agent jots working notes.
- **Lossy compression** — shrinking that discards some information permanently.

### Quiz
**Q:** What is the main downside of summarising a long chat?
- [ ] It makes the model slower
- [x] Details not in the summary are lost
- [ ] It always costs more tokens
- [ ] It deletes your files
*Why:* Summaries are lossy; anything omitted can't be recovered from the new context.

**Q:** Why have an agent write progress to a notes file?
- [ ] Files make the model smarter
- [ ] It is required by the API
- [x] The notes persist outside the context window and can be re-read later
- [ ] It hides the work from you
*Why:* External notes survive resets and compaction, giving the agent durable memory.

## Prompt Caching {#prompt-caching}
<!-- emoji: ⚡ | minutes: 10 | related: token-pricing, context-layers, latency-ttft -->

**TL;DR:** Prompt caching lets the provider reuse its work on an unchanged beginning of your prompt, making repeated calls faster and much cheaper.

### Explain
Inside a transformer, processing each input token produces internal data called the **KV cache** (key/value tensors from the attention layers). Computing it for a long prompt is the expensive part.

If your next request starts with *exactly the same tokens*, the provider can reuse the stored KV cache for that shared **prefix** and only compute the new tail. That's **prompt caching**. Cached input tokens are typically billed at a steep discount and respond faster.

The catch: it's **prefix-based**. Change one token early and everything after it misses the cache. So order your prompt from most stable to most changing:

1. System instructions and tool definitions (rarely change)
2. Reference docs, project files
3. Conversation history
4. The new user message (always changes)

Caches also expire after a short time, often minutes, so they reward steady, back-to-back traffic.

### Analogy
Reading a long book and bookmarking page 200. Next time you start from the bookmark, not page one — but only if the first 200 pages haven't been rewritten.

### Why it matters
Agents re-send huge prompts every step. A stable prefix can cut cost and latency dramatically. Putting a timestamp or random ID at the top of your system prompt silently kills caching.

### Example
```
❌ System: "Today is 2026-10-21 14:03:11. You are a support bot…"
   (changes every call → prefix never matches)

✅ System: "You are a support bot…" (static, first)
   … docs …
   User: "Today is 2026-10-21. Question: …" (dynamic, last)
```

### Takeaways
- Providers cache the processed prefix of a prompt; hits are cheaper and faster.
- Put stable content first, changing content last.
- Editing anything early in the prompt invalidates the cache after it.

### Glossary
- **KV cache** — stored attention keys/values for already-processed tokens.
- **Prefix** — the unchanged beginning of a prompt shared between calls.
- **Cache hit / miss** — whether the stored prefix could be reused.
- **TTL** — how long a cache entry lives before expiring.

### Quiz
**Q:** Which change would most likely ruin prompt caching?
- [ ] Changing the final user message
- [x] Inserting the current timestamp at the very top of the system prompt
- [ ] Adding a new message at the end of history
- [ ] Asking a different question
*Why:* Caching matches from the start of the prompt, so an early change breaks the shared prefix.

**Q:** What does a cache hit save you?
- [ ] The need to send the prompt at all
- [x] Recomputing and (usually) paying full price for the repeated prefix
- [ ] The output tokens
- [ ] Your API key
*Why:* You still send the prompt, but the provider skips reprocessing the identical prefix and charges less.

## Long Context vs RAG {#long-context-vs-rag}
<!-- emoji: ⚖️ | minutes: 9 | related: rag-overview, context-rot, token-budgeting -->

**TL;DR:** Long context means putting everything in the prompt; RAG means retrieving only the relevant pieces first — each wins in different situations.

### Explain
Models now accept hundreds of thousands of tokens. So why bother with retrieval?

**Long context** ("just paste it all")
- Simple: no pipeline, no vector database
- Great for a single document, a small codebase, one-off analysis
- Costs tokens on every call, gets slower, and may suffer context rot

**RAG** (retrieve, then generate)
- Scales to millions of documents that could never fit
- Cheaper per query: only a few relevant chunks go in
- Can be kept fresh and can cite sources
- More moving parts, and bad retrieval can miss the answer

A practical rule: if the whole material fits comfortably (and you ask many questions of the same thing), try long context plus prompt caching first. If the knowledge is huge, changes often, or needs access control and citations, use RAG. Many real systems combine them: retrieve generously, then reason over a big window.

### Analogy
Long context is carrying the whole library to your desk. RAG is asking the librarian for the three right books.

### Why it matters
"Do I need a vector DB?" is a common vibe-coding question. Often the honest answer for a small project is "no — paste the docs and cache them".

### Example
| Situation | Pick |
|---|---|
| Q&A over one 80-page contract | Long context |
| Support bot over 40,000 help articles | RAG |
| Chat with your app's 30 source files | Long context (+ caching) |
| Company wiki updated daily, per-user permissions | RAG |

### Takeaways
- Long context is simplest for small, stable material.
- RAG scales, stays fresh, and cites sources, but adds complexity.
- Hybrid designs are common; start with the simplest that works.

### Glossary
- **Needle in a haystack** — a test where one fact is hidden in a huge input to check recall.
- **Retrieval** — finding the relevant pieces of information from a larger store.
- **Context stuffing** — loading as much material as possible into the prompt.

### Quiz
**Q:** Which scenario best suits RAG rather than long context?
- [ ] Summarising a single 5-page memo
- [ ] Reviewing one small script
- [x] Answering questions over millions of changing documents
- [ ] Rewriting a tweet
*Why:* Only RAG scales to collections that can't fit in the window and stay current.

**Q:** What is a real cost of "just paste everything"?
- [ ] The model refuses to answer
- [x] You pay for those tokens on each call and may hit context rot
- [ ] Your documents are deleted
- [ ] It disables tools
*Why:* Large prompts add cost, latency and potential quality loss each time they're sent.

## Token Budgeting {#token-budgeting}
<!-- emoji: 🧮 | minutes: 9 | lab: context-window | related: context-window, token, token-pricing -->

**TL;DR:** Token budgeting means planning how the context window and output limit are split between instructions, tools, history, documents and the answer.

### Explain
The context window is a shared budget. Everything competes for it:

- **System prompt + rules** — fixed cost every call
- **Tool definitions** — each tool's description and schema takes tokens (a dozen tools can be thousands)
- **Retrieved documents / files** — often the biggest slice
- **Conversation history** — grows every turn
- **The new message**
- **Output** — the reply must also fit, and **reasoning tokens** from thinking models count too

Window size is *input + output combined* (limits vary by provider). If history eats 95% of the space, the model has little room to answer and may be cut off mid-sentence.

Budgeting habits: reserve room for the answer, cap retrieved chunks, prune old tool outputs, load only the tools needed for this task, and monitor token counts rather than guessing.

### Analogy
A monthly salary. Rent (system prompt) is fixed, groceries (history) creep up, and if you spend everything before month-end, there's nothing left for emergencies (the answer).

### Why it matters
Cost, speed and quality all follow tokens. When a response gets truncated or an agent stalls, check the budget before blaming the model.

### Example
In the lab, drag the sliders for system prompt, tools, history and documents, then watch how much room remains for the reply. Try loading 30 tools and see how quickly "free" space shrinks.
```
Window 128k = system 2k + tools 6k + docs 40k + history 60k
→ 20k left for the answer + reasoning
```

### Takeaways
- Input and output share one window; reserve space for the answer.
- Tools, history and retrieved docs are the usual budget hogs.
- Measure token usage instead of guessing.

### Glossary
- **Max output tokens** — the cap on how long the reply can be.
- **Reasoning tokens** — hidden "thinking" tokens that also use budget and cost.
- **Truncation** — output or input cut off because the limit was hit.

### Quiz
**Q:** Why can a very long chat history cause truncated answers?
- [x] History uses window space, leaving less room for the reply
- [ ] The model gets bored
- [ ] History is always billed twice
- [ ] Truncation only happens offline
*Why:* Input and output share the window, so a full history squeezes out the answer.

**Q:** Which is a smart budgeting move for an agent with many tools?
- [ ] Load every tool on every call
- [ ] Remove the system prompt
- [x] Expose only the tools relevant to the current task
- [ ] Triple the temperature
*Why:* Each tool definition costs tokens, so trimming unused ones saves budget and reduces confusion.

## Short-Term vs Long-Term Memory {#memory-short-long}
<!-- emoji: 🧠 | minutes: 9 | related: compaction-summarization, agent-memory-state, vector-database -->

**TL;DR:** Short-term memory is what's inside the current context window; long-term memory is information stored outside and brought back when needed.

### Explain
Language models are stateless: each call starts blank except for what you send. "Memory" is something the application builds around the model.

**Short-term (working) memory**
- The current conversation and tool results inside the context window
- Vanishes when the session ends or the window overflows

**Long-term memory**
- Stored externally: a database, files, a vector store or a knowledge graph
- Retrieved and injected into context when relevant

Kinds of long-term memory you'll hear named:
- **Episodic** — what happened (past sessions, events)
- **Semantic** — facts and preferences ("user prefers TypeScript")
- **Procedural** — how to do things (rules, skills, saved workflows)

Writing memory is a design choice: when do you save, what do you save, and how do you stop stale or wrong memories from piling up?

### Analogy
Short-term is your whiteboard; long-term is your filing cabinet. You copy what matters onto the whiteboard when you need it.

### Why it matters
When a chat app "remembers" you, a memory store is injecting facts into each prompt — it isn't the model changing. Knowing this helps you control what's saved and spot privacy issues.

### Example
```
Saved memory: "Sam deploys on Vercel, uses Tailwind, hates default exports"
Next session → app retrieves it → adds to system prompt
→ model writes components with named exports
```
The model didn't learn anything; the app pasted a note.

### Takeaways
- Models have no memory between calls beyond what you send.
- Long-term memory lives outside the model and is retrieved on demand.
- Episodic, semantic and procedural are common memory types.

### Glossary
- **Stateless** — retaining nothing between separate requests.
- **Episodic memory** — records of past events or interactions.
- **Procedural memory** — saved instructions for how to perform tasks.

### Quiz
**Q:** An assistant "remembers" your preferences next week. What is most likely happening?
- [ ] The model's weights were retrained overnight
- [x] The app retrieves saved notes and adds them to the prompt
- [ ] The GPU kept your chat in RAM
- [ ] The model reads your mind
*Why:* Typical memory features store notes externally and inject them into context.

**Q:** Which is an example of semantic memory?
- [ ] A log of yesterday's conversation
- [x] The fact "user's timezone is IST"
- [ ] A step-by-step deploy checklist
- [ ] The current tool output
*Why:* Semantic memory holds facts and preferences; logs are episodic and checklists are procedural.

## Context Layers {#context-layers}
<!-- emoji: 🥞 | minutes: 8 | related: context-engineering, prompt-caching, system-prompt -->

**TL;DR:** A prompt is built from layers — rules, tools, knowledge, history, and the user's message — and each kind of content has a best place.

### Explain
Think of the context as a stack, from stable to volatile:

1. **System layer** — role, tone, hard rules, safety limits. Changes rarely.
2. **Tool layer** — function names, descriptions, schemas. Changes when capabilities change.
3. **Knowledge layer** — retrieved documents, code files, examples. Changes per task.
4. **History layer** — earlier messages and tool results. Grows every turn.
5. **Request layer** — the new user message. Different every time.

Placement rules of thumb:
- Permanent rules go in the system layer, not repeated in chat.
- Put big reference material *before* the question, and restate the task at the end.
- Label sections clearly (`<docs>…</docs>`), so the model can tell data from instructions.
- Untrusted text (web pages, user uploads) belongs in the data layer — never mixed with instructions.

This ordering also helps prompt caching, since stable layers come first.

### Analogy
A sandwich shop order: the fixed menu rules at the top, today's specials, the ongoing tab, and finally what you're ordering right now.

### Why it matters
When you write a rules file for your AI coding agent, you're writing the system layer. Putting rules there instead of re-explaining each time makes behaviour consistent and cheaper.

### Example
```
<system>You are a code reviewer. Never suggest force-push.</system>
<tools>…read_file, run_tests…</tools>
<docs>CONTRIBUTING.md …</docs>
<history>…</history>
<request>Review the diff below.</request>
```

### Takeaways
- Order content from most stable to most changing.
- Keep instructions separate from data, especially untrusted data.
- Label sections so the model can't confuse rules with reference text.

### Glossary
- **System prompt** — top-level instructions that set the model's role and rules.
- **Delimiter** — markers like XML tags that separate parts of a prompt.
- **Untrusted input** — text from outside sources that may contain hostile instructions.

### Quiz
**Q:** Where should a permanent "never delete files" rule go?
- [ ] At the end of each user message
- [x] In the system layer
- [ ] In a tool output
- [ ] In the middle of history
*Why:* Permanent rules belong in the stable system layer so they apply every call without repeating.

**Q:** Why wrap retrieved documents in labelled tags?
- [ ] It makes tokens cheaper
- [ ] Models require XML
- [x] It helps the model separate reference data from instructions
- [ ] It encrypts them
*Why:* Clear boundaries reduce confusion and make prompt-injection from documents less effective.
