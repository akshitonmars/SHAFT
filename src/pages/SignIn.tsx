import { useState, type FormEvent } from "react"
import { ArrowLeft, LoaderCircle } from "lucide-react"
import { isSupabaseConfigured, supabase } from "../lib/supabase"

export function SignIn() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [busy, setBusy] = useState<"google" | "email" | null>(null)
  const [error, setError] = useState("")

  const signInWithGoogle = async () => {
    if (!supabase) return
    setBusy("google")
    setError("")
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (authError) {
      setError(authError.message)
      setBusy(null)
    }
  }

  const signInWithEmail = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!supabase) return
    setBusy("email")
    setError("")
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
    setBusy(null)
    if (authError) {
      setError(authError.message)
      return
    }
    window.location.replace("/")
  }

  return (
    <main className="min-h-screen bg-[#F5F7FB] px-5 py-10 text-[#101319]" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
      <a href="/" className="inline-flex items-center gap-2 text-sm text-slate-600 transition-colors hover:text-[#101319]">
        <ArrowLeft size={16} /> Back to SHAFT
      </a>
      <section className="mx-auto mt-16 w-full max-w-md">
        <a href="/" className="mb-8 inline-flex items-center gap-3" aria-label="SHAFT home">
          <img src="/logo.png" alt="" className="h-10 w-10 object-contain" />
          <span className="text-2xl font-bold" style={{ fontFamily: "Amaranth, sans-serif" }}>Shaft</span>
        </a>
        <h1 className="text-3xl font-semibold tracking-tight">Welcome back</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">Sign in to continue with your projects.</p>

        {!isSupabaseConfigured && (
          <p role="status" className="mt-6 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
            Authentication needs configuration. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment.
          </p>
        )}
        {error && <p role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}

        <button
          type="button"
          onClick={signInWithGoogle}
          disabled={!isSupabaseConfigured || busy !== null}
          className="mt-7 flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white text-sm font-semibold transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy === "google" ? <LoaderCircle size={18} className="animate-spin" /> : <GoogleMark />}
          Continue with Google
        </button>

        <div className="my-6 flex items-center gap-4 text-xs text-slate-400">
          <span className="h-px flex-1 bg-slate-200" /> OR WITH EMAIL <span className="h-px flex-1 bg-slate-200" />
        </div>

        <form onSubmit={signInWithEmail} className="space-y-4">
          <label className="block text-sm font-medium">
            Email address
            <input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200" placeholder="you@example.com" />
          </label>
          <label className="block text-sm font-medium">
            Password
            <input type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200" placeholder="Your password" />
          </label>
          <button type="submit" disabled={!isSupabaseConfigured || busy !== null} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#101319] text-sm font-semibold text-white transition hover:bg-[#202630] disabled:cursor-not-allowed disabled:opacity-60">
            {busy === "email" && <LoaderCircle size={17} className="animate-spin" />}
            Sign in
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          New to SHAFT? <a href="/get-started" className="font-semibold text-[#101319] underline underline-offset-4">Create an account</a>
        </p>
      </section>
    </main>
  )
}

function GoogleMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-[18px] w-[18px]">
      <path fill="#4285F4" d="M21.6 12.23c0-.72-.06-1.42-.18-2.09H12v3.95h5.38a4.6 4.6 0 0 1-2 3.02v2.55h3.23c1.89-1.74 2.99-4.3 2.99-7.43Z"/>
      <path fill="#34A853" d="M12 22c2.7 0 4.97-.9 6.62-2.44l-3.23-2.55c-.9.6-2.04.96-3.39.96-2.61 0-4.82-1.76-5.61-4.13H3.05v2.63A10 10 0 0 0 12 22Z"/>
      <path fill="#FBBC05" d="M6.39 13.84a6.02 6.02 0 0 1 0-3.68V7.53H3.05a10 10 0 0 0 0 8.94l3.34-2.63Z"/>
      <path fill="#EA4335" d="M12 6.03c1.47 0 2.79.5 3.83 1.51l2.87-2.87C16.96 3.03 14.7 2 12 2a10 10 0 0 0-8.95 5.53l3.34 2.63C7.18 7.79 9.39 6.03 12 6.03Z"/>
    </svg>
  )
}

export default SignIn
