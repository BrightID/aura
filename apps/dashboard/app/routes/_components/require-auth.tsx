import { useEffect } from "react"
import { useAuthState } from "react-firebase-hooks/auth"
import { useNavigate } from "react-router"
import { auth } from "~/lib/firebase"

export function RequireAuth() {
  const [user, loading] = useAuthState(auth)
  const navigate = useNavigate()

  useEffect(() => {
    if (loading) return

    if (!user) navigate("/login")
  }, [user, loading])

  return null
}
