# Week 11: Vibe Coding Toolchain

## Vibe Coding {#vibe-coding}
<!-- emoji: ⚡ | minutes: 9 | related: coding-agents-ides, spec-driven-development, reviewing-ai-code -->

**TL;DR:** Vibe coding is building software by describing what you want to an AI and steering the result, rather than typing code yourself.

### Explain
In **vibe coding** you work at the level of intent: "add a login page with Google sign-in," then react to what appears — run it, look at it, say "make the button bigger" or "that error means X, fix it." The AI writes most of the code.

It's genuinely powerful: prototypes in hours, non-experts shipping real tools, experts moving faster on boilerplate.

It also has limits. AI code can be subtly wrong, insecure, duplicated or impossible to maintain. If you accept everything without understanding it, small mistakes pile up until nobody — including the AI — can fix the project.

So the real skill set shifts from memorising syntax to:
- **Specs** — saying precisely what you want and what "done" means.
- **Taste** — recognising good UX, design and architecture.
- **Verification** — testing, reading diffs, noticing when something is off.
- **Vocabulary** — knowing the terms so your instructions are exact.

### Analogy
You're a film director. You don't operate every camera, but you must know what a good shot looks like and be able to say exactly what to change.

### Why it matters
Fluency in terms (this entire course) is your leverage: "add rate limiting to the POST route" gets a much better result than "make it not break."

### Example
Vague vs steered prompt:

```
Vague:   make a todo app
Steered: Build a todo app in React + TypeScript. Tasks have title, done,
         due date. Persist in localStorage. Mobile-first. Show an empty
         state. Keep components small. Then explain how to run it.
```

### Takeaways
- Vibe coding means directing AI with intent instead of writing code by hand.
- Its limits are correctness, security and maintainability.
- Specs, taste, verification and vocabulary are the human skills that matter.

### Glossary
- **Prompt-to-app** — Generating a working app mostly from natural-language descriptions.
- **Tech debt** — Accumulated shortcuts that make future changes harder and costlier.
- **Scaffolding** — The initial generated structure and boilerplate of a project.

### Quiz
**Q:** What matters most when vibe coding, rather than memorising syntax?
- [ ] Typing speed
- [x] Clear specs, good taste and verifying the result
- [ ] Knowing every library function
- [ ] Choosing the longest prompt
*Why:* Directing and checking the AI's work needs clarity, judgement and testing, not recall of syntax.

**Q:** What is the main risk of accepting AI code without understanding it?
- [ ] The code will always fail to compile
- [x] Hidden bugs and insecurity pile up until the project is hard to fix
- [ ] It becomes too fast
- [ ] The AI refuses to continue
*Why:* Unreviewed mistakes compound, creating a codebase no one can safely change.

## Coding Agents & AI IDEs {#coding-agents-ides}
<!-- emoji: 🛠️ | minutes: 9 | related: vibe-coding, instruction-files, plan-build-review -->

**TL;DR:** AI coding tools come in four flavours — chat assistants, AI-enhanced IDEs, command-line agents and app builders — trading control for convenience.

### Explain
Knowing the categories helps you pick the right tool:

- **Chat assistants** — you paste code and questions into a chat window. Great for learning and small snippets; no direct access to your files.
- **AI IDEs and editor assistants** (Cursor, GitHub Copilot, Windsurf-style tools) — an editor with autocomplete, inline edits and an agent panel that sees your project. Best when you want to read and steer code closely.
- **CLI / terminal agents** (Claude Code and similar) — an agent that works in your repo, reading files, running commands and tests, making multi-file changes. Strong for larger tasks.
- **App builders** (Lovable, Bolt, v0-style) — describe an app, get a running, often hosted result. Fastest for prototypes; least control over structure.

Key differences: how much of your codebase the tool *sees*, how much it can *do* without asking, and how easy it is to *inspect and undo* changes.

Many people combine them: an app builder for the first prototype, then an IDE or CLI agent once it needs real engineering.

### Analogy
Like vehicles: a chat assistant is a taxi you direct by phone, an IDE a car you drive with a navigator, a CLI agent a chauffeur, an app builder a rental that's already packed for the trip.

### Why it matters
Choosing the wrong tool wastes hours: app builders for a mature codebase, or chat for multi-file refactors. Match the tool to the size and maturity of the project.

### Example
A pragmatic workflow:

```
1. Prototype the idea in an app builder (1 evening)
2. Export to GitHub, open in an AI IDE
3. Use a CLI agent for big refactors and test-writing
4. Use chat to learn unfamiliar concepts
```

### Takeaways
- Four categories: chat, AI IDE, CLI agent, app builder.
- They differ in project visibility, autonomy and control.
- Combine tools across a project's lifecycle.

### Glossary
- **Autocomplete** — Inline suggestions that finish the line or block you're typing.
- **Agent mode** — A mode where the assistant plans and edits multiple files itself.
- **Repo** — Short for repository: the project folder tracked by git.

### Quiz
**Q:** You need a fast clickable prototype of an idea by tonight. Which category fits best?
- [ ] A chat assistant only
- [ ] A command-line agent in a large legacy repo
- [x] An app builder
- [ ] Autocomplete in a text editor
*Why:* App builders generate and host a working app from a description in minutes.

**Q:** Which factor best distinguishes these tools?
- [ ] The colour theme
- [x] How much of your project they see and how much they can do without asking
- [ ] The programming language they were written in
- [ ] Whether they have a logo
*Why:* Visibility into your code and level of autonomy shape the workflow and the risk.

## Spec-Driven Development {#spec-driven-development}
<!-- emoji: 📝 | minutes: 9 | related: plan-build-review, vibe-coding, instruction-files -->

**TL;DR:** Write a short spec — what, for whom, and how you'll know it works — before the AI writes code, so you steer with intent instead of guesswork.

### Explain
AI amplifies whatever you give it. Fuzzy input yields confident, wrong output. **Spec-driven development** fixes this by writing the intent first.

A useful spec (a mini **PRD**, product requirements document) covers:
- **Problem & user** — who is it for and what pain does it solve?
- **Scope** — what's included, and explicitly what's *not*.
- **Behaviour** — user stories or flows ("As a member, I can reset my password by email").
- **Acceptance criteria** — checkable statements that define "done."
- **Constraints** — stack, performance, security, design rules.
- **Open questions** — things to decide.

Then use the spec as the contract: ask the AI to critique it, produce a plan from it, build in small steps and verify each step against the acceptance criteria.

Specs also make later changes safer: when behaviour is written down, you can tell a bug from a deliberate choice.

### Analogy
An architect's blueprint before the builders arrive. Without it, you get a house — just maybe not yours.

### Why it matters
Most disappointing AI builds trace back to unstated requirements. Ten minutes on a spec saves hours of rework and keeps the AI from inventing features.

### Example
Acceptance criteria written as checkable statements:

```md
## Password reset
- Given a registered email, when I request a reset, an email with a one-time link arrives within 1 minute.
- The link expires after 30 minutes and works once.
- Unknown emails show the same message (no account leaks).
- Out of scope: SMS reset, social login.
```

### Takeaways
- Write what, who, scope, behaviour and acceptance criteria before building.
- Acceptance criteria turn "done" into something you can test.
- Include what's out of scope so the AI doesn't add extras.

### Glossary
- **PRD** — Product requirements document describing what to build and why.
- **User story** — A short description of a feature from the user's point of view.
- **Acceptance criteria** — Specific conditions that must be true for the work to count as done.
- **Scope creep** — Uncontrolled growth of features beyond the original plan.

### Quiz
**Q:** What is the main purpose of acceptance criteria?
- [ ] To impress stakeholders
- [ ] To list all possible features
- [x] To define in checkable terms when the work is done
- [ ] To choose the programming language
*Why:* They make "done" testable, so both you and the AI can verify the result.

**Q:** Why state what is out of scope in a spec?
- [x] It stops the AI and the team from adding unrequested features
- [ ] It shortens the code
- [ ] It makes the app faster
- [ ] It removes the need for testing
*Why:* Explicit exclusions prevent scope creep and unwanted AI embellishments.

## Instruction Files {#instruction-files}
<!-- emoji: 📋 | minutes: 8 | related: coding-agents-ides, skills-plugins, context-layers -->

**TL;DR:** Instruction files like CLAUDE.md or AGENTS.md hold standing project rules that your coding agent reads at the start of every session.

### Explain
A coding agent starts each session knowing nothing about your project. Instruction files fix that by giving it **persistent context**: a plain Markdown file in your repo, loaded automatically.

Common names: `CLAUDE.md`, `AGENTS.md`, or "rules" files for IDE tools (e.g. `.cursor/rules`). What goes inside:
- **How to run things** — install, dev, test, build commands.
- **Architecture notes** — folder layout, main patterns.
- **Conventions** — naming, styling, error handling, "use Tailwind, not CSS modules."
- **Guardrails** — "never edit `/generated`," "ask before adding dependencies."
- **Gotchas** — things that always trip people up.

Keep them **short and specific**. Every line costs tokens on every session and too many rules dilute the important ones. Update the file when the agent repeats a mistake — it's a living document.

Files can also be layered: global preferences, repo-level rules, and folder-level notes for specific areas.

### Analogy
An onboarding doc for a new hire who has total amnesia every morning. Without it you explain the same things daily.

### Why it matters
If you keep correcting your agent about the same thing, put that correction into the instruction file once. It's the cheapest quality upgrade available.

### Example
A compact CLAUDE.md:

```md
# Project: Upgrade Myself
- Run: `npm run dev` · Test: `npm test` · Typecheck: `npm run typecheck`
- Stack: React + TypeScript + Tailwind. Components in src/components.
- Prefer small functions; no new dependencies without asking.
- Never edit src/content/*.md structure; run `npm run validate` after changes.
```

### Takeaways
- Instruction files give agents persistent, project-specific context.
- Keep them concise: commands, conventions, guardrails, gotchas.
- Update them whenever the agent repeats a mistake.

### Glossary
- **Rules file** — An IDE-specific instruction file that guides the AI assistant.
- **Persistent context** — Information loaded automatically into every session.
- **Convention** — An agreed way of doing something in a codebase.

### Quiz
**Q:** What belongs in an instruction file?
- [ ] The entire source code
- [x] Run commands, conventions, guardrails and gotchas
- [ ] A copy of the internet
- [ ] Your passwords
*Why:* Short, high-value project knowledge. Never store secrets in them.

**Q:** Why should instruction files stay short?
- [ ] Long files cannot be saved
- [ ] The model dislikes Markdown
- [x] They consume context tokens every session, and too many rules dilute the important ones
- [ ] Short files run faster tests
*Why:* They're loaded each session, so every line has a token cost and competes for attention.

## Plan → Build → Review {#plan-build-review}
<!-- emoji: 🔄 | minutes: 9 | related: planning, git-for-vibe-coders, reviewing-ai-code -->

**TL;DR:** Work in small loops — agree a plan, let the AI build one slice, verify it, checkpoint — instead of asking for the whole app at once.

### Explain
Big-bang prompts ("build my entire SaaS") produce big, tangled results you can't evaluate. A reliable loop:

1. **Plan** — use plan mode or ask for a step list; fix misunderstandings *before* code exists.
2. **Build one slice** — a single feature or screen. Small enough to review in minutes.
3. **Verify** — run the app, click through, run tests, read the diff.
4. **Checkpoint** — commit when it works.
5. **Repeat** — next slice, with the working code as the foundation.

Why small steps win:
- Errors are caught while the cause is still obvious.
- The context stays focused, so the AI stays accurate.
- You always have a working version to return to.

When the AI goes down a wrong path, don't argue endlessly in the same thread — revert to the last checkpoint and restate the task with what you learned. Starting fresh is often faster than untangling a confused session.

### Analogy
Building with LEGO instructions: one bag at a time, checking each section matches the picture before moving on.

### Why it matters
Most vibe-coding disasters come from skipping verification between big jumps. The loop trades a little speed per step for far fewer dead ends.

### Example
Prompt sequence for a notes app:

```
1. "Plan the notes app in 6 steps. Don't write code yet."
2. "Do step 1 only: project setup + empty notes list page."
3. (run it, confirm it works, commit)
4. "Step 2: add create-note form with validation."
```

### Takeaways
- Plan first, then build, verify and checkpoint one small slice at a time.
- Small steps keep errors local and context focused.
- When stuck, revert and re-prompt rather than piling on fixes.

### Glossary
- **Slice** — A small, end-to-end piece of functionality.
- **Checkpoint** — A saved working state, usually a git commit.
- **Big-bang prompt** — Asking for a whole system in a single request.

### Quiz
**Q:** What should you do after the AI finishes a small feature slice?
- [ ] Immediately request the next five features
- [x] Verify it works and commit a checkpoint
- [ ] Delete the plan
- [ ] Switch to another tool
*Why:* Verification and checkpoints keep a known-good base for the next step.

**Q:** The AI has gone down the wrong path for 20 messages. What's usually best?
- [ ] Keep arguing in the same thread
- [x] Revert to the last checkpoint and re-prompt with clearer instructions
- [ ] Ignore the errors
- [ ] Ask for a larger model immediately
*Why:* A confused context compounds errors; a clean restart with lessons learned is usually faster.

## Git for Vibe Coders {#git-for-vibe-coders}
<!-- emoji: 🌿 | minutes: 10 | related: plan-build-review, reviewing-ai-code, ci-cd -->

**TL;DR:** Git records snapshots of your project so you can see exactly what the AI changed and undo anything that goes wrong.

### Explain
Git is a **version control** system — your project's time machine. The vocabulary you'll hear constantly:

- **Repository (repo)** — the project plus its full history.
- **Commit** — a saved snapshot with a message ("Add login form").
- **Diff** — the exact lines added and removed between two states. Reading diffs is how you review AI work.
- **Branch** — a parallel line of work, so experiments don't touch the main code.
- **Merge / pull request (PR)** — combining a branch back into main, usually after review.
- **Revert / reset / restore** — undoing changes.
- **Remote (GitHub, GitLab)** — an online copy for backup and collaboration.

For vibe coding, git is your safety net: commit before each AI task, review the diff after, and revert if it broke things. A branch per experiment lets you try bold ideas with zero risk.

Never commit secrets (API keys, `.env` files) — once pushed, treat them as leaked.

### Analogy
Video-game save points. You save before the boss fight; if you lose, you reload instead of replaying the whole game.

### Why it matters
Without commits, a bad AI session can destroy hours of work with no way back. With them, mistakes cost seconds.

### Example
The everyday rhythm:

```
git switch -c add-dark-mode     # new branch for the experiment
# ...AI makes changes...
git diff                        # review what changed
git add -A && git commit -m "Add dark mode toggle"
git restore src/App.tsx         # discard changes to one file
```

### Takeaways
- Commit before and after AI tasks — your undo history.
- Read the diff; it's the truth about what the AI did.
- Use branches for experiments and keep secrets out of commits.

### Glossary
- **Staging** — Choosing which changes will go into the next commit.
- **Main branch** — The primary, stable line of the project's code.
- **.gitignore** — A file listing things git should never track, like `.env`.
- **Merge conflict** — When two changes touch the same lines and git needs a human decision.

### Quiz
**Q:** What does a diff show?
- [ ] The project's total file size
- [x] The lines added and removed between two versions
- [ ] Who is online
- [ ] Which tests passed
*Why:* A diff is the precise change set — the main tool for reviewing AI edits.

**Q:** Before giving an agent a large refactor, what's the smartest first move?
- [ ] Turn off git
- [x] Commit your current working state, ideally on a new branch
- [ ] Push your `.env` file to GitHub
- [ ] Delete old files
*Why:* A clean commit gives you a one-step way back if the refactor goes wrong.

## Debugging with AI {#debugging-with-ai}
<!-- emoji: 🐞 | minutes: 9 | related: reviewing-ai-code, monitoring-logging-errors, git-for-vibe-coders -->

**TL;DR:** Give the AI the exact error, the relevant code, what you expected and what happened — then insist on finding the cause, not just silencing the symptom.

### Explain
The quality of debugging help depends on the evidence you provide. A strong bug report includes:

- **The exact error message** and **stack trace** — copy and paste, don't paraphrase.
- **Expected vs actual** behaviour: "Clicking Save should show a toast; nothing happens."
- **Steps to reproduce** — a bug you can trigger on demand is half-fixed.
- **Relevant code and recent changes** — what you altered before it broke (git diff helps).
- **Environment** — browser, Node version, device.
- **Logs** — server logs, browser console, network tab responses.

Tips for working with the AI:
- Ask it to **explain the likely cause first** and propose a fix second.
- Prefer **root causes** over band-aids like wrapping everything in try/catch.
- Add temporary **logging** to test hypotheses, then remove it.
- Ask for a **regression test** so the bug can't silently return.

If three fix attempts fail, stop: gather new evidence or start a fresh session.

### Analogy
Describing symptoms to a doctor. "I feel off" gets a guess; "fever of 39° since Tuesday, sore throat" gets a diagnosis.

### Why it matters
Pasting "it doesn't work" wastes everyone's time. A precise report turns a vague guessing game into a short, targeted fix.

### Example
A bug-report prompt:

```
Expected: submitting the form shows "Saved" and the list updates.
Actual: spinner forever. Console: "TypeError: Cannot read properties
of undefined (reading 'id')" at saveNote (NoteForm.tsx:42).
Started after I changed the API response shape (diff attached).
Explain the root cause first, then suggest a minimal fix and a test.
```

### Takeaways
- Provide exact errors, expected vs actual, reproduction steps and recent changes.
- Ask for the cause before the fix, and favour root causes over band-aids.
- Add a regression test so the bug stays fixed.

### Glossary
- **Stack trace** — A list of function calls leading to an error, showing where it happened.
- **Reproduce** — Reliably trigger a bug on demand.
- **Regression** — Something that worked before and broke after a change.
- **Root cause** — The underlying reason a bug exists, not just its visible symptom.

### Quiz
**Q:** Which bug report will get the best AI help?
- [ ] "The app is broken"
- [ ] "It sometimes doesn't work, please fix"
- [x] The exact error and stack trace, expected vs actual behaviour and the recent change
- [ ] "Rewrite the whole file"
*Why:* Specific evidence lets the AI diagnose rather than guess.

**Q:** Why ask the AI to explain the cause before proposing a fix?
- [ ] To make answers longer
- [x] To avoid band-aid fixes that hide the symptom without solving the problem
- [ ] Because fixes are illegal without explanation
- [ ] To reduce token costs to zero
*Why:* Understanding the root cause leads to correct, minimal fixes and prevents repeat bugs.

## Reviewing AI-Written Code {#reviewing-ai-code}
<!-- emoji: 🔍 | minutes: 10 | related: git-for-vibe-coders, human-in-the-loop, web-vulns-supply-chain -->

**TL;DR:** Trust but verify: read the diff, run the tests and linter, and smell-check for security problems before accepting anything an AI wrote.

### Explain
AI code looks confident even when it's wrong. A practical review routine:

1. **Read the diff** — Did it change only what you asked? Unexpected edits to config, auth or unrelated files are red flags.
2. **Run it** — try the happy path *and* edge cases: empty input, huge input, logged-out user.
3. **Run automated checks** — tests, the **linter** (style and bug patterns), the **type checker**, and a build.
4. **Security smell-test** — hard-coded secrets, unvalidated user input, SQL built from strings, missing auth checks, overly broad permissions, new dependencies you don't recognise.
5. **Ask the AI to review itself** — "list risks and untested paths in this change" often reveals gaps (though it isn't a substitute for your eyes).

Also watch for **hallucinated** packages or APIs that don't exist, deleted tests, and "fixes" that simply disable a check.

For high-risk areas — auth, payments, data deletion — slow down and require extra review or an expert's eyes.

### Analogy
Being an editor, not the author: your job is to catch what the writer can't see in their own work.

### Why it matters
You're accountable for what ships, whoever typed it. A five-minute review routine prevents the incidents that make headlines.

### Example
A review checklist you can paste into an agent:

```
Before saying done:
- Show me the full diff summary (files + why).
- Run: npm run typecheck && npm test && npm run lint
- List any new dependencies and why they're needed.
- Flag anything touching auth, payments, env vars or deletes.
```

### Takeaways
- Review the diff, run it, run tests/lint/types, then check security.
- Be suspicious of deleted tests, new dependencies and disabled checks.
- Extra scrutiny for auth, payments and destructive operations.

### Glossary
- **Linter** — A tool that flags style problems and likely bugs in code.
- **Type checker** — A tool that verifies values are used consistently with their declared types.
- **Hallucinated package** — A dependency name the AI invented that doesn't really exist (or is malicious).
- **Happy path** — The normal flow where everything goes right.

### Quiz
**Q:** Which finding in a diff is the biggest red flag?
- [ ] A renamed variable inside the file you asked it to edit
- [ ] A new comment explaining a function
- [x] Tests were deleted so the build passes
- [ ] A bug fix with a small test added
*Why:* Removing tests to make things "pass" hides problems instead of fixing them.

**Q:** What does "trust but verify" mean for AI code?
- [ ] Never use AI code
- [ ] Accept it if it compiles
- [x] Use it, but confirm with diffs, tests and security checks before shipping
- [ ] Ask the same AI to approve itself and stop
*Why:* AI speeds you up, but human verification and automated checks keep quality and safety.
