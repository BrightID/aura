import { onMount } from "solid-js"
import Header from "$lib/components/Header"
import Footer from "$lib/components/Footer"
import Home from "$lib/components/Home"
import NotFound from "$lib/components/NotFound"
import RemoteApp from "./RemoteApp"
import { remotes } from "./remotes"

function Landing(props: { path: string }) {
  onMount(async () => {
    await import("./app.css")
    document.documentElement.classList.add("dark")
    document.body.classList.add(
      "antialiased",
      "min-h-screen",
      "bg-background",
      "text-foreground",
      "overflow-x-hidden",
    )
    await import("@aura/ui")
  })

  return (
    <>
      <Header />
      {props.path === "/" ? <Home /> : <NotFound />}
      <Footer />
    </>
  )
}

export default function App() {
  const path = window.location.pathname.replace(/\/+$/, "") || "/"
  const remote = remotes.find(
    (entry) => path === entry.prefix || path.startsWith(`${entry.prefix}/`),
  )

  if (remote) {
    return <RemoteApp load={remote.load} />
  }

  return <Landing path={path} />
}
