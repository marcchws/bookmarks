import "@testing-library/jest-dom/vitest"
import { afterAll, afterEach, beforeAll } from "vitest"
import { vi } from "vitest"
import { server } from "@/mocks/server"

beforeAll(() => server.listen({ onUnhandledRequest: "error" }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

// matchMedia — required by Tailwind v4 dark-mode probe and prefers-reduced-motion checks
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// ResizeObserver — used by some base-ui and animation hooks
class ResizeObserverStub {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
}
vi.stubGlobal("ResizeObserver", ResizeObserverStub)

// scrollTo — prevents errors from scroll-restoration utilities
window.scrollTo = vi.fn() as unknown as typeof window.scrollTo

// Pointer capture — guards for pointer-event driven UI primitives
Element.prototype.hasPointerCapture = vi.fn(() => false) as unknown as typeof Element.prototype.hasPointerCapture
Element.prototype.setPointerCapture = vi.fn() as unknown as typeof Element.prototype.setPointerCapture
Element.prototype.releasePointerCapture = vi.fn() as unknown as typeof Element.prototype.releasePointerCapture

// scrollIntoView — prevents errors when list navigation scrolls active item into view
Element.prototype.scrollIntoView = vi.fn() as unknown as typeof Element.prototype.scrollIntoView
