import { parseMarkdownPack } from '../lib/mdPack.ts'
import type { Concept } from '../lib/types.ts'
import { WEEKS } from './curriculum.ts'

// Lazy: each week-NN.md becomes its own chunk, loaded in parallel at startup.
const loaders = import.meta.glob('./week-*.md', { query: '?raw', import: 'default' }) as Record<string, () => Promise<string>>

/** Parse the built-in week-NN.md files into concepts. */
export async function loadBuiltinConcepts(): Promise<Record<string, Concept>> {
  const out: Record<string, Concept> = {}
  const known = new Set(WEEKS.flatMap((w) => w.concepts))
  const raws = await Promise.all(Object.entries(loaders).map(async ([path, load]) => [path, await load()] as const))
  for (const [path, raw] of raws) {
    const pack = parseMarkdownPack(raw, path)
    for (const g of pack.groups)
      for (const { weekHint: _weekHint, ...c } of g.concepts) {
        if (known.has(c.id)) out[c.id] = c
      }
  }
  return out
}
