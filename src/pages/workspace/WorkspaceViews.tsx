import { useState, type ReactNode } from "react"
import type { User } from "firebase/auth"
import {
  ArrowRight, ArrowUpRight, Clock3, Code2, FolderKanban,
  Gauge, Lightbulb, Plus, Search, UserRound, ShieldCheck,
} from "lucide-react"
import type { ShaftProject, ShaftUserData } from "../../lib/onboarding"

type SimpleRoute = "overview" | "spaces" | "artifacts" | "tasks" | "connectors" | "settings" | "profile"

export function OverviewPage({
  data, displayName, connectedTools, onCreate, onNavigate,
}: {
  data: ShaftUserData
  displayName: string
  connectedTools: number
  onCreate: () => void
  onNavigate: (route: SimpleRoute) => void
}) {
  return (
    <>
      <div className="mb-7 flex flex-col gap-3 rounded-2xl border border-[#E0EBE9] bg-[#F0F8F6] px-4 py-3 sm:flex-row sm:items-center">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-[#397D76]"><ShieldCheck size={17} /></div>
        <p className="text-xs leading-5 text-slate-600"><strong className="font-semibold text-[#245C55]">Cloud workspace:</strong> your profile and Spaces sync to your SHAFT account. Connect your tools to bring your project stack together.</p>
      </div>
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.17em] text-[#397D76]">Your workspace</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] sm:text-5xl" style={{ fontFamily: "Amaranth, sans-serif" }}>Let's build, {displayName.split(/\s+/)[0]}.</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">Your ideas deserve more than a notes app. Start a Space and bring the moving parts together.</p>
        </div>
        <button type="button" onClick={onCreate} className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#101319] px-5 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 transition hover:-translate-y-0.5 hover:bg-[#252B35]"><Plus size={17} /> Start a Space</button>
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <StatCard label="Spaces" value={String(data.projects.length)} hint="Created in this workspace" icon={<FolderKanban size={18} />} />
        <StatCard label="Connected tools" value={String(connectedTools)} hint={connectedTools ? "Services connected to SHAFT" : "Connect your development stack"} icon={<Gauge size={18} />} />
        <StatCard label="Ideas captured" value="0" hint="Idea capture is on the roadmap" icon={<Lightbulb size={18} />} />
      </div>
      <div className="mt-10">
        <div className="flex items-center justify-between gap-4">
          <div><h2 className="text-xl font-semibold tracking-tight">Recent Spaces</h2><p className="mt-1 text-sm text-slate-500">Pick up where you left off.</p></div>
          <button type="button" onClick={() => onNavigate("spaces")} className="inline-flex items-center gap-1 rounded-lg px-2 py-2 text-sm font-semibold text-slate-500 transition hover:text-[#101319]">All spaces <ArrowUpRight size={15} /></button>
        </div>
        <ProjectList projects={data.projects.slice(0, 3)} onCreate={onCreate} />
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <ActionCard icon={<Code2 size={19} />} title="Explore Artifacts" text="Keep project files, references, and deliverables organized." action={() => onNavigate("artifacts")} />
        <ActionCard icon={<Gauge size={19} />} title="Connect your tools" text="Manage GitHub, Vercel, and Supabase from one place." action={() => onNavigate("connectors")} />
      </div>
    </>
  )
}

export function SpacesPage({ projects, onCreate }: { projects: ShaftProject[]; onCreate: () => void }) {
  const [query, setQuery] = useState("")
  const filtered = projects.filter((project) =>
    (project.name + " " + project.description).toLowerCase().includes(query.toLowerCase())
  )
  return (
    <section>
      <PageIntro eyebrow="Your work" title="My Spaces" description="One place for every product, idea, and project in progress." action={<button type="button" onClick={onCreate} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#101319] px-4 text-sm font-semibold text-white transition hover:bg-[#252B35]"><Plus size={16} /> New Space</button>} />
      <label className="mt-7 flex h-11 max-w-md items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-slate-400"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search Spaces" className="w-full bg-transparent text-sm text-[#101319] outline-none placeholder:text-slate-400" /></label>
      <ProjectList projects={filtered} onCreate={onCreate} />
    </section>
  )
}

export function ArtifactsPage() {
  return <Placeholder icon={<Code2 size={22} />} eyebrow="Project output" title="A home for everything you create." text="Artifacts will bring files, generated outputs, references, and deliverables together across your Spaces. The library view is planned for a later phase." />
}

export function TasksPage() {
  return <Placeholder icon={<Clock3 size={22} />} eyebrow="Keep momentum" title="Your next steps, in one place." text="A shared task list will bring work from your Spaces into one focused view. Task creation, assignment, and status tracking are not wired up yet." />
}

export function SettingsPage({ data, user, onSignOut, signingOut }: {
  data: ShaftUserData
  user: User
  onSignOut: () => void
  signingOut: boolean
}) {
  return (
    <section className="max-w-3xl">
      <PageIntro eyebrow="Workspace preferences" title="Settings" description="Manage your SHAFT account and workspace basics." />
      <div className="mt-7 grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#EAF7F4] text-[#397D76]"><UserRound size={19} /></div>
          <h2 className="mt-4 font-semibold">Account</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">Signed in as {user.email || user.displayName || "your SHAFT account"}.</p>
          <p className="mt-3 text-xs text-slate-400">Profile and identity details are available from the profile button in the top bar.</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#EAF7F4] text-[#397D76]"><FolderKanban size={19} /></div>
          <h2 className="mt-4 font-semibold">Workspace data</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">{data.projects.length} Spaces · Profile and workspace data are synced with Firebase Cloud Firestore.</p>
        </article>
      </div>
      <button type="button" onClick={onSignOut} disabled={signingOut} className="mt-6 h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 transition hover:text-[#101319] disabled:opacity-50">{signingOut ? "Signing out…" : "Sign out"}</button>
    </section>
  )
}

export function ProfilePage({ data, user }: { data: ShaftUserData; user: User }) {
  const displayName = data.name || user.displayName || (user.email ? user.email.split("@")[0] : "Builder")
  const initials = displayName.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "S"
  return (
    <section className="max-w-3xl">
      <PageIntro eyebrow="Your account" title="Profile" description="Your identity and account details in SHAFT." />
      <div className="mt-7 overflow-hidden rounded-3xl border border-slate-200 bg-white">
        <div className="h-24 bg-[#EAF7F4]" />
        <div className="px-6 pb-6">
          <div className="-mt-10 grid h-20 w-20 place-items-center overflow-hidden rounded-full border-4 border-white bg-[#DDF2EE] text-xl font-semibold text-[#245C55] shadow-sm">
            {user.photoURL ? <img src={user.photoURL} alt="" referrerPolicy="no-referrer" className="h-full w-full object-cover" /> : initials}
          </div>
          <h2 className="mt-4 text-2xl font-semibold tracking-tight" style={{ fontFamily: "Amaranth, sans-serif" }}>{displayName}</h2>
          <p className="mt-1 text-sm text-slate-500">{user.email || "No email supplied by your sign-in provider"}</p>
          <div className="mt-6 grid gap-4 border-t border-slate-100 pt-5 sm:grid-cols-2">
            <ProfileField label="Name" value={displayName} />
            <ProfileField label="Role" value={data.role || "Not set"} />
            <ProfileField label="Spaces" value={String(data.projects.length)} />
            <ProfileField label="Sign-in provider" value={user.providerData.map((provider) => provider.providerId.replace(".com", "")).join(", ") || "Firebase Authentication"} />
          </div>
        </div>
      </div>
    </section>
  )
}

function PageIntro({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div><p className="text-xs font-semibold uppercase tracking-[0.17em] text-[#397D76]">{eyebrow}</p><h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] sm:text-5xl" style={{ fontFamily: "Amaranth, sans-serif" }}>{title}</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">{description}</p></div>
      {action}
    </div>
  )
}

function Placeholder({ icon, eyebrow, title, text }: { icon: ReactNode; eyebrow: string; title: string; text: string }) {
  return (
    <section className="mx-auto flex min-h-[48vh] max-w-2xl flex-col items-start justify-center py-10">
      <span className="grid h-14 w-14 place-items-center rounded-2xl border border-[#D9ECE8] bg-white text-[#397D76] shadow-sm">{icon}</span>
      <p className="mt-6 text-xs font-semibold uppercase tracking-[0.17em] text-[#397D76]">{eyebrow}</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl" style={{ fontFamily: "Amaranth, sans-serif" }}>{title}</h1>
      <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">{text}</p>
    </section>
  )
}

function StatCard({ label, value, hint, icon }: { label: string; value: string; hint: string; icon: ReactNode }) {
  return <div className="rounded-2xl border border-slate-200/80 bg-white p-5"><div className="flex items-center justify-between gap-3"><p className="text-sm font-medium text-slate-500">{label}</p><span className="grid h-9 w-9 place-items-center rounded-xl bg-slate-50 text-slate-600">{icon}</span></div><p className="mt-5 text-3xl font-semibold tracking-tight">{value}</p><p className="mt-1 text-xs text-slate-400">{hint}</p></div>
}

function ProjectList({ projects, onCreate }: { projects: ShaftProject[]; onCreate: () => void }) {
  if (projects.length === 0) return <div className="mt-5 flex min-h-52 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/60 px-6 py-10 text-center"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-slate-500 shadow-sm"><FolderKanban size={21} /></span><h3 className="mt-4 font-semibold">No Spaces found.</h3><p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">Start a Space to give your next product or project a dedicated home.</p><button type="button" onClick={onCreate} className="mt-4 inline-flex h-10 items-center gap-2 rounded-xl bg-[#101319] px-4 text-sm font-semibold text-white transition hover:bg-[#252B35]"><Plus size={15} /> Start a Space</button></div>
  return <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{projects.map((project) => <article key={project.id} className="rounded-2xl border border-slate-200/80 bg-white p-5 transition hover:border-[#BCDAD5] hover:shadow-lg hover:shadow-slate-900/[0.03]"><div className="flex items-start justify-between gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#EAF7F4] text-[#397D76]"><Code2 size={18} /></span><span className="inline-flex items-center gap-1.5 text-[11px] text-slate-400"><Clock3 size={12} /> {new Date(project.createdAt).toLocaleDateString()}</span></div><h3 className="mt-5 text-base font-semibold">{project.name}</h3><p className="mt-2 min-h-[60px] text-sm leading-5 text-slate-500">{project.description}</p><div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-500">Space created</span><ArrowUpRight size={16} className="text-slate-400" /></div></article>)}</div>
}

function ActionCard({ icon, title, text, action }: { icon: ReactNode; title: string; text: string; action: () => void }) {
  return <button type="button" onClick={action} className="group flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 text-left transition hover:border-[#BCDAD5] hover:shadow-lg hover:shadow-slate-900/[0.03]"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#EAF7F4] text-[#397D76]">{icon}</span><span className="flex-1"><span className="block font-semibold">{title}</span><span className="mt-1 block text-sm leading-6 text-slate-500">{text}</span></span><ArrowRight size={17} className="mt-1 text-slate-400 transition group-hover:translate-x-1" /></button>
}

function ProfileField({ label, value }: { label: string; value: string }) {
  return <div><dt className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</dt><dd className="mt-1 break-words text-sm font-medium text-slate-700">{value}</dd></div>
}
