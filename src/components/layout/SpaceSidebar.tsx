import { useEffect, useState } from "react"
import type { ReactNode } from "react"
import { ArrowLeft, ChevronLeft, ChevronRight, Clock3, FolderKanban, LayoutDashboard, Link2, Settings2 } from "lucide-react"
import type { ShaftProject } from "../../lib/onboarding"

export type SpaceTab = "dashboard" | "resources" | "history" | "settings"

interface SpaceSidebarProps {
  space: ShaftProject
  activeTab: SpaceTab
  onNavigate: (tab: SpaceTab) => void
  onBack: () => void
  children: ReactNode
}

const tabs: { id: SpaceTab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "resources", label: "Resources", icon: Link2 },
  { id: "history", label: "History", icon: Clock3 },
  { id: "settings", label: "Project Settings", icon: Settings2 },
]

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
    try { window.localStorage.setItem("shaft-space-sidebar-collapsed", String(collapsed)) } catch { /* optional preference */ }
  }, [collapsed])

  return (
    <>
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 bg-[#F5F7FB]">
        <div className="absolute inset-0 opacity-[0.12]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, #78CFC4 1px, transparent 0)", backgroundSize: "40px 40px" }} />
      </div>
      {!collapsed && <button type="button" aria-label="Close navigation" tabIndex={-1} onClick={() => setCollapsed(true)} className="fixed inset-0 z-30 cursor-default lg:hidden" />}
      <aside
        aria-label={space.name + " navigation"}
        className={[
          "fixed z-40 flex flex-col overflow-hidden transition-[left,top,bottom,width,border-radius,background-color,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
          collapsed
            ? "bottom-3 left-3 top-3 w-16 rounded-[32px] border border-black/[0.08] bg-white/80 shadow-[0_6px_24px_rgba(15,23,42,0.06)] backdrop-blur-xl"
            : "bottom-0 left-0 top-0 w-[240px] border-r border-black/[0.08] bg-white shadow-none",
        ].join(" ")}
      >
        <div className="relative mt-2 flex h-14 shrink-0 items-center px-3">
          <img src="/logo.png" alt="" width={40} height={40} className="h-10 w-10 shrink-0 object-contain" />
          <div className={"ml-2 min-w-0 transition-[max-width,opacity] duration-300 " + (collapsed ? "max-w-0 opacity-0" : "max-w-[170px] opacity-100")}>
            <p className="truncate text-sm font-semibold text-[#101319]">{space.name}</p>
            <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#397D76]">Space</p>
          </div>
        </div>

        <button type="button" onClick={onBack} title="All Spaces" className={"mx-3 mt-3 flex h-10 shrink-0 items-center gap-2 rounded-xl px-2.5 text-sm font-medium text-slate-500 transition hover:bg-slate-900/[0.04] hover:text-[#101319] " + (collapsed ? "justify-center" : "")}>
          <ArrowLeft size={17} />
          <span className={collapsed ? "sr-only" : "truncate"}>All Spaces</span>
        </button>

        {!collapsed && <div className="mx-4 mt-4 h-px shrink-0 bg-black/[0.07]" />}
        <div className={"overflow-hidden px-4 transition-[max-height,opacity,margin] duration-300 " + (collapsed ? "mt-3 max-h-0 opacity-0" : "mt-5 max-h-6 opacity-100")}>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Space workspace</p>
        </div>

        <nav aria-label="Space pages" className="mt-3 flex flex-1 flex-col gap-1 px-[10px]">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const active = activeTab === tab.id
            return (
              <a
                key={tab.id}
                href={"/workspace/spaces/" + encodeURIComponent(space.id) + "/" + tab.id}
                aria-current={active ? "page" : undefined}
                title={collapsed ? tab.label : undefined}
                onClick={(event) => {
                  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
                  event.preventDefault()
                  onNavigate(tab.id)
                }}
                className={"group relative flex h-11 shrink-0 items-center gap-3 rounded-xl px-3 text-sm font-medium transition " + (collapsed ? "justify-center" : "") + (active ? " bg-slate-900/[0.06] text-[#101319]" : " text-slate-500 hover:bg-slate-900/[0.04] hover:text-[#101319]")}
              >
                {active && <span aria-hidden="true" className="absolute -left-[10px] bottom-2 top-2 w-[3px] rounded-r-full bg-gradient-to-b from-[#43B5FF] to-[#9A8CFF]" />}
                <Icon size={19} strokeWidth={1.8} className="shrink-0" />
                <span className={collapsed ? "sr-only" : "truncate"}>{tab.label}</span>
              </a>
            )
          })}
        </nav>

        <div className="px-[10px] pb-3">
          <button type="button" onClick={() => setCollapsed((value) => !value)} aria-label={collapsed ? "Expand Space sidebar" : "Collapse Space sidebar"} aria-expanded={!collapsed} className={"flex h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-medium text-slate-500 transition hover:bg-slate-900/[0.04] hover:text-[#101319] " + (collapsed ? "justify-center" : "")}>
            {collapsed ? <ChevronRight size={19} /> : <ChevronLeft size={19} />}
            <span className={collapsed ? "sr-only" : ""}>{collapsed ? "Expand" : "Collapse"}</span>
          </button>
        </div>
      </aside>

      <div style={{ left: collapsed ? "80px" : "204px" }} className="fixed inset-y-2 right-0 z-50 overflow-hidden rounded-l-[28px] shadow-[-12px_0_32px_rgba(15,23,42,0.14)] transition-[left,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]">
        {children}
      </div>
    </>
  )
}
