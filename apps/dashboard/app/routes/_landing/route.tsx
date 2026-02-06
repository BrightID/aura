import { Outlet, type MetaFunction } from "react-router"
import { Header } from "./components/header"
import { Footer } from "./components/footer"

import "./styles.css"

export const meta: MetaFunction = () => {
  return [
    { title: "Aura - Decentralized Identity Verification | Beyond Captchas" },
    {
      name: "description",
      content:
        "Aura is an open, decentralized network for identity verification. Replace captchas with seamless, privacy-preserving human verification. No puzzles, just trust.",
    },
    {
      name: "keywords",
      content: [
        "identity verification",
        "captcha alternative",
        "decentralized identity",
        "sybil resistance",
        "BrightID",
        "web3",
      ].join(", "),
    },
  ]
}

export default function RootLayout() {
  return (
    <div className="antialiased min-h-screen bg-background overflow-x-hidden">
      <Header />
      <Outlet />
      <Footer />
    </div>
  )
}
