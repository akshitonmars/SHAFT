import { useEffect, useId, useRef, useState } from "react"

const CSS = `
@keyframes lgIn { from { opacity: 0; transform: scaleY(0.15) translateY(40px); filter: blur(14px); } to { opacity: 1; transform: none; filter: none; } }
@keyframes lgFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-18px); } }
@keyframes lgSweep { 0% { transform: translateX(-160px); opacity: 0; } 15% { opacity: 1; } 60% { transform: translateX(900px); opacity: 1; } 100% { transform: translateX(900px); opacity: 0; } }
@keyframes lgPulse { 0%, 100% { opacity: 0.35; transform: scale(1); } 50% { opacity: 0.6; transform: scale(1.12); } }
.lg-off { opacity: 0; }
.lg-in, .lg-float, .lg-sweep { transform-box: fill-box; transform-origin: center; }
.lg-in { animation: lgIn 1.2s cubic-bezier(0.22, 1, 0.36, 1) backwards; }
.lg-float { animation: lgFloat 6s ease-in-out infinite; }
.lg-sweep { animation: lgSweep 6s ease-in-out 1.6s infinite; }
.lg-pulse { animation: lgPulse 7s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) { .lg-in, .lg-float, .lg-sweep, .lg-pulse { animation: none; } .lg-sweep { opacity: 0; } }
`

const BARS = [
  "M411 130C405 145 405 165 405 180L405 1310C405 1318 406 1324 408 1328Q510 1230 632 1160L632 312Q520 238 411 130Z",
  "M730 368Q815 410 895 433L895 1052Q815 1075 730 1110Z",
  "M987 458Q1045 472 1099 477L1099 1018Q1045 1022 987 1032Z",
]
const STOPS = [
  ["#BBDFFF", "#A9D6FF", "#1AA0FF"],
  ["#C0D8FF", "#CBC8FF", "#5AA8FF"],
  ["#25A2FF", "#A8D8FF", "#C2E2FF"],
]

/** Shaft's three-bar mark. Pass animate + live for the entrance, float and light sweep. */
export function LogoMark({ animate = false, live = true, className = "" }: { animate?: boolean; live?: boolean; className?: string }) {
  const id = useId().replace(/:/g, "")
  return (
    <svg viewBox="380 110 740 1240" className={className} aria-hidden="true">
      <defs>
        {STOPS.map((s, i) => (
          <linearGradient key={i} id={`${id}g${i}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={s[0]} />
            <stop offset="0.55" stopColor={s[1]} />
            <stop offset="1" stopColor={s[2]} />
          </linearGradient>
        ))}
        <linearGradient id={`${id}s`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0.75" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <clipPath id={`${id}c`}>
          {BARS.map((d) => (
            <path key={d} d={d} />
          ))}
        </clipPath>
      </defs>
      {BARS.map((d, i) => (
        <g key={d} className={animate && live ? "lg-float" : ""} style={{ animationDelay: `${-i * 1.6}s` }}>
          <path
            d={d}
            fill={`url(#${id}g${i})`}
            className={animate ? (live ? "lg-in" : "lg-off") : ""}
            style={{ animationDelay: `${i * 0.18}s` }}
          />
        </g>
      ))}
      {animate && live && (
        <g clipPath={`url(#${id}c)`}>
          <rect className="lg-sweep" x="300" y="100" width="260" height="1260" fill={`url(#${id}s)`} />
        </g>
      )}
    </svg>
  )
}

export default function LogoShowcase() {
  const ref = useRef<HTMLElement>(null)
  const [live, setLive] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setLive(true)
          io.disconnect()
        }
      },
      { threshold: 0.35 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <section
      ref={ref}
      className="relative overflow-hidden px-6 pb-28 pt-32 text-center text-white"
      style={{ background: "linear-gradient(180deg, #07123A 0%, #0B2A8F 60%, #0A1F6B 100%)" }}
    >
      <style>{CSS}</style>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="lg-pulse absolute left-1/2 top-24 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[#43B5FF] blur-[130px]" />
        <div className="absolute -left-24 bottom-10 h-[360px] w-[360px] rounded-full bg-[#9A8CFF] opacity-30 blur-[120px]" />
      </div>
      <div className="relative mx-auto flex max-w-[760px] flex-col items-center">
        <LogoMark animate live={live} className="h-[min(48vh,420px)] w-auto" />
        <h2 className="mt-12 text-[clamp(36px,6vw,72px)] font-bold leading-[1.02] tracking-[-0.03em]" style={{ fontFamily: "Amaranth, sans-serif" }}>
          Ready to build beyond ideas?
        </h2>
        <p className="mt-5 max-w-[34rem] text-[17px] leading-relaxed text-white/70">
          Bring your repos, deployments and AI tools into one place and keep every project moving.
        </p>
        <a
          href="/get-started"
          className="mt-9 inline-flex h-12 items-center rounded-full bg-white px-7 text-[15px] font-semibold text-[#07123A] shadow-[0_10px_30px_rgba(0,0,0,0.25)] transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B2A8F]"
        >
          Start building
        </a>
      </div>
    </section>
  )
}
