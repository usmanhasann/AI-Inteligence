# Week 13: Frontend Literacy

## HTML, CSS & JavaScript {#html-css-js}
<!-- emoji: 🧱 | minutes: 8 | related: dom-events, components-react, responsive-layout -->

**TL;DR:** Every web page is three layers: HTML says what things are, CSS says how they look, and JavaScript says what they do.

### Explain
The browser only natively understands three languages, and each has one job:

- **HTML** — the *structure and meaning*. Headings, paragraphs, buttons, forms, links. It's the skeleton and the content.
- **CSS** — the *presentation*. Colours, fonts, spacing, layout, animation. It selects elements and describes how they should look.
- **JavaScript (JS)** — the *behaviour*. Reacts to clicks, fetches data, updates the page without reloading.

Everything else you hear about — React, Tailwind, Next.js, TypeScript — is a tool that *generates* or *organises* these three in the end. TypeScript compiles to JS, Tailwind produces CSS, React produces HTML via JS.

Keeping the layers separate is a healthy habit: if a button looks wrong, it's a CSS problem; if it does nothing when clicked, it's JS; if a screen reader can't find it, it's probably bad HTML (a `div` pretending to be a button).

### Analogy
A house: HTML is the walls and rooms, CSS is the paint and furniture, JavaScript is the electricity and plumbing that makes things respond.

### Why it matters
When you tell an AI "make the card bigger on hover" you're talking CSS; "save the form without refresh" is JS; "this should be a real button" is HTML. Naming the right layer gets you the right fix on the first try.

### Example
One element, three layers:

```html
<button class="cta" id="buy">Buy now</button>

<style>
  .cta { background: #6d5efc; color: white; padding: 12px 20px; border-radius: 10px; }
</style>

<script>
  document.getElementById('buy').addEventListener('click', () => alert('Added to cart'))
</script>
```

Delete the `<style>` block and it still works (ugly). Delete the script and it looks fine but does nothing.

### Takeaways
- HTML = structure and meaning, CSS = look and layout, JS = behaviour.
- Modern tools all compile down to these three for the browser.
- Diagnose bugs by layer: wrong look is CSS, wrong action is JS, wrong semantics is HTML.

### Glossary
- **Semantic HTML** — using elements for their meaning (`nav`, `button`, `h1`) so browsers and assistive tech understand the page.
- **Selector** — the part of a CSS rule that picks which elements it applies to.
- **ECMAScript** — the official standard that JavaScript implements; "ES6" and "ES2023" are versions.

### Quiz
**Q:** A button looks perfect but nothing happens when you click it. Which layer is most likely at fault?
- [ ] HTML structure
- [ ] CSS styling
- [x] JavaScript behaviour
- [ ] The browser's DNS
*Why:* Looks are CSS and structure is HTML; "does nothing on click" means the event logic in JS is missing or broken.

**Q:** Why is a clickable `div` worse than a real `button`?
- [x] A button gives keyboard focus, accessibility roles and default behaviour for free
- [ ] Divs can't be styled
- [ ] Buttons load faster
- [ ] Divs are not allowed in HTML
*Why:* Semantic elements bring built-in keyboard and screen-reader support; a div has to be taught all of that manually.

## The DOM & Events {#dom-events}
<!-- emoji: 🌳 | minutes: 9 | related: html-css-js, components-react -->

**TL;DR:** The DOM is the live tree of objects the browser builds from your HTML, and events are the signals — clicks, keys, scrolls — that JavaScript listens for.

### Explain
When the browser loads HTML it doesn't keep the text — it builds a **DOM** (Document Object Model): a tree where every tag becomes a node with a parent, children and properties. JavaScript can read and change this tree, and the screen updates to match.

**Events** are things that happen to nodes: `click`, `input`, `submit`, `keydown`, `scroll`. You attach an **event listener** — a function that runs when the event fires.

Events **bubble**: a click on a button inside a card inside a list fires on the button first, then travels *up* through the card and list. This is why one listener on a parent can handle thousands of children (**event delegation**), and why a click in a modal can accidentally trigger the page behind it (`stopPropagation` stops the trip).

Touching the DOM is relatively slow, which is the reason frameworks like React exist: they minimise how often and how much of the tree gets changed.

### Analogy
The DOM is a family tree of page elements. An event is like shouting in a room — it's heard by the person closest, then the whole household, then the street.

### Why it matters
"The click fires twice", "my modal closes when I click inside it" and "the listener stopped working after re-render" are all DOM/event bugs. With this vocabulary you can ask your AI to "check for event bubbling" or "use event delegation" instead of guessing.

### Example
Prompt you can paste when a modal closes unexpectedly:

```text
Clicking inside the modal content also closes it. The overlay has the
close handler. Fix it so only clicks on the overlay itself close it
(check event.target === event.currentTarget) instead of using stopPropagation
everywhere.
```

### Takeaways
- The DOM is a tree of live objects built from HTML; changing it changes the screen.
- Events fire on the target element, then bubble up through its ancestors.
- Event delegation puts one listener on a parent instead of many on children.

### Glossary
- **Event listener** — a function registered to run when a specific event happens on an element.
- **Event bubbling** — events travelling from the clicked element up through its parents.
- **Virtual DOM** — an in-memory copy frameworks compare against to update the real DOM minimally.
- **Node** — one item in the DOM tree: an element, text or comment.

### Quiz
**Q:** You click a button inside a card and both the button handler and the card handler run. What explains this?
- [ ] A bug in the browser
- [x] Event bubbling
- [ ] Hydration
- [ ] CSS specificity
*Why:* The click bubbles up from the button to its ancestors, triggering their listeners too unless propagation is stopped.

**Q:** What is the DOM?
- [ ] The HTML file stored on the server
- [ ] A CSS preprocessor
- [ ] A JavaScript framework
- [x] The browser's in-memory tree of page elements that scripts can change
*Why:* The HTML text is parsed into a tree of objects; that live tree is the DOM, and edits to it update what you see.

## Components, State & React {#components-react}
<!-- emoji: ⚛️ | minutes: 11 | related: dom-events, rendering-modes, typescript-types -->

**TL;DR:** React builds UIs from reusable components whose screen output is a function of their props and state — change the data, and the UI updates itself.

### Explain
A **component** is a reusable piece of UI — a `Button`, a `ProductCard`, a whole `CheckoutPage` — written as a function that returns what should appear. Components nest like HTML.

Data comes in two forms:
- **Props** — inputs passed *down* from parent to child (read-only), like function arguments.
- **State** — data a component owns and can change over time (a counter, an open/closed flag). Changing state triggers a **re-render**: React re-runs the component and updates only what differs in the DOM.

Data flows **one way**, parent to child. A child asks for changes by calling a function the parent handed it.

**Hooks** are special functions (`useState`, `useEffect`, `useMemo`) that let components hold state and run side effects such as fetching data. Rule of thumb: derive what you can from existing state rather than storing duplicates.

Common failures: state too high or too low in the tree, effects that loop forever, and needless re-renders that make the UI feel slow.

### Analogy
Components are LEGO bricks with studs (props) and an internal mechanism (state). You snap them together, and when a brick's internals change, only that brick visibly changes.

### Why it matters
AI-generated React is mostly a hook and state puzzle. Knowing "lift state up", "this effect needs a dependency array" or "this should be a prop, not state" lets you steer the code and recognise why a screen is stale or flickering.

### Example
```jsx
function LikeButton({ label }) {            // label is a prop
  const [likes, setLikes] = useState(0)      // likes is state
  return <button onClick={() => setLikes(likes + 1)}>{label}: {likes}</button>
}
```
Click, `setLikes` runs, React re-renders `LikeButton`, and the number on screen changes. The parent never knew.

### Takeaways
- UI = function(props, state): same inputs give the same screen.
- Props flow down and are read-only; state is owned and triggers re-renders.
- Hooks add state and side effects to function components.

### Glossary
- **JSX** — HTML-looking syntax inside JavaScript that compiles to component calls.
- **Re-render** — React running a component again to see what changed after state or props update.
- **Lifting state up** — moving shared state to the nearest common parent so siblings can use it.
- **useEffect** — a hook for side effects like fetching, subscriptions or timers.

### Quiz
**Q:** A child component needs to change a value owned by its parent. What's the idiomatic React way?
- [ ] Mutate the parent's variable directly
- [ ] Copy the value into the child and edit it there
- [x] Receive a callback function as a prop and call it
- [ ] Use a global CSS class
*Why:* Data flows one way, so children request changes by calling functions passed down from the owner of the state.

**Q:** What happens when a component's state changes?
- [x] React re-renders it and updates the parts of the DOM that differ
- [ ] The entire page reloads from the server
- [ ] Nothing, until you refresh
- [ ] The state is saved to a database
*Why:* State changes schedule a re-render; React diffs the result and patches only the necessary DOM nodes.

## Rendering Modes: CSR, SSR, SSG {#rendering-modes}
<!-- emoji: 🖨️ | minutes: 10 | related: bundlers-frameworks, components-react, serverless-edge -->

**TL;DR:** Rendering modes decide where and when your pages become HTML — in the browser, on a server per request, or ahead of time at build.

### Explain
Where HTML gets produced changes speed, SEO and cost:

- **CSR (client-side rendering)** — the server sends a nearly empty page plus JS; the browser builds the UI. Great for app-like dashboards; slower first paint and weaker for search engines.
- **SSR (server-side rendering)** — the server builds the full HTML on each request. Fast first view and SEO-friendly; costs server time on every hit.
- **SSG (static site generation)** — pages are built once at deploy time and served as files from a CDN. Fastest and cheapest, but content is only as fresh as the last build.
- **ISR (incremental static regeneration)** — static pages that quietly rebuild in the background after a time limit.

After server-rendered HTML arrives, JS "wakes it up" in a step called **hydration**: attaching event listeners so the static markup becomes interactive. Until it finishes, buttons may look ready but not respond.

Frameworks like **Next.js**, Nuxt and SvelteKit let you choose a mode per page.

### Analogy
Restaurants: SSG is pre-packed meals on a shelf (instant, maybe not today's), SSR is cooking to order, CSR is handing you a box of ingredients and a recipe to cook at your table.

### Why it matters
"Why is my page blank for a second?" or "Google doesn't index it" are rendering-mode questions. You can tell your AI: "make the marketing pages static and the dashboard client-rendered."

### Example
A sensible mix for a SaaS product:

| Page | Mode | Why |
|---|---|---|
| Landing, blog | SSG | Never changes per user; instant via CDN |
| Product listing | ISR (60s) | Fresh enough, still cached |
| `/dashboard` | CSR | Behind login, highly interactive |
| `/u/sam` public profile | SSR | Personalised, needs SEO |

### Takeaways
- CSR renders in the browser, SSR per request on a server, SSG once at build time.
- Hydration makes server-sent HTML interactive; a gap before it finishes is normal.
- Choose per page: SEO and speed favour static/SSR, rich interactivity favours CSR.

### Glossary
- **Hydration** — attaching JavaScript behaviour to HTML that was rendered earlier.
- **SEO** — search engine optimisation; making pages findable by search crawlers.
- **TTFB** — time to first byte, how long until the server starts responding.
- **Edge rendering** — running SSR on servers geographically close to the user.

### Quiz
**Q:** A blog's articles change rarely and should load as fast as possible worldwide. Best fit?
- [ ] CSR
- [ ] SSR on every request
- [x] SSG served from a CDN
- [ ] A WebSocket server
*Why:* Pre-built static files can be cached everywhere and need no server work per visit.

**Q:** What does hydration do?
- [ ] Compresses images
- [ ] Moves the database closer to users
- [x] Attaches event handlers to server-rendered HTML so it becomes interactive
- [ ] Converts CSS into JavaScript
*Why:* Server HTML is just markup; hydration runs JS over it to make buttons and forms respond.

## Bundlers, Packages & Frameworks {#bundlers-frameworks}
<!-- emoji: 📦 | minutes: 9 | related: html-css-js, typescript-types, ci-cd -->

**TL;DR:** npm supplies ready-made packages, bundlers like Vite fuse your code and those packages into small browser-ready files, and frameworks give you a pre-decided structure.

### Explain
Modern projects are built from hundreds of other people's code:

- **npm** (and pnpm, yarn, bun) is the **package manager**: it downloads libraries listed in `package.json` into `node_modules` and pins exact versions in a lockfile.
- A **bundler** (Vite, webpack, esbuild, Turbopack) takes your many source files, TypeScript, JSX and imports and outputs a few optimised files the browser can run. It also does **minification** (shrink code), **code splitting** (load pages on demand) and **tree-shaking** (drop unused code).
- A **dev server** gives instant reload while you code; a **build** produces the production output.

**Library vs framework:** you *call* a library (React, a date helper); a framework *calls you* and sets the structure (Next.js, Nuxt, Angular) — routing, data loading, build and deployment conventions come included.

Risks: huge `node_modules`, version conflicts, abandoned packages, and security issues in dependencies.

### Analogy
npm is a hardware store, the bundler is the packing line that boxes exactly what's needed for shipping, and a framework is a pre-built workshop where every tool already has its spot.

### Why it matters
Most "it won't build" errors are version, import or config problems. Telling an AI "use the existing package, don't add a new dependency" or "check the lockfile" keeps your bundle small and your project sane.

### Example
```bash
npm install zod          # adds to package.json + lockfile
npm run dev              # dev server with hot reload
npm run build            # bundler outputs optimised files to /dist
```
Your 300 source files become something like `index.js` (80 KB) and `index.css` (12 KB).

### Takeaways
- Package manager installs dependencies; the lockfile freezes exact versions.
- Bundlers compile, merge, minify and tree-shake your code for the browser.
- Libraries are tools you call; frameworks impose structure and call your code.

### Glossary
- **Dependency** — a package your project needs in order to run or build.
- **Tree-shaking** — removing exported code nobody imports from the final bundle.
- **Hot module replacement (HMR)** — swapping changed code into the running page without a full reload.
- **Monorepo** — one repository holding several apps and packages.

### Quiz
**Q:** What is the main job of a bundler such as Vite?
- [x] Turn many source files and imports into optimised files the browser can load
- [ ] Host your website
- [ ] Store user data
- [ ] Write unit tests
*Why:* Bundlers resolve imports, compile modern syntax, minify and split code into production assets.

**Q:** What best distinguishes a framework from a library?
- [ ] Frameworks are always larger
- [ ] Libraries cost money
- [ ] Frameworks only run on servers
- [x] A framework dictates structure and calls your code; you call a library
*Why:* That inversion of control is the classic difference: with a framework your code plugs into its flow.

## TypeScript & Types {#typescript-types}
<!-- emoji: 🏷️ | minutes: 8 | related: components-react, bundlers-frameworks, reviewing-ai-code -->

**TL;DR:** TypeScript adds labels describing what shape each piece of data has, so mistakes are caught while you type instead of after users hit them.

### Explain
JavaScript is flexible: a variable can be a number now and text later. That freedom causes bugs like `undefined is not a function` at runtime.

**TypeScript (TS)** is JavaScript plus a **type system**. You (or inference) describe shapes: `User` has a `name: string` and optional `age: number`. A **type checker** then verifies every use, and the editor underlines problems immediately. At build time the types are erased and plain JS is shipped — types cost nothing at runtime.

What types buy you:
- Autocomplete and safe refactors (rename a field and see everything that breaks)
- Documentation that can't go out of date
- A guardrail for AI-written code

Typical pieces: `interface`/`type` definitions, unions (`'idle' | 'loading'`), generics (`Array<User>`), and `unknown` vs the escape hatch `any` (which turns the checker off).

Beware: types vanish at runtime, so data from an API still needs **validation** (for example with Zod).

### Analogy
Types are labelled shelves in a warehouse. You can't put a bicycle on the "glass bottles" shelf without an alarm going off before the shipment leaves.

### Why it matters
AI assistants generate lots of code quickly; a type error is a free, instant reviewer. When a build fails with a red type error, paste it back to the AI — and push back if it "fixes" it by sprinkling `any`.

### Example
```ts
type Status = 'idle' | 'loading' | 'error'
interface Lesson { id: string; title: string; minutes: number }

function total(lessons: Lesson[]): number {
  return lessons.reduce((sum, l) => sum + l.minutes, 0)
}

total([{ id: 'a', title: 'Tokens' }])   // ❌ error: 'minutes' is missing
```

### Takeaways
- Types describe data shapes and catch mismatches before running the code.
- They are erased at build time; runtime data from outside still needs validation.
- Treat `any` as a smell — it silently disables the safety net.

### Glossary
- **Type inference** — TypeScript working out types for you without explicit annotations.
- **Union type** — a value that can be one of several listed types.
- **Generic** — a type with a placeholder, such as a list of "something".
- **Zod** — a library that validates data at runtime and derives TypeScript types from it.

### Quiz
**Q:** Your AI "fixes" a type error by changing the type to `any`. What's the right reaction?
- [ ] Accept it — the error is gone
- [x] Ask for a proper type, since `any` disables checking for that value
- [ ] Switch back to plain JavaScript
- [ ] Delete the file
*Why:* `any` hides the problem rather than solving it, and the bug can reappear at runtime.

**Q:** Do TypeScript types exist while the app runs in the browser?
- [ ] Yes, they're enforced on every API response
- [ ] Yes, but only for numbers
- [x] No, they're removed when compiled to JavaScript
- [ ] Only in production builds
*Why:* Types are compile-time only, which is why untrusted data still needs runtime validation.

## Responsive Layout: Flexbox & Grid {#responsive-layout}
<!-- emoji: 📱 | minutes: 10 | lab: flexbox | related: html-css-js, visual-hierarchy, pwa-native-wrappers -->

**TL;DR:** Responsive design makes one codebase adapt to any screen, mostly by using Flexbox for one-dimensional rows or columns and Grid for two-dimensional layouts.

### Explain
People open your app on 360px phones, tablets and 4K monitors. **Responsive design** means layouts flex instead of being fixed.

The toolkit:
- **Viewport meta tag** — tells mobile browsers to use the real device width.
- **Flexbox** — lays items along *one axis* (row or column). Controls direction, wrapping, spacing (`gap`), alignment and how items grow or shrink. Perfect for navbars, button rows, centering.
- **CSS Grid** — defines *rows and columns together*. Ideal for page layouts, card galleries and dashboards.
- **Media queries / breakpoints** — rules that apply at certain widths (`@media (min-width: 768px)`).
- **Relative units** — `%`, `rem`, `vw`, `clamp()` rather than fixed pixels.

**Mobile-first** means writing the small-screen styles as the default and adding rules as screens get wider — usually simpler and faster.

Quick rule: *content flowing in a line → flex; a layout with rows and columns → grid.*

### Analogy
Flexbox is a bookshelf where books slide to fill one shelf. Grid is the whole bookcase with fixed rows and columns you can assign cells to.

### Why it matters
"It looks broken on my phone" usually means a fixed width, a missing breakpoint or the wrong layout tool. You can ask: "make this a mobile-first grid with 1 column on phones, 3 from 768px."

### Example
Open the lab below. Switch `flex-direction` between row and column, then turn on `flex-wrap` and shrink the container. Watch what `justify-content` (main axis) and `align-items` (cross axis) each do, and notice that changing direction swaps which axis is "main".

### Takeaways
- Flexbox handles one axis, Grid handles two; they are often combined.
- Mobile-first: default styles for small screens, breakpoints add enhancements.
- Prefer relative units and `gap` over fixed pixels and margin hacks.

### Glossary
- **Breakpoint** — a screen width at which the layout changes.
- **Viewport** — the visible area of the page in the browser window.
- **rem** — a unit relative to the root font size, good for scalable spacing and type.
- **Container query** — styles that respond to a component's own width instead of the screen's.

### Quiz
**Q:** You're building a photo gallery with rows and columns that reflows by screen size. Which is the natural tool?
- [ ] Flexbox only, in a single column
- [ ] Absolute positioning
- [x] CSS Grid
- [ ] A table with fixed widths
*Why:* Grid is built for two-dimensional layouts and can auto-fit columns as space changes.

**Q:** What does "mobile-first" mean?
- [x] Base styles target small screens, and wider-screen rules are layered on with min-width queries
- [ ] Only phones are supported
- [ ] The app must be built natively
- [ ] Desktop styles are written first and removed for phones
*Why:* Starting with the simplest layout and enhancing upwards usually yields leaner CSS and fewer overrides.

## PWAs & Native Wrappers {#pwa-native-wrappers}
<!-- emoji: 📲 | minutes: 10 | related: responsive-layout, rendering-modes, hosting-options -->

**TL;DR:** A PWA makes a website installable and offline-capable, and wrappers like Capacitor package that same web app as a real Android or iOS app.

### Explain
You have several ways to put an app on a phone:

- **Plain responsive web** — a URL in the browser. Cheapest, no store needed.
- **PWA (Progressive Web App)** — a website plus two files: a **web app manifest** (name, icons, colours so it can be "installed") and a **service worker** (a background script that caches files and handles offline use and sometimes push notifications). Must be served over HTTPS.
- **Hybrid wrapper (Capacitor, Cordova)** — your web app runs inside a native shell (a WebView), with plugins for camera, files, haptics and notifications. One codebase, ship to app stores.
- **Cross-platform native (React Native, Flutter)** — one codebase, but real native UI components (React Native) or a custom rendering engine (Flutter). Better performance feel, different skills.
- **Fully native (Swift/Kotlin)** — best platform fit, separate codebases.

Trade-off: the further right, the more device power and polish — and the more work, cost and review overhead.

### Analogy
A PWA is a website with a home-screen shortcut and a pantry for offline snacks. A Capacitor app is the same website wearing a native costume that can also open the phone's camera.

### Why it matters
For an interactive learning app you can host on Vercel *and* ship to Android, "PWA first, Capacitor wrapper second" avoids writing two apps. You'll also know why "service worker caching" explains stale versions after a deploy.

### Example
```json
{
  "name": "Upgrade Myself",
  "short_name": "Upgrade",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#0b0b1a",
  "icons": [{ "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }]
}
```
That manifest plus a service worker is what makes Chrome show "Install app".

### Takeaways
- PWA = website + manifest + service worker + HTTPS; installable and offline-friendly.
- Capacitor wraps a web app in a native shell and adds plugins for device features.
- Choose by need: reach (web/PWA) → store presence (Capacitor) → native feel (RN/Flutter/native).

### Glossary
- **Service worker** — a background script that intercepts network requests to cache and serve them offline.
- **WebView** — an embedded browser component inside a native app.
- **Manifest** — the JSON file describing an installable web app's name, icons and display mode.
- **Push notification** — a message delivered to the device even when the app isn't open.

### Quiz
**Q:** Which two additions make a website a PWA?
- [ ] A database and an admin panel
- [ ] A login page and a CDN
- [x] A web app manifest and a service worker
- [ ] React and TypeScript
*Why:* The manifest makes it installable and the service worker enables caching and offline behaviour.

**Q:** You have a finished web app and want it in the Play Store with minimal rewriting. Which approach fits?
- [ ] Rewrite everything in Kotlin
- [x] Wrap it with Capacitor
- [ ] Convert it to a spreadsheet
- [ ] Use only a service worker
*Why:* Capacitor runs your existing web code in a native shell and exposes native features through plugins.
