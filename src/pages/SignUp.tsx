import { useState, type FormEvent } from "react"
import { ArrowLeft, LoaderCircle } from "lucide-react"
import {
  createUserWithEmailAndPassword,
  GithubAuthProvider,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth"
import { auth, githubProvider, googleProvider } from "../lib/firebase"

export function SignUp() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [busy, setBusy] = useState<"google" | "github" | "email" | null>(null)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const signUpWithProvider = async (provider: GoogleAuthProvider | GithubAuthProvider, name: "google" | "github") => {
    setBusy(name)
    setError("")
    setMessage("")
    try {
      await signInWithPopup(auth, provider)
      window.location.replace("/")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-up failed. Please try again.")
      setBusy(null)
    }
  }

  const signUpWithEmail = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setBusy("email")
    setError("")
    setMessage("")
    try {
      await createUserWithEmailAndPassword(auth, email, password)
      window.location.replace("/")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Account creation failed. Please try again.")
      setBusy(null)
    }
  }

  return (
    <main className="min-h-screen bg-[#F5F7FB] px-5 py-10 text-[#101319]" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
      <a href="/" className="inline-flex items-center gap-2 text-sm text-slate-600 transition-colors hover:text-[#101319]"><ArrowLeft size={16} /> Back to SHAFT</a>
      <section className="mx-auto mt-16 w-full max-w-md">
        <a href="/" className="mb-8 inline-flex items-center gap-3" aria-label="SHAFT home"><img src="/logo.png" alt="" className="h-10 w-10 object-contain" /><span className="text-2xl font-bold" style={{ fontFamily: "Amaranth, sans-serif" }}>Shaft</span></a>
        <h1 className="text-3xl font-semibold tracking-tight">Create your account</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">One place to take your projects further.</p>
        {error && <p role="alert" className="mt-5 break-words rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        {message && <p role="status" className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{message}</p>}
        <button type="button" onClick={() => void signUpWithProvider(googleProvider, "google")} disabled={busy !== null} className="mt-7 flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white text-sm font-semibold transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60">{busy === "google" ? <LoaderCircle size={18} className="animate-spin" /> : <GoogleMark />} Continue with Google</button>
        <button type="button" onClick={() => void signUpWithProvider(githubProvider, "github")} disabled={busy !== null} className="mt-3 flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white text-sm font-semibold transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60">{busy === "github" ? <LoaderCircle size={18} className="animate-spin" /> : <GitHubMark />} Continue with GitHub</button>
        <div className="my-6 flex items-center gap-4 text-xs text-slate-400"><span className="h-px flex-1 bg-slate-200" /> OR WITH EMAIL <span className="h-px flex-1 bg-slate-200" /></div>
        <form onSubmit={signUpWithEmail} className="space-y-4">
          <label className="block text-sm font-medium">Email address<input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200" placeholder="you@example.com" /></label>
          <label className="block text-sm font-medium">Password<input type="password" autoComplete="new-password" required minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200" placeholder="At least 6 characters" /></label>
          <button type="submit" disabled={busy !== null} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#101319] text-sm font-semibold text-white transition hover:bg-[#202630] disabled:cursor-not-allowed disabled:opacity-60">{busy === "email" && <LoaderCircle size={17} className="animate-spin" />} Create account</button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-600">Already have an account? <a href="/signin" className="font-semibold text-[#101319] underline underline-offset-4">Sign in</a></p>
        <p className="mt-8 text-center text-xs leading-5 text-slate-500">By continuing, you agree to SHAFT’s <a href="/terms" className="underline underline-offset-2">Terms</a> and <a href="/privacy" className="underline underline-offset-2">Privacy Policy</a>.</p>
      </section>
    </main>
  )
}

function GoogleMark() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-[18px] w-[18px]"><path fill="#4285F4" d="M21.6 12.23c0-.72-.06-1.42-.18-2.09H12v3.95h5.38a4.6 4.6 0 0 1-2 3.02v2.55h3.23c1.89-1.74 2.99-4.3 2.99-7.43Z"/><path fill="#34A853" d="M12 22c2.7 0 4.97-.9 6.62-2.44l-3.23-2.55c-.9.6-2.04.96-3.39.96-2.61 0-4.82-1.76-5.61-4.13H3.05v2.63A10 10 0 0 0 12 22Z"/><path fill="#FBBC05" d="M6.39 13.84a6.02 6.02 0 0 1 0-3.68V7.53H3.05a10 10 0 0 0 0 8.94l3.34-2.63Z"/><path fill="#EA4335" d="M12 6.03c1.47 0 2.79.5 3.83 1.51l2.87-2.87C16.96 3.03 14.7 2 12 2a10 10 0 0 0-8.95 5.53l3.34 2.63C7.18 7.79 9.39 6.03 12 6.03Z"/></svg>
}
function GitHubMark() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className="h-[18px] w-[18px]"><path d="M12 .8a11.2 11.2 0 0 0-3.54 21.83c.56.1.77-.24.77-.54v-2.1c-3.13.68-3.79-1.33-3.79-1.33-.51-1.3-1.25-1.65-1.25-1.65-1.02-.7.08-.69.08-.69 1.13.08 1.72 1.16 1.72 1.16 1 .1.76 2.4 3.03 1.82.1-.73.4-1.22.72-1.5-2.5-.28-5.13-1.25-5.13-5.56 0-1.23.44-2.24 1.16-3.03-.12-.29-.5-1.44.11-3 0 0 .95-.3 3.08 1.16a10.7 10.7 0 0 1 5.6 0c2.13-1.45 3.08-1.16 3.08-1.16.61 1.56.23 2.71.11 3 .72.79 1.16 1.8 1.16 3.03 0 4.32-2.63 5.28-5.14 5.56.4.35.76 1.03.76 2.08v3.1c0 .3.2.65.77.54A11.2 11.2 0 0 0 12 .8Z"/></svg>
}
export default SignUp
