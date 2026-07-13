import localforage from "localforage"

/** True when IndexedDB accepts writes (it's blocked in some private modes). */
export async function checkIndexedDB(): Promise<boolean> {
  try {
    await localforage.setItem("__db_check__", "ok")
    await localforage.removeItem("__db_check__")
    return true
  } catch {
    return false
  }
}
