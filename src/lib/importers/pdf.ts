import { slugify } from '../mdPack.ts'
import type { ParsedConcept, ParsedPack, ParsedWeekGroup } from '../types.ts'

interface Line {
  text: string
  size: number
  y: number
  page: number
  gap: number
}

const MAX_PAGES = 400

function sentence(s: string) {
  const plain = s.replace(/\s+/g, ' ').trim()
  const m = plain.match(/^(.{20,220}?[.!?])(\s|$)/)
  return (m ? m[1] : plain.slice(0, 180)).trim()
}

function concept(title: string, body: string[], pages: [number, number]): ParsedConcept {
  const explain = body.join('\n\n').trim()
  return {
    id: slugify(title) || `section-${pages[0]}`,
    title,
    emoji: '📄',
    tldr: sentence(explain) || title,
    explain: explain || title,
    analogy: '',
    why: '',
    example: '',
    takeaways: [],
    glossary: [],
    quiz: [],
    minutes: Math.min(30, Math.max(4, Math.round(explain.split(/\s+/).length / 170 + 2))),
    related: [],
  }
}

/** Heuristic text extraction: headings = lines noticeably bigger than body text. Always reviewed by the user before import. */
export async function parsePdfPack(file: File, fallbackTitle: string): Promise<ParsedPack> {
  const pdfjs = await import('pdfjs-dist')
  const workerUrl = (await import('pdfjs-dist/build/pdf.worker.min.mjs?url')).default
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl
  const warnings: string[] = ['PDF text is extracted heuristically — check titles and text in the review step.']
  const doc = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise
  const pageCount = Math.min(doc.numPages, MAX_PAGES)
  if (doc.numPages > MAX_PAGES) warnings.push(`Only the first ${MAX_PAGES} pages were read.`)

  const lines: Line[] = []
  for (let p = 1; p <= pageCount; p++) {
    const page = await doc.getPage(p)
    const tc = await page.getTextContent()
    const rows: { y: number; size: number; parts: { x: number; s: string }[] }[] = []
    for (const it of tc.items) {
      if (!('str' in it) || !it.str.trim()) continue
      const [a, b, , , x, y] = it.transform as number[]
      const size = Math.round(Math.hypot(a, b) * 2) / 2
      let row = rows.find((r) => Math.abs(r.y - y) < 2.2)
      if (!row) rows.push((row = { y, size: 0, parts: [] }))
      row.parts.push({ x, s: it.str })
      row.size = Math.max(row.size, size)
    }
    rows.sort((r1, r2) => r2.y - r1.y)
    let prevY = 0
    for (const r of rows) {
      r.parts.sort((p1, p2) => p1.x - p2.x)
      const text = r.parts.map((q) => q.s).join(' ').replace(/\s+/g, ' ').trim()
      if (!text || /^\d{1,3}$/.test(text)) continue // lone page numbers
      lines.push({ text, size: r.size, y: r.y, page: p, gap: prevY ? prevY - r.y : 0 })
      prevY = r.y
    }
  }
  if (!lines.length) throw new Error('No selectable text found in this PDF (it may be scanned images). Try OCR first, or export the content as Markdown.')

  // body size = size with the most characters
  const weight = new Map<number, number>()
  lines.forEach((l) => weight.set(l.size, (weight.get(l.size) ?? 0) + l.text.length))
  const body = [...weight.entries()].sort((a, b) => b[1] - a[1])[0][0]
  const isHeading = (l: Line) => l.size >= body * 1.18 && l.text.length <= 110 && !/[,;]$/.test(l.text)
  const headingSizes = [...new Set(lines.filter(isHeading).map((l) => l.size))].sort((a, b) => b - a)
  const count = (s: number) => lines.filter((l) => isHeading(l) && l.size === s).length

  let groupSize: number | null = null
  let conceptSize: number | null = null
  if (headingSizes.length >= 3) [groupSize, conceptSize] = headingSizes
  else if (headingSizes.length === 2) {
    if (count(headingSizes[0]) <= 1) conceptSize = headingSizes[1]
    else conceptSize = headingSizes[0]
  } else if (headingSizes.length === 1) conceptSize = headingSizes[0]

  const groups: ParsedWeekGroup[] = []
  let docTitle = fallbackTitle
  const mkParas = (ls: Line[]) => {
    const paras: string[] = []
    let cur = ''
    ls.forEach((l, i) => {
      const bullet = /^([•▪◦\-–*]|\d+[.)])\s+/.test(l.text)
      const bigGap = i > 0 && l.gap > l.size * 1.9
      if (bullet || bigGap) {
        if (cur) paras.push(cur)
        cur = bullet ? '- ' + l.text.replace(/^([•▪◦\-–*]|\d+[.)])\s+/, '') : l.text
      } else cur = cur ? (cur.endsWith('-') && !cur.endsWith(' -') ? cur.slice(0, -1) + l.text : cur + ' ' + l.text) : l.text
    })
    if (cur) paras.push(cur)
    // collapse consecutive bullets into one list block
    return paras.reduce<string[]>((acc, p) => {
      if (p.startsWith('- ') && acc.length && acc[acc.length - 1].startsWith('- ')) acc[acc.length - 1] += '\n' + p
      else acc.push(p)
      return acc
    }, [])
  }

  if (conceptSize === null) {
    // no visible headings: chunk by ~900 words
    warnings.push('No headings were detected, so the text was split into sections of roughly 900 words.')
    let buf: Line[] = []
    let words = 0
    const flush = () => {
      if (!buf.length) return
      const n = groups.length ? groups[0].concepts.length + 1 : 1
      const c = concept(`${fallbackTitle} — part ${n}`, mkParas(buf), [buf[0].page, buf[buf.length - 1].page])
      c.id = slugify(`${fallbackTitle}-part-${n}`)
      if (!groups.length) groups.push({ title: fallbackTitle, concepts: [] })
      groups[0].concepts.push(c)
      buf = []
      words = 0
    }
    for (const l of lines) {
      buf.push(l)
      words += l.text.split(/\s+/).length
      if (words > 900 && /[.!?]$/.test(l.text)) flush()
    }
    flush()
    return { title: fallbackTitle, groups, warnings }
  }

  let curGroup: ParsedWeekGroup | null = null
  let title = ''
  let buf: Line[] = []
  let startPage = 1
  const flushConcept = () => {
    if (!title) return
    if (!curGroup) groups.push((curGroup = { title: docTitle, concepts: [] }))
    const c = concept(title, mkParas(buf), [startPage, buf.length ? buf[buf.length - 1].page : startPage])
    if (!curGroup.concepts.some((x) => x.id === c.id)) curGroup.concepts.push(c)
    title = ''
    buf = []
  }
  for (const l of lines) {
    if (groupSize !== null && isHeading(l) && l.size === groupSize) {
      flushConcept()
      const m = l.text.match(/^(?:week|module|chapter|part)\s*(\d+)\s*[:.\-–—]?\s*(.*)$/i)
      groups.push((curGroup = { number: m ? Number(m[1]) : undefined, title: (m?.[2] || l.text).trim(), concepts: [] }))
    } else if (isHeading(l) && l.size === conceptSize) {
      // merge a wrapped heading (two consecutive heading lines)
      if (title && buf.length === 0) title += ' ' + l.text
      else {
        flushConcept()
        title = l.text
        startPage = l.page
      }
    } else if (!title && groupSize === null && conceptSize !== null && count(conceptSize) === 1 && isHeading(l)) {
      docTitle = l.text
    } else if (title) buf.push(l)
    else if (headingSizes[0] === l.size && isHeading(l)) docTitle = l.text
  }
  flushConcept()
  const real = groups.filter((g) => g.concepts.length)
  if (!real.length) throw new Error('Could not find any sections in this PDF.')
  return { title: docTitle, groups: real, warnings }
}
