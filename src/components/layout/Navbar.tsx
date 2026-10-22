"use client"

import { useEffect, useState } from "react"
import type { MouseEvent } from "react"

type NavbarProps = {
  onExploreClick?: () => void
}

const NAV_LINKS = [
  { label: "Product", href: "#product" },
  { label: "Solutions", href: "#solutions" },
  { label: "Resources", href: "#resources" },
  { label: "Explore", href: "#explore", explore: true },
] as const

export default function Navbar({ onExploreClick }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    let ticking = false

    const updateScroll = () => {
      if (ticking) return
      ticking = true
      window.requestAnimationFrame(() => {
        const scrollable = document.documentElement.scrollHeight - window.innerHeight
        setScrolled(window.scrollY > 12)
        setScrollProgress(scrollable > 0 ? Math.min(window.scrollY / scrollable, 1) : 0)
        ticking = false
      })
    }

    updateScroll()
    window.addEventListener("scroll", updateScroll, { passive: true })
    window.addEventListener("resize", updateScroll)
    return () => {
      window.removeEventListener("scroll", updateScroll)
      window.removeEventListener("resize", updateScroll)
    }
  }, [])

  useEffect(() => {
    if (!mobileOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false)
    }
    const handleResize = () => {
      if (window.innerWidth >= 1024) setMobileOpen(false)
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("resize", handleResize)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("resize", handleResize)
    }
  }, [mobileOpen])

  const closeMenu = () => setMobileOpen(false)

  const handleNavClick = (
    event: MouseEvent<HTMLAnchorElement>,
    href: string,
    explore?: boolean
  ) => {
    closeMenu()
    if (explore && onExploreClick) {
      event.preventDefault()
      onExploreClick()
    }
  }

  return (
    <>
      <div
        aria-hidden="true"
        className="fixed inset-x-0 top-0 z-[100] h-[2px] origin-left bg-gradient-to-r from-[#43B5FF] via-[#648EFF] to-[#9A8CFF]"
        style={{ transform: `scaleX(${scrollProgress})` }}
      />

      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={closeMenu}
          className="fixed inset-0 z-40 cursor-default bg-slate-950/15 backdrop-blur-[2px] lg:hidden"
        />
      )}

      <header
        className={[
          "fixed left-1/2 top-3 z-50 w-[calc(100%-24px)] max-w-[1180px]",
          "-translate-x-1/2 rounded-[22px] border",
          "transition-[background-color,border-color,box-shadow] duration-300",
          scrolled
            ? "border-black/[0.08] bg-white/90 shadow-[0_12px_40px_rgba(15,23,42,0.09)] backdrop-blur-2xl"
            : "border-black/[0.06] bg-white/70 shadow-[0_4px_20px_rgba(15,23,42,0.035)] backdrop-blur-xl",
        ].join(" ")}
      >
        <div className="flex h-[64px] items-center justify-between px-3 sm:px-5 lg:px-6">
          <a
            href="/"
            onClick={closeMenu}
            aria-label="SHAFT home"
            className="group flex shrink-0 items-center gap-2.5 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-[#43B5FF]"
          >
            <img
              src="/logo.png"
              alt=""
              width={34}
              height={34}
              className="h-[30px] w-[30px] object-contain transition-transform duration-300 group-hover:scale-105"
            />
            <span
              className="text-[24px] font-bold leading-none tracking-[-0.055em] text-[#101319]"
              style={{ fontFamily: "Amaranth, sans-serif" }}
            >
              SHAFT
            </span>
            <span aria-hidden="true" className="ml-[-4px] mt-[-14px] h-[5px] w-[5px] rounded-full bg-[#43B5FF] shadow-[0_0_10px_rgba(67,181,255,0.4)]" />
          </a>

          <nav aria-label="Main navigation" className="hidden items-center gap-1 rounded-full border border-black/[0.045] bg-black/[0.025] p-1 lg:flex">
            {NAV_LINKS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={(event) => handleNavClick(event, item.href, "explore" in item && item.explore)}
                className="group relative rounded-full px-4 py-2 text-[13px] font-medium text-slate-600 outline-none transition-colors duration-200 hover:text-[#101319] focus-visible:ring-2 focus-visible:ring-[#43B5FF]"
              >
                <span className="relative z-10">{item.label}</span>
                <span aria-hidden="true" className="absolute inset-0 rounded-full bg-white opacity-0 shadow-[0_1px_4px_rgba(15,23,42,0.08)] transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100" />
              </a>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-2 sm:gap-4">
            <a href="/signin" className="hidden rounded-lg px-2 py-2 text-[13px] font-medium text-slate-600 transition-colors hover:text-[#101319] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#43B5FF] sm:inline-flex">
              Sign in
            </a>
            <a href="/get-started" className="group relative inline-flex h-10 items-center justify-center gap-2 overflow-hidden rounded-full bg-[#101319] px-3.5 text-[12px] font-semibold text-white shadow-sm transition-[transform,box-shadow,background-color] duration-200 hover:-translate-y-px hover:bg-[#202630] hover:shadow-[0_6px_18px_rgba(16,19,25,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#43B5FF] focus-visible:ring-offset-2 sm:px-4 sm:text-[13px]">
              <span>Start building</span>
              <span aria-hidden="true" className="inline-block transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">↗</span>
            </a>

            <button
              type="button"
              onClick={() => setMobileOpen((open) => !open)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              aria-controls="shaft-mobile-menu"
              className="grid h-10 w-10 place-items-center rounded-full border border-black/[0.07] bg-white/70 transition-colors hover:bg-black/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#43B5FF] lg:hidden"
            >
              <span className="flex w-[17px] flex-col items-center gap-[5px]">
                <span className={`h-[1.5px] w-full rounded-full bg-[#101319] transition-transform duration-200 ${mobileOpen ? "translate-y-[3.25px] rotate-45" : ""}`} />
                <span className={`h-[1.5px] w-full rounded-full bg-[#101319] transition-all duration-200 ${mobileOpen ? "scale-x-0 opacity-0" : ""}`} />
                <span className={`h-[1.5px] w-full rounded-full bg-[#101319] transition-transform duration-200 ${mobileOpen ? "-translate-y-[9.75px] -rotate-45" : ""}`} />
              </span>
            </button>
          </div>
        </div>

        <div
          id="shaft-mobile-menu"
          aria-hidden={!mobileOpen}
          className={`absolute left-0 right-0 top-[calc(100%+9px)] rounded-[22px] border border-black/[0.07] bg-white/95 p-3 shadow-[0_20px_60px_rgba(15,23,42,0.12)] backdrop-blur-2xl transition-[opacity,transform,visibility] duration-200 lg:hidden ${mobileOpen ? "visible translate-y-0 opacity-100" : "invisible -translate-y-2 opacity-0"}`}
        >
          <nav aria-label="Mobile navigation" className="flex flex-col gap-1">
            {NAV_LINKS.map((item, index) => (
              <a
                key={item.href}
                href={item.href}
                tabIndex={mobileOpen ? 0 : -1}
                onClick={(event) => handleNavClick(event, item.href, "explore" in item && item.explore)}
                className="flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-950/[0.04] hover:text-[#101319] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#43B5FF]"
              >
                {item.label}
                <span aria-hidden="true" className="text-slate-400">0{index + 1}</span>
              </a>
            ))}
            <div className="my-2 h-px bg-black/[0.07]" />
            <a href="/signin" tabIndex={mobileOpen ? 0 : -1} onClick={closeMenu} className="rounded-xl px-4 py-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-950/[0.04] hover:text-[#101319] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#43B5FF] sm:hidden">
              Sign in
            </a>
            <a href="/get-started" tabIndex={mobileOpen ? 0 : -1} onClick={closeMenu} className="mt-1 flex h-11 items-center justify-center gap-2 rounded-xl bg-[#101319] text-sm font-semibold text-white transition-colors hover:bg-[#202630] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#43B5FF] focus-visible:ring-offset-2">
              Start building <span aria-hidden="true">↗</span>
            </a>
          </nav>
        </div>
      </header>
    </>
  )
}
