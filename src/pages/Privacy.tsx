import React, { useEffect } from "react"
import DotField from "../components/landing/DotField"
import { TypewriterText } from "../components/privacy/Typewriter"

interface PrivacyProps {
  onNavigateHome?: () => void
}

const PAGE_CSS = [
  '@import url("https://fonts.googleapis.com/css2?family=Amaranth:wght@400;700&family=Inter:wght@400;500;600&display=swap");',
  '.legal-page { font-family: "Inter", system-ui, sans-serif; color: #151B26; background: #F5F7FB; }',
  '.legal-page .legal-display { font-family: "Amaranth", sans-serif; color: #101319; }',
  '.legal-page .legal-body { font-family: "Inter", system-ui, sans-serif; }',
  '.legal-page .legal-section { border-top: 1px solid rgba(16,19,25,.12); padding-top: 1.5rem; }',
  '.legal-page .legal-copy { max-width: 68ch; color: rgba(21,27,38,.78); font-size: 15px; line-height: 1.9; }',
  '.legal-page .legal-link { color: #167DA8; text-decoration: underline; text-decoration-color: rgba(22,125,168,.4); text-underline-offset: 4px; }',
  '.legal-page .legal-mark { position: absolute; z-index: 1; left: 50%; top: 48%; width: min(78vw, 860px); max-height: 82vh; object-fit: contain; transform: translate(-50%,-50%); opacity: .045; mix-blend-mode: multiply; animation: legalMarkDrift 38s ease-in-out infinite alternate; }',
  '@keyframes legalMarkDrift { from { transform: translate(-52%,-48%) rotate(-4deg) scale(.97); opacity: .028; } to { transform: translate(-48%,-52%) rotate(4deg) scale(1.035); opacity: .06; } }',
  '@media (prefers-reduced-motion: reduce) { .legal-page .legal-mark { animation: none; transform: translate(-50%,-50%); } .legal-page * { scroll-behavior: auto !important; } }',
].join("\n")

const sections = [
  {
    title: "About this policy",
    paragraphs: [
      "This notice describes how SHAFT handles information when you visit its current public website. SHAFT is in active development, and the available features may change. We will update this notice when new features change what information is collected or how it is used.",
    ],
  },
  {
    title: "Information that may be collected",
    paragraphs: [
      "When you load a website, the hosting and delivery systems may process technical request information such as your IP address, browser and device details, the page requested, the time of the request, referring page, and error or security logs. This information can help deliver the site, diagnose faults, and protect its availability.",
      "The current site loads the Amaranth and Inter typefaces through Google Fonts. When your browser requests those font files, Google receives the technical information needed to fulfil the request, which can include your IP address. See the Google Fonts privacy information for details.",
      "If you contact SHAFT directly, the information you choose to include in that communication may be processed to read and respond to your message. Do not include passwords, access tokens, or private repository secrets in a message.",
    ],
  },
  {
    title: "How information is used",
    paragraphs: [
      "Technical information is used where needed to serve the website, understand and fix technical errors, maintain security, and prevent misuse. Information you send directly is used to respond to your request.",
      "SHAFT does not sell personal information collected through its current public website. The current public landing page does not provide account creation, project connections, or an AI prompt interface. If those features are introduced, this policy must be updated to explain the relevant data flows before they are made available.",
    ],
  },
  {
    title: "Service providers and external links",
    paragraphs: [
      "SHAFT is deployed through Vercel, which provides website hosting and delivery infrastructure. Google Fonts supplies the typefaces used by this page. These providers process information under their own service terms and privacy notices. Their handling of information is not controlled solely by SHAFT.",
      "The site may link to third-party websites, including developer platforms. When you leave SHAFT, the other website's privacy notice and terms apply to your use of that service.",
    ],
  },
  {
    title: "Cookies, storage, and analytics",
    paragraphs: [
      "This page does not offer a cookie-preference control. Hosting or delivery infrastructure may use technical mechanisms needed to operate, protect, or measure service delivery. Do not assume that every third-party technology follows the same rules; consult the relevant provider's notice for more information.",
      "SHAFT will describe any first-party analytics, optional cookies, or persistent browser storage if these are added to the public website.",
    ],
  },
  {
    title: "Retention and security",
    paragraphs: [
      "Technical logs are retained according to the operational and security practices of the relevant infrastructure provider. Messages sent directly to SHAFT are kept only as needed to handle the request and maintain appropriate records, subject to applicable legal requirements.",
      "SHAFT takes reasonable care with information it handles, but no website or method of transmission can be guaranteed completely secure. Avoid sending sensitive credentials or secrets through general contact channels.",
    ],
  },
  {
    title: "Your choices and rights",
    paragraphs: [
      "Depending on where you live and the law that applies, you may have rights to request access to, correction of, deletion of, or restrictions on the use of personal information. You may also be able to object to certain processing or raise a concern with your local data-protection authority.",
      "For a privacy request, use the verified official contact channel published by SHAFT, when available. Privacy requests should be reviewed in light of the laws that apply to the person and the processing involved.",
    ],
  },
  {
    title: "Children's privacy",
    paragraphs: [
      "The public website is not designed to request sensitive personal information from children. If you believe a child has provided personal information to SHAFT, please use the official contact channel so the situation can be reviewed.",
    ],
  },
  {
    title: "Changes to this notice",
    paragraphs: [
      "This policy may change as SHAFT develops. The date below indicates when this version was published. Material changes will be reflected on this page.",
    ],
  },
]

export const Privacy: React.FC<PrivacyProps> = ({ onNavigateHome }) => {
  useEffect(() => {
    document.title = "Privacy Policy — SHAFT"
    window.scrollTo({ top: 0, behavior: "auto" })
  }, [])

  const handleBackHome = () => {
    if (onNavigateHome) {
      onNavigateHome()
    } else {
      window.location.href = "/"
    }
  }

  return (
    <main className="legal-page privacy-page relative min-h-screen overflow-hidden selection:bg-[#43B5FF]/20 selection:text-[#101319]">
      <style>{PAGE_CSS}</style>

      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <DotField theme="light" />
        <div className="absolute inset-0 bg-[#F5F7FB]/55" />
        <img src="/logo.png" alt="" className="legal-mark" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[900px] px-6 pb-24 pt-8 sm:px-10 sm:pt-12">
        <header className="mb-20 flex items-center justify-between gap-6">
          <a
            href="/"
            onClick={(event) => {
              if (onNavigateHome) {
                event.preventDefault()
                handleBackHome()
              }
            }}
            className="legal-display rounded-sm text-xl font-bold lowercase tracking-[-0.03em] transition-opacity hover:opacity-65 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#167DA8]"
          >
            shaft
          </a>
          <nav aria-label="Legal pages" className="legal-body flex items-center gap-4 text-xs text-slate-500 sm:gap-6">
            <a href="/terms" className="transition-colors hover:text-[#101319]">Terms</a>
            <span aria-current="page" className="text-[#167DA8]">Privacy</span>
          </nav>
        </header>

        <section className="mb-16">
          <p className="legal-body mb-5 text-xs uppercase tracking-[0.2em] text-[#167DA8]">
            Legal
          </p>
          <h1 className="legal-display max-w-[12ch] text-[clamp(44px,8vw,76px)] font-bold leading-[0.98] tracking-[-0.035em]">
            <TypewriterText
              text="Privacy policy."
              speed="fast"
              showCursor={false}
              className="legal-display"
            />
          </h1>
          <p className="legal-copy legal-body mt-7">
            A plain-language explanation of how information is handled on SHAFT's current public website.
          </p>
          <p className="legal-body mt-5 text-xs text-slate-500">
            Effective date: October 22, 2026
          </p>
        </section>

        <div className="space-y-12">
          {sections.map((section) => (
            <section className="legal-section" key={section.title}>
              <h2 className="legal-display mb-4 text-[clamp(22px,3vw,30px)] font-bold leading-tight tracking-[-0.02em]">
                {section.title}
              </h2>
              <div className="space-y-4">
                {section.paragraphs.map((paragraph, paragraphIndex) => (
                  <p className="legal-copy legal-body" key={paragraphIndex}>
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <footer className="mt-16 border-t border-slate-900/15 pt-6">
          <p className="legal-body text-xs leading-relaxed text-slate-500">
            Last updated: October 22, 2026. This notice describes the current public website, not every feature planned for future SHAFT releases.
          </p>
          <nav aria-label="Legal footer" className="legal-body mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm">
            <a href="/" onClick={(event) => { if (onNavigateHome) { event.preventDefault(); handleBackHome() } }} className="legal-link">Return to SHAFT</a>
            <a href="/terms" className="legal-link">Terms &amp; Conditions</a>
          </nav>
        </footer>
      </div>
    </main>
  )
}

export default Privacy
