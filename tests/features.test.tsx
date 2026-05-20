import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Features from '@/components/sections/Features'

describe('Features tabs', () => {
  it('renders all 5 tab labels', () => {
    render(<Features />)
    expect(screen.getByRole('button', { name: /Morning Brief/i })).toBeTruthy()
    expect(screen.getByRole('button', { name: /Fight Camp/i })).toBeTruthy()
    expect(screen.getByRole('button', { name: /Athletes/i })).toBeTruthy()
    expect(screen.getByRole('button', { name: /AI Sessions/i })).toBeTruthy()
    expect(screen.getByRole('button', { name: /Progress/i })).toBeTruthy()
  })

  it('shows Morning Brief panel by default', () => {
    render(<Features />)
    expect(screen.getByText(/SQUAD AVG/i)).toBeTruthy()
  })

  it('switches to Fight Camp panel on click', () => {
    render(<Features />)
    fireEvent.click(screen.getByRole('button', { name: /Fight Camp/i }))
    expect(screen.getByText(/DAYS TO FIGHT/i)).toBeTruthy()
  })

  it('switches to Athletes panel on click', () => {
    render(<Features />)
    fireEvent.click(screen.getByRole('button', { name: /Athletes/i }))
    expect(screen.getByText(/ACTIVE/i)).toBeTruthy()
  })
})
