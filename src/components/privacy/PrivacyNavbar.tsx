import React from "react"
import { ArrowLeft, Volume2, VolumeX, Zap, FastForward, Play } from "lucide-react"
import type { TypewriterSpeed } from "./Typewriter"

interface PrivacyNavbarProps {
  speed: TypewriterSpeed
  onSpeedChange: (speed: TypewriterSpeed) => void
  soundEnabled: boolean
  onToggleSound: () => void
  onNavigateHome: () => void
}

export const PrivacyNavbar: React.FC<PrivacyNavbarProps> = ({
  speed,
  onSpeedChange,
  soundEnabled,
  onToggleSound,
  onNavigateHome,
}) => {
  return (
    <header className="fixed inset-x-0 top-3 z-50 flex justify-center px-3 sm:px-6 pointer-events-none">
      <div className="pointer-events-auto flex w-full max-w-[1140px] items-center justify-between rounded-full border border-white/10 bg-[#07123A]/80 p-2 shadow-[0_12px_40px_rgba(3,10,30,0.45)] backdrop-blur-2xl transition-all duration-300">
        {/* Left: Back to Home & Logo */}
        <div className="flex items-center gap-3 pl-2 sm:pl-3">
          <button
            type="button"
            onClick={onNavigateHome}
            aria-label="Return to Shaft home"
            className="group flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-medium text-white/80 transition-all hover:border-[#43B5FF]/50 hover:bg-white/[0.12] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#43B5FF]"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-x-0.5 text-[#43B5FF]" />
            <span className="hidden sm:inline" style={{ fontFamily: "Inter, sans-serif" }}>Back to Shaft</span>
          </button>

          <a
            href="/"
            onClick={(e) => {
              e.preventDefault()
              onNavigateHome()
            }}
            className="flex items-center gap-2 outline-none"
          >
            <img src="/logo.png" alt="Shaft Logo" className="h-6 w-6 object-contain" />
            <span
              className="text-lg font-bold text-white tracking-tight hidden md:inline"
              style={{ fontFamily: "Amaranth, sans-serif" }}
            >
              Shaft
            </span>
            <span className="rounded border border-[#43B5FF]/30 bg-[#43B5FF]/10 px-2 py-0.5 text-[10px] font-semibold text-[#43B5FF] uppercase tracking-wider">
              Privacy
            </span>
          </a>
        </div>

        {/* Center / Right: Typewriter Controls & CTA */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Audio toggle button */}
          <button
            type="button"
            onClick={onToggleSound}
            aria-label={soundEnabled ? "Mute typewriter sound" : "Enable typewriter mechanical sound"}
            title={soundEnabled ? "Sound ON: Mechanical keystroke audio active" : "Sound OFF: Click to enable audio"}
            className={`flex h-8 items-center gap-1.5 rounded-full border px-2.5 text-xs font-medium transition-all ${
              soundEnabled
                ? "border-[#43B5FF]/50 bg-[#43B5FF]/15 text-[#43B5FF]"
                : "border-white/10 bg-white/[0.04] text-white/50 hover:bg-white/[0.08] hover:text-white/80"
            }`}
          >
            {soundEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
            <span className="text-[11px] hidden lg:inline" style={{ fontFamily: "Inter, sans-serif" }}>
              {soundEnabled ? "Sound ON" : "Audio"}
            </span>
          </button>

          {/* Speed switcher pill */}
          <div className="flex items-center rounded-full border border-white/10 bg-white/[0.04] p-0.5 text-[11px]">
            <span className="px-2 text-white/40 hidden xl:inline" style={{ fontFamily: "Inter, sans-serif" }}>
              Speed:
            </span>
            {(
              [
                { id: "normal", label: "1x", icon: Play },
                { id: "fast", label: "3x", icon: FastForward },
                { id: "instant", label: "Skip", icon: Zap },
              ] as const
            ).map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => onSpeedChange(s.id)}
                className={`flex items-center gap-1 rounded-full px-2.5 py-1 font-medium transition-all ${
                  speed === s.id
                    ? "bg-[#43B5FF] text-[#07123A] font-semibold shadow-[0_0_12px_rgba(67,181,255,0.4)]"
                    : "text-white/60 hover:text-white hover:bg-white/[0.06]"
                }`}
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                <span>{s.label}</span>
              </button>
            ))}
          </div>

          {/* Primary CTA */}
          <a
            href="/get-started"
            className="group relative hidden sm:inline-flex h-8 items-center gap-1.5 rounded-full bg-white px-3.5 text-xs font-semibold text-[#07123A] shadow-sm transition-all hover:bg-white/90 hover:scale-[1.02]"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            <span>Start building</span>
            <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-0.5">
              ↗
            </span>
          </a>
        </div>
      </div>
    </header>
  )
}
