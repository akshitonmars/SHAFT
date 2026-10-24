import type { User } from "firebase/auth"

export type ConnectorId = "github" | "vercel" | "supabase"
export type ConnectorStatus = { connected: boolean; label?: string; reconnectRequired?: boolean }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Json = { [key: string]: any }

async function api(user: User, path: string, init?: RequestInit): Promise<Json> {
  const token = await user.getIdToken()
  const response = await fetch(path, { ...init, headers: { Authorization: "Bearer " + token, ...(init?.headers || {}) } })
  const body: Json = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(body.error || "The request failed. Please try again.")
  return body
}

/** Whether the user has connected each service, using the same endpoints as the connector pages. */
export async function fetchStatus(user: User, id: ConnectorId): Promise<ConnectorStatus> {
  if (id === "github") {
    const r = await api(user, "/api/connectors/github/status")
    return { connected: !!r.connected, label: r.username ? "@" + r.username : undefined, reconnectRequired: !!r.reconnectRequired }
  }
  if (id === "vercel") {
    const r = await api(user, "/api/connectors/vercel/projects")
    return { connected: !!r.connected, label: r.accountName || r.email || undefined, reconnectRequired: !!r.reconnectRequired }
  }
  const r = await api(user, "/api/connectors/supabase/projects")
  const count = Array.isArray(r.projects) ? r.projects.length : 0
  return { connected: !!r.connected, label: r.connected ? count + (count === 1 ? " project" : " projects") : undefined }
}

/** Starts authorization and returns the URL to send the user to. */
export async function getAuthorizationUrl(user: User, id: ConnectorId): Promise<string> {
  const r = await api(user, `/api/connectors/${id}/connect`, { method: "POST" })
  if (!r.authorizationUrl) throw new Error("Shaft could not start the connection. Please try again.")
  return r.authorizationUrl as string
}

const RETURN_KEY = "shaft:connect-return"

/** Call right before a full-page redirect to a provider, so we can bring the user back. */
export function rememberReturn(to: string, connector: ConnectorId) {
  try {
    sessionStorage.setItem(RETURN_KEY, JSON.stringify({ to, connector, at: Date.now() }))
  } catch {
    /* storage unavailable: the user simply lands on the connector page */
  }
}

/**
 * Call once at the top of getInitialPath() in App.tsx.
 * 1) After an OAuth redirect lands on a connector page, send the user back to where they started.
 * 2) If this is the Vercel install popup and it succeeded, close it so the opener refreshes.
 */
export function applyConnectReturn() {
  const params = new URLSearchParams(window.location.search)
  if (window.opener && window.location.pathname === "/vercel" && params.get("connected") === "1") {
    window.close()
    return
  }
  try {
    const raw = sessionStorage.getItem(RETURN_KEY)
    if (!raw || !(params.has("connected") || params.has("error"))) return
    sessionStorage.removeItem(RETURN_KEY)
    const saved = JSON.parse(raw) as { to?: string; connector?: string; at?: number }
    if (!saved.to || !saved.at || Date.now() - saved.at > 10 * 60 * 1000 || window.location.pathname === saved.to) return
    params.set("connector", saved.connector || "")
    window.history.replaceState({}, "", saved.to + "?" + params.toString())
  } catch {
    /* ignore malformed state */
  }
}
