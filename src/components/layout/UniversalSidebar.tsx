import { useEffect, useState, type ReactNode } from "react"
import { signOut } from "firebase/auth"
import {
  ChevronLeft,
  ChevronRight,
  Files,
  LayoutDashboard,
  Layers3,
  ListTodo,
  LogOut,
  PlugZap,
  Settings,
} from "lucide-react"
import { auth } from "../../lib/firebase"

export type UniversalSidebarItem =
  | "Overview"
  | "My Spaces"
  | "Artifacts"
  | "Tasks"
  | "Connectors"
  | "Settings"

interface UniversalSidebarProps {
  children: ReactNode
  activeItem: UniversalSidebarItem
  displayName?: string
  role?: string
  onSignOut?: () => void
  signingOut?: boolean
  overlayOpen?: boolean
}

const navItems: {
  label: UniversalSidebarItem
  description: string
  href: string
  icon: typeof LayoutDashboard
}[] = [
  { label: "Overview", description: "Workspace home", href: "/workspace?view=overview", icon: LayoutDashboard },
  { label: "My Spaces", description: "Your workspaces", href: "/workspace?view=spaces", icon: Layers3 },
  { label: "Artifacts", description: "Files and outputs", href: "/workspace?view=artifacts", icon: Files },
  { label: "Tasks", description: "Things to move forward", href: "/workspace?view=tasks", icon: ListTodo },
  { label: "Connectors", description: "Your connected tools", href: "/workspace?view=connectors", icon: PlugZap },
  { label: "Settings", description: "Account preferences", href: "/workspace?view=settings", icon: Settings },
]

export default function UniversalSidebar({
  children,
  activeItem,
  displayName = "Builder",
  role = "SHAFT workspace",
  onSignOut,
  signingOut = false,
  overlayOpen = false,
}: UniversalSidebarProps) {
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return typeof window !== "undefined" && window.localStorage.getItem("shaft-universal-sidebar-collapsed") === "true"
    } catch {
      return false
    }
  })
  const [localSigningOut, setLocalSigningOut] = useState(false)
  const [signOutError, setSignOutError] = useState(false)
  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "S"

  useEffect(() => {
    try {
      window.localStorage.setItem("shaft-universal-sidebar-collapsed", String(collapsed))
    } catch {
      // The sidebar remains usable when browser storage is unavailable.
    }
  }, [collapsed])

  const toggleCollapsed = () => setCollapsed((current) => !current)

  const handleSignOut = async () => {
    setSignOutError(false)
    if (onSignOut) {
      onSignOut()
      return
    }
    setLocalSigningOut(true)
    try {
      await signOut(auth)
      window.location.replace("/signin")
    } catch {
      setSignOutError(true)
      setLocalSigningOut(false)
    }
  }

  const panelHidden = collapsed || overlayOpen

  return (
    <>
      {!collapsed && !overlayOpen && (
        <button
          type="button"
          aria-label="Close navigation sidebar"
          className="fixed inset-0 z-30 bg-slate-950/15 backdrop-blur-[1px] lg:hidden"
          onClick={() => setCollapsed(true)}
        />
      )}

      <aside
        aria-label="Universal workspace sidebar"
        className={[
          "fixed bottom-3 left-0 top-[76px] flex w-[272px] flex-col overflow-hidden rounded-r-[28px] border-y border-r border-slate-200/80 bg-white/95 shadow-[0_16px_48px_rgba(15,23,42,0.12)] backdrop-blur-2xl transition-[transform,box-shadow] duration-300 ease-out",
          panelHidden
            ? "-translate-x-[calc(100%-18px)] z-10 shadow-none"
            : "translate-x-0 z-40",
        ].join(" ")}
      >
        <div className="flex items-center justify-between gap-3 px-4 pb-4 pt-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[#101319] text-sm font-bold text-white" style={{ fontFamily: "Amaranth, sans-serif" }}>
              S
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold tracking-tight text-[#101319]">SHAFT</p>
              <p className="mt-0.5 truncate text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">Workspace</p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Collapse navigation sidebar"
            aria-expanded={!collapsed}
            onClick={toggleCollapsed}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-[#101319]"
          >
            <ChevronLeft size={18} />
          </button>
        </div>

        <div className="mx-4 mb-4 flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-[#F8FAFC] p-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-[#D9ECE8] bg-[#EAF7F4] text-xs font-semibold text-[#245C55]">
            {initials}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[#101319]">{displayName}</p>
            <p className="mt-0.5 truncate text-xs text-slate-500">{role}</p>
          </div>
        </div>

        <p className="px-5 pb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
          Workspace
        </p>
        <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3 pb-4" aria-label="Universal navigation">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = activeItem === item.label
            return (
              <a
                key={item.label}
                href={item.href}
                aria-current={active ? "page" : undefined}
                title={item.label}
                className={[
                  "group flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors",
                  active
                    ? "bg-[#EAF7F4] text-[#245C55] shadow-[inset_2px_0_0_#397D76]"
                    : "text-slate-500 hover:bg-slate-100/90 hover:text-[#101319]",
                ].join(" ")}
              >
                <Icon size={17} strokeWidth={1.8} className="shrink-0" />
                <span className="min-w-0 flex-1 truncate">{item.label}</span>
                {active && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#397D76]" />}
              </a>
            )
          })}
        </nav>

        <div className="mx-3 mb-3 rounded-2xl border border-[#D9ECE8] bg-[#F3FAF8] p-4">
          <p className="text-xs font-semibold text-[#245C55]">Build Beyond Ideas.</p>
          <p className="mt-1.5 text-[11px] leading-5 text-slate-500">
            Keep your spaces, resources, and next steps connected.
          </p>
        </div>
        <div className="px-3 pb-3">
          <button
            type="button"
            onClick={() => void handleSignOut()}
            disabled={signingOut || localSigningOut}
            className="inline-flex h-10 w-full items-center gap-3 rounded-xl px-3 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-[#101319] disabled:opacity-50"
          >
            <LogOut size={16} />
            {signingOut || localSigningOut ? "Signing out…" : "Sign out"}
          </button>
          {signOutError && <p role="alert" className="px-3 pb-2 text-xs text-red-600">Sign out failed. Try again.</p>}
        </div>
      </aside>

      {collapsed && !overlayOpen && (
        <button
          type="button"
          aria-label="Expand navigation sidebar"
          title="Open navigation"
          aria-expanded="false"
          onClick={toggleCollapsed}
          className="fixed left-0 top-1/2 z-[60] grid h-12 w-7 -translate-y-1/2 place-items-center rounded-r-2xl border border-l-0 border-slate-200 bg-white/95 text-slate-500 shadow-[0_4px_18px_rgba(15,23,42,0.12)] backdrop-blur-xl transition hover:w-9 hover:text-[#101319]"
        >
          <ChevronRight size={17} />
        </button>
      )}

      <div
        className={[
          "relative min-h-screen transition-[margin] duration-300 ease-out",
          collapsed || overlayOpen ? "z-20 ml-0" : "z-10 ml-0 lg:ml-[272px]",
        ].join(" ")}
      >
        {children}
      </div>
    </>
  )
}
