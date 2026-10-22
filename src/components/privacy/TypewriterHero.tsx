import React, { useState } from "react"
import { EyeOff, ShieldCheck, Lock, RefreshCw, Terminal, Check, Copy } from "lucide-react"
import { TypewriterText, type TypewriterSpeed } from "./Typewriter"
import { CORE_TENETS, POLICY_METADATA } from "./policyData"

interface TypewriterHeroProps {
  speed: TypewriterSpeed
  soundEnabled: boolean
}

export const TypewriterHero: React.FC<TypewriterHeroProps> = ({ speed, soundEnabled }) => {
  const [copied, setCopied] = useState(false)

  const manifestSnippet = `{
  "system": "SHAFT Command Center",
  "foundation_model_training": false,
  "codebase_mirroring": "ephemeral_only",
  "credential_encryption": "AES-256-GCM",
  "inference_retention": "zero_data_retention",
  "tenant_isolation": "cryptographically_enforced"
}`

  const copyManifest = () => {
    navigator.clipboard.writeText(manifestSnippet)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section className="relative pt-28 pb-16 px-4 sm:px-6 lg:px-8 text-center max-w-6xl mx-auto">
      {/* Eyebrow / Security Badge */}
      <div className="inline-flex items-center gap-2 rounded-full border border-[#43B5FF]/30 bg-[#43B5FF]/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#43B5FF] shadow-[0_0_20px_rgba(67,181,255,0.15)]">
        <span className="h-1.5 w-1.5 rounded-full bg-[#43B5FF] animate-pulse" />
        <span style={{ fontFamily: "Inter, sans-serif" }}>SHAFT Transparency Protocol // v{POLICY_METADATA.version}</span>
      </div>

      {/* Main Amaranth Headline with Typewriter Animation */}
      <h1
        className="mt-6 text-[clamp(36px,6.2vw,74px)] font-bold leading-[1.04] tracking-[-0.03em] text-white"
        style={{ fontFamily: "Amaranth, sans-serif" }}
      >
        <TypewriterText
          text="Privacy Policy & Code Governance."
          speed={speed}
          soundEnabled={soundEnabled}
          cursorClassName="bg-[#43B5FF] shadow-[0_0_12px_#43B5FF]"
        />
      </h1>

      {/* Inter Secondary Subheading */}
      <p
        className="mt-5 max-w-3xl mx-auto text-[17px] sm:text-[19px] leading-relaxed text-white/70"
        style={{ fontFamily: "Inter, sans-serif" }}
      >
        <TypewriterText
          text="Radical transparency for builders. We do not train models on your code. Your credentials are encrypted at rest, and all project telemetry remains under your strict control."
          speed={speed}
          soundEnabled={soundEnabled}
          delay={speed === "instant" ? 0 : 500}
        />
      </p>

      {/* Protocol Metadata Bar */}
      <div
        className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs text-white/50"
        style={{ fontFamily: "Inter, sans-serif" }}
      >
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[#3DDC97]" />
          Effective: <strong className="text-white/80">{POLICY_METADATA.effectiveDate}</strong>
        </span>
        <span className="hidden sm:inline text-white/20">|</span>
        <span>
          Compliance: <strong className="text-white/80">GDPR, UK GDPR, CCPA/CPRA</strong>
        </span>
        <span className="hidden sm:inline text-white/20">|</span>
        <span>
          Classification: <strong className="text-[#43B5FF]">Zero-Retention Enforced</strong>
        </span>
      </div>

      {/* Live Typewriter Code Manifest Box */}
      <div className="mt-12 text-left max-w-2xl mx-auto rounded-2xl border border-white/10 bg-[#07123A]/70 shadow-[0_20px_60px_rgba(3,10,30,0.5)] backdrop-blur-xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.04] px-4 py-2.5">
          <div className="flex items-center gap-2">
            <div className="flex space-x-1.5" aria-hidden="true">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" />
            </div>
            <div className="h-3 w-px bg-white/10 mx-1" />
            <div className="flex items-center gap-1.5 font-mono text-[11px] text-white/60">
              <Terminal className="h-3 w-3 text-[#43B5FF]" />
              <span>transparency-manifest.json</span>
            </div>
          </div>
          <button
            type="button"
            onClick={copyManifest}
            className="flex items-center gap-1 text-[11px] font-mono text-white/50 hover:text-white transition-colors"
          >
            {copied ? <Check className="h-3 w-3 text-[#3DDC97]" /> : <Copy className="h-3 w-3" />}
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>
        </div>

        <div className="p-4 sm:p-5 font-mono text-[13px] leading-relaxed text-[#78CFC4] bg-[#050B1F]/60 overflow-x-auto">
          <pre className="whitespace-pre">
            <TypewriterText
              text={manifestSnippet}
              speed={speed}
              soundEnabled={soundEnabled}
              delay={speed === "instant" ? 0 : 900}
              cursorClassName="bg-[#78CFC4] shadow-[0_0_8px_#78CFC4]"
            />
          </pre>
        </div>
      </div>

      {/* 4 Core Tenets Grid */}
      <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
        {CORE_TENETS.map((tenet, idx) => {
          const Icon =
            idx === 0
              ? EyeOff
              : idx === 1
              ? ShieldCheck
              : idx === 2
              ? Lock
              : RefreshCw

          return (
            <div
              key={tenet.title}
              className="group rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-md transition-all duration-300 hover:border-[#43B5FF]/40 hover:bg-white/[0.07] hover:-translate-y-0.5"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#43B5FF]/10 text-[#43B5FF] border border-[#43B5FF]/20 mb-4 transition-colors group-hover:bg-[#43B5FF]/20">
                <Icon className="h-5 w-5" />
              </div>
              <h3
                className="text-base font-bold text-white tracking-tight"
                style={{ fontFamily: "Amaranth, sans-serif" }}
              >
                {tenet.title}
              </h3>
              <p
                className="mt-2 text-xs leading-relaxed text-white/70"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                {tenet.description}
              </p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
