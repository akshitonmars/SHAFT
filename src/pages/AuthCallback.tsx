import { useEffect, useState } from "react"
import { LoaderCircle } from "lucide-react"
import { isSupabaseConfigured, supabase } from "../lib/supabase"

export function AuthCallback() {
  const [message, setMessage] = useState("Finishing sign-in…")

  useEffect(() => {
    let active = true

    const finishSignIn = async () => {
      if (!supabase || !isSupabaseConfigured) {
        setMessage("Authentication is not configured yet. Please try again later.")
        return
      }

      const params = new URLSearchParams(window.location.search)
      const authError = params.get("error_description") || params.get("error")
      if (authError) {
        setMessage(authError.replace(/\+/g, " "))
        return
      }

      const code = params.get("code")
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (error) {
          if (active) setMessage(error.message)
          return
        }
      }

      const { data, error } = await supabase.auth.getSession()
      if (error || !data.session) {
        if (active) setMessage(error?.message || "We couldn’t confirm your session. Please sign in again.")
        return
      }

      if (active) window.location.replace("/")
    }

    void finishSignIn()
    return () => { active = false }
  }, [])

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F5F7FB] px-5 text-[#101319]" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
      <section className="w-full max-w-sm text-center">
        <img src="/logo.png" alt="" className="mx-auto mb-5 h-12 w-12 object-contain" />
        <LoaderCircle className="mx-auto mb-4 animate-spin text-slate-500" size={24} />
        <p role="status" className="text-sm text-slate-600">{message}</p>
        {message !== "Finishing sign-in…" && <a href="/signin" className="mt-5 inline-block text-sm font-semibold underline underline-offset-4">Return to sign in</a>}
      </section>
    </main>
  )
}

export default AuthCallback
