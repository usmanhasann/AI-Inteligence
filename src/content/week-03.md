# Week 3: How Models Are Made

## Pretraining {#pretraining}
<!-- emoji: 📚 | minutes: 9 | related: training-vs-inference, scaling-laws, fine-tuning -->

**TL;DR:** Pretraining is the first, enormous training stage where a model learns language, facts and patterns by predicting the next token across trillions of tokens of text.

### Explain
Pretraining creates the **base model**. The recipe is surprisingly simple: take a vast text collection (web pages, books, code, papers), hide the next token, ask the model to guess it, measure the error, and adjust the weights. Repeat for trillions of tokens. This is called **self-supervised learning**, because the "labels" come from the text itself and no human has to annotate anything.

Key ingredients:
- **Data** — scale and quality matter. Teams filter, deduplicate and balance sources (code, maths, multiple languages).
- **Compute** — thousands of GPUs running for weeks or months.
- **Architecture** — usually a transformer.

A freshly pretrained base model is a brilliant text *continuer*, not an assistant. Ask it a question and it might continue with another question, as if writing a quiz. It needs the next stages (fine-tuning and alignment) to behave like a helpful chatbot.

Pretraining is where almost all of a model's **world knowledge** is acquired, and also its biases, gaps and its knowledge cutoff.

### Analogy
Pretraining is a child reading a whole library without being taught anything specific. They soak up language and facts, but nobody has yet taught them how to answer a question politely.

### Why it matters
It explains why you can't "just teach" a model new facts by chatting with it, and why the quality of training data shapes everything downstream. When you hear "base model", it means pretraining only; "instruct" or "chat" means it also went through later stages.

### Example
```
Prompt to a BASE model:   "What is the capital of France?"
Base model continues:     "What is the capital of Germany? What is the capital of…"

Prompt to an INSTRUCT model: "What is the capital of France?"
Instruct model replies:      "The capital of France is Paris."
```

### Takeaways
- Pretraining = next-token prediction over huge text corpora; it builds knowledge and language ability.
- The result is a base model that continues text; it isn't yet a helpful assistant.
- Data quality and compute are the main levers, and they set the knowledge cutoff.

### Glossary
- **Base model** — a model after pretraining only, before instruction tuning.
- **Corpus** — the large collection of text a model is trained on.
- **Self-supervised learning** — learning where the training labels are derived from the data itself.
- **Epoch** — one full pass over the training data.

### Quiz
**Q:** What does a base model typically do with the prompt "Write a poem about cats"?
- [ ] Always writes a perfect poem
- [x] May just continue the text, e.g. with more instructions
- [ ] Refuses due to safety rules
- [ ] Browses the web
*Why:* It only learned to continue text; following instructions comes from later tuning.

**Q:** Why is pretraining called self-supervised?
- [ ] A supervisor watches the training run
- [ ] It uses no data at all
- [x] The labels (next tokens) come from the text itself, not human annotators
- [ ] The model supervises other models
*Why:* Hiding and predicting the next token creates free training signal at massive scale.

## Fine-Tuning {#fine-tuning}
<!-- emoji: 🎯 | minutes: 10 | related: pretraining, rlhf-alignment, rag-vs-finetuning -->

**TL;DR:** Fine-tuning continues training a pretrained model on a smaller, targeted dataset so it adopts a specific behaviour, style or skill.

### Explain
After pretraining, **fine-tuning** adjusts the weights further using curated examples. Two flavours you'll hear about:

- **Supervised fine-tuning (SFT) / instruction tuning** — train on thousands of (instruction → ideal response) pairs. This is how a base model becomes a helpful chat assistant.
- **Domain or task fine-tuning** — adapt to your world: your tone of voice, a fixed output format, medical or legal vocabulary, a classification task.

Updating *all* weights of a big model is expensive. **Parameter-efficient fine-tuning (PEFT)** methods such as **LoRA** freeze the original weights and train a tiny add-on (adapter) with a fraction of the parameters. It's cheaper, faster, and the adapter can be swapped in and out.

What fine-tuning is good for: **style, format, consistent behaviour, specialised tasks**. What it's poor at: reliably adding lots of fresh facts. For knowledge, retrieval (RAG) is usually better and easier to update.

### Analogy
Pretraining is general education; fine-tuning is job training. LoRA is a small, swappable "skills cartridge" you plug in instead of re-educating the whole person.

### Why it matters
When someone proposes "let's fine-tune it on our docs", ask first: do we need *facts* (try RAG) or a *behaviour* (fine-tuning may help)? Fine-tuning needs good data, evaluation and maintenance, so try prompting and retrieval first.

### Example
A training example in a typical instruction-tuning dataset (JSONL):

```json
{"messages": [
  {"role": "system", "content": "You are a support agent for Acme. Be brief and friendly."},
  {"role": "user", "content": "Where is my order?"},
  {"role": "assistant", "content": "Happy to help! Could you share your order number?"}
]}
```

A few hundred to thousands of such examples teach tone and structure.

### Takeaways
- Fine-tuning = more training on targeted examples to shape behaviour.
- SFT/instruction tuning makes chat models; LoRA/PEFT does it cheaply with small adapters.
- Great for style and format; for fresh facts, retrieval is usually the better tool.

### Glossary
- **SFT** — supervised fine-tuning on input/output example pairs.
- **LoRA** — Low-Rank Adaptation, a method that trains small adapter matrices instead of all weights.
- **Adapter** — a small add-on set of trained weights layered over a frozen base model.
- **JSONL** — a text file with one JSON example per line, common for training data.

### Quiz
**Q:** Your chatbot must always answer in a very specific brand voice and JSON shape. Which approach fits best?
- [ ] Pretraining a new model from scratch
- [ ] Building a vector database only
- [x] Fine-tuning (or careful prompting) for behaviour and format
- [ ] Increasing the context window
*Why:* Consistent style and structure are behaviours that fine-tuning is well suited to teach.

**Q:** What is the main benefit of LoRA?
- [ ] It makes the model larger
- [ ] It adds real-time internet access
- [x] It trains a small adapter, saving memory and cost
- [ ] It removes the need for training data
*Why:* LoRA freezes the base weights and learns a few extra parameters.

## RLHF & Alignment {#rlhf-alignment}
<!-- emoji: 🤝 | minutes: 10 | related: fine-tuning, guardrails, alignment-bias -->

**TL;DR:** Alignment training uses human or AI feedback on which answers are better so the model becomes helpful, honest and safe, not just fluent.

### Explain
A fine-tuned model can follow instructions but may still be rude, unsafe or sycophantic. **Alignment** techniques push it toward what people actually prefer.

The classic recipe, **RLHF (Reinforcement Learning from Human Feedback)**:
1. The model writes several answers to a prompt.
2. Humans **rank** them from best to worst.
3. A **reward model** is trained to predict those preferences.
4. The LLM is then optimised (with reinforcement learning) to produce answers the reward model scores highly.

Variants you'll see:
- **RLAIF** — the feedback comes from another AI instead of humans.
- **Constitutional AI** — the model critiques and revises its own outputs against a written set of principles (a "constitution").
- **DPO** — a simpler method that learns directly from preference pairs, skipping the separate reward model.

Alignment is why chat models refuse harmful requests, admit mistakes, and write in a helpful tone. It's also why they can be over-polite, over-cautious or too eager to agree with you (**sycophancy**).

### Analogy
Pretraining makes a talented intern; alignment is the feedback sessions where a manager says "this answer was better than that one" until the intern's judgement matches what the team values.

### Why it matters
It explains model "personality" and refusals. If an assistant keeps agreeing with a bad plan, it may be sycophancy, so ask it explicitly to critique or play devil's advocate.

### Example
One preference data point used for training:

```
Prompt:   Explain recursion to a beginner.
Answer A: "Recursion is when a function invokes itself on a smaller subproblem…" (clear, with example)
Answer B: "It's a base case + recursive case. See any CS text."
Human preference: A  ⇒ reward model learns that clear, example-led answers score higher.
```

### Takeaways
- Alignment shapes models to be helpful, honest and harmless using preference feedback.
- RLHF uses human rankings; RLAIF and Constitutional AI use AI feedback and written principles; DPO simplifies the process.
- Side effects include over-refusal and sycophancy, so prompt for critique when you need it.

### Glossary
- **Reward model** — a model trained to score answers by how much humans would prefer them.
- **Sycophancy** — telling users what they want to hear instead of what's true.
- **Instruction tuning** — fine-tuning on instruction/response pairs so the model follows directions.
- **Preference data** — comparisons of better vs worse answers used to train alignment.

### Quiz
**Q:** What is the role of the reward model in RLHF?
- [ ] It generates the training text
- [x] It learns to score answers the way humans would rank them
- [ ] It stores the user's chat history
- [ ] It compresses the model
*Why:* The reward model turns human preferences into a number the LLM can optimise.

**Q:** An assistant agrees with every idea you propose, even flawed ones. This is called…
- [ ] Hallucination
- [ ] Quantization
- [ ] Prompt injection
- [x] Sycophancy
*Why:* Preference training can reward agreeable answers, producing yes-man behaviour.

## Distillation & Quantization {#distillation-quantization}
<!-- emoji: 🗜️ | minutes: 9 | related: model-parameters, open-vs-closed, latency-ttft -->

**TL;DR:** Distillation teaches a small model to imitate a big one, and quantization stores a model's numbers at lower precision; both make models cheaper and faster.

### Explain
Big models are powerful but costly. Two popular ways to shrink them:

**Distillation.** A large **teacher** model generates answers (or probability distributions), and a smaller **student** model is trained to reproduce them. The student ends up far smaller than the teacher and often surprisingly close in quality on specific tasks. Many "mini" and "flash" models are made this way.

**Quantization.** Weights are normally stored as 16-bit numbers. Quantization rounds them to 8-bit, 4-bit or fewer. The file shrinks (4-bit is roughly a quarter of 16-bit), memory use drops, and inference speeds up, usually with a small quality loss. Formats you'll see in the wild include **GGUF** (popular for local use) and **AWQ/GPTQ**.

They're complementary: you can distil a small model *and* quantize it.

The trade-off is always the same: **size and speed vs. accuracy**. Aggressive compression hurts hard reasoning more than easy chat.

### Analogy
Distillation is a master chef writing a condensed recipe book that an apprentice can cook from. Quantization is saving a photo as a smaller JPEG: smaller file, slightly less detail.

### Why it matters
This is how a 70B-class capability can end up on your laptop or phone. When you see "Q4_K_M" in a model name from Hugging Face or Ollama, that's a 4-bit quantization. Choose lower precision for speed on your hardware, higher for quality.

### Example
| Version | Size (7B model) | Notes |
|---|---|---|
| 16-bit | ~14 GB | Full quality, needs a big GPU |
| 8-bit | ~7 GB | Near-identical quality |
| 4-bit | ~4 GB | Runs on a laptop; small quality loss |

### Takeaways
- Distillation trains a small student to mimic a large teacher.
- Quantization reduces numeric precision to shrink memory and speed up inference.
- Both trade a bit of quality for much lower cost, enabling local and on-device AI.

### Glossary
- **Teacher / student** — the large source model and the small model trained to copy it.
- **GGUF** — a file format for quantized models popular with local runners like llama.cpp and Ollama.
- **Bit-width** — how many bits store each weight; fewer bits means a smaller model.
- **On-device AI** — running models locally on a phone or laptop instead of calling a server.

### Quiz
**Q:** Which technique stores weights with fewer bits?
- [ ] Distillation
- [ ] Pretraining
- [x] Quantization
- [ ] RLHF
*Why:* Quantization lowers numeric precision (for example, 16-bit → 4-bit) to cut size.

**Q:** How does distillation produce a small, capable model?
- [ ] By deleting random layers
- [ ] By compressing the training data
- [x] By training a small student to imitate a large teacher's outputs
- [ ] By adding more parameters
*Why:* The student learns from the teacher's answers, inheriting much of its behaviour at lower cost.

## Mixture of Experts {#mixture-of-experts}
<!-- emoji: 🔀 | minutes: 8 | related: model-parameters, scaling-laws, latency-ttft -->

**TL;DR:** A mixture-of-experts model has many specialist sub-networks but activates only a few per token, giving big-model capacity at lower per-token cost.

### Explain
In an ordinary ("dense") transformer, every parameter takes part in processing every token. **Mixture of Experts (MoE)** changes the feed-forward part of each layer into many separate **experts**, plus a small **router** that decides which experts handle each token.

For example, a model might have 64 experts per layer but route each token to only 2. The model's *total* parameters are huge (lots of stored knowledge), but only the **active parameters** are used for any one token. So compute per token resembles a much smaller model.

Consequences:
- **Faster and cheaper inference** than a dense model of the same total size.
- **Large memory footprint**: all experts must still be loaded, even if few are active.
- Experts don't map to neat human topics like "maths expert"; specialisation emerges unpredictably.

When specs say "230B total, 20B active", they mean this: the model stores 230B parameters but uses about 20B per token.

### Analogy
A hospital with many specialists on staff. Every patient goes to reception (the router), then sees only the two doctors they need, rather than being examined by every doctor in the building.

### Why it matters
It explains why some very large models respond quickly and are priced reasonably, and why "parameters" alone is a misleading size metric. Check *active* parameters for speed and *total* parameters for memory.

### Example
```
Token "SELECT"  → router → experts 7 and 31   (code-ish patterns)
Token "sunset"  → router → experts 12 and 50  (descriptive language)
Only the chosen experts run; the rest sit idle for this token.
```

### Takeaways
- MoE = many experts + a router that picks a few per token.
- Total parameters give capacity; active parameters determine compute per token.
- Great for cost and speed, but all experts still consume memory.

### Glossary
- **Expert** — one of several parallel sub-networks inside an MoE layer.
- **Router (gating network)** — the small network that chooses which experts process a token.
- **Active parameters** — the parameters actually used for a given token.
- **Dense model** — a model where all parameters are used for every token.

### Quiz
**Q:** A model is described as "400B total, 40B active". What does that mean?
- [ ] It runs on 40B GPUs
- [ ] It has been quantized to 10%
- [x] It stores 400B parameters but uses about 40B per token
- [ ] It was trained on 40B tokens
*Why:* MoE routes each token through a subset of experts, so only a fraction of parameters is active.

**Q:** What's a downside of MoE compared to a dense model with the same active size?
- [ ] It can't generate text
- [x] It still needs memory to hold all the experts
- [ ] It must be retrained for every prompt
- [ ] It ignores the context window
*Why:* The unused experts must still be loaded, so memory needs are driven by total parameters.

## Scaling Laws {#scaling-laws}
<!-- emoji: 📈 | minutes: 8 | related: pretraining, model-parameters, reasoning-models -->

**TL;DR:** Scaling laws show that model performance improves predictably as you increase parameters, data and compute, which is why labs kept building bigger models.

### Explain
Around 2020, researchers observed that a model's error fell smoothly and predictably as three things grew together:

1. **Parameters** (model size)
2. **Data** (training tokens)
3. **Compute** (total training arithmetic)

Plot loss against any of them on a log scale and you get a nearly straight line. That predictability let labs forecast how good a model would be *before* spending the money to train it.

A refinement known as the **Chinchilla** result showed many early models were too big for the data they were trained on; for a fixed compute budget you should scale data and parameters together. That led to smaller models trained on much more data.

Scaling also revealed **emergent abilities**: skills like multi-step arithmetic or code generation that appear to switch on at larger scales.

Two caveats: returns diminish, and high-quality data is finite. So the frontier is shifting toward **better data, post-training, and test-time compute** (letting models "think" longer) rather than size alone.

### Analogy
It's like a gym progress curve: more training time, better diet and better equipment all help, with predictable gains at first but slower returns as you approach your limits.

### Why it matters
It explains the AI arms race for GPUs, data centres and datasets, and why each model generation tends to be better. It also tells you that a smaller modern model can outperform a larger old one, so don't judge by parameter count alone.

### Example
```
Loss
 │•
 │  •
 │     •••
 │          ••••••              ← diminishing returns
 └──────────────────── Compute (log scale)
```

Each tenfold increase in compute buys a steady but smaller improvement.

### Takeaways
- Performance rises predictably with parameters, data and compute.
- Chinchilla taught that data and model size must scale together.
- Returns diminish, so labs now also improve data quality, post-training and inference-time reasoning.

### Glossary
- **Compute** — the total arithmetic used in training, usually measured in FLOPs.
- **Chinchilla scaling** — the finding that optimal training balances model size and data amounts.
- **Emergent ability** — a capability that appears only once models reach enough scale.
- **Frontier model** — one of the most capable models available at a given time.

### Quiz
**Q:** What did the Chinchilla finding suggest?
- [ ] Always make models as large as possible
- [x] For a given compute budget, scale training data along with model size
- [ ] Data quality doesn't matter
- [ ] Smaller models can't be trained well
*Why:* Many models were under-trained; balancing data and parameters gives better results per dollar.

**Q:** Why do scaling laws matter commercially?
- [ ] They make training free
- [ ] They guarantee perfect accuracy
- [x] They let labs predict a model's performance before paying to train it
- [ ] They remove the need for GPUs
*Why:* Smooth, predictable curves make multi-million-dollar training bets less risky.

## Reasoning Models {#reasoning-models}
<!-- emoji: 🤔 | minutes: 10 | related: chain-of-thought, scaling-laws, latency-ttft, token-pricing -->

**TL;DR:** Reasoning models spend extra tokens "thinking" through a problem step by step before answering, trading speed and cost for better results on hard tasks.

### Explain
Standard LLMs answer almost immediately. **Reasoning models** are trained (often with reinforcement learning) to produce a long internal chain of thought first, then a final answer. They try approaches, check their work, backtrack and refine before committing.

This is called **test-time compute** or **inference-time scaling**: instead of making the model bigger, you let it use more computation on the specific question being asked.

Properties to know:
- Better at maths, logic, planning, hard debugging and multi-step coding.
- **Slower** (more tokens generated before the answer begins) and **more expensive**, since the hidden **thinking tokens** are usually billed as output.
- Often expose a setting for **reasoning effort** or a **thinking budget** so you choose how hard it should think.
- Little or no benefit on simple questions like "what's the capital of Italy".
- Some sampling settings (like temperature) may be fixed or restricted.

You often don't need to say "think step by step" any more. The model already does it, and over-prompting can even hurt.

### Analogy
A standard model is a quick-witted person answering off the top of their head. A reasoning model is the same person who is allowed to work on scratch paper first.

### Why it matters
Choose the right tool: a fast model for chat, UI tweaks and boilerplate; a reasoning model for architecture decisions, tricky bugs and planning. Using reasoning for everything wastes time and money; using none for hard problems wastes your afternoon.

### Example
```
Task: "Why does my checkout total sometimes differ by 1 cent?"

Fast model:      Guesses "floating-point maybe?" in 2 seconds.
Reasoning model: Thinks for ~30 s: traces rounding order, finds that tax is
                 rounded per line item vs once per order → exact fix.
```

### Takeaways
- Reasoning models generate hidden "thinking" tokens before answering.
- They improve hard-task accuracy at the cost of latency and price.
- Use them selectively and adjust the reasoning effort or budget.

### Glossary
- **Test-time compute** — extra computation used while answering, not while training.
- **Thinking tokens** — the intermediate reasoning tokens the model generates before its final answer.
- **Reasoning effort / thinking budget** — a setting that limits how much the model may think.
- **Reinforcement learning** — training by rewarding good outcomes, such as correct final answers.

### Quiz
**Q:** What is the main trade-off of using a reasoning model?
- [ ] It forgets the system prompt
- [ ] It can't write code
- [x] Higher latency and cost in exchange for better results on hard problems
- [ ] It needs a smaller context window
*Why:* Extra thinking tokens take time and are billed, but improve accuracy on complex tasks.

**Q:** Which task benefits LEAST from a reasoning model?
- [ ] Debugging a subtle race condition
- [ ] Planning a database migration
- [ ] Solving a logic puzzle
- [x] Rewording a button label to be friendlier
*Why:* Simple, creative tweaks don't need deep multi-step thinking; a fast model is cheaper and quicker.

## Open vs Closed Models {#open-vs-closed}
<!-- emoji: 🔓 | minutes: 9 | related: ai-landscape, distillation-quantization, model-routing-gateways -->

**TL;DR:** Closed models are reached only through a provider's API; open-weights models can be downloaded and run on your own hardware, subject to their licence.

### Explain
**Closed (proprietary) models** keep their weights private. You access them through an API or app and pay per token. Pros: usually the strongest frontier capability, no infrastructure to manage, constant improvement. Cons: your data goes to a provider (under their terms), you depend on their pricing and availability, and models can be changed or retired.

**Open-weights models** publish the trained parameters so anyone can download them. You can run them locally, in your own cloud, or via a host. Pros: privacy and control, offline use, fine-tuning freedom, predictable cost at scale. Cons: you manage hardware and serving, and the very top capability may lag.

Nuances:
- "Open weights" is not the same as "open source". Many releases give weights but not training data or code, and licences vary: some are permissive (Apache 2.0, MIT), others restrict commercial use or large companies.
- Tools to run them: **Ollama** and **LM Studio** locally, **vLLM** for servers, **Hugging Face** for hosting and downloads.
- Many teams mix both, using routing to send easy tasks to cheap models and hard tasks to frontier ones.

### Analogy
Closed is renting a fully serviced car with a driver: effortless, but you follow their rules. Open weights is buying the car: more freedom and control, but you handle the garage and the maintenance.

### Why it matters
This decision shapes privacy, cost and architecture. If you're handling sensitive data, an open model on your own infrastructure may be required. If you want the best quality with the least effort, a closed API usually wins. Always read the licence before shipping a product.

### Example
| Question | Lean toward |
|---|---|
| Need best-in-class quality fast? | Closed API |
| Data can't leave our network? | Open weights, self-hosted |
| High volume, simple task, cost-sensitive? | Small open model |
| Prototype this weekend? | Closed API (zero setup) |

### Takeaways
- Closed = API access only; open weights = downloadable parameters you can self-host.
- Open weights isn't automatically open source, so check the licence for commercial use.
- Many real systems combine both, picking per task.

### Glossary
- **Self-hosting** — running a model on infrastructure you control.
- **Ollama** — a tool for downloading and running open models locally with one command.
- **Licence** — the legal terms governing how a model may be used, modified and sold.
- **Vendor lock-in** — dependence on one provider that makes switching costly.

### Quiz
**Q:** A hospital needs AI on patient notes that must never leave its own servers. Which is the natural choice?
- [ ] A closed model through a public API
- [x] An open-weights model self-hosted on its infrastructure
- [ ] No model at all, it's impossible
- [ ] A bigger context window
*Why:* Self-hosting keeps data inside the organisation's own environment.

**Q:** True or false: an "open-weights" model is always fully open source.
- [ ] True, they're the same thing
- [ ] True, if it runs locally
- [x] False, weights may be downloadable while data, code or commercial rights are restricted
- [ ] False, open-weights models can't be downloaded
*Why:* Open weights describes access to parameters; the licence still decides what you can do with them.
