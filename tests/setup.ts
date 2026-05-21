import '@testing-library/jest-dom'

// Framer Motion's whileInView requires IntersectionObserver — mock it for JSDOM
// Must be a class (Framer Motion calls `new IntersectionObserver(...)`)
class MockIntersectionObserver {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
}
Object.defineProperty(globalThis, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: MockIntersectionObserver,
})

// ResizeObserver is also used by Framer Motion internals
class MockResizeObserver {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
}
Object.defineProperty(globalThis, 'ResizeObserver', {
  writable: true,
  configurable: true,
  value: MockResizeObserver,
})
