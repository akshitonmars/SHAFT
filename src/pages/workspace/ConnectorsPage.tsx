import { useState } from "react"
import type { User } from "firebase/auth"
import { Database, Github, Triangle } from "lucide-react"
import { GitHubConnector } from "../GitHubConnector"
import { VercelConnector } from "../VercelConnector"
import { DatabaseExplorer } from "../DatabaseExplorer"
import SupabaseConnectorPanel from "./SupabaseConnectorPanel"

type ConnectorTab = "github" | "vercel" | "supabase" | "database"

const tabs: { id: ConnectorTab; label: string; description: string }[] = [
  { id: "github", label: "GitHub", description: "Repositories and source control" },
  { id: "vercel", label: "Vercel", description: "Projects and deployments" },
  { id: "supabase", label: "Supabase", description: "Backend, auth, and database" },
  { id: "database", label: "Database", description: "Explore Supabase tables" },
]

function tabFromLocation(): ConnectorTab {
  const tab = new URLSearchParams(window.location.search).get("tab")
  return tabs.some((item) => item.id === tab) ? tab as ConnectorTab : "github"
}

export function ConnectorsPage({ user }: { user: User }) {
  const [activeTab, setActiveTab] = useState<ConnectorTab>(tabFromLocation)

  const selectTab = (tab: ConnectorTab) => {
    setActiveTab(tab)
    const params = new URLSearchParams(window.location.search)
    params.set("tab", tab)
    params.delete("connector")
    params.delete("status")
    params.delete("reason")
    params.delete("connected")
    params.delete("error")
    window.history.replaceState({}, "", window.location.pathname + "?" + params.toString())
  }

  return (
    <section>
      <p className="text-xs font-semibold uppercase tracking-[0.17em] text-[#397D76]">Your toolchain</p>
      <div className="mt-3 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div><h1 className="text-4xl font-semibold tracking-[-0.05em] sm:text-5xl" style={{ fontFamily: "Amaranth, sans-serif" }}>Connectors</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">Manage your external services in one place. Connect each provider once, then attach its resources to the relevant Space.</p></div>
      </div>

      <div className="mt-7 grid grid-cols-2 gap-2 lg:grid-cols-4" role="tablist" aria-label="Connector services">
        {tabs.map((tab) => {
          const active = activeTab === tab.id
          return <button key={tab.id} type="button" role="tab" aria-selected={active} onClick={() => selectTab(tab.id)} className={"rounded-2xl border p-3 text-left transition sm:p-4 " + (active ? "border-[#A8D3CC] bg-[#F0F8F6] shadow-sm" : "border-slate-200 bg-white hover:border-[#BCDAD5]")}>
            <span className="flex items-center gap-2.5">
              {tab.id === "github" ? <Github size={19} className="shrink-0 text-slate-700" /> : tab.id === "vercel" ? <Triangle size={18} className="shrink-0 text-slate-800" /> : <Database size={18} className="shrink-0 text-[#397D76]" />}
              <span className="font-semibold text-[#101319]">{tab.label}</span>
            </span>
            <span className="mt-2 hidden text-xs leading-5 text-slate-500 sm:block">{tab.description}</span>
          </button>
        })}
      </div>

      <div className="mt-6 min-w-0" role="tabpanel">
        {activeTab === "github" && <GitHubConnector user={user} embedded />}
        {activeTab === "vercel" && <VercelConnector user={user} embedded />}
        {activeTab === "supabase" && <SupabaseConnectorPanel user={user} onOpenDatabase={() => selectTab("database")} />}
        {activeTab === "database" && <DatabaseExplorer user={user} embedded />}
      </div>
    </section>
  )
}
