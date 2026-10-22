import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

type NavbarProps = { onExploreClick?: () => void };

const NAV_LINKS = [
  { label: "Platform", href: "#platform" },
  { label: "Workflow", href: "#workflow" },
  { label: "Explore", href: "#explore", explore: true },
];

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Amaranth:wght@400;700&display=swap');

.shaftNavRoot {
  --sn-ink: #172331;
  --sn-muted: #647386;
  --sn-line: rgba(32, 49, 69, .10);
  --sn-blue: #2c9ff4;
  position: fixed; z-index: 1000; inset: 18px 0 auto; padding-inline: 28px;
  pointer-events: none; font-family: 'Amaranth', sans-serif; -webkit-font-smoothing: antialiased;
}
.shaftNavRoot *, .shaftNavRoot *::before, .shaftNavRoot *::after { box-sizing: border-box; }
.shaftNavShell {
  width: min(1160px, 100%); min-height: 76px; margin: 0 auto; padding: 10px 11px 10px 19px;
  display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 26px;
  border: 1px solid rgba(255,255,255,.72); border-radius: 23px; background: rgba(255,255,255,.70);
  box-shadow: 0 4px 24px rgba(23,35,49,.025); backdrop-filter: blur(18px) saturate(155%);
  -webkit-backdrop-filter: blur(18px) saturate(155%); pointer-events: auto;
  transition: min-height .35s cubic-bezier(.2,.8,.2,1), background .35s ease, border-color .35s ease,
    box-shadow .35s ease, border-radius .35s ease;
}
.shaftNavShell.isScrolled {
  min-height: 66px; background: rgba(255,255,255,.88); border-color: var(--sn-line); border-radius: 20px;
  box-shadow: 0 12px 36px rgba(23,35,49,.075), 0 1px 2px rgba(23,35,49,.035);
  backdrop-filter: blur(26px) saturate(175%); -webkit-backdrop-filter: blur(26px) saturate(175%);
}
.shaftNavBrand {
  display: inline-flex; align-items: center; justify-self: start; gap: 10px; min-width: 0;
  color: var(--sn-ink); text-decoration: none; -webkit-tap-highlight-color: transparent;
}
.shaftNavLogo { width: 38px; height: 38px; display: block; object-fit: contain; flex: 0 0 auto; transition: transform .45s cubic-bezier(.2,.8,.2,1); }
.shaftNavBrand:hover .shaftNavLogo { transform: rotate(-4deg) scale(1.045); }
.shaftNavWordmark { font-size: 27px; line-height: 1; letter-spacing: -.8px; font-weight: 700; }
.shaftNavLinks { display: flex; align-items: center; justify-content: center; gap: clamp(21px, 3vw, 40px); }
.shaftNavLink {
  position: relative; display: inline-flex; align-items: center; min-height: 44px; color: #687688;
  font-size: 15px; letter-spacing: .04px; text-decoration: none; transition: color .22s ease;
}
.shaftNavLink::after {
  content: ''; position: absolute; left: 0; right: 0; bottom: 5px; height: 1.5px; border-radius: 4px;
  background: var(--sn-blue); transform: scaleX(0); transform-origin: left;
  transition: transform .28s cubic-bezier(.2,.8,.2,1);
}
.shaftNavLink:hover, .shaftNavLink:focus-visible { color: var(--sn-ink); }
.shaftNavLink:hover::after, .shaftNavLink:focus-visible::after { transform: scaleX(1); }
.shaftNavRight { display: flex; align-items: center; justify-content: end; gap: 17px; }
.shaftNavSignIn { color: #586779; font-size: 14px; text-decoration: none; white-space: nowrap; transition: color .2s ease; }
.shaftNavSignIn:hover { color: var(--sn-ink); }
.shaftNavCta {
  position: relative; isolation: isolate; display: inline-flex; align-items: center; justify-content: center;
  gap: 13px; min-height: 46px; padding: 0 18px; overflow: hidden; border: 1px solid #182737;
  border-radius: 14px; background: #182737; color: #fff; font-size: 14px; line-height: 1;
  text-decoration: none; white-space: nowrap;
  transition: transform .25s cubic-bezier(.2,.8,.2,1), box-shadow .25s ease, border-color .25s ease;
}
.shaftNavCta::before {
  content: ''; position: absolute; z-index: -1; inset: 0;
  background: linear-gradient(110deg, #203a51, #172331 58%, #294a64); opacity: 0; transition: opacity .25s ease;
}
.shaftNavCta:hover { transform: translateY(-1px); border-color: #274860; box-shadow: 0 7px 20px rgba(23,35,49,.15); }
.shaftNavCta:hover::before { opacity: 1; }
.shaftNavArrow { display: inline-block; font-family: Arial, sans-serif; font-size: 17px; font-weight: 400; transition: transform .25s ease; }
.shaftNavCta:hover .shaftNavArrow { transform: translate(2px, -2px); }
.shaftNavToggle {
  display: none; width: 44px; height: 44px; padding: 0; align-items: center; justify-content: center;
  flex-direction: column; gap: 5px; border: 1px solid var(--sn-line); border-radius: 13px;
  background: rgba(255,255,255,.78); cursor: pointer;
}
.shaftNavToggle span { width: 17px; height: 1.5px; display: block; border-radius: 2px; background: var(--sn-ink); transition: transform .22s ease; }
.shaftNavToggle.isOpen span:first-child { transform: translateY(3.25px) rotate(45deg); }
.shaftNavToggle.isOpen span:last-child { transform: translateY(-3.25px) rotate(-45deg); }
.shaftNavMobileBackdrop, .shaftNavMobilePanel { display: none; }
.shaftNavRoot a:focus-visible, .shaftNavToggle:focus-visible { outline: 2px solid var(--sn-blue); outline-offset: 4px; }

@media (max-width: 820px) {
  .shaftNavRoot { inset-block-start: 12px; padding-inline: 14px; }
  .shaftNavShell, .shaftNavShell.isScrolled {
    min-height: 64px; padding: 8px 9px 8px 14px; gap: 10px; border-radius: 19px;
    border-color: var(--sn-line); background: rgba(255,255,255,.87); box-shadow: 0 7px 26px rgba(23,35,49,.055);
    backdrop-filter: blur(22px) saturate(165%); -webkit-backdrop-filter: blur(22px) saturate(165%);
    grid-template-columns: 1fr auto;
  }
  .shaftNavLogo { width: 34px; height: 34px; }
  .shaftNavWordmark { font-size: 25px; }
  .shaftNavLinks, .shaftNavSignIn { display: none; }
  .shaftNavRight { gap: 9px; }
  .shaftNavCta { min-height: 42px; padding-inline: 13px; gap: 8px; border-radius: 12px; font-size: 13px; }
  .shaftNavToggle { display: flex; flex: 0 0 auto; }
  .shaftNavMobileBackdrop {
    display: block; position: fixed; z-index: -1; inset: -12px 0 0; width: 100%; height: 100dvh;
    border: 0; background: rgba(22,34,47,.13); backdrop-filter: blur(3px); -webkit-backdrop-filter: blur(3px);
    pointer-events: auto; cursor: default;
  }
  .shaftNavMobilePanel {
    position: absolute; top: calc(100% + 10px); left: 0; right: 0; display: flex; flex-direction: column;
    gap: 4px; padding: 10px; border: 1px solid rgba(32,49,69,.09); border-radius: 20px;
    background: rgba(255,255,255,.96); box-shadow: 0 20px 50px rgba(23,35,49,.13);
    backdrop-filter: blur(26px); -webkit-backdrop-filter: blur(26px); pointer-events: auto;
  }
  .shaftNavMobileLink {
    display: flex; justify-content: space-between; align-items: center; min-height: 49px; padding: 0 13px;
    border-radius: 11px; color: #344457; font-size: 16px; text-decoration: none;
    transition: background .18s ease, color .18s ease;
  }
  .shaftNavMobileLink:hover { background: #f3f7fb; color: var(--sn-ink); }
  .shaftNavMobileLink span { color: #8592a0; font-family: Arial,sans-serif; font-size: 16px; }
  .shaftNavMobileCta {
    display: flex; align-items: center; justify-content: space-between; margin-top: 6px; min-height: 48px;
    padding: 0 14px; border-radius: 12px; background: #182737; color: white; font-size: 15px; text-decoration: none;
  }
}
@media (max-width: 390px) {
  .shaftNavWordmark { font-size: 23px; }
  .shaftNavCta { padding-inline: 10px; }
  .shaftNavCtaLabel { max-width: 75px; overflow: hidden; text-overflow: ellipsis; }
}
@media (prefers-reduced-motion: reduce) {
  .shaftNavRoot *, .shaftNavRoot *::before, .shaftNavRoot *::after {
    scroll-behavior: auto !important; animation-duration: .01ms !important; transition-duration: .01ms !important;
  }
}
`;

export default function Navbar({ onExploreClick }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const updateScroll = () => setScrolled(window.scrollY > 12);
    updateScroll();
    window.addEventListener("scroll", updateScroll, { passive: true });
    return () => window.removeEventListener("scroll", updateScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <style>{styles}</style>
      <header className="shaftNavRoot">
        <motion.nav
          className={`shaftNavShell${scrolled ? " isScrolled" : ""}`}
          aria-label="Main navigation"
          initial={reduceMotion ? false : { opacity: 0, y: -13 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <a className="shaftNavBrand" href="/" aria-label="SHAFT home" onClick={closeMenu}>
            <img className="shaftNavLogo" src="/logo.png" alt="" />
            <span className="shaftNavWordmark">Shaft</span>
          </a>

          <div className="shaftNavLinks">
            {NAV_LINKS.map((link) => (
              <a
                className="shaftNavLink"
                href={link.href}
                key={link.label}
                onClick={link.explore && onExploreClick ? (event) => { event.preventDefault(); onExploreClick(); } : undefined}
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="shaftNavRight">
            <a className="shaftNavSignIn" href="/login">Sign in</a>
            <motion.a
              className="shaftNavCta"
              href="#get-started"
              whileHover={reduceMotion ? undefined : { y: -1 }}
              whileTap={reduceMotion ? undefined : { scale: 0.98 }}
            >
              <span className="shaftNavCtaLabel">Start building</span>
              <span className="shaftNavArrow" aria-hidden="true">↗</span>
            </motion.a>
            <button
              type="button"
              className={`shaftNavToggle${menuOpen ? " isOpen" : ""}`}
              aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={menuOpen}
              aria-controls="shaftNavMobilePanel"
              onClick={() => setMenuOpen((open) => !open)}
            >
              <span /><span />
            </button>
          </div>
        </motion.nav>

        <AnimatePresence>
          {menuOpen && (
            <>
              <motion.button
                type="button"
                className="shaftNavMobileBackdrop"
                aria-label="Close navigation menu"
                onClick={closeMenu}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
              />
              <motion.div
                id="shaftNavMobilePanel"
                className="shaftNavMobilePanel"
                initial={reduceMotion ? false : { opacity: 0, y: -7, scale: 0.985 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -7, scale: 0.985 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              >
                {NAV_LINKS.map((link, index) => (
                  <motion.a
                    className="shaftNavMobileLink"
                    href={link.href}
                    key={link.label}
                    onClick={(event) => {
                      closeMenu();
                      if (link.explore && onExploreClick) {
                        event.preventDefault();
                        onExploreClick();
                      }
                    }}
                    initial={reduceMotion ? false : { opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: reduceMotion ? 0 : index * 0.035, duration: 0.18 }}
                  >
                    {link.label}<span aria-hidden="true">↗</span>
                  </motion.a>
                ))}
                <a className="shaftNavMobileCta" href="#get-started" onClick={closeMenu}>
                  Start building <span aria-hidden="true">↗</span>
                </a>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
