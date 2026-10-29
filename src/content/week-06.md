# Week 6: RAG Fundamentals

## RAG Overview {#rag-overview}
<!-- emoji: 📚 | minutes: 11 | lab: rag-pipeline | related: chunking, vector-database, grounding-citations, long-context-vs-rag -->

**TL;DR:** Retrieval-Augmented Generation looks up relevant information from your own data first, then gives it to the model so its answer is based on real sources.

### Explain
A model only knows its training data (which is old) and what's in your prompt. It knows nothing about your company docs, your private notes or last week's news. **RAG** fixes this without retraining.

The pipeline has two phases.

**Indexing (done ahead of time)**
1. Load documents (PDFs, pages, code)
2. Split into **chunks**
3. Turn each chunk into an **embedding** (a vector of numbers capturing meaning)
4. Store them in a **vector database**

**Querying (every question)**
1. Embed the user's question
2. Search for the most similar chunks
3. Optionally **rerank** the results
4. Paste the top chunks into the prompt
5. The model answers *using those chunks* and can cite them

The model isn't learning your data; it's being handed the right pages at the right moment.

### Analogy
An open-book exam. The student (model) is smart but hasn't memorised your textbook, so a helper quickly flips to the relevant pages before they answer.

### Why it matters
"Chat with your docs" features are RAG. When answers are wrong, you can now ask the right question: was the *retrieval* bad, or the *generation*? That's the first debugging step.

### Example
In the lab, step through the animation: question → embed → search → rerank → prompt → answer. Notice that if the right chunk never gets retrieved, the model can't answer correctly, however smart it is.
```
Q: "What's our refund window?"
Retrieved: policy.md → "Refunds accepted within 30 days…"
Answer: "30 days, per the refund policy."
```

### Takeaways
- RAG = retrieve relevant data, then generate an answer from it.
- It adds fresh, private knowledge without retraining the model.
- Quality depends first on retrieval, then on generation.

### Glossary
- **Index** — the searchable store you build ahead of time from your documents.
- **Corpus** — the whole collection of documents being searched.
- **Top-k** — the number of best-matching chunks retrieved.
- **Grounding** — tying an answer to supplied source text.

### Quiz
**Q:** What does RAG change about the model?
- [ ] Its weights, permanently
- [x] Nothing — it supplies retrieved text in the prompt
- [ ] Its tokenizer
- [ ] Its temperature
*Why:* RAG works at inference time by adding relevant context; the model itself is untouched.

**Q:** A RAG bot gives a wrong answer. What should you check first?
- [ ] Whether the model is too polite
- [ ] The font of the document
- [x] Whether the right chunk was retrieved at all
- [ ] The GPU brand
*Why:* If retrieval misses the answer, generation cannot fix it, so retrieval is the first suspect.

## Chunking {#chunking}
<!-- emoji: ✂️ | minutes: 10 | lab: chunking | related: rag-overview, embedding, rag-failure-modes -->

**TL;DR:** Chunking splits documents into smaller pieces so each can be embedded and retrieved on its own; how you cut them strongly affects answer quality.

### Explain
You can't embed a 300-page PDF as one unit — the vector would blur everything together, and retrieving it would flood the prompt. So documents are cut into **chunks**.

Key choices:
- **Chunk size** — commonly a few hundred tokens. Too small: fragments lose context ("it" refers to what?). Too big: vague embeddings and wasted prompt space.
- **Overlap** — repeat 10–20% between neighbouring chunks so a sentence cut at the boundary still appears whole somewhere.
- **Strategy**
  - *Fixed-size* — simple, ignores structure
  - *Recursive* — split by sections, paragraphs, then sentences
  - *Semantic* — split where the topic changes
  - *Structure-aware* — respect headings, tables, code blocks

Good practice: keep a heading/title with each chunk and store metadata (source, page), so results are interpretable and citable.

### Analogy
Cutting a pizza. Slices too tiny are mush; too huge won't fit on a plate. Cutting along the toppings (structure) beats cutting blindly.

### Why it matters
Bad chunking is the most common silent cause of poor RAG. If your assistant cites half a sentence, or misses an answer that's "right there", look at how the text was split.

### Example
In the lab, paste a few paragraphs and move the size and overlap sliders. Watch the colours: a sentence split across two chunks is rescued by overlap.
```
size=200 tokens, overlap=30
chunk 1: …refunds are accepted within
chunk 2: within 30 days of purchase if…   ← overlap saved the meaning
```

### Takeaways
- Chunks are the unit of retrieval; their quality caps RAG quality.
- Balance size: enough context, but focused.
- Overlap and structure-aware splitting prevent broken ideas.

### Glossary
- **Overlap** — text repeated between adjacent chunks to preserve continuity.
- **Recursive splitting** — cutting by larger separators first, then smaller ones.
- **Semantic chunking** — splitting where meaning shifts rather than at fixed lengths.
- **Metadata** — extra fields (source, page, date) stored beside each chunk.

### Quiz
**Q:** Why add overlap between chunks?
- [ ] To make the index smaller
- [x] So ideas cut at a boundary still appear complete in one chunk
- [ ] To speed up GPUs
- [ ] To hide duplicate files
*Why:* Overlap keeps boundary sentences intact in at least one chunk.

**Q:** What's the risk of very tiny chunks?
- [ ] They always exceed the window
- [ ] They can't be embedded
- [x] They lose surrounding context, so retrieved fragments are ambiguous
- [ ] They cost nothing
*Why:* Fragments without their neighbours are hard to interpret and match.

## Vector Databases {#vector-database}
<!-- emoji: 🗃️ | minutes: 10 | related: embedding, similarity-search, rag-overview -->

**TL;DR:** A vector database stores embeddings and quickly finds the ones closest in meaning to a query vector.

### Explain
An embedding is a list of numbers (say 768 or 1,536) representing meaning. A **vector database** stores millions of them along with the original text and metadata, and answers: "which stored vectors are nearest to this one?"

Exact nearest-neighbour search compares the query to every vector — fine for thousands, painfully slow for millions. So databases use **approximate nearest neighbour (ANN)** indexes that trade a sliver of accuracy for huge speed.

Popular index idea: **HNSW** — a layered graph where you hop from rough neighbours to closer ones, like zooming from country to street. Others include IVF (cluster first, search only nearby clusters).

Where you'll see them:
- Dedicated: Pinecone, Qdrant, Weaviate, Milvus, Chroma
- Add-ons to existing databases: **pgvector** for Postgres, plus vector features in Redis, MongoDB and SQLite extensions

For small or medium projects, pgvector inside the database you already run is often the simplest choice.

### Analogy
A map app. You don't measure the distance to every café on Earth; the app jumps through zoom levels to find the nearby ones fast.

### Why it matters
"Do I need Pinecone?" Usually not at first. Knowing ANN and HNSW lets you understand the speed vs accuracy knobs your AI assistant will mention in config.

### Example
```sql
-- pgvector
CREATE TABLE chunks (id serial, text text, embedding vector(1536));
CREATE INDEX ON chunks USING hnsw (embedding vector_cosine_ops);
SELECT text FROM chunks ORDER BY embedding <=> $1 LIMIT 5;
```
The `<=>` operator means cosine distance: "closest five to my question."

### Takeaways
- Vector DBs store embeddings and retrieve by similarity, not exact match.
- ANN indexes like HNSW give fast, slightly approximate results.
- pgvector is a pragmatic starting point if you already use Postgres.

### Glossary
- **ANN** — approximate nearest neighbour search, trading small accuracy loss for speed.
- **HNSW** — a graph-based ANN index with hierarchical layers.
- **Dimension** — the length of an embedding vector.
- **Recall (ANN)** — how often the approximate search finds the true nearest neighbours.

### Quiz
**Q:** Why do vector databases use approximate nearest neighbour search?
- [ ] Exact search is illegal
- [x] Comparing against every vector is too slow at scale
- [ ] Vectors can't be compared exactly
- [ ] It improves grammar
*Why:* ANN avoids brute-force comparison and returns near-best matches far faster.

**Q:** Which is a good fit for a small app already on Postgres?
- [ ] Rebuilding everything on a new graph database
- [ ] Training a model from scratch
- [x] The pgvector extension
- [ ] Storing vectors in CSS
*Why:* pgvector adds vector search to your existing database, avoiding extra infrastructure.

## Similarity Search {#similarity-search}
<!-- emoji: 🧭 | minutes: 10 | lab: embedding-space | related: embedding, vector-database, hybrid-search -->

**TL;DR:** Similarity search finds items whose embeddings point in nearly the same direction as your query, so it matches meaning rather than exact words.

### Explain
Embeddings place meaning in space: "car" and "automobile" land close together, "banana" lands far away. To search, embed the query and measure distance to stored vectors.

Common measures:
- **Cosine similarity** — compares the *angle* between vectors; 1 means same direction, 0 unrelated, -1 opposite. The default for text.
- **Dot product** — angle *and* length; equals cosine when vectors are normalised.
- **Euclidean distance** — straight-line distance.

This is **semantic search**: "How do I get my money back?" matches a chunk titled "Refund policy" despite sharing no keywords.

Limits: it can miss exact terms (error codes, product SKUs, names), and "similar" isn't always "relevant" — an article about *not* doing X is close to X. That's why teams add keyword search and reranking.

### Analogy
Pointing a torch from the same spot. Two vectors pointing the same way light up the same thing; the angle between beams tells how related they are.

### Why it matters
When someone says "semantic search" or "cosine similarity" in a RAG discussion, you know it's matching meaning by direction in vector space, not by words.

### Example
In the lab, click a word and see its nearest neighbours light up in 3D. Then type a query and watch which points it lands beside.
```
query: "cheap flights"        vector → [0.12, -0.4, …]
nearest: "budget airlines"    cosine = 0.86
         "luxury hotels"      cosine = 0.31
```

### Takeaways
- Cosine similarity measures direction, not size, of vectors.
- Semantic search matches meaning, so synonyms work.
- It can miss exact identifiers — pair it with keyword search.

### Glossary
- **Cosine similarity** — the cosine of the angle between two vectors, from -1 to 1.
- **Dot product** — sum of element-wise products; a similarity score.
- **Semantic search** — retrieving by meaning instead of keywords.
- **Normalisation** — scaling vectors to length 1.

### Quiz
**Q:** A cosine similarity near 1 means:
- [ ] The texts are identical character by character
- [x] The vectors point in nearly the same direction
- [ ] The texts are far apart
- [ ] The texts share no meaning
*Why:* Cosine measures the angle; a value near 1 indicates very similar meaning.

**Q:** Which query is semantic search most likely to struggle with?
- [ ] "ways to cancel my subscription"
- [ ] "how to fix a slow laptop"
- [x] "error code E-4017"
- [ ] "cheap flights to Paris"
*Why:* Exact identifiers carry little semantic meaning; keyword matching handles them better.

## Hybrid Search {#hybrid-search}
<!-- emoji: 🔀 | minutes: 9 | related: similarity-search, reranking, vector-database -->

**TL;DR:** Hybrid search combines keyword matching and vector search, then merges the results to get the strengths of both.

### Explain
Two retrieval styles, two blind spots:

- **Keyword (lexical) search** — finds exact words. The classic algorithm is **BM25**, which scores documents by how often rare query terms appear. Great for names, IDs, error codes, jargon. Blind to synonyms.
- **Vector (semantic) search** — finds meaning. Great for paraphrases and vague questions. Weak on exact strings.

**Hybrid search** runs both and merges the lists. A popular merging method is **Reciprocal Rank Fusion (RRF)**: each document gets a score from its rank in each list (`1 / (k + rank)`), and the scores are added. Documents that rank well in both rise to the top, with no need to compare incompatible raw scores.

Many databases support this directly (Elasticsearch/OpenSearch, Postgres full-text plus pgvector, and most vector DBs). A reranker often follows to polish the top results.

### Analogy
Two detectives: one searches by the exact name on the licence plate, the other by a description of the suspect. Cases solved faster when both report.

### Why it matters
If your RAG bot fails on product codes or acronyms, "add hybrid search" is the standard fix. It's one of the cheapest big quality gains.

### Example
```
Query: "ERR_CONN_RESET on checkout"
BM25 top: doc-17 (contains "ERR_CONN_RESET")
Vector top: doc-42 (about network timeouts)
RRF merge: doc-17, doc-42, doc-9 …
```
Each method rescued the other's weakness.

### Takeaways
- Keyword search nails exact terms; vector search nails meaning.
- Hybrid runs both and fuses ranks, often with RRF.
- It is a high-value upgrade for real-world RAG.

### Glossary
- **BM25** — a ranking function scoring documents by term frequency and rarity.
- **Lexical search** — matching on the literal words in the text.
- **RRF** — Reciprocal Rank Fusion, a way to merge several ranked lists.

### Quiz
**Q:** Why combine BM25 with vector search?
- [x] Each catches queries the other misses
- [ ] BM25 is a type of embedding
- [ ] Vector search cannot run alone
- [ ] It removes the need for documents
*Why:* BM25 handles exact terms and vectors handle meaning; together coverage improves.

**Q:** What does RRF merge?
- [ ] Two chat histories
- [ ] Two models' weights
- [ ] Two databases' schemas
- [x] Ranked result lists from different retrievers
*Why:* RRF fuses rankings by rank position, avoiding the problem of mismatched scores.

## Reranking {#reranking}
<!-- emoji: 🏅 | minutes: 9 | related: hybrid-search, similarity-search, rag-evaluation -->

**TL;DR:** A reranker re-scores the first batch of retrieved results with a slower, smarter model so the best few end up on top.

### Explain
First-stage retrieval (vectors, BM25) is built for speed: it scans millions of items using precomputed data. It's good, not perfect — the right chunk may sit at rank 14 instead of rank 1.

**Reranking** adds a second stage:
1. Retrieve a generous set (say top 50)
2. A **cross-encoder** model reads the query *together with* each candidate and outputs a relevance score
3. Keep the top 3–8 for the prompt

Why it's better: embeddings compress query and document separately, then compare. A cross-encoder lets them interact token by token, which captures nuance (negation, specifics) at the cost of speed — which is fine for only 50 items.

Rerankers are small specialised models or hosted APIs (Cohere, Voyage, open-source BGE). Some teams use an LLM as a reranker for hard cases.

### Analogy
Hiring: a quick résumé scan shortlists 50 people (retrieval); then interviews (reranker) pick the best 5.

### Why it matters
Stuffing 20 mediocre chunks into the prompt wastes tokens and distracts the model. Reranking lets you send fewer, better chunks — improving quality and cost together.

### Example
```
retrieve(top=50) → rerank(query, 50 chunks) → keep 5
before: right answer ranked #14
after:  right answer ranked #1
```

### Takeaways
- Two-stage retrieval: fast and broad first, slow and precise second.
- Cross-encoders judge query and chunk together for better relevance.
- Reranking lets you pass fewer, higher-quality chunks to the model.

### Glossary
- **Bi-encoder** — embeds query and document separately, then compares vectors.
- **Cross-encoder** — reads query and document jointly to score relevance.
- **Candidate set** — the larger pool of results passed to the reranker.

### Quiz
**Q:** Why not use a cross-encoder on the entire corpus?
- [ ] It cannot read text
- [x] It's too slow for millions of items, so it's applied only to shortlisted candidates
- [ ] It only works on images
- [ ] It deletes the index
*Why:* Joint scoring is expensive, so it follows a fast first-stage filter.

**Q:** What's a typical benefit of reranking?
- [ ] Larger context windows
- [ ] Cheaper embeddings
- [ ] Fresher training data
- [x] Better ordering, so fewer chunks need to go into the prompt
*Why:* Improved ranking puts the most relevant chunks first, allowing a smaller, cleaner context.

## Grounding and Citations {#grounding-citations}
<!-- emoji: 📌 | minutes: 9 | related: hallucination, rag-overview, rag-evaluation -->

**TL;DR:** Grounding forces answers to rest on supplied sources, and citations show which source supports each claim so you can verify it.

### Explain
A model without sources fills gaps with plausible-sounding guesses (hallucination). **Grounding** means constraining it to supplied evidence: "Answer using only the documents below."

Typical grounding recipe:
- Instruct: use only the provided context
- Allow an exit: "If the answer isn't there, say you don't know"
- Require **citations**: each claim references a source ID, page or quote
- Quote exact passages for critical facts

Citations serve two purposes: users can verify, and *you* can audit — a claim with no matching source is a red flag. Some APIs offer built-in citation features that point to exact spans.

Caveats: a model can cite a real source while misreading it, or fabricate a citation that looks real. Grounding reduces hallucination; it doesn't eliminate it. Spot-check, and automated checks of "does the quote actually appear in the source?" help.

### Analogy
A journalist who must footnote every claim. If there's no footnote, an editor questions it.

### Why it matters
For anything legal, medical, financial or customer-facing, ungrounded answers are risky. Asking for citations is a cheap, powerful instruction to put in your prompts.

### Example
```
Use only the <sources>. Cite as [S1], [S2].
If the sources don't answer the question, reply "Not in the documents."

Q: What's the refund window?
A: 30 days from purchase [S2].
```

### Takeaways
- Grounding = answer from supplied evidence, not memory.
- Give the model permission to say "I don't know".
- Citations enable verification, but can themselves be wrong — check them.

### Glossary
- **Hallucination** — fluent but unsupported or false output.
- **Attribution** — linking a statement to its source.
- **Faithfulness** — how well an answer sticks to the retrieved context.

### Quiz
**Q:** Which instruction best improves grounding?
- [ ] "Be creative"
- [x] "Answer only from the sources; say so if they don't contain the answer"
- [ ] "Answer as fast as possible"
- [ ] "Use your best guess"
*Why:* Restricting to sources and allowing "not found" prevents gap-filling guesses.

**Q:** Why can't you blindly trust citations?
- [ ] Citations are always encrypted
- [ ] They're only for lawyers
- [x] A model can attach a real source to a claim it doesn't support, or invent one
- [ ] They change the model's weights
*Why:* Citations improve checkability but must still be verified against the source.

## RAG vs Fine-Tuning {#rag-vs-finetuning}
<!-- emoji: 🥊 | minutes: 10 | related: fine-tuning, rag-overview, long-context-vs-rag -->

**TL;DR:** RAG gives a model new knowledge at question time; fine-tuning changes how the model behaves by training it further — they solve different problems.

### Explain
People ask "should I fine-tune on my docs?" Usually the answer is: no, use RAG. Here's why.

**RAG — adds knowledge**
- Facts live in your index; update by re-indexing
- Can cite sources and enforce permissions
- Easy to change, inspect and debug

**Fine-tuning — changes behaviour**
- Teaches style, format, tone, domain jargon, or a specialised task
- Facts get blurred into weights: hard to update, no citations, can still hallucinate
- Needs training data, compute and evaluation

Decision guide:
- Missing or changing *information* → RAG
- Wrong *style/format/skill* consistently → fine-tune (or try better prompts and examples first)
- Cheaper alternatives usually come first: prompting, few-shot examples, then RAG, then fine-tuning

They combine well: a fine-tuned model that follows your output format, fed by RAG for facts.

### Analogy
RAG is giving a doctor the patient's chart. Fine-tuning is sending the doctor back to medical school for a specialty.

### Why it matters
Fine-tuning for knowledge is a classic expensive mistake. Remembering "RAG for facts, fine-tuning for behaviour" saves weeks.

### Example
| Need | Choose |
|---|---|
| Answer from this week's pricing page | RAG |
| Always reply in strict JSON with house tone | Fine-tune (after trying prompts) |
| Cite the policy paragraph | RAG |
| Classify support tickets into 40 custom labels | Fine-tune or few-shot |

### Takeaways
- RAG = knowledge at runtime; fine-tuning = behaviour baked into weights.
- Facts are easier to update, cite and delete in RAG.
- Try prompting and RAG before fine-tuning; combine when needed.

### Glossary
- **Fine-tuning** — further training of a model on specific examples.
- **Few-shot examples** — sample input/output pairs placed in the prompt.
- **Weights** — the learned numbers inside a model.

### Quiz
**Q:** Your product docs change every week. What's the best way to keep a chatbot current?
- [ ] Fine-tune the model weekly
- [x] Re-index the docs and use RAG
- [ ] Switch the temperature to 0
- [ ] Shorten the system prompt
*Why:* RAG updates are as easy as refreshing the index; fine-tuning is slow and costly.

**Q:** Which problem points toward fine-tuning?
- [ ] The model lacks last month's news
- [ ] You need citations to a policy page
- [x] The model never follows your strict output style, even with examples
- [ ] You need per-user document permissions
*Why:* Persistent style or skill issues are behaviour problems, which fine-tuning targets; the others are knowledge problems.
