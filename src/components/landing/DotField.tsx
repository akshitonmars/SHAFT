import { useEffect, useRef } from "react"

const GAP = 26
const REACH = 150

/** Dotted grid. Dots swell and darken near the cursor, then ease back to rest. */
export default function DotField() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const mouse = { x: -9999, y: -9999 }
    let w = 0
    let h = 0
    let cols = 0
    let rows = 0
    let levels = new Float32Array(0)
    let raf = 0

    const draw = () => {
      ctx.clearRect(0, 0, w, h)
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * GAP
          const y = r * GAP
          const i = r * cols + c
          const d = Math.hypot(x - mouse.x, y - mouse.y)
          const target = d < REACH ? 1 - d / REACH : 0
          levels[i] += (target - levels[i]) * 0.09
          const lv = levels[i]
          ctx.beginPath()
          ctx.arc(x, y, 1.1 + lv * 2.6, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(${Math.round(120 - 85 * lv)},${Math.round(134 - 55 * lv)},${Math.round(160 + 40 * lv)},${0.32 + lv * 0.68})`
          ctx.fill()
        }
      }
    }

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const rect = canvas.getBoundingClientRect()
      w = rect.width
      h = rect.height
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      cols = Math.ceil(w / GAP) + 1
      rows = Math.ceil(h / GAP) + 1
      levels = new Float32Array(cols * rows)
      if (reduce) draw()
    }

    const move = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouse.x = e.clientX - rect.left
      mouse.y = e.clientY - rect.top
    }
    const leave = () => {
      mouse.x = -9999
      mouse.y = -9999
    }
    const tick = () => {
      draw()
      raf = window.requestAnimationFrame(tick)
    }

    resize()
    window.addEventListener("resize", resize)
    if (!reduce) {
      window.addEventListener("pointermove", move, { passive: true })
      document.documentElement.addEventListener("pointerleave", leave)
      raf = window.requestAnimationFrame(tick)
    }
    return () => {
      window.cancelAnimationFrame(raf)
      window.removeEventListener("resize", resize)
      window.removeEventListener("pointermove", move)
      document.documentElement.removeEventListener("pointerleave", leave)
    }
  }, [])

  return <canvas ref={ref} aria-hidden="true" className="absolute inset-0 z-0 h-full w-full" />
}
