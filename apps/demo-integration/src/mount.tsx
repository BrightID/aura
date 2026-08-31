import { StrictMode } from "react"
import { createRoot, type Root } from "react-dom/client"
import { App } from "./App"
import "./styles.css"

export function mount(el: HTMLElement) {
  const root: Root = createRoot(el)
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
  return () => root.unmount()
}
