import { Outlet } from "react-router"
import "@/routes/_panel/styles.css"

export default function LoginLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
      <Outlet />
    </div>
  )
}
