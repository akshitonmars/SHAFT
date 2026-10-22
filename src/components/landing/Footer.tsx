import { useInView } from "./motion"

export default function Footer() {
  const [ref, on] = useInView<HTMLElement>(0.3)
  return (
    <footer ref={ref} className="bg-[#0A1F6B] px-6 pb-10 text-sm text-white/50 sm:px-10">
      <div className={`h-px origin-left bg-gradient-to-r from-[#43B5FF]/0 via-[#43B5FF] to-[#9A8CFF]/0 transition-transform duration-[1600ms] ease-out ${on ? "scale-x-100" : "scale-x-0"}`} />
      <div className={`flex flex-col gap-4 pt-8 transition-[opacity,transform] delay-500 duration-1000 sm:flex-row sm:items-center sm:justify-between ${on ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"}`}>
        <span className="text-lg font-bold text-white" style={{ fontFamily: "Amaranth, sans-serif" }}>Shaft</span>
        <nav aria-label="Footer" className="flex gap-6">
          <a href="#product" className="transition-colors hover:text-white">Product</a>
          <a href="/terms" className="transition-colors hover:text-white">Terms</a>
          <a href="/privacy" className="transition-colors hover:text-white">Privacy</a>
        </nav>
        <span>© 2026 Shaft</span>
      </div>
    </footer>
  )
}
