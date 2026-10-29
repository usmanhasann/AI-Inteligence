# Week 1: The AI Map

## AI vs ML vs Deep Learning {#ai-ml-dl}
<!-- emoji: 🗺️ | minutes: 8 | related: neural-network, llm -->

**TL;DR:** AI is the goal, machine learning is the method of learning from data, and deep learning is ML done with big neural networks.

### Explain
People use "AI", "ML" and "deep learning" as if they were the same thing. They are nested, like Russian dolls:

- **Artificial Intelligence (AI)** — any system that does something we'd call intelligent: playing chess, spotting spam, writing text. It includes old hand-written rule systems too.
- **Machine Learning (ML)** — a way to build AI where *you don't write the rules*. You show the system lots of examples and it finds the patterns itself.
- **Deep Learning (DL)** — ML that uses many-layered **neural networks**. It's what made image recognition, translation and ChatGPT-style models possible.

So: every deep-learning system is ML, every ML system is AI — but not the other way round. A spam filter built from `if "free money" in email` rules is AI without any learning at all.

The modern "AI boom" is almost entirely deep learning, and in particular one architecture — the **transformer** — which you'll meet in Week 2.

### Analogy
AI is "a kitchen that makes food". ML is a chef who learns by tasting thousands of dishes instead of following a recipe book. Deep learning is a chef with an enormous, layered brain that can pick up flavours no one explained to it.

### Why it matters
When your AI assistant says "I trained a classifier" or "this uses a neural net", you now know *where in the map* you are. It also helps you decide when you don't need AI at all: if a plain `if` statement solves it, use that.

### Example
Same task, three approaches — "is this email spam?":

| Approach | How it decides |
|---|---|
| Classic AI (rules) | A human writes: *if it contains "WINNER!!!" → spam* |
| Machine learning | You feed 100k labelled emails; a model learns which word patterns predict spam |
| Deep learning | A neural network reads the raw text and learns its own features — including sneaky phrasing you never listed |

### Takeaways
- AI ⊃ ML ⊃ Deep Learning — each is a subset of the previous one.
- ML = learn patterns from examples instead of hand-writing rules.
- Today's headline AI (LLMs, image generators) is deep learning.

### Glossary
- **Algorithm** — a step-by-step procedure for solving a problem; in ML, the procedure that adjusts the model while it learns.
- **Rule-based system** — software driven by hand-written if/then logic, with no learning.
- **Supervised learning** — ML from labelled examples (email → spam / not spam).
- **Unsupervised learning** — ML that finds structure in data with no labels, such as grouping similar customers.

### Quiz
**Q:** A team hand-writes 500 if/then rules to detect fraud. Which label fits best?
- [x] AI, but not machine learning
- [ ] Machine learning, but not AI
- [ ] Deep learning
- [ ] Generative AI
*Why:* Rules written by humans can still be "AI", but nothing is being learned from data, so it isn't ML.

**Q:** What does "deep" in deep learning refer to?
- [ ] The model understands topics deeply
- [ ] It needs a lot of storage
- [x] The neural network has many stacked layers
- [ ] It was trained for a long time
*Why:* "Deep" literally counts layers — networks with many hidden layers between input and output.

## Neural Networks {#neural-network}
<!-- emoji: 🧠 | minutes: 9 | related: model-parameters, training-vs-inference, ai-ml-dl -->

**TL;DR:** A neural network is layers of simple number-crunching units whose connection strengths get tuned until the whole stack turns inputs into useful outputs.

### Explain
A neural network is loosely inspired by the brain, but in practice it's just arithmetic arranged in layers.

- A **neuron** takes several numbers in, multiplies each by a **weight** (how much it cares about that input), adds them up, and passes the total through an **activation function** that decides how strongly to "fire".
- A **layer** is a row of neurons working side by side. The output of one layer becomes the input of the next.
- The first layer receives raw input (pixels, token numbers); the last produces the answer (a label, the next word). Everything in between is a **hidden layer**.

Learning means nudging the weights. The network makes a guess, a **loss function** scores how wrong it was, and an algorithm called **backpropagation** works out which weights to turn up or down to be less wrong next time. Repeat that billions of times and the weights end up encoding patterns nobody wrote down.

### Analogy
Picture a gigantic mixing desk with millions of sliders. Training is a patient engineer nudging every slider a tiny bit after each song until the output finally sounds right.

### Why it matters
When someone says "the model learned that" or "it has 70 billion weights", this is the machinery they mean. Nobody can read meaning out of individual weights, which is why AI systems are tested by *behaviour* (evals) rather than inspected like normal code.

### Example
A tiny image network for "is this a cat?" learns layers of ever-richer features:

```
pixels → [layer 1: edges] → [layer 2: shapes] → [layer 3: ears, whiskers] → "cat: 94%"
```

Nobody programmed "whiskers". Early layers found simple patterns, later layers combined them — all from adjusting weights against examples.

### Takeaways
- A network is layers of neurons; each neuron is "multiply by weights, add up, apply an activation".
- Learning = adjusting weights to reduce a loss (error) score, using backpropagation.
- What the network "knows" is spread across millions or billions of numbers, not stored as readable rules.

### Glossary
- **Weight** — a learned number saying how strongly one neuron's output influences the next.
- **Activation function** — a small non-linear step (like ReLU) that lets a network learn curved, complex patterns.
- **Loss function** — a score of how wrong the model's output is; training tries to push it down.
- **Backpropagation** — the algorithm that traces the error backwards to decide how to adjust each weight.

### Quiz
**Q:** During training, what is actually being changed?
- [ ] The training data
- [ ] The model's source code
- [x] The weights inside the network
- [ ] The user's prompt
*Why:* The architecture is fixed; training adjusts the weights so the loss score gets lower.

**Q:** What job does the loss function do?
- [x] Measures how wrong the network's output was
- [ ] Decides how many layers to use
- [ ] Compresses the model to save space
- [ ] Removes bad data from the dataset
*Why:* Backpropagation needs a single "how wrong was I?" number to know which direction to adjust the weights.

## Models & Parameters {#model-parameters}
<!-- emoji: 🎛️ | minutes: 8 | related: neural-network, scaling-laws, distillation-quantization -->

**TL;DR:** Parameters are the learned numbers inside a model, mostly weights, and their count (7B, 70B…) is the headline measure of how big a model is.

### Explain
A **model** is the finished product of training: a file of numbers plus the recipe (architecture) for using them. Those numbers are the **parameters**. When you read "Llama 70B" or "a 7B model", the B means billions of parameters.

Size has real consequences:
- **Memory** — each parameter takes bytes. A 7B model stored at 16-bit precision (2 bytes each) needs roughly 14 GB just to load.
- **Speed and cost** — more parameters means more arithmetic per token generated.
- **Capability** — bigger models usually reason better and know more, but data quality and training method matter just as much. A well-trained small model can beat a sloppy big one.

Don't confuse parameters with **hyperparameters** (settings humans choose before training, like learning rate) or with **inference settings** (temperature, max tokens), which you tweak per request.

### Analogy
Parameters are like the number of knobs on a giant synthesiser. More knobs allow richer sounds, but you also need a bigger desk, more power, and someone who knows how to set them all.

### Why it matters
When picking a model for an app you'll trade size against price and speed. "Will this run on my laptop?" is mostly a parameters-times-bytes question. And "bigger is smarter" is only a rough rule — always test on your own task.

### Example
Back-of-envelope sizing, 16-bit weights (2 bytes per parameter):

| Model size | Approx. memory just for weights |
|---|---|
| 1B | ~2 GB |
| 7B | ~14 GB |
| 70B | ~140 GB |

That's why a 70B model needs serious GPUs, while a 7B one can run on a decent laptop, especially once quantized (see Week 3).

### Takeaways
- Parameters = the learned numbers (mostly weights) that make up the model.
- "7B / 70B" counts billions of parameters; memory ≈ parameters × bytes per parameter.
- More parameters usually means more capability *and* more cost, but quality isn't determined by size alone.

### Glossary
- **Hyperparameter** — a setting chosen by humans before training (learning rate, layer count), not learned.
- **Checkpoint** — a saved snapshot of a model's parameters at some point in training.
- **Precision** — how many bits store each number (16-bit, 8-bit, 4-bit); lower precision means smaller files.

### Quiz
**Q:** Roughly how much memory do the weights of a 7B-parameter model need at 16-bit precision?
- [ ] 700 MB
- [x] 14 GB
- [ ] 140 GB
- [ ] 7 TB
*Why:* 7 billion parameters × 2 bytes each ≈ 14 GB.

**Q:** Which of these is a hyperparameter rather than a parameter?
- [ ] A weight in layer 12
- [ ] A bias value learned in training
- [x] The learning rate chosen before training
- [ ] The model's checkpoint file
*Why:* Hyperparameters are set by humans before training; parameters are what training learns.

## Training vs Inference {#training-vs-inference}
<!-- emoji: 🏋️ | minutes: 8 | related: pretraining, token-pricing, latency-ttft -->

**TL;DR:** Training is the expensive one-time process of learning the weights; inference is using the finished model to answer requests, and it's what you pay for per call.

### Explain
Every AI model has two very different lives:

- **Training** — the model reads enormous amounts of data and its weights are adjusted over and over. It takes thousands of GPUs for weeks or months and can cost millions to hundreds of millions of dollars for frontier models. It happens *before* you ever see the model.
- **Inference** — the weights are frozen. You send input, the model computes an output. Each request is cheap on its own, but millions of users add up, so serving costs become the long-term bill.

During inference the model **does not learn from your chat**. Close the window and nothing has been updated. Any "memory" you notice comes from text being fed back into the prompt, not from changed weights.

Both phases run on **GPUs** (or similar accelerators) because they do massive amounts of parallel arithmetic.

### Analogy
Training is going to university: years of study and a huge tuition bill. Inference is the job afterwards: each task takes minutes, and the knowledge doesn't change while you work.

### Why it matters
API pricing, rate limits and latency are all *inference* concerns. It also explains why a model can't "remember" you between sessions unless the app deliberately stores and re-sends information, a theme you'll revisit in Weeks 5–7.

### Example
```
Training:   dataset ──► weights updated (millions of steps)  ──► saved model
Inference:  your prompt ──► frozen model ──► answer   (weights unchanged)
```

Question to ask your assistant when something seems off: "Is this a training-time problem (the model never learned it) or an inference-time problem (we didn't give it the right context)?" The fixes are very different.

### Takeaways
- Training learns the weights once, at huge cost; inference uses them per request.
- The model does not update itself from your conversations at inference time.
- Most product costs and latency issues are inference issues.

### Glossary
- **GPU** — a chip built for parallel math, the workhorse of AI training and serving.
- **Frozen weights** — parameters that are not being changed during use.
- **Serving** — running a model so that applications can send it requests.

### Quiz
**Q:** You tell a chatbot your favourite colour, then open a brand-new chat. Why does it not know?
- [ ] The model deleted the information for privacy
- [x] Inference doesn't change the weights, so nothing was learned
- [ ] Colours can't be stored as tokens
- [ ] The model was still in training
*Why:* At inference time weights are frozen; memory features work by re-sending text, not by retraining.

**Q:** Which activity is the training phase?
- [ ] Answering a customer question with an API call
- [ ] Streaming a response token by token
- [x] Adjusting weights over a huge dataset for weeks on a GPU cluster
- [ ] Caching a prompt to save money
*Why:* Training is the learning phase; the others all happen when a finished model is being used.

## Large Language Models {#llm}
<!-- emoji: 💬 | minutes: 10 | related: token, attention-transformer, sampling-temperature -->

**TL;DR:** An LLM is a huge neural network trained on vast amounts of text to predict the next token, which turns out to be enough to write, summarise and code.

### Explain
A **Large Language Model** is a neural network (almost always a transformer) with billions of parameters, trained on a big slice of books, websites and code. Its single training task is simple: *given the tokens so far, predict the next token.*

Doing that well across trillions of examples forces the model to pick up grammar, facts, reasoning patterns, coding styles and even tone. At inference it generates text by predicting one token, appending it, then predicting the next, over and over.

Key properties to hold in your head:
- It works with **probabilities**, not a database of facts. It produces what is *likely*, not what is *verified*.
- It sees only what's in its **context window**.
- Its behaviour is shaped afterwards by fine-tuning and alignment (Week 3) so it follows instructions instead of just continuing text.

"ChatGPT", "Claude" and "Gemini" are products built on LLMs, plus extra layers like system prompts, tools and safety systems.

### Analogy
Imagine the world's most well-read autocomplete. Phone autocomplete suggests one word; an LLM has read so much that its "autocomplete" can finish an essay or a function.

### Why it matters
Almost every term in this course exists because of how LLMs behave: tokens, context windows, hallucination, RAG, agents. If you remember "it predicts the next token from what's in its window", most weird behaviour stops being weird.

### Example
Given the text below, the model scores every token in its vocabulary for what comes next:

```
"The capital of France is"  →  " Paris" (high probability)
                               " a"     (low)
                               " pizza" (almost zero)
```

It picks one (see Sampling in Week 2), appends it, and repeats until it decides to stop.

### Takeaways
- An LLM predicts the next token using patterns learned from huge text datasets.
- It generates by repeating that prediction one token at a time.
- It is a probability engine, not a fact database — the root cause of hallucinations.

### Glossary
- **Autoregressive** — generating output one piece at a time, each conditioned on everything before it.
- **Transformer** — the neural network design behind nearly all modern LLMs.
- **Chat model** — an LLM further trained to follow instructions and hold conversations.

### Quiz
**Q:** What is the core task an LLM is trained on?
- [ ] Looking facts up in a database
- [ ] Translating between programming languages
- [x] Predicting the next token given the previous ones
- [ ] Ranking web pages
*Why:* Next-token prediction is the training objective; abilities like coding and summarising emerge from doing it at scale.

**Q:** Which statement best describes an LLM's knowledge?
- [x] It's encoded as statistical patterns in the weights, not stored as verified records
- [ ] It's a searchable table of true facts
- [ ] It updates itself from every conversation
- [ ] It's identical in every model
*Why:* Because knowledge lives in learned probabilities, models can sound confident and still be wrong.

## Generative AI {#generative-ai}
<!-- emoji: 🎨 | minutes: 8 | related: llm, foundation-multimodal, ai-ml-dl -->

**TL;DR:** Generative AI creates new content — text, images, audio, video or code — by learning the patterns of existing examples, rather than just labelling or predicting.

### Explain
Older ML mostly *discriminated*: is this email spam? What's in this photo? **Generative AI** flips it: produce a new email, a new photo.

Different media use different techniques:
- **Text and code** — LLMs predict the next token.
- **Images and video** — usually **diffusion models**: start from pure noise and repeatedly remove a little noise, guided by your text prompt, until a picture emerges. They're trained by learning to undo noise added to real images.
- **Audio and speech** — transformers or diffusion applied to sound, including text-to-speech and music.

All of them learn a *distribution* of what plausible content looks like, then sample something new from it. That's why the same prompt can give different results, and why outputs can look convincing while being subtly wrong (extra fingers, invented citations).

### Analogy
A discriminative model is an art critic who can say "that's a Monet". A generative model is the forger who studied thousands of paintings and can paint a brand-new one in that style.

### Why it matters
You'll hear "gen AI" used for everything from chatbots to design tools. Knowing the family tells you what to expect: text models predict tokens, image tools denoise, and *all* of them can produce confident nonsense that you must review.

### Example
| You type | Technique underneath | You get |
|---|---|---|
| "Summarise this PDF" | LLM, next-token prediction | New text |
| "A neon fox in the rain, 35mm" | Diffusion model | New image |
| "Read this in a calm voice" | Speech synthesis | New audio |
| "Add a dark-mode toggle" | Code LLM | New code |

### Takeaways
- Generative AI creates new content; discriminative AI classifies or predicts labels.
- Text/code come from next-token LLMs; images and video are commonly made by diffusion.
- Generated output is plausible by design, not guaranteed correct, so verification stays your job.

### Glossary
- **Diffusion model** — a generator that builds an image by gradually denoising random noise.
- **Prompt** — the instruction or description you give a generative model.
- **Discriminative model** — a model that classifies or scores existing inputs rather than creating new ones.

### Quiz
**Q:** Which task is generative rather than discriminative?
- [ ] Marking a transaction as fraud or not fraud
- [ ] Labelling a photo as "dog"
- [x] Writing a product description from a few bullet points
- [ ] Sorting support tickets into categories
*Why:* The others assign a label to existing input; only the description task produces new content.

**Q:** How does a diffusion model typically produce an image?
- [ ] It retrieves the closest photo from a database
- [ ] It predicts the next pixel in a left-to-right scan only
- [x] It starts from noise and removes it step by step, guided by the prompt
- [ ] It stitches together stock clip art
*Why:* Denoising from random noise is the defining idea of diffusion generation.

## Foundation Models & Multimodal {#foundation-multimodal}
<!-- emoji: 🧱 | minutes: 8 | related: llm, generative-ai, fine-tuning -->

**TL;DR:** A foundation model is a large general-purpose model trained once on broad data, then adapted to many tasks; multimodal ones also handle images, audio or video.

### Explain
Before 2018 you typically trained a separate small model for each task: one for sentiment, one for translation, one for spam. A **foundation model** changes that: pretrain one very large model on broad data, then reuse it for countless jobs through prompting or light adaptation.

Why "foundation"? Because lots of products are built on top of it, the way buildings sit on a foundation. LLMs are the best-known type, but the idea also covers image and speech models.

**Multimodal** models accept or produce more than one kind of data (*modality*): text, images, audio, video, even PDFs and screenshots. Practical consequences:
- You can paste a screenshot of a UI bug and ask what's wrong.
- A model can describe a chart, read handwriting or transcribe a meeting.
- Some can also generate images or speech.

Internally, each modality is converted to vectors the same network can process, so text and pictures share one "language" of numbers.

### Analogy
A foundation model is a graduate with a broad general education who can be quickly trained for any job, versus hiring a narrow specialist for every single task.

### Why it matters
Multimodality is a huge lever for vibe coding: instead of describing a layout in words, you drop in a screenshot or a Figma export. And "build on a foundation model" is the default strategy for AI products, so you rarely train from scratch.

### Example
Prompt to a multimodal assistant, with a screenshot attached:

```
Here's a screenshot of my pricing page on mobile.
The cards overlap below 400px wide. Which CSS is likely
causing this, and what would you change?
```

The model reads the image *and* your text together to answer.

### Takeaways
- A foundation model is a broad, pretrained base reused for many tasks.
- Multimodal = handles several data types such as text, images and audio.
- Most AI products adapt an existing foundation model instead of training one.

### Glossary
- **Modality** — a type of data: text, image, audio, video.
- **Vision-language model** — a model that accepts both images and text.
- **Adaptation** — tailoring a foundation model to a task via prompting, fine-tuning or retrieval.

### Quiz
**Q:** What makes a model a "foundation model"?
- [ ] It runs only on a phone
- [x] It's trained broadly once and reused for many downstream tasks
- [ ] It's always open source
- [ ] It has exactly one modality
*Why:* Breadth plus reusability — one base, many applications — is the defining feature.

**Q:** You upload a photo of a whiteboard and ask for the notes as markdown. Which capability is this?
- [ ] Fine-tuning
- [ ] Diffusion
- [ ] Quantization
- [x] Multimodal understanding
*Why:* The model is handling image input and text output together, which is multimodal.

## The AI Landscape {#ai-landscape}
<!-- emoji: 🌐 | minutes: 9 | related: open-vs-closed, llm, coding-agents-ides -->

**TL;DR:** The AI world has labs that build models, platforms that serve them by API, and products — chatbots, coding tools, agents — that wrap them for users.

### Explain
It helps to see AI as a stack with three layers:

1. **Labs / model makers** — organisations such as Anthropic, OpenAI, Google DeepMind, Meta, Mistral and others train the models. Some keep weights private (*closed*), some release them (*open weights*).
2. **Platforms & APIs** — ways to use a model programmatically: the lab's own API, cloud providers (AWS, Google Cloud, Azure), model hubs, and hosts for open models.
3. **Products & apps** — what people actually touch.

Products come in flavours that are easy to mix up:
- **Chatbot** — you talk, it answers (Claude, ChatGPT, Gemini apps).
- **API** — you call the model from your own code and build whatever you like.
- **Coding assistant / AI IDE** — a model inside your editor or terminal (Cursor, Claude Code, GitHub Copilot).
- **Agent** — a model that can use tools and take multi-step actions toward a goal.

Same underlying model can power all four; the difference is the wrapper: prompts, tools, memory, UI.

### Analogy
Think of electricity: power stations (labs), the grid and sockets (APIs), and appliances (products). You can buy the appliance or plug your own device into the grid.

### Why it matters
When you read AI news or pick tools, ask "which layer is this?" A new chat app isn't a new model; a new model might not change your product until an API exists. It stops you chasing hype and helps you choose where to build.

### Example
| Layer | Examples (illustrative) | You use it when… |
|---|---|---|
| Lab / model | Claude, GPT, Gemini, Llama | choosing capability and price |
| Platform | Anthropic API, Bedrock, Vertex, Hugging Face | wiring a model into your app |
| Product | Chat apps, Cursor, Claude Code | getting work done directly |

### Takeaways
- Think in layers: model makers → APIs/platforms → products.
- Chatbot, API, coding tool and agent are different wrappers, often around the same model.
- Open-weights models can be self-hosted; closed ones are reached only through an API.

### Glossary
- **API** — a programmatic interface your code calls to use a service such as a model.
- **Open weights** — models whose parameters are downloadable, often with licence conditions.
- **Wrapper** — an app or layer around a model that adds prompts, tools and UI.
- **Hugging Face** — a hub for sharing and downloading open models and datasets.

### Quiz
**Q:** Which is a model *maker* rather than a product?
- [ ] A chat app
- [x] A lab that trains and releases LLMs
- [ ] A code editor plugin
- [ ] A prompt template
*Why:* Labs train the underlying models; the other options sit on top of them.

**Q:** Two tools feel completely different but both call the same model. What explains it?
- [ ] They use different tokenizers by law
- [ ] One of them is secretly a rules engine
- [x] Different wrappers: system prompts, tools, memory and UI
- [ ] Models can't be shared between products
*Why:* Much of a product's behaviour comes from what is built around the model, not just the model itself.
