import type { Metadata } from 'next'
import './jack.css'

export const metadata: Metadata = {
  title: 'Jack -- 3D Creator',
  description: '3D Creator portfolio for Jack.',
}

export default function JackLayout({ children }: { children: React.ReactNode }) {
  return children
}
