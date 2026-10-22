
"use client"
import { useEffect, useState } from "react"
import Link from "next/link"

// Add in layout: <link href="https://fonts.googleapis.com/css2?family=Amaranth:wght@400;700&display=swap" rel="stylesheet">

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [hovered, setHovered] = useState(0)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const links = ["Product", "Solutions", "Resources", "Pricing"]

  return (
    <>
      {/* scroll progress */}
      <div className="fixed top-0 left-0 h-[2px] w-full z-[100] origin-left"
        style={{
          background: `linear-gradient(90deg, #3CAEFF, #7BA5FF)`,
          transform: `scaleX(${scrolled ? 1 : 0})`,
          transition: 'transform 0.2s'
        }} 
      />

      <header className={`fixed left-1/2 -translate-x-1/2 z-50 w-[calc(100%-32px)] transition-all duration-500
        ${scrolled 
          ? "top-4 max-w-[1120px] rounded-full bg-[rgba(255,255,255,0.72)] backdrop-blur-[24px] backdrop-saturate-[1.8] border border-black/[0.06] shadow-[0_8px_32px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] py-3 px-6"
          : "top-0 max-w-[1280px] rounded-none bg-transparent border-transparent py-6 px-8"
        }`}
        style={{ fontFamily: 'Amaranth, sans-serif' }}
      >
        {/* inner top highlight */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-white/0 via-white/80 to-white/0 pointer-events-none" />

        <div className="flex items-center justify-between">
          {/* Logo + Wordmark */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative transition-all duration-300 group-hover:scale-[1.03] group-hover:drop-shadow-[0_0_12px_rgba(60,174,255,0.3)]">
              <img src="/logo.png" alt="Shaft" className="h-7 w-auto" />
            </div>
            <span className="text-[22px] font-bold tracking-[-0.02em] text-[#0A0A0B] group-hover:tracking-[-0.01em] transition-all">Shaft</span>
          </Link>

          {/* Center nav with sliding pill */}
          <nav className="hidden lg:flex items-center relative bg-black/[0.03] rounded-full p-1">
            <div className="absolute h-7 bg-white rounded-full shadow-sm transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
              style={{ left: `${hovered * 96 + 4}px`, width: '88px' }} />
            {links.map((l, i) => (
              <button key={l} onMouseEnter={() => setHovered(i)}
                className="relative z-10 w-24 h-7 text-[14px] font-medium text-black/60 hover:text-black transition-colors">
                {l}
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-[1.5px] bg-gradient-to-r from-[#3CAEFF] to-[#7BA5FF] scale-x-0 group-hover:scale-x-100" />
              </button>
            ))}
          </nav>

          {/* Right */}
          <div className="flex items-center gap-3">
            <Link href="/signin" className="hidden md:block text-sm font-medium text-black/60 hover:text-black transition">Sign in</Link>
            <Link href="/get-started" 
              className="relative overflow-hidden rounded-full bg-[#0A0A0B] text-white px-5 py-2.5 text-sm font-bold
              hover:-translate-y-px hover:shadow-[0_8px_24px_rgba(0,0,0,0.16)] transition-all duration-300
              before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:-translate-x-full hover:before:translate-x-full before:transition-transform before:duration-700">
              Start building
            </Link>
            {/* mobile toggle */}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden w-9 h-9 grid place-items-center">
              <div className={`w-5 h-0.5 bg-black transition-all ${mobileOpen ? 'rotate-45 translate-y-0' : '-translate-y-1.5'}`} />
              <div className={`w-5 h-0.5 bg-black transition-all ${mobileOpen ? 'opacity-0' : 'opacity-100'}`} />
              <div className={`w-5 h-0.5 bg-black transition-all ${mobileOpen ? '-rotate-45 -translate-y-0' : 'translate-y-1.5'}`} />
            </button>
          </div>
        </div>
      </header>
    </>
  )
}