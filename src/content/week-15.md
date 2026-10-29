# Week 15: DevOps & Security

## CI/CD Pipelines {#ci-cd}
<!-- emoji: 🔄 | minutes: 9 | related: git-for-vibe-coders, hosting-options, orm-migrations -->

**TL;DR:** CI/CD automatically tests every code change and deploys the good ones, so shipping becomes routine instead of risky.

### Explain
- **Continuous Integration (CI)** — whenever code is pushed, a server automatically installs dependencies, runs the linter, type checker and tests, and builds the project. If anything fails, the change is blocked.
- **Continuous Delivery/Deployment (CD)** — once checks pass, the build is automatically released (or ready to release with one click).

A **pipeline** is the ordered list of steps defined in a config file, for example `.github/workflows/ci.yml` for **GitHub Actions** (others: GitLab CI, CircleCI). Each run happens in a clean machine, which catches "works on my machine" problems.

Modern hosts add **preview deployments**: every pull request gets its own temporary URL so you can click through the change before merging. Merging to `main` triggers the **production** deploy. If something breaks, a **rollback** points the site back at the previous good build.

Related practice: **branches** isolate work and **pull requests** (PRs) are how changes are reviewed and merged.

### Analogy
CI/CD is an airport security-and-boarding line for code: every change is scanned, and only those that pass walk onto the plane (production). Preview deploys are the lounge where you can inspect the cabin first.

### Why it matters
With AI producing code fast, automated checks are your safety net. Ask your AI to "add a GitHub Action that runs typecheck, lint and build on every PR", and require it to pass before merging.

### Example
```yaml
name: CI
on: [pull_request]
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22 }
      - run: npm ci
      - run: npm run typecheck && npm run build
```

### Takeaways
- CI tests and builds every change automatically; CD ships it.
- Preview deploys let you review the real result of a PR before merging.
- A fast rollback plan matters as much as the deploy itself.

### Glossary
- **Pull request (PR)** — a proposal to merge a branch, usually with review and automated checks.
- **Linter** — a tool that flags suspicious code and style problems.
- **Artifact** — a file produced by a pipeline step, like a build output.
- **Rollback** — redeploying a previous known-good version.

### Quiz
**Q:** What's the main benefit of CI on every pull request?
- [ ] It makes the code run faster
- [x] Broken changes are caught by automated checks before they reach main
- [ ] It replaces version control
- [ ] It removes the need for a database
*Why:* Running tests and builds automatically stops regressions at the door.

**Q:** What is a preview deployment?
- [ ] A paid advertising slot
- [ ] A local-only dev server
- [ ] A database backup
- [x] A temporary live URL built from a branch or PR for reviewing changes
*Why:* Hosts like Vercel and Netlify deploy each PR separately so you can test it before merging.

## Docker & Containers {#docker-containers}
<!-- emoji: 🐳 | minutes: 10 | related: ci-cd, hosting-options, env-secrets -->

**TL;DR:** A container packages your app with everything it needs to run, so it behaves the same on your laptop, a teammate's machine and a server.

### Explain
"It works on my machine" happens because machines differ: OS, language version, installed libraries. **Docker** solves it with containers.

- **Dockerfile** — a recipe: start from a base (`node:22-alpine`), copy your code, install dependencies, define the start command.
- **Image** — the built, read-only package from that recipe (the *blueprint*).
- **Container** — a running instance of an image (the *house built from it*). Lightweight, isolated, quick to start, unlike a full virtual machine.
- **Registry** — a storage place for images (Docker Hub, GitHub Container Registry).
- **Docker Compose** — a file that starts several containers together: your app, Postgres and Redis with one command.
- **Volumes** — storage that survives after a container is deleted (databases need these).
- **Kubernetes** — orchestrates many containers across many machines; overkill for most small projects.

Containers are ephemeral: anything written inside disappears on restart unless saved on a volume or external service.

### Analogy
A shipping container: whatever is inside, the crane, truck and ship handle it identically. The Dockerfile is the packing list.

### Why it matters
Hosts like Railway, Render, Fly.io and cloud platforms run containers. When AI gives you a `docker-compose.yml` to start a local database, you'll know you can run the whole stack with one command and delete it cleanly later.

### Example
```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
CMD ["npm", "start"]
```
```bash
docker compose up        # app + database + cache, all at once
```

### Takeaways
- Image = blueprint; container = running instance; Dockerfile = recipe.
- Compose runs multi-service local setups with a single command.
- Containers are disposable, so persistent data must live on volumes or external services.

### Glossary
- **Base image** — the starting layer you build upon, such as an OS plus Node.
- **Port mapping** — connecting a container's internal port to one on your machine.
- **Orchestration** — automatically running, scaling and healing many containers.
- **`.dockerignore`** — file listing things (like `node_modules`) to keep out of the image.

### Quiz
**Q:** What's the difference between an image and a container?
- [ ] They are the same thing
- [x] An image is the packaged blueprint; a container is a running instance of it
- [ ] A container is stored on a CDN
- [ ] An image can only run once
*Why:* You can start many containers from one image, like many houses from one blueprint.

**Q:** Your Postgres container is removed and all your data disappears. What was missing?
- [ ] A bigger CPU
- [ ] A CDN
- [ ] A linter
- [x] A volume to persist the database files
*Why:* Container filesystems are temporary; volumes keep data outside the container's lifecycle.

## Environment Variables & Secrets {#env-secrets}
<!-- emoji: 🗝️ | minutes: 9 | related: web-vulns-supply-chain, auth-sessions-jwt-oauth, hosting-options -->

**TL;DR:** Environment variables keep configuration and secret keys out of your code, and secrets must never be committed, shared or exposed to the browser.

### Explain
Apps need settings that differ per environment — the database URL for local vs production — and **secrets** such as API keys, which must stay private. Hard-coding them in source is dangerous because code gets pushed to git, shared and bundled.

Instead you use **environment variables (env vars)**: named values supplied to the app at runtime. Locally they often live in a `.env` file (listed in `.gitignore` so it is never committed). In production you enter them in your host's dashboard or a **secrets manager** (Vercel env settings, AWS Secrets Manager, Doppler, 1Password).

Critical gotchas:
- **Frontend exposure** — anything bundled into browser code is public. Prefixed variables such as `VITE_` or `NEXT_PUBLIC_` are *intentionally* shipped to the browser, so never put a private key there.
- **Git history** — deleting a committed key later doesn't remove it from history; you must **rotate** (revoke and replace) it.
- **Least privilege** — give keys the narrowest permissions and spend limits.

Bots scan GitHub constantly; leaked keys can be abused within minutes.

### Analogy
A secret key is a house key. Env vars are the key safe at the door; hard-coding is taping the key to the front door and posting a photo of it online.

### Why it matters
AI assistants happily paste a key into a file "just to get it working". Make it a rule: keys go in `.env`, `.env` is ignored, and LLM API calls happen on a *server*, not from the browser.

### Example
```bash
# .env  (never committed)
DATABASE_URL=postgres://user:pass@db.internal:5432/app
STRIPE_SECRET_KEY=sk_live_********

# .gitignore
.env
.env.*
!.env.example     # a safe template listing names only
```

### Takeaways
- Secrets live in env vars or a secrets manager, never in source code.
- Anything prefixed for the frontend is public by design.
- If a key leaks, rotate it immediately — deleting the commit isn't enough.

### Glossary
- **`.env.example`** — a committed template listing required variable names without real values.
- **Key rotation** — replacing a credential with a new one and revoking the old.
- **Secrets manager** — a service that stores, controls and audits access to sensitive values.
- **Least privilege** — granting only the permissions strictly needed.

### Quiz
**Q:** You accidentally committed an API key and then deleted the file in the next commit. What should you do?
- [ ] Nothing, it's gone now
- [ ] Rename the repository
- [x] Revoke and rotate the key, since it remains in git history
- [ ] Add more comments
*Why:* Old commits keep the key retrievable; only invalidating it makes it safe.

**Q:** Where should a paid LLM API key be used?
- [ ] Directly in React code so it's easy to call
- [x] On a server or serverless function, loaded from an env var
- [ ] In the page's HTML title
- [ ] Inside a public GitHub README
*Why:* Browser code is visible to everyone; a server keeps the key private and lets you enforce limits.

## DNS, Domains & HTTPS {#dns-https-domains}
<!-- emoji: 🌐 | minutes: 10 | related: client-server-http, hosting-options, cors-xss-csrf -->

**TL;DR:** DNS turns a domain name into a server address, and HTTPS uses TLS certificates to encrypt traffic and prove you've reached the right site.

### Explain
Computers find each other by IP addresses; humans prefer names. **DNS** (Domain Name System) is the internet's phone book that translates `example.com` into an IP such as `76.76.21.21`.

You rent a domain from a **registrar** (Namecheap, Cloudflare, Porkbun) and point it with **DNS records**:
- **A** — name → IPv4 address
- **AAAA** — name → IPv6 address
- **CNAME** — name → another name (alias), e.g. `www` → `cname.vercel-dns.com`
- **TXT** — free-form text, used to verify ownership or configure email (SPF/DKIM)
- **MX** — where email for the domain should go

Changes take time to spread because resolvers cache answers for the record's **TTL** — "propagation".

**HTTPS** is HTTP wrapped in **TLS** encryption. A **certificate** issued by a trusted authority (Let's Encrypt is free and automatic on most hosts) proves your server owns the domain. Without it browsers show warnings, and features like service workers and geolocation are blocked.

### Analogy
DNS is your phone's contacts app: you tap "Mum", and it dials the number. A TLS certificate is the caller ID verified by the phone company, and encryption is the call being scrambled for eavesdroppers.

### Why it matters
"Domain not working" is almost always a missing or wrong record, or just waiting for propagation. When your host asks you to "add a CNAME", you'll know what and where, and why HTTPS is not optional.

### Example
Connecting a custom domain to a Vercel site:

| Type | Name | Value |
|---|---|---|
| A | `@` | `76.76.21.21` |
| CNAME | `www` | `cname.vercel-dns.com` |

The host then issues a TLS certificate automatically, and `https://yourname.com` just works.

### Takeaways
- DNS maps names to addresses; records (A, CNAME, TXT, MX) say how.
- Changes spread according to TTL, so wait before assuming it's broken.
- HTTPS = encryption + identity via TLS certificates; it's the default requirement.

### Glossary
- **Registrar** — the company where you register and manage a domain name.
- **Nameserver** — the server that holds the authoritative DNS records for a domain.
- **Apex / root domain** — the bare domain without a subdomain, e.g. `example.com`.
- **Certificate authority (CA)** — an organisation trusted to issue TLS certificates.

### Quiz
**Q:** You want `www.mysite.com` to point to another hostname given by your host. Which DNS record type is the usual choice?
- [ ] MX
- [ ] TXT
- [x] CNAME
- [ ] AAAA
*Why:* A CNAME makes one name an alias for another name; MX is for email and TXT for verification text.

**Q:** You updated a DNS record but some people still see the old site. Why?
- [ ] DNS can't be changed
- [ ] The CSS is cached
- [x] Resolvers cache the old answer until its TTL expires (propagation)
- [ ] HTTPS blocks DNS changes
*Why:* DNS answers are cached around the world for the TTL duration, so updates spread gradually.

## CORS, XSS & CSRF {#cors-xss-csrf}
<!-- emoji: 🛑 | minutes: 12 | related: auth-sessions-jwt-oauth, web-vulns-supply-chain, client-server-http -->

**TL;DR:** Browsers enforce the same-origin policy for safety; CORS relaxes it deliberately, while XSS and CSRF are attacks that abuse trust between page, browser and server.

### Explain
An **origin** is scheme + host + port (`https://app.com:443`). The **same-origin policy** stops a page on one origin from reading responses from another.

- **CORS (Cross-Origin Resource Sharing)** — the server opts in via headers (`Access-Control-Allow-Origin`) to allow specific other origins to call it. The infamous "blocked by CORS policy" error is the *browser* refusing because the *server* didn't allow your origin. It's fixed on the server, not by disabling security. CORS is not an attack defence for the server itself — it only protects browsers.
- **XSS (cross-site scripting)** — an attacker gets their script to run inside your page (e.g. through unsanitised user comments). It can steal tokens or act as the user. Defences: escape/sanitise output, avoid `dangerouslySetInnerHTML`, use a **CSP**, and `HttpOnly` cookies.
- **CSRF (cross-site request forgery)** — a malicious site makes your browser send a request to a site where you're logged in, riding on your cookies. Defences: `SameSite` cookies, CSRF tokens, checking origin.
- **CSP (Content Security Policy)** — a header listing which script sources the page may run.

### Analogy
Same-origin policy is a building where each company's office door is locked. CORS is a company issuing a visitor badge to a specific partner. XSS is a forged note slipped into the company's own mail. CSRF is tricking an employee with a valid key into signing a form they didn't intend.

### Why it matters
When you hit a CORS error, ask the AI to "configure the allowed origin on the server" instead of adding a risky proxy hack or `*` with credentials. And always ask: does this feature render user-provided text or HTML?

### Example
```http
# Server response allowing exactly one frontend origin
Access-Control-Allow-Origin: https://app.example.com
Access-Control-Allow-Credentials: true
Set-Cookie: session=abc; HttpOnly; Secure; SameSite=Lax
```

### Takeaways
- CORS is the server telling browsers which other origins may read its responses.
- XSS = attacker script runs in your page; prevent by escaping output and using CSP.
- CSRF = attacker triggers actions with your cookies; prevent with SameSite and tokens.

### Glossary
- **Origin** — the combination of protocol, domain and port that defines a security boundary.
- **Preflight** — a browser's automatic `OPTIONS` request that checks if a cross-origin call is allowed.
- **HttpOnly cookie** — a cookie JavaScript cannot read, limiting theft through XSS.
- **Sanitise** — cleaning input so it can't contain harmful code.

### Quiz
**Q:** Your frontend gets "blocked by CORS policy" calling your API. Where is the correct fix?
- [ ] In the user's browser settings
- [x] On the API server, by allowing the frontend's origin in its response headers
- [ ] In the CSS
- [ ] By disabling HTTPS
*Why:* CORS is enforced by the browser based on the server's headers, so the server must grant permission.

**Q:** A comment box renders user input as raw HTML and someone posts a `<script>` tag that runs for every visitor. What is this?
- [ ] CSRF
- [ ] DNS spoofing
- [ ] Cache poisoning
- [x] XSS
*Why:* Attacker-supplied script executing in your page is cross-site scripting.

## OWASP Top 10 & Supply-Chain Risk {#web-vulns-supply-chain}
<!-- emoji: ☠️ | minutes: 12 | related: cors-xss-csrf, env-secrets, reviewing-ai-code -->

**TL;DR:** Most real breaches come from a short list of repeat mistakes — injection, broken access control, leaked secrets and vulnerable dependencies — all easy to introduce when moving fast with AI.

### Explain
The **OWASP Top 10** is a regularly updated list of the most common web security risks. The headline ones:

- **Broken access control** — users can reach data or actions they shouldn't (changing an ID in a URL).
- **Injection** — untrusted input becomes part of a command. **SQL injection** (`' OR 1=1 --`) is the classic; prompt injection is its LLM cousin. Fix: parameterised queries, never string-concatenate.
- **Cryptographic failures** — plain-text passwords, no HTTPS, home-made crypto.
- **Security misconfiguration** — default passwords, open storage buckets, debug mode on in production.
- **Vulnerable and outdated components** — old libraries with known holes.
- **Authentication failures** — weak sessions, no rate limiting on login.

**Supply-chain attacks** target the code you depend on: a malicious or hijacked npm package, a typo-squatted name (`reakt`), or a compromised build tool. Defences: lockfiles, fewer dependencies, `npm audit`, automated update bots (Dependabot), and checking unfamiliar packages.

Typical AI-code pitfalls: missing authorization checks, secrets in code, over-permissive CORS, trusting client input, and "hallucinated" package names an attacker may have registered.

### Analogy
Security is like a bank vault with a flimsy back door. Attackers don't pick the main lock; they find the unlocked window — usually one of the same few windows.

### Why it matters
You don't need to write secure code by hand, but you must *ask for it* and verify. Prompt your AI to "review this for OWASP Top 10 issues" and never install a package you can't identify.

### Example
```js
// ❌ vulnerable: user input glued into SQL
db.query("SELECT * FROM users WHERE email = '" + email + "'")

// ✅ parameterised: input is treated as data, never as SQL
db.query("SELECT * FROM users WHERE email = $1", [email])
```

### Takeaways
- Most breaches come from a small set of known weaknesses; OWASP lists them.
- Use parameterised queries, enforce authorization on the server and keep dependencies minimal and updated.
- Treat AI output as untrusted: review for access control, secrets and unknown packages.

### Glossary
- **SQL injection** — tricking a database into running attacker-supplied SQL via unsafe input handling.
- **Typosquatting** — publishing a malicious package whose name is a near-misspelling of a popular one.
- **CVE** — a publicly catalogued vulnerability with an ID like CVE-2024-12345.
- **Dependabot** — a bot that opens pull requests to update vulnerable dependencies.

### Quiz
**Q:** What is the robust defence against SQL injection?
- [ ] Hiding the database URL
- [ ] Making the form look professional
- [x] Parameterised queries that keep user input separate from the SQL command
- [ ] Using a longer password
*Why:* Parameterisation guarantees input is treated purely as data and can't change the query's structure.

**Q:** Your AI suggests installing an obscure package you've never heard of. Best response?
- [ ] Install it immediately — AI knows best
- [ ] Install it globally to be safe
- [ ] Copy its code into a secret file
- [x] Verify it exists, is maintained and is the intended library before installing
*Why:* Hallucinated or typosquatted names can pull in malicious code, a classic supply-chain risk.

## Monitoring, Logging & Errors {#monitoring-logging-errors}
<!-- emoji: 📈 | minutes: 9 | related: observability-tracing, ci-cd, hosting-options -->

**TL;DR:** Logs, metrics and error trackers tell you what your live app is doing and break before your users have to tell you.

### Explain
Once deployed you can't attach a debugger, so you rely on signals the app emits:

- **Logs** — time-stamped text events ("user 42 logged in", "payment failed: card declined"). Use **log levels** (debug, info, warn, error) and structured JSON logs so you can search them.
- **Metrics** — numbers over time: requests per second, error rate, response time, CPU, memory.
- **Traces** — the path of one request through multiple services with timings. Together these three are **observability**.
- **Error tracking** — tools like Sentry or Bugsnag capture exceptions with stack traces, browser info and the user's steps, and group duplicates.
- **Uptime monitoring** — pings your site every minute and alerts you when it's down.
- **Alerts** — notifications (email, Slack, phone) when a threshold is crossed. Too many alerts cause **alert fatigue**, so alert only on user impact.

Good practice: log events and IDs but never passwords, tokens or personal data, and track a few meaningful numbers such as latency and error rate (often by percentile, like p95).

### Analogy
Your car's dashboard: warning lights are alerts, the speedometer is metrics, and the black-box recorder is the logs you read after something goes wrong.

### Why it matters
AI-built apps fail in surprising ways in production. A one-line request such as "add Sentry and a health-check endpoint" gives you early warning and the stack trace you can paste straight back into your coding assistant.

### Example
```json
{ "level": "error", "time": "2026-03-02T09:14:22Z", "route": "POST /api/checkout",
  "userId": "u_42", "error": "Stripe timeout", "durationMs": 10012, "requestId": "r_8c1" }
```
Searching `requestId=r_8c1` shows every log line for that one failing request.

### Takeaways
- Logs say what happened, metrics show trends, traces show the journey of one request.
- Error trackers and uptime checks catch problems before users complain.
- Keep logs useful and safe: structured, searchable, and free of secrets.

### Glossary
- **Stack trace** — the list of function calls leading to an error, showing where it occurred.
- **p95 latency** — the response time that 95% of requests beat; reveals slow outliers that averages hide.
- **Health check** — a simple endpoint that reports whether the app is running.
- **SLA / SLO** — promised or targeted levels of availability and performance.

### Quiz
**Q:** Why log in structured JSON rather than free text?
- [ ] It uses fewer tokens
- [ ] It encrypts the logs
- [x] Fields can be searched and filtered by tools, e.g. by requestId or userId
- [ ] It makes the app faster
*Why:* Structure turns logs into queryable data instead of lines you must read by eye.

**Q:** Which should you never write into logs?
- [ ] Request IDs
- [ ] Error messages
- [ ] Response times
- [x] Passwords, API tokens and sensitive personal data
*Why:* Logs are widely accessible and long-lived; secrets in them become a security leak.

## Hosting Options {#hosting-options}
<!-- emoji: 🏠 | minutes: 10 | related: serverless-edge, ci-cd, pwa-native-wrappers -->

**TL;DR:** Where you host decides cost, scaling and effort — from free static hosting to managed platforms, VPSes and full cloud providers.

### Explain
Roughly from easiest to most control:

- **Static hosting / JAMstack** — Netlify, Vercel, Cloudflare Pages, GitHub Pages. Upload built files, get a CDN, HTTPS and previews. Often free for small sites. Many also run serverless functions.
- **PaaS (Platform-as-a-Service)** — Render, Railway, Fly.io, Heroku. Push code or a container; they run servers, databases and workers for you. Predictable and simple.
- **BaaS** — Supabase, Firebase: managed backend features you plug in (see serverless).
- **VPS (virtual private server)** — DigitalOcean, Hetzner, Linode. You rent a Linux machine and manage it: cheap and flexible, but you handle updates, security and backups.
- **Big cloud (IaaS + services)** — AWS, Google Cloud, Azure. Every building block imaginable, with steep learning and billing complexity.
- **App stores** — for native or Capacitor apps; separate review and release process.

Decision factors: traffic shape, need for long-running processes or websockets, database location, team skills, **egress/bandwidth** charges, and surprise bills. Set **budget alerts** and prefer platforms with spending limits.

### Analogy
Static hosting is renting a market stall, PaaS is a serviced office, a VPS is leasing an empty floor you must fit out yourself, and big cloud is buying a whole industrial estate.

### Why it matters
For most vibe-coded projects the right path is: static or Next.js on Vercel/Netlify, managed database, and move up only when you hit real limits. Ask your AI which tier your app actually needs rather than defaulting to the most complex setup.

### Example
| Project | Good starting host |
|---|---|
| Portfolio, docs, PWA learning app | Netlify / Vercel / Cloudflare Pages |
| SaaS with Postgres + background jobs | Render / Railway / Fly.io |
| Side project needing cheap always-on bot | Small VPS |
| Enterprise with compliance needs | AWS / GCP / Azure |

### Takeaways
- Climb the ladder only as needed: static → PaaS → VPS → cloud.
- Long-running processes and WebSockets need more than pure static or serverless hosting.
- Watch egress costs and set budget alerts to avoid surprise bills.

### Glossary
- **PaaS** — a platform that runs your code and infrastructure so you only push the app.
- **Egress** — data leaving the provider's network, often billed per GB.
- **Region** — the geographic location of a data centre where your app and data run.
- **Uptime** — the percentage of time a service is available.

### Quiz
**Q:** A static React learning app with no backend needs hosting that is free, fast and has HTTPS. What fits best?
- [ ] A self-managed Linux VPS
- [ ] A Kubernetes cluster
- [x] Static hosting such as Netlify or Vercel
- [ ] A dedicated database server
*Why:* Static hosts serve built files from a CDN with HTTPS and previews at little or no cost.

**Q:** What is a key downside of running your own VPS?
- [x] You are responsible for updates, security and backups
- [ ] You can't install software
- [ ] It cannot host a website
- [ ] It requires a framework
*Why:* A VPS gives full control, which also means you maintain the operating system and its safety.
