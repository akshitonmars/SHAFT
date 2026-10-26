import { useEffect, useState, type FormEvent } from "react"
import type { User } from "firebase/auth"
import { signOut } from "firebase/auth"
import { auth } from "../lib/firebase"
import { loadUserData, readUserData } from "../lib/onboarding"
import { fetchStatus } from "../lib/connectors"
import type { ConnectorId, ConnectorStatus } from "../lib/connectors"
import DashboardNavbar from "../components/layout/DashboardNavbar"
import UniversalSidebar from "../components/layout/UniversalSidebar"
import Loader from "../components/ui/Loader"
import {
  ArtifactsPage, OverviewPage, ProfilePage, SettingsPage, SpacesPage, TasksPage,
} from "./workspace/WorkspaceViews"
import { ConnectorsPage } from "./workspace/ConnectorsPage"
import SpaceWorkspace from "./workspace/SpaceWorkspace"

type WorkspaceRoute = "overview" | "spaces" | "artifacts" | "tasks" | "connectors" | "settings" | "profile"
const routePaths: Record<WorkspaceRoute, string> = {
  overview: "/workspace/overview",
  spaces: "/workspace/spaces",
  artifacts: "/workspace/artifacts",
  tasks: "/workspace/tasks",
  connectors: "/workspace/connectors",
  settings: "/workspace/settings",
  profile: "/workspace/profile",
}
const routeLabels: Record<WorkspaceRoute, string> = {
  overview: "your overview",
  spaces: "your Spaces",
  artifacts: "Artifacts",
  tasks: "Tasks",
  connectors: "Connectors",
  settings: "Settings",
  profile: "your profile",
}
const legacyViews: Record<string, WorkspaceRoute> = {
  overview: "overview",
  spaces: "spaces",
  artifacts: "artifacts",
  tasks: "tasks",
  connectors: "connectors",
  settings: "settings",
}
const connectorIds: ConnectorId[] = ["github", "vercel", "supabase"]

function routeFromLocation(): WorkspaceRoute {
  const params = new URLSearchParams(window.location.search)
  if (params.get("connector") === "supabase") return "connectors"
  const segment = window.location.pathname.split("/")[2]
  if (segment && Object.prototype.hasOwnProperty.call(routePaths, segment)) return segment as WorkspaceRoute
  const legacy = params.get("view")
  if (legacy && legacyViews[legacy]) return legacyViews[legacy]
  return "overview"
}

function routeHref(route: WorkspaceRoute) {
  if (route !== "connectors") return routePaths[route]
  const url = new URL(window.location.href)
  return routePaths.connectors + (url.searchParams.has("tab") ? "?tab=" + url.searchParams.get("tab") : "")
}

function WorkspaceHome({ user, onOpenSpace }: { user: User; onOpenSpace: (id: string) => void }) {
  const [data, setData] = useState(() => readUserData(user.uid))
  const [route, setRoute] = useState<WorkspaceRoute>(routeFromLocation)
  const [cloudReady, setCloudReady] = useState(false)
  const [pageReady, setPageReady] = useState(false)
  const [cloudError, setCloudError] = useState("")
  const [showCreate, setShowCreate] = useState(false)
  const [projectName, setProjectName] = useState("")
  const [description, setDescription] = useState("")
  const [spaceSecret, setSpaceSecret] = useState("")
  const [createError, setCreateError] = useState("")
  const [signingOut, setSigningOut] = useState(false)
  const [connectorStatuses, setConnectorStatuses] = useState<Record<ConnectorId, ConnectorStatus>>({
    github: { connected: false },
    vercel: { connected: false },
    supabase: { connected: false },
  })

  useEffect(() => {
    let active = true
    loadUserData(user.uid).then((next) => {
      if (!active) return
      setData(next)
      setCloudReady(true)
      setCloudError("")
    }).catch((error) => {
      if (!active) return
      setCloudReady(true)
      setCloudError(error instanceof Error ? error.message : "Could not load your cloud workspace. Check your connection and refresh.")
    })
    return () => { active = false }
  }, [user.uid])

  useEffect(() => {
    let active = true
    void Promise.all(connectorIds.map(async (id) => {
      try {
        const state = await fetchStatus(user, id)
        return [id, state] as const
      } catch {
        return [id, { connected: false }] as const
      }
    })).then((entries) => {
      if (active) {
        setConnectorStatuses(Object.fromEntries(entries) as Record<ConnectorId, ConnectorStatus>)
      }
    })
    return () => { active = false }
  }, [user.uid])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const desiredPath = routePaths[route]
    if (window.location.pathname !== desiredPath) {
      if (route === "connectors") {
        if (!params.has("tab")) params.set("tab", "supabase" === params.get("connector") ? "supabase" : "github")
        window.history.replaceState({}, "", desiredPath + "?" + params.toString())
      } else {
        window.history.replaceState({}, "", desiredPath)
      }
    } else if (route === "connectors" && !params.has("tab")) {
      params.set("tab", params.get("connector") === "supabase" ? "supabase" : "github")
      window.history.replaceState({}, "", desiredPath + "?" + params.toString())
    }
  }, [])

  useEffect(() => {
    setPageReady(false)
    const timeout = window.setTimeout(() => setPageReady(true), 280)
    return () => window.clearTimeout(timeout)
  }, [route])

  useEffect(() => {
    const onPopState = () => {
      setPageReady(false)
      setRoute(routeFromLocation())
      setShowCreate(false)
    }
    window.addEventListener("popstate", onPopState)
    return () => window.removeEventListener("popstate", onPopState)
  }, [])

  const navigate = (nextRoute: WorkspaceRoute) => {
    if (nextRoute === route) return
    const href = routeHref(nextRoute)
    window.history.pushState({}, "", href)
    setPageReady(false)
    setRoute(nextRoute)
    setShowCreate(false)
    setCreateError("")
    document.getElementById("workspace-scroll-container")?.scrollTo({ top: 0, behavior: "auto" })
  }

  const navigateFromSidebar = (item: string) => {
    const mapping: Record<string, WorkspaceRoute> = {
      Overview: "overview",
      "My Spaces": "spaces",
      Artifacts: "artifacts",
      Tasks: "tasks",
      Connectors: "connectors",
      Settings: "settings",
    }
    navigate(mapping[item] || "overview")
  }

  const displayName = data.name || user.displayName || (user.email ? user.email.split("@")[0] : "Builder")
  const initials = displayName.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "S"
  const activeItem = route === "profile" ? null : route === "spaces" ? "My Spaces" : route.charAt(0).toUpperCase() + route.slice(1)
  const connectedTools = connectorIds.filter((id) => connectorStatuses[id]?.connected).length

  const createSpace = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!projectName.trim() || !description.trim()) {
      setCreateError("Add both a Space name and a description.")
      return
    }
    if (!/^\\d{6}$/.test(spaceSecret)) {
      setCreateError("Choose a six-digit Space Secret. It cannot be changed later.")
      return
    }
    try {
      const token = await user.getIdToken()
      const response = await fetch("/api/spaces/identity", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: JSON.stringify({ name: projectName.trim(), description: description.trim(), secret: spaceSecret }),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok || !result.project) throw new Error(result.error || "The Space could not be created.")
      const next = await loadUserData(user.uid)
      setData(next)
      setProjectName("")
      setDescription("")
      setSpaceSecret("")
      setCreateError("")
      setShowCreate(false)
      navigate("spaces")
    } catch (error) {
      setCreateError(error instanceof Error ? error.message : "The Space could not be saved to the cloud. Check your connection and try again.")
    }
  }

  const leave = async () => {
    setSigningOut(true)
    try {
      await signOut(auth)
      window.location.replace("/")
    } catch {
      setCloudError("Sign out failed. Please try again.")
      setSigningOut(false)
    }
  }

  return (
    <UniversalSidebar
      activeItem={activeItem as "Overview" | "My Spaces" | "Artifacts" | "Tasks" | "Connectors" | "Settings" | null}
      displayName={displayName}
      role={data.role || "SHAFT workspace"}
      onSignOut={() => void leave()}
      signingOut={signingOut}
      overlayOpen={showCreate}
      onNavigate={navigateFromSidebar}
    >
      <main id="workspace-scroll-container" className="h-full min-h-0 overflow-y-auto rounded-l-[28px] bg-[#F5F7FB] text-[#101319]" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
        <DashboardNavbar displayName={displayName} initials={initials} photoURL={user.photoURL} onProfileClick={() => navigate("profile")} />
        <div className="mx-auto max-w-[1380px] px-5 pb-12 pt-24 sm:px-8 sm:pb-14 sm:pt-28">
          {cloudError && <div role="alert" className="mb-6 rounded-2xl border border-red-200 bg-white px-4 py-3 text-sm text-red-700">{cloudError}</div>}
          {!cloudReady || !pageReady ? (
            <div className="flex min-h-[60vh] items-center justify-center">
              <Loader size={56} label={cloudReady ? "Opening " + routeLabels[route] + "…" : "Loading your workspace…"} delay={120} />
            </div>
          ) : (
            <>
              {route === "overview" && (
                <OverviewPage
                  data={data}
                  displayName={displayName}
                  connectedTools={connectedTools}
                  connectorStatuses={connectorStatuses}
                  onCreate={() => { setShowCreate(true); setCreateError("") }}
                  onNavigate={navigate}
                  onOpenSpace={onOpenSpace}
                />
              )}
              {route === "spaces" && <SpacesPage projects={data.projects} onCreate={() => { setShowCreate(true); setCreateError("") }} onOpenSpace={onOpenSpace} />}
              {route === "artifacts" && <ArtifactsPage />}
              {route === "tasks" && <TasksPage />}
              {route === "connectors" && <ConnectorsPage user={user} />}
              {route === "settings" && <SettingsPage data={data} user={user} onSignOut={() => void leave()} signingOut={signingOut} />}
              {route === "profile" && <ProfilePage data={data} user={user} />}
            </>
          )}
        </div>

        {showCreate && (
          <div
            className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-[#050B1F]/55 p-4 backdrop-blur-sm"
            role="presentation"
            onMouseDown={(event) => { if (event.target === event.currentTarget) setShowCreate(false) }}
          >
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="create-space-title"
              className="relative my-8 w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200/90 bg-[#F8FAFD] p-6 text-[#101319] shadow-[0_24px_64px_rgba(5,11,31,0.28)] sm:p-8"
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#1E5BFF] via-[#43B5FF] to-[#9A8CFF]"
              />
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="inline-flex items-center gap-2 rounded-full border border-[#43B5FF]/25 bg-[#EEF4FF] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#1E5BFF]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#43B5FF]" />
                    New Space
                  </span>
                  <h2 id="create-space-title" className="mt-3 text-2xl font-bold tracking-tight" style={{ fontFamily: "Amaranth, sans-serif" }}>
                    Initialize a new Space.
                  </h2>
                  <p className="mt-1.5 text-sm leading-6 text-slate-500">
                    Each Space gets its own dedicated dashboard, repository bindings, deployment pipeline, and persistent context.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  aria-label="Close dialog"
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:text-[#101319]"
                >
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" className="h-3.5 w-3.5">
                    <path d="M4 4l8 8M12 4l-8 8" />
                  </svg>
                </button>
              </div>

              <form onSubmit={(event) => void createSpace(event)} className="mt-6 space-y-4">
                <label className="block text-xs font-semibold uppercase tracking-[0.08em] text-slate-600">
                  Space Identifier
                  <input
                    autoFocus
                    value={projectName}
                    onChange={(event) => setProjectName(event.target.value)}
                    maxLength={100}
                    required
                    placeholder="e.g. Nexus Engine"
                    className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-normal text-[#101319] outline-none transition focus:border-[#43B5FF] focus:ring-4 focus:ring-[#43B5FF]/15"
                  />
                </label>
                <label className="block text-xs font-semibold uppercase tracking-[0.08em] text-slate-600">
                  Architecture & Scope
                  <textarea
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    maxLength={1200}
                    required
                    rows={4}
                    placeholder="Describe the product, stack, or objective for this Space..."
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-normal leading-6 text-[#101319] outline-none transition focus:border-[#43B5FF] focus:ring-4 focus:ring-[#43B5FF]/15"
                  />
                </label>
                <label className="block text-xs font-semibold uppercase tracking-[0.08em] text-slate-600">
                  Space Secret · 6 digits
                  <input
                    value={spaceSecret}
                    onChange={(event) => setSpaceSecret(event.target.value.replace(/\\D/g, "").slice(0, 6))}
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    minLength={6}
                    maxLength={6}
                    required
                    type="password"
                    autoComplete="new-password"
                    placeholder="Choose a permanent 6-digit code"
                    className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-normal tracking-[0.25em] text-[#101319] outline-none transition focus:border-[#43B5FF] focus:ring-4 focus:ring-[#43B5FF]/15"
                  />
                  <span className="mt-1.5 block text-[11px] font-normal normal-case tracking-normal text-slate-500">Set once. SHAFT stores a protected hash, not the code itself. Recovery will be added later.</span>
                </label>
                {createError && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{createError}</p>}
                <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => setShowCreate(false)}
                    className="h-11 rounded-xl px-4 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-[#101319]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#101319] px-5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(16,19,25,0.18)] transition hover:bg-[#1B2230]"
                  >
                    Create Space
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
                      <path d="M3.5 8.5l3 3 6-6.5" />
                    </svg>
                  </button>
                </div>
              </form>
            </section>
          </div>
        )}
      </main>
    </UniversalSidebar>
  )
}

function spaceIdFromPath(): string | null {
  const match = window.location.pathname.match(/^\/workspace\/spaces\/([^/]+)(?:\/|$)/)
  if (!match) return null
  try { return decodeURIComponent(match[1]) } catch { return match[1] }
}

export function Workspace({ user }: { user: User }) {
  const [activeSpaceId, setActiveSpaceId] = useState<string | null>(spaceIdFromPath)

  useEffect(() => {
    const syncPath = () => setActiveSpaceId(spaceIdFromPath())
    window.addEventListener("popstate", syncPath)
    return () => window.removeEventListener("popstate", syncPath)
  }, [])

  const openSpace = (id: string) => {
    const path = "/workspace/spaces/" + encodeURIComponent(id) + "/dashboard"
    window.history.pushState({}, "", path)
    setActiveSpaceId(id)
    window.scrollTo({ top: 0, behavior: "auto" })
  }

  const openWorkspacePath = (path: string) => {
    window.history.pushState({}, "", path)
    setActiveSpaceId(null)
  }

  if (activeSpaceId) {
    return (
      <SpaceWorkspace
        user={user}
        spaceId={activeSpaceId}
        onExit={() => openWorkspacePath("/workspace/spaces")}
        onOpenProfile={() => openWorkspacePath("/workspace/profile")}
      />
    )
  }

  return <WorkspaceHome user={user} onOpenSpace={openSpace} />
}

export default Workspace
