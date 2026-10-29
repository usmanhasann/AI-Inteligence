// Renders public/icon.svg into the PNG sizes needed by the PWA manifest and Capacitor.
import sharp from 'sharp'
import { readFileSync, mkdirSync } from 'node:fs'

const svg = readFileSync('public/icon.svg')
const out = (name, size) => sharp(svg, { density: 384 }).resize(size, size).png().toFile(`public/${name}`)
await Promise.all([out('icon-192.png', 192), out('icon-512.png', 512), out('apple-touch-icon.png', 180)])
mkdirSync('assets', { recursive: true })
await sharp(svg, { density: 384 }).resize(1024, 1024).png().toFile('assets/icon-only.png')
await sharp(svg, { density: 384 }).resize(1024, 1024).png().toFile('assets/icon-foreground.png')
await sharp({ create: { width: 1024, height: 1024, channels: 4, background: '#07070d' } }).png().toFile('assets/icon-background.png')
await sharp({ create: { width: 2732, height: 2732, channels: 4, background: '#07070d' } })
  .composite([{ input: await sharp(svg, { density: 384 }).resize(720, 720).png().toBuffer(), gravity: 'center' }])
  .png().toFile('assets/splash.png')
console.log('icons written')
