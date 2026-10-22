import { useEffect, useRef } from "react"

type Ribbon = { y: number; amp: number; k: number; sp: number; ph: number; th: number; c: [number, string][] }

// Colour stops fade out to the right, like the light streak in the reference.
const RIBBONS: Ribbon[] = [
  { y: 0.64, amp: 0.1, k: 0.8, sp: 0.22, ph: 0, th: 0.22, c: [[0, "#5EE0D0e6"], [0.35, "#43B5FFcc"], [0.7, "#9A8CFF88"], [1, "#F5A3E000"]] },
  { y: 0.72, amp: 0.08, k: 1.1, sp: -0.17, ph: 2, th: 0.17, c: [[0, "#7DD3FCcc"], [0.4, "#648EFFcc"], [0.8, "#B9A7FF77"], [1, "#B9A7FF00"]] },
  { y: 0.58, amp: 0.12, k: 0.55, sp: 0.12, ph: 4, th: 0.15, c: [[0, "#9A8CFFaa"], [0.5, "#7AA2FFaa"], [0.85, "#5EE0D055"], [1, "#5EE0D000"]] },
]

/** Slow, blurred aurora ribbons that drift and lean toward the cursor. */
export default function AuroraBackground() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return
    const W = 480
    const H = 300
    canvas.width = W
    canvas.height = H
    const m = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 }
    let raf = 0

    const draw = (now: number) => {
      const t = now / 1000
      m.x += (m.tx - m.x) * 0.04
      m.y += (m.ty - m.y) * 0.04
      ctx.clearRect(0, 0, W, H)
      for (const r of RIBBONS) {
        const top: number[] = []
        const bot: number[] = []
        const n = 48
        for (let i = 0; i <= n; i++) {
          const x = i / n
          const wave = Math.sin(x * r.k * Math.PI * 2 + t * r.sp + r.ph + (m.x - 0.5) * 1.5) + 0.5 * Math.sin(x * r.k * 5.1 + t * r.sp * 1.7)
          const cy = (r.y + (m.y - 0.5) * 0.06 + r.amp * wave) * H
          const th = r.th * H * (1.05 - 0.65 * x) * (0.75 + 0.25 * Math.sin(x * 6 + t * r.sp * 2 + r.ph))
          top.push(cy - th / 2)
          bot.push(cy + th / 2)
        }
        ctx.beginPath()
        top.forEach((y, i) => ctx.lineTo((i / n) * W, y))
        for (let i = n; i >= 0; i--) ctx.lineTo((i / n) * W, bot[i])
        ctx.closePath()
        const g = ctx.createLinearGradient(0, 0, W, 0)
        r.c.forEach(([o, col]) => g.addColorStop(o, col))
        ctx.fillStyle = g
        ctx.fill()
      }
      raf = window.requestAnimationFrame(draw)
    }

    const move = (e: PointerEvent) => {
      m.tx = e.clientX / window.innerWidth
      m.ty = e.clientY / window.innerHeight
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      draw(0)
      window.cancelAnimationFrame(raf)
      return
    }
    raf = window.requestAnimationFrame(draw)
    window.addEventListener("pointermove", move, { passive: true })
    return () => {
      window.cancelAnimationFrame(raf)
      window.removeEventListener("pointermove", move)
    }
  }, [])

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <canvas ref={ref} className="absolute inset-0 h-full w-full" style={{ filter: "blur(28px) saturate(1.2)", transform: "scale(1.15)" }} />
      <div className="absolute inset-x-0 top-0 h-[58%] bg-gradient-to-b from-[#F5F7FB] via-[#F5F7FB]/80 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-[22%] bg-gradient-to-t from-[#F5F7FB] to-transparent" />
    </div>
  )
}
