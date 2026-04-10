import { useEffect } from "react"
import { useSelector } from "react-redux"
import { selectPreferredTheme } from "@/BrightID/actions"

export default function ThemeResolver() {
  const preferredTheme = useSelector(selectPreferredTheme)

  useEffect(() => {
    if (preferredTheme === "dark") {
      document.body.classList.add("dark")
    } else {
      document.body.classList.remove("dark")
    }
  }, [preferredTheme])

  return null
}
