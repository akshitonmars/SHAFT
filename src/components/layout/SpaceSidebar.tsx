import { useEffect, useState } from "react"
import type { CSSProperties, ReactNode } from "react"
import type { ShaftProject } from "../../lib/onboarding"

export type SpaceTab = "dashboard" | "resources" | "history" | "settings"

interface SpaceSidebarProps {
  space: ShaftProject
  activeTab: SpaceTab
  onNavigate: (tab: SpaceTab) => void
  onBack: () => void
  children: ReactNode
}

const TABS: { id: SpaceTab; label: string }[] = [
  { id: "dashboard", label: "Dashboard" },
  { id: "resources", label: "Resources" },
  { id: "history", label: "History" },
  { id: "settings", label: "Project Settings" },
]

/* Same drawing style and motion language as the workspace sidebar. */
const ICONS: Record<SpaceTab | "back", ReactNode> = {
  back: <path className="sb-back" d="M19 12H6M11 6l-6 6 6 6" />,
  dashboard: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="3" />
      <path d="M4 9.5h16" />
      <path className="sb-split" d="M10 9.5V20" />
    </>
  ),
  resources: (
    <g className="sb-link">
      <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" />
      <path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />
    </g>
  ),
  history: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path className="sb-hand" d="M12 7.5V12l3 2" />
    </>
  ),
  settings: (
    <>
      <path d="M7 4v16M12 4v16M17 4v16" />
      <circle className="sb-v sb-v1" cx="7" cy="9" r="2.1" fill="currentColor" />
      <circle className="sb-v sb-v2" cx="12" cy="15" r="2.1" fill="currentColor" />
      <circle className="sb-v sb-v3" cx="17" cy="8" r="2.1" fill="currentColor" />
    </>
  ),
}

const CSS = `
.sb-ic { width: 20px; height: 20px; flex: none; overflow: visible; }
.sb-ic * { transform-box: fill-box; transform-origin: center; }
.sb-ic .sb-hand { transform-box: view-box; transform-origin: 12px 12px; }
@keyframes sbSpin { to { transform: rotate(360deg); } }
@keyframes sbLink { 0%, 100% { transform: rotate(0); } 50% { transform: rotate(-16deg); } }
.sb-split, .sb-back, .sb-v, .sb-chev { transition: transform 0.45s cubic-bezier(0.22, 1, 0.36, 1); }
.sb-item:hover .sb-hand, .sb-item:focus-visible .sb-hand { animation: sbSpin 0.9s cubic-bezier(0.22, 1, 0.36, 1); }
.sb-item:hover .sb-link, .sb-item:focus-visible .sb-link { animation: sbLink 0.6s ease; }
.sb-item:hover .sb-split, .sb-item:focus-visible .sb-split { transform: translateX(4px); }
.sb-item:hover .sb-back, .sb-item:focus-visible .sb-back { transform: translateX(-3px); }
.sb-item:hover .sb-v1, .sb-item:focus-visible .sb-v1 { transform: translateY(5px); }
.sb-item:hover .sb-v2, .sb-item:focus-visible .sb-v2 { transform: translateY(-5px); }
.sb-item:hover .sb-v3, .sb-item:focus-visible .sb-v3 { transform: translateY(6px); }
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

export default function SpaceSidebar({ space, activeTab, onNavigate, onBack, children }: SpaceSidebarProps) {
  const [collapsed, setCollapsed] = useState(() => {
    try {
      const saved = window.localStorage.getItem("shaft-space-sidebar-collapsed")
      return saved === null ? window.matchMedia("(max-width: 1023px)").matches : saved === "true"
    } catch {
      return window.matchMedia("(max-width: 1023px)").matches
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem("shaft-space-sidebar-collapsed", String(collapsed))
    } catch {
      /* optional preference */
    }
  }, [collapsed])

  const itemBase =
    "sb-item group relative flex h-10 w-full items-center px-3 text-sm font-medium outline-none transition-[background-color,color,border-radius] duration-300 focus-visible:ring-2 focus-visible:ring-[#43B5FF]"
  const shape = collapsed ? "rounded-full" : "rounded-lg"
  const tone = (active: boolean) =>
    active ? "bg-slate-900/[0.06] text-[#101319]" : "text-slate-500 hover:bg-slate-900/[0.04] hover:text-[#101319]"
  const label = (text: string) => (
    <span className={`overflow-hidden whitespace-nowrap transition-[max-width,opacity,margin] duration-500 ${collapsed ? "ml-0 max-w-0 opacity-0" : "ml-3 max-w-[160px] opacity-100"}`}>{text}</span>
  )
  const tip = (text: string) =>
    collapsed && (
      <span role="tooltip" className="pointer-events-none absolute left-[calc(100%+16px)] top-1/2 z-50 -translate-y-1/2 whitespace-nowrap rounded-lg border border-black/[0.08] bg-white px-3 py-1.5 text-xs font-medium text-[#101319] opacity-0 shadow-[0_8px_24px_rgba(15,23,42,0.12)] transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100">
        {text}
      </span>
    )

  return (
    <>
      <style>{CSS}</style>
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 bg-[#F5F7FB]">
        <div className="absolute inset-0 opacity-[0.12]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, #78CFC4 1px, transparent 0)", backgroundSize: "40px 40px" }} />
      </div>
      {!collapsed && <button type="button" aria-label="Close navigation" tabIndex={-1} onClick={() => setCollapsed(true)} className="fixed inset-0 z-30 cursor-default lg:hidden" />}

      <aside
        aria-label={space.name + " navigation"}
        style={{ borderRadius: collapsed ? 32 : 0 }}
        className={[
          "fixed z-40 flex flex-col transition-[left,top,bottom,width,border-radius,background-color,border-color,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
          collapsed
            ? "bottom-3 left-3 top-3 w-16 border border-black/[0.08] bg-white/75 shadow-[0_6px_24px_rgba(15,23,42,0.06)] backdrop-blur-xl"
            : "bottom-0 left-0 top-0 w-[240px] border-r border-black/[0.08] bg-white shadow-[0_0_0_rgba(15,23,42,0)]",
        ].join(" ")}
      >
        <span aria-hidden="true" style={SHINE} className={`pointer-events-none absolute inset-0 transition-opacity duration-500 ${collapsed ? "opacity-100" : "opacity-0"}`} />

        {/* Brand: logo always, space name only when expanded */}
        <div className="relative mt-2 flex h-14 shrink-0 items-center pl-3">
          <a href="/" aria-label="Shaft home" className="shrink-0 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-[#43B5FF]">
            <img src="/logo.png" alt="" width={44} height={44} className="h-10 w-10 object-contain transition-transform duration-300 hover:scale-105" />
          </a>
          <p
            title={space.name}
            className={`min-w-0 overflow-hidden truncate whitespace-nowrap py-1 pr-3 text-[22px] font-bold leading-[1.3] tracking-[-0.02em] text-[#101319] transition-[max-width,opacity,margin] duration-500 ${collapsed ? "ml-0 max-w-0 opacity-0" : "ml-3 max-w-[160px] opacity-100"}`}
            style={{ fontFamily: "Amaranth, sans-serif" }}
          >
            {space.name}
          </p>
        </div>

        <div aria-hidden="true" className="mx-4 mt-3 h-px bg-black/[0.07]" />
        <div className={`overflow-hidden px-[22px] transition-[max-height,opacity,margin] duration-500 ${collapsed ? "mt-0 max-h-0 opacity-0" : "mt-5 max-h-6 opacity-100"}`}>
          <h2 className="text-[13px] font-semibold text-slate-400">Space</h2>
        </div>

        <nav aria-label="Space pages" className="mt-3 flex flex-1 flex-col gap-1 px-[10px]">
          <button type="button" onClick={onBack} aria-label={collapsed ? "All Spaces" : undefined} className={`${itemBase} ${shape} ${tone(false)}`}>
            <Ico>{ICONS.back}</Ico>
            {label("All Spaces")}
            {tip("All Spaces")}
          </button>
          <div aria-hidden="true" className="mx-3 my-1 h-px bg-black/[0.07]" />

          {TABS.map((tab) => {
            const active = activeTab === tab.id
            return (
              <a
                key={tab.id}
                href={"/workspace/spaces/" + encodeURIComponent(space.id) + "/" + tab.id}
                aria-current={active ? "page" : undefined}
                aria-label={collapsed ? tab.label : undefined}
                onClick={(event) => {
                  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
                  event.preventDefault()
                  onNavigate(tab.id)
                }}
                className={`${itemBase} ${shape} ${tone(active)}`}
              >
                {active && <span aria-hidden="true" className="absolute -left-[10px] bottom-2 top-2 w-[3px] rounded-r-full bg-gradient-to-b from-[#43B5FF] to-[#9A8CFF]" />}
                <Ico>{ICONS[tab.id]}</Ico>
                {label(tab.label)}
                {tip(tab.label)}
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
            className={`${itemBase} ${shape} ${tone(false)}`}
          >
            <Ico style={{ transform: collapsed ? "rotate(180deg)" : "none", transition: "transform 0.5s cubic-bezier(0.22,1,0.36,1)" }}>
              <path className="sb-chev" d="m13 7-5 5 5 5M18 7l-5 5 5 5" />
            </Ico>
            {label("Collapse")}
          </button>
        </div>
      </aside>

      <div style={{ left: collapsed ? "80px" : "204px" }} className="fixed inset-y-2 right-0 z-50 overflow-hidden rounded-l-[28px] shadow-[-12px_0_32px_rgba(15,23,42,0.14)] transition-[left,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]">
        {children}
      </div>
    </>
  )
}
