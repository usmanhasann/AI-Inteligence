import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { reduced } from '../lib/motion.ts'

/**
 * A living "neural constellation": nodes on a sphere, linked by nearby edges,
 * with glowing pulses travelling along them. Reacts to the pointer and to scroll.
 * Capped pixel ratio + paused when off-screen to stay light on phones.
 */
export default function Hero3D({ progress = 0 }: { progress?: number }) {
  const host = useRef<HTMLDivElement>(null)
  const prog = useRef(progress)
  prog.current = progress

  useEffect(() => {
    const el = host.current
    if (!el) return
    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' })
    } catch {
      return // WebGL unavailable: the CSS aurora is the fallback
    }
    const small = window.innerWidth < 640
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, small ? 1.5 : 2))
    renderer.setClearColor(0x000000, 0)
    el.appendChild(renderer.domElement)
    renderer.domElement.style.cssText = 'width:100%;height:100%;display:block'

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 100)
    camera.position.set(0, 0, 7.2)

    const group = new THREE.Group()
    scene.add(group)

    // nodes on a Fibonacci sphere with a little radial noise
    const N = small ? 70 : 120
    const pts: THREE.Vector3[] = []
    const golden = Math.PI * (3 - Math.sqrt(5))
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2
      const r = Math.sqrt(1 - y * y)
      const th = golden * i
      const rad = 2.5 + (Math.sin(i * 12.9898) * 0.5 + 0.5) * 0.35
      pts.push(new THREE.Vector3(Math.cos(th) * r, y, Math.sin(th) * r).multiplyScalar(rad))
    }

    // edges between near neighbours
    const edges: [number, number][] = []
    const lineVerts: number[] = []
    for (let i = 0; i < N; i++) {
      const near = pts
        .map((p, j) => ({ j, d: p.distanceTo(pts[i]) }))
        .filter((o) => o.j > i)
        .sort((a, b) => a.d - b.d)
        .slice(0, 3)
      for (const o of near) {
        if (o.d > 1.35) continue
        edges.push([i, o.j])
        lineVerts.push(pts[i].x, pts[i].y, pts[i].z, pts[o.j].x, pts[o.j].y, pts[o.j].z)
      }
    }
    const lineGeo = new THREE.BufferGeometry()
    lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(lineVerts, 3))
    const lines = new THREE.LineSegments(lineGeo, new THREE.LineBasicMaterial({ color: 0x8b7cf6, transparent: true, opacity: 0.28 }))
    group.add(lines)

    // glowing nodes
    const nodeGeo = new THREE.BufferGeometry().setFromPoints(pts)
    const sprite = (() => {
      const c = document.createElement('canvas')
      c.width = c.height = 64
      const g = c.getContext('2d')!
      const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32)
      grad.addColorStop(0, 'rgba(255,255,255,1)')
      grad.addColorStop(0.25, 'rgba(180,170,255,.85)')
      grad.addColorStop(1, 'rgba(120,90,255,0)')
      g.fillStyle = grad
      g.fillRect(0, 0, 64, 64)
      return new THREE.CanvasTexture(c)
    })()
    const nodes = new THREE.Points(nodeGeo, new THREE.PointsMaterial({ size: small ? 0.3 : 0.26, map: sprite, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, color: 0xc4b5fd }))
    group.add(nodes)

    // travelling pulses along edges
    const P = Math.min(26, edges.length)
    const pulseGeo = new THREE.BufferGeometry()
    pulseGeo.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(P * 3), 3))
    const pulses = new THREE.Points(
      pulseGeo,
      new THREE.PointsMaterial({ size: 0.34, map: sprite, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, color: 0x22d3ee }),
    )
    group.add(pulses)
    const state = Array.from({ length: P }, () => ({ e: Math.floor(Math.random() * edges.length), t: Math.random(), s: 0.25 + Math.random() * 0.5 }))

    // outer starfield
    const starPos = new Float32Array(260 * 3)
    for (let i = 0; i < 260; i++) {
      const v = new THREE.Vector3().randomDirection().multiplyScalar(6 + Math.random() * 8)
      starPos.set([v.x, v.y, v.z], i * 3)
    }
    const starGeo = new THREE.BufferGeometry()
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3))
    const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ size: 0.035, color: 0xffffff, transparent: true, opacity: 0.55 }))
    scene.add(stars)

    // inner core that grows with progress
    const core = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.9, 1),
      new THREE.MeshBasicMaterial({ color: 0x7c3aed, wireframe: true, transparent: true, opacity: 0.55 }),
    )
    group.add(core)

    const resize = () => {
      const w = el.clientWidth || 1
      const h = el.clientHeight || 1
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      camera.position.z = w / h < 0.9 ? 9.2 : 7.2
      camera.updateProjectionMatrix()
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(el)

    const mouse = { x: 0, y: 0, tx: 0, ty: 0 }
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      mouse.tx = ((e.clientX - r.left) / r.width - 0.5) * 2
      mouse.ty = ((e.clientY - r.top) / r.height - 0.5) * 2
    }
    window.addEventListener('pointermove', onMove)

    let visible = true
    const io = new IntersectionObserver(([en]) => (visible = en.isIntersecting), { threshold: 0 })
    io.observe(el)

    let last = performance.now()
    let elapsed = 0
    let raf = 0
    const posAttr = pulseGeo.getAttribute('position') as THREE.BufferAttribute
    const render = () => {
      raf = requestAnimationFrame(render)
      if (!visible || document.hidden) return
      const now = performance.now()
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      elapsed += dt
      const t = elapsed
      const calm = reduced()
      mouse.x += (mouse.tx - mouse.x) * 0.05
      mouse.y += (mouse.ty - mouse.y) * 0.05
      group.rotation.y += dt * (calm ? 0.02 : 0.12)
      group.rotation.x = mouse.y * 0.25 + Math.sin(t * 0.2) * 0.05
      group.position.x = mouse.x * 0.25
      stars.rotation.y -= dt * 0.01
      const s = 0.7 + prog.current * 0.9 + Math.sin(t * 1.6) * 0.04
      core.scale.setScalar(s)
      core.rotation.y += dt * 0.4
      core.rotation.x += dt * 0.2
      ;(core.material as THREE.MeshBasicMaterial).color.setHSL(0.72 - prog.current * 0.2, 0.9, 0.6)
      for (let i = 0; i < P; i++) {
        const st = state[i]
        st.t += dt * st.s * (calm ? 0.3 : 1)
        if (st.t >= 1) {
          st.t = 0
          st.e = Math.floor(Math.random() * edges.length)
        }
        const [a, b] = edges[st.e]
        posAttr.setXYZ(i, pts[a].x + (pts[b].x - pts[a].x) * st.t, pts[a].y + (pts[b].y - pts[a].y) * st.t, pts[a].z + (pts[b].z - pts[a].z) * st.t)
      }
      posAttr.needsUpdate = true
      renderer.render(scene, camera)
    }
    render()

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      window.removeEventListener('pointermove', onMove)
      ;[lineGeo, nodeGeo, pulseGeo, starGeo, core.geometry].forEach((g) => g.dispose())
      ;[lines.material, nodes.material, pulses.material, stars.material, core.material].forEach((m) => (m as THREE.Material).dispose())
      sprite.dispose()
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [])

  return <div ref={host} className="absolute inset-0" aria-hidden />
}
