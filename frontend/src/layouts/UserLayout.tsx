import type { ReactNode } from 'react'
import AppShell from '../components/AppShell'

interface UserLayoutProps {
  children: ReactNode
}

export default function UserLayout({ children }: UserLayoutProps) {
  return <AppShell>{children}</AppShell>
}
