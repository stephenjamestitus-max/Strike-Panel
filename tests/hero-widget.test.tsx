import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import HeroWidget from '@/components/hero/HeroWidget'

describe('HeroWidget', () => {
  it('renders athlete names', () => {
    render(<HeroWidget />)
    expect(screen.getByText(/Priya/)).toBeTruthy()
    expect(screen.getByText(/Jake/)).toBeTruthy()
    expect(screen.getByText(/Marcus/)).toBeTruthy()
  })

  it('renders readiness scores', () => {
    render(<HeroWidget />)
    expect(screen.getByText('91')).toBeTruthy()
    expect(screen.getByText('74')).toBeTruthy()
    expect(screen.getByText('38')).toBeTruthy()
  })

  it('renders squad average', () => {
    render(<HeroWidget />)
    expect(screen.getByText(/SQUAD AVG/i)).toBeTruthy()
  })
})
