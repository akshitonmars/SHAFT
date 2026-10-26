import { useEffect, useState } from "react"
import type { CSSProperties, ReactNode } from "react"

export type UniversalSidebarItem =
  | "Overview"
  | "My Spaces"
  | "Artifacts"
  | "Tasks"
  | "Connectors"
  | "Settings"

interface UniversalSidebarProps {
  children: ReactNode
  activeItem: UniversalSidebarItem | null
  overlayOpen?: boolean
  /** Called with the item label on a plain click, so the page can switch views without a reload. */
  onNavigate?: (item: string) => void
  /** Kept so existing callers still compile. The sidebar no longer shows these. */
  displayName?: string
  role?: string
  onSignOut?: () => void
  signingOut?: boolean
}

const NAV: { label: UniversalSidebarItem; href: string }[] = [
  { label: "Overview", href: "/workspace/overview" },
  { label: "My Spaces", href: "/workspace/spaces" },
  { label: "Artifacts", href: "/workspace/artifacts" },
  { label: "Tasks", href: "/workspace/tasks" },
  { label: "Connectors", href: "/workspace/connectors" },
  { label: "Settings", href: "/workspace/settings" },
]

const delay = (s: number) => ({ "--d": `${s}s` }) as CSSProperties

/* Each icon has its own motion, played on hover or keyboard focus. */
const ICONS: Record<UniversalSidebarItem, ReactNode> = {
  Overview: (
    <>
      <rect className="sb-q" x="3.5" y="3.5" width="7" height="7" rx="1.8" style={delay(0)} />
      <rect className="sb-q" x="13.5" y="3.5" width="7" height="7" rx="1.8" style={delay(0.06)} />
      <rect className="sb-q" x="13.5" y="13.5" width="7" height="7" rx="1.8" style={delay(0.12)} />
      <rect className="sb-q" x="3.5" y="13.5" width="7" height="7" rx="1.8" style={delay(0.18)} />
    </>
  ),
  "My Spaces": (
    <>
      <path className="sb-lift" d="M12 3.5 20.5 8 12 12.5 3.5 8z" />
      <path d="m3.5 12 8.5 4.5 8.5-4.5" />
      <path d="m3.5 16 8.5 4.5 8.5-4.5" />
    </>
  ),
  Artifacts: (
    <>
      <path d="M7 3.5h6.5L18 8v11.5a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-15a1 1 0 0 1 1-1z" />
      <path d="M13.5 3.5V8H18" />
      <path className="sb-draw" pathLength={1} d="M9 12.5h6" style={delay(0)} />
      <path className="sb-draw" pathLength={1} d="M9 16h4" style={delay(0.12)} />
    </>
  ),
  Tasks: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="4.5" />
      <path className="sb-draw" pathLength={1} d="m8.5 12.3 2.6 2.6 4.6-5.2" />
    </>
  ),
  Connectors: (
    <g className="sb-plug">
      <path d="M9 3.5v4M15 3.5v4" />
      <path d="M7 7.5h10v3.5a5 5 0 0 1-10 0z" />
      <path d="M12 16v4.5" />
    </g>
  ),
  Settings: (
    <>
      <path d="M4 7h16M4 12h16M4 17h16" />
      <circle className="sb-k sb-k1" cx="8" cy="7" r="2.1" fill="currentColor" />
      <circle className="sb-k sb-k2" cx="16" cy="12" r="2.1" fill="currentColor" />
      <circle className="sb-k sb-k3" cx="10" cy="17" r="2.1" fill="currentColor" />
    </>
  ),
}

const CSS = `
.sb-ic { width: 20px; height: 20px; flex: none; overflow: visible; }
.sb-ic * { transform-box: fill-box; transform-origin: center; }
@keyframes sbPop { 0%, 100% { transform: scale(1); } 45% { transform: scale(0.68); } }
@keyframes sbLift { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
@keyframes sbDraw { from { stroke-dashoffset: 1; } to { stroke-dashoffset: 0; } }
@keyframes sbPlug { 0%, 100% { transform: translateY(0); } 40% { transform: translateY(-3px); } 70% { transform: translateY(1.5px); } }
.sb-draw { stroke-dasharray: 1; stroke-dashoffset: 0; }
.sb-k { transition: transform 0.45s cubic-bezier(0.22, 1, 0.36, 1); }
.sb-chev { transition: transform 0.3s ease; }
.sb-item:hover .sb-q, .sb-item:focus-visible .sb-q { animation: sbPop 0.6s ease var(--d, 0s); }
.sb-item:hover .sb-lift, .sb-item:focus-visible .sb-lift { animation: sbLift 0.6s ease; }
.sb-item:hover .sb-draw, .sb-item:focus-visible .sb-draw { animation: sbDraw 0.55s ease var(--d, 0s) backwards; }
.sb-item:hover .sb-plug, .sb-item:focus-visible .sb-plug { animation: sbPlug 0.7s ease; }
.sb-item:hover .sb-k1, .sb-item:focus-visible .sb-k1 { transform: translateX(6px); }
.sb-item:hover .sb-k2, .sb-item:focus-visible .sb-k2 { transform: translateX(-6px); }
.sb-item:hover .sb-k3, .sb-item:focus-visible .sb-k3 { transform: translateX(5px); }
.sb-item:hover .sb-chev, .sb-item:focus-visible .sb-chev { transform: translateX(-2px); }
@media (prefers-reduced-motion: reduce) { .sb-ic *, .sb-item * { animation: none !important; transition: none !important; } }
`

const SHINE: CSSProperties = {
  borderRadius: "inherit",
  padding: "1.5px",
  background:
    "linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0.65) 14%, rgba(255,255,255,0) 36%, rgba(255,255,255,0) 64%, rgba(255,255,255,0.65) 86%, rgba(255,255,255,1) 100%)",
  WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
  WebkitMaskComposite: "xor",
  mask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
  maskComposite: "exclude",
}

function Ico({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="sb-ic" style={style}>
      {children}
    </svg>
  )
}

export default function UniversalSidebar({ children, activeItem, overlayOpen = false, onNavigate }: UniversalSidebarProps) {
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") return false
    try {
      const saved = window.localStorage.getItem("shaft-universal-sidebar-collapsed")
      if (saved !== null) return saved === "true"
    } catch {
      /* storage unavailable: fall back to a viewport-based default */
    }
    return window.matchMedia("(max-width: 1023px)").matches
  })

  useEffect(() => {
    try {
      window.localStorage.setItem("shaft-universal-sidebar-collapsed", String(collapsed))
    } catch {
      /* the sidebar still works without storage */
    }
  }, [collapsed])

  const label = (text: string) => (
    <span className={`overflow-hidden whitespace-nowrap transition-[max-width,opacity,margin] duration-500 ${collapsed ? "ml-0 max-w-0 opacity-0" : "ml-3 max-w-[160px] opacity-100"}`}>{text}</span>
  )
  const itemBase =
    "sb-item group relative flex h-10 w-full items-center px-3 text-sm font-medium outline-none transition-[background-color,color,border-radius] duration-300 focus-visible:ring-2 focus-visible:ring-[#43B5FF]"
  const shape = collapsed ? "rounded-full" : "rounded-lg"

  return (
    <>
      <style>{CSS}</style>
      {/* Light dotted canvas visible around the floating workspace and collapsed sidebar. */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 bg-[#F5F7FB]">
        <div
          className="absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, #78CFC4 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>
      {/* Invisible click-catcher so the overlaid sidebar closes on small screens. */}
      {!collapsed && <button type="button" aria-label="Close navigation" tabIndex={-1} onClick={() => setCollapsed(true)} className="fixed inset-0 z-30 cursor-default lg:hidden" />}

      <aside
        aria-label="Workspace navigation"
        style={{ borderRadius: collapsed ? 32 : 0 }}
        className={[
          "fixed flex flex-col transition-[left,top,bottom,width,border-radius,background-color,border-color,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
          overlayOpen ? "z-10" : "z-40",
          collapsed
            ? "bottom-3 left-3 top-3 w-16 border border-black/[0.08] bg-white/75 shadow-[0_6px_24px_rgba(15,23,42,0.06)] backdrop-blur-xl"
            : "bottom-0 left-0 top-0 w-[240px] border-r border-black/[0.08] bg-white shadow-[0_0_0_rgba(15,23,42,0)]",
        ].join(" ")}
      >
        <span aria-hidden="true" style={SHINE} className={`pointer-events-none absolute inset-0 transition-opacity duration-500 ${collapsed ? "opacity-100" : "opacity-0"}`} />

        {/* Brand: logo always, wordmark only when expanded */}
        <a href="/" aria-label="Shaft home" className="relative mt-2 flex h-14 shrink-0 items-center rounded-lg pl-3 outline-none focus-visible:ring-2 focus-visible:ring-[#43B5FF]">
          <img src="/logo.png" alt="" width={44} height={44} className="h-10 w-10 shrink-0 object-contain transition-transform duration-300 hover:scale-105" />
          <span
            className={`overflow-hidden whitespace-nowrap py-1 text-[28px] font-bold leading-[1.3] tracking-[-0.02em] text-[#101319] transition-[max-width,opacity,margin] duration-500 ${collapsed ? "ml-0 max-w-0 opacity-0" : "ml-3 max-w-[160px] opacity-100"}`}
            style={{ fontFamily: "Amaranth, sans-serif" }}
          >
            Shaft
          </span>
        </a>

        <div aria-hidden="true" className="mx-4 mt-3 h-px bg-black/[0.07]" />
        <div className={`overflow-hidden px-[22px] transition-[max-height,opacity,margin] duration-500 ${collapsed ? "mt-0 max-h-0 opacity-0" : "mt-5 max-h-6 opacity-100"}`}>
          <h2 className="text-[13px] font-semibold text-slate-400">Workspace</h2>
        </div>

        <nav aria-label="Workspace" className="mt-3 flex flex-1 flex-col gap-1 px-[10px]">
          {NAV.map((item) => {
            const active = activeItem === item.label
            return (
              <a
                key={item.label}
                href={item.href}
                aria-current={active ? "page" : undefined}
                onClick={(e) => {
                  if (!onNavigate || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
                  e.preventDefault()
                  onNavigate(item.label)
                }}
                aria-label={collapsed ? item.label : undefined}
                className={`${itemBase} ${shape} ${active ? "bg-slate-900/[0.06] text-[#101319]" : "text-slate-500 hover:bg-slate-900/[0.04] hover:text-[#101319]"}`}
              >
                {active && <span aria-hidden="true" className="absolute -left-[10px] bottom-2 top-2 w-[3px] rounded-r-full bg-gradient-to-b from-[#43B5FF] to-[#9A8CFF]" />}
                <Ico>{ICONS[item.label]}</Ico>
                {label(item.label)}
                {collapsed && (
                  <span role="tooltip" className="pointer-events-none absolute left-[calc(100%+16px)] top-1/2 z-50 -translate-y-1/2 whitespace-nowrap rounded-lg border border-black/[0.08] bg-white px-3 py-1.5 text-xs font-medium text-[#101319] opacity-0 shadow-[0_8px_24px_rgba(15,23,42,0.12)] transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100">
                    {item.label}
                  </span>
                )}
              </a>
            )
          })}
        </nav>

        <div className="px-[10px] pb-3">
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            aria-expanded={!collapsed}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={`${itemBase} ${shape} text-slate-500 hover:bg-slate-900/[0.04] hover:text-[#101319]`}
          >
            <Ico style={{ transform: collapsed ? "rotate(180deg)" : "none", transition: "transform 0.5s cubic-bezier(0.22,1,0.36,1)" }}>
              <path className="sb-chev" d="m13 7-5 5 5 5M18 7l-5 5 5 5" />
            </Ico>
            {label("Collapse")}
          </button>
        </div>
      </aside>

      <div className={`relative z-50 my-2 ml-[80px] h-[calc(100svh-16px)] overflow-hidden rounded-l-[28px] shadow-[-12px_0_32px_rgba(15,23,42,0.14)] transition-[margin,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${collapsed ? "" : "lg:ml-[204px]"}`}>{children}</div>
    </>
  )
}
