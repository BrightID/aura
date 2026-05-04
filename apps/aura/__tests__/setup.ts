import "@testing-library/jest-dom"
import "vitest-canvas-mock"
import { fetch, Headers, Request, Response, setGlobalOrigin } from "undici"

beforeEach(() => {
  setGlobalOrigin(window.location.href)
})

// @ts-ignore
globalThis.fetch = fetch
// @ts-ignore
globalThis.Headers = Headers

// @ts-ignore
globalThis.Request = Request

// @ts-ignore
globalThis.Response = Response

beforeAll(() => {
  window.PointerEvent = class PointerEvent extends Event {} as any
  window.HTMLElement.prototype.scrollIntoView = vi.fn()
  window.HTMLElement.prototype.hasPointerCapture = vi.fn()
  window.HTMLElement.prototype.releasePointerCapture = vi.fn()

  if (typeof ResizeObserver === "undefined") {
    global.ResizeObserver = class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  }
})
