import Navbar from "../components/layout/Navbar"
import DotField from "../components/landing/DotField"
import Planet from "../components/landing/Planet"

const PAGE_CSS = `
@import url("https://fonts.googleapis.com/css2?family=Amaranth:wght@400;700&family=Inter:wght@400;500;600&display=swap");
@keyframes shaftSpin { to { background-position-x: calc(var(--d) * -2); } }
@keyframes shaftRise {
  from { opacity: 0; filter: blur(8px); transform: translateY(14px); }
  to   { opacity: 1; filter: none; transform: none; }
}
.shaft-spin { animation: shaftSpin 160s linear infinite; }
.shaft-rise { animation: shaftRise 0.9s cubic-bezier(0.22, 1, 0.36, 1) backwards; }
@media (prefers-reduced-motion: reduce) { .shaft-spin, .shaft-rise { animation: none; } }
`

const FEATURES = [
  {
    title: "Every service, one dashboard",
    body: "Connect GitHub and Vercel and see code, deployments and errors for a project in a single view.",
  },
  {
    title: "AI that knows the project",
    body: "Ask questions, run diagnostics and hand work between models without re-explaining your context.",
  },
  {
    title: "Nothing slips by",
    body: "Live monitoring flags broken builds, drifting dependencies and failing services as they happen.",
  },
]

const display = { fontFamily: "Amaranth, sans-serif" }

export function Home() {
  const scrollToProduct = () =>
    document.getElementById("product")?.scrollIntoView({ behavior: "smooth" })

  return (
    <main className="bg-[#F5F7FB] text-[#101319]" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
      <style>{PAGE_CSS}</style>
      <Navbar onExploreClick={scrollToProduct} />

      <section className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-6 pb-28 pt-32 text-center">
        <DotField />
        <Planet />

        <div className="relative z-10 flex max-w-[860px] flex-col items-center">
          <h1
            className="shaft-rise font-bold leading-[0.98] tracking-[-0.03em]"
            style={{ ...display, fontSize: "clamp(46px, 8.4vw, 104px)", animationDelay: "300ms" }}
          >
            Build beyond ideas.
          </h1>
          <p
            className="shaft-rise mt-6 max-w-[40rem] text-[17px] leading-[1.6] text-slate-600 sm:text-[19px]"
            style={{ animationDelay: "440ms" }}
          >
            Shaft brings your code, hosting, deployments and AI tools into one place, so you can keep shipping instead of switching tabs.
          </p>
          <a
            href="/get-started"
            className="shaft-rise group mt-10 inline-flex h-12 items-center gap-3 rounded-full bg-[#101319] pl-6 pr-2 text-[15px] font-semibold text-white shadow-[0_10px_30px_rgba(16,19,25,0.22)] transition-[transform,background-color] duration-200 hover:-translate-y-0.5 hover:bg-[#1b2230] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#43B5FF] focus-visible:ring-offset-2"
            style={{ animationDelay: "580ms" }}
          >
            Start building
            <span aria-hidden="true" className="grid h-8 w-8 place-items-center rounded-full bg-white/15 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
              ↗
            </span>
          </a>
        </div>

        <nav aria-label="Legal" className="absolute bottom-16 left-6 z-10 flex gap-5 text-xs text-slate-500 sm:left-10">
          <a href="/terms" className="transition-colors hover:text-[#101319]">Terms</a>
          <a href="/privacy" className="transition-colors hover:text-[#101319]">Privacy</a>
        </nav>
      </section>

      <section
        id="product"
        className="relative z-10 -mt-12 overflow-hidden rounded-t-[48px] px-6 pb-20 pt-28 text-white sm:px-10"
        style={{ background: "linear-gradient(180deg, #050B1F 0%, #07123A 55%, #0B2A8F 100%)" }}
      >
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute -left-40 top-10 h-[480px] w-[480px] rounded-full bg-[#1E5BFF] opacity-50 blur-[120px]" />
          <div className="absolute left-1/2 top-1/3 h-[360px] w-[360px] -translate-x-1/2 rounded-full bg-[#2B3FD6] opacity-40 blur-[110px]" />
          <div className="absolute -right-32 bottom-0 h-[520px] w-[520px] rounded-full bg-[#43B5FF] opacity-30 blur-[140px]" />
        </div>

        <div className="relative mx-auto max-w-[1100px]">
          <h2 className="max-w-[14ch] text-[clamp(36px,6vw,68px)] font-bold leading-[1.02] tracking-[-0.03em]" style={display}>
            Your whole project, one view.
          </h2>
          <ul className="mt-16 divide-y divide-white/10 border-y border-white/10">
            {FEATURES.map((item) => (
              <li key={item.title} className="grid gap-3 py-8 md:grid-cols-[1fr_1.2fr] md:gap-12">
                <h3 className="text-2xl font-bold tracking-[-0.01em]" style={display}>{item.title}</h3>
                <p className="text-[16px] leading-relaxed text-white/60">{item.body}</p>
              </li>
            ))}
          </ul>
          <p className="mt-14 text-xs text-white/40">© 2026 Shaft</p>
        </div>
      </section>
    </main>
  )
}

export default Home
