"use client"

import { useEffect, useState } from "react"
import type { CSSProperties, MouseEvent } from "react"

type NavbarProps = {
  onExploreClick?: () => void
  onPrivacyClick?: () => void
}

const NAV_LINKS = [
  { label: "Product", href: "#product" },
  { label: "Solutions", href: "#solutions" },
  { label: "Resources", href: "#resources" },
  { label: "Explore", href: "#explore", explore: true },
] as const

/* Animations: centre-out reveal, logo blur-in, logo hover refocus */
const NAV_STYLES = `
@keyframes shaftReveal {
  from { clip-path: inset(-40px 50% -40px 50%); filter: blur(14px); opacity: 0; }
  to   { clip-path: inset(-40px -40px -40px -40px); filter: none; opacity: 1; }
}
@keyframes shaftBlurIn {
  from { filter: blur(10px); opacity: 0; transform: scale(0.92); }
  to   { filter: none; opacity: 1; transform: none; }
}
@keyframes shaftRefocus {
  0%   { filter: blur(0); }
  35%  { filter: blur(5px); }
  100% { filter: blur(0); }
}
.shaft-reveal { animation: shaftReveal 1.1s cubic-bezier(0.22, 1, 0.36, 1) backwards; }
.shaft-logo-blur { display: inline-flex; animation: shaftBlurIn 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.45s backwards; }
.shaft-word-blur { display: inline-flex; animation: shaftBlurIn 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.6s backwards; }
.shaft-logo:hover .shaft-logo-hover { animation: shaftRefocus 0.8s ease; }
@media (prefers-reduced-motion: reduce) {
  .shaft-reveal, .shaft-logo-blur, .shaft-word-blur, .shaft-logo:hover .shaft-logo-hover { animation: none; }
}
`

/* Subtle white edge light on opposite corners (top-left + bottom-right) */
const SHINE_STYLE: CSSProperties = {
  borderRadius: "inherit",
  padding: "1.5px",
  background:
    "linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0.6) 12%, rgba(255,255,255,0) 32%, rgba(255,255,255,0) 68%, rgba(255,255,255,0.6) 88%, rgba(255,255,255,1) 100%)",
  WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
  WebkitMaskComposite: "xor",
  mask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
  maskComposite: "exclude",
}

function Shine({ visible }: { visible: boolean }) {
  return (
    <span
      aria-hidden="true"
      style={SHINE_STYLE}
      className={`pointer-events-none absolute inset-0 transition-opacity duration-500 ${visible ? "opacity-100" : "opacity-0"}`}
    />
  )
}

export default function Navbar({ onExploreClick, onPrivacyClick }: NavbarProps) {
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
        setScrolled(window.scrollY > 24)
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
    explore?: boolean
  ) => {
    closeMenu()
    if (explore && onExploreClick) {
      event.preventDefault()
      onExploreClick()
    }
  }

  /* Separate floating pills at the top; they melt into the shell on scroll */
  const pillBase =
    "relative flex h-12 items-center rounded-full border transition-[background-color,border-color,box-shadow,backdrop-filter] duration-500"
  const pillState = scrolled
    ? "border-transparent bg-transparent shadow-none"
    : "border-black/[0.08] bg-white/75 shadow-[0_6px_24px_rgba(15,23,42,0.06)] backdrop-blur-xl"

  return (
    <>
      <style>{NAV_STYLES}</style>

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

      <header className="pointer-events-none fixed inset-x-0 top-3 z-50 flex justify-center px-3">
        <div
          style={{ borderRadius: scrolled ? 22 : 36, maxWidth: scrolled ? 1040 : 1180 }}
          className={[
            "shaft-reveal pointer-events-auto relative w-full border p-2",
            "flex items-center justify-between lg:grid lg:grid-cols-[1fr_auto_1fr]",
            "transition-[background-color,border-color,box-shadow,max-width,border-radius] duration-500 ease-out",
            scrolled
              ? "border-black/[0.09] bg-white/90 shadow-[0_12px_40px_rgba(15,23,42,0.1)] backdrop-blur-2xl"
              : "border-transparent bg-transparent shadow-none",
          ].join(" ")}
        >
          {/* Shell shine appears once the pills have merged */}
          <Shine visible={scrolled} />

          {/* Left pill: logo */}
          <div className={`${pillBase} ${pillState} justify-self-start px-4`}>
            <Shine visible={!scrolled} />
            <a
              href="/"
              onClick={closeMenu}
              aria-label="Shaft home"
              className="shaft-logo group flex shrink-0 items-center gap-2.5 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-[#43B5FF]"
            >
              <span className="shaft-logo-blur">
                <img
                  src="/logo.png"
                  alt=""
                  width={34}
                  height={34}
                  className="shaft-logo-hover h-[30px] w-[30px] object-contain transition-transform duration-300 group-hover:scale-105"
                />
              </span>
              <span className="shaft-word-blur">
                <span
                  className="text-[24px] font-bold leading-none tracking-[-0.02em] text-[#101319]"
                  style={{ fontFamily: "Amaranth, sans-serif" }}
                >
                  Shaft
                </span>
              </span>
            </a>
          </div>

          {/* Centre pill: links */}
          <nav
            aria-label="Main navigation"
            className={`${pillBase} ${pillState} hidden gap-1 px-1.5 lg:flex`}
          >
            <Shine visible={!scrolled} />
            {NAV_LINKS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={(event) => handleNavClick(event, "explore" in item && item.explore)}
                className="group relative rounded-full px-4 py-2 text-[13px] font-medium text-slate-600 outline-none transition-colors duration-200 hover:text-[#101319] focus-visible:ring-2 focus-visible:ring-[#43B5FF]"
              >
                <span className="relative z-10">{item.label}</span>
                <span aria-hidden="true" className="absolute inset-0 rounded-full bg-slate-900/[0.06] opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100" />
              </a>
            ))}
          </nav>

          {/* Right pill: actions */}
          <div className={`${pillBase} ${pillState} justify-self-end gap-2 px-2 sm:gap-3 sm:pl-4`}>
            <Shine visible={!scrolled} />
            <a href="/signin" className="hidden rounded-lg px-2 py-2 text-[13px] font-medium text-slate-600 transition-colors hover:text-[#101319] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#43B5FF] sm:inline-flex">
              Sign in
            </a>
            <a href="/get-started" className="group relative inline-flex h-9 items-center justify-center gap-2 overflow-hidden rounded-full bg-[#101319] px-3.5 text-[12px] font-semibold text-white shadow-sm transition-[transform,box-shadow,background-color] duration-200 hover:-translate-y-px hover:bg-[#202630] hover:shadow-[0_6px_18px_rgba(16,19,25,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#43B5FF] focus-visible:ring-offset-2 sm:px-4 sm:text-[13px]">
              <span>Start building</span>
              <span aria-hidden="true" className="inline-block transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">↗</span>
            </a>

            <button
              type="button"
              onClick={() => setMobileOpen((open) => !open)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              aria-controls="shaft-mobile-menu"
              className="grid h-9 w-9 place-items-center rounded-full border border-black/[0.07] bg-white/70 transition-colors hover:bg-black/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#43B5FF] lg:hidden"
            >
              <span className="flex w-[17px] flex-col items-center gap-[5px]">
                <span className={`h-[1.5px] w-full rounded-full bg-[#101319] transition-transform duration-200 ${mobileOpen ? "translate-y-[3.25px] rotate-45" : ""}`} />
                <span className={`h-[1.5px] w-full rounded-full bg-[#101319] transition-all duration-200 ${mobileOpen ? "scale-x-0 opacity-0" : ""}`} />
                <span className={`h-[1.5px] w-full rounded-full bg-[#101319] transition-transform duration-200 ${mobileOpen ? "-translate-y-[9.75px] -rotate-45" : ""}`} />
              </span>
            </button>
          </div>

          {/* Mobile menu */}
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
                  onClick={(event) => handleNavClick(event, "explore" in item && item.explore)}
                  className="flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-950/[0.04] hover:text-[#101319] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#43B5FF]"
                >
                  {item.label}
                  <span aria-hidden="true" className="text-slate-400">0{index + 1}</span>
                </a>
              ))}
              <div className="my-2 h-px bg-black/[0.07]" />
              <a
                href="/privacy"
                tabIndex={mobileOpen ? 0 : -1}
                onClick={(e) => {
                  closeMenu()
                  if (onPrivacyClick) {
                    e.preventDefault()
                    onPrivacyClick()
                  }
                }}
                className="rounded-xl px-4 py-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-950/[0.04] hover:text-[#101319] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#43B5FF]"
              >
                Privacy Policy
              </a>
              <a href="/signin" tabIndex={mobileOpen ? 0 : -1} onClick={closeMenu} className="rounded-xl px-4 py-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-950/[0.04] hover:text-[#101319] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#43B5FF] sm:hidden">
                Sign in
              </a>
              <a href="/get-started" tabIndex={mobileOpen ? 0 : -1} onClick={closeMenu} className="mt-1 flex h-11 items-center justify-center gap-2 rounded-xl bg-[#101319] text-sm font-semibold text-white transition-colors hover:bg-[#202630] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#43B5FF] focus-visible:ring-offset-2">
                Start building <span aria-hidden="true">↗</span>
              </a>
            </nav>
          </div>
        </div>
      </header>
    </>
  )
}
