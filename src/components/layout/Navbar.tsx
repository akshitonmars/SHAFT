import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

type NavbarProps = { onExploreClick?: () => void };

const NAV_LINKS = [
  { label: "Platform", href: "#platform" },
  { label: "Workflow", href: "#workflow" },
  { label: "Explore", href: "#explore", explore: true },
];

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Amaranth:wght@400;700&family=Inter:wght@400;500;600;650;700&display=swap');

.shaftNavRoot {
  --sn-ink: #152332;
  --sn-muted: #647386;
  --sn-blue: #259cf0;
  --sn-border: rgba(24, 42, 60, .085);
  position: fixed; z-index: 1000; inset: 18px 0 auto; padding-inline: 24px;
  pointer-events: none; font-family: 'Inter', sans-serif; -webkit-font-smoothing: antialiased;
}
.shaftNavRoot *, .shaftNavRoot *::before, .shaftNavRoot *::after { box-sizing: border-box; }
.shaftNavShell {
  position: relative; isolation: isolate; width: min(1080px, 100%); min-height: 68px; margin: 0 auto;
  padding: 8px 9px 8px 23px; display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 24px;
  border: 1px solid rgba(255,255,255,.86); border-radius: 19px;
  background: rgba(250,252,254,.79); box-shadow: 0 8px 32px rgba(20,39,57,.045), inset 0 1px 0 rgba(255,255,255,.96);
  -webkit-backdrop-filter: blur(22px) saturate(160%); backdrop-filter: blur(22px) saturate(160%);
  pointer-events: auto; transition: min-height .35s cubic-bezier(.2,.8,.2,1), background .3s ease,
  border-color .3s ease, box-shadow .3s ease, border-radius .3s ease;
}
.shaftNavShell::before {
  content: ''; position: absolute; z-index: -1; inset: 0; border-radius: inherit; padding: 1px;
  background: linear-gradient(115deg, rgba(255,255,255,.95), rgba(154,197,229,.2) 46%, rgba(255,255,255,.7));
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor; mask-composite: exclude; pointer-events: none;
}
.shaftNavShell.isScrolled {
  min-height: 62px; background: rgba(252,253,255,.91); border-color: rgba(24,42,60,.1);
  border-radius: 17px; box-shadow: 0 12px 38px rgba(20,39,57,.085), 0 2px 6px rgba(20,39,57,.025);
  -webkit-backdrop-filter: blur(28px) saturate(175%); backdrop-filter: blur(28px) saturate(175%);
}
.shaftNavBrand {
  position: relative; display: inline-flex; align-items: center; justify-self: start; gap: 8px;
  min-width: 0; color: var(--sn-ink); text-decoration: none; -webkit-tap-highlight-color: transparent;
}
.shaftNavWordmark {
  font-family: 'Amaranth', sans-serif; font-size: 29px; line-height: .95; font-weight: 700;
  letter-spacing: -.9px; transform: translateY(-1px); transition: letter-spacing .3s ease, color .3s ease;
}
.shaftNavBrand:hover .shaftNavWordmark { letter-spacing: -.55px; }
.shaftNavBrandAccent {
  width: 5px; height: 5px; margin: 0 0 0 1px; border-radius: 50%; background: var(--sn-blue);
  box-shadow: 0 0 0 0 rgba(37,156,240,.25); animation: shaftNavPulse 3.2s ease-out infinite;
}
@keyframes shaftNavPulse {
  0%, 65%, 100% { box-shadow: 0 0 0 0 rgba(37,156,240,0); }
  78% { box-shadow: 0 0 0 4px rgba(37,156,240,.11); }
}
.shaftNavLinks {
  position: relative; display: flex; align-items: center; justify-content: center; gap: 3px;
  padding: 4px; border: 1px solid rgba(24,42,60,.045); border-radius: 13px;
  background: rgba(237,242,247,.58);
}
.shaftNavLink {
  position: relative; display: inline-flex; align-items: center; justify-content: center;
  min-height: 35px; padding: 0 14px; border-radius: 9px; color: #667587; font-size: 12.5px;
  font-weight: 550; letter-spacing: -.12px; text-decoration: none; white-space: nowrap;
  transition: color .2s ease, background .25s ease, box-shadow .25s ease;
}
.shaftNavLink::after {
  content: ''; position: absolute; bottom: 5px; left: 14px; right: 14px; height: 1px;
  border-radius: 2px; background: var(--sn-blue); transform: scaleX(0); transform-origin: center;
  transition: transform .24s cubic-bezier(.2,.8,.2,1);
}
.shaftNavLink:hover, .shaftNavLink:focus-visible { color: var(--sn-ink); background: rgba(255,255,255,.82); box-shadow: 0 1px 3px rgba(24,42,60,.04); }
.shaftNavLink:hover::after, .shaftNavLink:focus-visible::after { transform: scaleX(1); }
.shaftNavRight { display: flex; align-items: center; justify-content: end; gap: 17px; }
.shaftNavSignIn {
  color: #536477; font-size: 12.5px; font-weight: 550; text-decoration: none; white-space: nowrap;
  transition: color .2s ease;
}
.shaftNavSignIn:hover { color: var(--sn-ink); }
.shaftNavCta {
  position: relative; isolation: isolate; display: inline-flex; align-items: center; justify-content: center;
  gap: 13px; min-height: 43px; padding: 0 16px; overflow: hidden; border: 1px solid #1a2d40;
  border-radius: 12px; background: #1a2d40; color: #fff; font-size: 12.5px; font-weight: 600;
  letter-spacing: -.12px; text-decoration: none; white-space: nowrap;
  box-shadow: 0 2px 5px rgba(21,35,49,.08), inset 0 1px 0 rgba(255,255,255,.1);
  transition: transform .24s cubic-bezier(.2,.8,.2,1), box-shadow .24s ease, background .24s ease;
}
.shaftNavCta::before {
  content: ''; position: absolute; z-index: -1; top: -50%; bottom: -50%; left: -70%; width: 42%;
  transform: skewX(-22deg); background: linear-gradient(90deg, transparent, rgba(255,255,255,.24), transparent);
  animation: shaftNavSheen 6.5s ease-in-out infinite;
}
.shaftNavCta::after {
  content: ''; position: absolute; z-index: -2; inset: 0;
  background: linear-gradient(115deg, #24445d, #1a2d40 55%, #2b6385); opacity: 0; transition: opacity .3s ease;
}
@keyframes shaftNavSheen {
  0%, 70%, 100% { left: -70%; opacity: 0; }
  75% { opacity: 1; }
  93% { left: 135%; opacity: .75; }
}
.shaftNavCta:hover { transform: translateY(-1px); box-shadow: 0 7px 18px rgba(21,35,49,.16); }
.shaftNavCta:hover::after { opacity: 1; }
.shaftNavArrow { display: inline-block; font-family: 'Inter', sans-serif; font-size: 15px; font-weight: 400; transition: transform .22s ease; }
.shaftNavCta:hover .shaftNavArrow { transform: translate(2px, -2px); }
.shaftNavToggle {
  display: none; min-width: 43px; min-height: 43px; padding: 0 10px; align-items: center; justify-content: center;
  flex-direction: column; gap: 5px; border: 1px solid var(--sn-border); border-radius: 12px;
  background: rgba(255,255,255,.72); cursor: pointer;
}
.shaftNavToggle span { width: 17px; height: 1.5px; display: block; border-radius: 2px; background: var(--sn-ink); transition: transform .25s ease, width .25s ease; }
.shaftNavToggle span:last-child { width: 12px; margin-left: 5px; }
.shaftNavToggle:hover span:last-child { width: 17px; margin-left: 0; }
.shaftNavToggle.isOpen span:first-child { transform: translateY(3.25px) rotate(45deg); }
.shaftNavToggle.isOpen span:last-child { width: 17px; margin-left: 0; transform: translateY(-3.25px) rotate(-45deg); }
.shaftNavMobileBackdrop, .shaftNavMobilePanel { display: none; }
.shaftNavRoot a:focus-visible, .shaftNavToggle:focus-visible { outline: 2px solid var(--sn-blue); outline-offset: 4px; }

@media (max-width: 820px) {
  .shaftNavRoot { inset-block-start: 12px; padding-inline: 14px; }
  .shaftNavShell, .shaftNavShell.isScrolled {
    min-height: 61px; padding: 7px 8px 7px 16px; gap: 8px; border-radius: 17px;
    grid-template-columns: 1fr auto; border-color: rgba(24,42,60,.08);
    background: rgba(250,252,254,.88); box-shadow: 0 8px 26px rgba(20,39,57,.065);
    -webkit-backdrop-filter: blur(24px) saturate(165%); backdrop-filter: blur(24px) saturate(165%);
  }
  .shaftNavWordmark { font-size: 26px; }
  .shaftNavLinks, .shaftNavSignIn { display: none; }
  .shaftNavRight { gap: 8px; }
  .shaftNavCta { min-height: 41px; padding-inline: 13px; gap: 8px; border-radius: 11px; font-size: 12px; }
  .shaftNavToggle { display: flex; min-width: 41px; min-height: 41px; }
  .shaftNavMobileBackdrop {
    display: block; position: fixed; z-index: -1; inset: -12px 0 0; width: 100%; height: 100dvh;
    border: 0; background: rgba(19,32,45,.12); -webkit-backdrop-filter: blur(4px); backdrop-filter: blur(4px);
    pointer-events: auto; cursor: default;
  }
  .shaftNavMobilePanel {
    position: absolute; top: calc(100% + 9px); left: 0; right: 0; display: flex; flex-direction: column;
    gap: 4px; padding: 9px; border: 1px solid rgba(24,42,60,.09); border-radius: 17px;
    background: rgba(252,253,255,.97); box-shadow: 0 22px 54px rgba(19,35,51,.15);
    -webkit-backdrop-filter: blur(26px); backdrop-filter: blur(26px); pointer-events: auto;
  }
  .shaftNavMobileEyebrow { padding: 9px 12px 6px; color: #8a98a7; font-size: 9px; font-weight: 700; letter-spacing: 1.6px; text-transform: uppercase; }
  .shaftNavMobileLink {
    display: flex; justify-content: space-between; align-items: center; min-height: 48px; padding: 0 13px;
    border-radius: 10px; color: #344457; font-size: 14px; font-weight: 550; text-decoration: none;
    transition: background .18s ease, color .18s ease, padding .18s ease;
  }
  .shaftNavMobileLink:hover { padding-left: 16px; background: #f1f6fa; color: var(--sn-ink); }
  .shaftNavMobileLink span { color: #8592a0; font-size: 15px; }
  .shaftNavMobileCta {
    display: flex; align-items: center; justify-content: space-between; margin-top: 6px; min-height: 46px;
    padding: 0 14px; border-radius: 11px; background: #1a2d40; color: white; font-size: 13px;
    font-weight: 600; text-decoration: none;
  }
}
@media (max-width: 390px) {
  .shaftNavRoot { padding-inline: 10px; }
  .shaftNavShell, .shaftNavShell.isScrolled { padding-left: 12px; gap: 6px; }
  .shaftNavWordmark { font-size: 24px; }
  .shaftNavRight { gap: 6px; }
  .shaftNavCta { min-height: 39px; padding-inline: 10px; gap: 5px; font-size: 11.5px; }
  .shaftNavArrow { font-size: 14px; }
  .shaftNavToggle { min-width: 39px; min-height: 39px; }
}
@media (prefers-reduced-motion: reduce) {
  .shaftNavRoot *, .shaftNavRoot *::before, .shaftNavRoot *::after {
    scroll-behavior: auto !important; animation-duration: .01ms !important; animation-iteration-count: 1 !important;
    transition-duration: .01ms !important;
  }
}
`;

export default function Navbar({ onExploreClick }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const updateScroll = () => setScrolled(window.scrollY > 10);
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
  const handleLinkClick = (event: React.MouseEvent<HTMLAnchorElement>, explore?: boolean) => {
    if (explore && onExploreClick) {
      event.preventDefault();
      onExploreClick();
    }
    closeMenu();
  };

  return (
    <>
      <style>{styles}</style>
      <header className="shaftNavRoot">
        <motion.nav
          className={`shaftNavShell${scrolled ? " isScrolled" : ""}`}
          aria-label="Main navigation"
          initial={reduceMotion ? false : { opacity: 0, y: -10, scale: 0.99 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <a className="shaftNavBrand" href="/" aria-label="SHAFT home" onClick={closeMenu}>
            <span className="shaftNavWordmark">Shaft</span>
            <span className="shaftNavBrandAccent" aria-hidden="true" />
          </a>

          <div className="shaftNavLinks">
            {NAV_LINKS.map((link) => (
              <a
                className="shaftNavLink"
                href={link.href}
                key={link.label}
                onClick={(event) => handleLinkClick(event, link.explore)}
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
              <span>Start building</span>
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
                <div className="shaftNavMobileEyebrow">Navigate SHAFT</div>
                {NAV_LINKS.map((link, index) => (
                  <motion.a
                    className="shaftNavMobileLink"
                    href={link.href}
                    key={link.label}
                    onClick={(event) => handleLinkClick(event, link.explore)}
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
