import { useEffect, useMemo, useState, type FormEvent } from "react"
import { ArrowLeft, Database, Plus, RefreshCw, Table2 } from "lucide-react"
import type { User } from "firebase/auth"

type Project = { id: string; name: string; region?: string; status?: string }
type TableInfo = { table_name: string }
type ColumnInfo = { column_name: string; data_type: string; is_nullable: string }

export function DatabaseExplorer({ user }: { user: User }) {
  const [projects, setProjects] = useState<Project[]>([])
  const [projectRef, setProjectRef] = useState("")
  const [tables, setTables] = useState<TableInfo[]>([])
  const [table, setTable] = useState("")
  const [columns, setColumns] = useState<ColumnInfo[]>([])
  const [rows, setRows] = useState<Record<string, unknown>[]>([])
  const [recordText, setRecordText] = useState("{\n  \n}")
  const [showInsert, setShowInsert] = useState(false)
  const [busy, setBusy] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")

  const request = async (url: string, init?: RequestInit) => {
    const token = await user.getIdToken()
    const headers = new Headers(init?.headers)
    headers.set("Authorization", "Bearer " + token)
    if (init?.body) headers.set("Content-Type", "application/json")
    const response = await fetch(url, { ...init, headers })
    const result = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(result.error || "The database request failed.")
    return result
  }

  const loadProjects = async () => {
    setBusy(true); setError(""); setNotice("")
    try {
      const result = await request("/api/connectors/supabase/projects")
      if (!result.connected) throw new Error("Connect Supabase in Workspace → Settings before opening the database.")
      const available = (result.projects || []) as Project[]
      setProjects(available)
      setProjectRef((current) => current || available[0]?.id || "")
      if (!available.length) setTables([])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load Supabase projects.")
    } finally { setBusy(false) }
  }

  const loadTables = async (ref: string) => {
    if (!ref) return
    setBusy(true); setError(""); setNotice(""); setTable(""); setColumns([]); setRows([])
    try {
      const result = await request("/api/connectors/supabase/database?ref=" + encodeURIComponent(ref))
      setTables((result.tables || []) as TableInfo[])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load database tables.")
      setTables([])
    } finally { setBusy(false) }
  }

  const loadRows = async (ref: string, tableName: string) => {
    setBusy(true); setError(""); setNotice("")
    try {
      const result = await request("/api/connectors/supabase/database?ref=" + encodeURIComponent(ref) + "&table=" + encodeURIComponent(tableName))
      setColumns((result.columns || []) as ColumnInfo[])
      setRows((result.rows || []) as Record<string, unknown>[])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not read table rows.")
      setColumns([]); setRows([])
    } finally { setBusy(false) }
  }

  useEffect(() => { void loadProjects() }, [user.uid])
  useEffect(() => { if (projectRef) void loadTables(projectRef) }, [projectRef])

  const selectedProject = projects.find((project) => project.id === projectRef)
  const safeRows = useMemo(() => rows.slice(0, 100), [rows])

  const insertRow = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!projectRef || !table) return
    let record: unknown
    try { record = JSON.parse(recordText) } catch { setError("Enter a valid JSON object."); return }
    if (!record || typeof record !== "object" || Array.isArray(record)) { setError("The row must be a JSON object, such as { \"name\": \"Example\" }."); return }
    setSaving(true); setError(""); setNotice("")
    try {
      await request("/api/connectors/supabase/database?ref=" + encodeURIComponent(projectRef), {
        method: "POST", body: JSON.stringify({ table, record }),
      })
      setShowInsert(false)
      setRecordText("{\n  \n}")
      setNotice("Row inserted successfully.")
      await loadRows(projectRef, table)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not insert row.")
    } finally { setSaving(false) }
  }

  return <main className="min-h-screen bg-[#F5F7FB] text-[#101319]" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
    <header className="sticky top-0 z-20 flex h-[72px] items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur-xl sm:px-8">
      <a href="/workspace" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-[#101319]"><ArrowLeft size={16} /> Workspace</a>
      <span className="inline-flex items-center gap-2 text-sm font-semibold"><Database size={17} className="text-[#397D76]" /> Database explorer</span>
      <button type="button" onClick={() => projectRef ? void loadTables(projectRef) : void loadProjects()} disabled={busy} className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-600 disabled:opacity-50"><RefreshCw size={14} className={busy ? "animate-spin" : ""} /> Refresh</button>
    </header>

    <div className="mx-auto max-w-[1440px] px-4 py-7 sm:px-8 sm:py-10">
      <div className="max-w-3xl"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#397D76]">Build beyond ideas</p><h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] sm:text-5xl" style={{ fontFamily: "Amaranth, sans-serif" }}>Your data, in view.</h1><p className="mt-3 text-sm leading-6 text-slate-500">Explore tables in your connected Supabase projects. Reads are limited to 100 rows per table; inserts require database write permission.</p></div>

      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
        <label className="block max-w-xl text-xs font-semibold uppercase tracking-wide text-slate-500">Supabase project
          <select value={projectRef} onChange={(event) => setProjectRef(event.target.value)} disabled={busy && projects.length === 0} className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium normal-case tracking-normal text-[#101319] outline-none focus:border-[#397D76]">
            <option value="">Select a project</option>
            {projects.map((project) => <option key={project.id} value={project.id}>{project.name} · {project.region || "region unavailable"}</option>)}
          </select>
        </label>
        {selectedProject && <p className="mt-3 text-xs text-slate-500">Project status: {selectedProject.status || "Unknown"} · Ref: {selectedProject.id}</p>}
      </section>

      {error && <div role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">{error}</div>}
      {notice && <div role="status" className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</div>}

      <div className="mt-6 grid gap-5 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="rounded-2xl border border-slate-200 bg-white p-3">
          <div className="flex items-center justify-between px-2 py-2"><h2 className="text-sm font-semibold">Public tables</h2><span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">{tables.length}</span></div>
          {busy && tables.length === 0 ? <p className="px-2 py-5 text-sm text-slate-400">Loading tables…</p> : tables.length === 0 ? <p className="px-2 py-5 text-sm leading-6 text-slate-400">No public tables found, or this OAuth connection lacks database read access.</p> : <div className="mt-2 space-y-1">{tables.map((item) => <button key={item.table_name} type="button" onClick={() => { setTable(item.table_name); setShowInsert(false); void loadRows(projectRef, item.table_name) }} className={"flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm transition " + (table === item.table_name ? "bg-[#EAF7F4] font-semibold text-[#245C55]" : "text-slate-600 hover:bg-slate-50")}><Table2 size={15} /> <span className="truncate">{item.table_name}</span></button>)}</div>}
        </aside>

        <section className="min-w-0 rounded-2xl border border-slate-200 bg-white">
          <div className="flex flex-col justify-between gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:p-5"><div><p className="text-xs text-slate-400">public schema</p><h2 className="mt-1 text-xl font-semibold">{table || "Choose a table"}</h2><p className="mt-1 text-xs text-slate-500">{table ? columns.length + " columns · first 100 rows" : "Select a table to inspect its data."}</p></div>{table && <button type="button" onClick={() => { setShowInsert((value) => !value); setError(""); setNotice("") }} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#101319] px-4 text-sm font-semibold text-white"><Plus size={15} /> Insert row</button>}</div>
          {showInsert && <form onSubmit={insertRow} className="border-b border-slate-100 bg-slate-50/70 p-4 sm:p-5"><label className="block text-sm font-semibold">New row <span className="font-normal text-slate-500">· JSON object</span><textarea value={recordText} onChange={(event) => setRecordText(event.target.value)} rows={5} spellCheck={false} className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 font-mono text-sm leading-6 outline-none focus:border-[#397D76]" placeholder={'{ "column_name": "value" }'} /></label><p className="mt-2 text-xs leading-5 text-slate-500">Use only fields in this table. Leave out generated IDs and timestamps. Insert permission is controlled by your Supabase OAuth grant and database policies.</p><div className="mt-3 flex gap-2"><button disabled={saving} type="submit" className="h-10 rounded-xl bg-[#397D76] px-4 text-sm font-semibold text-white disabled:opacity-50">{saving ? "Saving…" : "Save row"}</button><button type="button" onClick={() => setShowInsert(false)} className="h-10 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-600">Cancel</button></div></form>}
          {busy ? <div className="p-8 text-sm text-slate-400">Loading database data…</div> : !table ? <div className="p-10 text-center text-sm text-slate-400">Choose a table on the left to view its rows.</div> : safeRows.length === 0 ? <div className="p-10 text-center text-sm text-slate-400">This table has no readable rows, or its row-level security policies hide them.</div> : <div className="max-w-full overflow-auto"><table className="w-full border-collapse text-left text-sm"><thead><tr className="bg-slate-50">{columns.map((column) => <th key={column.column_name} className="whitespace-nowrap border-b border-slate-100 px-4 py-3 text-xs font-semibold text-slate-500">{column.column_name}<span className="mt-1 block font-normal text-slate-400">{column.data_type}</span></th>)}</tr></thead><tbody>{safeRows.map((row, index) => <tr key={index} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/70">{columns.map((column) => <td key={column.column_name} className="max-w-[320px] whitespace-nowrap px-4 py-3 text-slate-700">{row[column.column_name] === null ? <span className="text-slate-300">NULL</span> : typeof row[column.column_name] === "object" ? <code className="block max-w-[300px] truncate text-xs">{JSON.stringify(row[column.column_name])}</code> : <span className="block max-w-[300px] truncate">{String(row[column.column_name] ?? "")}</span>}</td>)}</tr>)}</tbody></table></div>}
        </section>
      </div>
      <p className="mt-6 text-xs leading-5 text-slate-400">SHAFT never sends your Supabase access token to the browser. Database requests run through authenticated server endpoints. SQL access depends on the permissions you approved in Supabase OAuth.</p>
    </div>
  </main>
}
