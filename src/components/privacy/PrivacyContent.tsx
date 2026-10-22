import React, { useState, useMemo } from "react"
import {
  ShieldAlert,
  Search,
  ExternalLink,
  CheckCircle2,
  Lock,
  ChevronRight,
  BookOpen,
  Filter,
} from "lucide-react"
import { POLICY_SECTIONS, type PolicySection } from "./policyData"
import { TypewriterText, type TypewriterSpeed } from "./Typewriter"

interface PrivacyContentProps {
  speed: TypewriterSpeed
  soundEnabled: boolean
}

export const PrivacyContent: React.FC<PrivacyContentProps> = ({ speed, soundEnabled }) => {
  const [activeSectionId, setActiveSectionId] = useState<string>("zero-training")
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"focused" | "all">("focused")

  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return POLICY_SECTIONS
    const q = searchQuery.toLowerCase()
    return POLICY_SECTIONS.filter((sec) => {
      const matchTitle = sec.title.toLowerCase().includes(q)
      const matchSummary = sec.summary.toLowerCase().includes(q)
      const matchParagraphs = sec.paragraphs.some((p) => p.toLowerCase().includes(q))
      const matchClauses = sec.clauses?.some(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.tags?.some((t) => t.toLowerCase().includes(q))
      )
      return matchTitle || matchSummary || matchParagraphs || matchClauses
    })
  }, [searchQuery])

  const activeSection = useMemo(() => {
    return POLICY_SECTIONS.find((s) => s.id === activeSectionId) || POLICY_SECTIONS[0]
  }, [activeSectionId])

  return (
    <section className="relative px-4 sm:px-6 lg:px-8 pb-32 max-w-7xl mx-auto">
      {/* Search & View Mode Controls Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl mb-8">
        {/* Search input */}
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search clauses (e.g. training, OAuth, encryption, cookies)..."
            className="w-full rounded-full border border-white/10 bg-black/30 py-2 pl-9 pr-4 text-xs text-white placeholder-white/40 outline-none transition-colors focus:border-[#43B5FF] focus:ring-1 focus:ring-[#43B5FF]"
            style={{ fontFamily: "Inter, sans-serif" }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/50 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-2 self-end sm:self-auto text-xs" style={{ fontFamily: "Inter, sans-serif" }}>
          <span className="text-white/40 hidden md:inline">Mode:</span>
          <button
            type="button"
            onClick={() => setViewMode("focused")}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 font-medium transition-all ${
              viewMode === "focused"
                ? "bg-[#43B5FF]/20 text-[#43B5FF] border border-[#43B5FF]/40"
                : "text-white/60 hover:text-white hover:bg-white/[0.05]"
            }`}
          >
            <Filter className="h-3 w-3" />
            <span>Interactive Stream</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("all")}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 font-medium transition-all ${
              viewMode === "all"
                ? "bg-[#43B5FF]/20 text-[#43B5FF] border border-[#43B5FF]/40"
                : "text-white/60 hover:text-white hover:bg-white/[0.05]"
            }`}
          >
            <BookOpen className="h-3 w-3" />
            <span>Complete Document</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Navigation Sidebar & Content Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Navigation Sidebar */}
        <aside className="lg:col-span-4 sticky top-20 rounded-2xl border border-white/10 bg-[#07123A]/60 p-3 backdrop-blur-xl space-y-1 overflow-hidden">
          <div className="px-3 py-2 border-b border-white/10 mb-2 flex items-center justify-between">
            <span
              className="text-xs font-semibold uppercase tracking-wider text-white/50"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              Sections ({filteredSections.length})
            </span>
            <span className="text-[10px] font-mono text-[#43B5FF]">SHAFT-LEGAL</span>
          </div>

          <div className="max-h-[calc(100vh-220px)] overflow-y-auto space-y-1 pr-1">
            {filteredSections.map((sec) => {
              const isSelected = activeSectionId === sec.id
              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => {
                    setActiveSectionId(sec.id)
                    if (viewMode === "all") {
                      const el = document.getElementById(sec.id)
                      el?.scrollIntoView({ behavior: "smooth" })
                    }
                  }}
                  className={`w-full flex items-start gap-3 rounded-xl p-3 text-left transition-all ${
                    isSelected
                      ? "bg-[#43B5FF]/15 border border-[#43B5FF]/40 text-white shadow-[0_0_15px_rgba(67,181,255,0.15)]"
                      : "text-white/60 hover:bg-white/[0.04] hover:text-white/90 border border-transparent"
                  }`}
                >
                  <span
                    className={`font-mono text-xs font-bold shrink-0 pt-0.5 ${
                      isSelected ? "text-[#43B5FF]" : "text-white/40"
                    }`}
                  >
                    {sec.number}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-semibold truncate leading-tight"
                      style={{ fontFamily: "Amaranth, sans-serif" }}
                    >
                      {sec.title}
                    </p>
                    <p
                      className="text-[11px] text-white/50 truncate mt-1"
                      style={{ fontFamily: "Inter, sans-serif" }}
                    >
                      {sec.summary}
                    </p>
                  </div>
                  <ChevronRight
                    className={`h-4 w-4 shrink-0 transition-transform ${
                      isSelected ? "text-[#43B5FF] translate-x-0.5" : "text-white/20"
                    }`}
                  />
                </button>
              )
            })}
          </div>
        </aside>

        {/* Content Viewer */}
        <main className="lg:col-span-8 space-y-8">
          {viewMode === "focused" ? (
            /* Focused Single Section with Active Typewriter */
            <SectionCard
              key={activeSection.id}
              section={activeSection}
              speed={speed}
              soundEnabled={soundEnabled}
              isSingleView
            />
          ) : (
            /* Full Continuous Document View */
            <div className="space-y-12">
              {filteredSections.map((sec) => (
                <SectionCard
                  key={sec.id}
                  section={sec}
                  speed="instant"
                  soundEnabled={false}
                  isSingleView={false}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </section>
  )
}

interface SectionCardProps {
  section: PolicySection
  speed: TypewriterSpeed
  soundEnabled: boolean
  isSingleView: boolean
}

const SectionCard: React.FC<SectionCardProps> = ({ section, speed, soundEnabled, isSingleView }) => {
  return (
    <article
      id={section.id}
      className="rounded-3xl border border-white/10 bg-[#07123A]/80 p-6 sm:p-9 shadow-[0_20px_60px_rgba(3,10,30,0.4)] backdrop-blur-2xl transition-all"
    >
      {/* Badge & Section Number */}
      <div className="flex items-center justify-between pb-5 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <span className="font-mono text-sm font-bold text-[#43B5FF]">{section.number}</span>
          <span className="h-1 w-1 rounded-full bg-white/20" />
          <span
            className="rounded-full border border-[#43B5FF]/30 bg-[#43B5FF]/10 px-2.5 py-0.5 text-[11px] font-semibold text-[#43B5FF] uppercase tracking-wider"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            {section.badge || "Standard Provision"}
          </span>
        </div>
        <span className="text-xs font-mono text-white/40">RFC-COMPLIANT</span>
      </div>

      {/* Section Title in Amaranth */}
      <h2
        className="mt-6 text-2xl sm:text-3xl font-bold leading-tight text-white tracking-tight"
        style={{ fontFamily: "Amaranth, sans-serif" }}
      >
        {isSingleView && speed !== "instant" ? (
          <TypewriterText text={section.title} speed={speed} soundEnabled={soundEnabled} />
        ) : (
          section.title
        )}
      </h2>

      {/* Executive Summary in Inter */}
      <div className="mt-4 rounded-xl border border-[#43B5FF]/20 bg-[#43B5FF]/5 p-4">
        <p className="text-sm leading-relaxed text-[#78CFC4]" style={{ fontFamily: "Inter, sans-serif" }}>
          {isSingleView && speed !== "instant" ? (
            <TypewriterText
              text={section.summary}
              speed={speed}
              soundEnabled={soundEnabled}
              delay={300}
            />
          ) : (
            section.summary
          )}
        </p>
      </div>

      {/* Paragraphs in Inter */}
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-white/80" style={{ fontFamily: "Inter, sans-serif" }}>
        {section.paragraphs.map((p, idx) => (
          <p key={idx}>
            {isSingleView && speed !== "instant" ? (
              <TypewriterText
                text={p}
                speed={speed}
                soundEnabled={soundEnabled}
                delay={600 + idx * 400}
              />
            ) : (
              p
            )}
          </p>
        ))}
      </div>

      {/* Guarantee Alert Callout if available */}
      {section.guaranteeNote && (
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <h4
              className="text-xs font-bold uppercase tracking-wider text-emerald-400"
              style={{ fontFamily: "Amaranth, sans-serif" }}
            >
              Enforced Policy Guarantee
            </h4>
            <p className="mt-1 text-xs leading-relaxed text-white/80" style={{ fontFamily: "Inter, sans-serif" }}>
              {section.guaranteeNote}
            </p>
          </div>
        </div>
      )}

      {/* Clauses / Specific Technical Provisions */}
      {section.clauses && section.clauses.length > 0 && (
        <div className="mt-8 pt-6 border-t border-white/10 space-y-4">
          <h3
            className="text-xs font-semibold uppercase tracking-wider text-white/50 mb-3"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            Technical Clauses & Sub-Provisions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {section.clauses.map((clause) => (
              <div
                key={clause.id}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition-all hover:border-[#43B5FF]/30 hover:bg-white/[0.06]"
              >
                <div className="flex items-center gap-2 text-white font-semibold text-sm">
                  <Lock className="h-3.5 w-3.5 text-[#43B5FF]" />
                  <span style={{ fontFamily: "Amaranth, sans-serif" }}>{clause.title}</span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-white/70" style={{ fontFamily: "Inter, sans-serif" }}>
                  {clause.description}
                </p>
                {clause.tags && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {clause.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] font-mono text-white/60"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </article>
  )
}
