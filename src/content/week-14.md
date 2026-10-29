# Week 14: Backend & Data

## Client, Server & HTTP {#client-server-http}
<!-- emoji: 🔁 | minutes: 11 | lab: request-flow | related: rest-graphql-apis, dns-https-domains, caching-redis-cdn -->

**TL;DR:** Every web interaction is a client sending an HTTP request and a server sending back a response with a status code.

### Explain
The **client** (browser, mobile app, another server) asks; the **server** answers. They speak **HTTP**, a simple text-based protocol.

A **request** contains:
- a **method** — `GET` (read), `POST` (create), `PUT`/`PATCH` (update), `DELETE`
- a **URL** (which resource)
- **headers** (metadata: auth tokens, content type, cookies)
- an optional **body** (the JSON you're sending)

A **response** carries a **status code** — `200` OK, `201` created, `301/302` redirect, `400` bad request, `401` not logged in, `403` forbidden, `404` not found, `429` too many requests, `500` server error — plus headers and a body.

What happens on a click: the browser looks up the server's IP (**DNS**), opens a connection, negotiates encryption (**TLS**), sends the request, the server runs code and maybe queries a database, then replies. HTTP itself is **stateless**: each request stands alone, which is why cookies and tokens exist.

### Analogy
Ordering at a restaurant: the method is what you want to do, the URL is the dish, headers are your table number and allergies, and the status code is the waiter's "coming up" or "sorry, we're out".

### Why it matters
Browser dev tools' **Network tab** is your best debugging friend. "I get a 401" or "CORS blocked it" or "500 on POST" are precise reports you can paste to an AI. 4xx means *you* asked wrongly; 5xx means the *server* broke.

### Example
Use the lab to step a request through DNS, TCP/TLS, server, database and back, and note where time is spent. A raw request looks like:

```http
POST /api/lessons HTTP/1.1
Host: api.example.com
Authorization: Bearer eyJhbGciOi...
Content-Type: application/json

{"title":"Tokens","minutes":9}
```
Likely reply: `201 Created` with the new lesson as JSON.

### Takeaways
- Request = method + URL + headers + body; response = status + headers + body.
- 2xx success, 3xx redirect, 4xx client mistake, 5xx server failure.
- HTTP is stateless; identity is carried by cookies or tokens on every request.

### Glossary
- **Idempotent** — doing it twice has the same effect as once (GET, PUT, DELETE are; POST usually isn't).
- **Latency** — the delay between asking and getting a response.
- **Header** — key/value metadata sent with a request or response.
- **Localhost** — your own machine, where dev servers run.

### Quiz
**Q:** You get a `404` from an endpoint you just called. What does it most likely mean?
- [ ] The server crashed
- [x] The URL or resource doesn't exist
- [ ] You're not logged in
- [ ] You're sending requests too fast
*Why:* 404 means not found; a crash would be 5xx, missing login 401, and rate limiting 429.

**Q:** Why do websites need cookies or tokens if HTTP already has requests?
- [ ] HTTP encrypts data only with cookies
- [ ] Servers can't read headers
- [ ] Cookies make pages load faster
- [x] HTTP is stateless, so each request must carry proof of who you are
*Why:* The server doesn't remember previous requests by itself, so identity travels with every call.

## REST, GraphQL & APIs {#rest-graphql-apis}
<!-- emoji: 🔌 | minutes: 10 | related: client-server-http, function-calling, auth-sessions-jwt-oauth -->

**TL;DR:** An API is a defined way for one program to ask another for data or actions, most often through REST endpoints or a GraphQL query.

### Explain
An **API** (application programming interface) is a menu of what a service lets you do. Over the web, the main styles are:

- **REST** — resources have URLs and you use HTTP methods on them: `GET /users/42`, `POST /orders`. Responses are usually JSON. Simple, cacheable, ubiquitous. Weakness: you may fetch too much (**over-fetching**) or need several calls (**under-fetching**).
- **GraphQL** — one endpoint; the client writes a query naming exactly the fields it wants and gets exactly that. Great for complex UIs; harder to cache and secure.
- **RPC** (gRPC, tRPC) — call a remote function by name, with typed inputs and outputs. Popular between your own frontend and backend.
- **Webhooks** — the reverse: the service calls *your* URL when something happens (a payment succeeded).

Practical details: an **API key** or token identifies you; **rate limits** cap how fast you can call; an **OpenAPI** (Swagger) file documents endpoints in a machine-readable way, which makes it easy for AI tools to generate clients; **versioning** (`/v2/`) lets APIs change safely.

### Analogy
An API is the menu and waiter of a kitchen: you don't enter the kitchen, you order from what's listed. REST is a fixed menu, GraphQL is "build your own bowl", a webhook is the kitchen buzzing your pager.

### Why it matters
LLM provider calls, Stripe, Maps and your own backend are all APIs. When your AI says "add an endpoint", "paginate it" or "handle rate limit errors", you'll know the shape of what's being built — and can ask for an OpenAPI spec first.

### Example
```http
GET /v1/lessons?week=6&limit=10
```
```json
{ "data": [{ "id": "chunking", "title": "Chunking" }], "next": "cursor_abc" }
```
The `limit` plus `next` cursor is **pagination**, so the server never returns thousands of rows at once.

### Takeaways
- REST models resources + HTTP verbs; GraphQL lets clients pick fields; RPC calls functions.
- Keys, rate limits, pagination and versioning are the practical realities of every API.
- OpenAPI specs describe an API so tools and AIs can use it correctly.

### Glossary
- **Endpoint** — a specific URL plus method that performs one operation.
- **Pagination** — returning large lists in small pages.
- **JSON** — the lightweight text format most APIs use for data.
- **Webhook** — an HTTP call a service makes to your server when an event occurs.

### Quiz
**Q:** A mobile screen needs only a user's name and avatar but the REST endpoint returns 40 fields. What is this called?
- [ ] Under-fetching
- [x] Over-fetching
- [ ] Hydration
- [ ] Throttling
*Why:* Getting more data than needed is over-fetching, one of the motivations for GraphQL.

**Q:** Stripe calls your server when a payment completes. What is that mechanism?
- [ ] Polling
- [ ] A GraphQL query
- [ ] A cookie
- [x] A webhook
*Why:* A webhook is a callback from the service to your URL, so you don't need to keep asking.

## Auth: Sessions, JWT & OAuth {#auth-sessions-jwt-oauth}
<!-- emoji: 🔑 | minutes: 12 | related: client-server-http, env-secrets, cors-xss-csrf -->

**TL;DR:** Authentication proves who you are; authorization decides what you may do; sessions, tokens and OAuth are the machinery that carries both.

### Explain
Two questions, easily confused:
- **Authentication (authn)** — *who are you?* (password, passkey, Google login)
- **Authorization (authz)** — *what may you do?* (admin vs member, owner of this document)

Ways to stay logged in:
- **Session + cookie** — the server stores a session record and gives your browser a random ID in a cookie. Easy to revoke. Needs server storage.
- **JWT (JSON Web Token)** — a signed token containing claims like `userId` and `exp` that the server can verify without a lookup. Convenient for APIs, but hard to revoke before it expires and dangerous if stored carelessly.
- **OAuth 2.0 / OIDC** — "Sign in with Google": you never see the user's password; Google hands your app a token after consent. OAuth is delegated *access*, OIDC adds *identity*.
- **Passkeys** — passwordless login using device biometrics and public-key cryptography; phishing-resistant.

Passwords must be stored **hashed** (with bcrypt, scrypt or argon2) plus salt — never in plain text. Add **MFA** for important accounts.

### Analogy
Authn is showing your ID at the door. Authz is the wristband that decides which rooms you can enter. A session is a coat-check ticket; a JWT is a signed pass the staff can verify on sight.

### Why it matters
Auth is the area where AI-generated code is most dangerous. Prefer a proven provider (Clerk, Auth0, Supabase Auth, NextAuth) over hand-rolled login, and always check that every endpoint verifies *authorization*, not just login.

### Example
A JWT is three Base64 parts separated by dots:

```text
header.payload.signature
payload → { "sub": "user_42", "role": "member", "exp": 1767225600 }
```
Anyone can *read* the payload; only the server's secret can produce a valid signature. So never put secrets inside it.

### Takeaways
- Authn = identity; authz = permission; check both on every protected action.
- Sessions are server-stored and revocable; JWTs are self-contained and stateless.
- Use OAuth/OIDC or passkeys through a trusted provider, and hash passwords properly.

### Glossary
- **Hashing** — a one-way transformation, so stored passwords can be checked but not read back.
- **MFA** — multi-factor authentication; two or more proofs of identity.
- **Refresh token** — a long-lived token used to get new short-lived access tokens.
- **RBAC** — role-based access control: permissions granted through roles like admin or editor.

### Quiz
**Q:** A logged-in user changes `/orders/17` to `/orders/18` in the URL and sees someone else's order. Which control is missing?
- [ ] Authentication
- [x] Authorization
- [ ] Hashing
- [ ] HTTPS
*Why:* The user was authenticated but the server never checked they were allowed to view that specific order.

**Q:** Which statement about JWTs is true?
- [ ] The payload is encrypted by default
- [ ] They are immediately revocable server-side
- [ ] They replace the need for HTTPS
- [x] The payload is readable by anyone; the signature only prevents tampering
*Why:* A standard JWT is encoded, not encrypted, so secrets don't belong in it.

## Databases: SQL & NoSQL {#databases-sql-nosql}
<!-- emoji: 🗃️ | minutes: 11 | related: orm-migrations, caching-redis-cdn, rag-overview -->

**TL;DR:** A database stores your app's data durably; SQL databases organise it in related tables, while NoSQL stores flexible documents, keys or graphs.

### Explain
Variables vanish when a program restarts. A **database** keeps data safe and queryable.

**Relational (SQL)** databases — PostgreSQL, MySQL, SQLite — use **tables** (rows and columns) with a fixed **schema**. Tables relate through keys: an `orders` row holds a `user_id` pointing to a `users` row, and a **JOIN** combines them in a query. An **index** is a lookup shortcut that makes searches fast, at some write cost. **ACID** transactions mean a group of changes either all succeed or all fail (move money out *and* in, or neither), and committed data survives crashes.

**NoSQL** is a family: **document** stores (MongoDB, Firestore) keep JSON-like blobs; **key-value** (Redis, DynamoDB) map a key to a value; **graph** (Neo4j) store relationships; **vector** databases search by meaning.

Defaults: pick **Postgres** unless you have a strong reason — it handles relations, JSON and even vectors. **SQLite** is a single-file database, great for local and small apps.

### Analogy
SQL is a well-organised spreadsheet workbook with linked tabs and strict columns. A document store is a filing cabinet of folders where each folder can hold different papers.

### Why it matters
Slow pages are often a missing index or an N+1 query pattern (one query per row). Your AI can design schemas, but you must decide what the entities are and how they relate — and insist on backups and migrations.

### Example
```sql
SELECT u.name, COUNT(o.id) AS orders
FROM users u
JOIN orders o ON o.user_id = u.id
WHERE o.created_at > now() - interval '30 days'
GROUP BY u.name;
```
In words: "per user, how many orders in the last 30 days?" A `created_at` index keeps this fast at millions of rows.

### Takeaways
- SQL = structured, related tables with transactions; NoSQL = flexible shapes optimised for specific access patterns.
- Indexes speed up reads; transactions keep multi-step changes consistent.
- When unsure, start with Postgres (or SQLite for tiny local apps).

### Glossary
- **Primary key** — the unique identifier of each row.
- **Foreign key** — a column that points to a row in another table.
- **Schema** — the declared structure of tables and fields.
- **N+1 query** — running one query for a list and then one more per item, a classic performance trap.

### Quiz
**Q:** A bank transfer must debit one account and credit another, never only one. Which database property ensures this?
- [ ] Indexing
- [ ] Sharding
- [x] ACID transactions
- [ ] Caching
*Why:* A transaction groups both writes so they commit together or roll back together.

**Q:** Queries on a huge `orders` table filtering by `user_id` are slow. What's the first thing to check?
- [ ] Switch the front end to React
- [ ] Add more CSS
- [ ] Rename the table
- [x] Whether `user_id` has an index
*Why:* Without an index the database scans every row; an index lets it jump straight to matches.

## ORMs, Schemas & Migrations {#orm-migrations}
<!-- emoji: 🧬 | minutes: 9 | related: databases-sql-nosql, ci-cd, typescript-types -->

**TL;DR:** An ORM lets you work with database tables as code objects, and migrations are versioned scripts that change the database structure safely over time.

### Explain
Writing raw SQL strings everywhere is error-prone. An **ORM** (object-relational mapper) such as Prisma, Drizzle, TypeORM, SQLAlchemy or ActiveRecord maps tables to code: you define a **schema** and then call `db.user.findMany(...)` instead of hand-writing SQL. Modern TypeScript ORMs generate types from your schema, so a typo in a column name is a compile error.

Your app's data structure *will* change. A **migration** is a small, ordered script (add column `plan`, create table `invoices`) that updates the database from version N to N+1. Migrations are committed to git and run on every environment — local, staging, production — so everyone ends up with the same structure. Tools can also generate them by diffing your schema file.

A **seed** script fills a fresh database with sample data for development.

Dangers: destructive migrations (dropping a column deletes data), long locks on big tables, and ORM-generated queries that quietly become slow (N+1). ORMs are convenient, but they are not magic — raw SQL is still available for hard queries.

### Analogy
Migrations are like building renovation permits filed in order: "add a second floor", then "install a lift". Anyone rebuilding the house can replay the list and reach the same result.

### Why it matters
When an AI says "I updated the schema", ask: *where's the migration, and is it safe against production data?* Never let it edit a live database by hand, and always back up before destructive changes.

### Example
```prisma
model Lesson {
  id      String @id @default(cuid())
  title   String
  minutes Int    @default(10)
  weekId  String
  week    Week   @relation(fields: [weekId], references: [id])
}
```
Running `prisma migrate dev` writes a SQL migration file that creates this table.

### Takeaways
- ORMs give typed, code-level access to tables and reduce raw-SQL mistakes.
- Migrations are version-controlled, replayable database changes.
- Treat destructive migrations and production data with extreme care; back up first.

### Glossary
- **Schema file** — the code description of tables, fields and relations the ORM reads.
- **Seed** — script that inserts starter or test data.
- **Rollback** — undoing a migration to return to the previous structure.
- **Query builder** — a lighter tool that composes SQL in code without full ORM abstractions.

### Quiz
**Q:** Why commit migration files to git?
- [x] So every environment can apply the same ordered schema changes
- [ ] To speed up queries
- [ ] To encrypt the database
- [ ] To avoid writing tests
*Why:* Versioned migrations make database structure reproducible and reviewable like any other code.

**Q:** Which migration deserves the most caution on production?
- [ ] Adding a nullable column
- [ ] Creating a new table
- [ ] Adding an index with a safe online method
- [x] Dropping a column that contains data
*Why:* Dropping removes data permanently; the others are additive and mostly reversible.

## Caching, Redis & CDNs {#caching-redis-cdn}
<!-- emoji: ⚡ | minutes: 10 | related: databases-sql-nosql, semantic-caching, serverless-edge -->

**TL;DR:** Caching keeps a copy of expensive results close at hand so repeat requests are fast, at the price of possibly serving slightly stale data.

### Explain
Computing or fetching something is slow; reusing a stored answer is fast. Caches exist in layers:

- **Browser cache** — files saved on the user's device, controlled by `Cache-Control` headers.
- **CDN (content delivery network)** — servers around the world (Cloudflare, Vercel, CloudFront) that keep copies of your static files and sometimes pages near users.
- **Application cache** — in-memory results inside your server, for example the output of a heavy calculation.
- **Redis / Memcached** — fast in-memory key-value stores shared by many servers; also used for sessions, rate limits and queues.
- **Database cache / query cache** — so repeated queries skip the disk.

Key concepts: **TTL** (time-to-live: how long an entry stays valid), **cache hit vs miss**, and **invalidation** — deciding when a cached copy is no longer right. That last one is famously hard ("there are only two hard things in computer science…").

Common failure: you deploy a fix but users still see the old version because a browser, CDN or service worker kept the old file.

### Analogy
A cache is your fridge. Going to the shop (database) every time is slow, so you keep what you use often nearby. The risk is eating something that expired.

### Why it matters
"I deployed but nothing changed" and "my API is slow and expensive" are often cache stories. You can ask the AI for a "cache with a 5-minute TTL and invalidation on update" — and for LLM calls, cache repeated prompts to save real money.

### Example
```http
Cache-Control: public, max-age=31536000, immutable   # hashed JS/CSS: cache for a year
Cache-Control: no-cache                              # index.html: always revalidate
```
Hashed filenames like `app.8f3a1c.js` can be cached forever because a new build produces a new name.

### Takeaways
- Caches trade freshness for speed, at the browser, CDN, app and data layers.
- TTLs and invalidation rules decide how stale data can get.
- Cache-bust static assets with hashed filenames; revalidate HTML.

### Glossary
- **Cache hit / miss** — found in the cache (fast) or not found, so the real source is used (slow).
- **Edge cache** — a CDN copy stored at a location near the user.
- **Cache-Control** — the HTTP header that tells caches how long and whether they may store a response.
- **Stale-while-revalidate** — serve the old copy immediately while fetching a fresh one in the background.

### Quiz
**Q:** You deployed a bug fix but users still see the old page. Which is a plausible cause?
- [ ] The database was indexed
- [ ] HTTP is stateless
- [x] A browser, CDN or service worker is serving a cached copy
- [ ] The CSS has too many selectors
*Why:* Any cache layer may continue serving an old file until its TTL expires or it is invalidated.

**Q:** What is Redis most commonly used for?
- [ ] Designing logos
- [ ] Compiling TypeScript
- [x] A very fast in-memory store for caching, sessions and rate limits
- [ ] Hosting static websites
*Why:* Redis keeps data in RAM as key-value pairs, ideal for temporary, frequently read data.

## Queues, WebSockets & Realtime {#queues-websockets-realtime}
<!-- emoji: 📡 | minutes: 10 | related: client-server-http, serverless-edge, streaming -->

**TL;DR:** Queues move slow work to background workers, while WebSockets, SSE and polling keep the screen updated without refreshing.

### Explain
Two different problems hide here.

**1. Slow work — use a queue.** Sending an email, resizing a video or calling an LLM can take seconds. Instead of making the user wait, the server drops a **job** on a **queue** (BullMQ, SQS, RabbitMQ, Inngest) and replies immediately. A **background worker** picks it up and processes it, with **retries** if it fails. Scheduled jobs are called **cron jobs**.

**2. Live updates — pick a realtime tool.**
- **Polling** — ask every few seconds. Simple, wasteful.
- **Server-Sent Events (SSE)** — the server pushes a one-way stream over HTTP. Perfect for streaming LLM tokens and notifications.
- **WebSockets** — a persistent two-way connection. Ideal for chat, multiplayer and collaborative editing.
- **Pub/sub** — publishers broadcast messages to topics; subscribers receive them. Services like Supabase Realtime and Ably wrap this.

Realtime connections need servers that stay alive, which is awkward on pure serverless platforms.

### Analogy
A queue is a restaurant's order rail: the waiter clips the ticket and leaves; the kitchen works through them. WebSockets are an open phone line; polling is calling every minute to ask "ready yet?"

### Why it matters
If an endpoint "times out" doing heavy work, the answer is usually a queue plus a status check. If a chat app needs instant updates, you now know to ask for SSE or WebSockets, not a refresh button.

### Example
```text
User clicks "Generate report"
  → POST /reports  → 202 Accepted { jobId: "j_91" }       (instant)
  → worker builds the PDF in the background
  → client listens on SSE /reports/j_91/events → "done" → shows download link
```

### Takeaways
- Queues + workers take slow or unreliable work off the request path.
- SSE for one-way streams, WebSockets for two-way live apps, polling as the simple fallback.
- Realtime needs long-lived connections, which affects where you host.

### Glossary
- **Worker** — a process that takes jobs from a queue and does the work.
- **Retry with backoff** — trying a failed job again after progressively longer waits.
- **202 Accepted** — status meaning "received, still processing".
- **Cron job** — a task scheduled to run at set times.

### Quiz
**Q:** You stream an LLM's answer token by token to the browser, one direction only. Which is the simplest fit?
- [x] Server-Sent Events
- [ ] A cron job
- [ ] A relational join
- [ ] A DNS record
*Why:* SSE is a lightweight one-way server push over HTTP, which suits token streaming.

**Q:** Generating a report takes 40 seconds and requests keep timing out. Best fix?
- [ ] Increase the font size
- [ ] Cache the login page
- [ ] Remove the database
- [x] Enqueue a background job and let the client check status or listen for completion
*Why:* Long tasks shouldn't block an HTTP request; queues decouple the work from the response.

## Serverless, Edge & BaaS {#serverless-edge}
<!-- emoji: ☁️ | minutes: 10 | related: hosting-options, rendering-modes, queues-websockets-realtime -->

**TL;DR:** Serverless runs your code only when called without you managing servers, the edge runs it near users, and BaaS hands you ready-made backend features.

### Explain
"Serverless" doesn't mean no servers; it means *you don't manage them*.

- **Serverless functions** (AWS Lambda, Vercel Functions, Cloudflare Workers) — small pieces of backend code that start on demand, scale automatically from zero to thousands, and bill per execution. Downsides: **cold starts** (a delay when an idle function boots), time limits, and awkward fit for long-lived connections or heavy state.
- **Edge runtimes** — run code in data centres close to the user for very low latency, with a restricted environment (limited APIs, small size).
- **BaaS (Backend-as-a-Service)** — Supabase, Firebase, Appwrite, Convex: managed database, auth, file storage and realtime behind a ready API and client SDK. You skip writing most of the backend.

Trade-offs: speed of building and effortless scaling versus vendor lock-in, per-use costs that can spike, and less control. Rule of thumb: BaaS + serverless is excellent for prototypes and small teams; reconsider when workloads become heavy, steady or highly specialised.

### Analogy
Serverless is taking a taxi instead of owning a car: pay per ride, no garage or maintenance, but there's a wait when you call and a surge price at rush hour.

### Why it matters
Vibe-coded apps commonly use "Next.js on Vercel + Supabase". Understanding cold starts, limits and lock-in lets you spot why one endpoint feels slow or a bill grows, and decide when to move work to a queue or a real server.

### Example
```ts
// A complete serverless endpoint — no server to set up
export default async function handler(req: Request) {
  const { name } = await req.json()
  return Response.json({ message: `Hello, ${name}` })
}
```
Deploy it and it gets a public URL, HTTPS and autoscaling automatically.

### Takeaways
- Serverless = on-demand functions with auto-scaling and pay-per-use.
- Edge = run code geographically close to users with a limited runtime.
- BaaS bundles database, auth, storage and realtime, trading control for speed.

### Glossary
- **Cold start** — extra delay when a function must start up after being idle.
- **Vendor lock-in** — difficulty moving away from a provider's proprietary services.
- **Autoscaling** — capacity automatically growing or shrinking with traffic.
- **SDK** — a software development kit: client code that makes using a service's API easier.

### Quiz
**Q:** What is a "cold start"?
- [ ] Deleting a database
- [ ] A frozen CSS animation
- [x] The delay when an idle serverless function has to boot before handling a request
- [ ] A failed deploy
*Why:* Functions that scale to zero need a moment to initialise on the first request after being idle.

**Q:** Which choice best matches "I want auth, a database and file uploads without writing a backend"?
- [ ] A bare VPS
- [ ] Writing raw TCP sockets
- [ ] A static site generator only
- [x] A BaaS such as Supabase or Firebase
*Why:* BaaS platforms provide those backend building blocks as managed services with client SDKs.
