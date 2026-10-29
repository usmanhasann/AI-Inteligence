// Usage: node --experimental-strip-types scripts/validate-content.ts [week-01.md ...]
// Validates src/content/week-*.md against the curriculum and the pack format.
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join, dirname, basename } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseMarkdownPack } from '../src/lib/mdPack.ts'
import { WEEKS } from '../src/content/curriculum.ts'

const dir = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'content')
const only = process.argv.slice(2).map((a) => basename(a))
const files = readdirSync(dir).filter((f) => /^week-\d\d\.md$/.test(f) && (!only.length || only.includes(f)))
let problems = 0
let total = 0
const bad = (m: string) => { problems++; console.log('  ✗ ' + m) }

for (const f of WEEKS.map((w) => `week-${String(w.index).padStart(2, '0')}.md`).filter((f) => !only.length || only.includes(f))) {
  if (!existsSync(join(dir, f))) { console.log(`${f}: MISSING`); if (only.length) problems++; continue }
}
const allIds = new Set(WEEKS.flatMap((w) => w.concepts))
for (const f of files) {
  const idx = Number(f.slice(5, 7))
  const week = WEEKS[idx - 1]
  const pack = parseMarkdownPack(readFileSync(join(dir, f), 'utf8'), week.title)
  const cs = pack.groups.flatMap((g) => g.concepts)
  console.log(`${f} (${week.title}): ${cs.length} concepts`)
  pack.warnings.forEach((w) => bad('warning: ' + w))
  const got = cs.map((c) => c.id)
  week.concepts.forEach((id) => { if (!got.includes(id)) bad(`missing concept "${id}"`) })
  got.forEach((id) => { if (!week.concepts.includes(id)) bad(`unexpected concept id "${id}"`) })
  got.forEach((id, i) => { if (week.concepts.includes(id) && week.concepts[i] !== id) bad(`order: "${id}" is at position ${i + 1}, expected "${week.concepts[i]}"`) })
  for (const c of cs) {
    total++
    const w = (m: string) => bad(`${c.id}: ${m}`)
    if (c.tldr.split(/\s+/).length > 32) w(`tldr too long (${c.tldr.split(/\s+/).length} words)`)
    const ew = c.explain.split(/\s+/).length
    if (ew < 70 || ew > 260) w(`explain length ${ew} words (want ~100-190)`)
    if (!c.analogy) w('missing Analogy')
    if (!c.why) w('missing Why it matters')
    if (!c.example) w('missing Example')
    if (c.takeaways.length < 3) w('need ≥3 takeaways')
    if (c.glossary.length < 2) w('need ≥2 glossary terms')
    if (c.quiz.length < 2) w('need ≥2 quiz questions')
    c.quiz.forEach((q, i) => { if (q.options.length < 3 || !q.why) w(`quiz ${i + 1}: need ≥3 options and a Why`) })
    if (c.emoji === '📘') w('missing emoji in meta comment')
    c.related.forEach((r) => { if (!allIds.has(r)) w(`related id "${r}" does not exist in curriculum`) })
  }
}
console.log(problems ? `\n${problems} problem(s) across ${total} concepts` : `\n✓ all good (${total} concepts)`)
process.exit(problems ? 1 : 0)
