import { useEffect } from "react"
import DotField from "../components/landing/DotField"

const sections = [
  { title: "What SHAFT does", body: "SHAFT is a project-building workspace designed to help people turn ideas into structured projects and manage their development workflow. Features are actively evolving; the functionality available in your account may differ from examples or future plans." },
  { title: "Connecting Vercel", body: "When the Vercel connector is available, you can choose to connect a Vercel account and authorize the permissions shown by Vercel. Review the requested permissions before approving. SHAFT should only access resources allowed by the permissions you grant." },
  { title: "Projects and deployment data", body: "The connector is intended to display project information made available through Vercel's API, such as project names and supported metadata. It does not mean SHAFT owns your projects, and it should not be assumed to deploy, modify, or delete resources unless a feature explicitly explains that action and asks for the required authorization." },
  { title: "Disconnecting", body: "Use the connector's disconnect control where available to remove SHAFT's stored connection token. Disconnecting SHAFT does not delete projects from Vercel. You can also review and revoke third-party access through your Vercel account settings." },
  { title: "Security", body: "Never paste passwords, API tokens, private keys, or other secrets into public project content or support messages. Use only the official SHAFT site and review third-party authorization screens carefully." },
  { title: "Troubleshooting", body: "If projects do not appear, confirm that you connected the intended Vercel account or team and approved the requested permissions. Try refreshing the connector or reconnecting. Availability may be affected by Vercel API permissions, service incidents, or SHAFT updates." },
  { title: "Related policies", body: "Review the SHAFT Privacy Policy at /privacy and Terms & Conditions at /terms. For software license terms, see the End User License Agreement at /eula." },
]

export function Documentation() {
  useEffect(() => { document.title = "Documentation — SHAFT"; window.scrollTo({ top: 0, behavior: "auto" }) }, [])
  return <main className="relative min-h-screen overflow-hidden bg-[#F5F7FB] text-[#151B26]">
    <div aria-hidden="true" className="pointer-events-none fixed inset-0"><DotField theme="light" /><div className="absolute inset-0 bg-[#F5F7FB]/70" /></div>
    <div className="relative mx-auto max-w-[900px] px-6 pb-24 pt-8 sm:px-10 sm:pt-12">
      <header className="mb-20 flex items-center justify-between gap-6"><a href="/" className="text-xl font-bold lowercase tracking-tight" style={{fontFamily:"Amaranth, sans-serif"}}>shaft</a><nav className="flex gap-5 text-xs text-slate-500"><a className="hover:text-slate-900" href="/terms">Terms</a><a className="hover:text-slate-900" href="/privacy">Privacy</a></nav></header>
      <section className="mb-16"><p className="mb-5 text-xs uppercase tracking-[0.2em] text-[#167DA8]">SHAFT guide</p><h1 className="max-w-[12ch] text-[clamp(44px,8vw,76px)] font-bold leading-[.98] tracking-[-.04em]" style={{fontFamily:"Amaranth, sans-serif"}}>Documentation.</h1><p className="mt-7 max-w-[68ch] text-[15px] leading-[1.9] text-slate-600">Guidance for using SHAFT and connecting supported developer services. This documentation describes intended connector behaviour; individual features may still be in development.</p></section>
      <div className="space-y-12">{sections.map((section) => <section key={section.title} className="border-t border-slate-900/10 pt-6"><h2 className="mb-4 text-2xl font-bold tracking-tight" style={{fontFamily:"Amaranth, sans-serif"}}>{section.title}</h2><p className="max-w-[68ch] text-[15px] leading-[1.9] text-slate-600">{section.body}</p></section>)}</div>
      <footer className="mt-16 border-t border-slate-900/15 pt-6 text-sm"><div className="flex flex-wrap gap-x-6 gap-y-3"><a className="text-[#167DA8] underline underline-offset-4" href="/">Return to SHAFT</a><a className="text-[#167DA8] underline underline-offset-4" href="/eula">End User License Agreement</a><a className="text-[#167DA8] underline underline-offset-4" href="/privacy">Privacy Policy</a></div><p className="mt-5 text-xs text-slate-500">Last updated: October 23, 2026.</p></footer>
    </div>
  </main>
}
export default Documentation
