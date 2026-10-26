import { useMemo, useState, type ReactNode } from "react"
import type { User } from "firebase/auth"
import type {
  ShaftProject,
  ShaftUserData,
  SpaceResourceProvider,
} from "../../lib/onboarding"

type SimpleRoute =
  | "overview"
  | "spaces"
  | "artifacts"
  | "tasks"
  | "connectors"
  | "settings"
  | "profile"

type ConnectorInfo = {
  connected: boolean
  label?: string
  reconnectRequired?: boolean
}

const displayFont = { fontFamily: "Amaranth, sans-serif" }

const PROVIDERS: {
  id: SpaceResourceProvider
  name: string
  short: string
  role: string
  accent: string
  softBg: string
  border: string
}[] = [
  {
    id: "github",
    name: "GitHub",
    short: "GH",
    role: "Repositories, branches & PR context",
    accent: "#1E5BFF",
    softBg: "#EEF4FF",
    border: "#D6E4FF",
  },
  {
    id: "vercel",
    name: "Vercel",
    short: "VC",
    role: "Edge builds, previews & domains",
    accent: "#43B5FF",
    softBg: "#EBF8FF",
    border: "#CBEBFF",
  },
  {
    id: "supabase",
    name: "Supabase",
    short: "SB",
    role: "Postgres schema, auth & storage",
    accent: "#9A8CFF",
    softBg: "#F3F0FF",
    border: "#E2DCFF",
  },
]

/* -------------------------------------------------------------------------- */
/*                    BESPOKE GEOMETRIC & BRAND SVG MARKS                     */
/* -------------------------------------------------------------------------- */

function ShaftMark({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 28 28" fill="none" aria-hidden="true" className={className}>
      <defs>
        <linearGradient id="shaft-fin-1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#CBEBFF" />
          <stop offset="100%" stopColor="#1E5BFF" />
        </linearGradient>
        <linearGradient id="shaft-fin-2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E2DCFF" />
          <stop offset="55%" stopColor="#9A8CFF" />
          <stop offset="100%" stopColor="#43B5FF" />
        </linearGradient>
        <linearGradient id="shaft-fin-3" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1E5BFF" />
          <stop offset="100%" stopColor="#CBEBFF" />
        </linearGradient>
      </defs>
      <path d="M3 3.5L9.5 7.2V20.8L3 24.5V3.5Z" fill="url(#shaft-fin-1)" />
      <path d="M12 6.8L17.5 9.4V18.6L12 21.2V6.8Z" fill="url(#shaft-fin-2)" />
      <path d="M20 9.2L24.5 10.6V17.4L20 18.8V9.2Z" fill="url(#shaft-fin-3)" />
    </svg>
  )
}

function ProviderGlyph({
  provider,
  className = "h-4 w-4",
}: {
  provider: SpaceResourceProvider
  className?: string
}) {
  if (provider === "github") {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
        <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z" />
      </svg>
    )
  }
  if (provider === "vercel") {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
        <path d="M12 3.5L22 20.5H2L12 3.5Z" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M13.3 2.3c.5-.6 1.5-.2 1.5.6v7.6h5.4c.8 0 1.2.9.7 1.5l-8.2 9.7c-.5.6-1.5.2-1.5-.6v-7.6H5.8c-.8 0-1.2-.9-.7-1.5l8.2-9.7Z" />
    </svg>
  )
}

function ArrowUpRightSvg({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4.5 11.5L11.5 4.5M6 4.5h5.5V10" />
    </svg>
  )
}

function PlusSvg({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className={className}>
      <path d="M8 3.2v9.6M3.2 8h9.6" />
    </svg>
  )
}

function SearchSvg({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" className={className}>
      <circle cx="7.2" cy="7.2" r="4.6" />
      <path d="m10.7 10.7 2.8 2.8" />
    </svg>
  )
}

/* -------------------------------------------------------------------------- */
/*                        DATE & TELEMETRY HELPERS                            */
/* -------------------------------------------------------------------------- */

function formatRelativeTime(iso: string): string {
  const time = Date.parse(iso)
  if (Number.isNaN(time)) return "—"
  const diffSec = Math.max(0, Math.floor((Date.now() - time) / 1000))
  if (diffSec < 60) return "Just now"
  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `${diffHr}h ago`
  const diffDays = Math.floor(diffHr / 24)
  if (diffDays < 30) return `${diffDays}d ago`
  return new Date(time).toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function formatShortDate(iso: string): string {
  const time = Date.parse(iso)
  if (Number.isNaN(time)) return "—"
  return new Date(time).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

/* -------------------------------------------------------------------------- */
/*                  UNIVERSAL SHAFT OVERVIEW (`/workspace/overview`)          */
/* -------------------------------------------------------------------------- */

export function OverviewPage({
  data,
  displayName,
  connectedTools,
  connectorStatuses,
  onCreate,
  onNavigate,
  onOpenSpace,
}: {
  data: ShaftUserData
  displayName: string
  connectedTools: number
  connectorStatuses?: Partial<Record<SpaceResourceProvider, ConnectorInfo>>
  onCreate: () => void
  onNavigate: (route: SimpleRoute) => void
  onOpenSpace: (id: string) => void
}) {
  const [spaceFilter, setSpaceFilter] = useState<"all" | "linked" | "unlinked">("all")
  const [searchQuery, setSearchQuery] = useState("")

  const analytics = useMemo(() => {
    const projects = [...data.projects].sort(
      (a, b) => (Date.parse(b.createdAt) || 0) - (Date.parse(a.createdAt) || 0)
    )

    const resourceCounts: Record<SpaceResourceProvider, number> = {
      github: 0,
      vercel: 0,
      supabase: 0,
    }

    let linkedSpacesCount = 0
    let totalResources = 0

    type GlobalFeedItem = {
      id: string
      type: "space" | "resource" | "history"
      title: string
      detail: string
      spaceId: string
      spaceName: string
      timestamp: string
      provider?: SpaceResourceProvider
    }

    const feed: GlobalFeedItem[] = []

    for (const space of projects) {
      const resList = Array.isArray(space.resources) ? space.resources : []
      const histList = Array.isArray(space.history) ? space.history : []

      if (resList.length > 0) linkedSpacesCount += 1
      totalResources += resList.length

      feed.push({
        id: `space-${space.id}`,
        type: "space",
        title: `Initialized Space "${space.name}"`,
        detail: space.description,
        spaceId: space.id,
        spaceName: space.name,
        timestamp: space.createdAt,
      })

      for (const res of resList) {
        if (res.provider in resourceCounts) {
          resourceCounts[res.provider] += 1
        }
        feed.push({
          id: `res-${space.id}-${res.id}`,
          type: "resource",
          title: `Bound ${res.provider.toUpperCase()} resource · ${res.name}`,
          detail: res.detail || res.url || `Linked to ${space.name}`,
          spaceId: space.id,
          spaceName: space.name,
          timestamp: res.linkedAt || space.createdAt,
          provider: res.provider,
        })
      }

      for (const ev of histList) {
        feed.push({
          id: `hist-${space.id}-${ev.id}`,
          type: "history",
          title: ev.title,
          detail: ev.detail || `Logged in ${space.name}`,
          spaceId: space.id,
          spaceName: space.name,
          timestamp: ev.createdAt || space.createdAt,
        })
      }
    }

    feed.sort((a, b) => (Date.parse(b.timestamp) || 0) - (Date.parse(a.timestamp) || 0))

    // Build 14-day activity cadence buckets
    const dayMs = 86_400_000
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const buckets = Array.from({ length: 14 }, (_, idx) => {
      const dayStart = todayStart.getTime() - (13 - idx) * dayMs
      const dayEnd = dayStart + dayMs
      const count = feed.filter((item) => {
        const t = Date.parse(item.timestamp)
        return !Number.isNaN(t) && t >= dayStart && t < dayEnd
      }).length
      const label = new Date(dayStart).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
      return { label, count }
    })

    const maxBucket = Math.max(1, ...buckets.map((b) => b.count))

    return {
      projects,
      resourceCounts,
      linkedSpacesCount,
      unlinkedSpacesCount: Math.max(0, projects.length - linkedSpacesCount),
      totalResources,
      totalEvents: feed.length,
      feed: feed.slice(0, 8),
      buckets,
      maxBucket,
    }
  }, [data.projects])

  const filteredSpaces = useMemo(() => {
    return analytics.projects.filter((space) => {
      const hasResources = (space.resources?.length || 0) > 0
      if (spaceFilter === "linked" && !hasResources) return false
      if (spaceFilter === "unlinked" && hasResources) return false
      if (!searchQuery.trim()) return true
      const q = searchQuery.toLowerCase()
      return (
        space.name.toLowerCase().includes(q) ||
        space.description.toLowerCase().includes(q) ||
        (space.resources || []).some((r) => r.name.toLowerCase().includes(q))
      )
    })
  }, [analytics.projects, spaceFilter, searchQuery])

  const stackReadinessPct = Math.round((connectedTools / 3) * 100)
  const spaceCoveragePct =
    analytics.projects.length > 0
      ? Math.round((analytics.linkedSpacesCount / analytics.projects.length) * 100)
      : 0

  return (
    <div className="space-y-6">
      {/* 1. MACRO COMMAND HEADER & SYSTEM TELEMETRY BAR */}
      <header className="relative overflow-hidden rounded-[26px] border border-slate-200/90 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.03)] sm:p-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full opacity-25 blur-3xl"
          style={{
            background: "radial-gradient(circle, #43B5FF 0%, #9A8CFF 65%, transparent 100%)",
          }}
        />
        <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <div className="inline-flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#43B5FF]/30 bg-[#EEF4FF] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#1E5BFF]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#1E5BFF]" />
                SHAFT Universal Control Plane
              </span>
              <span className="rounded-full border border-slate-200 bg-[#F8FAFD] px-2.5 py-1 text-[11px] font-medium text-slate-500 tabular-nums">
                {analytics.projects.length} {analytics.projects.length === 1 ? "Space" : "Spaces"} · {connectedTools}/3 Providers Online
              </span>
            </div>

            <h1
              className="mt-4 text-3xl font-bold tracking-[-0.03em] text-[#101319] sm:text-[42px] sm:leading-[1.06]"
              style={displayFont}
            >
              Workspace Command, {displayName.split(/\s+/)[0]}.
            </h1>
            <p className="mt-2.5 text-sm leading-6 text-slate-500 sm:text-[15px]">
              Macro telemetry across all your SHAFT Spaces, connected repositories, edge deployments, and database instances. Select any Space below to enter its dedicated workbench.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => onNavigate("connectors")}
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200/90 bg-[#F8FAFD] px-4 text-xs font-semibold text-[#101319] transition hover:border-[#43B5FF]/50 hover:bg-white"
            >
              <span className="flex -space-x-1">
                <span className="h-2 w-2 rounded-full bg-[#1E5BFF]" />
                <span className="h-2 w-2 rounded-full bg-[#43B5FF]" />
                <span className="h-2 w-2 rounded-full bg-[#9A8CFF]" />
              </span>
              Configure Stack ({connectedTools}/3)
            </button>
            <button
              type="button"
              onClick={onCreate}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#101319] px-5 text-xs font-semibold text-white shadow-[0_10px_24px_rgba(16,19,25,0.18)] transition hover:-translate-y-0.5 hover:bg-[#1B2230]"
            >
              <PlusSvg className="h-3.5 w-3.5 text-[#43B5FF]" />
              Initialize Space
            </button>
          </div>
        </div>
      </header>

      {/* 2. 4-COLUMN ANALYTICAL KPI & TELEMETRY MATRIX */}
      <section aria-label="Workspace telemetry" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* Card 01: Total Spaces & Stack Coverage */}
        <article className="flex flex-col justify-between rounded-2xl border border-slate-200/85 bg-white p-5 shadow-[0_2px_10px_rgba(15,23,42,0.02)]">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                01 / Spaces Fleet
              </span>
              <span className="rounded-md bg-[#EEF4FF] px-2 py-0.5 text-[11px] font-semibold text-[#1E5BFF] tabular-nums">
                {spaceCoveragePct}% stack-bound
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2.5">
              <span className="text-3xl font-bold tracking-tight text-[#101319] tabular-nums">
                {analytics.projects.length}
              </span>
              <span className="text-xs font-medium text-slate-500">
                {analytics.linkedSpacesCount} with cloud bindings
              </span>
            </div>
          </div>

          <div className="mt-5">
            <div className="flex h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#1E5BFF] to-[#43B5FF] transition-all duration-500"
                style={{
                  width: `${analytics.projects.length === 0 ? 0 : Math.max(8, spaceCoveragePct)}%`,
                }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 tabular-nums">
              <span>{analytics.linkedSpacesCount} active topologies</span>
              <span>{analytics.unlinkedSpacesCount} awaiting links</span>
            </div>
          </div>
        </article>

        {/* Card 02: Infrastructure Bridge Health */}
        <article className="flex flex-col justify-between rounded-2xl border border-slate-200/85 bg-white p-5 shadow-[0_2px_10px_rgba(15,23,42,0.02)]">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                02 / Provider Bridge
              </span>
              <span className="rounded-md bg-[#F3F0FF] px-2 py-0.5 text-[11px] font-semibold text-[#6E59F7] tabular-nums">
                {stackReadinessPct}% ready
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2.5">
              <span className="text-3xl font-bold tracking-tight text-[#101319] tabular-nums">
                {connectedTools}
                <span className="text-lg font-medium text-slate-400"> / 3</span>
              </span>
              <span className="text-xs font-medium text-slate-500">
                Core connectors online
              </span>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-1.5">
            {PROVIDERS.map((p) => {
              const st = connectorStatuses?.[p.id]
              const isConnected = !!st?.connected
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => onNavigate("connectors")}
                  className={`flex items-center justify-between rounded-lg border px-2.5 py-1.5 text-left transition ${
                    isConnected
                      ? "border-[#43B5FF]/35 bg-[#F5F9FF] text-[#101319]"
                      : "border-slate-200/80 bg-slate-50/70 text-slate-400 hover:border-slate-300"
                  }`}
                >
                  <span className="text-[11px] font-semibold">{p.short}</span>
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      st?.reconnectRequired
                        ? "bg-amber-500"
                        : isConnected
                        ? "bg-[#1E5BFF]"
                        : "bg-slate-300"
                    }`}
                  />
                </button>
              )
            })}
          </div>
        </article>

        {/* Card 03: Bound Cloud Resources Distribution */}
        <article className="flex flex-col justify-between rounded-2xl border border-slate-200/85 bg-white p-5 shadow-[0_2px_10px_rgba(15,23,42,0.02)]">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                03 / Bound Endpoints
              </span>
              <span className="text-[11px] font-medium text-slate-400 tabular-nums">
                Across all Spaces
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2.5">
              <span className="text-3xl font-bold tracking-tight text-[#101319] tabular-nums">
                {analytics.totalResources}
              </span>
              <span className="text-xs font-medium text-slate-500">
                Repos, deployments & DBs
              </span>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex h-2 w-full gap-0.5 overflow-hidden rounded-full bg-slate-100">
              {PROVIDERS.map((p) => {
                const count = analytics.resourceCounts[p.id]
                const widthPct =
                  analytics.totalResources > 0
                    ? (count / analytics.totalResources) * 100
                    : 33.33
                return (
                  <div
                    key={p.id}
                    style={{
                      width: `${widthPct}%`,
                      backgroundColor: analytics.totalResources > 0 ? p.accent : "#E2E8F0",
                    }}
                    className="h-full transition-all duration-500"
                  />
                )
              })}
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 tabular-nums">
              <span className="inline-flex items-center gap-1">
                <i className="h-1.5 w-1.5 rounded-full bg-[#1E5BFF]" />
                GH {analytics.resourceCounts.github}
              </span>
              <span className="inline-flex items-center gap-1">
                <i className="h-1.5 w-1.5 rounded-full bg-[#43B5FF]" />
                VC {analytics.resourceCounts.vercel}
              </span>
              <span className="inline-flex items-center gap-1">
                <i className="h-1.5 w-1.5 rounded-full bg-[#9A8CFF]" />
                SB {analytics.resourceCounts.supabase}
              </span>
            </div>
          </div>
        </article>

        {/* Card 04: 14-Day Workspace Cadence Spark-Histogram */}
        <article className="flex flex-col justify-between rounded-2xl border border-slate-200/85 bg-white p-5 shadow-[0_2px_10px_rgba(15,23,42,0.02)]">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                04 / 14d Velocity
              </span>
              <span className="text-[11px] font-medium text-slate-400 tabular-nums">
                Telemetry events
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2.5">
              <span className="text-3xl font-bold tracking-tight text-[#101319] tabular-nums">
                {analytics.totalEvents}
              </span>
              <span className="text-xs font-medium text-slate-500">
                Recorded operations
              </span>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex h-8 items-end gap-1" aria-label="14 day activity cadence">
              {analytics.buckets.map((b, i) => {
                const heightPct = b.count > 0 ? Math.max(24, (b.count / analytics.maxBucket) * 100) : 14
                return (
                  <div
                    key={b.label + i}
                    title={`${b.label}: ${b.count} event${b.count === 1 ? "" : "s"}`}
                    className="flex-1 rounded-t-sm transition-all"
                    style={{
                      height: `${heightPct}%`,
                      background:
                        b.count > 0
                          ? "linear-gradient(180deg, #43B5FF 0%, #1E5BFF 100%)"
                          : "#E9EEF6",
                    }}
                  />
                )
              })}
            </div>
            <div className="mt-1.5 flex items-center justify-between text-[10px] font-medium text-slate-400">
              <span>{analytics.buckets[0]?.label}</span>
              <span>Today</span>
            </div>
          </div>
        </article>
      </section>

      {/* 3. PRIMARY 12-COLUMN ANALYTICAL SPLIT: CROSS-SPACE MATRIX + INFRASTRUCTURE RAIL */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* LEFT 8 COLUMNS: UNIVERSAL SPACE TOPOLOGY MATRIX */}
        <section className="flex flex-col rounded-[24px] border border-slate-200/90 bg-white shadow-[0_4px_20px_rgba(15,23,42,0.025)] lg:col-span-8">
          <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:px-6">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold tracking-tight text-[#101319]" style={displayFont}>
                  Cross-Space Topology Matrix
                </h2>
                <span className="rounded-full bg-[#EEF4FF] px-2.5 py-0.5 text-xs font-semibold text-[#1E5BFF] tabular-nums">
                  {filteredSpaces.length}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-slate-500">
                Inspect provider bindings, telemetry volume, and launch directly into any Space dashboard.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex rounded-xl border border-slate-200/80 bg-[#F5F7FB] p-0.5 text-xs">
                {(
                  [
                    { id: "all", label: "All" },
                    { id: "linked", label: "Stack Linked" },
                    { id: "unlinked", label: "Needs Setup" },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setSpaceFilter(tab.id)}
                    className={`rounded-lg px-2.5 py-1 font-semibold transition ${
                      spaceFilter === tab.id
                        ? "bg-white text-[#101319] shadow-sm"
                        : "text-slate-500 hover:text-[#101319]"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => onNavigate("spaces")}
                className="inline-flex h-8 items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition hover:border-[#43B5FF] hover:text-[#101319]"
              >
                Directory <ArrowUpRightSvg className="h-3 w-3" />
              </button>
            </div>
          </div>

          {/* Search & Column Subheader */}
          <div className="flex flex-col gap-3 border-b border-slate-100 bg-[#FAFBFD] px-5 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <label className="flex h-9 w-full max-w-xs items-center gap-2 rounded-lg border border-slate-200/90 bg-white px-3 text-slate-400 focus-within:border-[#43B5FF]">
              <SearchSvg className="h-3.5 w-3.5 shrink-0" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter Spaces or bound repos…"
                className="w-full bg-transparent text-xs text-[#101319] outline-none placeholder:text-slate-400"
              />
            </label>
            <div className="hidden items-center gap-6 text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400 md:flex">
              <span>Stack Bindings</span>
              <span>Events</span>
              <span>Created</span>
              <span className="w-20 text-right">Workbench</span>
            </div>
          </div>

          {/* Matrix Rows */}
          {filteredSpaces.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center px-6 py-14 text-center">
              <div className="grid h-12 w-12 place-items-center rounded-2xl border border-[#D6E4FF] bg-[#EEF4FF]">
                <ShaftMark className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-base font-bold text-[#101319]" style={displayFont}>
                {analytics.projects.length === 0
                  ? "No Spaces initialized in SHAFT yet"
                  : "No Spaces match this filter"}
              </h3>
              <p className="mt-1.5 max-w-sm text-xs leading-5 text-slate-500">
                {analytics.projects.length === 0
                  ? "Create your first Space to unify its GitHub repository, Vercel deployments, and Supabase backend inside a dedicated dashboard."
                  : "Try switching the filter tab or clearing your search query."}
              </p>
              {analytics.projects.length === 0 && (
                <button
                  type="button"
                  onClick={onCreate}
                  className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-[#101319] px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-[#1B2230]"
                >
                  <PlusSvg className="h-3.5 w-3.5 text-[#43B5FF]" />
                  Initialize First Space
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredSpaces.map((space, idx) => {
                const resources = space.resources || []
                const historyCount = (space.history?.length || 0) + resources.length
                return (
                  <div
                    key={space.id}
                    onClick={() => onOpenSpace(space.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault()
                        onOpenSpace(space.id)
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    className="group flex flex-col justify-between gap-4 px-5 py-4 transition hover:bg-[#F8FAFF] focus-visible:bg-[#F8FAFF] focus-visible:outline-none sm:px-6 md:flex-row md:items-center"
                  >
                    {/* Space Identity */}
                    <div className="flex min-w-0 flex-1 items-start gap-3.5">
                      <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-[#D6E4FF] bg-gradient-to-br from-[#EEF4FF] to-[#F3F0FF] text-xs font-bold text-[#1E5BFF] tabular-nums">
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="truncate text-sm font-semibold text-[#101319] group-hover:text-[#1E5BFF]">
                            {space.name}
                          </h3>
                          {resources.length > 0 ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-[#EEF4FF] px-2 py-0.5 text-[10px] font-semibold text-[#1E5BFF]">
                              <span className="h-1.5 w-1.5 rounded-full bg-[#1E5BFF]" />
                              Active Stack
                            </span>
                          ) : (
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                              Unlinked
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">
                          {space.description}
                        </p>
                      </div>
                    </div>

                    {/* Right Telemetry Columns */}
                    <div className="flex flex-wrap items-center justify-between gap-4 md:justify-end md:gap-6">
                      {/* Provider Badges */}
                      <div className="flex items-center gap-1.5">
                        {PROVIDERS.map((p) => {
                          const bound = resources.filter((r) => r.provider === p.id)
                          const isBound = bound.length > 0
                          return (
                            <span
                              key={p.id}
                              title={
                                isBound
                                  ? `${p.name}: ${bound.map((b) => b.name).join(", ")}`
                                  : `${p.name}: Not linked in this Space`
                              }
                              className={`inline-flex h-7 items-center gap-1 rounded-lg border px-2 text-[11px] font-semibold transition ${
                                isBound
                                  ? "border-[#43B5FF]/40 bg-[#EEF4FF] text-[#101319]"
                                  : "border-slate-200/80 bg-slate-50 text-slate-400"
                              }`}
                            >
                              <ProviderGlyph provider={p.id} className="h-3 w-3" />
                              <span>{p.short}</span>
                              {bound.length > 1 && (
                                <span className="text-[10px] text-[#1E5BFF] tabular-nums">
                                  ×{bound.length}
                                </span>
                              )}
                            </span>
                          )
                        })}
                      </div>

                      {/* Event Count */}
                      <div className="w-14 text-left md:text-right">
                        <span className="text-xs font-semibold text-[#101319] tabular-nums">
                          {historyCount}
                        </span>
                        <span className="ml-1 text-[11px] text-slate-400">ops</span>
                      </div>

                      {/* Timestamp */}
                      <div className="w-16 text-right text-xs text-slate-400 tabular-nums">
                        {formatRelativeTime(space.createdAt)}
                      </div>

                      {/* Launch Workbench Button */}
                      <span className="inline-flex h-8 items-center gap-1 rounded-lg border border-slate-200/90 bg-white px-2.5 text-xs font-semibold text-[#101319] shadow-2xs transition group-hover:border-[#1E5BFF] group-hover:bg-[#101319] group-hover:text-white">
                        Open
                        <ArrowUpRightSvg className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* RIGHT 4 COLUMNS: DEEP NAVY STACK PLANE + GLOBAL EVENT STREAM */}
        <aside className="flex flex-col gap-6 lg:col-span-4">
          {/* Deep Navy Infrastructure Control Plane (Matches Home.tsx #product section) */}
          <section
            className="relative overflow-hidden rounded-[24px] p-6 text-white shadow-[0_14px_34px_rgba(5,11,31,0.22)]"
            style={{
              background: "linear-gradient(180deg, #050B1F 0%, #07123A 100%)",
            }}
          >
            <div aria-hidden="true" className="pointer-events-none absolute inset-0">
              <div className="absolute -left-16 -top-16 h-44 w-44 rounded-full bg-[#1E5BFF] opacity-35 blur-3xl" />
              <div className="absolute -right-12 bottom-0 h-48 w-48 rounded-full bg-[#9A8CFF] opacity-25 blur-3xl" />
            </div>

            <div className="relative">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#43B5FF]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#43B5FF]" />
                  Stack Control Plane
                </span>
                <button
                  type="button"
                  onClick={() => onNavigate("connectors")}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-slate-300 transition hover:text-white"
                >
                  Manage <ArrowUpRightSvg className="h-3 w-3" />
                </button>
              </div>

              <h2 className="mt-2 text-xl font-bold tracking-tight" style={displayFont}>
                Unified Service Bridge
              </h2>
              <p className="mt-1 text-xs leading-5 text-slate-300/85">
                Global OAuth & API bridges available to every Space in your workspace.
              </p>

              <div className="mt-5 space-y-2.5">
                {PROVIDERS.map((p) => {
                  const status = connectorStatuses?.[p.id]
                  const connected = !!status?.connected
                  const boundCount = analytics.resourceCounts[p.id]

                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => onNavigate("connectors")}
                      className="group flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/[0.05] px-3.5 py-3 text-left backdrop-blur-xs transition hover:border-[#43B5FF]/50 hover:bg-white/[0.09]"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/15 text-white"
                          style={{
                            background: connected
                              ? `linear-gradient(135deg, ${p.accent}33, ${p.accent}15)`
                              : "rgba(255,255,255,0.04)",
                          }}
                        >
                          <ProviderGlyph provider={p.id} className="h-4 w-4" />
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-white">{p.name}</span>
                            {status?.label && (
                              <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-medium text-[#43B5FF]">
                                {status.label}
                              </span>
                            )}
                          </div>
                          <p className="mt-0.5 text-[11px] text-slate-400">
                            {boundCount > 0
                              ? `Bound in ${boundCount} Space resource${boundCount === 1 ? "" : "s"}`
                              : p.role}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                          status?.reconnectRequired
                            ? "bg-amber-400/15 text-amber-300"
                            : connected
                            ? "bg-[#43B5FF]/20 text-[#43B5FF]"
                            : "bg-white/10 text-slate-300"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            status?.reconnectRequired
                              ? "bg-amber-400"
                              : connected
                              ? "bg-[#43B5FF]"
                              : "bg-slate-400"
                          }`}
                        />
                        {status?.reconnectRequired
                          ? "Reconnect"
                          : connected
                          ? "Online"
                          : "Connect"}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          </section>

          {/* Global Cross-Space Activity Stream */}
          <section className="flex flex-1 flex-col rounded-[24px] border border-slate-200/90 bg-white p-5 shadow-[0_4px_20px_rgba(15,23,42,0.025)] sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold tracking-tight text-[#101319]" style={displayFont}>
                  Global Activity Stream
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  Cross-space operations & bindings
                </p>
              </div>
              <span className="rounded-lg bg-[#F3F0FF] px-2 py-1 text-[11px] font-semibold text-[#6E59F7] tabular-nums">
                Live Ledger
              </span>
            </div>

            {analytics.feed.length === 0 ? (
              <div className="my-auto py-8 text-center">
                <p className="text-xs font-medium text-slate-400">
                  No workspace events recorded yet.
                </p>
              </div>
            ) : (
              <ol className="mt-5 space-y-3.5">
                {analytics.feed.map((item) => (
                  <li key={item.id} className="group relative flex items-start gap-3">
                    <span
                      className={`mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-lg border text-[10px] font-bold ${
                        item.type === "resource"
                          ? "border-[#CBEBFF] bg-[#EBF8FF] text-[#1E5BFF]"
                          : item.type === "history"
                          ? "border-[#E2DCFF] bg-[#F3F0FF] text-[#6E59F7]"
                          : "border-[#D6E4FF] bg-[#EEF4FF] text-[#1E5BFF]"
                      }`}
                    >
                      {item.provider ? (
                        <ProviderGlyph provider={item.provider} className="h-3 w-3" />
                      ) : (
                        "S"
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => onOpenSpace(item.spaceId)}
                          className="truncate text-left text-xs font-semibold text-[#101319] transition hover:text-[#1E5BFF]"
                        >
                          {item.title}
                        </button>
                        <span className="shrink-0 text-[10px] text-slate-400 tabular-nums">
                          {formatRelativeTime(item.timestamp)}
                        </span>
                      </div>
                      <p className="mt-0.5 truncate text-[11px] text-slate-500">
                        <span className="font-medium text-slate-600">{item.spaceName}</span> · {item.detail}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </aside>
      </div>

      {/* 4. END-TO-END SHAFT WORKFLOW ARCHITECTURE PIPELINE */}
      <section
        aria-label="SHAFT Architecture Pipeline"
        className="grid gap-3 rounded-[24px] border border-slate-200/90 bg-white p-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {(
          [
            {
              step: "STAGE 01",
              title: "Spaces & Persistent Context",
              metric: `${analytics.projects.length} Active`,
              desc: "Isolated project environments with dedicated dashboards.",
              route: "spaces" as SimpleRoute,
              accent: "#1E5BFF",
            },
            {
              step: "STAGE 02",
              title: "Connected Stack Fabric",
              metric: `${connectedTools}/3 Linked`,
              desc: "GitHub code, Vercel previews, and Supabase data in sync.",
              route: "connectors" as SimpleRoute,
              accent: "#43B5FF",
            },
            {
              step: "STAGE 03",
              title: "Task & Agent Orchestration",
              metric: "Queue View",
              desc: "Cross-space execution tracking and recovery workflows.",
              route: "tasks" as SimpleRoute,
              accent: "#9A8CFF",
            },
            {
              step: "STAGE 04",
              title: "Artifacts & Deliverables",
              metric: "Output Vault",
              desc: "Generated specs, builds, and project references.",
              route: "artifacts" as SimpleRoute,
              accent: "#1E5BFF",
            },
          ] as const
        ).map((item) => (
          <button
            key={item.step}
            type="button"
            onClick={() => onNavigate(item.route)}
            className="group flex flex-col justify-between rounded-2xl border border-slate-100 bg-[#F8FAFD] p-4 text-left transition hover:border-[#43B5FF]/40 hover:bg-white hover:shadow-sm"
          >
            <div>
              <div className="flex items-center justify-between">
                <span
                  className="text-[10px] font-bold tracking-[0.14em]"
                  style={{ color: item.accent }}
                >
                  {item.step}
                </span>
                <span className="rounded-md bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-600 shadow-2xs tabular-nums">
                  {item.metric}
                </span>
              </div>
              <h3 className="mt-2 text-sm font-semibold text-[#101319] group-hover:text-[#1E5BFF]">
                {item.title}
              </h3>
              <p className="mt-1 text-xs leading-5 text-slate-500">{item.desc}</p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-[11px] font-semibold text-slate-600 group-hover:text-[#1E5BFF]">
              Open module <ArrowUpRightSvg className="h-3 w-3" />
            </div>
          </button>
        ))}
      </section>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*                       SPACES DIRECTORY (`/workspace/spaces`)               */
/* -------------------------------------------------------------------------- */

export function SpacesPage({
  projects,
  onCreate,
  onOpenSpace,
}: {
  projects: ShaftProject[]
  onCreate: () => void
  onOpenSpace: (id: string) => void
}) {
  const [query, setQuery] = useState("")
  const filtered = projects.filter((project) =>
    (project.name + " " + project.description).toLowerCase().includes(query.toLowerCase())
  )
  return (
    <section>
      <PageIntro
        eyebrow="Workspace fleet"
        title="My Spaces"
        description="Every Space has its own dedicated dashboard, connected services, and execution history."
        action={
          <button
            type="button"
            onClick={onCreate}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#101319] px-4 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(16,19,25,0.16)] transition hover:bg-[#1B2230]"
          >
            <PlusSvg className="h-4 w-4 text-[#43B5FF]" /> New Space
          </button>
        }
      />
      <label className="mt-7 flex h-11 max-w-md items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3.5 text-slate-400 focus-within:border-[#43B5FF] focus-within:ring-4 focus-within:ring-[#43B5FF]/15">
        <SearchSvg className="h-4 w-4" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search Spaces by name or stack…"
          className="w-full bg-transparent text-sm text-[#101319] outline-none placeholder:text-slate-400"
        />
      </label>
      <ProjectList projects={filtered} onCreate={onCreate} onOpen={onOpenSpace} />
    </section>
  )
}

/* -------------------------------------------------------------------------- */
/*                    ARTIFACTS & TASKS (`/workspace/artifacts`, `/tasks`)    */
/* -------------------------------------------------------------------------- */

export function ArtifactsPage() {
  return (
    <Placeholder
      eyebrow="Output vault"
      title="A unified home for every project artifact."
      text="Artifacts aggregates generated architecture specs, code diffs, deployment snapshots, and deliverables across all of your Spaces into one searchable index."
      badge="Cross-Space Library"
    />
  )
}

export function TasksPage() {
  return (
    <Placeholder
      eyebrow="Execution engine"
      title="Cross-space task & agent orchestration."
      text="Track multi-step engineering tasks, coding-agent runs, and deployment verifications across every Space without switching browser tabs."
      badge="Orchestration Queue"
    />
  )
}

/* -------------------------------------------------------------------------- */
/*                  SETTINGS & PROFILE (`/workspace/settings`, `/profile`)    */
/* -------------------------------------------------------------------------- */

export function SettingsPage({
  data,
  user,
  onSignOut,
  signingOut,
}: {
  data: ShaftUserData
  user: User
  onSignOut: () => void
  signingOut: boolean
}) {
  return (
    <section className="max-w-3xl">
      <PageIntro
        eyebrow="Workspace preferences"
        title="Settings"
        description="Manage your SHAFT identity, cloud persistence, and session controls."
      />
      <div className="mt-7 grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="grid h-10 w-10 place-items-center rounded-xl border border-[#D6E4FF] bg-[#EEF4FF] text-[#1E5BFF]">
            <ShaftMark className="h-5 w-5" />
          </div>
          <h2 className="mt-4 font-semibold text-[#101319]">Account Identity</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Signed in as {user.email || user.displayName || "your SHAFT account"}.
          </p>
          <p className="mt-3 text-xs text-slate-400">
            Profile and identity details are accessible from the top navigation bar.
          </p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="grid h-10 w-10 place-items-center rounded-xl border border-[#E2DCFF] bg-[#F3F0FF] text-[#6E59F7]">
            <span className="text-xs font-bold tabular-nums">{data.projects.length}</span>
          </div>
          <h2 className="mt-4 font-semibold text-[#101319]">Cloud Sync & State</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            {data.projects.length} Spaces · Workspace topology and project metadata are synced with Firebase Cloud Firestore.
          </p>
        </article>
      </div>
      <button
        type="button"
        onClick={onSignOut}
        disabled={signingOut}
        className="mt-6 h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-[#101319] disabled:opacity-50"
      >
        {signingOut ? "Signing out…" : "Sign out"}
      </button>
    </section>
  )
}

export function ProfilePage({ data, user }: { data: ShaftUserData; user: User }) {
  const displayName =
    data.name || user.displayName || (user.email ? user.email.split("@")[0] : "Builder")
  const initials =
    displayName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "S"

  return (
    <section className="max-w-3xl">
      <PageIntro
        eyebrow="Your account"
        title="Profile"
        description="Your builder identity and workspace credentials in SHAFT."
      />
      <div className="mt-7 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xs">
        <div
          className="h-24"
          style={{
            background:
              "linear-gradient(135deg, #050B1F 0%, #1E5BFF 55%, #9A8CFF 100%)",
          }}
        />
        <div className="px-6 pb-6">
          <div className="-mt-10 grid h-20 w-20 place-items-center overflow-hidden rounded-full border-4 border-white bg-[#EEF4FF] text-xl font-bold text-[#1E5BFF] shadow-sm">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt=""
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover"
              />
            ) : (
              initials
            )}
          </div>
          <h2
            className="mt-4 text-2xl font-bold tracking-tight text-[#101319]"
            style={displayFont}
          >
            {displayName}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {user.email || "No email supplied by your sign-in provider"}
          </p>
          <div className="mt-6 grid gap-4 border-t border-slate-100 pt-5 sm:grid-cols-2">
            <ProfileField label="Name" value={displayName} />
            <ProfileField label="Role" value={data.role || "Builder"} />
            <ProfileField label="Active Spaces" value={String(data.projects.length)} />
            <ProfileField
              label="Authentication Provider"
              value={
                user.providerData
                  .map((provider) => provider.providerId.replace(".com", ""))
                  .join(", ") || "Firebase Authentication"
              }
            />
          </div>
        </div>
      </div>
    </section>
  )
}

/* -------------------------------------------------------------------------- */
/*                              SHARED SUBCOMPONENTS                          */
/* -------------------------------------------------------------------------- */

function PageIntro({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.17em] text-[#1E5BFF]">
          {eyebrow}
        </p>
        <h1
          className="mt-3 text-4xl font-bold tracking-[-0.04em] text-[#101319] sm:text-5xl"
          style={displayFont}
        >
          {title}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">{description}</p>
      </div>
      {action}
    </div>
  )
}

function Placeholder({
  eyebrow,
  title,
  text,
  badge,
}: {
  eyebrow: string
  title: string
  text: string
  badge: string
}) {
  return (
    <section className="mx-auto flex min-h-[52vh] max-w-2xl flex-col items-start justify-center py-10">
      <div className="flex items-center gap-3">
        <span className="grid h-12 w-12 place-items-center rounded-2xl border border-[#D6E4FF] bg-white shadow-xs">
          <ShaftMark className="h-6 w-6" />
        </span>
        <span className="rounded-full border border-[#43B5FF]/30 bg-[#EEF4FF] px-3 py-1 text-xs font-semibold text-[#1E5BFF]">
          {badge}
        </span>
      </div>
      <p className="mt-6 text-xs font-semibold uppercase tracking-[0.17em] text-[#1E5BFF]">
        {eyebrow}
      </p>
      <h1
        className="mt-3 text-3xl font-bold tracking-[-0.03em] text-[#101319] sm:text-4xl"
        style={displayFont}
      >
        {title}
      </h1>
      <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">{text}</p>
    </section>
  )
}

function ProjectList({
  projects,
  onCreate,
  onOpen,
}: {
  projects: ShaftProject[]
  onCreate: () => void
  onOpen?: (id: string) => void
}) {
  if (projects.length === 0) {
    return (
      <div className="mt-6 flex min-h-56 flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white/70 px-6 py-12 text-center">
        <span className="grid h-12 w-12 place-items-center rounded-2xl border border-[#D6E4FF] bg-[#EEF4FF]">
          <ShaftMark className="h-6 w-6" />
        </span>
        <h3 className="mt-4 text-lg font-bold text-[#101319]" style={displayFont}>
          No Spaces found
        </h3>
        <p className="mt-1.5 max-w-sm text-sm leading-6 text-slate-500">
          Initialize a Space to give your product or engineering project its own dedicated dashboard.
        </p>
        <button
          type="button"
          onClick={onCreate}
          className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-[#101319] px-4 text-xs font-semibold text-white transition hover:bg-[#1B2230]"
        >
          <PlusSvg className="h-3.5 w-3.5 text-[#43B5FF]" /> Start a Space
        </button>
      </div>
    )
  }

  return (
    <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {projects.map((project) => {
        const resources = project.resources || []
        return (
          <button
            type="button"
            key={project.id}
            onClick={() => onOpen?.(project.id)}
            aria-label={"Open Space " + project.name}
            className="group flex flex-col justify-between rounded-2xl border border-slate-200/85 bg-white p-5 text-left transition hover:-translate-y-0.5 hover:border-[#43B5FF]/60 hover:shadow-[0_12px_28px_rgba(30,91,255,0.06)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#43B5FF]"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl border border-[#D6E4FF] bg-[#EEF4FF]">
                  <ShaftMark className="h-5 w-5" />
                </span>
                <span className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-500 tabular-nums">
                  {formatShortDate(project.createdAt)}
                </span>
              </div>
              <h3 className="mt-4 text-base font-bold text-[#101319] group-hover:text-[#1E5BFF]">
                {project.name}
              </h3>
              <p className="mt-2 line-clamp-3 min-h-[60px] text-sm leading-5 text-slate-500">
                {project.description}
              </p>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
              <div className="flex items-center gap-1.5">
                {PROVIDERS.map((p) => {
                  const active = resources.some((r) => r.provider === p.id)
                  return (
                    <span
                      key={p.id}
                      className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${
                        active
                          ? "bg-[#EEF4FF] text-[#1E5BFF]"
                          : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {p.short}
                    </span>
                  )
                })}
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#101319] group-hover:text-[#1E5BFF]">
                Dashboard <ArrowUpRightSvg className="h-3.5 w-3.5" />
              </span>
            </div>
          </button>
        )
      })}
    </div>
  )
}

function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="mt-1 break-words text-sm font-medium text-slate-700">{value}</dd>
    </div>
  )
}
