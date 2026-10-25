import type { CSSProperties } from "react"

interface DashboardNavbarProps {
  displayName: string
  initials: string
  photoURL?: string | null
  onProfileClick: () => void
}

const PILL_SHINE: CSSProperties = {
  borderRadius: "inherit",
  padding: "1.5px",
  background:
    "linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0.65) 14%, rgba(255,255,255,0) 36%, rgba(255,255,255,0) 64%, rgba(255,255,255,0.65) 86%, rgba(255,255,255,1) 100%)",
  WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
  WebkitMaskComposite: "xor",
  mask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
  maskComposite: "exclude",
}

function PillShine() {
  return <span aria-hidden="true" style={PILL_SHINE} className="pointer-events-none absolute inset-0" />
}

export default function DashboardNavbar({
  displayName,
  initials,
  photoURL,
  onProfileClick,
}: DashboardNavbarProps) {
  const pillClass =
    "relative flex h-12 shrink-0 items-center rounded-full border border-black/[0.08] bg-white/75 shadow-[0_6px_24px_rgba(15,23,42,0.06)] backdrop-blur-xl"

  return (
    <header className="pointer-events-none fixed inset-x-0 top-3 z-50 flex justify-center px-3 sm:px-5">
      <div className="pointer-events-none flex w-full max-w-none items-center justify-between gap-3 p-0">
        {/* Separate left branding pill, matching the landing navbar */}
        <div className={`${pillClass} pointer-events-auto justify-self-start px-4`}>
          <PillShine />
          <a
            href="/"
            aria-label="SHAFT home"
            className="relative flex shrink-0 items-center gap-2.5 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-[#43B5FF]"
          >
            <img
              src="/logo.png"
              alt=""
              width={34}
              height={34}
              className="h-[30px] w-[30px] object-contain transition-transform duration-300 hover:scale-105"
            />
            <span
              className="text-[24px] font-bold leading-none tracking-[-0.02em] text-[#101319]"
              style={{ fontFamily: "Amaranth, sans-serif" }}
            >
              Shaft
            </span>
          </a>
        </div>

        {/* Deliberately empty centre: keep the two-pill layout */}
        <div className="min-w-0 flex-1" aria-hidden="true" />

        {/* Separate right profile pill */}
        <button
          type="button"
          onClick={onProfileClick}
          aria-label="Open profile"
          title="Open profile"
          className={`${pillClass} pointer-events-auto max-w-[58vw] gap-2.5 px-2 pr-2 transition-colors hover:border-black/[0.12] hover:bg-white/95 sm:gap-3 sm:pl-4`}
        >
          <PillShine />
          <span className="relative max-w-[32vw] truncate pl-2 text-sm font-medium text-slate-700 sm:max-w-[220px] sm:pl-0">
            {displayName}
          </span>
          {photoURL ? (
            <img
              src={photoURL}
              alt=""
              referrerPolicy="no-referrer"
              className="relative h-9 w-9 shrink-0 rounded-full border border-slate-200 object-cover"
            />
          ) : (
            <span className="relative grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[#D9ECE8] bg-[#EAF7F4] text-xs font-semibold text-[#245C55]">
              {initials}
            </span>
          )}
        </button>
      </div>
    </header>
  )
}
