import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { reduced } from '../lib/motion.ts'

const CLUSTERS: Record<string, { hue: number; center: [number, number, number]; words: string[] }> = {
  Animals: { hue: 30, center: [2.2, 0.8, 0.6], words: ['dog', 'cat', 'puppy', 'kitten', 'horse', 'lion', 'wolf', 'rabbit'] },
  Food: { hue: 140, center: [-1.8, 1.8, -0.6], words: ['pizza', 'pasta', 'burger', 'sushi', 'apple', 'bread', 'cheese', 'coffee'] },
  Tech: { hue: 200, center: [0.4, -2.2, 1.6], words: ['laptop', 'server', 'python', 'database', 'neural network', 'API', 'browser', 'GPU'] },
  Places: { hue: 280, center: [-2.2, -1.2, -1.4], words: ['Paris', 'London', 'Tokyo', 'Mumbai', 'beach', 'mountain', 'city', 'forest'] },
  Feelings: { hue: 340, center: [0.6, 1.4, -2.4], words: ['happy', 'joyful', 'sad', 'angry', 'excited', 'calm', 'afraid', 'proud'] },
}

function rng(seed: number) {
  let s = seed
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646
}

interface P { word: string; cluster: string; pos: THREE.Vector3; hue: number }

function buildPoints(): P[] {
  const r = rng(42)
  const out: P[] = []
  for (const [name, c] of Object.entries(CLUSTERS))
    for (const w of c.words) {
      const j = new THREE.Vector3(r() - 0.5, r() - 0.5, r() - 0.5).multiplyScalar(2.7)
      out.push({ word: w, cluster: name, hue: c.hue, pos: new THREE.Vector3(...c.center).multiplyScalar(1.45).add(j) })
    }
  return out
}

const cosine = (a: THREE.Vector3, b: THREE.Vector3) => a.dot(b) / (a.length() * b.length())

export default function EmbeddingSpace() {
  const host = useRef<HTMLDivElement>(null)
  const labels = useRef<HTMLDivElement>(null)
  const points = useMemo(buildPoints, [])
  const [query, setQuery] = useState('dog')
  const queryRef = useRef(query)
  queryRef.current = query

  const neighbours = useMemo(() => {
    const q = points.find((p) => p.word === query)
    if (!q) return []
    return points
      .filter((p) => p !== q)
      .map((p) => ({ p, s: cosine(q.pos, p.pos) }))
      .sort((a, b) => b.s - a.s)
      .slice(0, 5)
  }, [query, points])

  useEffect(() => {
    const el = host.current
    const lab = labels.current
    if (!el || !lab) return
    let renderer: THREE.WebGLRenderer
    try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }) } catch { return }
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
    el.appendChild(renderer.domElement)
    renderer.domElement.style.cssText = 'width:100%;height:100%;display:block;touch-action:none;cursor:grab'

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100)
    camera.position.set(0, 0, 11.5)
    const group = new THREE.Group()
    scene.add(group)

    group.add(new THREE.AxesHelper(4.2))
    ;(group.children[0] as THREE.AxesHelper).material = new THREE.LineBasicMaterial({ color: 0x6e6e8a, transparent: true, opacity: 0.35 })

    const geo = new THREE.SphereGeometry(0.11, 16, 16)
    const meshes = points.map((p) => {
      const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: new THREE.Color().setHSL(p.hue / 360, 0.85, 0.62) }))
      m.position.copy(p.pos)
      group.add(m)
      return m
    })
    const lineMat = new THREE.LineBasicMaterial({ color: 0xfbbf24, transparent: true, opacity: 0.9 })
    const lineGeo = new THREE.BufferGeometry()
    lineGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(5 * 2 * 3), 3))
    const lines = new THREE.LineSegments(lineGeo, lineMat)
    group.add(lines)

    const els = points.map((p) => {
      const d = document.createElement('div')
      d.textContent = p.word
      d.className = 'absolute left-0 top-0 text-[11px] font-semibold px-1.5 py-0.5 rounded-md whitespace-nowrap cursor-pointer select-none'
      d.style.cssText += `;background:hsl(${p.hue} 60% 20% / .75);color:hsl(${p.hue} 90% 80%);will-change:transform`
      d.onclick = () => setQuery(p.word)
      lab.appendChild(d)
      return d
    })

    const resize = () => {
      const w = el.clientWidth, h = el.clientHeight
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(el)

    let dragging = false, lx = 0, ly = 0, vx = 0.004, vy = 0
    const down = (e: PointerEvent) => { dragging = true; lx = e.clientX; ly = e.clientY; renderer.domElement.setPointerCapture(e.pointerId); renderer.domElement.style.cursor = 'grabbing' }
    const move = (e: PointerEvent) => { if (!dragging) return; vx = (e.clientX - lx) * 0.006; vy = (e.clientY - ly) * 0.006; group.rotation.y += vx; group.rotation.x = Math.max(-1.2, Math.min(1.2, group.rotation.x + vy)); lx = e.clientX; ly = e.clientY }
    const up = () => { dragging = false; renderer.domElement.style.cursor = 'grab'; vx = 0.002 }
    renderer.domElement.addEventListener('pointerdown', down)
    renderer.domElement.addEventListener('pointermove', move)
    renderer.domElement.addEventListener('pointerup', up)
    renderer.domElement.addEventListener('pointercancel', up)

    let visible = true
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting))
    io.observe(el)

    let raf = 0
    const v = new THREE.Vector3()
    const attr = lineGeo.getAttribute('position') as THREE.BufferAttribute
    const tick = () => {
      raf = requestAnimationFrame(tick)
      if (!visible) return
      if (!dragging && !reduced()) group.rotation.y += vx
      const q = points.find((p) => p.word === queryRef.current)
      const near = q ? points.filter((p) => p !== q).map((p) => ({ p, s: cosine(q.pos, p.pos) })).sort((a, b) => b.s - a.s).slice(0, 5) : []
      const nearSet = new Set(near.map((n) => n.p))
      near.forEach((n, i) => { attr.setXYZ(i * 2, q!.pos.x, q!.pos.y, q!.pos.z); attr.setXYZ(i * 2 + 1, n.p.pos.x, n.p.pos.y, n.p.pos.z) })
      for (let i = near.length; i < 5; i++) { attr.setXYZ(i * 2, 0, 0, 0); attr.setXYZ(i * 2 + 1, 0, 0, 0) }
      attr.needsUpdate = true
      meshes.forEach((m, i) => {
        const p = points[i]
        const isQ = p === q
        m.scale.setScalar(isQ ? 2.2 : nearSet.has(p) ? 1.6 : 1)
        v.copy(p.pos).applyMatrix4(group.matrixWorld).project(camera)
        const x = (v.x * 0.5 + 0.5) * el.clientWidth
        const y = (-v.y * 0.5 + 0.5) * el.clientHeight
        const d = els[i]
        d.style.transform = `translate(${x + 8}px, ${y - 9}px)`
        d.style.opacity = isQ || nearSet.has(p) ? '1' : String(Math.max(0.25, 0.75 - v.z * 0.5))
        d.style.zIndex = isQ ? '5' : '1'
        d.style.outline = isQ ? '1.5px solid #fbbf24' : 'none'
      })
      renderer.render(scene, camera)
    }
    group.updateMatrixWorld(true)
    tick()

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      els.forEach((d) => d.remove())
      geo.dispose(); lineGeo.dispose(); lineMat.dispose()
      meshes.forEach((m) => (m.material as THREE.Material).dispose())
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [points])

  return (
    <div className="space-y-4">
      <div className="relative h-[340px] sm:h-[420px] rounded-2xl overflow-hidden border border-line" style={{ background: 'radial-gradient(circle at 50% 40%, rgba(139,92,246,.12), rgba(0,0,0,.3))' }}>
        <div ref={host} className="absolute inset-0" />
        <div ref={labels} className="absolute inset-0 pointer-events-none [&>div]:pointer-events-auto overflow-hidden" />
        <div className="absolute left-3 top-3 text-[11px] text-muted rounded-lg px-2.5 py-1.5 pointer-events-none" style={{ background: 'color-mix(in oklab, var(--bg) 70%, transparent)' }}>Drag to rotate · tap a word to query</div>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <div className="eyebrow mb-2">Query</div>
          <div className="font-display text-2xl font-bold text-warn">“{query}”</div>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {Object.entries(CLUSTERS).map(([n, c]) => <span key={n} className="chip" style={{ color: `hsl(${c.hue} 90% 72%)` }}>{n}</span>)}
          </div>
        </div>
        <div>
          <div className="eyebrow mb-2">Nearest by cosine similarity</div>
          <ol className="grid gap-1.5">
            {neighbours.map((n, i) => (
              <li key={n.p.word} className="flex items-center gap-2 text-sm">
                <span className="w-4 text-faint text-xs">{i + 1}</span>
                <button className="font-semibold hover:text-brand2" onClick={() => setQuery(n.p.word)}>{n.p.word}</button>
                <div className="flex-1 h-1.5 rounded-full bg-surface2 overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-brand to-brand2" style={{ width: `${Math.max(0, n.s) * 100}%` }} /></div>
                <span className="tabular-nums text-xs text-muted w-10 text-right">{n.s.toFixed(2)}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
      <p className="text-xs text-faint">Real embeddings have hundreds to thousands of dimensions; here they’re squashed into 3 so you can see why “puppy” lands near “dog” and far from “server”.</p>
    </div>
  )
}
