import { lazy, Suspense, type ComponentType } from 'react'
import { FlaskConical } from 'lucide-react'
import type { LabId } from '../lib/types.ts'

const LABS: Record<LabId, { title: string; blurb: string; C: ComponentType }> = {
  tokenizer: { title: 'Tokenizer playground', blurb: 'Type anything and watch it split into tokens.', C: lazy(() => import('./Tokenizer.tsx')) },
  'context-window': { title: 'Context window visualiser', blurb: 'See what fills the window — and what gets squeezed out.', C: lazy(() => import('./ContextWindow.tsx')) },
  sampling: { title: 'Temperature & top-p lab', blurb: 'Reshape the next-token probabilities and sample from them.', C: lazy(() => import('./Sampling.tsx')) },
  'embedding-space': { title: '3D embedding space', blurb: 'Meaning as coordinates. Search by dragging a query through the cloud.', C: lazy(() => import('./EmbeddingSpace.tsx')) },
  attention: { title: 'Attention explorer', blurb: 'Pick a word and see which other words the model looks at.', C: lazy(() => import('./Attention.tsx')) },
  'rag-pipeline': { title: 'RAG pipeline, step by step', blurb: 'Follow a question through retrieve → augment → generate.', C: lazy(() => import('./RagPipeline.tsx')) },
  chunking: { title: 'Chunking lab', blurb: 'Tune chunk size and overlap on real text.', C: lazy(() => import('./Chunking.tsx')) },
  'agent-loop': { title: 'Agent loop simulator', blurb: 'Watch think → act → observe repeat until the goal is met.', C: lazy(() => import('./AgentLoop.tsx')) },
  'cost-calculator': { title: 'Token cost calculator', blurb: 'Estimate what an AI feature costs per month.', C: lazy(() => import('./CostCalculator.tsx')) },
  'request-flow': { title: 'Request journey', blurb: 'Follow a click from browser to database and back.', C: lazy(() => import('./RequestFlow.tsx')) },
  contrast: { title: 'Contrast checker', blurb: 'Test colour pairs against WCAG accessibility ratios.', C: lazy(() => import('./Contrast.tsx')) },
  flexbox: { title: 'Flexbox playground', blurb: 'Change the properties, watch the layout respond.', C: lazy(() => import('./Flexbox.tsx')) },
}

export function LabHost({ id }: { id: LabId }) {
  const lab = LABS[id]
  if (!lab) return null
  const { C } = lab
  return (
    <section className="card p-5 sm:p-6 relative overflow-hidden" aria-label={lab.title}>
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand2 to-transparent opacity-70" />
      <div className="flex items-center gap-3 mb-4">
        <span className="w-10 h-10 rounded-xl grid place-items-center bg-brand2/15 border border-brand2/40 text-brand2"><FlaskConical size={18} /></span>
        <div>
          <div className="eyebrow text-brand2">Interactive lab</div>
          <h3 className="font-display text-lg font-semibold leading-tight">{lab.title}</h3>
        </div>
      </div>
      <p className="text-sm text-muted mb-4 -mt-1">{lab.blurb}</p>
      <Suspense fallback={<div className="h-56 rounded-2xl shimmer bg-surface" />}>
        <C />
      </Suspense>
    </section>
  )
}
