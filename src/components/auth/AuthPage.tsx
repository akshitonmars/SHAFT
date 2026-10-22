import { useState } from "react"
import type { FormEvent, ReactNode } from "react"
import { LoaderCircle } from "lucide-react"
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup } from "firebase/auth"
import type { AuthProvider } from "firebase/auth"
import { auth, githubProvider, googleProvider } from "../../lib/firebase"
import AuroraBackground from "./AuroraBackground"

type Mode = "signin" | "signup"
type Busy = "google" | "github" | "email" | null

const COPY = {
  signin: {
    title: "Welcome back",
    sub: "Sign in to pick up where your projects left off.",
    submit: "Sign in",
    switchText: "New to Shaft?",
    switchLabel: "Create account",
    switchHref: "/get-started",
  },
  signup: {
    title: "Create your account",
    sub: "One place for your code, deployments and AI tools.",
    submit: "Create account",
    switchText: "Have an account?",
    switchLabel: "Sign in",
    switchHref: "/signin",
  },
} as const

const MESSAGES: Record<string, string> = {
  "auth/invalid-credential": "That email and password don’t match.",
  "auth/wrong-password": "That email and password don’t match.",
  "auth/user-not-found": "No account found for that email.",
  "auth/email-already-in-use": "An account with that email already exists. Try signing in.",
  "auth/weak-password": "Use a password with at least 6 characters.",
  "auth/invalid-email": "Enter a valid email address.",
  "auth/account-exists-with-different-credential": "This email is already linked to another sign-in method.",
  "auth/too-many-requests": "Too many attempts. Try again in a moment.",
}

const friendly = (err: unknown) => {
  const code = typeof err === "object" && err !== null && "code" in err ? String((err as { code: unknown }).code) : ""
  if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") return ""
  return MESSAGES[code] ?? "Something went wrong. Please try again."
}

const CSS = `
@import url("https://fonts.googleapis.com/css2?family=Amaranth:wght@400;700&family=Inter:wght@400;500;600&display=swap");
@keyframes auRise { from { opacity: 0; filter: blur(8px); transform: translateY(14px); } to { opacity: 1; filter: none; transform: none; } }
.au-rise { animation: auRise 0.9s cubic-bezier(0.22, 1, 0.36, 1) backwards; }
@media (prefers-reduced-motion: reduce) { .au-rise { animation: none; } }
`

function ProviderButton({ label, icon, dark, loading, disabled, onClick }: { label: string; icon: ReactNode; dark?: boolean; loading: boolean; disabled: boolean; onClick: () => void }) {
  const tone = dark
    ? "bg-[#101319] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_12px_32px_rgba(16,19,25,0.28)] hover:bg-[#1a2030]"
    : "bg-white/75 text-[#101319] shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_10px_30px_rgba(40,60,140,0.12),0_0_0_1px_rgba(16,19,25,0.07)] backdrop-blur-xl hover:bg-white"
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`group relative inline-flex h-14 w-full items-center justify-center gap-3 overflow-hidden rounded-full px-8 text-[15px] font-semibold transition-[transform,box-shadow,background-color] duration-300 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#43B5FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F5F7FB] sm:w-[230px] ${tone}`}
    >
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent to-transparent opacity-0 transition-[left,opacity] duration-700 group-hover:left-[120%] group-hover:opacity-100 ${dark ? "via-white/25" : "via-white"}`}
      />
      {loading ? <LoaderCircle size={18} className="animate-spin" /> : <span className="transition-transform duration-300 group-hover:scale-110">{icon}</span>}
      {label}
    </button>
  )
}

export default function AuthPage({ mode }: { mode: Mode }) {
  const c = COPY[mode]
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [busy, setBusy] = useState<Busy>(null)
  const [error, setError] = useState("")
  const [showEmail, setShowEmail] = useState(false)

  const run = async (name: Exclude<Busy, null>, action: () => Promise<unknown>) => {
    setBusy(name)
    setError("")
    try {
      await action()
      window.location.replace("/")
    } catch (err) {
      setError(friendly(err))
      setBusy(null)
    }
  }
  const withProvider = (name: "google" | "github", provider: AuthProvider) => () => void run(name, () => signInWithPopup(auth, provider))
  const withEmail = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void run("email", () => (mode === "signin" ? signInWithEmailAndPassword(auth, email, password) : createUserWithEmailAndPassword(auth, email, password)))
  }

  const field = "mt-2 h-12 w-full rounded-2xl border border-slate-900/10 bg-white/80 px-4 text-[15px] outline-none transition focus:border-[#648EFF] focus:ring-4 focus:ring-[#648EFF]/15"

  return (
    <main className="relative min-h-[100svh] overflow-hidden bg-[#F5F7FB] text-[#101319]" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
      <style>{CSS}</style>
      <AuroraBackground />

      <header className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-6 py-5 sm:px-10">
        <a href="/" aria-label="Shaft home" className="flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#43B5FF]">
          <img src="/logo.png" alt="" className="h-[30px] w-[30px] object-contain" />
          <span className="text-[24px] font-bold leading-none tracking-[-0.02em]" style={{ fontFamily: "Amaranth, sans-serif" }}>Shaft</span>
        </a>
        <p className="text-sm text-slate-600">
          {c.switchText}{" "}
          <a href={c.switchHref} className="font-semibold text-[#101319] underline decoration-black/20 underline-offset-4 transition-colors hover:decoration-black/60">{c.switchLabel}</a>
        </p>
      </header>

      <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-[760px] flex-col items-center justify-center px-6 pb-[16vh] pt-24 text-center">
        <h1 className="au-rise text-[clamp(40px,7vw,68px)] font-bold leading-[1.02] tracking-[-0.03em]" style={{ fontFamily: "Amaranth, sans-serif" }}>{c.title}</h1>
        <p className="au-rise mt-5 max-w-[30rem] text-[17px] leading-relaxed text-slate-600" style={{ animationDelay: "120ms" }}>{c.sub}</p>

        {error && (
          <p role="alert" className="mt-6 max-w-[26rem] rounded-2xl border border-red-200/70 bg-white/80 px-4 py-3 text-sm text-red-700 backdrop-blur">{error}</p>
        )}

        <div className="au-rise mt-9 flex w-full max-w-[470px] flex-col items-center justify-center gap-3 sm:max-w-none sm:flex-row" style={{ animationDelay: "240ms" }}>
          <ProviderButton label="Continue with Google" icon={<GoogleMark />} loading={busy === "google"} disabled={busy !== null} onClick={withProvider("google", googleProvider)} />
          <ProviderButton dark label="Continue with GitHub" icon={<GitHubMark />} loading={busy === "github"} disabled={busy !== null} onClick={withProvider("github", githubProvider)} />
        </div>

        <button
          type="button"
          aria-expanded={showEmail}
          onClick={() => setShowEmail((v) => !v)}
          className="au-rise mt-6 rounded-lg px-2 py-1 text-sm text-slate-500 transition-colors hover:text-[#101319] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#43B5FF]"
          style={{ animationDelay: "360ms" }}
        >
          {showEmail ? "Hide email sign-in" : "Use email instead"}
        </button>

        {showEmail && (
          <form onSubmit={withEmail} className="au-rise mt-4 w-full max-w-[400px] space-y-4 rounded-[28px] border border-white/80 bg-white/60 p-6 text-left shadow-[0_20px_60px_rgba(40,60,140,0.12)] backdrop-blur-2xl">
            <label className="block text-sm font-medium">
              Email address
              <input type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={field} placeholder="you@example.com" />
            </label>
            <label className="block text-sm font-medium">
              Password
              <input
                type="password"
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                required
                minLength={mode === "signup" ? 6 : undefined}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={field}
                placeholder={mode === "signup" ? "At least 6 characters" : "Your password"}
              />
            </label>
            <button type="submit" disabled={busy !== null} className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#101319] text-[15px] font-semibold text-white transition hover:bg-[#1a2030] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#43B5FF] focus-visible:ring-offset-2">
              {busy === "email" && <LoaderCircle size={17} className="animate-spin" />} {c.submit}
            </button>
          </form>
        )}
      </div>

      {mode === "signup" && (
        <p className="absolute inset-x-0 bottom-6 z-10 px-6 text-center text-xs leading-5 text-slate-500">
          By continuing, you agree to Shaft’s <a href="/terms" className="underline underline-offset-2">Terms</a> and <a href="/privacy" className="underline underline-offset-2">Privacy Policy</a>.
        </p>
      )}
    </main>
  )
}

function GoogleMark() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-[18px] w-[18px]"><path fill="#4285F4" d="M21.6 12.23c0-.72-.06-1.42-.18-2.09H12v3.95h5.38a4.6 4.6 0 0 1-2 3.02v2.55h3.23c1.89-1.74 2.99-4.3 2.99-7.43Z"/><path fill="#34A853" d="M12 22c2.7 0 4.97-.9 6.62-2.44l-3.23-2.55c-.9.6-2.04.96-3.39.96-2.61 0-4.82-1.76-5.61-4.13H3.05v2.63A10 10 0 0 0 12 22Z"/><path fill="#FBBC05" d="M6.39 13.84a6.02 6.02 0 0 1 0-3.68V7.53H3.05a10 10 0 0 0 0 8.94l3.34-2.63Z"/><path fill="#EA4335" d="M12 6.03c1.47 0 2.79.5 3.83 1.51l2.87-2.87C16.96 3.03 14.7 2 12 2a10 10 0 0 0-8.95 5.53l3.34 2.63C7.18 7.79 9.39 6.03 12 6.03Z"/></svg>
}
function GitHubMark() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className="h-[18px] w-[18px]"><path d="M12 .8a11.2 11.2 0 0 0-3.54 21.83c.56.1.77-.24.77-.54v-2.1c-3.13.68-3.79-1.33-3.79-1.33-.51-1.3-1.25-1.65-1.25-1.65-1.02-.7.08-.69.08-.69 1.13.08 1.72 1.16 1.72 1.16 1 .1.76 2.4 3.03 1.82.1-.73.4-1.22.72-1.5-2.5-.28-5.13-1.25-5.13-5.56 0-1.23.44-2.24 1.16-3.03-.12-.29-.5-1.44.11-3 0 0 .95-.3 3.08 1.16a10.7 10.7 0 0 1 5.6 0c2.13-1.45 3.08-1.16 3.08-1.16.61 1.56.23 2.71.11 3 .72.79 1.16 1.8 1.16 3.03 0 4.32-2.63 5.28-5.14 5.56.4.35.76 1.03.76 2.08v3.1c0 .3.2.65.77.54A11.2 11.2 0 0 0 12 .8Z"/></svg>
}
