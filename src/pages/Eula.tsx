import { useEffect } from "react"
import DotField from "../components/landing/DotField"

const sections = [
  { title: "1. Agreement", body: "This End User License Agreement (EULA) governs your use of the SHAFT software and website. By accessing or using SHAFT, you agree to this EULA and the SHAFT Terms & Conditions. If you do not agree, do not use the software." },
  { title: "2. Limited licence", body: "Subject to this EULA and applicable law, SHAFT grants you a limited, personal, non-exclusive, non-transferable, revocable licence to access and use the available SHAFT software for its intended purposes. This is a licence to use the service, not a sale or transfer of ownership." },
  { title: "3. Restrictions", body: "You must not copy, modify, distribute, sell, lease, sublicense, reverse engineer, or attempt to extract source code from SHAFT except where applicable law permits or the relevant component's licence expressly allows it. You must not misuse the service, bypass security controls, or access resources without permission." },
  { title: "4. Your projects and content", body: "You retain whatever rights you hold in content, code, prompts, and project materials you provide. You are responsible for having the rights and permissions needed to use those materials with SHAFT. You should keep independent backups of important work." },
  { title: "5. Third-party services", body: "SHAFT may connect to services such as Vercel, GitHub, or AI providers. Those services are governed by their own terms and policies. You are responsible for reviewing and approving permissions requested by each provider. A connection does not transfer ownership of your third-party account or projects to SHAFT." },
  { title: "6. Updates and availability", body: "SHAFT may change, suspend, or discontinue features. Updates may be required for continued use. Early-access and experimental features may be incomplete or unavailable and may change without notice." },
  { title: "7. Disclaimer", body: "To the extent permitted by law, SHAFT is provided on an “as is” and “as available” basis without a promise that it will be uninterrupted, error-free, or fit for a particular purpose. Review and test generated code, plans, and configurations before relying on or deploying them." },
  { title: "8. Limitation of liability", body: "To the maximum extent permitted by applicable law, SHAFT is not liable for indirect or consequential losses, including loss of data, profits, or business opportunities arising from use of the software. Nothing in this EULA excludes liability or rights that cannot lawfully be excluded." },
  { title: "9. Termination", body: "This licence ends when you stop using SHAFT or if your access is terminated for a material breach or security reason. Upon termination, stop using the software. Terms that by their nature should survive will continue to apply to the extent required." },
  { title: "10. Changes and contact", body: "This EULA may be updated as SHAFT evolves. The current version will be published on this page. For related information, read the SHAFT Terms & Conditions at /terms and Privacy Policy at /privacy. Use the verified contact channel published on the official SHAFT website for questions." },
]

export function Eula() {
  useEffect(() => { document.title = "End User License Agreement — SHAFT"; window.scrollTo({ top: 0, behavior: "auto" }) }, [])
  return <main className="relative min-h-screen overflow-hidden bg-[#F5F7FB] text-[#151B26]">
    <div aria-hidden="true" className="pointer-events-none fixed inset-0"><DotField theme="light" /><div className="absolute inset-0 bg-[#F5F7FB]/70" /></div>
    <div className="relative mx-auto max-w-[900px] px-6 pb-24 pt-8 sm:px-10 sm:pt-12">
      <header className="mb-20 flex items-center justify-between gap-6"><a href="/" className="text-xl font-bold lowercase tracking-tight" style={{fontFamily:"Amaranth, sans-serif"}}>shaft</a><nav className="flex gap-5 text-xs text-slate-500"><a className="hover:text-slate-900" href="/terms">Terms</a><a className="hover:text-slate-900" href="/privacy">Privacy</a></nav></header>
      <section className="mb-16"><p className="mb-5 text-xs uppercase tracking-[0.2em] text-[#167DA8]">Legal</p><h1 className="max-w-[13ch] text-[clamp(44px,8vw,76px)] font-bold leading-[.98] tracking-[-.04em]" style={{fontFamily:"Amaranth, sans-serif"}}>End user licence agreement.</h1><p className="mt-7 max-w-[68ch] text-[15px] leading-[1.9] text-slate-600">Terms governing the licensed use of SHAFT software and services.</p><p className="mt-5 text-xs text-slate-500">Effective date: October 23, 2026</p></section>
      <div className="space-y-12">{sections.map((section) => <section key={section.title} className="border-t border-slate-900/10 pt-6"><h2 className="mb-4 text-2xl font-bold tracking-tight" style={{fontFamily:"Amaranth, sans-serif"}}>{section.title}</h2><p className="max-w-[68ch] text-[15px] leading-[1.9] text-slate-600">{section.body}</p></section>)}</div>
      <footer className="mt-16 border-t border-slate-900/15 pt-6 text-sm"><div className="flex flex-wrap gap-x-6 gap-y-3"><a className="text-[#167DA8] underline underline-offset-4" href="/">Return to SHAFT</a><a className="text-[#167DA8] underline underline-offset-4" href="/terms">Terms &amp; Conditions</a><a className="text-[#167DA8] underline underline-offset-4" href="/privacy">Privacy Policy</a></div><p className="mt-5 text-xs text-slate-500">Last updated: October 23, 2026.</p></footer>
    </div>
  </main>
}
export default Eula
