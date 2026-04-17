import { useEffect } from "react"
import { useSettingsStore } from "@/store/settings.store"

export default function ThemeResolver() {
  const preferredTheme = useSettingsStore((s) => s.prefferedTheme)

  useEffect(() => {
    if (preferredTheme === "dark") {
      document.body.classList.add("dark")
    } else {
      document.body.classList.remove("dark")
    }
  }, [preferredTheme])

  return null
}
