# Week 16: Design & UX

## Design Systems & Tokens {#design-systems-tokens}
<!-- emoji: 🧰 | minutes: 10 | related: typography-spacing, color-contrast-a11y, visual-hierarchy -->

**TL;DR:** A design system is a shared kit of tokens, components and rules that keeps a product looking and behaving consistently.

### Explain
Without a system, every screen invents its own blue, its own button and its own spacing. A **design system** fixes that with layers:

- **Design tokens** — named values for the basics: colours (`color.primary`), spacing (`space.4`), radii, shadows, font sizes. Change a token once and the whole product updates. In code they become CSS variables or a Tailwind theme.
- **Components** — reusable UI pieces (button, input, modal, card) built from tokens.
- **Variants & states** — each component's versions (primary, secondary, danger; sizes) and states (default, hover, focus, disabled, loading, error).
- **Patterns & guidelines** — rules for when to use what: forms, empty states, error messages, tone of voice.
- **Documentation** — often a living library (Storybook) so designers and developers share one source of truth.

Tools: **Figma** for design with shared styles and components; libraries such as shadcn/ui, Radix, Material UI and Chakra for ready-made coded components. **Figma-to-code** workflows try to turn designs into components, but tokens are what keep the result consistent.

### Analogy
A design system is a LEGO set with a manual: a limited palette of bricks and rules for combining them, so anything you build looks like it belongs together.

### Why it matters
AI is great at creating screens and notorious for drifting — slightly different greys and paddings on every page. Give it your tokens and say "use only these variables and existing components" to get consistent UI.

### Example
```css
:root {
  --color-bg: #0b0b1a;
  --color-primary: #7c6cff;
  --space-2: 8px;
  --space-4: 16px;
  --radius-md: 12px;
}
.btn-primary { background: var(--color-primary); padding: var(--space-2) var(--space-4); border-radius: var(--radius-md); }
```

### Takeaways
- Tokens are the named foundation; components are built from them.
- Every component needs variants and states, not just its default look.
- Tell your AI to use the system's tokens and components to avoid visual drift.

### Glossary
- **Token** — a named design value, such as a colour or spacing step, reused everywhere.
- **Storybook** — a tool for building and documenting UI components in isolation.
- **Variant** — a predefined alternative version of a component, like size or intent.
- **Theme** — a set of token values (light, dark, brand) applied across the product.

### Quiz
**Q:** What is the main benefit of design tokens?
- [ ] They make images smaller
- [x] One named value can be changed in one place and updates everywhere it's used
- [ ] They remove the need for components
- [ ] They improve server speed
*Why:* Tokens centralise decisions so consistency and theming come from a single source.

**Q:** An AI-generated page uses 9 slightly different greys. What's the best fix going forward?
- [ ] Accept it
- [ ] Ask for more animations
- [ ] Remove all colour
- [x] Provide the colour tokens and instruct it to use only those
*Why:* Constraining the AI to your tokens prevents ad-hoc values and design drift.

## Typography & Spacing {#typography-spacing}
<!-- emoji: 🔠 | minutes: 10 | related: visual-hierarchy, design-systems-tokens, responsive-layout -->

**TL;DR:** Good type and consistent spacing do most of the work of making an interface look professional and readable.

### Explain
**Typography** is how text is chosen and arranged:
- **Typeface / font** — the design of the letters (Inter, Playfair). Pair at most two: often a neutral sans for UI and an optional display or serif for headings.
- **Type scale** — a limited set of sizes that grow by a ratio (e.g. 14, 16, 20, 25, 31). It creates hierarchy without guesswork.
- **Weight** — regular, medium, bold. Use weight and size, not many colours, to rank text.
- **Line height (leading)** — about 1.4–1.6 for body text, tighter for big headings.
- **Line length (measure)** — roughly 45–75 characters per line for comfortable reading.
- **Letter spacing (tracking)** — slightly loosened for uppercase labels, slightly tightened for large headings.

**Spacing** follows a rhythm too. The **4pt/8pt grid** uses multiples of 4 or 8px (4, 8, 16, 24, 32…). Related items sit close together; separate groups get more **whitespace** — proximity signals relationship. Consistent padding inside components and consistent gaps between them are what make layouts feel "designed".

Body text on mobile generally shouldn't be below 16px.

### Analogy
Typography is the tone of voice of your interface, and spacing is its pauses and punctuation. Without them, even good words feel like one breathless run-on sentence.

### Why it matters
"Make it look better" is too vague for an AI. "Use a 1.25 type scale, 8pt spacing, 1.6 line-height for body and max 70ch width" gives precise results and a design you can justify.

### Example
```css
body   { font: 16px/1.6 'Inter', system-ui, sans-serif; }
h1     { font-size: 2.488rem; line-height: 1.15; letter-spacing: -0.02em; }
p      { max-width: 68ch; margin-block: 1rem; }
.card  { padding: 24px; display: grid; gap: 12px; }   /* 8pt-grid multiples */
```

### Takeaways
- Use a small type scale, two typefaces at most, and weight for hierarchy.
- Body text: 16px+, line-height ~1.5, line length ~45–75 characters.
- Space on a consistent 4/8pt grid; closer means related.

### Glossary
- **Leading** — the vertical space between lines of text (line height).
- **Kerning** — adjusting the space between specific letter pairs.
- **Whitespace** — empty space that gives content room to breathe; not wasted space.
- **Variable font** — one font file that can adjust weight or width continuously.

### Quiz
**Q:** Which line length is generally most comfortable for reading body text?
- [ ] 20 characters
- [x] 45–75 characters
- [ ] 120–150 characters
- [ ] As wide as the screen
*Why:* Lines that are too long make the eye lose its place; too short makes reading choppy.

**Q:** Two form labels and their inputs look disconnected. What principle fixes it?
- [ ] Add more fonts
- [ ] Increase every gap equally
- [x] Use proximity: tighter spacing within a label-input pair, more between groups
- [ ] Make the labels red
*Why:* People read items placed closer together as related, so spacing communicates grouping.

## Colour, Contrast & Accessibility {#color-contrast-a11y}
<!-- emoji: 🎨 | minutes: 12 | lab: contrast | related: design-systems-tokens, visual-hierarchy, ux-laws -->

**TL;DR:** Colour should carry meaning and stay readable for everyone, which means meeting contrast ratios and never relying on colour alone.

### Explain
**Colour basics:** a palette usually has a **primary** brand colour, **neutrals** (greys for text and surfaces), and **semantic** colours (success green, warning amber, error red, info blue). Build each as a scale of lighter to darker shades (50–900). The 60-30-10 rule — 60% neutral, 30% secondary, 10% accent — is a handy balance guide.

**Contrast ratio** compares the brightness of text and background, from 1:1 (identical) to 21:1 (black on white). **WCAG** (Web Content Accessibility Guidelines) sets minimums:
- **AA**: 4.5:1 for normal text, 3:1 for large text and key UI elements
- **AAA**: 7:1 for normal text

**Accessibility (a11y)** is designing for everyone: low vision, colour blindness (about 1 in 12 men), keyboard-only users, screen readers, and bright sunlight. Practical rules: don't convey meaning only by colour (add icons or text), keep visible **focus outlines**, use proper labels and **alt text**, and support **dark mode** with re-checked contrast (pure black on pure white can feel harsh; softened tones often read better).

### Analogy
Contrast is volume. Grey text on a white background is whispering in a noisy room — some people simply won't hear it, however good the message.

### Why it matters
AI loves trendy low-contrast greys. A check against 4.5:1 and a request to "add focus states and don't use colour alone for errors" improves usability and is often a legal requirement.

### Example
In the lab, try the text colour `#9ca3af` on white. The ratio is about 2.5:1 — it fails AA. Darken to `#6b7280` and you pass at about 4.8:1. Then test your own brand colours and watch the AA and AAA badges flip.

### Takeaways
- Build palettes from primary, neutrals and semantic colours.
- Aim for at least 4.5:1 contrast for body text, 3:1 for large text and UI controls.
- Never rely on colour alone, and always keep visible keyboard focus.

### Glossary
- **WCAG** — the international standard for web accessibility, with levels A, AA and AAA.
- **Screen reader** — software that reads interface content aloud for blind or low-vision users.
- **Alt text** — a text description of an image for assistive technology.
- **Semantic colour** — a colour whose job is meaning, such as red for errors.

### Quiz
**Q:** What contrast ratio does WCAG AA require for normal-sized body text?
- [ ] 2:1
- [ ] 3:1
- [x] 4.5:1
- [ ] 21:1
*Why:* 4.5:1 is the AA minimum for regular text; 3:1 applies to large text and UI components.

**Q:** A form marks errors only by turning the border red. What's the issue?
- [ ] Red is not allowed in design
- [ ] Borders cannot change colour
- [ ] It looks too bold
- [x] Colour-blind users may miss it, so add text or an icon too
*Why:* Meaning must not depend on colour alone; supplement it with a message or icon.

## Visual Hierarchy {#visual-hierarchy}
<!-- emoji: 🔭 | minutes: 9 | related: typography-spacing, color-contrast-a11y, ux-laws -->

**TL;DR:** Visual hierarchy is arranging elements so the eye knows what to look at first, second and third.

### Explain
Users scan, they don't read. Hierarchy tells them where to start using a handful of tools:

- **Size** — bigger things are seen first.
- **Weight and contrast** — bold, dark or saturated stands out against light, muted surroundings.
- **Colour** — one accent colour reserved for the primary action.
- **Position** — top-left tends to be seen first in left-to-right languages; people scan in an **F-pattern** on text-heavy pages and a **Z-pattern** on simple landing pages.
- **Whitespace** — isolating an element increases its importance.
- **Depth** — shadows and layering suggest what sits on top.

**Gestalt principles** explain how we group things: **proximity** (near = related), **similarity** (same look = same kind), **common region** (inside a box = together), **alignment** (a shared edge creates order) and **continuity** (eyes follow lines).

A practical test: **squint** at the screen or blur it. If you can't tell the main heading and the main button apart from the rest, hierarchy is weak. Only one primary action per view; if everything is emphasised, nothing is.

### Analogy
A newspaper front page: one giant headline, a subhead, then smaller stories. You always know where to begin because someone decided what mattered most.

### Why it matters
When your AI's page looks "flat" or confusing, the fix is rarely more decoration. Ask: "Make the primary CTA the most prominent element, reduce the secondary buttons to outline style, and add more space around the headline."

### Example
Pricing page before and after:

| Before | After |
|---|---|
| Three identical cards, three identical buttons | Middle plan larger, tinted background, "Most popular" tag |
| All text 16px regular | Plan name 20px bold, price 40px, features 14px muted |
| Everything tightly packed | 48px gap before the primary button |

### Takeaways
- Use size, weight, colour, space and position to rank content.
- One primary action per screen; secondary actions should look quieter.
- Squint test: the most important thing should still stand out when blurred.

### Glossary
- **CTA** — call to action; the button or link you most want the user to click.
- **Gestalt principles** — psychology rules describing how people perceive grouped visuals.
- **F-pattern** — a common reading path of scanning across the top, then down the left side.
- **Focal point** — the element designed to draw attention first.

### Quiz
**Q:** A screen has five buttons all styled bright blue and bold. What's the hierarchy problem?
- [ ] There aren't enough colours
- [ ] Buttons should be removed
- [x] Nothing stands out, because everything is emphasised equally
- [ ] The font is too small
*Why:* Hierarchy needs contrast between levels; make one action primary and the others quieter.

**Q:** Which Gestalt principle explains why items placed close together are seen as a group?
- [ ] Continuity
- [ ] Similarity
- [ ] Symmetry
- [x] Proximity
*Why:* Proximity says that elements near each other are perceived as related.

## UX Laws {#ux-laws}
<!-- emoji: ⚖️ | minutes: 10 | related: visual-hierarchy, user-flows-wireframes, ai-ux-patterns -->

**TL;DR:** UX laws are well-tested rules about human perception and behaviour that help you predict which designs will feel easy.

### Explain
Psychology gave designers dependable shortcuts:

- **Hick's Law** — more choices means slower decisions. Trim menus, group options, show defaults.
- **Fitts's Law** — time to hit a target depends on its distance and size. Make primary buttons large and close; on phones keep key actions within thumb reach and at least ~44px tall.
- **Jakob's Law** — people spend most of their time on *other* sites, so they expect yours to work like those. Use familiar patterns (logo top-left links home, cart icon top-right).
- **Miller's Law** — people hold roughly 7±2 items in working memory. Chunk long things: phone numbers, steps, forms.
- **Doherty Threshold** — responses under ~400ms keep users in flow; show progress or skeletons when you can't be that fast.
- **Peak-End Rule** — people judge an experience by its most intense moment and its ending. Nail the success screen.
- **Law of Proximity / Common Region** — grouping tells people what belongs together.
- **Aesthetic-Usability Effect** — attractive interfaces are perceived as easier to use.

Laws are guidelines, not commandments — test with real users when it matters.

### Analogy
UX laws are like traffic rules for attention. Nobody invented them to restrict you; they describe how people already drive through an interface, so your road signs should match.

### Why it matters
They give you precise language for critiques: "Too many choices on this screen — apply Hick's Law and make one option the default", or "this button is tiny and far from the thumb — Fitts."

### Example
Checkout page review:

| Issue | Law | Fix |
|---|---|---|
| 12 shipping options shown at once | Hick | Show 3, "more options" link |
| Pay button small, bottom-left | Fitts | Full-width, thumb zone |
| Custom, unfamiliar cart icon | Jakob | Use the standard cart icon |
| 3-second blank wait after paying | Doherty | Immediate spinner and message |
| Plain "Done." end page | Peak-End | Clear confirmation, receipt, next step |

### Takeaways
- Fewer choices, bigger and closer targets, familiar patterns, chunked information.
- Respond quickly or show progress; users notice delays beyond ~400ms.
- Invest in the peak and the ending of the experience.

### Glossary
- **Cognitive load** — the mental effort needed to use an interface.
- **Affordance** — a visual cue that shows how something can be used, like a button's raised look.
- **Thumb zone** — the area of a phone screen easiest to reach one-handed.
- **Default** — a pre-selected option that reduces decisions and effort.

### Quiz
**Q:** Your settings page lists 30 toggles on one screen and users get lost. Which law applies?
- [x] Hick's Law
- [ ] Fitts's Law
- [ ] Doherty Threshold
- [ ] Peak-End Rule
*Why:* More options increase decision time; grouping and prioritising reduce it.

**Q:** Why should you use a standard magnifying-glass icon for search instead of inventing your own?
- [ ] Fitts's Law
- [ ] Miller's Law
- [x] Jakob's Law: users expect your product to behave like the ones they already know
- [ ] Peak-End Rule
*Why:* Familiar conventions reduce learning effort because users transfer expectations from other sites.

## User Flows, Wireframes & Research {#user-flows-wireframes}
<!-- emoji: 🧭 | minutes: 10 | related: ux-laws, design-systems-tokens, spec-driven-development -->

**TL;DR:** Before pixels, designers map who the user is, what they're trying to do and the path through screens — then test it cheaply.

### Explain
Good UX starts before high-fidelity design:

- **Persona / JTBD** — a *persona* is a representative user; **Jobs To Be Done** frames what they are trying to get done ("When I have a free weekend, I want to learn AI terms quickly so I can follow technical conversations").
- **Information architecture (IA)** — how content is organised and labelled: navigation, sitemap, categories.
- **User flow** — a diagram of steps to complete a goal, including decisions and error paths: sign up → verify email → onboarding → first win.
- **Wireframe** — a low-detail, greyscale layout of a screen, focused on structure and content, not looks.
- **Prototype** — clickable mock-ups (Figma) that simulate the product before code exists.
- **Usability testing** — watch 5 real people try tasks; five users uncover most major problems. Note where they hesitate.
- **Heuristic review / A/B test** — expert checklists, or comparing two live versions with real traffic.

Don't forget **edge states**: empty, loading, error, offline, and "too much data".

### Analogy
Wireframes are architectural floor plans. You wouldn't pick wallpaper before deciding where the doors are.

### Why it matters
Vibe coding makes building screens instant, so the bottleneck shifts to *deciding the right screens*. A short flow plus wireframe description to your AI beats "build me a dashboard" every time, and avoids rebuilding the wrong thing.

### Example
Prompt-ready flow description:

```text
Goal: user sets a weekend learning goal.
Flow: Home → "Plan weekend" → pick 5 concepts (default: next unlearned)
      → confirm time budget → plan saved → home shows progress ring.
Edge states: no concepts left (celebrate), no time set (suggest 90 min),
offline (plan still works, syncs later).
```

### Takeaways
- Start with the user's job, then flow, then wireframe, then visual design.
- Prototype and test with a handful of real users before you build.
- Design the empty, loading, error and offline states too.

### Glossary
- **Information architecture** — the structure and labelling of content so people can find things.
- **Low-fidelity / high-fidelity** — rough sketches versus polished, near-final designs.
- **Happy path** — the ideal route where nothing goes wrong.
- **MVP** — minimum viable product; the smallest version that delivers value and teaches you something.

### Quiz
**Q:** What does a wireframe primarily communicate?
- [ ] Final colours and fonts
- [ ] Database structure
- [x] Layout, structure and content placement of a screen
- [ ] Server architecture
*Why:* Wireframes are deliberately plain so discussion focuses on structure rather than visuals.

**Q:** Why design "edge states" like empty or error screens?
- [ ] They are only needed for large companies
- [ ] They reduce server costs
- [ ] They replace testing
- [x] Users will hit them, and they heavily shape trust and clarity
*Why:* Empty, loading and error moments are common, and poor handling feels broken.

## Microinteractions & Motion {#microinteractions-motion}
<!-- emoji: ✨ | minutes: 10 | related: ai-ux-patterns, color-contrast-a11y, ux-laws -->

**TL;DR:** Small, purposeful animations give feedback and guide attention, but they must be fast, meaningful and switchable off.

### Explain
A **microinteraction** is one small moment of feedback: a button depressing, a heart popping when liked, a toggle sliding, a progress bar filling. Each has a trigger, a rule, feedback and loop/mode.

Motion should have a *job*:
- **Feedback** — "I heard you" (button press, field shake on error)
- **Orientation** — where did that panel come from? (slide, expand, shared element)
- **Attention** — draw the eye to something new
- **Personality** — brand feel, used sparingly

Guidelines: UI transitions usually last **150–300ms** (up to ~500ms for large moves); use **easing** (ease-out for things entering, ease-in for leaving, springs for playful) instead of linear; animate cheap properties (`transform`, `opacity`) for smooth 60fps; stagger lists slightly.

Tools: CSS transitions for simple states; **Framer Motion** (React); **GSAP** for timelines and scroll-driven sequences; **Lottie** for exported illustrations; **Three.js** for 3D scenes. Always honour **`prefers-reduced-motion`** for people with vestibular disorders, and never block the user with an animation they must watch.

### Analogy
Motion is body language for software. A nod confirms, a flinch warns, but constant fidgeting is just annoying.

### Why it matters
Animation can make an app feel premium, or sluggish and nauseating. Ask for "200ms ease-out, transform and opacity only, respect reduced motion" and you'll get polish without jank.

### Example
```css
.btn { transition: transform 150ms ease-out, box-shadow 150ms ease-out; }
.btn:active { transform: scale(0.97); }

@media (prefers-reduced-motion: reduce) {
  * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
}
```

### Takeaways
- Every animation needs a purpose: feedback, orientation or attention.
- Keep UI motion short (≈150–300ms), eased, and based on transform/opacity.
- Respect `prefers-reduced-motion` and never make users wait on decoration.

### Glossary
- **Easing** — the acceleration curve of an animation, like ease-out or a spring.
- **Skeleton screen** — grey placeholder shapes shown while content loads.
- **FPS** — frames per second; 60fps looks smooth, drops cause visible jank.
- **Stagger** — offsetting the start of multiple animations so they cascade.

### Quiz
**Q:** Which CSS properties are generally cheapest to animate smoothly?
- [ ] width and height
- [ ] top and left
- [x] transform and opacity
- [ ] font-size
*Why:* Transform and opacity can be handled by the GPU without re-laying out the page.

**Q:** A user has "reduce motion" enabled. What should your UI do?
- [ ] Ignore it, animations are the brand
- [ ] Add more animation to compensate
- [ ] Crash gracefully
- [x] Minimise or remove non-essential animation
*Why:* Large motion can cause dizziness or nausea, so respecting the preference is an accessibility requirement.

## Designing AI Interfaces {#ai-ux-patterns}
<!-- emoji: 💬 | minutes: 11 | related: streaming, grounding-citations, human-in-the-loop -->

**TL;DR:** AI products need their own UX patterns — streaming, visible sources, easy undo and clear limits — because the system is probabilistic and sometimes wrong.

### Explain
Classic UIs are deterministic; AI features aren't. Good AI UX makes uncertainty manageable:

- **Streaming responses** — show tokens as they arrive. It feels fast (low time-to-first-token) and lets users read while it generates. Include a **stop** button.
- **Citations and grounding** — show sources so answers can be verified, and link to the exact passage.
- **Confidence and caveats** — signal when the system is unsure rather than sounding certain about everything.
- **Control and undo** — preview AI changes as diffs, require confirmation for risky actions, allow **undo** and regenerate or edit.
- **Prompts as UI** — suggested prompts, templates and slash commands reduce the blank-box problem; structured inputs often beat open chat.
- **Progressive disclosure of reasoning** — show steps or tool use for agents, collapsed by default.
- **Empty and error states** — explain limits, handle refusals, rate limits and timeouts gracefully, and offer fallbacks.
- **Feedback loops** — thumbs up/down and "report a problem" improve the product.
- **Human in the loop** — keep a person in charge of consequential decisions.

Trust grows from honesty: tell users what the AI can and can't do, and never hide that content was generated.

### Analogy
Working with an AI is like working with a brilliant but sometimes overconfident intern: great output, but you want to see their sources, review before sending, and easily undo mistakes.

### Why it matters
This is the design half of everything you've learned about hallucination, RAG and agents. When you build an AI feature, ask your coding assistant to add streaming, a stop button, citations and an undo path from the very first version.

### Example
Checklist for an AI "Summarise this document" feature:

| Moment | Pattern |
|---|---|
| Click | Stream the summary; show Stop |
| Result | Cite page numbers; "Show source" highlights text |
| Doubt | "Regenerate", "Make shorter", thumbs up/down |
| Apply | Show diff before replacing the user's text; Undo toast |
| Failure | "Couldn't reach the model. Try again?" with a retry button |

### Takeaways
- Stream, cite, and give users stop, edit and undo controls.
- Design for uncertainty: show sources, caveats and graceful failures.
- Suggested prompts and structured inputs beat an empty chat box.

### Glossary
- **TTFT** — time to first token; how quickly the first piece of the answer appears.
- **Diff view** — a side-by-side or inline display of exactly what changed.
- **Progressive disclosure** — revealing detail only when the user asks for it.
- **Anthropomorphism** — attributing human traits to AI; useful for tone, risky if it overstates ability.

### Quiz
**Q:** Why add citations to AI-generated answers?
- [x] Users can verify claims and trust is calibrated
- [ ] They make the model smarter
- [ ] They reduce token costs
- [ ] They replace the need for testing
*Why:* Showing sources lets people check the answer, which is crucial because models can hallucinate.

**Q:** An AI agent will rewrite a user's document. Which design is safest?
- [ ] Apply instantly and silently
- [ ] Hide the changes to keep the UI clean
- [ ] Disable undo to avoid confusion
- [x] Show a diff, ask for confirmation and provide undo
*Why:* Previews and reversibility keep humans in control when the output is probabilistic.
