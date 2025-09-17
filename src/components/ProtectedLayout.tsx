import { ReactNode } from 'react'
import { Header } from './Header'

interface ProtectedLayoutProps {
  children: ReactNode
}

export const ProtectedLayout = ({ children }: ProtectedLayoutProps) => {
  return (
    <div>
      <Header />
      {children}
    </div>
  )
}
