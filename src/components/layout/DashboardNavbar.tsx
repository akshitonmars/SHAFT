import type { MouseEvent } from "react"

interface DashboardNavbarProps {
  displayName: string
  initials: string
  photoURL?: string | null
  onProfileClick: () => void
}

export default function DashboardNavbar({
  displayName,
  initials,
  photoURL,
  onProfileClick,
}: DashboardNavbarProps) {
  return (
    <header className="fixed inset-x-3 top-3 z-40 flex h-[64px] items-center justify-between rounded-full border border-slate-200/80 bg-white/90 px-4 shadow-[0_10px_35px_rgba(15,23,42,0.08)] backdrop-blur-2xl sm:inset-x-5 sm:px-6">
      <a
        href="/"
        aria-label="SHAFT home"
        className="flex shrink-0 items-center gap-2.5 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[#43B5FF]"
      >
        <img src="/logo.png" alt="" className="h-8 w-8 object-contain" />
        <span
          className="text-[23px] font-bold tracking-tight text-[#101319]"
          style={{ fontFamily: "Amaranth, sans-serif" }}
        >
          Shaft
        </span>
      </a>

      <button
        type="button"
        onClick={onProfileClick}
        aria-label="Open profile"
        className="group flex min-w-0 items-center gap-2.5 rounded-full py-1 pl-3 pr-1 outline-none transition-colors hover:bg-slate-100/80 focus-visible:ring-2 focus-visible:ring-[#43B5FF] sm:gap-3 sm:pl-4"
      >
        <span className="max-w-[38vw] truncate text-sm font-medium text-slate-700 transition-colors group-hover:text-[#101319] sm:max-w-[220px]">
          {displayName}
        </span>
        {photoURL ? (
          <img
            src={photoURL}
            alt=""
            referrerPolicy="no-referrer"
            className="h-10 w-10 shrink-0 rounded-full border border-slate-200 object-cover"
          />
        ) : (
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#D9ECE8] bg-[#EAF7F4] text-xs font-semibold text-[#245C55] transition-colors group-hover:bg-[#DDF1EC]">
            {initials}
          </span>
        )}
      </button>
    </header>
  )
}
