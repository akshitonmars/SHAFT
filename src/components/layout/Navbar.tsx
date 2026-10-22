import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowUpRight, ShieldAlert } from 'lucide-react';

interface NavbarProps {
  onExploreClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onExploreClick }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [signInNoticeOpen, setSignInNoticeOpen] = useState(false);

  // Close mobile menu on Escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileMenuOpen(false);
        setSignInNoticeOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const navLinks = [
    { label: 'Product', href: '#product' },
    { label: 'Integrations', href: '#integrations' },
    { label: 'About', href: '#about' },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-brand-border bg-brand-dark/90 backdrop-blur-md transition-colors">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 sm:px-8 lg:px-12">
          {/* Left: Typographic Wordmark */}
          <div className="flex items-center">
            <a
              href="#"
              className="group flex items-center gap-2.5 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2 focus-visible:ring-offset-brand-dark"
              aria-label="SHAFT Home"
            >
              <span className="font-display text-2xl font-semibold tracking-widest text-brand-light transition-colors group-hover:text-brand-accent">
                SHAFT
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-brand-accent transition-transform group-hover:scale-125" />
            </a>
          </div>

          {/* Center: Desktop Navigation */}
          <nav
            className="hidden md:flex items-center space-x-10 text-sm font-medium tracking-wide text-brand-muted"
            aria-label="Main Navigation"
          >
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="transition-colors hover:text-brand-light focus-visible:text-brand-light focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-accent"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right: Desktop Actions */}
          <div className="hidden md:flex items-center space-x-6">
            <button
              type="button"
              onClick={() => setSignInNoticeOpen(true)}
              className="text-sm font-medium tracking-wide text-brand-muted transition-colors hover:text-brand-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
            >
              Sign in
            </button>
            <a
              href="#workspace-preview"
              onClick={(e) => {
                if (onExploreClick) {
                  e.preventDefault();
                  onExploreClick();
                }
              }}
              className="inline-flex items-center justify-center rounded-md border border-brand-accent/40 bg-brand-accent/10 px-4 py-2 text-sm font-medium text-brand-accent transition-all hover:bg-brand-accent hover:text-brand-dark hover:border-brand-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2 focus-visible:ring-offset-brand-dark"
            >
              Get Started
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-brand-border text-brand-light transition-colors hover:bg-brand-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div
            id="mobile-menu"
            className="md:hidden border-b border-brand-border bg-brand-dark px-6 py-6 transition-all"
          >
            <nav className="flex flex-col space-y-4 text-base font-medium text-brand-light">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-md py-2.5 px-3 transition-colors hover:bg-brand-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
                >
                  {link.label}
                </a>
              ))}
              <div className="pt-4 border-t border-brand-border flex flex-col space-y-3">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setSignInNoticeOpen(true);
                  }}
                  className="w-full text-left rounded-md py-2.5 px-3 text-brand-muted hover:text-brand-light hover:bg-brand-surface transition-colors"
                >
                  Sign in
                </button>
                <a
                  href="#workspace-preview"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (onExploreClick) onExploreClick();
                  }}
                  className="inline-flex w-full items-center justify-center rounded-md border border-brand-accent bg-brand-accent px-4 py-3 text-center text-sm font-semibold text-brand-dark transition-opacity hover:opacity-95"
                >
                  Get Started
                </a>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Non-destructive Sign-in Preview Dialog */}
      {signInNoticeOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
        >
          <div className="w-full max-w-md rounded-lg border border-brand-border bg-brand-surface p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-brand-accent/10 p-2 text-brand-accent">
                  <ShieldAlert className="h-5 w-5" />
                </div>
                <h3 id="modal-title" className="text-lg font-semibold text-brand-light">
                  Authentication Preview
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSignInNoticeOpen(false)}
                className="rounded-md p-1.5 text-brand-muted hover:text-brand-light hover:bg-brand-elevated transition-colors"
                aria-label="Close dialog"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-brand-muted">
              Account authentication is scheduled for integration in the next release cycle.
              You can currently explore the complete architecture and static command center workspace preview on this page.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setSignInNoticeOpen(false)}
                className="rounded-md border border-brand-border px-4 py-2 text-sm font-medium text-brand-light hover:bg-brand-elevated transition-colors"
              >
                Close
              </button>
              <a
                href="#workspace-preview"
                onClick={() => {
                  setSignInNoticeOpen(false);
                  if (onExploreClick) onExploreClick();
                }}
                className="inline-flex items-center gap-1.5 rounded-md bg-brand-accent px-4 py-2 text-sm font-semibold text-brand-dark hover:opacity-90 transition-opacity"
              >
                Explore Preview <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
