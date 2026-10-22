import { useCallback, useEffect, useState } from "react"
import type { User } from "firebase/auth"
import { ArrowLeft, ExternalLink, Github, GitBranch, LockKeyhole, RefreshCw, Unplug } from "lucide-react"

type Repository = {
  id: number
  name: string
  fullName: string
  description: string | null
  private: boolean
  htmlUrl: string
  defaultBranch: string
  updatedAt: string
  language: string | null
  stargazersCount: number
}

interface GitHubConnectorProps { user: User }

export function GitHubConnector({ user }: GitHubConnectorProps) {
  const [status, setStatus] = useState<"loading" | "connected" | "disconnected">("loading")
  const [username, setUsername] = useState("")
  const [avatarUrl, setAvatarUrl] = useState("")
  const [repositories, setRepositories] = useState<Repository[]>([])
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState("")
  const [filter, setFilter] = useState("")

  const api = useCallback(async (path: string, init?: RequestInit) => {
    const token = await user.getIdToken()
    const response = await fetch(path, {
      ...init,
      headers: { Authorization: "Bearer " + token, ...(init?.headers || {}) },
    })
    const result = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(result.error || "The request failed. Please try again.")
    return result
  }, [user])

  const load = useCallback(async () => {
    setStatus("loading")
    setMessage("")
    try {
      const result = await api("/api/connectors/github/status")
      if (result.connected) {
        setStatus("connected")
        setUsername(result.username || "")
        setAvatarUrl(result.avatarUrl || "")
        const repoResult = await api("/api/connectors/github/repositories")
        setRepositories(Array.isArray(repoResult.repositories) ? repoResult.repositories : [])
      } else {
        setStatus("disconnected")
        setUsername("")
        setAvatarUrl("")
        setRepositories([])
        if (result.reconnectRequired) setMessage("Your GitHub authorization expired. Connect again to continue.")
      }
    } catch (error) {
      setStatus("disconnected")
      setMessage(error instanceof Error ? error.message : "Could not check your GitHub connection.")
    }
  }, [api])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get("connected") === "1") setMessage("GitHub connected successfully.")
    else if (params.get("error") === "configuration_required") setMessage("GitHub OAuth is not configured yet. Add GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET to Vercel.")
    else if (params.get("error")) setMessage("GitHub authorization was not completed. You can try again.")
    if (params.has("connected") || params.has("error")) {
      window.history.replaceState({}, "", "/github")
    }
    void load()
  }, [load])

  const connect = async () => {
    setBusy(true)
    setMessage("")
    try {
      const result = await api("/api/connectors/github/connect", { method: "POST" })
      if (!result.authorizationUrl) throw new Error("SHAFT could not start GitHub authorization.")
      window.location.assign(result.authorizationUrl)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not start GitHub connection.")
      setBusy(false)
    }
  }

  const disconnect = async () => {
    setBusy(true)
    setMessage("")
    try {
      await api("/api/connectors/github/disconnect", { method: "POST" })
      setStatus("disconnected")
      setUsername("")
      setAvatarUrl("")
      setRepositories([])
      setMessage("GitHub has been disconnected from SHAFT.")
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not disconnect GitHub.")
    } finally {
      setBusy(false)
    }
  }

  const filtered = repositories.filter((repo) =>
    (repo.fullName + " " + (repo.description || "") + " " + (repo.language || "")).toLowerCase().includes(filter.toLowerCase())
  )

  return <main className="min-h-screen bg-[#F5F7FB] px-4 py-6 text-[#101319] sm:px-8 sm:py-10">
    <div className="mx-auto max-w-5xl">
      <a href="/workspace" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-[#101319]"><ArrowLeft size={16} /> Back to workspace</a>
      <div className="mt-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div><p className="text-xs font-semibold uppercase tracking-[0.17em] text-[#397D76]">Developer tools</p><h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] sm:text-5xl" style={{ fontFamily: "Amaranth, sans-serif" }}>GitHub connector</h1><p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">Bring your repositories into SHAFT. Start by connecting your account and viewing the repositories you can access.</p></div>
        <button type="button" onClick={() => void load()} disabled={status === "loading" || busy} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 disabled:opacity-50"><RefreshCw size={15} className={status === "loading" ? "animate-spin" : ""} /> Refresh</button>
      </div>

      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          {avatarUrl ? <img src={avatarUrl} alt="" className="h-12 w-12 rounded-full border border-slate-200" /> : <span className="grid h-12 w-12 place-items-center rounded-xl bg-[#101319] text-white"><Github size={24} /></span>}
          <div className="min-w-0 flex-1"><p className="font-semibold">{status === "loading" ? "Checking GitHub connection…" : status === "connected" ? "Connected as @" + username : "Connect your GitHub account"}</p><p className="mt-1 text-sm leading-5 text-slate-500">{status === "connected" ? "SHAFT can securely request your repository list through its server-side connector." : "Authorize SHAFT through GitHub OAuth. Your access token stays on SHAFT's server and is never sent to the browser."}</p></div>
          {status === "connected" ? <button type="button" onClick={() => void disconnect()} disabled={busy} className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-600 disabled:opacity-50"><Unplug size={15} /> {busy ? "Working…" : "Disconnect"}</button> : <button type="button" onClick={() => void connect()} disabled={busy || status === "loading"} className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#101319] px-4 text-sm font-semibold text-white transition hover:bg-[#252B35] disabled:opacity-50"><Github size={16} /> {busy ? "Connecting…" : "Connect GitHub"}</button>}
        </div>
        {message && <p role="status" className="mt-4 break-words rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm leading-5 text-slate-600">{message}</p>}
        {status !== "connected" && <div className="mt-5 flex items-start gap-3 rounded-xl bg-[#F3FAF8] p-4"><LockKeyhole size={17} className="mt-0.5 shrink-0 text-[#397D76]" /><p className="text-xs leading-5 text-slate-600">This first version requests repository access, including private repositories, plus basic profile access. You can disconnect it here at any time. SHAFT does not push code or modify repositories yet.</p></div>}
      </section>

      {status === "connected" && <section className="mt-8">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><h2 className="text-xl font-semibold tracking-tight">Your repositories</h2><p className="mt-1 text-sm text-slate-500">{repositories.length} loaded from GitHub · sorted by recent activity</p></div><input value={filter} onChange={(event) => setFilter(event.target.value)} placeholder="Filter repositories…" aria-label="Filter repositories" className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#5D9991] sm:max-w-xs" /></div>
        {filtered.length === 0 ? <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center"><Github size={24} className="mx-auto text-slate-400" /><p className="mt-3 font-semibold">{repositories.length ? "No matching repositories" : "No repositories found"}</p><p className="mt-1 text-sm text-slate-500">Try a different search or check repository access in GitHub.</p></div> : <div className="mt-4 grid gap-3 md:grid-cols-2">{filtered.map((repo) => <article key={repo.id} className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-[#BCDAD5]"><div className="flex items-start justify-between gap-3"><div className="flex min-w-0 items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-50 text-slate-700"><GitBranch size={18} /></span><div className="min-w-0"><h3 className="break-words font-semibold">{repo.fullName}</h3><p className="mt-1 text-xs text-slate-400">{repo.private ? "Private repository" : "Public repository"}{repo.language ? " · " + repo.language : ""}</p></div></div><a href={repo.htmlUrl} target="_blank" rel="noreferrer" aria-label={"Open " + repo.fullName + " on GitHub"} className="shrink-0 rounded-lg p-2 text-slate-400 transition hover:bg-slate-50 hover:text-[#101319]"><ExternalLink size={16} /></a></div><p className="mt-4 min-h-10 text-sm leading-5 text-slate-500">{repo.description || "No description provided."}</p><div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-400"><span>Branch: {repo.defaultBranch || "unknown"}</span><span>Updated {repo.updatedAt ? new Date(repo.updatedAt).toLocaleDateString() : "—"}</span></div></article>)}</div>}
      </section>}
    </div>
  </main>
}

export default GitHubConnector
