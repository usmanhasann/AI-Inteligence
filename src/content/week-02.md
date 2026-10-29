# Week 2: Inside the LLM

## Tokens {#token}
<!-- emoji: 🔤 | minutes: 9 | lab: tokenizer | related: tokenizer-vocab, context-window, token-pricing -->

**TL;DR:** A token is the chunk of text — roughly ¾ of an English word — that a language model actually reads, writes and bills you for.

### Explain
Models don't see letters or words. Before your text reaches the model it is chopped into **tokens**: whole common words (`the`), word pieces (`un` + `believ` + `able`), punctuation, or even single characters for rare strings.

Each token is then swapped for a number (its ID) in the model's vocabulary — the model only ever works with those numbers.

Rules of thumb for English:
- 1 token ≈ 4 characters ≈ ¾ of a word
- 100 tokens ≈ 75 words
- Code, other languages and emoji usually cost *more* tokens per character

Tokens matter because **everything is measured in them**: the context window (how much fits), the price (per million tokens in and out), and the speed (tokens per second).

### Analogy
Think of LEGO. A sentence isn't poured out as liquid — it's snapped together from standard bricks. Common phrases are one big brick; rare words need several small ones.

### Why it matters
When your agent says "I'm running out of context" or your bill spikes, the unit behind it is tokens. Pasting a huge log file is *expensive in tokens* even if it looks short. Knowing this lets you trim prompts sensibly.

### Example
Try it in the lab below. The sentence `Unbelievably, ChatGPT tokenizes 🙂 strangely.` might become:

```
Un | believ | ably | , | Chat | G | PT | token | izes | 🙂 | strange | ly | .
```

That's 13 tokens for 6 words. A plain word like `cat` is 1 token — but `antidisestablishmentarianism` might be 6+.

### Takeaways
- Token = the model's unit of text; ~4 characters or ~¾ word in English.
- Limits, cost and speed are all counted in tokens, not words.
- Non-English text, code and emoji tend to use more tokens.

### Glossary
- **Vocabulary** — the fixed list of tokens (often 50k–250k) a model knows.
- **Token ID** — the number that represents a token inside the model.
- **Input vs output tokens** — what you send vs what the model writes; priced differently.
- **BPE** — byte-pair encoding, the common method for building a token vocabulary.

### Quiz
**Q:** Roughly how many English words fit in 1,000 tokens?
- [ ] 250
- [ ] 1,000
- [x] 750
- [ ] 4,000
*Why:* A token is about ¾ of a word in English, so 1,000 tokens ≈ 750 words.

**Q:** Which is the most likely reason a prompt in Hindi or Japanese costs more than the same meaning in English?
- [ ] The model charges a language fee
- [x] Those scripts are usually split into more tokens
- [ ] Models refuse non-English text
- [ ] Unicode can't be tokenized
*Why:* Vocabularies are built mostly from English-heavy data, so other scripts break into more, smaller pieces.

## Tokenizers & Vocabulary {#tokenizer-vocab}
<!-- emoji: 📖 | minutes: 8 | related: token, context-window, token-pricing -->

**TL;DR:** A tokenizer is the translator that splits text into tokens and maps them to numbers using a fixed vocabulary learned from data.

### Explain
Every model ships with its own **tokenizer**: a small program that converts text into token IDs on the way in, and token IDs back into text on the way out.

Most use **byte-pair encoding (BPE)** or a close relative. The vocabulary is built before training like this:
1. Start with single characters (or bytes).
2. Count which pair of neighbours appears most often in the training text.
3. Merge that pair into a new token, e.g. `t` + `h` → `th`, later `th` + `e` → `the`.
4. Repeat tens of thousands of times until the vocabulary hits a target size (commonly 50k–250k).

Frequent chunks end up as single tokens; rare words get assembled from pieces. Because the vocabulary is fixed, **different models tokenize the same text differently**, so token counts from one model's tokenizer are only an estimate for another's.

Tokenization also explains classic quirks: models struggle to count letters in a word or reverse a string because they see `straw` + `berry`, not individual letters.

### Analogy
A tokenizer is a phrasebook compiled from millions of conversations. Common phrases get their own page; rare words must be spelled out from letters and syllables.

### Why it matters
That's why a 128k-token window holds different amounts of text in different models, and why "how many r's in strawberry" tricks happen. When counting costs, use the provider's tokenizer or token-count endpoint rather than guessing.

### Example
```
Text:        "lowercase"
Tokens (A):  low | er | case              → 3 tokens
Tokens (B):  lower | case                 → 2 tokens
```

Same text, two tokenizers, two counts. Neither is wrong; they just have different vocabularies.

### Takeaways
- A tokenizer converts text ↔ token IDs using a fixed vocabulary.
- BPE builds that vocabulary by repeatedly merging the most frequent character pairs.
- Token counts differ between models, and tokenization causes quirks like letter-counting failures.

### Glossary
- **Vocabulary size** — number of distinct tokens the model knows, typically tens to hundreds of thousands.
- **Special tokens** — reserved tokens such as end-of-text or role markers that structure a conversation.
- **Byte-level** — tokenizing raw bytes so any text, including emoji, can always be represented.

### Quiz
**Q:** Why can the same sentence have different token counts in two different models?
- [ ] One model compresses text more aggressively after reading it
- [x] Each model has its own tokenizer and vocabulary
- [ ] Token counts depend on the user's location
- [ ] Only the model's size matters
*Why:* Vocabularies are built separately for each model family, so splits differ.

**Q:** What is the core step of BPE vocabulary building?
- [ ] Deleting the rarest words
- [ ] Translating text to English first
- [ ] Assigning random numbers to letters
- [x] Repeatedly merging the most frequent adjacent pair
*Why:* Frequent pairs become single tokens, so common text compresses well.

## Context Window {#context-window}
<!-- emoji: 🪟 | minutes: 10 | lab: context-window | related: token, context-rot, token-budgeting, context-engineering -->

**TL;DR:** The context window is the maximum number of tokens a model can consider at once — its working memory for your prompt, history, documents and its own reply.

### Explain
A model has no memory of previous requests. All it knows during a call is what's inside the **context window**: everything you send *plus* everything it writes back, counted together in tokens.

That bucket typically contains:
- the **system prompt** (rules for the assistant)
- the **conversation history** so far
- any **documents, code or search results** you added
- tool definitions and tool results
- the **reply** it is currently generating

If the total hits the limit, something must go: older messages get dropped or summarised, or the request fails. Window sizes have grown from a few thousand tokens to hundreds of thousands or more, but bigger isn't automatically better: cost and latency grow with the amount you send, and accuracy can degrade when the window is stuffed (more in Week 5).

Importantly, the window is *input and output together*. A 200k window doesn't mean you can ask for 200k tokens of output.

### Analogy
It's a desk. Whatever is on the desk the model can see and use; anything not on the desk doesn't exist for it. A bigger desk helps, but a cluttered desk still makes things hard to find.

### Why it matters
"The assistant forgot what we decided" almost always means that information fell out of the window or got buried. The cure is deliberate context management: keep key rules in instruction files, start fresh sessions for new tasks, and summarise long threads.

### Example
Open the lab and add items to a 100k window: system prompt, chat history, a long document and a requested reply length. Watch the bar fill, then push it past the limit and see which parts would have to be trimmed. Notice how one big pasted file can crowd out the whole conversation.

### Takeaways
- The context window is the total tokens (input + output) a model can handle in one call.
- Anything outside the window is invisible to the model.
- Bigger windows cost more and don't guarantee better recall, so curate what you put in.

### Glossary
- **Max output tokens** — a separate cap on how long the reply may be.
- **Truncation** — silently dropping the oldest content when the window overflows.
- **Stateless** — each API call stands alone; the app must resend history every time.

### Quiz
**Q:** A model has a 100k-token window. You send 95k tokens of input. What's the problem?
- [ ] None — output has its own separate window
- [x] Only about 5k tokens are left for the reply
- [ ] The model will refuse all input over 90k
- [ ] The input is automatically compressed
*Why:* Input and output share the same window, so a huge prompt leaves little room to answer.

**Q:** A coding assistant forgets a rule you gave 2 hours ago in a very long chat. The most likely cause?
- [ ] The model's weights were reset
- [ ] The rule was too short to be remembered
- [x] The rule was truncated or buried as the context grew
- [ ] The assistant decided to ignore you
*Why:* The model only "remembers" what is currently in its window, and long histories get trimmed or diluted.

## Embeddings {#embedding}
<!-- emoji: 🧭 | minutes: 10 | lab: embedding-space | related: similarity-search, vector-database, rag-overview -->

**TL;DR:** An embedding turns text (or an image) into a list of numbers so that similar meanings end up close together in space.

### Explain
Computers can't compare meanings, only numbers. An **embedding** converts a piece of content into a **vector**: a list of hundreds or thousands of numbers that captures what it's *about*.

The magic is geometry. Texts with similar meaning get vectors that point in similar directions, so "puppy" lands near "dog" and far from "invoice". You measure closeness with maths such as **cosine similarity**, which asks "do these two arrows point the same way?"

Embeddings come from a dedicated **embedding model**, a neural network trained so that related things cluster. Inside an LLM, every token also starts as an embedding before the transformer layers refine it.

What you can do with them:
- **Semantic search** — find documents by meaning, not exact keywords.
- **RAG** — retrieve the most relevant chunks to give an LLM.
- **Clustering, recommendations, deduplication.**

### Analogy
Imagine a giant map where every sentence has a GPS coordinate. Sentences that mean similar things live in the same neighbourhood, so "find nearby" means "find similar".

### Why it matters
Embeddings are the engine under RAG, vector databases and "chat with your docs". When an agent says "I'll embed these files and store them in a vector DB", you now know it's turning text into coordinates so it can search by meaning later.

### Example
Open the lab: type a query and watch it land among word clusters in 3D (real embeddings have hundreds of dimensions; we squash them to 3 so you can see). Notice that "kitten" sits close to "cat" and "puppy", while "spreadsheet" is far away. Nearest points = most similar meaning.

```
embed("How do I reset my password?")  → [0.12, -0.83, 0.45, …]
embed("I forgot my login")            → [0.10, -0.79, 0.50, …]   ← very close
embed("Best pizza in Rome")           → [-0.64, 0.22, 0.01, …]   ← far away
```

### Takeaways
- An embedding is a vector of numbers representing meaning.
- Similar meaning → nearby vectors, measured with cosine similarity or distance.
- Embeddings power semantic search, RAG and recommendations.

### Glossary
- **Vector** — an ordered list of numbers; here, a point in high-dimensional space.
- **Dimensions** — how many numbers per vector (e.g. 768, 1536, 3072).
- **Cosine similarity** — a score from -1 to 1 for how closely two vectors point in the same direction.
- **Embedding model** — a model dedicated to producing embeddings, separate from a chat LLM.

### Quiz
**Q:** Why can embeddings find a document about "refund policy" when you search "get my money back"?
- [ ] They match exact keywords
- [ ] They translate everything to French
- [x] Similar meanings produce nearby vectors, even with different words
- [ ] They read the whole internet at query time
*Why:* Embeddings capture meaning, so paraphrases cluster together.

**Q:** What does cosine similarity measure?
- [ ] How many words two texts share
- [x] How similar the directions of two vectors are
- [ ] How long a text is
- [ ] How many tokens it costs
*Why:* It compares the angle between vectors; a small angle means similar meaning.

## Attention & Transformers {#attention-transformer}
<!-- emoji: 👀 | minutes: 11 | lab: attention | related: llm, context-window, token -->

**TL;DR:** Attention lets each token look at every other token and decide which ones matter; transformers are networks built from stacks of attention.

### Explain
Before 2017, language models read text strictly in order and tended to forget the start of long sentences. The **transformer** architecture ("Attention Is All You Need") changed that, and nearly every modern LLM uses it.

The core mechanism is **self-attention**. For each token the model asks, in effect: *"Which other tokens in this text should I pay attention to in order to understand myself?"*

In "The trophy didn't fit in the suitcase because **it** was too big", the word *it* needs to connect to *trophy*, not *suitcase*. Attention computes a weight between every pair of tokens, giving *it → trophy* a high score. The token's representation is then updated as a weighted blend of the tokens it attends to.

A transformer repeats this across many **layers** and many **heads** (each head looks for a different kind of relationship: grammar, references, code structure). Because all tokens can be processed in parallel, transformers train efficiently on GPUs.

The catch: attention compares every token with every other, so cost grows quickly with length. That's one reason huge context windows are expensive.

### Analogy
Reading a contract, you constantly flip back: "who is 'the Licensee' again?" Attention is that flip-back reflex, done for every word at the same time.

### Why it matters
Attention explains why where you put information in a prompt matters, why long context costs more, and why models can follow references across a document. It's also the "T" in GPT: Generative Pre-trained **Transformer**.

### Example
Open the lab, pick a sentence and click a word. The lines show how strongly it attends to the others. Try the *"it"* sentence above and compare *trophy* vs *suitcase*. (Weights in the lab are hand-made for teaching, but they show the real idea.)

### Takeaways
- Self-attention lets every token weigh every other token's relevance.
- Transformers stack many attention layers and heads, and process tokens in parallel.
- Attention cost rises with context length, which is why long prompts are slower and pricier.

### Glossary
- **Self-attention** — attention where a sequence looks at itself to build context-aware representations.
- **Attention head** — one parallel attention mechanism; models use many per layer.
- **GPT** — Generative Pre-trained Transformer, a family of transformer language models.
- **Parallelism** — computing many things at once, which transformers exploit and older RNNs could not.

### Quiz
**Q:** In "The dog chased the cat because it was fast", what is attention doing for the word "it"?
- [ ] Deleting it from the sentence
- [x] Scoring which earlier words it refers to
- [ ] Counting how many letters it has
- [ ] Translating it into a number
*Why:* Attention weights link a token to the other tokens that give it meaning.

**Q:** Why do very long prompts get slower and more expensive?
- [ ] Models get tired
- [ ] Longer text uses a different model
- [ ] Tokens are priced higher after 1,000
- [x] Attention compares tokens with many others, so work grows with length
*Why:* The pairwise comparisons in attention scale up as context grows.

## Sampling & Temperature {#sampling-temperature}
<!-- emoji: 🎲 | minutes: 10 | lab: sampling | related: llm, hallucination, structured-output -->

**TL;DR:** The model outputs a probability for every possible next token; sampling settings like temperature and top-p control how adventurous the pick is.

### Explain
After reading your prompt, the model doesn't output a word. It outputs a **probability distribution** over its entire vocabulary: "Paris" 82%, "Lyon" 4%, and so on. Then a **sampler** picks one token. Your settings shape that pick:

- **Temperature** — rescales the probabilities. Low (≈0–0.3) makes the top choice dominate: focused, repeatable. High (≈0.8–1.2) flattens the odds: more varied, creative, and riskier.
- **Top-p (nucleus sampling)** — only consider the smallest group of tokens whose probabilities add up to p (e.g. 0.9). Cuts off the long tail of silly options.
- **Top-k** — only consider the k most likely tokens.
- **Max tokens / stop sequences** — when to stop generating.

Temperature 0 (greedy) is *nearly* deterministic, but hardware and batching can still cause tiny differences, so don't promise bit-identical output.

Some newer reasoning models fix or restrict these settings, so check your provider's docs.

### Analogy
The model draws from a weighted bag of lottery balls. Low temperature removes almost every ball except the favourite; high temperature adds lots of long-shot balls.

### Why it matters
Use low temperature for code, extraction and structured data where you want consistency; use higher for brainstorming and copy. If your app gives wildly different answers each run, this is the first knob to check.

### Example
Open the lab and drag the temperature slider while watching the bar chart for the next word after "The sky is". At 0.1 one bar towers over the rest; at 1.5 the bars level out and "falling" or "banana" start to appear. Then lower top-p and watch the tail get cut off.

```
temperature: 0.2   → "The sky is blue."        (every time)
temperature: 1.1   → "The sky is a bruised violet tonight."
```

### Takeaways
- Models output probabilities; sampling picks the actual token.
- Lower temperature → predictable; higher → diverse and more error-prone.
- Top-p and top-k trim unlikely tokens; max tokens and stop sequences end the output.

### Glossary
- **Softmax** — the maths that turns raw scores into probabilities that sum to 1.
- **Greedy decoding** — always picking the single most likely token.
- **Deterministic** — giving the same output for the same input every time.
- **Stop sequence** — a string that tells the model to stop generating when it appears.

### Quiz
**Q:** You're generating JSON for an API call and need consistent output. Which setting is sensible?
- [x] Low temperature
- [ ] Very high temperature
- [ ] High top-k and high temperature
- [ ] Maximum creativity mode
*Why:* Lower randomness keeps the structure stable and reduces odd deviations.

**Q:** What does top-p = 0.9 do?
- [ ] Makes the model 90% accurate
- [ ] Limits output to 90 tokens
- [x] Samples only from the smallest set of tokens covering 90% of the probability
- [ ] Removes the 90 least likely words
*Why:* Nucleus sampling keeps the top probability mass and discards the unlikely tail.

## Hallucination {#hallucination}
<!-- emoji: 🌀 | minutes: 9 | related: knowledge-cutoff, grounding-citations, guardrails, rag-overview -->

**TL;DR:** A hallucination is output that sounds confident and plausible but is false or invented, a natural side effect of predicting likely text rather than checking facts.

### Explain
An LLM is trained to produce *plausible* continuations, not *verified* ones. When it lacks the answer, it often fills the gap with something that sounds right: a fake citation, a function that doesn't exist, a wrong date.

Common triggers:
- **Missing knowledge** — obscure topics, or events after its training cutoff.
- **Pressure to answer** — vague questions that imply an answer must exist.
- **Long, cluttered context** — important facts get lost.
- **Overconfident style** — fluent text sounds trustworthy even when wrong.

Hallucinations can't be fully eliminated today, but they can be reduced:
- Give the model the facts (paste docs, or use **RAG**) and tell it to answer only from them.
- Ask for **citations or quotes**, then verify.
- Allow "I don't know" explicitly.
- Use tools: run the code, search the web, query the database.
- Lower the temperature and add a verification step or second review pass.

### Analogy
It's like a confident colleague who hates saying "I'm not sure" and improvises. They aren't lying — they genuinely produce what sounds right — which is exactly why you need to check.

### Why it matters
In vibe coding the classic form is the **invented API**: the assistant calls a package function that doesn't exist. Run the code, read the error, and give the real docs. Treat AI output as a draft from a smart but unverified intern.

### Example
A grounded prompt that discourages invention:

```
Answer using ONLY the documentation below.
If the answer isn't there, reply "Not found in the docs."
Quote the sentence you relied on.

<docs>
…pasted documentation…
</docs>
```

### Takeaways
- Hallucination = fluent but false output; it's a by-product of probabilistic text generation.
- Grounding with real sources, tools and verification reduces it.
- Always test code and fact-check anything important; never trust tone as evidence.

### Glossary
- **Grounding** — tying an answer to supplied, checkable sources.
- **Confabulation** — another word for hallucination, borrowed from psychology.
- **Fact-checking pass** — a second step (human or model) that verifies claims.

### Quiz
**Q:** Which instruction best reduces hallucinations when answering from a document?
- [ ] "Be creative and confident"
- [ ] "Always give a complete answer"
- [x] "Answer only from this text, and say so if it isn't there"
- [ ] "Use as many words as possible"
*Why:* Restricting the source and permitting "not found" removes the pressure to invent.

**Q:** Your assistant uses a library function that errors with "not defined". What's the most likely cause?
- [ ] Your computer is out of date
- [x] The model invented a plausible-sounding function
- [ ] The temperature was too low
- [ ] The tokenizer removed it
*Why:* Fabricated APIs are a classic hallucination; check the library's real documentation.

## Knowledge Cutoff {#knowledge-cutoff}
<!-- emoji: 📅 | minutes: 8 | related: hallucination, rag-overview, long-context-vs-rag -->

**TL;DR:** A model only knows what was in its training data up to a cutoff date; anything newer must be supplied to it in the prompt or via tools.

### Explain
Training data is gathered up to a certain point, then the model is trained and released months later. That boundary is the **knowledge cutoff**. After release the model keeps being used for a year or more, so it's *always* somewhat out of date.

There are two kinds of knowledge to separate:
- **Parametric knowledge** — baked into the weights during training. Fast, but frozen, sometimes fuzzy, and impossible to cite.
- **In-context knowledge** — text you put in the context window right now. It's current, controllable and checkable.

When the model needs fresh or private facts, you add them: paste them in, **search the web**, **retrieve** from your documents (RAG), or let a tool fetch them. That's why many assistants have a search tool.

Models also often don't know their own cutoff precisely, because the last months before it are thinly represented in the data.

### Analogy
It's an encyclopaedia printed in a specific year. Still very useful, but if you need today's news you need a newspaper — that's the web search or retrieval step.

### Why it matters
If your assistant suggests a deprecated library version or API, that's the cutoff biting. Give it the current docs, or tell it the version you use: "We're on React 19 and Next.js 15, use only those APIs."

### Example
```
User:   What's the newest stable version of Node?
Model (no tools):    "…as of my training, v20."   ← possibly stale
Model (web search):  "Per nodejs.org today: …"   ← grounded in fresh data
```

### Takeaways
- Models know nothing past their training cutoff, and they stay in use long after it.
- Parametric knowledge is baked in and frozen; in-context knowledge is supplied live.
- Fix staleness by supplying current docs, search or retrieval, not by "asking harder".

### Glossary
- **Parametric knowledge** — facts stored in the model's weights.
- **In-context learning** — using information given in the prompt to answer or adapt.
- **Web search tool** — a tool that lets a model fetch live information from the internet.

### Quiz
**Q:** Your assistant writes code with an API removed last month. Best fix?
- [ ] Increase the temperature
- [ ] Ask it to think harder with no new info
- [x] Provide the current documentation or version in the prompt
- [ ] Restart your computer
*Why:* The model can't know post-cutoff changes; supplying them in context solves it.

**Q:** Which is an example of in-context knowledge?
- [x] A policy PDF you pasted into the chat
- [ ] The model's memory of Wikipedia from training
- [ ] The weights of the final layer
- [ ] The model's vocabulary
*Why:* In-context knowledge is whatever text is in the current window; the rest is in the weights.
