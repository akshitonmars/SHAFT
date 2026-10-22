import { useState, type ReactNode } from "react"
import type { User } from "firebase/auth"
import {
  ArrowLeft, ArrowRight, Check, Database, FolderPlus, Layers3,
  Lightbulb, Plug, Sparkles, Triangle, Zap,
} from "lucide-react"
import { readUserData, saveUserData } from "../lib/onboarding"
import type { ShaftProject, ShaftUserData } from "../lib/onboarding"

interface OnboardingProps {
  user: User
  onFinish: () => void
}

const roles = ["Founder", "Developer", "Designer", "Student", "Indie Maker", "Other"]

export function Onboarding({ user, onFinish }: OnboardingProps) {
  const initial = readUserData(user.uid)
  const [step, setStep] = useState(Math.min(initial.onboardingStep, 3))
  const [saved, setSaved] = useState(initial)
  const [name, setName] = useState(initial.name || user.displayName || (user.email ? user.email.split("@")[0] : ""))
  const [role, setRole] = useState(initial.role)
  const [projectName, setProjectName] = useState("")
  const [description, setDescription] = useState("")
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)

  const persist = (patch: Partial<ShaftUserData>) => {
    try {
      const next = saveUserData(user.uid, patch)
      setSaved(next)
      setError("")
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save your setup on this device.")
      return false
    }
  }

  const goToStep = (next: number) => {
    if (persist({ onboardingStep: next })) setStep(next)
  }

  const continueProfile = () => {
    if (!name.trim()) {
      setError("Add your name to continue.")
      return
    }
    if (!role) {
      setError("Choose the role that best describes you.")
      return
    }
    if (persist({ name: name.trim(), role, onboardingStep: 2 })) setStep(2)
  }

  const createFirstProject = () => {
    if (!projectName.trim()) {
      setError("Give your project a name, or skip this step for now.")
      return
    }
    if (!description.trim()) {
      setError("Add a short description for your project.")
      return
    }
    const project: ShaftProject = {
      id: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : String(Date.now()),
      name: projectName.trim(),
      description: description.trim(),
      createdAt: new Date().toISOString(),
    }
    if (persist({ projects: [...saved.projects, project], onboardingStep: 3 })) setStep(3)
  }

  const finish = () => {
    setBusy(true)
    const ok = persist({
      name: name.trim() || saved.name,
      role: role || saved.role,
      onboardingCompleted: true,
      onboardingStep: 4,
      completedAt: new Date().toISOString(),
    })
    setBusy(false)
    if (ok) onFinish()
  }

  const back = () => {
    if (step > 0) goToStep(step - 1)
  }
  const firstName = (name || user.displayName || "there").trim().split(/\s+/)[0] || "there"
  const progress = [8, 34, 60, 84][step]

  return (
    <main className="min-h-screen bg-[#F5F7FB] text-[#101319]" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
        <a href="/" aria-label="SHAFT home" className="inline-flex items-center gap-2.5">
          <img src="/logo.png" alt="" className="h-9 w-9 object-contain" />
          <span className="text-2xl font-bold tracking-tight" style={{ fontFamily: "Amaranth, sans-serif" }}>Shaft</span>
        </a>
        <div className="hidden items-center gap-3 sm:flex">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Workspace setup</span>
          <span className="h-1 w-24 overflow-hidden rounded-full bg-slate-200"><span className="block h-full rounded-full bg-[#397D76] transition-all duration-500" style={{ width: progress + "%" }} /></span>
          <span className="text-xs tabular-nums text-slate-500">{step + 1} / 4</span>
        </div>
      </header>

      <div className="mx-auto flex min-h-[calc(100vh-76px)] w-full max-w-6xl items-center px-5 pb-12 pt-5 sm:px-8 sm:pb-16">
        <section className="mx-auto w-full max-w-3xl">
          {step > 0 && <button type="button" onClick={back} className="mb-8 inline-flex items-center gap-2 rounded-lg text-sm text-slate-500 transition hover:text-[#101319]"><ArrowLeft size={16} /> Back</button>}
          {error && <p role="alert" className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

          {step === 0 && (
            <div className="grid items-center gap-12 md:grid-cols-[1.05fr_0.95fr]">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-[#78CFC4]/50 bg-white/70 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#346B65]"><Sparkles size={14} /> A new beginning</span>
                <h1 className="mt-7 text-5xl font-semibold leading-[1.04] tracking-[-0.055em] sm:text-6xl" style={{ fontFamily: "Amaranth, sans-serif" }}>Welcome to<br />SHAFT<span className="text-[#4B948B]">.</span></h1>
                <p className="mt-6 max-w-lg text-lg leading-8 text-slate-600">Every great project starts with an idea. We're here to help you turn yours into reality.</p>
                <p className="mt-3 text-sm text-slate-500">A little setup now. A clearer place to build next.</p>
                <button type="button" onClick={() => goToStep(1)} className="mt-9 inline-flex h-12 items-center gap-3 rounded-full bg-[#101319] px-6 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 transition hover:-translate-y-0.5 hover:bg-[#252B35]">Let's get started <ArrowRight size={17} /></button>
              </div>
              <div className="relative hidden min-h-[360px] items-center justify-center md:flex">
                <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#78CFC4]/30" />
                <div className="absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full border border-slate-200" />
                <div className="relative z-10 w-full max-w-[300px] space-y-3">
                  <MiniStep icon={<Lightbulb size={19} />} tint="bg-[#EAF7F4] text-[#397D76]" title="An idea" subtitle="Something worth building" />
                  <div className="ml-8"><MiniStep icon={<Layers3 size={19} />} tint="bg-slate-100 text-slate-700" title="A project" subtitle="A home for the moving parts" /></div>
                  <div className="ml-16"><MiniStep icon={<Zap size={19} />} tint="bg-white text-[#397D76]" title="Real progress" subtitle="One step at a time" /></div>
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="mx-auto max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#397D76]">First, a little about you</p>
              <h1 className="mt-4 text-4xl font-semibold tracking-[-0.045em] sm:text-5xl" style={{ fontFamily: "Amaranth, sans-serif" }}>Who are you, {firstName}?</h1>
              <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">Let's make your SHAFT workspace feel like yours. You can change these details later.</p>
              <div className="mt-9 rounded-3xl border border-white bg-white/80 p-5 shadow-[0_18px_55px_rgba(16,19,25,0.06)] sm:p-8">
                <label className="block text-sm font-semibold text-slate-700">What should we call you?
                  <input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" maxLength={80} placeholder="Your name" className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-normal outline-none transition placeholder:text-slate-400 focus:border-[#5D9991] focus:ring-4 focus:ring-[#78CFC4]/20" />
                </label>
                <div className="mt-7">
                  <p className="text-sm font-semibold text-slate-700">Which best describes you?</p>
                  <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {roles.map((item) => {
                      const selected = role === item
                      return <button key={item} type="button" aria-pressed={selected} onClick={() => setRole(item)} className={"flex min-h-12 items-center justify-between gap-2 rounded-xl border px-3 text-left text-sm font-medium transition " + (selected ? "border-[#397D76] bg-[#EEF8F6] text-[#245C55] ring-2 ring-[#78CFC4]/20" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50")}>{item}{selected && <Check size={15} />}</button>
                    })}
                  </div>
                </div>
                <button type="button" onClick={continueProfile} className="mt-8 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#101319] px-5 text-sm font-semibold text-white transition hover:bg-[#252B35] sm:w-auto">Continue <ArrowRight size={16} /></button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="mx-auto max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#397D76]">Make it real</p>
              <h1 className="mt-4 text-4xl font-semibold tracking-[-0.045em] sm:text-5xl" style={{ fontFamily: "Amaranth, sans-serif" }}>What are you building?</h1>
              <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">Give your first project a name and a little context. You can refine it as it grows.</p>
              <div className="mt-9 rounded-3xl border border-white bg-white/80 p-5 shadow-[0_18px_55px_rgba(16,19,25,0.06)] sm:p-8">
                <label className="block text-sm font-semibold text-slate-700">Project name
                  <input value={projectName} onChange={(event) => setProjectName(event.target.value)} maxLength={100} placeholder="e.g. My next big idea" className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-normal outline-none transition placeholder:text-slate-400 focus:border-[#5D9991] focus:ring-4 focus:ring-[#78CFC4]/20" />
                </label>
                <label className="mt-5 block text-sm font-semibold text-slate-700">Description
                  <textarea value={description} onChange={(event) => setDescription(event.target.value)} maxLength={1200} rows={4} placeholder="What are you trying to build, and why?" className="mt-2 w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-normal leading-6 outline-none transition placeholder:text-slate-400 focus:border-[#5D9991] focus:ring-4 focus:ring-[#78CFC4]/20" />
                </label>
                <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <button type="button" onClick={createFirstProject} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#101319] px-5 text-sm font-semibold text-white transition hover:bg-[#252B35]"><FolderPlus size={17} /> Create project <ArrowRight size={16} /></button>
                  <button type="button" onClick={() => goToStep(3)} className="inline-flex h-12 items-center justify-center rounded-xl px-4 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-[#101319]">Skip for now</button>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="mx-auto max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#397D76]">Bring your workflow together</p>
              <h1 className="mt-4 text-4xl font-semibold tracking-[-0.045em] sm:text-5xl" style={{ fontFamily: "Amaranth, sans-serif" }}>Let's connect your tools.</h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">SHAFT is designed to bring the pieces of a project into one place. We'll set up these connections in a later step.</p>
              <div className="mt-9 grid gap-4 sm:grid-cols-2">
                <ConnectorCard icon={<Database size={22} />} iconClass="bg-[#E9F8F0] text-[#21845B]" name="Supabase" description="Backend, database and project data." />
                <ConnectorCard icon={<Triangle size={20} fill="currentColor" />} iconClass="bg-slate-100 text-[#101319]" name="Vercel" description="Hosting, deployments and delivery." />
              </div>
              <p className="mt-5 flex items-start gap-2 text-xs leading-5 text-slate-500"><Plug size={15} className="mt-0.5 shrink-0" /> These are previews only. No account access or credentials are requested, and neither tool is connected yet.</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <button type="button" disabled={busy} onClick={finish} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#101319] px-6 text-sm font-semibold text-white transition hover:bg-[#252B35] disabled:cursor-wait disabled:opacity-60">{busy ? "Finishing setup…" : "Continue to SHAFT"} <ArrowRight size={16} /></button>
                <button type="button" disabled={busy} onClick={finish} className="inline-flex h-12 items-center justify-center rounded-xl px-4 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-[#101319] disabled:opacity-50">Skip for now</button>
              </div>
            </div>
          )}

          <p className="mt-12 border-t border-slate-200/80 pt-4 text-xs leading-5 text-slate-400">Your setup and projects are currently saved in this browser on this device. Cloud sync is not connected yet.</p>
        </section>
      </div>
    </main>
  )
}

function MiniStep({ icon, tint, title, subtitle }: { icon: ReactNode; tint: string; title: string; subtitle: string }) {
  return <div className="rounded-2xl border border-white bg-white/90 p-4 shadow-[0_18px_50px_rgba(16,19,25,0.07)]"><div className="flex items-center gap-3"><span className={"grid h-10 w-10 place-items-center rounded-xl " + tint}>{icon}</span><span><span className="block font-semibold">{title}</span><span className="mt-0.5 block text-xs text-slate-500">{subtitle}</span></span></div></div>
}

function ConnectorCard({ icon, iconClass, name, description }: { icon: ReactNode; iconClass: string; name: string; description: string }) {
  return <div className="rounded-2xl border border-white bg-white/80 p-5 shadow-[0_15px_45px_rgba(16,19,25,0.05)]">
    <div className="flex items-start justify-between gap-3"><span className={"grid h-12 w-12 place-items-center rounded-2xl " + iconClass}>{icon}</span><span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500"><span className="h-1.5 w-1.5 rounded-full bg-slate-400" /> Not connected</span></div>
    <h2 className="mt-5 text-lg font-semibold tracking-tight">{name}</h2><p className="mt-1 min-h-10 text-sm leading-6 text-slate-500">{description}</p>
    <button type="button" disabled className="mt-4 inline-flex h-10 cursor-not-allowed items-center gap-2 rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-400"><Plug size={14} /> Setup coming later</button>
  </div>
}

export default Onboarding
