import type { Project } from "~/components/projects-table"
import { API_BASE_URL } from "~/constants"

export async function getUserProjects() {
  const res = await fetch(`${API_BASE_URL}/api/projects/list`, {
    headers: {
      authorization: `Bearer ${await (await import("firebase/auth")).getAuth().currentUser?.getIdToken()}`,
    },
  })

  if (!res.ok) throw new Error("Failed")
  const json = await res.json()
  return json.projects as Project[]
}
