import { mount } from "./mount"

const el = document.getElementById("root")
if (!el) throw new Error("Root element #root not found")
mount(el)
