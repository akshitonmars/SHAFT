import { useCallback, useEffect, useState } from "react"
import type { User } from "firebase/auth"
import { ArrowLeft, ExternalLink, RefreshCw, Triangle, Unplug, Layers3 } from "lucide-react"

type Project = { id: string; name: string; framework?: string | null; updatedAt?: number | string | null }
export function VercelConnector({ user }: { user: User }) {
  const [status, setStatus] = useState<"loading" | "connected" | "disconnected">("loading")
  const [projects, setProjects] = useState<Project[]>([])
  const [accountName, setAccountName] = useState("")
  const [email, setEmail] = useState("")
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState("")
  const api = useCallback(async (path: string, init?: RequestInit) => {
    const token = await user.getIdToken()
    const response = await fetch(path, { ...init, headers: { Authorization: "Bearer " + token, ...(init?.headers || {}) } })
    const result = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(result.error || "Request failed. Please try again.")
    return result
  }, [user])
  const load = useCallback(async () => {
    setStatus("loading"); setMessage("")
    try {
      const result = await api("/api/connectors/vercel/projects")
      if (result.connected) {
        setStatus("connected"); setProjects(Array.isArray(result.projects) ? result.projects : [])
        setAccountName(result.accountName || ""); setEmail(result.email || "")
      } else {
        setStatus("disconnected"); setProjects([])
        if (result.reconnectRequired) setMessage("Your Vercel session expired. Connect again.")
      }
    } catch (error) { setStatus("disconnected"); setMessage(error instanceof Error ? error.message : "Could not check your Vercel connection.") }
  }, [api])
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get("connected") === "1") setMessage("Vercel connected successfully.")
    else if (params.get("error") === "configuration_required") setMessage("Vercel OAuth is not configured. Check VERCEL_CLIENT_ID and VERCEL_CLIENT_SECRET.")
    else if (params.get("error")) setMessage("Vercel authorization failed. Check the registered callback URL and app permissions.")
    if (params.has("connected") || params.has("error")) window.history.replaceState({}, "", "/vercel")
    void load()
  }, [load])
  const connect = async () => {
    setBusy(true); setMessage("")
    try {
      const result = await api("/api/connectors/vercel/connect", { method: "POST" })
      if (!result.authorizationUrl) throw new Error("SHAFT could not start Vercel authorization.")
      window.location.assign(result.authorizationUrl)
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not start Vercel connection."); setBusy(false) }
  }
  const disconnect = async () => {
    setBusy(true); setMessage("")
    try {
      await api("/api/connectors/vercel/disconnect", { method: "POST" })
      setStatus("disconnected"); setProjects([]); setAccountName(""); setEmail(""); setMessage("Vercel disconnected from SHAFT.")
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not disconnect Vercel.") }
    finally { setBusy(false) }
  }
  return <main className="min-h-screen bg-[#F5F7FB] px-4 py-6 text-[#101319] sm:px-8 sm:py-10"><div className="mx-auto max-w-5xl">
    <a href="/workspace" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-[#101319]"><ArrowLeft size={16}/> Back to workspace</a>
    <div className="mt-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="text-xs font-semibold uppercase tracking-[0.17em] text-[#397D76]">Developer tools</p><h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] sm:text-5xl" style={{fontFamily:"Amaranth, sans-serif"}}>Vercel connector</h1><p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">Connect your Vercel account to bring your projects into SHAFT. OAuth credentials and access tokens stay server-side.</p></div><button type="button" onClick={() => void load()} disabled={status === "loading" || busy} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 disabled:opacity-50"><RefreshCw size={15} className={status === "loading" ? "animate-spin" : ""}/> Refresh</button></div>
    <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6"><div className="flex flex-col gap-4 sm:flex-row sm:items-center"><span className="grid h-12 w-12 place-items-center rounded-xl bg-[#101319] text-white"><Triangle size={22} fill="currentColor"/></span><div className="min-w-0 flex-1"><p className="font-semibold">{status === "loading" ? "Checking Vercel connection…" : status === "connected" ? "Vercel connected" : "Connect your Vercel account"}</p><p className="mt-1 text-sm leading-5 text-slate-500">{status === "connected" ? [accountName, email].filter(Boolean).join(" · ") || "Authorization is active." : "Authorize SHAFT through your Vercel OAuth app. Tokens are stored in SHAFT's server-side connector secret store."}</p></div>{status === "connected" ? <button type="button" onClick={() => void disconnect()} disabled={busy} className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-600 disabled:opacity-50"><Unplug size={15}/>{busy ? "Working…" : "Disconnect"}</button> : <button type="button" onClick={() => void connect()} disabled={busy || status === "loading"} className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#101319] px-4 text-sm font-semibold text-white disabled:opacity-50"><Triangle size={15}/>{busy ? "Connecting…" : "Connect Vercel"}</button>}</div>{message && <p role="status" className="mt-4 break-words rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm leading-5 text-slate-600">{message}</p>}</section>
    {status === "connected" && <section className="mt-8"><div><h2 className="text-xl font-semibold tracking-tight">Your Vercel projects</h2><p className="mt-1 text-sm text-slate-500">{projects.length} projects returned by the Vercel API.</p></div>{projects.length ? <div className="mt-4 grid gap-3 md:grid-cols-2">{projects.map(project => <article key={project.id} className="rounded-2xl border border-slate-200 bg-white p-5"><div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-50 text-slate-700"><Layers3 size={18}/></span><div className="min-w-0 flex-1"><h3 className="break-words font-semibold">{project.name}</h3><p className="mt-1 text-xs text-slate-400">{project.framework || "Framework not specified"}{project.updatedAt ? " · Updated " + new Date(project.updatedAt).toLocaleDateString() : ""}</p></div><a href="https://vercel.com/dashboard" target="_blank" rel="noreferrer" aria-label={"Open Vercel dashboard for " + project.name} className="rounded-lg p-2 text-slate-400 hover:bg-slate-50 hover:text-[#101319]"><ExternalLink size={16}/></a></div></article>)}</div> : <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center"><Triangle size={24} className="mx-auto text-slate-400"/><p className="mt-3 font-semibold">No projects returned</p><p className="mt-1 text-sm text-slate-500">Check the Vercel account and the permissions granted to this OAuth app.</p></div>}</section>}
    <p className="mt-6 text-xs leading-5 text-slate-400">Disconnecting removes SHAFT’s stored Vercel token. It does not delete any Vercel projects.</p>
  </div></main>
}
export default VercelConnector
