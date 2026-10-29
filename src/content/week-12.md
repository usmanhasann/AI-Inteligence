# Week 12: Shipping AI Products

## Streaming {#streaming}
<!-- emoji: 🌊 | minutes: 8 | related: latency-ttft, llm-api-anatomy, ai-ux-patterns -->

**TL;DR:** Streaming sends the model's reply token by token as it is generated, so users see words appear immediately instead of waiting for the whole answer.

### Explain
A long answer can take 20 seconds to generate. Without streaming, the user stares at a spinner for all of it. With **streaming**, the first words appear in under a second and the text "types out" while the rest is still being produced.

How it works: you set `stream: true`, and the server keeps the HTTP connection open and pushes small **events** as each chunk of tokens is ready. The usual technology is **Server-Sent Events (SSE)** — a one-way stream from server to browser. (WebSockets are two-way and heavier; usually unnecessary for chat.)

Your frontend reads each chunk and appends it to the message. Things to handle:
- **Partial content** — half a word, half a Markdown block, half a JSON object.
- **Cancellation** — a stop button should abort the request, which also stops billing for further tokens.
- **Errors mid-stream** — the connection can fail after some text has shown.
- **Tool calls** — they arrive in pieces too.

Streaming doesn't make the model faster overall. It makes the wait *feel* shorter.

### Analogy
A restaurant bringing dishes as each is ready instead of making you wait for the full ten-course meal to be plated.

### Why it matters
Streaming is the single biggest perceived-speed upgrade for chat UIs. If your assistant's app feels sluggish, ask whether it streams, and whether the Stop button truly cancels.

### Example
What the browser receives, simplified:

```
data: {"delta": "Stre"}
data: {"delta": "aming "}
data: {"delta": "feels fast."}
data: {"done": true, "usage": {"output_tokens": 6}}
```

Your UI appends each `delta` to the visible message as it arrives.

### Takeaways
- Streaming shows output progressively; total time is the same, perceived time is far shorter.
- SSE is the common transport for one-way streams.
- Handle partial content, cancellation and mid-stream failures.

### Glossary
- **SSE** — Server-Sent Events: a simple way for a server to push events over a single HTTP connection.
- **Delta / chunk** — A small piece of newly generated output.
- **Abort** — Cancelling an in-flight request, usually from a stop button.

### Quiz
**Q:** What does streaming change for users?
- [ ] The model becomes more accurate
- [x] They see the response appear immediately instead of waiting for completion
- [ ] The answer costs nothing
- [ ] The context window grows
*Why:* Total generation time is unchanged, but the first words show up quickly, which feels much faster.

**Q:** Which is a common streaming pitfall?
- [ ] Words look too fast
- [x] Rendering half-finished Markdown or JSON before the rest arrives
- [ ] Browsers can't display text
- [ ] SSE only works on weekdays
*Why:* Partial content must be handled gracefully, for example by rendering Markdown incrementally and parsing JSON only when complete.

## Latency & TTFT {#latency-ttft}
<!-- emoji: ⏱️ | minutes: 8 | related: streaming, model-routing-gateways, caching-redis-cdn -->

**TL;DR:** Latency is how long users wait: time-to-first-token for responsiveness, plus tokens-per-second for how fast the rest arrives.

### Explain
Speed has several parts, and they're fixed by different things:

- **TTFT (time to first token)** — the delay before the first word appears. Affected by input length, model size, network and queueing. This is what makes an app feel responsive.
- **Output speed (tokens per second)** — how quickly the rest streams out. Mostly model- and hardware-dependent.
- **End-to-end latency** — everything, from click to finished answer: network, your backend, retrieval (RAG), tool calls, model time and rendering.

A rough formula: *total ≈ TTFT + (output tokens ÷ tokens per second) + everything else.*

Levers for reducing it:
- **Shorter prompts** and **prompt caching** reduce TTFT.
- **Smaller or faster models** for simple tasks.
- **Shorter outputs** ("answer in 3 bullets").
- **Streaming** to improve perceived speed.
- **Parallelise** independent steps (retrieval plus a database lookup).
- **Cache** repeated answers.

Agents multiply latency, because each loop step adds a model round trip.

### Analogy
A taxi ride: TTFT is how long until the cab pulls away; tokens per second is its cruising speed; end-to-end includes traffic and parking.

### Why it matters
"It's slow" has different fixes depending on which part is slow. Measure first: is it the first token, the generation, or your own backend?

### Example
Diagnosing a 14-second chat reply:

```
Retrieval (RAG search):   1.2 s
Model TTFT:               2.1 s
Generation (600 tokens @ 50 tok/s): 12 s  <- biggest cost
Fix: ask for concise answers + use a faster model for simple questions
```

### Takeaways
- TTFT drives responsiveness; tokens/sec drives completion time.
- Shorter prompts, caching and smaller models cut latency.
- Measure each stage before optimising.

### Glossary
- **TTFT** — Time to first token: delay before output starts.
- **Throughput** — How much work (requests or tokens) a system handles per second.
- **p95 latency** — The time under which 95% of requests finish; reveals slow outliers.

### Quiz
**Q:** Users say the chat "feels frozen" for several seconds before text appears. Which metric is high?
- [ ] Output tokens per second
- [x] Time to first token
- [ ] Context window size
- [ ] Temperature
*Why:* The delay before anything shows is TTFT. Streaming and shorter prompts help.

**Q:** Which change reduces the time to finish a long answer most directly?
- [ ] Adding more system prompt text
- [ ] Switching on a bigger context window
- [x] Requesting shorter output or using a faster model
- [ ] Lowering the temperature to 0
*Why:* Completion time scales with output tokens divided by generation speed.

## Token Pricing & Cost {#token-pricing}
<!-- emoji: 💰 | minutes: 9 | lab: cost-calculator | related: token, prompt-caching, batch-async-apis -->

**TL;DR:** LLM APIs charge per million tokens, with output tokens costing more than input — so cost depends on how much you send, how much comes back and how often.

### Explain
You pay for tokens, usually quoted **per million**. The pricing quirks:

- **Input vs output** — output tokens cost several times more than input tokens.
- **Model tier** — bigger or reasoning models cost far more than small ones.
- **Cached input** — repeated prompt prefixes read from the cache are heavily discounted (see prompt caching).
- **Batch** — asynchronous batch jobs are typically discounted.
- **Reasoning tokens** — hidden "thinking" tokens are billed as output.
- **Hidden multipliers** — long chat history is re-sent each turn, tools add tokens, and agents loop.

Cost per request = (input tokens × input price) + (output tokens × output price). Multiply by requests per user per day and users to forecast.

Typical cost traps: stuffing whole documents into every prompt, unbounded chat history, agents with no step limit, and using the strongest model for trivial tasks.

Always monitor real usage: the API reports token counts on every response.

### Analogy
A taxi meter with two rates — a cheap one for listening (input) and a pricey one for talking (output) — plus a discount if you take the same route repeatedly (cache).

### Why it matters
An AI feature that costs 2¢ per use is fine at 100 users and painful at 1M. Estimate before launch, and set budgets and alerts.

### Example
Open the cost calculator lab. Set a 2,000-token input and 500-token output, 10,000 requests per day, then toggle caching and swap the model tier. Notice how much the output side and model choice move the monthly total.

```
cost/request = 2,000 × input_price + 500 × output_price
monthly      = cost/request × requests/day × 30
```

### Takeaways
- Price = tokens in × input rate + tokens out × output rate.
- Output, bigger models and reasoning tokens cost the most.
- Caching, batching, shorter prompts and routing cut the bill.

### Glossary
- **Per-million pricing** — The standard unit: dollars per 1,000,000 tokens.
- **Reasoning tokens** — Thinking tokens generated before the answer and billed like output.
- **Budget alert** — A notification when spending crosses a threshold.

### Quiz
**Q:** Which usually costs more per token?
- [ ] Input tokens
- [x] Output tokens
- [ ] They are always equal
- [ ] Cached tokens
*Why:* Generation is more expensive than reading, so output rates are typically several times higher.

**Q:** A chatbot's bill grows quickly during long conversations. A likely reason is:
- [ ] The model gets bored
- [ ] Tokens expire
- [x] The whole history is re-sent as input on every turn
- [ ] Output tokens are free
*Why:* APIs are stateless, so each new message pays again for all prior context unless you trim, summarise or cache it.

## Rate Limits & Retries {#rate-limits-retries}
<!-- emoji: 🚦 | minutes: 8 | related: llm-api-anatomy, fallbacks-reliability, batch-async-apis -->

**TL;DR:** Providers cap how many requests and tokens you can use per minute; when you exceed them you get a 429 error, and you should retry with exponential backoff.

### Explain
APIs protect themselves with **rate limits**:
- **RPM** — requests per minute.
- **TPM** — tokens per minute (input plus output).
- Daily or monthly **quotas** and spend caps.

Exceed them and you receive HTTP **429 Too Many Requests**. Other transient errors include 500s, 529 "overloaded" and network timeouts.

The standard fix is **retry with exponential backoff and jitter**: wait 1 s, then 2 s, then 4 s, and so on, adding a random bit of delay so thousands of clients don't all retry at the same instant. Respect the `Retry-After` header if present, and cap the number of attempts.

Not every error should be retried: 400-class errors such as invalid input or bad authentication won't succeed on a second try.

**Idempotency** matters when retrying actions with side effects: retrying "send email" might send two. Use idempotency keys so repeated requests are applied once.

Also smooth your load with queues, and cache or batch to stay under limits.

### Analogy
A nightclub with a capacity limit: when it's full, you wait outside a bit longer each time you check, not shout at the door every second.

### Why it matters
Agents and batch scripts fire calls quickly and hit limits fast. A missing backoff turns a brief limit into an outage and a pile of failed jobs.

### Example
Retry logic in plain words:

```
attempt 1 → 429 → wait ~1s (+ random)
attempt 2 → 429 → wait ~2s
attempt 3 → 200 OK
Give up after 5 attempts; never retry a 400.
```

### Takeaways
- 429 means slow down; retry with exponential backoff and jitter.
- Only retry transient errors, and cap attempts.
- Use idempotency keys for actions with side effects.

### Glossary
- **Backoff** — Increasing the wait between retries.
- **Jitter** — Random variation added to delays to avoid synchronised retries.
- **Idempotent** — An operation that has the same effect whether run once or many times.
- **429** — The HTTP status for "too many requests".

### Quiz
**Q:** You get a 429. What's the best response?
- [ ] Immediately resend in a tight loop
- [x] Wait with exponential backoff, then retry a limited number of times
- [ ] Give the user a blank screen
- [ ] Switch to a different programming language
*Why:* Backing off lets the limit reset and avoids making the overload worse.

**Q:** Why add jitter to backoff?
- [ ] To make logs prettier
- [ ] To increase the rate limit
- [x] To stop many clients retrying at exactly the same moment
- [ ] To lower token prices
*Why:* Randomised delays spread retries out, preventing waves of simultaneous requests.

## Model Routing & Gateways {#model-routing-gateways}
<!-- emoji: 🔀 | minutes: 9 | related: token-pricing, fallbacks-reliability, workflows-vs-agents -->

**TL;DR:** Routing sends each request to the cheapest model that can handle it, and an AI gateway is the proxy that centralises that choice, plus keys, logging and limits.

### Explain
Not every request needs your most powerful model. **Model routing** picks per task:

- A **small, fast model** for classification, extraction, simple Q&A.
- A **strong model** for complex reasoning, long documents or code.
- A **reasoning model** only when deliberate thinking pays off.

Routing can be rule-based ("if the request is under 100 words and a FAQ topic → small model"), classifier-based (a cheap model decides), or cascading (try small first, escalate if confidence is low).

An **AI gateway** (or LLM proxy) sits between your app and providers. Typical jobs:
- One API for many providers; swap models by changing a setting.
- Central **API key** storage, so keys never ship in the frontend.
- **Rate limiting, budgets and per-user quotas.**
- **Caching, logging and observability.**
- **Fallbacks** to another provider when one fails.

The trade-off: another moving part to run, and routing mistakes can quietly hurt quality, so evaluate.

### Analogy
A hospital triage desk: minor issues go to a nurse, complex cases to a specialist. It saves expert time without hurting care.

### Why it matters
Routing often cuts costs by more than half with little quality loss. A gateway also prevents the classic mistake of exposing provider keys in client code.

### Example
A simple routing rule set:

```
if task == "classify_ticket"          → small model
if task == "summarise" and len < 3k   → small model
if task == "write_code" or "analyse"  → strong model
if confidence < 0.7                   → escalate to strong model
```

### Takeaways
- Match model size to task difficulty to save money and time.
- Gateways centralise keys, limits, logging and fallbacks.
- Evaluate routing quality so savings don't hide regressions.

### Glossary
- **Cascade** — Try a cheaper option first, escalating only when needed.
- **LLM proxy / gateway** — A service between your app and model providers.
- **Provider lock-in** — Being unable to switch vendors easily because code is tied to one.

### Quiz
**Q:** Which request is best sent to a small, cheap model?
- [ ] Multi-step legal contract analysis
- [x] Classifying support tickets into five categories
- [ ] Debugging a concurrency bug across ten files
- [ ] Planning a complex data migration
*Why:* Simple, well-defined tasks don't need the strongest model, so a small one saves cost and time.

**Q:** Which is a core job of an AI gateway?
- [ ] Training new models
- [ ] Designing the user interface
- [x] Centralising API keys, limits, logging and fallbacks
- [ ] Rewriting your database schema
*Why:* A gateway is the control point between your app and model providers.

## Observability & Tracing {#observability-tracing}
<!-- emoji: 📡 | minutes: 9 | related: monitoring-logging-errors, evals-overview, agent-failure-modes -->

**TL;DR:** Observability means recording every prompt, response, tool call, cost and delay so you can see what your AI system really did and why.

### Explain
Traditional software is deterministic; the same input gives the same output. LLM systems aren't, so "it worked on my machine" tells you little. You need to see *each run*.

Key terms:
- **Logs** — timestamped records of events.
- **Metrics** — numbers over time: latency, error rate, tokens, cost.
- **Trace** — the full story of one request from start to end.
- **Span** — one step inside a trace: a model call, a retrieval, a tool run. Spans nest (an agent run contains many steps).

For AI, record at least: the prompt (with version), model and parameters, response, token usage, latency, tool calls and results, and user feedback (thumbs up or down).

Uses:
- **Debugging** — replay the exact run that failed.
- **Cost control** — find the feature or user burning tokens.
- **Quality monitoring** — sample real traffic, score it with evals, catch regressions.
- **Datasets** — turn real failures into test cases.

Mind privacy: prompts can contain personal data, so redact sensitive fields and set retention limits.

### Analogy
An airplane's black box plus flight dashboard: live instruments while flying, and a full recording when something goes wrong.

### Why it matters
Without traces, a bad AI answer is a mystery. With them, it's a bug report you can reproduce and fix.

### Example
One traced agent run:

```
trace #8841  (7.4s, 3,120 tokens, $0.021)
├─ span: retrieve_docs        0.6s
├─ span: llm_call (plan)      1.8s
├─ span: tool: search_orders  0.4s
└─ span: llm_call (answer)    4.6s   👎 user feedback
```

### Takeaways
- Log prompts, responses, tools, tokens, latency and cost for every run.
- Traces are made of spans; they show where time and money go.
- Redact personal data and use real failures to build tests.

### Glossary
- **Span** — A timed step within a trace.
- **Telemetry** — Data automatically collected about a system's behaviour.
- **Prompt versioning** — Tracking which prompt text produced which results.
- **Redaction** — Removing or masking sensitive data in logs.

### Quiz
**Q:** What is a trace?
- [ ] A single token
- [x] The complete record of one request, made up of nested steps
- [ ] A type of model
- [ ] An error that cannot be fixed
*Why:* A trace follows one request end to end, and spans are the individual steps inside it.

**Q:** Why log prompts and responses carefully?
- [ ] They're only useful for marketing
- [ ] Models require it by law
- [x] They enable debugging and evaluation, but may contain personal data needing redaction
- [ ] Logs make the model smarter instantly
*Why:* Logs are essential for diagnosing issues, yet need privacy protection and retention rules.

## Batch & Async APIs {#batch-async-apis}
<!-- emoji: 📬 | minutes: 8 | related: token-pricing, rate-limits-retries, queues-websockets-realtime -->

**TL;DR:** Batch and async APIs process large numbers of non-urgent requests in the background at a discount, trading instant answers for lower cost and higher throughput.

### Explain
Not everything needs a reply in two seconds. If you're summarising 50,000 documents, labelling a dataset or running overnight evals, waiting is fine, and paying less is better.

**Batch APIs** let you submit a file of many requests. The provider processes them within a time window (often up to 24 hours), then you collect the results. Typical benefits: roughly half-price tokens and separate, generous rate limits.

In your own product, the same idea is an **async job**:
1. User triggers a long task.
2. Your server puts a job on a **queue** and immediately replies "got it" with a job ID.
3. A **worker** processes it in the background.
4. The user is told when done — by polling, a **webhook**, an email or a push notification.

This keeps request time short, survives crashes (retry the job), and lets you control concurrency to respect rate limits.

Use real-time (streaming) calls for interactive chat; use batch and async for bulk, scheduled or long-running work.

### Analogy
Dropping laundry at a cleaner: slower than washing it yourself right now, but cheaper, and you can drop off a mountain of it.

### Why it matters
Using real-time calls for bulk jobs doubles cost and trips rate limits. Recognising when something is batch-shaped saves money and avoids timeouts.

### Example
Choosing between modes:

```
User asks a question in chat        → streaming, real-time
Nightly summary of 20,000 tickets   → batch API
"Generate my yearly report" button  → queue + worker + email when ready
```

### Takeaways
- Batch APIs trade latency for lower cost and higher throughput.
- Async jobs use queues, workers and notifications for long tasks.
- Use real-time only where a human is waiting.

### Glossary
- **Queue** — A line of pending jobs waiting to be processed.
- **Worker** — A background process that picks jobs off a queue.
- **Webhook** — A callback request a service sends to your server when something finishes.
- **Polling** — Repeatedly asking "is it done yet?"

### Quiz
**Q:** You must summarise 100,000 archived documents by next week. Best approach?
- [ ] Real-time streaming requests, one by one in a browser
- [x] A batch API or queued background jobs
- [ ] Ask a person to paste each one into chat
- [ ] Use the largest context window and send everything at once
*Why:* Non-urgent bulk work suits discounted batch processing with controlled concurrency.

**Q:** In an async job design, what does the server return immediately?
- [ ] The completed result
- [x] A job ID confirming the task was accepted
- [ ] An error
- [ ] The queue's source code
*Why:* The request returns quickly; the result is delivered later via polling, webhook or notification.

## Fallbacks & Reliability {#fallbacks-reliability}
<!-- emoji: 🛟 | minutes: 9 | related: rate-limits-retries, model-routing-gateways, human-in-the-loop -->

**TL;DR:** Reliable AI products plan for failure with timeouts, fallbacks, circuit breakers and graceful degradation, so one outage doesn't take the whole feature down.

### Explain
Model APIs go down, slow down, return malformed output or refuse. If your feature has a single path, any of those breaks it. Build layers:

- **Timeouts** — never wait forever; fail fast and move on.
- **Retries** — for transient errors (with backoff).
- **Fallback model or provider** — if the primary fails, switch to a secondary.
- **Circuit breaker** — after repeated failures, stop calling the broken service for a while instead of piling on, then test it again.
- **Output validation** — check the response against a schema; on failure, retry once or fall back.
- **Graceful degradation** — a reduced experience instead of an error: a cached answer, a simpler rule-based reply, or "AI is unavailable; here's the search page."
- **Human fallback** — hand off to a person for sensitive or low-confidence cases.

Test these paths deliberately (chaos testing): turn off the primary and see whether the product survives.

Also define **SLAs and SLOs** — targets like "99.5% of requests succeed within 5 seconds" — so reliability is measurable.

### Analogy
A building's backup generator, fire exits and sprinklers. You hope never to use them, but you design for the day you must.

### Why it matters
Users judge your product by how it behaves on a bad day. A friendly degraded mode beats a blank screen or an infinite spinner.

### Example
A layered call chain:

```
try primary model (timeout 8s)
 └ fail → retry once with backoff
    └ fail → fallback model on another provider
       └ fail → return cached/template answer + "try again later"
Circuit breaker opens after 5 failures in 60s.
```

### Takeaways
- Plan for failure: timeouts, retries, fallbacks and circuit breakers.
- Degrade gracefully with cached, simpler or human-assisted responses.
- Test failure paths on purpose and measure reliability against targets.

### Glossary
- **Circuit breaker** — A pattern that pauses calls to a failing service to let it recover.
- **Graceful degradation** — Offering reduced functionality instead of failing completely.
- **SLO** — Service level objective: a measurable reliability target.
- **Failover** — Automatically switching to a backup system.

### Quiz
**Q:** What does a circuit breaker do?
- [ ] Encrypts API keys
- [x] Stops calling a repeatedly failing service for a while to avoid making things worse
- [ ] Speeds up the model
- [ ] Deletes failed requests forever
*Why:* It prevents cascading failures and gives the dependency time to recover.

**Q:** The AI provider is down. Which is the best user experience?
- [ ] An endless spinner
- [ ] A raw stack trace
- [x] A clear message plus a simpler fallback such as search or a cached answer
- [ ] Silently showing wrong answers
*Why:* Graceful degradation keeps users productive and informs them honestly.
