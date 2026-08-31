/* @refresh reload */

import { mount } from "@/mount"

const root = document.getElementById("root")

if (!root) {
  throw new Error("Root element #root not found")
}

mount(root)
