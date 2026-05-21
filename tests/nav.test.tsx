import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import Nav from '@/components/nav/Nav'

describe('Nav', () => {
  it('renders logo text', () => {
    render(<Nav />)
    expect(screen.getByText(/STRIKE/)).toBeTruthy()
  })

  it('renders CTA button', () => {
    render(<Nav />)
    expect(screen.getByRole('link', { name: /START FREE TRIAL/i })).toBeTruthy()
  })

  it('renders nav links', () => {
    render(<Nav />)
    expect(screen.getByText('FEATURES')).toBeTruthy()
    expect(screen.getByText('DEMO')).toBeTruthy()
    expect(screen.getByText('PRICING')).toBeTruthy()
  })
})
