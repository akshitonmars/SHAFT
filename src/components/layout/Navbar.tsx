import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  ArrowUpRight,
  ChevronDown,
  Layers,
  Cpu,
  ShieldCheck,
  Zap,
  Globe,
  Command,
  Menu,
  X,
  Code2,
  Workflow,
  Activity,
  Lock,
  Terminal,
  LucideIcon,
} from 'lucide-react';

interface MegaItem {
  title: string;
  desc: string;
  icon: LucideIcon;
  badge: string;
  accent: string;
}

interface NavLinkItem {
  id: string;
  label: string;
  href?: string;
  hasMega: boolean;
  badge?: string;
  featured?: {
    tag: string;
    title: string;
    subtitle: string;
    metric: string;
    cta: string;
  };
  items?: MegaItem[];
}

const NAV_LINKS: NavLinkItem[] = [
  {
    id: 'product',
    label: 'Product',
    hasMega: true,
    featured: {
      tag: 'SHAFT CORE v2.4',
      title: 'Deterministic Execution Engine',
      subtitle: 'Zero-latency state synchronization with optical edge routing.',
      metric: '99.999% Uptime SLA',
      cta: 'Explore Core Engine',
    },
    items: [
      {
        title: 'Parallel Pipelines',
        desc: 'Sub-millisecond task sharding across edge nodes',
        icon: Workflow,
        badge: 'FAST',
        accent: 'from-sky-400 to-blue-600',
      },
      {
        title: 'Neural Mesh API',
        desc: 'Unified GraphQL & gRPC streaming gateway',
        icon: Cpu,
        badge: 'NEW',
        accent: 'from-indigo-400 to-violet-600',
      },
      {
        title: 'Zero-Trust Vault',
        desc: 'Hardware-isolated secrets & ephemeral keys',
        icon: ShieldCheck,
        badge: 'SOC2',
        accent: 'from-blue-400 to-cyan-500',
      },
      {
        title: 'Real-Time Telemetry',
        desc: 'High-cardinality traces with instant replay',
        icon: Activity,
        badge: 'LIVE',
        accent: 'from-sky-500 to-indigo-500',
      },
    ],
  },
  {
    id: 'architecture',
    label: 'Architecture',
    hasMega: true,
    featured: {
      tag: 'GLOBAL FABRIC',
      title: '320+ Anycast Edge Regions',
      subtitle: 'Automatic cold-start elimination and regional failover.',
      metric: '< 11ms Global P99',
      cta: 'View Network Map',
    },
    items: [
      {
        title: 'Distributed State',
        desc: 'CRDT-backed memory replicas at the edge',
        icon: Layers,
        badge: 'CORE',
        accent: 'from-blue-500 to-sky-400',
      },
      {
        title: 'Edge Runtime SDK',
        desc: 'TypeScript, Rust & WebAssembly native targets',
        icon: Code2,
        badge: 'WASM',
        accent: 'from-indigo-500 to-blue-500',
      },
      {
        title: 'Global Mesh Routing',
        desc: 'Smart BGP path optimization in real time',
        icon: Globe,
        badge: 'ANYCAST',
        accent: 'from-sky-400 to-cyan-500',
      },
      {
        title: 'Enclave Compute',
        desc: 'Confidential computing with verifiable attestation',
        icon: Lock,
        badge: 'E2EE',
        accent: 'from-violet-500 to-indigo-500',
      },
    ],
  },
  { id: 'benchmarks', label: 'Benchmarks', href: '#benchmarks', hasMega: false },
  { id: 'pricing', label: 'Pricing', href: '#pricing', hasMega: false },
  { id: 'changelog', label: 'Changelog', href: '#changelog', badge: 'v2.4', hasMega: false },
];

const ShaftLogoMark: React.FC<{ className?: string }> = ({ className = 'w-8 h-8' }) => {
  const [imgError, setImgError] = useState(false);

  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      {!imgError ? (
        <img
          src="/logo.png"
          alt="Shaft Logo"
          className="w-full h-full object-contain drop-shadow-[0_2px_10px_rgba(56,189,248,0.28)]"
          onError={() => setImgError(true)}
        />
      ) : (
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-[0_3px_12px_rgba(30,150,255,0.28)]"
        >
          <defs>
            <linearGradient id="shaftBar1" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#BAE6FD" />
              <stop offset="50%" stopColor="#60A5FA" />
              <stop offset="100%" stopColor="#0284C7" />
            </linearGradient>
            <linearGradient id="shaftBar2" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#BFDBFE" />
              <stop offset="52%" stopColor="#C7D2FE" />
              <stop offset="100%" stopColor="#38BDF8" />
            </linearGradient>
            <linearGradient id="shaftBar3" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="65%" stopColor="#BAE6FD" />
              <stop offset="100%" stopColor="#E0F2FE" />
            </linearGradient>
          </defs>
          <path d="M16 11 L38 25.5 L38 77.5 L16 90 Z" fill="url(#shaftBar1)" />
          <path d="M47 28.5 L64.5 34 L64.5 71 L47 75.5 Z" fill="url(#shaftBar2)" />
          <path d="M72.5 34.5 L84.5 36.8 L84.5 67.5 L72.5 69.2 Z" fill="url(#shaftBar3)" />
        </svg>
      )}
    </div>
  );
};

const KineticText: React.FC<{ text: string; isHovered: boolean }> = ({ text, isHovered }) => (
  <span className="relative inline-flex overflow-hidden h-[20px] items-center">
    <motion.span
      animate={{
        y: isHovered ? '-115%' : '0%',
        filter: isHovered ? 'blur(3px)' : 'blur(0px)',
        opacity: isHovered ? 0 : 1,
      }}
      transition={{ type: 'spring', stiffness: 460, damping: 32 }}
      className="inline-block"
    >
      {text}
    </motion.span>
    <motion.span
      initial={{ y: '115%', filter: 'blur(3px)', opacity: 0 }}
      animate={{
        y: isHovered ? '0%' : '115%',
        filter: isHovered ? 'blur(0px)' : 'blur(3px)',
        opacity: isHovered ? 1 : 0,
      }}
      transition={{ type: 'spring', stiffness: 460, damping: 32 }}
      className="absolute inset-0 inline-flex items-center text-slate-950 font-bold"
    >
      {text}
    </motion.span>
  </span>
);

const MegaMenuCard: React.FC<{ item: MegaItem; index: number }> = ({ item, index }) => {
  const cardRef = useRef<HTMLAnchorElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const Icon = item.icon;

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <motion.a
      ref={cardRef}
      href={`#${item.title.toLowerCase().replace(/\s+/g, '-')}`}
      initial={{ opacity: 0, y: 8, filter: 'blur(6px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{
        duration: 0.32,
        delay: index * 0.04,
        ease: [0.22, 1, 0.36, 1],
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative flex items-start gap-3.5 p-3.5 rounded-2xl transition-all duration-300 bg-white/55 hover:bg-white/95 border border-slate-200/60 hover:border-sky-200/90 shadow-[0_2px_10px_-4px_rgba(15,23,42,0.03)] hover:shadow-[0_12px_28px_-8px_rgba(56,189,248,0.16)] overflow-hidden"
    >
      <div
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: isHovered
            ? `radial-gradient(220px circle at ${mousePos.x}px ${mousePos.y}px, rgba(56, 189, 248, 0.13), transparent 75%)`
            : 'none',
        }}
      />

      <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-50 to-slate-100/90 border border-slate-200/70 group-hover:border-sky-200 group-hover:scale-105 transition-all duration-300 shadow-inner">
        <div
          className={`absolute inset-0 rounded-xl bg-gradient-to-br ${item.accent} opacity-0 group-hover:opacity-12 transition-opacity duration-300`}
        />
        <Icon className="w-4 h-4 text-slate-700 group-hover:text-sky-600 transition-colors duration-300" />
      </div>

      <div className="relative z-10 flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[14.5px] text-slate-900 group-hover:text-sky-950 transition-colors">
            {item.title}
          </span>
          {item.badge && (
            <span className="text-[9.5px] tracking-wider font-bold uppercase px-1.5 py-0.5 rounded-md bg-sky-50 text-sky-600 border border-sky-200/60">
              {item.badge}
            </span>
          )}
          <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 opacity-0 -translate-x-1 translate-y-1 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:text-sky-500 transition-all duration-200 ml-auto" />
        </div>
        <p className="text-xs text-slate-500 group-hover:text-slate-600 mt-0.5 leading-relaxed line-clamp-1">
          {item.desc}
        </p>
      </div>
    </motion.a>
  );
};

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [openMegaId, setOpenMegaId] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoHovered, setLogoHovered] = useState(false);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavEnter = (link: NavLinkItem) => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    setHoveredId(link.id);
    if (link.hasMega) {
      setOpenMegaId(link.id);
    } else {
      setOpenMegaId(null);
    }
  };

  const handleNavLeave = () => {
    setHoveredId(null);
    closeTimeoutRef.current = setTimeout(() => {
      setOpenMegaId(null);
    }, 140);
  };

  const handleMegaEnter = () => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
  };

  const handleMegaLeave = () => {
    setHoveredId(null);
    setOpenMegaId(null);
  };

  const activeMegaData = NAV_LINKS.find((item) => item.id === openMegaId);

  return (
    <header
      style={{ fontFamily: "'Amaranth', sans-serif" }}
      className="fixed top-0 left-0 right-0 z-50 flex flex-col items-center px-4 sm:px-6 pt-3 sm:pt-5 pointer-events-none"
    >
      {/* Top Ambient Light Diffusion Bar */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[540px] max-w-[90vw] h-16 bg-gradient-to-b from-sky-300/20 via-indigo-200/10 to-transparent blur-2xl -z-10" />

      {/* Main Floating Glass Navbar */}
      <motion.nav
        layout
        initial={{ y: -24, opacity: 0, filter: 'blur(10px)' }}
        animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
        transition={{
          duration: 0.65,
          ease: [0.16, 1, 0.3, 1],
          layout: { type: 'spring', stiffness: 360, damping: 34 },
        }}
        onMouseLeave={handleNavLeave}
        style={{
          backdropFilter: 'blur(22px) saturate(190%)',
          WebkitBackdropFilter: 'blur(22px) saturate(190%)',
        }}
        className={`pointer-events-auto relative flex items-center justify-between transition-colors duration-500 ${
          scrolled
            ? 'w-full max-w-[900px] rounded-full bg-white/85 px-4 py-2 shadow-[0_14px_40px_-12px_rgba(15,23,42,0.09),0_2px_6px_-1px_rgba(15,23,42,0.04),inset_0_1px_0_0_rgba(255,255,255,0.95)] border border-slate-200/80'
            : 'w-full max-w-[1140px] rounded-[24px] bg-white/75 px-5 py-2.5 shadow-[0_8px_30px_-10px_rgba(15,23,42,0.06),inset_0_1px_0_0_rgba(255,255,255,0.9)] border border-white/90 ring-1 ring-slate-900/[0.04]'
        }`}
      >
        {/* Top Iridescent Specular Shimmer Line */}
        <div className="pointer-events-none absolute inset-x-8 -top-px h-px bg-gradient-to-r from-transparent via-sky-400/50 to-transparent" />

        {/* LEFT: Brand Logo + Amaranth Wordmark */}
        <a
          href="#"
          onMouseEnter={() => setLogoHovered(true)}
          onMouseLeave={() => setLogoHovered(false)}
          className="group relative flex items-center gap-2.5 pl-1 pr-2 py-1 rounded-xl focus:outline-none"
        >
          <motion.div
            animate={{
              scale: logoHovered ? 1.15 : 0.85,
              opacity: logoHovered ? 0.85 : 0,
            }}
            transition={{ duration: 0.35 }}
            className="pointer-events-none absolute left-1 w-8 h-8 rounded-full bg-sky-400/35 blur-md"
          />

          <motion.div
            animate={{
              rotateY: logoHovered ? 14 : 0,
              rotateX: logoHovered ? -8 : 0,
              scale: logoHovered ? 1.06 : 1,
            }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          >
            <ShaftLogoMark className="w-8 h-8 sm:w-[34px] sm:h-[34px]" />
          </motion.div>

          <div className="flex items-center gap-1.5">
            <span className="text-[22px] sm:text-[24px] font-bold tracking-[-0.02em] text-slate-950 leading-none select-none">
              Shaft
            </span>
            <motion.span
              animate={{
                y: logoHovered ? -1.5 : 0,
                scale: logoHovered ? 1.06 : 1,
              }}
              className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-bold tracking-wider uppercase rounded-full bg-gradient-to-r from-sky-500/10 via-indigo-500/10 to-sky-500/10 text-sky-700 border border-sky-200/70"
            >
              OS
            </motion.span>
          </div>
        </a>

        {/* CENTER: Morphing Glass Pill Navigation Links */}
        <div className="hidden lg:flex items-center gap-0.5 relative px-1.5 py-1 rounded-full bg-slate-100/55 border border-slate-200/50 shadow-inner">
          {NAV_LINKS.map((link) => {
            const isItemHovered = hoveredId === link.id;
            const isMegaActive = openMegaId === link.id;
            const shouldFocusBlur = hoveredId !== null && !isItemHovered;

            return (
              <a
                key={link.id}
                href={link.href || `#${link.id}`}
                onMouseEnter={() => handleNavEnter(link)}
                style={{
                  filter: shouldFocusBlur ? 'blur(0.65px)' : 'blur(0px)',
                  opacity: shouldFocusBlur ? 0.52 : 1,
                }}
                className="relative px-3.5 py-1.5 rounded-full text-[14.5px] font-normal text-slate-700 transition-[filter,opacity,color] duration-200 flex items-center gap-1.5 select-none"
              >
                {(isItemHovered || isMegaActive) && (
                  <motion.span
                    layoutId="shaft-nav-glass-pill"
                    transition={{ type: 'spring', stiffness: 430, damping: 32 }}
                    className="absolute inset-0 rounded-full bg-white shadow-[0_2px_10px_-2px_rgba(14,165,233,0.14),0_1px_2px_rgba(15,23,42,0.06)] border border-sky-100/90 -z-10"
                  >
                    <span className="absolute inset-x-3 top-0 h-px bg-gradient-to-r from-transparent via-sky-400/50 to-transparent" />
                  </motion.span>
                )}

                <KineticText text={link.label} isHovered={isItemHovered} />

                {link.badge && (
                  <span className="px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-sky-100/80 text-sky-700 border border-sky-200/60">
                    {link.badge}
                  </span>
                )}

                {link.hasMega && (
                  <motion.span
                    animate={{
                      rotate: isMegaActive ? 180 : 0,
                      y: isMegaActive ? 0.5 : 0,
                    }}
                    transition={{ type: 'spring', stiffness: 420, damping: 26 }}
                    className="text-slate-400"
                  >
                    <ChevronDown className="w-3.5 h-3.5 stroke-[2.2]" />
                  </motion.span>
                )}
              </a>
            );
          })}
        </div>

        {/* RIGHT: Subtle Command Pill + Shimmer Primary Action */}
        <div className="hidden md:flex items-center gap-2">
          <a
            href="#signin"
            className="relative px-3.5 py-1.5 rounded-full text-[14px] font-normal text-slate-600 hover:text-slate-950 transition-colors"
          >
            Sign in
          </a>

          <motion.a
            href="#get-started"
            whileHover={{ scale: 1.025, y: -1 }}
            whileTap={{ scale: 0.975 }}
            className="group relative inline-flex items-center gap-2 rounded-full p-[1px] overflow-hidden shadow-[0_8px_20px_-6px_rgba(14,165,233,0.45)]"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-sky-400 via-indigo-500 to-sky-400 rounded-full opacity-90 group-hover:opacity-100 transition-opacity" />
            <span className="relative flex items-center gap-1.5 rounded-full bg-slate-950 px-4 py-1.5 text-[13.5px] font-bold text-white transition-all group-hover:bg-slate-900">
              <span className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-tr from-sky-400/20 via-transparent to-indigo-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span>Start Building</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-sky-300 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </span>
          </motion.a>
        </div>

        {/* MOBILE MENU BUTTON */}
        <div className="flex lg:hidden items-center gap-2">
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle Menu"
            className="relative flex h-9 w-9 items-center justify-center rounded-full bg-slate-100/80 hover:bg-white text-slate-800 border border-slate-200/80 shadow-sm transition-colors"
          >
            <AnimatePresence mode="wait" initial={false}>
              {mobileOpen ? (
                <motion.span
                  key="close"
                  initial={{ rotate: -90, opacity: 0, filter: 'blur(4px)' }}
                  animate={{ rotate: 0, opacity: 1, filter: 'blur(0px)' }}
                  exit={{ rotate: 90, opacity: 0, filter: 'blur(4px)' }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="w-4 h-4" />
                </motion.span>
              ) : (
                <motion.span
                  key="menu"
                  initial={{ rotate: 90, opacity: 0, filter: 'blur(4px)' }}
                  animate={{ rotate: 0, opacity: 1, filter: 'blur(0px)' }}
                  exit={{ rotate: -90, opacity: 0, filter: 'blur(4px)' }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu className="w-4 h-4" />
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </motion.nav>

      {/* DESKTOP MEGA MENU POPOVER */}
      <AnimatePresence>
        {activeMegaData && activeMegaData.featured && activeMegaData.items && (
          <motion.div
            key={activeMegaData.id}
            onMouseEnter={handleMegaEnter}
            onMouseLeave={handleMegaLeave}
            initial={{ opacity: 0, y: -10, scale: 0.97, filter: 'blur(12px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -8, scale: 0.975, filter: 'blur(10px)' }}
            transition={{ type: 'spring', stiffness: 410, damping: 32 }}
            style={{
              backdropFilter: 'blur(26px) saturate(200%)',
              WebkitBackdropFilter: 'blur(26px) saturate(200%)',
            }}
            className="pointer-events-auto hidden lg:block mt-2.5 w-full max-w-[820px] rounded-[26px] bg-white/85 border border-white/95 ring-1 ring-slate-900/[0.06] shadow-[0_28px_70px_-15px_rgba(15,23,42,0.14),0_4px_16px_-4px_rgba(56,189,248,0.08)] p-4 overflow-hidden relative"
          >
            <div className="pointer-events-none absolute -top-20 -right-20 w-56 h-56 rounded-full bg-sky-300/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -left-20 w-56 h-56 rounded-full bg-indigo-300/15 blur-3xl" />

            <div className="grid grid-cols-12 gap-4 relative z-10">
              {/* Left 7 cols: Interactive Feature Cards */}
              <div className="col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {activeMegaData.items.map((item, idx) => (
                  <MegaMenuCard key={item.title} item={item} index={idx} />
                ))}
              </div>

              {/* Right 5 cols: Featured Glass Highlight Panel */}
              <motion.div
                initial={{ opacity: 0, x: 10, filter: 'blur(6px)' }}
                animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.3, delay: 0.06 }}
                className="col-span-5 flex flex-col justify-between rounded-2xl p-5 bg-gradient-to-br from-sky-50/90 via-white to-indigo-50/70 border border-sky-200/70 shadow-inner relative overflow-hidden group"
              >
                <div className="pointer-events-none absolute -right-6 -bottom-6 opacity-20 group-hover:opacity-35 group-hover:scale-110 transition-all duration-500">
                  <ShaftLogoMark className="w-36 h-36" />
                </div>

                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/90 border border-sky-200/80 text-[10px] font-bold tracking-wider text-sky-700 uppercase shadow-sm">
                    <Sparkles className="w-3 h-3 text-sky-500" />
                    {activeMegaData.featured.tag}
                  </div>
                  <h4 className="mt-3 text-lg font-bold text-slate-900 leading-snug">
                    {activeMegaData.featured.title}
                  </h4>
                  <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                    {activeMegaData.featured.subtitle}
                  </p>
                </div>

                <div className="mt-5 pt-3.5 border-t border-sky-200/60 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[11px] font-bold text-slate-700">
                      {activeMegaData.featured.metric}
                    </span>
                  </div>
                  <a
                    href="#explore"
                    className="inline-flex items-center gap-1 text-xs font-bold text-sky-600 hover:text-sky-800 transition-colors"
                  >
                    {activeMegaData.featured.cta}
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </motion.div>
            </div>

            {/* Bottom Micro Status Bar */}
            <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500 px-1">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-sky-500" />
                  <code className="font-mono text-[11px] text-slate-700">npx create-shaft@latest</code>
                </span>
                <span className="hidden sm:inline text-slate-300">•</span>
                <span className="hidden sm:inline">Full TypeScript & Edge Native support</span>
              </div>
              <a href="#docs" className="text-slate-700 hover:text-sky-600 font-bold transition-colors">
                Read Documentation →
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MOBILE DRAWER */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.96, filter: 'blur(12px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -10, scale: 0.96, filter: 'blur(10px)' }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            style={{
              backdropFilter: 'blur(24px) saturate(190%)',
              WebkitBackdropFilter: 'blur(24px) saturate(190%)',
            }}
            className="pointer-events-auto lg:hidden mt-2.5 w-full max-w-[540px] rounded-3xl bg-white/90 border border-slate-200/80 shadow-[0_24px_48px_-12px_rgba(15,23,42,0.14)] p-4 overflow-hidden"
          >
            <div className="space-y-1">
              {NAV_LINKS.map((link, i) => (
                <motion.a
                  key={link.id}
                  href={link.href || `#${link.id}`}
                  initial={{ opacity: 0, x: -10, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                  transition={{ delay: i * 0.045 }}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-base font-bold text-slate-800 hover:bg-sky-50/80 hover:text-sky-950 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    {link.label}
                    {link.badge && (
                      <span className="px-2 py-0.5 text-[10px] rounded-full bg-sky-100 text-sky-700">
                        {link.badge}
                      </span>
                    )}
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-slate-400" />
                </motion.a>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200/70 grid grid-cols-2 gap-2.5">
              <a
                href="#signin"
                className="flex items-center justify-center py-2.5 rounded-2xl text-sm font-bold text-slate-700 bg-slate-100/80 hover:bg-slate-200/70 transition-colors"
              >
                Sign in
              </a>
              <a
                href="#get-started"
                className="flex items-center justify-center gap-1.5 py-2.5 rounded-2xl text-sm font-bold text-white bg-slate-950 hover:bg-slate-900 shadow-md transition-colors"
              >
                <span>Start Building</span>
                <ArrowUpRight className="w-4 h-4 text-sky-300" />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

export default Navbar;
