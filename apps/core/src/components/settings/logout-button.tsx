import { useNavigate } from "@solidjs/router"
import { clearQueryCache } from "@/providers"
import { logout } from "@/store/auth"
import { resetRecovery } from "@/store/recovery"

export default function LogoutButton() {
  const navigate = useNavigate()
  return (
    <a-card
      variant="glass"
      data-testid="logout-button"
      class="cursor-pointer rounded-lg py-3.5 pl-5 pr-2"
      onClick={() => {
        logout()
        resetRecovery()
        // wipe cached node/backup data so nothing of the session lingers
        void clearQueryCache()
        navigate("/login", { replace: true })
      }}
    >
      <span class="text-xl font-medium text-destructive">Logout</span>
    </a-card>
  )
}
