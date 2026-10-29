import { parseMarkdownPack, slugify } from '../mdPack.ts'
import type { ImportKind, ParsedPack } from '../types.ts'
import { parseJsonPack } from './json.ts'

export const ACCEPT = '.pdf,.json,.md,.markdown,.txt,application/pdf,application/json,text/markdown,text/plain'
export const MAX_BYTES = 30 * 1024 * 1024

export function kindOf(file: File): ImportKind | null {
  const n = file.name.toLowerCase()
  if (n.endsWith('.pdf') || file.type === 'application/pdf') return 'pdf'
  if (n.endsWith('.json') || file.type === 'application/json') return 'json'
  if (n.endsWith('.md') || n.endsWith('.markdown')) return 'md'
  if (n.endsWith('.txt') || file.type === 'text/plain') return 'txt'
  return null
}

const baseName = (f: string) => f.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').trim()

/** Markdown/plain text → pack, with fallbacks for files that don't follow the template. */
export function parseTextPack(text: string, title: string): ParsedPack {
  let pack = parseMarkdownPack(text, title)
  if (pack.groups.length) return pack
  const t = text.replace(/\r\n?/g, '\n')
  if (/^#\s+\S/m.test(t) && !/^##\s+\S/m.test(t)) {
    // only top-level headings: treat each as a concept
    pack = parseMarkdownPack(t.replace(/^#\s+/gm, '## '), title)
    pack.warnings.unshift('No “##” headings found, so each “#” heading became a concept.')
    if (pack.groups.length) return pack
  }
  const body = t.trim()
  if (!body) throw new Error('That file is empty.')
  const wrapped = parseMarkdownPack(`## ${title} {#${slugify(title) || 'imported-notes'}}\n${body}`, title)
  wrapped.warnings.unshift('No headings found, so the whole file became one concept.')
  return wrapped
}

export async function parseFile(file: File): Promise<{ kind: ImportKind; pack: ParsedPack }> {
  const kind = kindOf(file)
  if (!kind) throw new Error(`“${file.name}” isn’t a supported type. Use PDF, JSON, Markdown or TXT.`)
  if (file.size > MAX_BYTES) throw new Error(`“${file.name}” is larger than 30 MB.`)
  const title = baseName(file.name) || 'Imported notes'
  if (kind === 'pdf') {
    const { parsePdfPack } = await import('./pdf.ts')
    return { kind, pack: await parsePdfPack(file, title) }
  }
  const text = await file.text()
  if (kind === 'json') return { kind, pack: parseJsonPack(text, title) }
  return { kind, pack: parseTextPack(text, title) }
}
