import { onMount } from "solid-js"
import Header from "$lib/components/Header"
import Footer from "$lib/components/Footer"
import Home from "$lib/components/Home"
import NotFound from "$lib/components/NotFound"

export default function App() {
  onMount(async () => {
    await import("@aura/ui")
  })

  const path = window.location.pathname

  return (
    <>
      <Header />
      {path === "/" ? <Home /> : <NotFound />}
      <Footer />
    </>
  )
}
