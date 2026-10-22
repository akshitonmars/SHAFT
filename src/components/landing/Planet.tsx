import { useState } from "react"
import type { CSSProperties } from "react"

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

/** Seamless (horizontally tileable) blue ocean + white cloud texture, generated once. */
function makePlanetTexture(): string {
  const W = 768
  const H = 384
  const canvas = document.createElement("canvas")
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext("2d")
  if (!ctx) return ""

  let seed = 11
  const rnd = () => {
    seed = (seed * 16807) % 2147483647
    return seed / 2147483647
  }
  // Integer x-frequencies keep the texture seamless when it scrolls.
  const waves = Array.from({ length: 14 }, (_, i) => ({
    fx: 1 + Math.floor(rnd() * 7),
    fy: (1 + Math.floor(rnd() * 9)) * (rnd() < 0.5 ? -1 : 1),
    phase: rnd() * Math.PI * 2,
    amp: 1 / (1 + i * 0.3),
  }))
  const total = waves.reduce((sum, wave) => sum + wave.amp, 0)

  const img = ctx.createImageData(W, H)
  for (let y = 0; y < H; y++) {
    const v = y / H
    const lat = Math.abs(v - 0.5) * 2
    for (let x = 0; x < W; x++) {
      const u = x / W + 0.05 * Math.sin(v * Math.PI * 6)
      let sum = 0
      for (const wave of waves) {
        sum += wave.amp * Math.sin(Math.PI * 2 * (wave.fx * u + wave.fy * v) + wave.phase)
      }
      const n = (sum / total) * 2.6
      const ocean = smooth(-0.9, 0.9, n) * 0.8
      const cloud = Math.min(1, smooth(0.1, 0.8, n) + smooth(0.78, 1, lat) * 0.7) * 0.95
      const o = (y * W + x) * 4
      img.data[o] = 14 + 42 * ocean + (255 - (14 + 42 * ocean)) * cloud
      img.data[o + 1] = 52 + 88 * ocean + (255 - (52 + 88 * ocean)) * cloud
      img.data[o + 2] = 190 + 65 * ocean + (255 - (190 + 65 * ocean)) * cloud
      img.data[o + 3] = 255
    }
  }
  ctx.putImageData(img, 0, 0)
  return canvas.toDataURL("image/jpeg", 0.92)
}

export default function Planet() {
  const [texture] = useState(makePlanetTexture)

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute z-0"
      style={
        {
          "--d": "clamp(520px, 70vw, 1100px)",
          width: "var(--d)",
          height: "var(--d)",
          right: "calc(var(--d) * -0.3)",
          bottom: "calc(var(--d) * -0.6)",
        } as CSSProperties
      }
    >
      <div
        className="absolute -inset-[12%] rounded-full opacity-70 blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(67,181,255,0.55), rgba(67,181,255,0) 65%)" }}
      />
      <div
        className="shaft-spin absolute inset-0 rounded-full"
        style={{
          backgroundImage: `url(${texture})`,
          backgroundSize: "auto 100%",
          backgroundRepeat: "repeat-x",
          transform: "rotate(-16deg)",
        }}
      />
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: "radial-gradient(circle at 30% 28%, rgba(255,255,255,0.5), rgba(255,255,255,0) 38%)",
          boxShadow:
            "inset -70px -70px 140px rgba(3,10,60,0.8), inset 10px 10px 40px rgba(255,255,255,0.35), 0 0 90px rgba(67,181,255,0.45)",
        }}
      />
    </div>
  )
}
