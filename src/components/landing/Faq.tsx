
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
  { left: "4%", top: "8%", bg: "#43B5FF", d: "19s" },
  { left: "48%", top: "0%", bg: "#9A8CFF", d: "23s" },
  { left: "30%", top: "48%", bg: "#2B3FD6", d: "27s" },
  { left: "62%", top: "46%", bg: "#FF8AD8", d: "30s" },
]

const CSS = `
.faq-fluid {
  opacity: 1;
  transition: opacity 450ms ease;
  contain: paint;
}

.faq-off .faq-fluid {
  opacity: 0;
}

.faq-blob {
  position: absolute;
  width: 38vmax;
  height: 38vmax;
  pointer-events: none;
  opacity: 0.25;
  background-repeat: no-repeat;
  animation: faqDrift 22s ease-in-out infinite alternate;
  will-change: transform;
}

@keyframes faqDrift {
  0% {
    transform: translate3d(0, 0, 0) scale(1);
  }
  50% {
    transform: translate3d(2vw, -1.5vh, 0) scale(1.04);
  }
  100% {
    transform: translate3d(-1.5vw, 1vh, 0) scale(1.01);
  }
}

.faq-wheel {
  transition: opacity 300ms ease;
  transform: translateZ(0);
}

.faq-band {
  animation: faqBand 350ms ease-out;
}

@keyframes faqBand {
  0% {
    background: rgba(255, 255, 255, 0.12);
  }
  100% {
    background: rgba(255, 255, 255, 0.04);
  }
}

.faq-answer {
  animation: faqIn 280ms ease-out;
}

@keyframes faqIn {
  from {
    opacity: 0;
    transform: translate3d(0, 8px, 0);
  }
  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
}

.faq-ping {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 32vmax;
  height: 32vmax;
  margin: -16vmax 0 0 -16vmax;
  border-radius: 50%;
  pointer-events: none;
  background: radial-gradient(
    circle,
    rgba(100, 142, 255, 0.24),
    transparent 68%
  );
  animation: faqPing 550ms ease-out forwards;
}

@keyframes faqPing {
  from {
    opacity: 0.65;
    transform: scale(0.65);
  }
  to {
    opacity: 0;
    transform: scale(1.05);
  }
}

@media (prefers-reduced-motion: reduce) {
  .faq-blob,
  .faq-ping,
  .faq-band,
  .faq-answer {
    animation: none;
  }

  .faq-fluid,
  .faq-wheel {
    transition: none;
  }
}
`

export default function Faq() {
  const wrap = useRef<HTMLElement>(null)
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([])
  const lastActive = useRef(0)

  const [stage, live] = useInView<HTMLDivElement>(0.3)
  const [active, setActive] = useState(0)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let raf = 0
    let previousValue = -1

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches

    // Update the wheel directly, without re-rendering React on every scroll.
    const updateWheel = (value: number) => {
      if (Math.abs(value - previousValue) < 0.003) return

      previousValue = value

      itemRefs.current.forEach((node, i) => {
        if (!node) return

        const distanceFromCenter = i - value
        const distance = Math.min(Math.abs(distanceFromCenter), 3)

        const rotation = reducedMotion ? 0 : -distanceFromCenter * 16
        const scale = reducedMotion ? 1 : 1 - distance * 0.075

        node.style.transform =
          `translate3d(0, ${distanceFromCenter * ROW}px, 0) ` +
          `rotateX(${rotation}deg) scale(${scale})`

        node.style.opacity = String(Math.max(0.12, 1 - distance * 0.42))
      })
    }

    const onScroll = () => {
      if (raf) return

      raf = window.requestAnimationFrame(() => {
        raf = 0

        const el = wrap.current
        if (!el) return

        const rect = el.getBoundingClientRect()
        const range = rect.height - window.innerHeight

        const progress =
          range > 0
            ? Math.min(1, Math.max(0, -rect.top / range))
            : 0

        const value = progress * (ITEMS.length - 1)
        updateWheel(value)

        const nextActive = Math.round(value)

        // React updates only when the selected FAQ actually changes.
        if (nextActive !== lastActive.current) {
          lastActive.current = nextActive
          setActive(nextActive)
          setTick((current) => current + 1)

          if ("vibrate" in navigator) {
            navigator.vibrate(8)
          }
        }
      })
    }

    const onResize = () => {
      previousValue = -1
      onScroll()
    }

    onScroll()

    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onResize)

    return () => {
      if (raf) window.cancelAnimationFrame(raf)

      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onResize)
    }
  }, [])

  const goTo = (i: number) => {
    const el = wrap.current
    if (!el) return

    const top = el.getBoundingClientRect().top + window.scrollY
    const range = el.offsetHeight - window.innerHeight

    window.scrollTo({
      top: top + (i / (ITEMS.length - 1)) * range,
      behavior: "smooth",
    })
  }

  return (
    <section
      ref={wrap}
      id="faq"
      className="relative bg-[#050B1F] text-white"
      style={{
        height: `calc(100svh + ${(ITEMS.length - 1) * 60}vh`,
      }}
    >
      <style>{CSS}</style>

      <div
        ref={stage}
        className={`sticky top-0 flex h-[100svh] items-center overflow-hidden px-6 sm:px-10 ${
          live ? "faq-on" : "faq-off"
        }`}
      >
        {/* Ambient background */}
        <div
          aria-hidden="true"
          className="faq-fluid pointer-events-none absolute inset-0 overflow-hidden"
        >
          {BLOBS.map((blob) => (
            <div
              key={blob.bg}
              className="faq-blob"
              style={{
                left: blob.left,
                top: blob.top,
                background: `radial-gradient(circle, ${blob.bg} 0%, transparent 70%)`,
                animationDuration: blob.d,
              }}
            />
          ))}

          <span key={tick} className="faq-ping" />
        </div>

        {/* Main FAQ layout */}
        <div className="relative mx-auto grid w-full max-w-[1100px] items-center gap-8 md:grid-cols-[1.1fr_0.9fr] md:gap-14">
          {/* Question wheel */}
          <div>
            <h2
              className="mb-6 text-[clamp(30px,4vw,48px)] font-bold leading-[1.05] tracking-[-0.03em]"
              style={{ fontFamily: "Amaranth, sans-serif" }}
            >
              Questions, answered.
            </h2>

            <div
              className="faq-wheel relative h-[320px] [perspective:900px]"
              style={{
                WebkitMaskImage:
                  "linear-gradient(transparent, #000 28%, #000 72%, transparent)",
                maskImage:
                  "linear-gradient(transparent, #000 28%, #000 72%, transparent)",
              }}
            >
              <div
                key={tick}
                className="faq-band absolute inset-x-0 top-1/2 rounded-2xl border border-white/15 bg-white/[0.04]"
                style={{
                  height: ROW,
                  marginTop: -ROW / 2,
                }}
              />

              {ITEMS.map((item, i) => (
                <button
                  key={item.q}
                  ref={(node) => {
                    itemRefs.current[i] = node
                  }}
                  type="button"
                  aria-current={i === active ? "true" : undefined}
                  onClick={() => goTo(i)}
                  className="absolute inset-x-0 top-1/2 flex items-center px-5 text-left text-[clamp(19px,2.4vw,28px)] font-bold leading-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#43B5FF]"
                  style={{
                    height: ROW,
                    marginTop: -ROW / 2,
                    fontFamily: "Amaranth, sans-serif",
                    transform: `translate3d(0, ${i * ROW}px, 0)`,
                  }}
                >
                  {item.q}
                </button>
              ))}
            </div>
          </div>

          {/* Answer card */}
          <div
            aria-live="polite"
            className="rounded-[28px] border border-white/15 bg-white/[0.07] p-7 shadow-[0_30px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl md:min-h-[260px]"
          >
            <div key={active} className="faq-answer">
              <p className="text-sm text-white/50">
                {`0${active + 1} / 0${ITEMS.length}`}
              </p>

              <p className="mt-4 text-[19px] leading-relaxed text-white/90">
                {ITEMS[active]?.a}
              </p>
            </div>
          </div>
        </div>

        <p
          className={`absolute bottom-8 left-1/2 -translate-x-1/2 text-xs text-white/50 transition-opacity duration-300 ${
            active > 0 ? "opacity-0" : "opacity-100"
          }`}
        >
          Keep scrolling
        </p>
      </div>
    </section>
  )
}