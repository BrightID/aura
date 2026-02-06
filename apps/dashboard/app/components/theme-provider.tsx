import {
  createContext,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from "react"

const ThemeContext = createContext({
  theme: "dark",
  setTheme: (theme: string) => {},
})

export function ThemeProvider({ children }: PropsWithChildren) {
  const [theme, setTheme] = useState("dark")

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove("light", "dark")
    root.classList.add(theme)
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
