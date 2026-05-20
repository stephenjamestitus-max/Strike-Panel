import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, act } from '@testing-library/react'
import RevealWrapper from '@/components/ui/RevealWrapper'

// Mock IntersectionObserver
const observeMock = vi.fn()
const disconnectMock = vi.fn()
beforeEach(() => {
  vi.stubGlobal('IntersectionObserver', vi.fn().mockImplementation(function(cb: IntersectionObserverCallback) {
    return {
      observe: observeMock,
      disconnect: disconnectMock,
      unobserve: vi.fn(),
    }
  }))
})

describe('RevealWrapper', () => {
  it('renders children with reveal class', () => {
    const { container } = render(<RevealWrapper><p>hello</p></RevealWrapper>)
    expect(container.querySelector('.reveal')).toBeTruthy()
    expect(container.querySelector('p')?.textContent).toBe('hello')
  })

  it('adds "in" class when intersection fires', async () => {
    let intersectCallback: IntersectionObserverCallback = () => {}
    vi.stubGlobal('IntersectionObserver', vi.fn().mockImplementation(function(cb: IntersectionObserverCallback) {
      intersectCallback = cb
      return { observe: observeMock, disconnect: disconnectMock, unobserve: vi.fn() }
    }))
    const { container } = render(<RevealWrapper><p>hi</p></RevealWrapper>)
    const el = container.firstChild as Element
    act(() => intersectCallback([{ isIntersecting: true, target: el } as any], {} as any))
    expect(el.classList.contains('in')).toBe(true)
  })
})
