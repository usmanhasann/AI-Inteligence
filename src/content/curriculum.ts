// The built-in 16-week course map. Concept bodies live in week-NN.md files.
import type { Month, Week } from '../lib/types.ts'

export const MONTHS: Month[] = [
  { id: 'm1', index: 1, title: 'Foundations', tagline: 'How AI & LLMs actually work', emoji: '🧠' },
  { id: 'm2', index: 2, title: 'Context & Retrieval', tagline: 'Context windows, RAG, memory, evals', emoji: '🔎' },
  { id: 'm3', index: 3, title: 'Agents & Vibe Coding', tagline: 'Tools, MCP, agents, shipping AI products', emoji: '🤖' },
  { id: 'm4', index: 4, title: 'Full-Stack & Design', tagline: 'The web, backend, DevOps, UX — the vocabulary behind every build', emoji: '🎨' },
]

type W = Omit<Week, 'index'>

const WEEKS_RAW: W[] = [
  // ───────── Month 1 ─────────
  {
    id: 'w01', monthId: 'm1', title: 'The AI Map', subtitle: 'AI, ML, deep learning, LLMs — who is who', emoji: '🗺️', track: 'foundations',
    outcome: 'Explain how AI, machine learning, neural networks and LLMs relate, and what training vs inference means.',
    concepts: ['ai-ml-dl', 'neural-network', 'model-parameters', 'training-vs-inference', 'llm', 'generative-ai', 'foundation-multimodal', 'ai-landscape'],
  },
  {
    id: 'w02', monthId: 'm1', title: 'Inside the LLM', subtitle: 'Tokens, context, embeddings, attention, sampling', emoji: '🔬', track: 'llm',
    outcome: 'Describe what happens between your prompt and the model’s answer, and why models hallucinate.',
    concepts: ['token', 'tokenizer-vocab', 'context-window', 'embedding', 'attention-transformer', 'sampling-temperature', 'hallucination', 'knowledge-cutoff'],
  },
  {
    id: 'w03', monthId: 'm1', title: 'How Models Are Made', subtitle: 'Pretraining, fine-tuning, alignment, reasoning models', emoji: '🏭', track: 'llm',
    outcome: 'Understand the model lifecycle and pick between open, closed, small, big and reasoning models.',
    concepts: ['pretraining', 'fine-tuning', 'rlhf-alignment', 'distillation-quantization', 'mixture-of-experts', 'scaling-laws', 'reasoning-models', 'open-vs-closed'],
  },
  {
    id: 'w04', monthId: 'm1', title: 'Prompting Like a Pro', subtitle: 'System prompts, few-shot, chain-of-thought, structure', emoji: '✍️', track: 'prompting',
    outcome: 'Write, structure and iterate prompts that behave predictably — and spot prompt injection.',
    concepts: ['prompt-anatomy', 'system-prompt', 'zero-few-shot', 'chain-of-thought', 'structured-output', 'prompt-patterns', 'prompt-injection', 'prompt-iteration'],
  },
  // ───────── Month 2 ─────────
  {
    id: 'w05', monthId: 'm2', title: 'Context Engineering', subtitle: 'What goes in the window, and how to keep it healthy', emoji: '🧩', track: 'context',
    outcome: 'Manage a context window deliberately: budget it, compress it, cache it and layer it.',
    concepts: ['context-engineering', 'context-rot', 'compaction-summarization', 'prompt-caching', 'long-context-vs-rag', 'token-budgeting', 'memory-short-long', 'context-layers'],
  },
  {
    id: 'w06', monthId: 'm2', title: 'RAG Fundamentals', subtitle: 'Chunking, vectors, search, reranking, grounding', emoji: '📚', track: 'rag',
    outcome: 'Sketch a RAG pipeline end to end and name what each stage does and how it fails.',
    concepts: ['rag-overview', 'chunking', 'vector-database', 'similarity-search', 'hybrid-search', 'reranking', 'grounding-citations', 'rag-vs-finetuning'],
  },
  {
    id: 'w07', monthId: 'm2', title: 'Advanced RAG & Knowledge', subtitle: 'Query rewriting, GraphRAG, agentic RAG, evaluation', emoji: '🕸️', track: 'rag',
    outcome: 'Recognise advanced retrieval techniques and diagnose why a RAG system gives bad answers.',
    concepts: ['query-rewriting-hyde', 'metadata-filtering', 'graphrag', 'agentic-rag', 'document-parsing-ocr', 'rag-evaluation', 'rag-failure-modes', 'semantic-caching'],
  },
  {
    id: 'w08', monthId: 'm2', title: 'Evals, Safety & Trust', subtitle: 'Benchmarks, LLM-as-judge, red-teaming, guardrails', emoji: '🛡️', track: 'safety',
    outcome: 'Know how AI quality and safety are measured and enforced, and what responsible use looks like.',
    concepts: ['evals-overview', 'benchmarks', 'llm-as-judge', 'red-teaming', 'guardrails', 'alignment-bias', 'privacy-pii', 'responsible-ai'],
  },
  // ───────── Month 3 ─────────
  {
    id: 'w09', monthId: 'm3', title: 'Tools & Protocols', subtitle: 'Function calling, JSON schema, MCP, LLM APIs', emoji: '🔧', track: 'agents',
    outcome: 'Explain how a model calls tools, what MCP standardises, and what an LLM API request contains.',
    concepts: ['function-calling', 'json-schema', 'mcp', 'llm-api-anatomy', 'tool-loop', 'code-sandboxes', 'computer-use', 'skills-plugins'],
  },
  {
    id: 'w10', monthId: 'm3', title: 'Agents', subtitle: 'Loops, planning, workflows vs agents, multi-agent', emoji: '🤖', track: 'agents',
    outcome: 'Tell a workflow from an agent, describe the agent loop, and anticipate where agents fail.',
    concepts: ['what-is-agent', 'react-pattern', 'planning', 'workflows-vs-agents', 'multi-agent', 'agent-memory-state', 'human-in-the-loop', 'agent-failure-modes'],
  },
  {
    id: 'w11', monthId: 'm3', title: 'Vibe Coding Toolchain', subtitle: 'AI IDEs, specs, instruction files, git, reviewing AI code', emoji: '⚡', track: 'vibe',
    outcome: 'Run a disciplined vibe-coding workflow: spec, plan, build, verify, checkpoint.',
    concepts: ['vibe-coding', 'coding-agents-ides', 'spec-driven-development', 'instruction-files', 'plan-build-review', 'git-for-vibe-coders', 'debugging-with-ai', 'reviewing-ai-code'],
  },
  {
    id: 'w12', monthId: 'm3', title: 'Shipping AI Products', subtitle: 'Streaming, latency, cost, routing, observability', emoji: '🚀', track: 'product',
    outcome: 'Reason about cost, latency and reliability of an AI feature before you ship it.',
    concepts: ['streaming', 'latency-ttft', 'token-pricing', 'rate-limits-retries', 'model-routing-gateways', 'observability-tracing', 'batch-async-apis', 'fallbacks-reliability'],
  },
  // ───────── Month 4 ─────────
  {
    id: 'w13', monthId: 'm4', title: 'Frontend Literacy', subtitle: 'HTML/CSS/JS, React, rendering modes, responsive, PWA', emoji: '🖥️', track: 'frontend',
    outcome: 'Read a frontend architecture and direct an AI assistant in the right vocabulary.',
    concepts: ['html-css-js', 'dom-events', 'components-react', 'rendering-modes', 'bundlers-frameworks', 'typescript-types', 'responsive-layout', 'pwa-native-wrappers'],
  },
  {
    id: 'w14', monthId: 'm4', title: 'Backend & Data', subtitle: 'HTTP, APIs, auth, databases, caching, realtime, serverless', emoji: '🗄️', track: 'backend',
    outcome: 'Trace a request from browser to database and back, and name each moving part.',
    concepts: ['client-server-http', 'rest-graphql-apis', 'auth-sessions-jwt-oauth', 'databases-sql-nosql', 'orm-migrations', 'caching-redis-cdn', 'queues-websockets-realtime', 'serverless-edge'],
  },
  {
    id: 'w15', monthId: 'm4', title: 'DevOps & Security', subtitle: 'CI/CD, Docker, secrets, DNS, web security, monitoring', emoji: '🔐', track: 'devops',
    outcome: 'Deploy safely: understand pipelines, containers, secrets, domains and the common web attacks.',
    concepts: ['ci-cd', 'docker-containers', 'env-secrets', 'dns-https-domains', 'cors-xss-csrf', 'web-vulns-supply-chain', 'monitoring-logging-errors', 'hosting-options'],
  },
  {
    id: 'w16', monthId: 'm4', title: 'Design & UX', subtitle: 'Design systems, type, colour, hierarchy, UX laws, motion', emoji: '🎨', track: 'design',
    outcome: 'Critique and direct UI work using design-system, typography, accessibility and UX-law vocabulary.',
    concepts: ['design-systems-tokens', 'typography-spacing', 'color-contrast-a11y', 'visual-hierarchy', 'ux-laws', 'user-flows-wireframes', 'microinteractions-motion', 'ai-ux-patterns'],
  },
]

export const WEEKS: Week[] = WEEKS_RAW.map((w, i) => ({ ...w, index: i + 1 }))
