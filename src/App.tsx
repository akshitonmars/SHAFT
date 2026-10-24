import React, { useState, useEffect } from "react"
import type { User } from "firebase/auth"
import { onAuthStateChanged } from "firebase/auth"
import { Home } from "./pages/Home"
import { Privacy } from "./pages/Privacy"
import { Terms } from "./pages/Terms"
import { Documentation } from "./pages/Documentation"
import { Eula } from "./pages/Eula"
import { Support } from "./pages/Support"
import { SignUp } from "./pages/SignUp"
import { SignIn } from "./pages/SignIn"
import { AuthCallback } from "./pages/AuthCallback"
import { Onboarding } from "./pages/Onboarding"
import { Workspace } from "./pages/Workspace"
import { DatabaseExplorer } from "./pages/DatabaseExplorer"
import { GitHubConnector } from "./pages/GitHubConnector"
import { VercelConnector } from "./pages/VercelConnector"
import { auth } from "./lib/firebase"
import { loadUserData } from "./lib/onboarding"
import { applyConnectReturn } from "./lib/connectors"

function getInitialPath(): string {
  if (typeof window === "undefined") return "/"
  applyConnectReturn()
  const pathname = window.location.pathname
  if (pathname === "/auth/callback") return "/auth/callback"
  if (pathname === "/signin") return "/signin"
  if (pathname === "/signup" || pathname === "/get-started") return "/signup"
  if (pathname === "/onboarding") return "/onboarding"
  if (pathname === "/workspace") return "/workspace"
  if (pathname === "/database") return "/database"
  if (pathname === "/github") return "/github"
  if (pathname === "/vercel") return "/vercel"
  if (pathname === "/privacy" || pathname.startsWith("/privacy/")) return "/privacy"
  if (pathname === "/terms" || pathname.startsWith("/terms/")) return "/terms"
  if (pathname === "/docs" || pathname.startsWith("/docs/")) return "/docs"
  if (pathname === "/eula" || pathname.startsWith("/eula/")) return "/eula"
  if (pathname === "/support" || pathname.startsWith("/support/")) return "/support"
  const hash = window.location.hash
  if (hash === "#/privacy" || hash === "#privacy") return "/privacy"
  if (hash === "#/terms" || hash === "#terms") return "/terms"
  return "/"
}

function LoadingScreen() {
  return <main className="flex min-h-screen items-center justify-center bg-[#F5F7FB] text-[#101319]" style={{ fontFamily: "Inter, system-ui, sans-serif" }}><div className="flex items-center gap-3 text-sm text-slate-500"><span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-[#397D76]" />Opening your SHAFT workspace…</div></main>
}

export const App: React.FC = () => {
  const [currentPath, setCurrentPath] = useState<string>(getInitialPath)
  const [user, setUser] = useState<User | null>(null)
  const [authReady, setAuthReady] = useState(false)

  useEffect(() => onAuthStateChanged(auth, (nextUser) => {
    setUser(nextUser)
    setAuthReady(true)
  }, () => {
    setUser(null)
    setAuthReady(true)
  }), [])

  const [cloudReady, setCloudReady] = useState(false)
  const [cloudError, setCloudError] = useState(false)

  useEffect(() => {
    if (!authReady) return
    if (!user) {
      setCloudReady(true)
      setCloudError(false)
      if (currentPath === "/onboarding" || currentPath === "/workspace" || currentPath === "/database" || currentPath === "/github" || currentPath === "/vercel") {
        window.history.replaceState({}, "", "/signin")
        setCurrentPath("/signin")
      }
      return
    }
    let active = true
    setCloudReady(false)
    loadUserData(user.uid).then((data) => {
      if (!active) return
      setCloudError(false)
      let destination: string | null = null
      if (currentPath === "/" || currentPath === "/signin" || currentPath === "/signup") {
        destination = data.onboardingCompleted ? "/workspace" : "/onboarding"
      } else if (currentPath === "/onboarding" && data.onboardingCompleted) {
        destination = "/workspace"
      } else if (currentPath === "/workspace" && !data.onboardingCompleted) {
        destination = "/onboarding"
      }
      if (destination && destination !== currentPath) {
        window.history.replaceState({}, "", destination)
        setCurrentPath(destination)
        window.scrollTo({ top: 0, behavior: "auto" })
      }
      setCloudReady(true)
    }).catch(() => {
      if (active) { setCloudError(true); setCloudReady(true) }
    })
    return () => { active = false }
  }, [authReady, user?.uid, currentPath])

  useEffect(() => {
    const handlePopState = () => setCurrentPath(getInitialPath())
    window.addEventListener("popstate", handlePopState)
    window.addEventListener("hashchange", handlePopState)

    const handleDocumentClick = (event: MouseEvent) => {
      if (event.defaultPrevented) return
      const target = (event.target as HTMLElement).closest("a")
      if (!target) return
      const href = target.getAttribute("href")
      if (!href) return
      if (href === "/privacy" || href === "#/privacy" || href === "#privacy") {
        event.preventDefault()
        window.history.pushState({}, "", "/privacy")
        setCurrentPath("/privacy")
        window.scrollTo({ top: 0, behavior: "smooth" })
      } else if (href === "/terms" || href === "#/terms" || href === "#terms") {
        event.preventDefault()
        window.history.pushState({}, "", "/terms")
        setCurrentPath("/terms")
        window.scrollTo({ top: 0, behavior: "smooth" })
      } else if (href === "/" || href === "/#product" || href === "#product") {
        if (currentPath === "/privacy" || currentPath === "/terms" || currentPath === "/docs" || currentPath === "/eula" || currentPath === "/support") {
          event.preventDefault()
          window.history.pushState({}, "", "/")
          setCurrentPath("/")
          window.scrollTo({ top: 0, behavior: "smooth" })
        }
      }
    }
    document.addEventListener("click", handleDocumentClick)
    return () => {
      window.removeEventListener("popstate", handlePopState)
      window.removeEventListener("hashchange", handlePopState)
      document.removeEventListener("click", handleDocumentClick)
    }
  }, [currentPath])

  const navigateTo = (path: string, replace = false) => {
    if (replace) window.history.replaceState({}, "", path)
    else window.history.pushState({}, "", path)
    setCurrentPath(path)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  if (currentPath === "/privacy") return <Privacy onNavigateHome={() => navigateTo("/")} />
  if (currentPath === "/terms") return <Terms onNavigateHome={() => navigateTo("/")} />
  if (currentPath === "/docs") return <Documentation />
  if (currentPath === "/eula") return <Eula />
  if (currentPath === "/support") return <Support />
  if (currentPath === "/signin") return <SignIn />
  if (currentPath === "/signup") return <SignUp />
  if (currentPath === "/auth/callback") return <AuthCallback />
  if (cloudError) return <main className="flex min-h-screen items-center justify-center bg-[#F5F7FB] p-6 text-[#101319]"><div className="max-w-md rounded-2xl border border-red-200 bg-white p-6"><h1 className="text-lg font-semibold">Could not load SHAFT cloud data</h1><p className="mt-2 text-sm leading-6 text-slate-600">Enable Cloud Firestore in Firebase and apply the user-only security rules, then retry.</p><button className="mt-4 rounded-xl bg-[#101319] px-4 py-2 text-sm font-semibold text-white" onClick={() => window.location.reload()}>Retry</button></div></main>
  if (!cloudReady && user) return <LoadingScreen />
  if (currentPath === "/onboarding") {
    if (!authReady || !cloudReady || !user) return <LoadingScreen />
    return <Onboarding user={user} onFinish={() => navigateTo("/workspace", true)} />
  }
  if (currentPath === "/database") {
    if (!authReady || !user) return <LoadingScreen />
    return <DatabaseExplorer user={user} />
  }
  if (currentPath === "/github") {
    if (!authReady || !user) return <LoadingScreen />
    return <GitHubConnector user={user} />
  }
  if (currentPath === "/vercel") {
    if (!authReady || !user) return <LoadingScreen />
    return <VercelConnector user={user} />
  }
  if (currentPath === "/workspace") {
    if (!authReady || !user) return <LoadingScreen />
    return <Workspace user={user} />
  }
  return <Home onPrivacyClick={() => navigateTo("/privacy")} />
}
export default App
