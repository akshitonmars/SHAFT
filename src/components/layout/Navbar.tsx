
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import "./Navbar.css";

const links = [
  { label: "Product", href: "#product" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Explore", href: "#explore" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 16);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="shaft-header">
      <motion.nav
        className={`shaft-nav ${scrolled ? "is-scrolled" : ""}`}
        aria-label="Main navigation"
        initial={reduceMotion ? false : { opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        <a
          className="shaft-brand"
          href="/"
          aria-label="SHAFT home"
          onClick={closeMenu}
        >
          <img src="/logo.png" alt="" />
        </a>

        <div className="shaft-links">
          {links.map((link) => (
            <a className="shaft-link" href={link.href} key={link.label}>
              <span>{link.label}</span>
              <motion.span
                className="shaft-link-line"
                layoutId="shaft-link-line"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            </a>
          ))}
        </div>

        <div className="shaft-actions">
          <a className="shaft-cta" href="#get-started">
            <span>Get started</span>
            <span className="shaft-arrow" aria-hidden="true">↗</span>
          </a>

          <button
            className={`shaft-menu-toggle ${menuOpen ? "active" : ""}`}
            type="button"
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={menuOpen}
            aria-controls="shaft-mobile-menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span />
            <span />
          </button>
        </div>
      </motion.nav>

      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.button
              className="shaft-mobile-backdrop"
              aria-label="Close navigation menu"
              onClick={closeMenu}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            <motion.div
              id="shaft-mobile-menu"
              className="shaft-mobile-menu"
              initial={reduceMotion ? false : { opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              {links.map((link, index) => (
                <motion.a
                  key={link.label}
                  href={link.href}
                  onClick={closeMenu}
                  initial={reduceMotion ? false : { opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: reduceMotion ? 0 : index * 0.045 }}
                >
                  {link.label}
                  <span aria-hidden="true">↗</span>
                </motion.a>
              ))}

              <a
                className="shaft-mobile-cta"
                href="#get-started"
                onClick={closeMenu}
              >
                Get started <span aria-hidden="true">↗</span>
              </a>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
