import { useEffect, useLayoutEffect, useRef, type RefObject } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger, useGSAP)

/** True when the user (or OS) wants less motion. Read at call time so toggling in Settings is instant. */
export function reduced(): boolean {
  const m = document.documentElement.dataset.motion
  if (m === 'off') return true
  if (m === 'on') return false
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
}

export { gsap, ScrollTrigger, useGSAP }

/**
 * gsap.from with a failsafe: if the tween is ever stalled or interrupted, the elements are forced
 * visible after the expected duration so UI can never stay stuck at opacity 0.
 */
export function safeFrom(targets: gsap.TweenTarget, vars: gsap.TweenVars) {
  const els = gsap.utils.toArray<HTMLElement>(targets)
  if (!els.length) return
  const total = ((vars.duration as number) ?? 0.5) + ((vars.stagger as number) ?? 0) * els.length + ((vars.delay as number) ?? 0)
  gsap.from(els, { ...vars, clearProps: 'transform,opacity' })
  window.setTimeout(() => els.forEach((e) => e.isConnected && (e.style.opacity = e.style.opacity === '0' ? '' : e.style.opacity)), (total + 0.6) * 1000)
}

/** Fade/slide-in everything marked data-reveal inside scope; use data-scroll for scroll-triggered ones. */
export function useReveal(scope: RefObject<HTMLElement | null>, deps: unknown[] = []) {
  useGSAP(
    () => {
      if (reduced() || !scope.current) return
      const first = scope.current.querySelectorAll('[data-reveal]')
      if (first.length) safeFrom(first, { y: 24, opacity: 0, duration: 0.7, ease: 'power3.out', stagger: 0.07 })
      scope.current.querySelectorAll<HTMLElement>('[data-scroll]').forEach((el) => {
        gsap.from(el, {
          y: 30,
          opacity: 0,
          duration: 0.7,
          ease: 'power3.out',
          clearProps: 'transform,opacity',
          scrollTrigger: { trigger: el, start: 'top 94%', once: true },
        })
      })
    },
    { scope, dependencies: deps, revertOnUpdate: true },
  )
}

/** Animate a number inside an element. */
export function useCountUp(ref: RefObject<HTMLElement | null>, value: number, fmt: (n: number) => string = (n) => String(Math.round(n))) {
  const last = useRef(0)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    if (reduced()) {
      el.textContent = fmt(value)
      last.current = value
      return
    }
    const o = { v: last.current }
    const tw = gsap.to(o, { v: value, duration: 1.1, ease: 'power2.out', onUpdate: () => (el.textContent = fmt(o.v)) })
    last.current = value
    return () => {
      tw.kill()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])
}

const CONFETTI = ['#8b5cf6', '#22d3ee', '#f472b6', '#fbbf24', '#34d399', '#fb7185']
export function confetti(x = window.innerWidth / 2, y = window.innerHeight / 3, count = 70) {
  if (reduced()) return
  const bits: HTMLElement[] = []
  for (let i = 0; i < count; i++) {
    const b = document.createElement('i')
    b.className = 'confetti-bit'
    b.style.background = CONFETTI[i % CONFETTI.length]
    b.style.left = `${x}px`
    b.style.top = `${y}px`
    document.body.appendChild(b)
    bits.push(b)
  }
  gsap.to(bits, {
    x: () => gsap.utils.random(-320, 320),
    y: () => gsap.utils.random(-380, 220),
    rotation: () => gsap.utils.random(-540, 540),
    scale: () => gsap.utils.random(0.6, 1.3),
    duration: () => gsap.utils.random(1.1, 1.9),
    ease: 'power3.out',
  })
  gsap.to(bits, { opacity: 0, delay: 0.9, duration: 0.8, stagger: 0.004, onComplete: () => bits.forEach((b) => b.remove()) })
}

/** 3D tilt + glare following the pointer. Attach the returned ref to a card. */
export function useTilt<T extends HTMLElement>(max = 9) {
  const ref = useRef<T>(null)
  useEffect(() => {
    const el = ref.current
    if (!el || !window.matchMedia('(hover: hover)').matches) return
    const qx = gsap.quickTo(el, 'rotationY', { duration: 0.5, ease: 'power3.out' })
    const qy = gsap.quickTo(el, 'rotationX', { duration: 0.5, ease: 'power3.out' })
    gsap.set(el, { transformPerspective: 900, transformStyle: 'preserve-3d' })
    const move = (e: PointerEvent) => {
      if (reduced()) return
      const r = el.getBoundingClientRect()
      const px = (e.clientX - r.left) / r.width - 0.5
      const py = (e.clientY - r.top) / r.height - 0.5
      qx(px * max)
      qy(-py * max)
      el.style.setProperty('--mx', `${(px + 0.5) * 100}%`)
      el.style.setProperty('--my', `${(py + 0.5) * 100}%`)
    }
    const leave = () => {
      qx(0)
      qy(0)
    }
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerleave', leave)
    return () => {
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerleave', leave)
    }
  }, [max])
  return ref
}

/** Buttons that gently chase the cursor. */
export function useMagnetic<T extends HTMLElement>(strength = 0.25) {
  const ref = useRef<T>(null)
  useEffect(() => {
    const el = ref.current
    if (!el || !window.matchMedia('(hover: hover)').matches) return
    const qx = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power3.out' })
    const qy = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power3.out' })
    const move = (e: PointerEvent) => {
      if (reduced()) return
      const r = el.getBoundingClientRect()
      qx((e.clientX - (r.left + r.width / 2)) * strength)
      qy((e.clientY - (r.top + r.height / 2)) * strength)
    }
    const leave = () => {
      qx(0)
      qy(0)
    }
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerleave', leave)
    return () => {
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerleave', leave)
    }
  }, [strength])
  return ref
}
