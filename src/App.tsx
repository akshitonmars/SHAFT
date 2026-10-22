import React, { useState, useEffect } from "react"
import type { User } from "firebase/auth"
import { onAuthStateChanged } from "firebase/auth"
import { Home } from "./pages/Home"
import { Privacy } from "./pages/Privacy"
import { Terms } from "./pages/Terms"
import { SignUp } from "./pages/SignUp"
import { SignIn } from "./pages/SignIn"
import { AuthCallback } from "./pages/AuthCallback"
import { Onboarding } from "./pages/Onboarding"
import { Workspace } from "./pages/Workspace"
import { auth } from "./lib/firebase"
import { hasCompletedOnboarding } from "./lib/onboarding"

function getInitialPath(): string {
  if (typeof window === "undefined") return "/"
  const pathname = window.location.pathname
  if (pathname === "/auth/callback") return "/auth/callback"
  if (pathname === "/signin") return "/signin"
  if (pathname === "/signup" || pathname === "/get-started") return "/signup"
  if (pathname === "/onboarding") return "/onboarding"
  if (pathname === "/workspace") return "/workspace"
  if (pathname === "/privacy" || pathname.startsWith("/privacy/")) return "/privacy"
  if (pathname === "/terms" || pathname.startsWith("/terms/")) return "/terms"
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

  useEffect(() => {
    if (!authReady) return
    const protectedRoute = currentPath === "/onboarding" || currentPath === "/workspace"
    let destination: string | null = null
    if (!user && protectedRoute) {
      destination = "/signin"
    } else if (user) {
      const complete = hasCompletedOnboarding(user.uid)
      if (currentPath === "/" || currentPath === "/signin" || currentPath === "/signup") {
        destination = complete ? "/workspace" : "/onboarding"
      } else if (currentPath === "/onboarding" && complete) {
        destination = "/workspace"
      } else if (currentPath === "/workspace" && !complete) {
        destination = "/onboarding"
      }
    }
    if (destination && destination !== currentPath) {
      window.history.replaceState({}, "", destination)
      setCurrentPath(destination)
      window.scrollTo({ top: 0, behavior: "auto" })
    }
  }, [authReady, user, currentPath])

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
        if (currentPath === "/privacy" || currentPath === "/terms") {
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
  if (currentPath === "/signin") return <SignIn />
  if (currentPath === "/signup") return <SignUp />
  if (currentPath === "/auth/callback") return <AuthCallback />
  if (currentPath === "/onboarding") {
    if (!authReady || !user) return <LoadingScreen />
    return <Onboarding user={user} onFinish={() => navigateTo("/workspace", true)} />
  }
  if (currentPath === "/workspace") {
    if (!authReady || !user) return <LoadingScreen />
    return <Workspace user={user} />
  }
  return <Home onPrivacyClick={() => navigateTo("/privacy")} />
}

export default App
