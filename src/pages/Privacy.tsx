import React, { useState, useEffect } from "react"
import DotField from "../components/landing/DotField"
import Footer from "../components/landing/Footer"
import { PrivacyNavbar } from "../components/privacy/PrivacyNavbar"
import { TypewriterHero } from "../components/privacy/TypewriterHero"
import { PrivacyContent } from "../components/privacy/PrivacyContent"
import type { TypewriterSpeed } from "../components/privacy/Typewriter"

interface PrivacyProps {
  onNavigateHome?: () => void
}

const PAGE_CSS = `
@import url("https://fonts.googleapis.com/css2?family=Amaranth:wght@400;700&family=Inter:wght@300;400;500;600;700&display=swap");

.privacy-page {
  font-family: 'Inter', system-ui, sans-serif;
  color-scheme: dark;
}

.font-primary {
  font-family: 'Amaranth', sans-serif;
}

.font-secondary {
  font-family: 'Inter', system-ui, sans-serif;
}
`

export const Privacy: React.FC<PrivacyProps> = ({ onNavigateHome }) => {
  const [speed, setSpeed] = useState<TypewriterSpeed>("normal")
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false)

  useEffect(() => {
    document.title = "Privacy Policy — SHAFT (Build Beyond Ideas)"
    window.scrollTo({ top: 0, behavior: "smooth" })

    // Load saved preferences if available
    try {
      const savedSpeed = localStorage.getItem("shaft_typewriter_speed") as TypewriterSpeed | null
      if (savedSpeed && (savedSpeed === "normal" || savedSpeed === "fast" || savedSpeed === "instant")) {
        setSpeed(savedSpeed)
      }
      const savedSound = localStorage.getItem("shaft_typewriter_sound")
      if (savedSound !== null) {
        setSoundEnabled(savedSound === "true")
      }
    } catch {
      // localStorage not available
    }
  }, [])

  const handleSpeedChange = (newSpeed: TypewriterSpeed) => {
    setSpeed(newSpeed)
    try {
      localStorage.setItem("shaft_typewriter_speed", newSpeed)
    } catch {
      // ignore
    }
  }

  const handleToggleSound = () => {
    setSoundEnabled((prev) => {
      const next = !prev
      try {
        localStorage.setItem("shaft_typewriter_sound", String(next))
      } catch {
        // ignore
      }
      return next
    })
  }

  const handleBackHome = () => {
    if (onNavigateHome) {
      onNavigateHome()
    } else {
      window.location.href = "/"
    }
  }

  return (
    <div className="privacy-page relative min-h-screen bg-[#050B1F] text-[#F4F5F2] overflow-x-hidden selection:bg-[#43B5FF]/30 selection:text-[#43B5FF]">
      <style>{PAGE_CSS}</style>

      {/* Interactive Proximity Dotted Background (Cosmic Theme) */}
      <div className="fixed inset-0 pointer-events-auto z-0">
        <DotField theme="cosmic" />
      </div>

      {/* Ambient Cosmic Glowing Atmosphere Orbs */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -left-40 top-10 h-[520px] w-[520px] rounded-full bg-[#1E5BFF] opacity-35 blur-[140px]" />
        <div className="absolute left-1/2 top-40 h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-[#2B3FD6] opacity-30 blur-[130px]" />
        <div className="absolute -right-32 top-80 h-[540px] w-[540px] rounded-full bg-[#43B5FF] opacity-25 blur-[150px]" />
        <div className="absolute left-1/4 bottom-32 h-[420px] w-[420px] rounded-full bg-[#78CFC4] opacity-20 blur-[130px]" />
      </div>

      {/* Floating Glass Navigation */}
      <PrivacyNavbar
        speed={speed}
        onSpeedChange={handleSpeedChange}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        onNavigateHome={handleBackHome}
      />

      {/* Page Content Container */}
      <div className="relative z-10">
        <TypewriterHero speed={speed} soundEnabled={soundEnabled} />
        <PrivacyContent speed={speed} soundEnabled={soundEnabled} />
        <Footer onPrivacyClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} />
      </div>
    </div>
  )
}

export default Privacy
