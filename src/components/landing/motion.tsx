import { Fragment, useEffect, useRef, useState } from "react"

/** True once the element has scrolled into view (fires once). */
export function useInView<T extends HTMLElement>(threshold = 0.25) {
  const ref = useRef<T>(null)
  const [on, setOn] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setOn(true)
          io.disconnect()
        }
      },
      { threshold }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [threshold])
  return [ref, on] as const
}

const CSS = `
@keyframes rvRise { from { transform: translateY(115%); } to { transform: none; } }
@keyframes rvFocus { from { opacity: 0; filter: blur(12px); transform: translateY(8px) scale(1.06); } to { opacity: 1; filter: none; transform: none; } }
@keyframes rvCard { from { clip-path: inset(100% 0 0 0 round 28px); opacity: 0; } to { clip-path: inset(0 0 0 0 round 28px); opacity: 1; } }
@keyframes dvFlow { to { transform: translateX(-50%); } }
.rv-off .rv-word { transform: translateY(115%); }
.rv-on .rv-word { animation: rvRise 1s cubic-bezier(0.22, 1, 0.36, 1) backwards; }
.rv-off .rv-ch { opacity: 0; filter: blur(12px); }
.rv-on .rv-ch { animation: rvFocus 0.9s ease-out backwards; }
.rv-card-off { opacity: 0; clip-path: inset(100% 0 0 0 round 28px); }
.rv-card-on { animation: rvCard 1.1s cubic-bezier(0.22, 1, 0.36, 1) backwards; }
.dv-rise { transition: transform 1.3s cubic-bezier(0.22, 1, 0.36, 1); }
.dv-off .dv-rise { transform: translateY(70%); }
.dv-clip { transition: clip-path 2s cubic-bezier(0.65, 0, 0.35, 1); }
.dv-off .dv-clip { clip-path: inset(0 100% 0 0); }
.dv-slow { animation: dvFlow 24s linear infinite; }
.dv-fast { animation: dvFlow 14s linear infinite reverse; }
@media (prefers-reduced-motion: reduce) {
  .rv-off .rv-word, .rv-off .rv-ch { transform: none; opacity: 1; filter: none; }
  .rv-card-off { opacity: 1; clip-path: none; }
  .rv-on .rv-word, .rv-on .rv-ch, .rv-card-on, .dv-slow, .dv-fast { animation: none; }
  .dv-rise, .dv-clip { transition: none; }
}
`

export const MotionStyles = () => <style>{CSS}</style>

/** Headline intro. "rise": words slide up through a mask. "focus": letters pull into focus. */
export function SplitText({ text, mode, delay = 0 }: { text: string; mode: "rise" | "focus"; delay?: number }) {
  const [ref, on] = useInView<HTMLSpanElement>(0.4)
  const words = text.split(" ")
  let n = 0
  return (
    <span ref={ref} aria-label={text} className={on ? "rv-on" : "rv-off"}>
      {words.map((w, wi) => (
        <Fragment key={wi}>
          <span aria-hidden="true" className={mode === "rise" ? "inline-block overflow-hidden pb-[0.12em] align-bottom" : "inline-block"}>
            {mode === "rise" ? (
              <span className="rv-word inline-block" style={{ animationDelay: `${delay + wi * 0.09}s` }}>{w}</span>
            ) : (
              [...w].map((c, ci) => (
                <span key={ci} className="rv-ch inline-block" style={{ animationDelay: `${delay + n++ * 0.03}s` }}>{c}</span>
              ))
            )}
          </span>
          {wi < words.length - 1 && " "}
        </Fragment>
      ))}
    </span>
  )
}

const WAVE = Array.from({ length: 4 }, (_, i) => `C${i * 720 + 240} 30 ${i * 720 + 480} 150 ${i * 720 + 720} 90`).join(" ")
const LINE = `M0 90 ${WAVE}`

/** Curved boundary into the next section (colour `to`) with ribbons that draw across, then drift. */
export function SectionDivider({ to }: { to: string }) {
  const [ref, on] = useInView<HTMLDivElement>(0.01)
  const svg = { viewBox: "0 0 2880 160", preserveAspectRatio: "none" as const, className: "absolute bottom-0 left-0 h-full w-[200%]" }
  return (
    <div ref={ref} aria-hidden="true" className={`pointer-events-none relative z-10 -mt-28 h-28 overflow-hidden ${on ? "dv-on" : "dv-off"}`}>
      <div className="dv-rise absolute inset-0">
        <svg {...svg} className={`${svg.className} dv-slow`}>
          <path d={`${LINE} V160 H0 Z`} fill={to} />
        </svg>
      </div>
      <div className="dv-clip absolute inset-0">
        <svg {...svg} className={`${svg.className} dv-fast`} fill="none">
          <defs>
            <linearGradient id="dvg" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="2880" y2="0">
              {["#43B5FF", "#9A8CFF", "#43B5FF", "#9A8CFF", "#43B5FF"].map((c, i) => (
                <stop key={i} offset={i / 4} stopColor={c} />
              ))}
            </linearGradient>
          </defs>
          <path d={LINE} stroke="url(#dvg)" strokeWidth="10" opacity="0.35" vectorEffect="non-scaling-stroke" style={{ filter: "blur(6px)" }} />
          <path d={LINE} stroke="url(#dvg)" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
          <path d={LINE} transform="translate(0,-16)" stroke="url(#dvg)" strokeWidth="1.2" opacity="0.5" vectorEffect="non-scaling-stroke" />
          <path d={LINE} transform="translate(0,160) scale(1,-1)" stroke="url(#dvg)" strokeWidth="1.8" opacity="0.6" vectorEffect="non-scaling-stroke" />
        </svg>
      </div>
    </div>
  )
}
