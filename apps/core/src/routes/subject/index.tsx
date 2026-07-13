import { Navigate } from "@solidjs/router"
import { Show } from "solid-js"
import { useRequireSession } from "@/hooks/use-require-session"

/** `/subject` with no id — your own profile (old app fell back to self). */
export default function SubjectSelfPage() {
  const subjectId = useRequireSession()
  return (
    <Show when={subjectId()}>
      {(id) => <Navigate href={`/subject/${id()}`} />}
    </Show>
  )
}
