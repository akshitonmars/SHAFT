"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties, MouseEvent as ReactMouseEvent } from "react";

export type NavLink = { label: string; href: string };

export type NavbarProps = {
  links?: NavLink[];
  cta?: NavLink;
  brand?: string;
  logoSrc?: string;
};

const DEFAULT_LINKS: NavLink[] = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Integrations", href: "#integrations" },
  { label: "FAQ", href: "#faq" },
];

const DEFAULT_CTA: NavLink = { label: "Get started", href: "#get-started" };

const CSS = `
@import url("https://fonts.googleapis.com/css2?family=Amaranth:wght@400;700&display=swap");

/* Smooth anchor scrolling + room for the floating bar */
@media (prefers-reduced-motion: no-preference) {
  html { scroll-behavior: smooth; }
}
:where(section[id]) { scroll-margin-top: 96px; }

.sx-nav {
  --sx-ink: #22304a;
  --sx-muted: #5b6a82;
  --sx-accent: #0a76e0;
  --sx-accent-bright: #0a8cff;
  --sx-ease: cubic-bezier(0.22, 1, 0.36, 1);
  --sx-spring: cubic-bezier(0.34, 1.3, 0.64, 1);

  position: fixed;
  inset: 0 0 auto 0;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: calc(14px + env(safe-area-inset-top, 0px));
  font-family: "Amaranth", system-ui, -apple-system, "Segoe UI", sans-serif;
  color: var(--sx-ink);
  pointer-events: none;
  transition: padding-top 0.5s var(--sx-ease);
}
.sx-nav > * { pointer-events: auto; }
.sx-nav[data-scrolled="true"] { padding-top: calc(10px + env(safe-area-inset-top, 0px)); }

/* ---------- Bar ---------- */
.sx-nav__bar {
  position: relative;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  width: calc(100% - 28px);
  max-width: 980px;
  padding: 9px 10px 9px 20px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.85);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.62);
  -webkit-backdrop-filter: blur(20px) saturate(1.7);
  backdrop-filter: blur(20px) saturate(1.7);
  box-shadow:
    0 0 0 1px rgba(28, 52, 92, 0.05),
    0 10px 30px -14px rgba(28, 70, 140, 0.22),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
  transition:
    max-width 0.6s var(--sx-ease),
    padding 0.5s var(--sx-ease),
    background-color 0.4s ease,
    box-shadow 0.4s ease;
  /* Played once on load. No fill-mode "forwards" on purpose: a lingering
     filter would stop backdrop-filter from working. */
  animation: sx-nav-in 0.9s var(--sx-ease) 0.1s backwards;
}
.sx-nav[data-scrolled="true"] .sx-nav__bar {
  max-width: 860px;
  padding: 6px 8px 6px 18px;
  background: rgba(255, 255, 255, 0.8);
  box-shadow:
    0 0 0 1px rgba(28, 52, 92, 0.07),
    0 16px 40px -16px rgba(28, 70, 140, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.95);
}

@keyframes sx-nav-in {
  from {
    opacity: 0;
    transform: translateY(-16px) scale(0.98);
    filter: blur(10px);
  }
}

/* ---------- Brand ---------- */
.sx-nav__brand {
  justify-self: start;
  display: inline-flex;
  align-items: center;
  border-radius: 12px;
}
.sx-nav__logo {
  display: block;
  height: 28px;
  width: auto;
  transition: height 0.5s var(--sx-ease);
}
.sx-nav[data-scrolled="true"] .sx-nav__logo { height: 24px; }

/* ---------- Links + sliding pill ---------- */
.sx-nav__links { position: relative; }
.sx-nav__links ul {
  display: flex;
  gap: 2px;
  margin: 0;
  padding: 0;
  list-style: none;
}
.sx-nav__link {
  position: relative;
  z-index: 1;
  display: block;
  padding: 9px 16px;
  border-radius: 999px;
  font-size: 15px;
  letter-spacing: 0.01em;
  color: var(--sx-muted);
  text-decoration: none;
  white-space: nowrap;
  transition: color 0.25s ease;
}
.sx-nav__link:hover,
.sx-nav__link:focus-visible { color: var(--sx-ink); }
.sx-nav__link[aria-current="true"] { color: var(--sx-accent); }

.sx-nav__pill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: var(--w, 0px);
  transform: translateX(var(--x, 0px));
  border-radius: 999px;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.25s ease, background-color 0.3s ease, box-shadow 0.3s ease;
}
.sx-nav__pill[data-show="true"] {
  opacity: 1;
  transition:
    transform 0.5s var(--sx-spring),
    width 0.5s var(--sx-spring),
    opacity 0.25s ease,
    background-color 0.3s ease,
    box-shadow 0.3s ease;
}
.sx-nav__pill[data-state="hover"] {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(238, 246, 255, 0.92));
  box-shadow:
    0 1px 2px rgba(30, 60, 110, 0.08),
    0 8px 18px -10px rgba(10, 140, 255, 0.4),
    inset 0 0 0 1px rgba(10, 140, 255, 0.1);
}
.sx-nav__pill[data-state="active"] {
  background: rgba(10, 140, 255, 0.09);
  box-shadow: inset 0 0 0 1px rgba(10, 140, 255, 0.14);
}

/* ---------- CTA ---------- */
.sx-nav__cta {
  position: relative;
  justify-self: end;
  overflow: hidden;
  padding: 10px 22px;
  border-radius: 999px;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.01em;
  color: #fff;
  text-decoration: none;
  white-space: nowrap;
  background: linear-gradient(180deg, #3aa0f8 0%, var(--sx-accent) 100%);
  box-shadow:
    0 8px 18px -8px rgba(10, 118, 224, 0.6),
    inset 0 1px 0 rgba(255, 255, 255, 0.4);
  transform: translate(var(--mx, 0px), var(--my, 0px));
  transition: transform 0.35s var(--sx-ease), box-shadow 0.3s ease;
}
.sx-nav__cta span { position: relative; z-index: 1; }
.sx-nav__cta::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(110deg, transparent 30%, rgba(255, 255, 255, 0.5) 50%, transparent 70%);
  transform: translateX(-120%);
  transition: transform 0.7s var(--sx-ease);
}
.sx-nav__cta:hover {
  box-shadow:
    0 12px 24px -8px rgba(10, 118, 224, 0.7),
    inset 0 1px 0 rgba(255, 255, 255, 0.5);
}
.sx-nav__cta:hover::after { transform: translateX(120%); }
.sx-nav__cta:active { transform: translate(var(--mx, 0px), var(--my, 0px)) scale(0.97); }

/* ---------- Scroll progress hairline ---------- */
.sx-nav__progress {
  position: absolute;
  left: 22px;
  right: 22px;
  bottom: 0;
  height: 2px;
  border-radius: 2px;
  background: linear-gradient(90deg, #a9d8ff, var(--sx-accent-bright));
  transform: scaleX(0);
  transform-origin: left center;
  opacity: 0.85;
  pointer-events: none;
}

/* ---------- Mobile toggle ---------- */
.sx-nav__toggle {
  display: none;
  width: 40px;
  height: 40px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: rgba(10, 140, 255, 0.08);
  cursor: pointer;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  transition: background-color 0.25s ease;
}
.sx-nav__toggle:hover { background: rgba(10, 140, 255, 0.14); }
.sx-nav__toggle span {
  display: block;
  height: 2px;
  border-radius: 2px;
  background: var(--sx-ink);
  transition: transform 0.4s var(--sx-ease), width 0.3s ease, opacity 0.2s ease;
}
.sx-nav__toggle span:nth-child(1) { width: 18px; }
.sx-nav__toggle span:nth-child(2) { width: 12px; }
.sx-nav__toggle span:nth-child(3) { width: 15px; }
.sx-nav[data-open="true"] .sx-nav__toggle span:nth-child(1) { width: 18px; transform: translateY(6px) rotate(45deg); }
.sx-nav[data-open="true"] .sx-nav__toggle span:nth-child(2) { opacity: 0; transform: scaleX(0); }
.sx-nav[data-open="true"] .sx-nav__toggle span:nth-child(3) { width: 18px; transform: translateY(-6px) rotate(-45deg); }

/* ---------- Mobile panel ---------- */
.sx-nav__panel {
  display: none;
  width: calc(100% - 28px);
  max-width: 980px;
  margin-top: 8px;
  padding: 10px;
  border: 1px solid rgba(255, 255, 255, 0.85);
  border-radius: 26px;
  background: rgba(255, 255, 255, 0.82);
  -webkit-backdrop-filter: blur(22px) saturate(1.7);
  backdrop-filter: blur(22px) saturate(1.7);
  box-shadow:
    0 0 0 1px rgba(28, 52, 92, 0.06),
    0 20px 40px -18px rgba(28, 70, 140, 0.3);
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px) scale(0.98);
  transform-origin: top center;
  filter: blur(8px);
  transition:
    opacity 0.35s ease,
    transform 0.45s var(--sx-ease),
    filter 0.35s ease,
    visibility 0s linear 0.45s;
}
.sx-nav[data-open="true"] .sx-nav__panel {
  opacity: 1;
  visibility: visible;
  transform: none;
  filter: none;
  transition-delay: 0s;
}
.sx-nav__panel ul { margin: 0; padding: 0; list-style: none; }
.sx-nav__panel li {
  opacity: 0;
  transform: translateY(6px);
  filter: blur(6px);
  transition: opacity 0.4s ease, transform 0.5s var(--sx-ease), filter 0.4s ease;
}
.sx-nav[data-open="true"] .sx-nav__panel li {
  opacity: 1;
  transform: none;
  filter: none;
  transition-delay: calc(var(--i, 0) * 50ms + 120ms);
}
.sx-nav__panel a {
  display: block;
  padding: 14px 16px;
  border-radius: 16px;
  font-size: 17px;
  color: var(--sx-ink);
  text-decoration: none;
  transition: background-color 0.25s ease, color 0.25s ease;
}
.sx-nav__panel a:hover { background: rgba(10, 140, 255, 0.08); }
.sx-nav__panel a[aria-current="true"] { color: var(--sx-accent); }
.sx-nav__panel .sx-nav__panel-cta {
  margin-top: 6px;
  text-align: center;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(180deg, #3aa0f8 0%, var(--sx-accent) 100%);
  box-shadow: 0 8px 18px -8px rgba(10, 118, 224, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.4);
}
.sx-nav__panel .sx-nav__panel-cta:hover { background: linear-gradient(180deg, #3aa0f8 0%, var(--sx-accent) 100%); }

/* ---------- Focus ---------- */
.sx-nav a:focus-visible,
.sx-nav button:focus-visible {
  outline: 2px solid var(--sx-accent-bright);
  outline-offset: 2px;
}

/* ---------- Responsive ---------- */
@media (max-width: 820px) {
  .sx-nav__bar { grid-template-columns: 1fr auto; padding: 7px 8px 7px 16px; }
  .sx-nav[data-scrolled="true"] .sx-nav__bar { padding: 6px 8px 6px 16px; }
  .sx-nav[data-scrolled="true"] .sx-nav__panel { max-width: 860px; }
  .sx-nav__links,
  .sx-nav__cta { display: none; }
  .sx-nav__toggle { display: flex; }
  .sx-nav__panel { display: block; }
}

/* ---------- Fallbacks ---------- */
@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  .sx-nav__bar { background: rgba(255, 255, 255, 0.95); }
  .sx-nav__panel { background: rgba(255, 255, 255, 0.98); }
}

@media (prefers-reduced-motion: reduce) {
  .sx-nav,
  .sx-nav *,
  .sx-nav *::after {
    animation: none !important;
    transition-duration: 0.01ms !important;
    transition-delay: 0s !important;
  }
}
`;

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function Navbar({
  links = DEFAULT_LINKS,
  cta = DEFAULT_CTA,
  brand = "Shaft",
  logoSrc = "/logo.png",
}: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null); // href of the section in view
  const [hovered, setHovered] = useState<number | null>(null); // index of hovered/focused link
  const [pill, setPill] = useState({ x: 0, w: 0 });
  const [showPill, setShowPill] = useState(false);

  const headerRef = useRef<HTMLElement>(null);
  const linkRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const progressRef = useRef<HTMLSpanElement>(null);

  const linkKey = links.map((l) => l.href).join("|");
  const activeIndex = links.findIndex((l) => l.href === active);
  const targetIndex = hovered !== null ? hovered : activeIndex >= 0 ? activeIndex : null;

  /* Scroll state + progress line (one rAF-throttled listener) */
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const y = window.scrollY;
      setScrolled(y > 24);
      if (y < 80) setActive(null);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(y / max, 1) : 0;
      if (progressRef.current) progressRef.current.style.transform = `scaleX(${p})`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  /* Scrollspy: highlight the link for the section in view */
  useEffect(() => {
    const els = links
      .map((l) => l.href)
      .filter((h) => h.startsWith("#") && h.length > 1)
      .map((h) => document.getElementById(h.slice(1)))
      .filter((el): el is HTMLElement => el !== null);
    if (!els.length) return undefined;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(`#${e.target.id}`);
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [linkKey]);

  /* Sliding pill: measure the target link */
  useLayoutEffect(() => {
    if (targetIndex === null) {
      setShowPill(false);
      return undefined;
    }
    const measure = () => {
      const el = linkRefs.current[targetIndex];
      if (el) setPill({ x: el.offsetLeft, w: el.offsetWidth });
    };
    measure();
    // Reveal on the next frame so the first appearance fades in place
    // instead of sliding across from its previous position.
    const raf = requestAnimationFrame(() => setShowPill(true));
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", measure);
    };
  }, [targetIndex, scrolled]);

  /* Mobile menu: Escape, outside click, and close when the viewport widens */
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onPointer = (e: PointerEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onResize = () => {
      if (window.innerWidth > 820) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    window.addEventListener("resize", onResize);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);

  /* Magnetic CTA */
  const onCtaMove = (e: ReactMouseEvent<HTMLAnchorElement>) => {
    if (prefersReducedMotion()) return;
    const r = e.currentTarget.getBoundingClientRect();
    const dx = (e.clientX - (r.left + r.width / 2)) * 0.18;
    const dy = (e.clientY - (r.top + r.height / 2)) * 0.28;
    e.currentTarget.style.setProperty("--mx", `${dx.toFixed(1)}px`);
    e.currentTarget.style.setProperty("--my", `${dy.toFixed(1)}px`);
  };
  const onCtaLeave = (e: ReactMouseEvent<HTMLAnchorElement>) => {
    e.currentTarget.style.setProperty("--mx", "0px");
    e.currentTarget.style.setProperty("--my", "0px");
  };

  const pillState = hovered !== null && hovered !== activeIndex ? "hover" : "active";

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <header
        ref={headerRef}
        className="sx-nav"
        data-scrolled={scrolled}
        data-open={open}
      >
        <div className="sx-nav__bar">
          <a className="sx-nav__brand" href="#top" aria-label={`${brand} home`}>
            <img className="sx-nav__logo" src={logoSrc} alt={brand} />
          </a>

          <nav className="sx-nav__links" aria-label="Primary">
            <span
              className="sx-nav__pill"
              aria-hidden="true"
              data-show={showPill}
              data-state={pillState}
              style={{ "--x": `${pill.x}px`, "--w": `${pill.w}px` } as CSSProperties}
            />
            <ul onMouseLeave={() => setHovered(null)}>
              {links.map((link, i) => (
                <li key={link.href}>
                  <a
                    ref={(el) => {
                      linkRefs.current[i] = el;
                    }}
                    className="sx-nav__link"
                    href={link.href}
                    aria-current={active === link.href ? "true" : undefined}
                    onMouseEnter={() => setHovered(i)}
                    onFocus={() => setHovered(i)}
                    onBlur={() => setHovered(null)}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <a
            className="sx-nav__cta"
            href={cta.href}
            onMouseMove={onCtaMove}
            onMouseLeave={onCtaLeave}
          >
            <span>{cta.label}</span>
          </a>

          <button
            type="button"
            className="sx-nav__toggle"
            aria-expanded={open}
            aria-controls="sx-nav-panel"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>

          <span className="sx-nav__progress" ref={progressRef} aria-hidden="true" />
        </div>

        <div className="sx-nav__panel" id="sx-nav-panel" aria-hidden={!open}>
          <ul>
            {links.map((link, i) => (
              <li key={link.href} style={{ "--i": i } as CSSProperties}>
                <a
                  href={link.href}
                  tabIndex={open ? 0 : -1}
                  aria-current={active === link.href ? "true" : undefined}
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li style={{ "--i": links.length } as CSSProperties}>
              <a
                className="sx-nav__panel-cta"
                href={cta.href}
                tabIndex={open ? 0 : -1}
                onClick={() => setOpen(false)}
              >
                {cta.label}
              </a>
            </li>
          </ul>
        </div>
      </header>
    </>
  );
}
