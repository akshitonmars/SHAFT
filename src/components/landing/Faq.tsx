import { useEffect, useRef, useState } from "react"
import { useInView } from "./motion"

const ITEMS = [
  {
    q: "What is Shaft?",
    a: "Shaft is a command center for your projects. It brings code, hosting, deployments and AI tools into one dashboard so you can build and ship without switching between services.",
  },
  {
    q: "Which tools does it connect to?",
    a: "Shaft starts with GitHub and Vercel. More AI, hosting and backend integrations are planned.",
  },
  {
    q: "How do the AI models work together?",
    a: "Shaft keeps your project context in one place, so work can move from one model to another, for example when a model hits its limit, without you re-explaining everything.",
  },
  {
    q: "Will my code stay mine?",
    a: "Your code lives in your own GitHub repository. Shaft connects to it and organizes what is happening around it rather than replacing it.",
  },
  {
    q: "When can I try it?",
    a: "Shaft is in active development. Use Start building to get going and follow along as new features arrive.",
  },
]

const ROW = 64
const BLOBS = [
  { left: "4%", top: "8%", bg: "#43B5FF", d: "16s" },
  { left: "48%", top: "0%", bg: "#9A8CFF", d: "19s" },
  { left: "30%", top: "48%", bg: "#2B3FD6", d: "22s" },
  { left: "62%", top: "46%", bg: "#FF8AD8", d: "25s" },
]

const CSS = `
.faq-fluid { transition: transform 1.8s cubic-bezier(0.22, 1, 0.36, 1), opacity 1.4s ease; }
.faq-off .faq-fluid { transform: scale(0.3); opacity: 0; }
.faq-wheel { transition: transform 1.3s cubic-bezier(0.22, 1, 0.36, 1) 0.2s, opacity 1s ease 0.2s, filter 1s ease 0.2s; }
.faq-off .faq-wheel { opacity: 0; transform: rotateX(60deg) translateY(60px) scale(0.92); filter: blur(14px); }
.faq-blob { position: absolute; width: 42vmax; height: 42vmax; filter: blur(90px); mix-blend-mode: screen; opacity: 0.5; animation: faqMorph 18s ease-in-out infinite alternate; }
@keyframes faqMorph {
  0% { border-radius: 42% 58% 60% 40% / 45% 40% 60% 55%; transform: translate(0, 0) rotate(0); }
  50% { border-radius: 60% 40% 35% 65% / 55% 60% 40% 45%; transform: translate(6vmax, -4vmax) rotate(90deg) scale(1.1); }
  100% { border-radius: 38% 62% 55% 45% / 62% 38% 62% 38%; transform: translate(-5vmax, 5vmax) rotate(180deg); }
}
.faq-ping { position: absolute; left: 50%; top: 50%; width: 44vmax; height: 44vmax; margin: -22vmax 0 0 -22vmax; border-radius: 50%; background: radial-gradient(circle, rgba(100, 142, 255, 0.55), transparent 62%); animation: faqPing 0.8s ease-out forwards; opacity: 0; }
@keyframes faqPing { from { opacity: 0.9; transform: scale(0.4); } to { opacity: 0; transform: scale(1.15); } }
.faq-band { animation: faqBand 0.5s ease-out; }
@keyframes faqBand { 0% { background: rgba(255, 255, 255, 0.2); transform: scale(1.025); } 100% { background: rgba(255, 255, 255, 0.04); transform: none; } }
.faq-answer { animation: faqIn 0.6s cubic-bezier(0.22, 1, 0.36, 1) backwards; }
@keyframes faqIn { from { opacity: 0; filter: blur(10px); transform: translateY(16px); } to { opacity: 1; filter: none; transform: none; } }
@media (prefers-reduced-motion: reduce) { .faq-blob, .faq-ping, .faq-band, .faq-answer { animation: none; } .faq-fluid, .faq-wheel { transition: none; } }
`

export default function Faq() {
  const wrap = useRef<HTMLElement>(null)
  const [stage, live] = useInView<HTMLDivElement>(0.3)
  const [pos, setPos] = useState(0)
  const [tick, setTick] = useState(0)
  const last = useRef(0)
  const active = Math.round(pos)

  useEffect(() => {
    let raf = 0
    const onScroll = () => {
      window.cancelAnimationFrame(raf)
      raf = window.requestAnimationFrame(() => {
        const el = wrap.current
        if (!el) return
        const r = el.getBoundingClientRect()
        const range = r.height - window.innerHeight
        const p = range > 0 ? Math.min(1, Math.max(0, -r.top / range)) : 0
        const v = p * (ITEMS.length - 1)
        setPos(v)
        const idx = Math.round(v)
        if (idx !== last.current) {
          last.current = idx
          setTick((t) => t + 1)
          if ("vibrate" in navigator) navigator.vibrate(8) // haptic tick where supported
        }
      })
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    return () => {
      window.cancelAnimationFrame(raf)
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
    }
  }, [])

  const goTo = (i: number) => {
    const el = wrap.current
    if (!el) return
    const top = el.getBoundingClientRect().top + window.scrollY
    window.scrollTo({ top: top + (i / (ITEMS.length - 1)) * (el.offsetHeight - window.innerHeight), behavior: "smooth" })
  }

  return (
    <section ref={wrap} id="faq" className="relative bg-[#050B1F] text-white" style={{ height: `calc(100svh + ${(ITEMS.length - 1) * 60}vh)` }}>
      <style>{CSS}</style>
      <div ref={stage} className={`sticky top-0 flex h-[100svh] items-center overflow-hidden px-6 sm:px-10 ${live ? "faq-on" : "faq-off"}`}>
        <div aria-hidden="true" className="faq-fluid pointer-events-none absolute inset-0">
          {BLOBS.map((b) => (
            <div key={b.bg} className="faq-blob" style={{ left: b.left, top: b.top, background: b.bg, animationDuration: b.d }} />
          ))}
          <span key={tick} className="faq-ping" />
        </div>

        <div className="relative mx-auto grid w-full max-w-[1100px] items-center gap-8 md:grid-cols-[1.1fr_0.9fr] md:gap-14">
          <div>
            <h2 className="mb-6 text-[clamp(30px,4vw,48px)] font-bold leading-[1.05] tracking-[-0.03em]" style={{ fontFamily: "Amaranth, sans-serif" }}>
              Questions, answered.
            </h2>
            <div className="faq-wheel relative h-[320px] [perspective:900px]" style={{ WebkitMaskImage: "linear-gradient(transparent, #000 28%, #000 72%, transparent)", maskImage: "linear-gradient(transparent, #000 28%, #000 72%, transparent)" }}>
              <div key={tick} className="faq-band absolute inset-x-0 top-1/2 rounded-2xl border border-white/15 bg-white/[0.04]" style={{ height: ROW, marginTop: -ROW / 2 }} />
              {ITEMS.map((item, i) => {
                const d = i - pos
                const a = Math.min(Math.abs(d), 3)
                return (
                  <button
                    key={item.q}
                    type="button"
                    aria-current={i === active}
                    onClick={() => goTo(i)}
                    className="absolute inset-x-0 top-1/2 flex items-center px-5 text-left text-[clamp(19px,2.4vw,28px)] font-bold leading-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#43B5FF]"
                    style={{
                      height: ROW,
                      marginTop: -ROW / 2,
                      fontFamily: "Amaranth, sans-serif",
                      transform: `translateY(${d * ROW}px) rotateX(${-d * 22}deg) scale(${1 - a * 0.1})`,
                      opacity: Math.max(0.08, 1 - a * 0.5),
                      filter: `blur(${a * 2.2}px)`,
                    }}
                  >
                    {item.q}
                  </button>
                )
              })}
            </div>
          </div>

          <div aria-live="polite" className="rounded-[28px] border border-white/15 bg-white/[0.07] p-7 shadow-[0_30px_80px_rgba(0,0,0,0.35)] backdrop-blur-2xl md:min-h-[260px]">
            <div key={active} className="faq-answer">
              <p className="text-sm text-white/50">0{active + 1} / 0{ITEMS.length}</p>
              <p className="mt-4 text-[19px] leading-relaxed text-white/90">{ITEMS[active]?.a}</p>
            </div>
          </div>
        </div>

        <p className={`absolute bottom-8 left-1/2 -translate-x-1/2 text-xs text-white/50 transition-opacity duration-500 ${pos > 0.3 ? "opacity-0" : "opacity-100"}`}>
          Keep scrolling
        </p>
      </div>
    </section>
  )
}
