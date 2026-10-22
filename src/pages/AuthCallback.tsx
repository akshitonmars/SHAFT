import { useEffect, useState } from "react"
import { LoaderCircle } from "lucide-react"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "../lib/firebase"

export function AuthCallback() {
  const [message, setMessage] = useState("Checking your sign-in…")

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        window.location.replace("/")
      } else {
        setMessage("No active session was found. Please sign in again.")
      }
    }, (error) => setMessage(error.message))
    return unsubscribe
  }, [])

  return <main className="flex min-h-screen items-center justify-center bg-[#F5F7FB] px-5 text-[#101319]" style={{ fontFamily: "Inter, system-ui, sans-serif" }}><section className="w-full max-w-sm text-center"><img src="/logo.png" alt="" className="mx-auto mb-5 h-12 w-12 object-contain" /><LoaderCircle className="mx-auto mb-4 animate-spin text-slate-500" size={24} /><p role="status" className="text-sm text-slate-600">{message}</p>{message !== "Checking your sign-in…" && <a href="/signin" className="mt-5 inline-block text-sm font-semibold underline underline-offset-4">Return to sign in</a>}</section></main>
}
export default AuthCallback
