import { useNavigate } from "@solidjs/router"
import { createEffect } from "solid-js"
import { authStore } from "@/store/auth"

export function useRequireSession() {
  const navigate = useNavigate()
  const subjectId = () => authStore.user?.brightId

  createEffect(() => {
    if (!subjectId()) navigate("/login", { replace: true })
  })

  return subjectId
}
