import { useState } from "react"

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

export default function Faq() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section id="faq" className="bg-[#07123A] px-6 py-24 text-white sm:px-10">
      <div className="mx-auto grid max-w-[1100px] gap-12 md:grid-cols-[0.8fr_1.2fr]">
        <h2 className="text-[clamp(34px,5vw,56px)] font-bold leading-[1.05] tracking-[-0.03em]" style={{ fontFamily: "Amaranth, sans-serif" }}>
          Questions, answered.
        </h2>
        <ul className="divide-y divide-white/10 border-y border-white/10">
          {ITEMS.map((item, i) => {
            const isOpen = open === i
            return (
              <li key={item.q}>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={`faq-${i}`}
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-6 py-6 text-left text-[18px] font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#43B5FF]"
                >
                  {item.q}
                  <span aria-hidden="true" className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/15 text-lg leading-none transition-transform duration-300 ${isOpen ? "rotate-45" : ""}`}>
                    +
                  </span>
                </button>
                <div id={`faq-${i}`} className={`grid transition-[grid-template-rows] duration-300 ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                  <div className="overflow-hidden">
                    <p className="pb-6 pr-12 text-[16px] leading-relaxed text-white/60">{item.a}</p>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
