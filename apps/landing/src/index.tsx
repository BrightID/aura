/* @refresh reload */
import { render } from "solid-js/web"
import App from "./App"
import { startClientNav } from "./router"

// Remotes also register @aura/ui tags. Skip duplicates so SPA nav
// from the host does not throw on customElements.define.
const define = CustomElementRegistry.prototype.define
CustomElementRegistry.prototype.define = function (
  this: CustomElementRegistry,
  name: string,
  ctor: CustomElementConstructor,
  options?: ElementDefinitionOptions,
) {
  if (this.get(name)) return
  return define.call(this, name, ctor, options)
}

startClientNav()

const root = document.getElementById("root")

if (root) {
  render(() => <App />, root)
}
