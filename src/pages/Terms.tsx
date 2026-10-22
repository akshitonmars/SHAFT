import React, { useEffect } from "react"
import DotField from "../components/landing/DotField"
import { TypewriterText } from "../components/privacy/Typewriter"

interface TermsProps {
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
    title: "1. Agreement and scope",
    paragraphs: [
      "These Terms & Conditions (" + '"Terms"' + ") govern your access to and use of the SHAFT website and any SHAFT features or services made available to you. By using the website, you agree to these Terms. If you do not agree, do not use the service.",
      "SHAFT is under active development. Features described on the website may be in preview, unavailable, or changed before release. Additional terms may apply to a specific feature; if so, those terms will be presented with that feature.",
    ],
  },
  {
    title: "2. Eligibility and authority",
    paragraphs: [
      "You may use SHAFT only if you can lawfully agree to these Terms. If you use SHAFT on behalf of an organisation, you represent that you are authorised to accept these Terms for that organisation.",
      "If the law where you live requires a parent or guardian's permission for you to use a service or enter an agreement, you must obtain that permission before using the relevant features.",
    ],
  },
  {
    title: "3. Accounts and access",
    paragraphs: [
      "Some future or limited features may require an account. Where accounts are offered, you must provide information that is accurate to the best of your knowledge and keep your sign-in credentials and access tokens secure. You are responsible for activity carried out through your account, except where applicable law says otherwise.",
      "Notify SHAFT through its verified official contact channel if you believe your account or credentials have been compromised. Never share passwords, private keys, or access tokens in public project content or general support messages.",
    ],
  },
  {
    title: "4. Acceptable use",
    paragraphs: [
      "You agree not to use SHAFT to break the law, violate another person's rights, distribute malware, interfere with the service, probe systems without authorisation, bypass rate limits or access controls, or attempt to access accounts, data, or infrastructure that you do not have permission to use.",
      "Do not use SHAFT to upload or share content that you do not have the right to use, or to abuse, threaten, deceive, or unlawfully harm others. We may investigate suspected misuse and take proportionate action where reasonably necessary to protect users and the service.",
    ],
  },
  {
    title: "5. Your content and project materials",
    paragraphs: [
      "You retain the rights you have in the code, prompts, files, ideas, and other materials you submit or connect to SHAFT. You are responsible for ensuring that you have the necessary rights and permissions to provide those materials and to let SHAFT process them for the feature you choose to use.",
      "When a feature requires us to handle your materials, you grant SHAFT a limited, non-exclusive permission to host, store, transmit, display, and process those materials only as reasonably needed to provide, secure, and maintain that feature. This permission ends when the relevant processing or retention is no longer necessary, subject to legal and operational requirements.",
      "Do not upload confidential, regulated, or sensitive material unless the applicable feature and its terms are suitable for that material. Where a feature connects an external repository or service, review the permissions requested before approving the connection.",
    ],
  },
  {
    title: "6. AI-assisted features and outputs",
    paragraphs: [
      "If SHAFT makes AI-assisted features available, their responses may be incomplete, inaccurate, outdated, or unsuitable for your particular situation. AI output is provided as assistance, not as a guarantee of correctness, security, originality, or fitness for a specific purpose.",
      "You are responsible for reviewing and testing generated code, plans, configurations, and other output before using it, deploying it, or relying on it for important decisions. Do not treat output as professional legal, medical, financial, or other regulated advice.",
      "Do not submit secrets, credentials, personal data, or third-party confidential information to an AI feature unless you have the authority to do so and the feature's disclosures explain how that information will be processed.",
    ],
  },
  {
    title: "7. Third-party services and integrations",
    paragraphs: [
      "SHAFT may offer links to, or integrations with, third-party services such as code hosting, deployment platforms, or AI providers. Those services are operated independently and may have their own terms, privacy notices, availability limits, and charges.",
      "You authorise a third-party connection only when you choose to enable it and approve its requested permissions. SHAFT is not responsible for a third party's independent service, actions, policies, or changes. You should review the relevant provider's terms before connecting it.",
    ],
  },
  {
    title: "8. SHAFT intellectual property",
    paragraphs: [
      "Except for content you own or third-party material subject to separate terms, SHAFT and its branding, website design, software, and original materials are owned by or licensed to the service operator and are protected by applicable intellectual-property laws.",
      "These Terms give you a limited, revocable, non-exclusive right to access and use the service for its intended purpose. They do not transfer ownership of SHAFT or grant rights not expressly stated here.",
    ],
  },
  {
    title: "9. Availability and changes",
    paragraphs: [
      "SHAFT may be updated, paused, restricted, or discontinued, in whole or in part. Preview, experimental, or early-access features may contain errors, have limited support, or change without notice. We will make reasonable efforts to communicate material changes where appropriate.",
      "You should keep independent backups of important project materials and avoid relying on SHAFT as the only copy of source code, credentials, deployment settings, or other critical information.",
    ],
  },
  {
    title: "10. Fees and paid features",
    paragraphs: [
      "If SHAFT introduces paid features, the price, billing interval, renewal rules, taxes, and cancellation terms will be shown before you make a purchase. Unless those terms say otherwise, you are responsible for charges you authorise through your account.",
      "Do not treat a feature as free or available indefinitely unless the applicable offer explicitly says so. Nothing in this section creates a current paid plan where none has been offered.",
    ],
  },
  {
    title: "11. Disclaimers",
    paragraphs: [
      "To the extent permitted by applicable law, the website and service are provided on an " + '"as is"' + " and " + '"as available"' + " basis. SHAFT does not promise that the service will always be uninterrupted, error-free, secure, compatible with every system, or suitable for every intended use.",
      "Nothing in these Terms excludes a consumer right, warranty, or protection that applicable law does not allow to be excluded.",
    ],
  },
  {
    title: "12. Limitation of liability",
    paragraphs: [
      "To the maximum extent permitted by applicable law, SHAFT and its operator will not be liable for indirect, incidental, special, consequential, or exemplary loss, or for loss of profits, revenue, business opportunity, data, goodwill, or anticipated savings arising from use of or inability to use the service.",
      "To the extent liability cannot lawfully be excluded, it is limited only as far as applicable law permits. These Terms do not limit liability that cannot legally be limited or excluded.",
    ],
  },
  {
    title: "13. Suspension and termination",
    paragraphs: [
      "You may stop using the public website at any time. If accounts or connected features are offered, access may be suspended or terminated where reasonably necessary to address security risks, unlawful use, serious breaches of these Terms, or operational requirements.",
      "Where practical and appropriate, SHAFT will provide notice and an opportunity to address a problem before taking action. Sections that by their nature should continue to apply after use ends will survive to that extent.",
    ],
  },
  {
    title: "14. Privacy",
    paragraphs: [
      "The SHAFT Privacy Policy explains how information is handled on the current public website. It should be read together with these Terms. If a new feature collects or processes additional information, review the privacy information and any feature-specific notices before using it.",
    ],
  },
  {
    title: "15. Changes to these Terms",
    paragraphs: [
      "These Terms may be revised as SHAFT develops or legal requirements change. The effective date below identifies this version. Material changes will be reflected on this page; where required, we will provide additional notice or request consent.",
      "Your continued use after revised Terms take effect means you accept them only to the extent that acceptance is recognised under applicable law. If you do not agree with a revised version, stop using the affected service.",
    ],
  },
  {
    title: "16. Governing law and questions",
    paragraphs: [
      "These Terms are subject to the mandatory laws that apply to your use of SHAFT. Any dispute will be handled by the competent forum under those laws. Nothing here removes a right you have under mandatory consumer-protection or other applicable law.",
      "For questions about these Terms, use the verified official contact channel published on the SHAFT website, when available.",
    ],
  },
]

export const Terms: React.FC<TermsProps> = ({ onNavigateHome }) => {
  useEffect(() => {
    document.title = "Terms & Conditions — SHAFT"
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
    <main className="legal-page terms-page relative min-h-screen overflow-hidden selection:bg-[#43B5FF]/20 selection:text-[#101319]">
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
            <span aria-current="page" className="text-[#167DA8]">Terms</span>
            <a href="/privacy" className="transition-colors hover:text-[#101319]">Privacy</a>
          </nav>
        </header>

        <section className="mb-16">
          <p className="legal-body mb-5 text-xs uppercase tracking-[0.2em] text-[#167DA8]">
            Legal
          </p>
          <h1 className="legal-display max-w-[13ch] text-[clamp(44px,8vw,76px)] font-bold leading-[0.98] tracking-[-0.035em]">
            <TypewriterText
              text="Terms & conditions."
              speed="fast"
              showCursor={false}
              className="legal-display"
            />
          </h1>
          <p className="legal-copy legal-body mt-7">
            The ground rules for accessing and using SHAFT and the features it makes available.
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
            Last updated: October 22, 2026. These terms are written for SHAFT's current public website and any features made available under additional notices.
          </p>
          <nav aria-label="Legal footer" className="legal-body mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm">
            <a href="/" onClick={(event) => { if (onNavigateHome) { event.preventDefault(); handleBackHome() } }} className="legal-link">Return to SHAFT</a>
            <a href="/privacy" className="legal-link">Privacy Policy</a>
          </nav>
        </footer>
      </div>
    </main>
  )
}

export default Terms
