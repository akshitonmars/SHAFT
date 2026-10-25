import { useEffect, useId, useState } from "react"
import { BARS, STOPS } from "../landing/LogoShowcase"
import AuroraBackground from "../auth/AuroraBackground"

const CSS = `
.sl-bar { transform-box: fill-box; transform-origin: center; animation-duration: 0.95s; animation-timing-function: cubic-bezier(0.65, 0, 0.35, 1); animation-iteration-count: infinite; animation-direction: alternate; }
.sl-0 { animation-name: slBig; }
.sl-1 { animation-name: slMid; }
.sl-2 { animation-name: slSmall; }
@keyframes slBig { to { transform: scaleY(0.478); } }
@keyframes slMid { to { transform: scaleY(1.06); } }
@keyframes slSmall { to { transform: scaleY(2.09); } }
@media (prefers-reduced-motion: reduce) { .sl-bar { animation: none; } }
`

type LoaderProps = {
  /** Height of the mark in px. Use ~18 inside buttons, 56 by default, 72+ for full pages. */
  size?: number
  label?: string
  /** Centre on a full-screen page. */
  fullscreen?: boolean
  /** Add the aurora background (full-screen only). */
  aurora?: boolean
  /** Wait this many ms before showing, so fast loads never flash a loader. */
  delay?: number
}

/** Shaft loader: big / medium / small bars swap to small / medium / big and back, on loop. */
export default function Loader({ size = 56, label, fullscreen = false, aurora = false, delay = 0 }: LoaderProps) {
  const id = useId().replace(/:/g, "")
  const [show, setShow] = useState(delay === 0)

  useEffect(() => {
    if (delay === 0) return
    const t = window.setTimeout(() => setShow(true), delay)
    return () => window.clearTimeout(t)
  }, [delay])

  if (!show) return null

  const mark = (
    <div role="status" aria-live="polite" className="inline-flex flex-col items-center gap-4">
      <style>{CSS}</style>
      <svg viewBox="380 110 740 1240" height={size} width={(size * 740) / 1240} aria-hidden="true" className="overflow-visible">
        <defs>
          {STOPS.map((s, i) => (
            <linearGradient key={i} id={`${id}g${i}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={s[0]} />
              <stop offset="0.55" stopColor={s[1]} />
              <stop offset="1" stopColor={s[2]} />
            </linearGradient>
          ))}
        </defs>
        {BARS.map((d, i) => (
          <path key={d} d={d} fill={`url(#${id}g${i})`} className={`sl-bar sl-${i}`} />
        ))}
      </svg>
      <span className="sr-only">{label ?? "Loading"}</span>
      {label && <p aria-hidden="true" className="text-sm text-slate-500">{label}</p>}
    </div>
  )

  if (!fullscreen) return mark
  return (
    <main className="relative grid min-h-[100svh] place-items-center overflow-hidden bg-[#F5F7FB]" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
      {aurora && <AuroraBackground />}
      <div className="relative">{mark}</div>
    </main>
  )
}
