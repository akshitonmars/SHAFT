import { useCallback, useEffect, useState } from "react"
import type { FormEvent, ReactNode } from "react"
import type { User } from "firebase/auth"
import { loadUserData, readUserData, saveUserData } from "../lib/onboarding"
import type { ShaftProject, ShaftUserData } from "../lib/onboarding"
import AuroraBackground from "../components/auth/AuroraBackground"
import { fetchStatus, getAuthorizationUrl, rememberReturn } from "../lib/connectors"
import type { ConnectorId } from "../lib/connectors"

interface OnboardingProps {
  user: User
  onFinish: () => void
}

const ROLES = ["Founder", "Developer", "Designer", "Student", "Indie maker", "Other"]
const STEPS = ["Welcome", "Profile", "Project", "Tools"]
const NEXT = ["Tell us a little about you", "Name your first project", "Preview the tools you’ll connect"]

type ConnState = { state: "loading" | "connected" | "disconnected"; label?: string; reconnect?: boolean; busy?: boolean }
const initialConn: Record<ConnectorId, ConnState> = { github: { state: "loading" }, vercel: { state: "loading" }, supabase: { state: "loading" } }
const CONNECTORS: { id: ConnectorId; name: string; text: string; icon: ReactNode }[] = [
  { id: "github", name: "GitHub", text: "Repositories, commits and pull requests.", icon: <GitHubMark /> },
  { id: "vercel", name: "Vercel", text: "Hosting, deployments and delivery.", icon: <VercelMark /> },
  { id: "supabase", name: "Supabase", text: "Backend, database and project data.", icon: <SupabaseMark /> },
]

const CSS = `
@import url("https://fonts.googleapis.com/css2?family=Amaranth:wght@400;700&family=Inter:wght@400;500;600&display=swap");
@keyframes obRise { from { opacity: 0; filter: blur(8px); transform: translateY(14px); } to { opacity: 1; filter: none; transform: none; } }
.ob-rise { animation: obRise 0.8s cubic-bezier(0.22, 1, 0.36, 1) backwards; }
@media (prefers-reduced-motion: reduce) { .ob-rise { animation: none; } }
`

const primary =
  "inline-flex h-12 items-center justify-center gap-2.5 rounded-full bg-[#101319] px-7 text-[15px] font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_12px_30px_rgba(16,19,25,0.25)] transition-[transform,background-color] duration-300 hover:-translate-y-0.5 hover:bg-[#1a2030] active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#43B5FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F5F7FB]"
const ghost =
  "inline-flex h-12 items-center justify-center rounded-full px-5 text-[15px] font-medium text-slate-500 transition-colors hover:text-[#101319] disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#43B5FF]"
const panel = "rounded-[28px] border border-white/80 bg-white/60 p-6 shadow-[0_20px_60px_rgba(40,60,140,0.12)] backdrop-blur-2xl sm:p-8"
const field =
  "mt-2 w-full rounded-2xl border border-slate-900/10 bg-white/80 px-4 text-[15px] outline-none transition placeholder:text-slate-400 focus:border-[#648EFF] focus:ring-4 focus:ring-[#648EFF]/15"

export function Onboarding({ user, onFinish }: OnboardingProps) {
  const fallbackName = user.displayName || (user.email ? user.email.split("@")[0] : "")
  const initial = readUserData(user.uid)
  const [step, setStep] = useState(Math.min(initial.onboardingStep, 3))
  const [saved, setSaved] = useState(initial)
  const [name, setName] = useState(initial.name || fallbackName)
  const [role, setRole] = useState(initial.role)
  const [projectName, setProjectName] = useState("")
  const [description, setDescription] = useState("")
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)
  const [cloudReady, setCloudReady] = useState(false)
  const [notice, setNotice] = useState("")
  const [conn, setConn] = useState(initialConn)

  useEffect(() => {
    let active = true
    loadUserData(user.uid)
      .then((data) => {
        if (!active) return
        setSaved(data)
        setStep(Math.min(data.onboardingStep, 3))
        setName(data.name || user.displayName || (user.email ? user.email.split("@")[0] : ""))
        setRole(data.role)
        setCloudReady(true)
      })
      .catch(() => {
        if (!active) return
        setError("Couldn’t load your profile. Check your connection and try again.")
        setCloudReady(true)
      })
    return () => {
      active = false
    }
  }, [user.uid, user.displayName, user.email])

  // Move focus to the new step's heading for keyboard and screen-reader users.
  useEffect(() => {
    if (cloudReady) document.getElementById("ob-title")?.focus({ preventScroll: true })
  }, [step, cloudReady])

  const persist = async (patch: Partial<ShaftUserData>) => {
    try {
      const next = await saveUserData(user.uid, patch)
      setSaved(next)
      setError("")
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save your setup. Check your connection and try again.")
      return false
    }
  }

  const goToStep = async (next: number) => {
    setBusy(true)
    if (await persist({ onboardingStep: next })) setStep(next)
    setBusy(false)
  }

  const continueProfile = async (event: FormEvent) => {
    event.preventDefault()
    if (!name.trim()) return setError("Add your name to continue.")
    if (!role) return setError("Choose the role that best describes you.")
    setBusy(true)
    if (await persist({ name: name.trim(), role, onboardingStep: 2 })) setStep(2)
    setBusy(false)
  }

  const createFirstProject = async (event: FormEvent) => {
    event.preventDefault()
    if (!projectName.trim()) return setError("Give your project a name, or skip this step for now.")
    if (!description.trim()) return setError("Add a short description for your project.")
    const project: ShaftProject = {
      id: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : String(Date.now()),
      name: projectName.trim(),
      description: description.trim(),
      createdAt: new Date().toISOString(),
    }
    setBusy(true)
    if (await persist({ projects: [...saved.projects, project], onboardingStep: 3 })) setStep(3)
    setBusy(false)
  }

  const finish = async () => {
    setBusy(true)
    const ok = await persist({
      name: name.trim() || saved.name,
      role: role || saved.role,
      onboardingCompleted: true,
      onboardingStep: 4,
      completedAt: new Date().toISOString(),
    })
    setBusy(false)
    if (ok) onFinish()
  }

  const refreshConnectors = useCallback(async () => {
    const ids: ConnectorId[] = ["github", "vercel", "supabase"]
    const results = await Promise.allSettled(ids.map((id) => fetchStatus(user, id)))
    setConn(
      Object.fromEntries(
        ids.map((id, i) => {
          const r = results[i]
          const ok = r && r.status === "fulfilled" ? r.value : null
          return [id, { state: ok?.connected ? "connected" : "disconnected", label: ok?.label, reconnect: ok?.reconnectRequired }]
        })
      ) as Record<ConnectorId, ConnState>
    )
  }, [user])

  useEffect(() => {
    if (cloudReady && step === 3) void refreshConnectors()
  }, [cloudReady, step, refreshConnectors])

  // Coming back from a provider's authorization page.
  useEffect(() => {
    const p = new URLSearchParams(window.location.search)
    const id = p.get("connector")
    if (!id) return
    const label = CONNECTORS.find((c) => c.id === id)?.name ?? "Connector"
    setNotice(p.get("connected") === "1" ? label + " connected." : "Authorization with " + label + " wasn’t completed. You can try again.")
    window.history.replaceState({}, "", "/onboarding")
  }, [])

  const setBusyFor = (id: ConnectorId, value: boolean) => setConn((c) => ({ ...c, [id]: { ...c[id], busy: value } }))

  const connect = async (id: ConnectorId) => {
    setError("")
    setNotice("")
    setBusyFor(id, true)
    // Vercel installs in a popup, which must be opened directly from the click.
    const popup = id === "vercel" ? window.open("about:blank", "shaft-vercel-integration", "popup,width=520,height=760") : null
    if (id === "vercel" && !popup) {
      setError("Allow pop-ups for Shaft to connect Vercel.")
      setBusyFor(id, false)
      return
    }
    try {
      const url = await getAuthorizationUrl(user, id)
      if (popup) {
        popup.location.href = url
        const poll = window.setInterval(() => {
          if (popup.closed) {
            window.clearInterval(poll)
            setBusyFor(id, false)
            void refreshConnectors()
          }
        }, 500)
        return
      }
      rememberReturn("/onboarding", id)
      window.location.assign(url)
    } catch (err) {
      popup?.close()
      setError(err instanceof Error ? err.message : "Could not start the connection. Please try again.")
      setBusyFor(id, false)
    }
  }

  const anyConnected = Object.values(conn).some((c) => c.state === "connected")
  const firstName = (name || user.displayName || "there").trim().split(/\s+/)[0] || "there"
  const shell = "relative min-h-[100svh] overflow-hidden bg-[#F5F7FB] text-[#101319]"

  if (!cloudReady) {
    return (
      <main className={`${shell} grid place-items-center`} style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
        <style>{CSS}</style>
        <AuroraBackground />
        <p className="relative flex items-center gap-3 text-sm text-slate-600" role="status"><Spinner /> Loading your workspace…</p>
      </main>
    )
  }

  const title = "text-[clamp(34px,5vw,52px)] font-bold leading-[1.04] tracking-[-0.03em] outline-none"
  const display = { fontFamily: "Amaranth, sans-serif" }

  return (
    <main className={shell} style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
      <style>{CSS}</style>
      <AuroraBackground />

      <header className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-6 py-5 sm:px-10">
        <a href="/" aria-label="Shaft home" className="flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#43B5FF]">
          <img src="/logo.png" alt="" className="h-[30px] w-[30px] object-contain" />
          <span className="text-[24px] font-bold leading-none tracking-[-0.02em]" style={display}>Shaft</span>
        </a>
        <p className="max-w-[50%] truncate text-sm text-slate-500">{user.email}</p>
      </header>

      <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-[580px] flex-col justify-center px-6 pb-16 pt-24">
        <div className="flex items-center gap-4">
          <div className="flex flex-1 gap-1.5" role="progressbar" aria-label="Setup progress" aria-valuemin={1} aria-valuemax={4} aria-valuenow={step + 1}>
            {STEPS.map((label, i) => (
              <span key={label} className="h-1 flex-1 overflow-hidden rounded-full bg-slate-900/10">
                <span className={`block h-full rounded-full bg-gradient-to-r from-[#43B5FF] to-[#9A8CFF] transition-[width] duration-700 ${i <= step ? "w-full" : "w-0"}`} />
              </span>
            ))}
          </div>
          <span className="text-xs tabular-nums text-slate-500">{step + 1} of 4 · {STEPS[step]}</span>
        </div>

        <div key={step} className="ob-rise mt-10">
          {step > 0 && (
            <button type="button" disabled={busy} onClick={() => void goToStep(step - 1)} className="mb-6 inline-flex items-center gap-2 rounded-lg text-sm text-slate-500 transition-colors hover:text-[#101319] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#43B5FF]">
              <Arrow dir="left" /> Back
            </button>
          )}

          {error && (
            <p role="alert" className="mb-6 rounded-2xl border border-red-200/70 bg-white/80 px-4 py-3 text-sm text-red-700 backdrop-blur">{error}</p>
          )}

          {notice && <p role="status" className="mb-6 rounded-2xl border border-emerald-200/70 bg-white/80 px-4 py-3 text-sm text-emerald-800 backdrop-blur">{notice}</p>}

          {step === 0 && (
            <>
              <h1 id="ob-title" tabIndex={-1} className={title} style={display}>Welcome to Shaft{firstName !== "there" ? `, ${firstName}` : ""}.</h1>
              <p className="mt-4 max-w-[30rem] text-[17px] leading-relaxed text-slate-600">Let’s set up your workspace. It takes about a minute, and you can change everything later.</p>
              <ol className="mt-8 divide-y divide-slate-900/10 border-y border-slate-900/10">
                {NEXT.map((line, i) => (
                  <li key={line} className="flex items-center gap-4 py-3.5 text-[15px] text-slate-700">
                    <span className="w-5 text-sm tabular-nums text-slate-400">0{i + 1}</span>
                    {line}
                  </li>
                ))}
              </ol>
              <button type="button" disabled={busy} onClick={() => void goToStep(1)} className={`${primary} mt-9`}>
                {busy ? <Spinner /> : null} Get started <Arrow />
              </button>
            </>
          )}

          {step === 1 && (
            <>
              <h1 id="ob-title" tabIndex={-1} className={title} style={display}>Who’s building, {firstName}?</h1>
              <p className="mt-4 max-w-[30rem] text-[17px] leading-relaxed text-slate-600">This helps us tailor your workspace.</p>
              <form onSubmit={(e) => void continueProfile(e)} className={`${panel} mt-8`}>
                <label className="block text-sm font-medium">
                  Your name
                  <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" maxLength={80} placeholder="Your name" className={`${field} h-12`} />
                </label>
                <fieldset className="mt-6">
                  <legend className="text-sm font-medium">What best describes you?</legend>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {ROLES.map((item) => {
                      const on = role === item
                      return (
                        <button
                          key={item}
                          type="button"
                          aria-pressed={on}
                          onClick={() => setRole(item)}
                          className={`inline-flex h-11 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-[background-color,border-color,color,transform] duration-200 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#43B5FF] ${on ? "border-[#101319] bg-[#101319] text-white" : "border-slate-900/10 bg-white/80 text-slate-600 hover:border-slate-900/25 hover:text-[#101319]"}`}
                        >
                          {on && <Tick />}
                          {item}
                        </button>
                      )
                    })}
                  </div>
                </fieldset>
                <button type="submit" disabled={busy} className={`${primary} mt-8 w-full sm:w-auto`}>
                  {busy ? <Spinner /> : null} Continue <Arrow />
                </button>
              </form>
            </>
          )}

          {step === 2 && (
            <>
              <h1 id="ob-title" tabIndex={-1} className={title} style={display}>What are you building?</h1>
              <p className="mt-4 max-w-[30rem] text-[17px] leading-relaxed text-slate-600">Name your first project and add a little context. You can refine it as it grows.</p>
              <form onSubmit={(e) => void createFirstProject(e)} className={`${panel} mt-8`}>
                <label className="block text-sm font-medium">
                  Project name
                  <input value={projectName} onChange={(e) => setProjectName(e.target.value)} maxLength={100} placeholder="e.g. Orbit" className={`${field} h-12`} />
                </label>
                <label className="mt-5 block text-sm font-medium">
                  <span className="flex items-baseline justify-between">
                    Description
                    <span className="text-xs tabular-nums text-slate-400">{description.length}/1200</span>
                  </span>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} maxLength={1200} rows={4} placeholder="What is it, and who is it for?" className={`${field} resize-y py-3 leading-6`} />
                </label>
                <div className="mt-7 flex flex-col gap-2 sm:flex-row sm:items-center">
                  <button type="submit" disabled={busy} className={primary}>
                    {busy ? <Spinner /> : null} Create project <Arrow />
                  </button>
                  <button type="button" disabled={busy} onClick={() => void goToStep(3)} className={ghost}>Skip for now</button>
                </div>
              </form>
            </>
          )}

          {step === 3 && (
            <>
              <h1 id="ob-title" tabIndex={-1} className={title} style={display}>Your tools, in one place.</h1>
              <p className="mt-4 max-w-[30rem] text-[17px] leading-relaxed text-slate-600">Shaft brings the parts of a project together. Connect the ones you use. You can add more later in Workspace settings.</p>
              <div className="mt-8 space-y-3">
                {CONNECTORS.map((c) => (
                  <Connector key={c.id} icon={c.icon} name={c.name} text={c.text} conn={conn[c.id]} onConnect={() => void connect(c.id)} />
                ))}
              </div>
              <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:items-center">
                <button type="button" disabled={busy} onClick={() => void finish()} className={primary}>
                  {busy ? <Spinner /> : null} {busy ? "Finishing…" : "Continue to Shaft"} {!busy && <Arrow />}
                </button>
                {!anyConnected && <button type="button" disabled={busy} onClick={() => void finish()} className={ghost}>Skip for now</button>}
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  )
}

function Connector({ icon, name, text, conn, onConnect }: { icon: ReactNode; name: string; text: string; conn: ConnState; onConnect: () => void }) {
  return (
    <div className="flex items-center gap-4 rounded-3xl border border-white/80 bg-white/60 p-4 shadow-[0_16px_44px_rgba(40,60,140,0.1)] backdrop-blur-2xl">
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-slate-900/[0.06] bg-white shadow-sm">{icon}</span>
      <div className="min-w-0 flex-1">
        <h2 className="text-[17px] font-semibold tracking-tight">{name}</h2>
        <p className="truncate text-sm text-slate-500">{conn.state === "connected" && conn.label ? conn.label : text}</p>
      </div>
      {conn.state === "loading" ? (
        <span className="text-slate-400"><Spinner /></span>
      ) : conn.state === "connected" ? (
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-700"><Tick /> Connected</span>
      ) : (
        <button
          type="button"
          onClick={onConnect}
          disabled={conn.busy}
          className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full bg-[#101319] px-5 text-sm font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] transition-[transform,background-color] duration-300 hover:-translate-y-0.5 hover:bg-[#1a2030] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#43B5FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F5F7FB]"
        >
          {conn.busy && <Spinner />}
          {conn.reconnect ? "Reconnect" : "Connect"}
        </button>
      )}
    </div>
  )
}

function Arrow({ dir = "right" }: { dir?: "left" | "right" }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={`h-[18px] w-[18px] ${dir === "left" ? "rotate-180" : ""}`}>
      <path d="M4 10h12M11 5l5 5-5 5" />
    </svg>
  )
}
function Tick() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <path d="M4.5 10.5l3.5 3.5 7.5-8" />
    </svg>
  )
}
function Spinner() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-[18px] w-[18px] animate-spin">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}
function VercelMark() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="#000" className="h-5 w-5"><path d="m12 1.608 12 20.784H0Z" /></svg>
}
function SupabaseMark() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="#3FCF8E" className="h-6 w-6"><path d="M21.362 9.354H12V.396a.396.396 0 0 0-.716-.233L2.203 12.424l-.401.562a1.04 1.04 0 0 0 .836 1.659H12V21.6a.396.396 0 0 0 .716.233l9.081-12.261.401-.562a1.04 1.04 0 0 0-.836-1.656z" /></svg>
}
function GitHubMark() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="#101319" className="h-6 w-6"><path d="M12 .8a11.2 11.2 0 0 0-3.54 21.83c.56.1.77-.24.77-.54v-2.1c-3.13.68-3.79-1.33-3.79-1.33-.51-1.3-1.25-1.65-1.25-1.65-1.02-.7.08-.69.08-.69 1.13.08 1.72 1.16 1.72 1.16 1 .1.76 2.4 3.03 1.82.1-.73.4-1.22.72-1.5-2.5-.28-5.13-1.25-5.13-5.56 0-1.23.44-2.24 1.16-3.03-.12-.29-.5-1.44.11-3 0 0 .95-.3 3.08 1.16a10.7 10.7 0 0 1 5.6 0c2.13-1.45 3.08-1.16 3.08-1.16.61 1.56.23 2.71.11 3 .72.79 1.16 1.8 1.16 3.03 0 4.32-2.63 5.28-5.14 5.56.4.35.76 1.03.76 2.08v3.1c0 .3.2.65.77.54A11.2 11.2 0 0 0 12 .8Z" /></svg>
}

export default Onboarding
