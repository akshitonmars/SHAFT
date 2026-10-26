import { useEffect, useState } from "react"
import type { User } from "firebase/auth"
import { Database, ExternalLink, RefreshCw, Unplug } from "lucide-react"

type SupabaseProject = { id: string; name: string; region?: string; status?: string }

export default function SupabaseConnectorPanel({ user, onOpenDatabase }: { user: User; onOpenDatabase: () => void }) {
  const [status, setStatus] = useState<"loading" | "connected" | "disconnected">("loading")
  const [projects, setProjects] = useState<SupabaseProject[]>([])
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState("")

  const request = async (path: string, init?: RequestInit) => {
    const token = await user.getIdToken()
    const response = await fetch(path, {
      ...init,
      headers: { Authorization: "Bearer " + token, ...(init?.headers || {}) },
    })
    const result = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(result.error || "The request failed. Please try again.")
    return result
  }

  const load = async (quiet = false) => {
    if (!quiet) setStatus("loading")
    try {
      const result = await request("/api/connectors/supabase/projects")
      setStatus(result.connected ? "connected" : "disconnected")
      setProjects(Array.isArray(result.projects) ? result.projects : [])
      if (result.reconnectRequired) setMessage("Your Supabase session expired. Connect it again.")
    } catch (error) {
      setStatus("disconnected")
      setMessage(error instanceof Error ? error.message : "Could not check your Supabase connection.")
    }
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get("connector") === "supabase") {
      if (params.get("status") === "connected") setMessage("Supabase connected successfully.")
      else if (params.get("status") === "denied") setMessage("Supabase connection was cancelled.")
      else if (params.get("status") === "error") setMessage(params.get("reason") || "Supabase connection failed.")
    }
    void load()
  }, [user.uid])

  const connect = async () => {
    setBusy(true)
    setMessage("")
    try {
      const result = await request("/api/connectors/supabase/connect", { method: "POST" })
      if (!result.authorizationUrl) throw new Error("SHAFT could not start Supabase authorization.")
      window.location.assign(result.authorizationUrl)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not start the Supabase connection.")
      setBusy(false)
    }
  }

  const disconnect = async () => {
    setBusy(true)
    setMessage("")
    try {
      await request("/api/connectors/supabase/disconnect", { method: "POST" })
      setStatus("disconnected")
      setProjects([])
      setMessage("Supabase disconnected from SHAFT.")
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not disconnect Supabase.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div><p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#397D76]">Database and backend</p><h2 className="mt-2 text-xl font-semibold">Supabase</h2><p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">Connect once to view your Supabase projects here, then explore a project’s database when you need it.</p></div>
        <button type="button" onClick={() => { setMessage(""); void load() }} disabled={status === "loading" || busy} className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 disabled:opacity-50"><RefreshCw size={15} className={status === "loading" ? "animate-spin" : ""} /> Refresh</button>
      </div>
      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#EAF7F4] text-[#397D76]"><Database size={23} /></span>
          <div className="min-w-0 flex-1">
            <p className="font-semibold">{status === "loading" ? "Checking Supabase connection…" : status === "connected" ? "Supabase connected" : "Connect your Supabase account"}</p>
            <p className="mt-1 text-sm leading-5 text-slate-500">{status === "connected" ? String(projects.length) + " project" + (projects.length === 1 ? "" : "s") + " available to SHAFT." : "Authorize SHAFT to view the projects your account can access. Credentials remain server-side."}</p>
          </div>
          {status === "connected" ? <button type="button" onClick={() => void disconnect()} disabled={busy} className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-600 disabled:opacity-50"><Unplug size={15} /> {busy ? "Working…" : "Disconnect"}</button> : <button type="button" onClick={() => void connect()} disabled={busy || status === "loading"} className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#101319] px-4 text-sm font-semibold text-white disabled:opacity-50">{busy ? "Connecting…" : "Connect Supabase"}</button>}
        </div>
        {message && <p role="status" className="mt-4 break-words rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm leading-5 text-slate-600">{message}</p>}
      </section>
      {status === "connected" && <section className="mt-7">
        <div className="flex items-center justify-between gap-3"><div><h3 className="font-semibold">Your Supabase projects</h3><p className="mt-1 text-sm text-slate-500">Project access returned by the Supabase API.</p></div><button type="button" onClick={onOpenDatabase} className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition hover:border-[#BCDAD5] hover:text-[#245C55]">Explore database <ExternalLink size={13} /></button></div>
        {projects.length ? <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{projects.map((project) => <article key={project.id} className="rounded-2xl border border-slate-200 bg-white p-4"><div className="flex items-start gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#EAF7F4] text-[#397D76]"><Database size={17} /></span><div className="min-w-0 flex-1"><h4 className="break-words text-sm font-semibold">{project.name}</h4><p className="mt-1 text-xs text-slate-400">{project.region || "Region unavailable"}{project.status ? " · " + project.status : ""}</p></div></div></article>)}</div> : <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center"><Database size={22} className="mx-auto text-slate-400" /><p className="mt-3 text-sm font-semibold">No projects returned</p><p className="mt-1 text-sm text-slate-500">Check that the connected account has access to a Supabase project.</p></div>}
      </section>}
    </div>
  )
}
