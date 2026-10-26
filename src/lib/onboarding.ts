import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore"
import { db } from "./firebase"
export type SpaceResourceProvider = "github" | "vercel" | "supabase"
export interface SpaceResource { id: string; provider: SpaceResourceProvider; name: string; url?: string; detail?: string; linkedAt: string }
export interface SpaceHistoryEvent { id: string; title: string; detail?: string; createdAt: string }
export interface ShaftProject { id: string; name: string; description: string; createdAt: string; resources?: SpaceResource[]; history?: SpaceHistoryEvent[] }
export interface ShaftUserData { name: string; role: string; projects: ShaftProject[]; onboardingCompleted: boolean; onboardingStep: number; completedAt?: string }
const keyFor = (uid: string) => "shaft:v1:user:" + uid
const emptyData = (): ShaftUserData => ({ name: "", role: "", projects: [], onboardingCompleted: false, onboardingStep: 0 })
function normalize(value?: Partial<ShaftUserData>): ShaftUserData {
  return { ...emptyData(), ...value, name: typeof value?.name === "string" ? value.name : "", role: typeof value?.role === "string" ? value.role : "", projects: Array.isArray(value?.projects) ? value.projects : [], onboardingCompleted: value?.onboardingCompleted === true, onboardingStep: typeof value?.onboardingStep === "number" ? Math.min(4, Math.max(0, value.onboardingStep)) : 0 }
}
export function readUserData(uid: string): ShaftUserData {
  if (typeof window === "undefined") return emptyData()
  try { const raw = window.localStorage.getItem(keyFor(uid)); return raw ? normalize(JSON.parse(raw) as Partial<ShaftUserData>) : emptyData() } catch { return emptyData() }
}
function cacheUserData(uid: string, data: ShaftUserData) { try { window.localStorage.setItem(keyFor(uid), JSON.stringify(data)) } catch { /* Cloud remains authoritative. */ } }
export async function loadUserData(uid: string): Promise<ShaftUserData> {
  const ref = doc(db, "shaftUsers", uid); const snapshot = await getDoc(ref)
  if (snapshot.exists()) { const data = normalize(snapshot.data() as Partial<ShaftUserData>); cacheUserData(uid, data); return data }
  const local = readUserData(uid)
  await setDoc(ref, { ...local, updatedAt: serverTimestamp() }); cacheUserData(uid, local); return local
}
export async function saveUserData(uid: string, patch: Partial<ShaftUserData>): Promise<ShaftUserData> {
  const ref = doc(db, "shaftUsers", uid); const snapshot = await getDoc(ref)
  const base = snapshot.exists() ? normalize(snapshot.data() as Partial<ShaftUserData>) : readUserData(uid)
  const next = normalize({ ...base, ...patch })
  await setDoc(ref, { ...next, updatedAt: serverTimestamp() }, { merge: true }); cacheUserData(uid, next); return next
}
export async function hasCompletedOnboarding(uid: string): Promise<boolean> { return (await loadUserData(uid)).onboardingCompleted }
