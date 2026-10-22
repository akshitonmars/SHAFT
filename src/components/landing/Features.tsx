import type { ReactNode } from "react"
import { LogoMark } from "./LogoShowcase"
import { useInView } from "./motion"

const dotted = {
  backgroundColor: "#0A1230",
  backgroundImage: "radial-gradient(rgba(255,255,255,0.09) 1px, transparent 1px)",
  backgroundSize: "14px 14px",
}

function Card({ title, body, className, children, i, live }: { title: string; body: string; className: string; children: ReactNode; i: number; live: boolean }) {
  return (
    <article className={`relative flex min-h-[370px] flex-col justify-end overflow-hidden rounded-[28px] border border-white/10 p-7 ${className} ${live ? "rv-card-on" : "rv-card-off"}`} style={{ ...dotted, animationDelay: `${i * 0.12}s` }}>
      <div className="absolute inset-x-0 top-0 h-[58%]">{children}</div>
      <div className="relative">
        <h3 className="text-[30px] font-bold leading-tight tracking-[-0.01em]" style={{ fontFamily: "Amaranth, sans-serif" }}>{title}</h3>
        <p className="mt-2 max-w-[30rem] text-[15px] leading-relaxed text-white/70">{body}</p>
      </div>
    </article>
  )
}

const SERVICES = [
  ["GitHub", "main · 3 commits today"],
  ["Vercel", "Production · Ready"],
  ["Database", "Healthy · 12ms"],
]
const LOG = ["Cloned repository", "Installed dependencies", "Build completed in 14s", "Deployed to production"]

export default function Features() {
  const [ref, live] = useInView<HTMLDivElement>(0.15)
  return (
    <div ref={ref} className="mt-16 grid gap-4 md:grid-cols-12">
      <Card i={0} live={live} className="md:col-span-7" title="One dashboard per project" body="See code, frontend, backend, database and hosting status for each project together, instead of across six tabs.">
        <div className="absolute right-7 top-7 w-[min(78%,420px)] rounded-2xl border border-white/10 bg-white/[0.06] p-3">
          {SERVICES.map(([name, state]) => (
            <div key={name} className="flex items-center justify-between rounded-lg px-3 py-2 text-[13px]">
              <span className="flex items-center gap-2.5 font-medium text-white">
                <span className="h-2 w-2 rounded-full bg-[#3DDC97] shadow-[0_0_10px_#3DDC97]" />
                {name}
              </span>
              <span className="text-white/50">{state}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card i={1} live={live} className="md:col-span-5" title="Real GitHub and Vercel" body="Connect your repos and deployments and watch commits, builds and releases update live.">
        <div className="absolute left-7 right-0 top-7 rounded-l-2xl border border-r-0 border-white/10 bg-black/40 p-4 font-mono text-[12px] leading-[1.9] text-white/60">
          {LOG.map((line, i) => (
            <div key={line}>
              <span className={i === LOG.length - 1 ? "text-[#43B5FF]" : "text-[#3DDC97]"}>{i === LOG.length - 1 ? "●" : "✓"}</span> {line}
            </div>
          ))}
        </div>
      </Card>

      <Card i={2} live={live} className="md:col-span-5" title="An AI command center" body="Ask across the whole project. Shaft keeps the context and hands work between models so nothing gets lost.">
        <div className="absolute left-1/2 top-9 -translate-x-1/2">
          <div aria-hidden="true" className="absolute inset-0 rounded-full bg-[#43B5FF] opacity-50 blur-2xl" />
          <div className="relative grid h-24 w-24 place-items-center rounded-full border border-white/15 bg-gradient-to-b from-white/15 to-white/[0.03]">
            <LogoMark className="h-11 w-auto" />
          </div>
        </div>
      </Card>

      <Card i={3} live={live} className="md:col-span-7" title="Catch problems early" body="Project intelligence spots errors, broken dependencies and mismatches across services before they reach production.">
        <div aria-hidden="true" className="absolute inset-x-0 top-12 h-px bg-[#7C6BFF]/50" />
        <div aria-hidden="true" className="absolute inset-x-0 top-[104px] h-px bg-[#7C6BFF]/50" />
        <div className="absolute left-8 right-8 top-[34px] flex h-[88px] items-center justify-between rounded-full border border-white/15 bg-white/[0.06] pl-7 pr-4">
          <span className="text-[17px] text-white/80">Why did the last deploy fail?</span>
          <span className="grid h-11 w-11 place-items-center rounded-full bg-white/15 text-lg">↵</span>
        </div>
      </Card>
    </div>
  )
}
