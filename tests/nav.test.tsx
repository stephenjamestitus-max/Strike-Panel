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
    expect(screen.getAllByText(/GET ACCESS/i).length).toBeGreaterThan(0)
  })

  it('renders nav links', () => {
    render(<Nav />)
    expect(screen.getAllByText('FEATURES').length).toBeGreaterThan(0)
    expect(screen.getAllByText('TRIAL').length).toBeGreaterThan(0)
    expect(screen.getAllByText('PRICING').length).toBeGreaterThan(0)
  })
})
