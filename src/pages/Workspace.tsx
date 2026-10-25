import { useEffect, useState, type FormEvent, type ReactNode } from "react"
import type { User } from "firebase/auth"
import { signOut } from "firebase/auth"
import {
  ArrowRight, ArrowUpRight, Bot, Check, CircleHelp, Clock3, Code2,
  Database, Files, FolderKanban, Gauge, Lightbulb, LogOut,
  Plus, Search, Settings, Sparkles, X, Github, Triangle,
} from "lucide-react"
import { auth } from "../lib/firebase"
import { loadUserData, readUserData, saveUserData } from "../lib/onboarding"
import type { ShaftProject } from "../lib/onboarding"
import DashboardNavbar from "../components/layout/DashboardNavbar"
import UniversalSidebar from "../components/layout/UniversalSidebar"

interface WorkspaceProps { user: User }
type View = "Overview" | "My Spaces" | "Ideas" | "SHAFT AI" | "Artifacts" | "Tasks" | "Connectors" | "Settings"

function initialWorkspaceView(): View {
  switch (new URLSearchParams(window.location.search).get("view")) {
    case "spaces": return "My Spaces"
    case "artifacts": return "Artifacts"
    case "tasks": return "Tasks"
    case "connectors": return "Connectors"
    case "settings": return "Settings"
    default: return "Overview"
  }
}
export function Workspace({ user }: WorkspaceProps) {
  const [data, setData] = useState(() => readUserData(user.uid))
  const [view, setView] = useState<View>(initialWorkspaceView)
  const [showCreate, setShowCreate] = useState(false)
  const [projectName, setProjectName] = useState("")
  const [description, setDescription] = useState("")
  const [error, setError] = useState("")
  const [query, setQuery] = useState("")
  const [signingOut, setSigningOut] = useState(false)
  const [cloudReady, setCloudReady] = useState(false)
  const [connectorStatus, setConnectorStatus] = useState<"loading" | "connected" | "disconnected">("loading")
  const [supabaseProjects, setSupabaseProjects] = useState<Array<{ id: string; name: string; region?: string; status?: string }>>([])
  const [connectorBusy, setConnectorBusy] = useState(false)
  const [connectorMessage, setConnectorMessage] = useState("")
  useEffect(() => {
    let active = true
    loadUserData(user.uid).then((next) => { if (active) { setData(next); setCloudReady(true) } }).catch(() => {
      if (active) { setError("Couldn't load your cloud workspace. Check your connection and refresh."); setCloudReady(true) }
    })
    return () => { active = false }
  }, [user.uid])

  useEffect(() => {
    let active = true
    const loadConnector = async () => {
      try {
        const token = await user.getIdToken()
        const response = await fetch("/api/connectors/supabase/projects", { headers: { Authorization: "Bearer " + token } })
        const result = await response.json()
        if (!response.ok) throw new Error(result.error || "Could not check Supabase connection.")
        if (active) {
          setConnectorStatus(result.connected ? "connected" : "disconnected")
          setSupabaseProjects(Array.isArray(result.projects) ? result.projects : [])
          if (result.reconnectRequired) setConnectorMessage("Your Supabase session expired. Connect it again.")
        }
      } catch (err) {
        if (active) {
          setConnectorStatus("disconnected")
          setConnectorMessage(err instanceof Error ? err.message : "Could not check the Supabase connection.")
        }
      }
    }
    void loadConnector()
    return () => { active = false }
  }, [user])

  const connectSupabase = async () => {
    setConnectorBusy(true)
    setConnectorMessage("")
    try {
      const token = await user.getIdToken()
      const response = await fetch("/api/connectors/supabase/connect", {
        method: "POST",
        headers: { Authorization: "Bearer " + token },
      })
      const result = await response.json()
      if (!response.ok || !result.authorizationUrl) throw new Error(result.error || "Could not start Supabase connection.")
      window.location.assign(result.authorizationUrl)
    } catch (err) {
      setConnectorMessage(err instanceof Error ? err.message : "Could not start Supabase connection.")
      setConnectorBusy(false)
    }
  }

  const disconnectSupabase = async () => {
    setConnectorBusy(true)
    setConnectorMessage("")
    try {
      const token = await user.getIdToken()
      const response = await fetch("/api/connectors/supabase/disconnect", {
        method: "POST",
        headers: { Authorization: "Bearer " + token },
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || "Could not disconnect Supabase.")
      setConnectorStatus("disconnected")
      setSupabaseProjects([])
      setConnectorMessage("Supabase disconnected.")
    } catch (err) {
      setConnectorMessage(err instanceof Error ? err.message : "Could not disconnect Supabase.")
    } finally {
      setConnectorBusy(false)
    }
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get("connector") !== "supabase") return
    const status = params.get("status")
    if (status === "connected") setConnectorMessage("Supabase connected successfully.")
    else if (status === "denied") setConnectorMessage("Supabase connection was cancelled.")
    else if (status === "error") setConnectorMessage(params.get("reason") || "Supabase connection failed.")
    window.history.replaceState({}, "", window.location.pathname)
  }, [])

  const displayName = data.name || user.displayName || (user.email ? user.email.split("@")[0] : "Builder")
  const initials = displayName.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "S"
  const sidebarActiveItem = view === "My Spaces" || view === "Artifacts" || view === "Tasks" || view === "Connectors" || view === "Settings" ? view : "Overview"
  const filteredProjects = data.projects.filter((project) => project.name.toLowerCase().includes(query.toLowerCase()) || project.description.toLowerCase().includes(query.toLowerCase()))

  const createProject = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!projectName.trim() || !description.trim()) {
      setError("Add both a project name and a description.")
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
      setError("")
      setShowCreate(false)
      setView("My Spaces")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Project could not be saved to the cloud. Check your connection and try again.")
    }
  }

  const leave = async () => {
    setSigningOut(true)
    try {
      await signOut(auth)
      window.location.replace("/")
    } catch {
      setError("Sign out failed. Please try again.")
      setSigningOut(false)
    }
  }

  if (!cloudReady) return <main className="flex min-h-screen items-center justify-center bg-[#F5F7FB] text-sm text-slate-500">Loading your cloud workspace…</main>

  return (
    <UniversalSidebar activeItem={sidebarActiveItem} displayName={displayName} role={data.role || "SHAFT workspace"} onSignOut={() => void leave()} signingOut={signingOut} overlayOpen={showCreate}>
    <main className="min-h-screen bg-[#F5F7FB] text-[#101319]" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
      <div className="flex min-h-screen">

        <div className="min-w-0 flex-1">
          <DashboardNavbar displayName={displayName} initials={initials} photoURL={user.photoURL} onProfileClick={() => setView("Settings")} />

          <div className="mx-auto max-w-[1320px] px-5 pb-8 pt-24 sm:px-8 sm:pb-10 sm:pt-28">
            <div className="mb-7 flex flex-col gap-3 rounded-2xl border border-[#E0EBE9] bg-[#F0F8F6] px-4 py-3 sm:flex-row sm:items-center"><div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-[#397D76]"><CircleHelp size={17} /></div><p className="text-xs leading-5 text-slate-600"><strong className="font-semibold text-[#245C55]">Cloud workspace:</strong> your profile and projects sync to your SHAFT account. Connect your tools below to bring your project stack into SHAFT.</p></div>

            {view === "Overview" && <>
              <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="text-xs font-semibold uppercase tracking-[0.17em] text-[#397D76]">Your workspace</p><h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] sm:text-5xl" style={{ fontFamily: "Amaranth, sans-serif" }}>Let's build, {displayName.split(/\s+/)[0]}.</h1><p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">Your ideas deserve more than a notes app. Start a Space and bring the moving parts together.</p></div><button type="button" onClick={() => { setShowCreate(true); setError("") }} className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#101319] px-5 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 transition hover:-translate-y-0.5 hover:bg-[#252B35]"><Plus size={17} /> Start a Space</button></div>
              <div className="mt-8 grid gap-4 sm:grid-cols-3"><StatCard label="Projects" value={String(data.projects.length)} hint="Created in this workspace" icon={<FolderKanban size={18} />} /><StatCard label="Connected tools" value={connectorStatus === "connected" ? "1" : "0"} hint={connectorStatus === "connected" ? "Supabase connected" : "Connect your development stack"} icon={<Gauge size={18} />} /><StatCard label="Ideas captured" value="0" hint="Idea capture is on the roadmap" icon={<Lightbulb size={18} />} /></div>
              <div className="mt-10"><div className="flex items-center justify-between gap-4"><div><h2 className="text-xl font-semibold tracking-tight">Recent Spaces</h2><p className="mt-1 text-sm text-slate-500">Pick up where you left off in your Spaces.</p></div><button type="button" onClick={() => setView("My Spaces")} className="inline-flex items-center gap-1 rounded-lg px-2 py-2 text-sm font-semibold text-slate-500 transition hover:text-[#101319]">All spaces <ArrowUpRight size={15} /></button></div><ProjectList projects={data.projects.slice(0, 3)} onCreate={() => setShowCreate(true)} /></div>
              <div className="mt-8 grid gap-4 md:grid-cols-2">
                <ActionCard icon={<Sparkles size={19} />} title="Meet SHAFT AI" text="The AI project companion is the next part of the journey." action={() => setView("SHAFT AI")} />
                <ActionCard icon={<Database size={19} />} title="Connect Supabase" text={connectorStatus === "connected" ? "Your Supabase account is connected. Open Settings to view projects." : "Authorize SHAFT to read your Supabase projects. No API keys to copy."} action={() => setView("Settings")} />
              </div>
            </>}

            {view === "My Spaces" && <section><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs font-semibold uppercase tracking-[0.17em] text-[#397D76]">Your work</p><h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em]" style={{ fontFamily: "Amaranth, sans-serif" }}>My Spaces</h1><p className="mt-2 text-sm text-slate-500">One place for every project in progress.</p></div><button type="button" onClick={() => { setShowCreate(true); setError("") }} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#101319] px-4 text-sm font-semibold text-white transition hover:bg-[#252B35]"><Plus size={16} /> New Space</button></div><label className="mt-7 flex h-11 max-w-md items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-slate-400"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search projects" className="w-full bg-transparent text-sm text-[#101319] outline-none placeholder:text-slate-400" /></label><ProjectList projects={filteredProjects} onCreate={() => setShowCreate(true)} /></section>}

            {view === "Artifacts" && <Placeholder icon={<Files size={23} />} eyebrow="Your project output" title="Artifacts will have a home here." text="Keep important files, generated outputs, reference material, and deliverables organized across your Spaces. The library view is being built next." action="View my Spaces" onAction={() => setView("My Spaces")} />}
            {view === "Tasks" && <Placeholder icon={<Clock3 size={23} />} eyebrow="Keep momentum" title="Your next steps, in one place." text="A universal task list will bring work from your Spaces into one focused view. Task creation and status tracking are not wired up yet." action="View my Spaces" onAction={() => setView("My Spaces")} />}
            {view === "Connectors" && <section>
              <p className="text-xs font-semibold uppercase tracking-[0.17em] text-[#397D76]">Your toolchain</p>
              <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em]" style={{ fontFamily: "Amaranth, sans-serif" }}>Connectors</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">Manage the services that power your Spaces. Connect each service once, then attach its specific resources to the relevant Space.</p>
              <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <button type="button" onClick={() => setView("Settings")} className="rounded-2xl border border-slate-200 bg-white p-5 text-left transition hover:border-[#BCDAD5] hover:shadow-lg hover:shadow-slate-900/[0.03]">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#EAF7F4] text-[#397D76]"><Database size={20} /></span>
                  <span className="mt-4 block font-semibold">Supabase</span>
                  <span className="mt-1 block text-sm leading-5 text-slate-500">{connectorStatus === "loading" ? "Checking connection…" : connectorStatus === "connected" ? "Connected · Manage connection" : "Not connected · Open setup"}</span>
                </button>
                <button type="button" onClick={() => window.location.assign("/github")} className="rounded-2xl border border-slate-200 bg-white p-5 text-left transition hover:border-[#BCDAD5] hover:shadow-lg hover:shadow-slate-900/[0.03]">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-slate-100 text-slate-700"><Github size={20} /></span>
                  <span className="mt-4 block font-semibold">GitHub</span>
                  <span className="mt-1 block text-sm leading-5 text-slate-500">Repositories and source control</span>
                </button>
                <button type="button" onClick={() => window.location.assign("/vercel")} className="rounded-2xl border border-slate-200 bg-white p-5 text-left transition hover:border-[#BCDAD5] hover:shadow-lg hover:shadow-slate-900/[0.03]">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-slate-100 text-slate-700"><Triangle size={20} /></span>
                  <span className="mt-4 block font-semibold">Vercel</span>
                  <span className="mt-1 block text-sm leading-5 text-slate-500">Projects and deployments</span>
                </button>
              </div>
            </section>}
            {view === "Ideas" && <Placeholder icon={<Lightbulb size={23} />} eyebrow="Capture and shape" title="Give your ideas a place to grow." text="Idea capture and the path from an idea to a project are planned for a later phase. For now, start a project and keep its purpose in the description." action="Start a Space" onAction={() => setShowCreate(true)} />}
            {view === "SHAFT AI" && <Placeholder icon={<Bot size={23} />} eyebrow="Your project companion" title="SHAFT AI is taking shape." text="AI provider connections and project-aware assistance will be added next. No AI provider is connected in this preview." action="View my projects" onAction={() => setView("My Spaces")} />}
            {view === "Settings" && <section className="max-w-2xl"><p className="text-xs font-semibold uppercase tracking-[0.17em] text-[#397D76]">Your account</p><h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em]" style={{ fontFamily: "Amaranth, sans-serif" }}>Settings</h1><div className="mt-7 rounded-2xl border border-slate-200 bg-white p-6"><p className="text-sm font-semibold">Connected tools</p><div className="mt-4 flex flex-col gap-4 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#EAF7F4] text-[#397D76]"><Database size={20} /></span><div className="min-w-0 flex-1"><p className="font-semibold">Supabase</p><p className="mt-1 text-sm leading-5 text-slate-500">{connectorStatus === "loading" ? "Checking connection…" : connectorStatus === "connected" ? "Connected. SHAFT can read your projects." : "Connect your Supabase account securely with OAuth."}</p></div>{connectorStatus === "connected" ? <button type="button" disabled={connectorBusy} onClick={() => void disconnectSupabase()} className="h-10 shrink-0 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-600 disabled:opacity-50">{connectorBusy ? "Working…" : "Disconnect"}</button> : <button type="button" disabled={connectorBusy || connectorStatus === "loading"} onClick={() => void connectSupabase()} className="h-10 shrink-0 rounded-xl bg-[#101319] px-4 text-sm font-semibold text-white disabled:opacity-50">{connectorBusy ? "Connecting…" : "Connect Supabase"}</button>}</div>{connectorMessage && <p role="status" className="mt-3 break-words rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-600">{connectorMessage}</p>}{connectorStatus === "connected" && <div className="mt-5"><p className="text-sm font-semibold">Your Supabase projects</p>{supabaseProjects.length ? <div className="mt-3 divide-y divide-slate-100 rounded-xl border border-slate-100">{supabaseProjects.map((project) => <div key={project.id} className="flex items-center justify-between gap-3 px-3 py-3"><div className="min-w-0"><p className="truncate text-sm font-medium">{project.name}</p><p className="mt-1 text-xs text-slate-400">{project.region || "Region unavailable"}{project.status ? " · " + project.status : ""}</p></div><span className="rounded-full bg-[#EAF7F4] px-2.5 py-1 text-xs font-medium text-[#245C55]">Supabase</span></div>)}</div> : <p className="mt-2 text-sm text-slate-500">No projects were returned for this account.</p>}</div>}<p className="mt-6 text-sm font-semibold">Profile</p><dl className="mt-5 space-y-4 text-sm"><Setting label="Name" value={displayName} /><Setting label="Email" value={user.email || "Not provided by sign-in provider"} /><Setting label="Role" value={data.role || "Not selected"} /><Setting label="Data storage" value="Firebase Cloud Firestore" /></dl></div><button type="button" onClick={() => void leave()} disabled={signingOut} className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 transition hover:text-[#101319] disabled:opacity-50"><LogOut size={16} /> Sign out</button></section>}
          </div>
        </div>
      </div>

      {showCreate && <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#101319]/45 p-4 backdrop-blur-sm" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowCreate(false) }}>
        <section role="dialog" aria-modal="true" aria-labelledby="create-project-title" className="my-8 w-full max-w-lg rounded-3xl border border-white/80 bg-[#F8FAFD] p-6 shadow-2xl sm:p-8">
          <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#397D76]">New Space</p><h2 id="create-project-title" className="mt-2 text-2xl font-semibold tracking-tight" style={{ fontFamily: "Amaranth, sans-serif" }}>Start your Space with the basics.</h2><p className="mt-2 text-sm leading-6 text-slate-500">You can add more structure as the project grows.</p></div><button type="button" onClick={() => setShowCreate(false)} aria-label="Close dialog" className="grid h-9 w-9 place-items-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:text-[#101319]"><X size={16} /></button></div>
          <form onSubmit={createProject} className="mt-7 space-y-4"><label className="block text-sm font-semibold">Space name<input autoFocus value={projectName} onChange={(event) => setProjectName(event.target.value)} maxLength={100} required placeholder="e.g. Website redesign" className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-normal outline-none focus:border-[#5D9991] focus:ring-4 focus:ring-[#78CFC4]/20" /></label><label className="block text-sm font-semibold">Description<textarea value={description} onChange={(event) => setDescription(event.target.value)} maxLength={1200} required rows={4} placeholder="What are you building?" className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-normal leading-6 outline-none focus:border-[#5D9991] focus:ring-4 focus:ring-[#78CFC4]/20" /></label>{error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}<div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end"><button type="button" onClick={() => setShowCreate(false)} className="h-11 rounded-xl px-4 text-sm font-semibold text-slate-500 transition hover:bg-slate-100">Cancel</button><button type="submit" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#101319] px-5 text-sm font-semibold text-white transition hover:bg-[#252B35]"><Check size={16} /> Create Space</button></div></form>
        </section>
      </div>}
    </main>
    </UniversalSidebar>
  )
}

function StatCard({ label, value, hint, icon }: { label: string; value: string; hint: string; icon: ReactNode }) {
  return <div className="rounded-2xl border border-slate-200/80 bg-white p-5"><div className="flex items-center justify-between gap-3"><p className="text-sm font-medium text-slate-500">{label}</p><span className="grid h-9 w-9 place-items-center rounded-xl bg-slate-50 text-slate-600">{icon}</span></div><p className="mt-5 text-3xl font-semibold tracking-tight">{value}</p><p className="mt-1 text-xs text-slate-400">{hint}</p></div>
}

function ProjectList({ projects, onCreate }: { projects: ShaftProject[]; onCreate: () => void }) {
  if (projects.length === 0) return <div className="mt-5 flex min-h-52 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/60 px-6 py-10 text-center"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-slate-500 shadow-sm"><FolderKanban size={21} /></span><h3 className="mt-4 font-semibold">Your first project starts here.</h3><p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">Give it a name and a sentence about what you want to build.</p><button type="button" onClick={onCreate} className="mt-4 inline-flex h-10 items-center gap-2 rounded-xl bg-[#101319] px-4 text-sm font-semibold text-white transition hover:bg-[#252B35]"><Plus size={15} /> Start a Space</button></div>
  return <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{projects.map((project) => <article key={project.id} className="rounded-2xl border border-slate-200/80 bg-white p-5 transition hover:border-[#BCDAD5] hover:shadow-lg hover:shadow-slate-900/[0.03]"><div className="flex items-start justify-between gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#EAF7F4] text-[#397D76]"><Code2 size={18} /></span><span className="inline-flex items-center gap-1.5 text-[11px] text-slate-400"><Clock3 size={12} /> {new Date(project.createdAt).toLocaleDateString()}</span></div><h3 className="mt-5 text-base font-semibold">{project.name}</h3><p className="mt-2 min-h-[60px] text-sm leading-5 text-slate-500">{project.description}</p><div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-500">Project created</span><ArrowUpRight size={16} className="text-slate-400" /></div></article>)}</div>
}

function ActionCard({ icon, title, text, action }: { icon: ReactNode; title: string; text: string; action: () => void }) {
  return <button type="button" onClick={action} className="group flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 text-left transition hover:border-[#BCDAD5] hover:shadow-lg hover:shadow-slate-900/[0.03]"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#EAF7F4] text-[#397D76]">{icon}</span><span className="flex-1"><span className="block font-semibold">{title}</span><span className="mt-1 block text-sm leading-6 text-slate-500">{text}</span></span><ArrowRight size={17} className="mt-1 text-slate-400 transition group-hover:translate-x-1" /></button>
}

function Placeholder({ icon, eyebrow, title, text, action, onAction }: { icon: ReactNode; eyebrow: string; title: string; text: string; action: string; onAction: () => void }) {
  return <section className="flex min-h-[55vh] flex-col items-start justify-center"><span className="grid h-14 w-14 place-items-center rounded-2xl bg-[#EAF7F4] text-[#397D76]">{icon}</span><p className="mt-7 text-xs font-semibold uppercase tracking-[0.17em] text-[#397D76]">{eyebrow}</p><h1 className="mt-3 max-w-2xl text-4xl font-semibold leading-tight tracking-[-0.05em] sm:text-5xl" style={{ fontFamily: "Amaranth, sans-serif" }}>{title}</h1><p className="mt-4 max-w-xl text-base leading-7 text-slate-500">{text}</p><button type="button" onClick={onAction} className="mt-7 inline-flex h-11 items-center gap-2 rounded-xl bg-[#101319] px-4 text-sm font-semibold text-white transition hover:bg-[#252B35]">{action} <ArrowRight size={16} /></button></section>
}

function Setting({ label, value }: { label: string; value: string }) {
  return <div><dt className="text-xs text-slate-400">{label}</dt><dd className="mt-1 break-words font-medium">{value}</dd></div>
}

export default Workspace
