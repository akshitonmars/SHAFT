import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react"
import type { User } from "firebase/auth"
import {
  ArrowRight, ArrowUpRight, Check, Clock3, ExternalLink, FolderKanban,
  GitBranch, Layers3, Link2, Plus, RefreshCw, Settings2, Trash2, Triangle,
} from "lucide-react"
import DashboardNavbar from "../../components/layout/DashboardNavbar"
import SpaceSidebar, { type SpaceTab } from "../../components/layout/SpaceSidebar"
import Loader from "../../components/ui/Loader"
import { loadUserData, saveUserData } from "../../lib/onboarding"
import type { ShaftProject, ShaftUserData, SpaceHistoryEvent, SpaceResource, SpaceResourceProvider } from "../../lib/onboarding"

interface SpaceWorkspaceProps {
  user: User
  spaceId: string
  onExit: () => void
  onOpenProfile: () => void
}

type AvailableResource = Omit<SpaceResource, "linkedAt"> & { provider: SpaceResourceProvider }

const providerNames: Record<SpaceResourceProvider, string> = {
  github: "GitHub",
  vercel: "Vercel",
  supabase: "Supabase",
}

function parseSpaceTab(): SpaceTab {
  const part = window.location.pathname.split("/")[4]
  return part === "resources" || part === "history" || part === "settings" ? part : "dashboard"
}

function historyEvent(title: string, detail?: string): SpaceHistoryEvent {
  return {
    id: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2),
    title,
    detail,
    createdAt: new Date().toISOString(),
  }
}

async function request(user: User, path: string) {
  const token = await user.getIdToken()
  const response = await fetch(path, { headers: { Authorization: "Bearer " + token } })
  const result = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(result.error || "Could not load connected resources.")
  return result
}

export default function SpaceWorkspace({ user, spaceId, onExit, onOpenProfile }: SpaceWorkspaceProps) {
  const [data, setData] = useState<ShaftUserData | null>(null)
  const [cloudReady, setCloudReady] = useState(false)
  const [cloudError, setCloudError] = useState("")
  const [activeTab, setActiveTab] = useState<SpaceTab>(parseSpaceTab)
  const [pageReady, setPageReady] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState("")
  const [notice, setNotice] = useState("")

  useEffect(() => {
    let active = true
    loadUserData(user.uid).then((next) => {
      if (active) {
        setData(next)
        setCloudReady(true)
        setCloudError("")
      }
    }).catch((error) => {
      if (active) {
        setCloudReady(true)
        setCloudError(error instanceof Error ? error.message : "Could not load this Space.")
      }
    })
    return () => { active = false }
  }, [user.uid])

  useEffect(() => {
    setPageReady(false)
    const timeout = window.setTimeout(() => setPageReady(true), 220)
    return () => window.clearTimeout(timeout)
  }, [activeTab, spaceId])

  useEffect(() => {
    const onPopState = () => {
      setActiveTab(parseSpaceTab())
      setNotice("")
      setSaveError("")
    }
    window.addEventListener("popstate", onPopState)
    return () => window.removeEventListener("popstate", onPopState)
  }, [])

  const space = useMemo(() => data?.projects.find((project) => project.id === spaceId) ?? null, [data, spaceId])
  const displayName = data?.name || user.displayName || (user.email ? user.email.split("@")[0] : "Builder")
  const initials = displayName.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "S"

  const navigateTab = (nextTab: SpaceTab) => {
    if (nextTab === activeTab) return
    const nextUrl = "/workspace/spaces/" + encodeURIComponent(spaceId) + "/" + nextTab
    window.history.pushState({}, "", nextUrl)
    setActiveTab(nextTab)
    setPageReady(false)
    setNotice("")
    setSaveError("")
    document.getElementById("space-content-scroll")?.scrollTo({ top: 0, behavior: "auto" })
  }

  const updateSpace = async (patch: Partial<ShaftProject>, eventTitle: string, detail?: string) => {
    if (!data || !space) return
    setSaving(true)
    setSaveError("")
    setNotice("")
    try {
      const updatedProject: ShaftProject = {
        ...space,
        ...patch,
        history: [...(space.history ?? []), historyEvent(eventTitle, detail)],
      }
      const next = await saveUserData(user.uid, {
        projects: data.projects.map((project) => project.id === space.id ? updatedProject : project),
      })
      setData(next)
      setNotice("Changes saved.")
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Could not save this Space. Check your connection and try again.")
    } finally {
      setSaving(false)
    }
  }

  const attachResource = async (resource: AvailableResource) => {
    if (!space) return
    const alreadyAttached = (space.resources ?? []).some((item) => item.provider === resource.provider && item.id === resource.id)
    if (alreadyAttached) return
    await updateSpace(
      { resources: [...(space.resources ?? []), { ...resource, linkedAt: new Date().toISOString() }] },
      "Resource connected",
      providerNames[resource.provider] + " · " + resource.name,
    )
  }

  const detachResource = async (resource: SpaceResource) => {
    if (!space) return
    await updateSpace(
      { resources: (space.resources ?? []).filter((item) => !(item.provider === resource.provider && item.id === resource.id)) },
      "Resource detached",
      providerNames[resource.provider] + " · " + resource.name,
    )
  }

  const sidebarSpace: ShaftProject = space ?? { id: spaceId, name: "Space not found", description: "", createdAt: new Date().toISOString() }

  return (
    <SpaceSidebar space={sidebarSpace} activeTab={activeTab} onNavigate={navigateTab} onBack={onExit}>
      <div className="flex h-full min-h-0 flex-col bg-[#F5F7FB] text-[#101319]" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
        <DashboardNavbar displayName={displayName} initials={initials} photoURL={user.photoURL} onProfileClick={onOpenProfile} />
        <div id="space-content-scroll" className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <div className="mx-auto max-w-[1320px] px-5 pb-10 pt-24 sm:px-8 sm:pt-28">
            {(cloudError || saveError) && <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-white px-4 py-3 text-sm text-red-700">{cloudError || saveError}</div>}
            {notice && <p role="status" className="mb-5 rounded-xl border border-[#D9ECE8] bg-white px-4 py-3 text-sm text-[#245C55]">{notice}</p>}
            {!cloudReady || !pageReady ? (
              <div className="flex min-h-[60vh] items-center justify-center"><Loader size={56} label={cloudReady ? "Opening " + sidebarSpace.name + "…" : "Loading your Space…"} delay={120} /></div>
            ) : !space ? (
              <section className="flex min-h-[55vh] flex-col items-start justify-center"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-slate-500"><FolderKanban size={22} /></span><h1 className="mt-5 text-2xl font-semibold">Space not found</h1><p className="mt-2 max-w-lg text-sm leading-6 text-slate-500">It may have been removed or the link may be incorrect. Return to My Spaces to choose another.</p><button type="button" onClick={onExit} className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-[#101319] px-4 text-sm font-semibold text-white">All Spaces <ArrowRight size={15} /></button></section>
            ) : (
              <>
                {activeTab === "dashboard" && <SpaceDashboard space={space} onNavigate={navigateTab} />}
                {activeTab === "resources" && <ResourcesView user={user} space={space} saving={saving} onAttach={attachResource} onDetach={detachResource} />}
                {activeTab === "history" && <SpaceHistoryView space={space} />}
                {activeTab === "settings" && <SpaceSettingsView space={space} saving={saving} onSave={(patch) => void updateSpace(patch, "Project settings updated", "Space name or description changed")} />}
              </>
            )}
          </div>
        </div>
      </div>
    </SpaceSidebar>
  )
}

function PageHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div><p className="text-xs font-semibold uppercase tracking-[0.17em] text-[#397D76]">{eyebrow}</p><h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] sm:text-5xl" style={{ fontFamily: "Amaranth, sans-serif" }}>{title}</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">{description}</p></div>
      {action}
    </div>
  )
}

function SpaceDashboard({ space, onNavigate }: { space: ShaftProject; onNavigate: (tab: SpaceTab) => void }) {
  const resources = space.resources ?? []
  const events = space.history ?? []
  return (
    <>
      <PageHeader eyebrow="Space dashboard" title={space.name} description={space.description || "Your dedicated workspace for this product or initiative."} action={<button type="button" onClick={() => onNavigate("settings")} className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 transition hover:border-[#BCDAD5] hover:text-[#245C55]"><Settings2 size={15} /> Project Settings</button>} />
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <MetricCard label="Resources" value={String(resources.length)} hint="Connected to this Space" icon={<Link2 size={18} />} />
        <MetricCard label="Activity events" value={String(events.length + 1)} hint="Recorded in this Space" icon={<Clock3 size={18} />} />
        <MetricCard label="Created" value={new Date(space.createdAt).toLocaleDateString()} hint="Space start date" icon={<FolderKanban size={18} />} />
      </div>
      <div className="mt-9 grid gap-5 lg:grid-cols-[1.35fr_1fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3"><div><h2 className="text-lg font-semibold">Connected resources</h2><p className="mt-1 text-sm text-slate-500">The external tools attached to this Space.</p></div><button type="button" onClick={() => onNavigate("resources")} className="text-sm font-semibold text-[#397D76] hover:text-[#245C55]">Manage <ArrowUpRight size={14} className="inline" /></button></div>
          {resources.length ? <div className="mt-5 space-y-2">{resources.slice(0, 4).map((resource) => <ResourceRow key={resource.provider + resource.id} resource={resource} />)}</div> : <div className="mt-5 rounded-xl border border-dashed border-slate-300 px-4 py-7 text-center"><Link2 size={21} className="mx-auto text-slate-400" /><p className="mt-3 text-sm font-semibold">Nothing connected yet</p><p className="mt-1 text-xs leading-5 text-slate-500">Attach the GitHub repository, Vercel project, or Supabase project this Space uses.</p><button type="button" onClick={() => onNavigate("resources")} className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg bg-[#101319] px-3 text-xs font-semibold text-white"><Plus size={14} /> Add resources</button></div>}
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3"><div><h2 className="text-lg font-semibold">Recent history</h2><p className="mt-1 text-sm text-slate-500">The latest changes to this Space.</p></div><button type="button" onClick={() => onNavigate("history")} className="text-sm font-semibold text-[#397D76] hover:text-[#245C55]">View history <ArrowUpRight size={14} className="inline" /></button></div>
          <HistoryTimeline space={space} limit={3} />
        </section>
      </div>
    </>
  )
}

function ResourcesView({ user, space, saving, onAttach, onDetach }: {
  user: User
  space: ShaftProject
  saving: boolean
  onAttach: (resource: AvailableResource) => Promise<void>
  onDetach: (resource: SpaceResource) => Promise<void>
}) {
  const [available, setAvailable] = useState<AvailableResource[]>([])
  const [loading, setLoading] = useState(true)
  const [providerErrors, setProviderErrors] = useState<string[]>([])
  const [query, setQuery] = useState("")
  const attached = space.resources ?? []

  useEffect(() => {
    let active = true
    async function loadAvailable() {
      setLoading(true)
      const found: AvailableResource[] = []
      const errors: string[] = []
      const tasks: Promise<void>[] = [
        (async () => {
          try {
            const status = await request(user, "/api/connectors/github/status")
            if (status.connected) {
              const result = await request(user, "/api/connectors/github/repositories")
              for (const repo of Array.isArray(result.repositories) ? result.repositories : []) {
                found.push({ id: String(repo.id), provider: "github", name: repo.fullName || repo.name, url: repo.htmlUrl, detail: [repo.private ? "Private" : "Public", repo.language].filter(Boolean).join(" · ") })
              }
            } else errors.push("GitHub is not connected")
          } catch { errors.push("Could not load GitHub resources") }
        })(),
        (async () => {
          try {
            const result = await request(user, "/api/connectors/vercel/projects")
            if (result.connected) {
              for (const project of Array.isArray(result.projects) ? result.projects : []) {
                found.push({ id: String(project.id), provider: "vercel", name: project.name, url: "https://vercel.com/dashboard", detail: project.framework || "Vercel project" })
              }
            } else errors.push("Vercel is not connected")
          } catch { errors.push("Could not load Vercel resources") }
        })(),
        (async () => {
          try {
            const result = await request(user, "/api/connectors/supabase/projects")
            if (result.connected) {
              for (const project of Array.isArray(result.projects) ? result.projects : []) {
                found.push({ id: String(project.id), provider: "supabase", name: project.name, url: "https://supabase.com/dashboard/project/" + project.id, detail: [project.region, project.status].filter(Boolean).join(" · ") || "Supabase project" })
              }
            } else errors.push("Supabase is not connected")
          } catch { errors.push("Could not load Supabase resources") }
        })(),
      ]
      await Promise.all(tasks)
      if (active) {
        setAvailable(found.sort((a, b) => a.provider.localeCompare(b.provider) || a.name.localeCompare(b.name)))
        setProviderErrors(errors)
        setLoading(false)
      }
    }
    void loadAvailable()
    return () => { active = false }
  }, [user.uid])

  const linkedKeys = new Set(attached.map((item) => item.provider + ":" + item.id))
  const filtered = available.filter((item) => !linkedKeys.has(item.provider + ":" + item.id) && (item.name + " " + item.provider + " " + (item.detail || "")).toLowerCase().includes(query.toLowerCase()))

  return (
    <section>
      <PageHeader eyebrow="Space resources" title="Resources" description="Attach specific external resources to this Space. Your connected accounts stay global; each Space only includes the resources you choose." />
      <div className="mt-8">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><h2 className="text-lg font-semibold">Attached to this Space</h2><p className="mt-1 text-sm text-slate-500">{attached.length} linked resource{attached.length === 1 ? "" : "s"}</p></div></div>
        {attached.length ? <div className="mt-4 grid gap-3 md:grid-cols-2">{attached.map((resource) => <article key={resource.provider + resource.id} className="rounded-2xl border border-slate-200 bg-white p-4"><ResourceRow resource={resource} /><div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3"><span className="text-xs text-slate-400">Added {new Date(resource.linkedAt).toLocaleDateString()}</span><button type="button" disabled={saving} onClick={() => void onDetach(resource)} className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-500 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"><Trash2 size={13} /> Remove</button></div></article>)}</div> : <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white/60 px-5 py-8 text-center"><Link2 size={22} className="mx-auto text-slate-400" /><p className="mt-3 font-semibold">No resources attached</p><p className="mt-1 text-sm leading-6 text-slate-500">Choose a resource below to make it part of this Space.</p></div>}
      </div>
      <div className="mt-9">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><h2 className="text-lg font-semibold">Available resources</h2><p className="mt-1 text-sm text-slate-500">Resources from your connected GitHub, Vercel, and Supabase accounts.</p></div><label className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-slate-400 sm:w-64"><SearchIcon /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find a resource" className="w-full bg-transparent text-sm text-[#101319] outline-none" /></label></div>
        {loading ? <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500"><RefreshCw size={15} className="mr-2 inline animate-spin" /> Loading your connected resources…</div> : filtered.length ? <div className="mt-4 grid gap-3 md:grid-cols-2">{filtered.map((resource) => <article key={resource.provider + resource.id} className="flex min-w-0 items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4"><ProviderIcon provider={resource.provider} /><div className="min-w-0 flex-1"><h3 className="break-words text-sm font-semibold">{resource.name}</h3><p className="mt-1 text-xs text-slate-400">{providerNames[resource.provider]}{resource.detail ? " · " + resource.detail : ""}</p></div><button type="button" disabled={saving} onClick={() => void onAttach(resource)} className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-xl bg-[#101319] px-3 text-xs font-semibold text-white transition hover:bg-[#252B35] disabled:opacity-50"><Plus size={14} /> Attach</button></article>)}</div> : <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white/60 px-5 py-8 text-center"><Layers3 size={22} className="mx-auto text-slate-400" /><p className="mt-3 font-semibold">{available.length ? "No more matching resources" : "No external resources available"}</p><p className="mt-1 text-sm leading-6 text-slate-500">{available.length ? "Try a different search, or connect another resource account." : "Connect GitHub, Vercel, or Supabase in your workspace Connectors page, then return here."}</p><a href="/workspace/connectors" className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 hover:border-[#BCDAD5]">Open Connectors <ArrowUpRight size={14} /></a></div>}
        {!loading && providerErrors.length > 0 && <p className="mt-3 text-xs leading-5 text-slate-400">Some providers may need to be connected first: {providerErrors.join(" · ")}.</p>}
      </div>
    </section>
  )
}

function SpaceHistoryView({ space }: { space: ShaftProject }) {
  return <section><PageHeader eyebrow="Space activity" title="History" description="A timeline of resource links and settings changes recorded for this Space." /><div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 sm:p-7"><HistoryTimeline space={space} /></div></section>
}

function SpaceSettingsView({ space, saving, onSave }: {
  space: ShaftProject
  saving: boolean
  onSave: (patch: Partial<ShaftProject>) => void
}) {
  const [name, setName] = useState(space.name)
  const [description, setDescription] = useState(space.description)
  const [savedSpaceId, setSavedSpaceId] = useState(space.id)
  const changed = name.trim() !== space.name || description.trim() !== space.description
  useEffect(() => {
    if (savedSpaceId !== space.id) {
      setSavedSpaceId(space.id)
      setName(space.name)
      setDescription(space.description)
    }
  }, [space.id, savedSpaceId, space.name, space.description])

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!name.trim()) return
    if (!changed) return
    onSave({ name: name.trim(), description: description.trim() })
  }
  return (
    <section className="max-w-3xl"><PageHeader eyebrow="Space configuration" title="Project Settings" description="Update this Space's name and description. Changes sync to your SHAFT account." /><form onSubmit={submit} className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 sm:p-7"><label className="block text-sm font-semibold">Space name<input value={name} onChange={(event) => setName(event.target.value)} required maxLength={100} className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-normal outline-none focus:border-[#5D9991] focus:ring-4 focus:ring-[#78CFC4]/20" /></label><label className="mt-5 block text-sm font-semibold">Description<textarea value={description} onChange={(event) => setDescription(event.target.value)} maxLength={1200} rows={4} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-normal leading-6 outline-none focus:border-[#5D9991] focus:ring-4 focus:ring-[#78CFC4]/20" placeholder="What is this Space for?" /></label><div className="mt-6 flex flex-col justify-between gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center"><p className="text-xs leading-5 text-slate-400">Created {new Date(space.createdAt).toLocaleString()}</p><button type="submit" disabled={saving || !name.trim() || !changed} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#101319] px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40">{saving ? <RefreshCw size={15} className="animate-spin" /> : <Check size={15} />}{saving ? "Saving…" : "Save changes"}</button></div></form></section>
  )
}

function HistoryTimeline({ space, limit }: { space: ShaftProject; limit?: number }) {
  const events: SpaceHistoryEvent[] = [
    { id: "created-" + space.id, title: "Space created", detail: "This Space was added to your workspace.", createdAt: space.createdAt },
    ...(space.history ?? []),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  const shown = typeof limit === "number" ? events.slice(0, limit) : events
  if (!shown.length) return <p className="mt-5 text-sm text-slate-500">No activity has been recorded yet.</p>
  return <div className="mt-5 space-y-0">{shown.map((event, index) => <div key={event.id} className="relative flex gap-3 pb-6 last:pb-0"><div className="relative flex w-5 shrink-0 justify-center"><span className={"relative z-10 mt-1.5 h-2.5 w-2.5 rounded-full " + (index === 0 ? "bg-[#397D76]" : "bg-slate-300")} />{index < shown.length - 1 && <span className="absolute bottom-0 top-4 w-px bg-slate-200" />}</div><div className="min-w-0 flex-1"><p className="text-sm font-semibold text-[#101319]">{event.title}</p>{event.detail && <p className="mt-1 text-sm leading-5 text-slate-500">{event.detail}</p>}<p className="mt-1.5 text-xs text-slate-400">{new Date(event.createdAt).toLocaleString()}</p></div></div>)}</div>
}

function ResourceRow({ resource }: { resource: SpaceResource }) {
  return <div className="flex min-w-0 items-center gap-3"><ProviderIcon provider={resource.provider} /><div className="min-w-0 flex-1"><p className="break-words text-sm font-semibold">{resource.name}</p><p className="mt-0.5 text-xs text-slate-400">{providerNames[resource.provider]}{resource.detail ? " · " + resource.detail : ""}</p></div>{resource.url && <a href={resource.url} target="_blank" rel="noreferrer" aria-label={"Open " + resource.name} className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-50 hover:text-[#101319]"><ExternalLink size={15} /></a>}</div>
}

function ProviderIcon({ provider }: { provider: SpaceResourceProvider }) {
  if (provider === "github") return <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white text-slate-800"><GitBranch size={18} /></span>
  if (provider === "vercel") return <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#101319] text-white"><Triangle size={17} fill="currentColor" /></span>
  return <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#EAF7F4] text-[#397D76]"><Layers3 size={18} /></span>
}

function MetricCard({ label, value, hint, icon }: { label: string; value: string; hint: string; icon: React.ReactNode }) {
  return <article className="rounded-2xl border border-slate-200/80 bg-white p-5"><div className="flex items-center justify-between gap-3"><p className="text-sm font-medium text-slate-500">{label}</p><span className="grid h-9 w-9 place-items-center rounded-xl bg-slate-50 text-slate-600">{icon}</span></div><p className="mt-5 text-2xl font-semibold tracking-tight">{value}</p><p className="mt-1 text-xs text-slate-400">{hint}</p></article>
}

function SearchIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="10.8" cy="10.8" r="6.5" /><path d="m16 16 4 4" strokeLinecap="round" /></svg>
}
