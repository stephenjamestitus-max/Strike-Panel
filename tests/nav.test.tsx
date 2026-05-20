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
    expect(screen.getByRole('link', { name: /Get Access/i })).toBeTruthy()
  })

  it('renders nav links', () => {
    render(<Nav />)
    expect(screen.getByText('DEMO')).toBeTruthy()
    expect(screen.getByText('BLOG')).toBeTruthy()
  })
})
