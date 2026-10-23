import { useEffect } from "react"
import DotField from "../components/landing/DotField"

const topics = [
  { title: "Vercel connection", body: "If your Vercel projects do not appear, make sure you connected the correct account or team, approved the requested permissions, and refreshed the connector. You can also disconnect and reconnect the account." },
  { title: "Sign-in or account issues", body: "Check that you are using the correct sign-in method and try reloading SHAFT. Never share your password, verification codes, OAuth tokens, API keys, or private repository secrets in a support request." },
  { title: "Report a bug", body: "When reporting a problem, include the page you were using, what you expected to happen, what happened instead, and the steps needed to reproduce it. Remove personal information and secrets from screenshots or logs." },
]

export function Support() {
  useEffect(() => { document.title = "Support — SHAFT"; window.scrollTo({ top: 0, behavior: "auto" }) }, [])
  return <main className="relative min-h-screen overflow-hidden bg-[#F5F7FB] text-[#151B26]">
    <div aria-hidden="true" className="pointer-events-none fixed inset-0"><DotField theme="light" /><div className="absolute inset-0 bg-[#F5F7FB]/70" /></div>
    <div className="relative mx-auto max-w-[900px] px-6 pb-24 pt-8 sm:px-10 sm:pt-12">
      <header className="mb-20 flex items-center justify-between gap-6"><a href="/" className="text-xl font-bold lowercase tracking-tight" style={{fontFamily:"Amaranth, sans-serif"}}>shaft</a><nav className="flex gap-5 text-xs text-slate-500"><a className="hover:text-slate-900" href="/docs">Documentation</a><a className="hover:text-slate-900" href="/privacy">Privacy</a></nav></header>
      <section className="mb-16"><p className="mb-5 text-xs uppercase tracking-[0.2em] text-[#167DA8]">We're here to help</p><h1 className="max-w-[12ch] text-[clamp(44px,8vw,76px)] font-bold leading-[.98] tracking-[-.04em]" style={{fontFamily:"Amaranth, sans-serif"}}>SHAFT Support.</h1><p className="mt-7 max-w-[68ch] text-[15px] leading-[1.9] text-slate-600">Find troubleshooting guidance or report a problem with SHAFT. Please do not include passwords, access tokens, API keys, or other confidential information in reports.</p><a className="mt-8 inline-flex items-center rounded-full bg-[#151B26] px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-80" href="https://github.com/akshitonmars/SHAFT/issues" target="_blank" rel="noreferrer">Report an issue on GitHub ↗</a></section>
      <div className="space-y-12">{topics.map((topic) => <section key={topic.title} className="border-t border-slate-900/10 pt-6"><h2 className="mb-4 text-2xl font-bold tracking-tight" style={{fontFamily:"Amaranth, sans-serif"}}>{topic.title}</h2><p className="max-w-[68ch] text-[15px] leading-[1.9] text-slate-600">{topic.body}</p></section>)}</div>
      <footer className="mt-16 border-t border-slate-900/15 pt-6 text-sm"><div className="flex flex-wrap gap-x-6 gap-y-3"><a className="text-[#167DA8] underline underline-offset-4" href="/">Return to SHAFT</a><a className="text-[#167DA8] underline underline-offset-4" href="/docs">Documentation</a><a className="text-[#167DA8] underline underline-offset-4" href="/terms">Terms &amp; Conditions</a><a className="text-[#167DA8] underline underline-offset-4" href="/privacy">Privacy Policy</a></div><p className="mt-5 text-xs text-slate-500">Last updated: October 23, 2026.</p></footer>
    </div>
  </main>
}
export default Support
