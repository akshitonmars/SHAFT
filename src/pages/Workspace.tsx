import { useEffect, useState, type FormEvent } from "react"
import type { User } from "firebase/auth"
import { signOut } from "firebase/auth"
import { Check, X } from "lucide-react"
import { auth } from "../lib/firebase"
import { loadUserData, readUserData, saveUserData } from "../lib/onboarding"
import type { ShaftProject } from "../lib/onboarding"
import { fetchStatus } from "../lib/connectors"
import type { ConnectorId } from "../lib/connectors"
import DashboardNavbar from "../components/layout/DashboardNavbar"
import UniversalSidebar from "../components/layout/UniversalSidebar"
import Loader from "../components/ui/Loader"
import {
  ArtifactsPage, OverviewPage, ProfilePage, SettingsPage, SpacesPage, TasksPage,
} from "./workspace/WorkspaceViews"
import { ConnectorsPage } from "./workspace/ConnectorsPage"

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

export function Workspace({ user }: { user: User }) {
  const [data, setData] = useState(() => readUserData(user.uid))
  const [route, setRoute] = useState<WorkspaceRoute>(routeFromLocation)
  const [cloudReady, setCloudReady] = useState(false)
  const [pageReady, setPageReady] = useState(false)
  const [cloudError, setCloudError] = useState("")
  const [showCreate, setShowCreate] = useState(false)
  const [projectName, setProjectName] = useState("")
  const [description, setDescription] = useState("")
  const [createError, setCreateError] = useState("")
  const [signingOut, setSigningOut] = useState(false)
  const [connectorStates, setConnectorStates] = useState<Record<string, boolean>>({})

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
        return [id, state.connected] as const
      } catch {
        return [id, false] as const
      }
    })).then((states) => {
      if (active) setConnectorStates(Object.fromEntries(states))
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
  const connectedTools = connectorIds.filter((id) => connectorStates[id]).length

  const createSpace = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!projectName.trim() || !description.trim()) {
      setCreateError("Add both a Space name and a description.")
      return
    }
    const project: ShaftProject = {
      id: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : String(Date.now()),
      name: projectName.trim(),
      description: description.trim(),
      createdAt: new Date().toISOString(),
    }
    try {
      const next = await saveUserData(user.uid, { projects: [...data.projects, project] })
      setData(next)
      setProjectName("")
      setDescription("")
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
        <div className="mx-auto max-w-[1320px] px-5 pb-8 pt-24 sm:px-8 sm:pb-10 sm:pt-28">
          {cloudError && <div role="alert" className="mb-6 rounded-2xl border border-red-200 bg-white px-4 py-3 text-sm text-red-700">{cloudError}</div>}
          {!cloudReady || !pageReady ? (
            <div className="flex min-h-[60vh] items-center justify-center">
              <Loader size={56} label={cloudReady ? "Opening " + routeLabels[route] + "…" : "Loading your workspace…"} delay={120} />
            </div>
          ) : (
            <>
              {route === "overview" && <OverviewPage data={data} displayName={displayName} connectedTools={connectedTools} onCreate={() => { setShowCreate(true); setCreateError("") }} onNavigate={navigate} />}
              {route === "spaces" && <SpacesPage projects={data.projects} onCreate={() => { setShowCreate(true); setCreateError("") }} />}
              {route === "artifacts" && <ArtifactsPage />}
              {route === "tasks" && <TasksPage />}
              {route === "connectors" && <ConnectorsPage user={user} />}
              {route === "settings" && <SettingsPage data={data} user={user} onSignOut={() => void leave()} signingOut={signingOut} />}
              {route === "profile" && <ProfilePage data={data} user={user} />}
            </>
          )}
        </div>
        {showCreate && <div className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-[#101319]/45 p-4 backdrop-blur-sm" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowCreate(false) }}>
          <section role="dialog" aria-modal="true" aria-labelledby="create-space-title" className="my-8 w-full max-w-lg rounded-3xl border border-white/80 bg-[#F8FAFD] p-6 text-[#101319] shadow-2xl sm:p-8">
            <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#397D76]">New Space</p><h2 id="create-space-title" className="mt-2 text-2xl font-semibold tracking-tight" style={{ fontFamily: "Amaranth, sans-serif" }}>Start your Space with the basics.</h2><p className="mt-2 text-sm leading-6 text-slate-500">You can add more structure as the project grows.</p></div><button type="button" onClick={() => setShowCreate(false)} aria-label="Close dialog" className="grid h-9 w-9 place-items-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:text-[#101319]"><X size={16} /></button></div>
            <form onSubmit={(event) => void createSpace(event)} className="mt-7 space-y-4">
              <label className="block text-sm font-semibold">Space name<input autoFocus value={projectName} onChange={(event) => setProjectName(event.target.value)} maxLength={100} required placeholder="e.g. Friedgram" className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-normal outline-none focus:border-[#5D9991] focus:ring-4 focus:ring-[#78CFC4]/20" /></label>
              <label className="block text-sm font-semibold">Description<textarea value={description} onChange={(event) => setDescription(event.target.value)} maxLength={1200} required rows={4} placeholder="What are you building?" className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-normal leading-6 outline-none focus:border-[#5D9991] focus:ring-4 focus:ring-[#78CFC4]/20" /></label>
              {createError && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{createError}</p>}
              <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end"><button type="button" onClick={() => setShowCreate(false)} className="h-11 rounded-xl px-4 text-sm font-semibold text-slate-500 transition hover:bg-slate-100">Cancel</button><button type="submit" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#101319] px-5 text-sm font-semibold text-white transition hover:bg-[#252B35]"><Check size={16} /> Create Space</button></div>
            </form>
          </section>
        </div>}
      </main>
    </UniversalSidebar>
  )
}

export default Workspace
