import * as React from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  ShieldCheck,
  ScanLine,
  LayoutDashboard,
  ScrollText,
  LogOut,
  Activity,
} from 'lucide-react'
import { Moon, Sun } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { useTheme } from '@/context/ThemeContext'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import type { Role } from '@/types/domain'

const NAV_ITEMS: { to: string; label: string; icon: React.ReactNode; roles: Role[] }[] = [
  { to: '/app/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" />, roles: ['officer', 'admin', 'analyst'] },
  { to: '/app/scan', label: 'New Scan', icon: <ScanLine className="h-4 w-4" />, roles: ['officer'] },
  { to: '/app/history', label: 'Scan History', icon: <ScrollText className="h-4 w-4" />, roles: ['officer', 'admin', 'analyst'] },
  { to: '/app/audit', label: 'Audit Trail', icon: <Activity className="h-4 w-4" />, roles: ['admin', 'analyst'] },
  { to: '/app/analytics', label: 'Analytics', icon: <Activity className="h-4 w-4" />, roles: ['admin', 'analyst'] },
]

export function AppLayout() {
  const { state, logout, reset } = useApp()
  const { theme, toggleTheme } = useTheme()
  const user = state.currentUser
  const navigate = useNavigate()

  const handleReset = () => {
    if (window.confirm('Reset all demo data? This restores the sample scans and clears your decisions.')) {
      reset()
    }
  }

  if (!user) {
    return <NavigateToLogin />
  }

  const items = NAV_ITEMS.filter((i) => i.roles.includes(user.role))

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r bg-card md:flex">
        <div className="flex items-center gap-2 px-5 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-bold leading-tight">Veridoc</p>
            <p className="text-[11px] text-muted-foreground">MHA · SSB Screening</p>
          </div>
        </div>
        <Separator />
        <nav className="flex-1 space-y-1 px-3 py-4">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive ? 'bg-primary text-primary-foreground' : 'text-foreground/70 hover:bg-secondary',
                )
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t p-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9" style={{ backgroundColor: user.avatarColor }}>
              <AvatarFallback className="text-white">{user.initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{user.name}</p>
              <p className="truncate text-[11px] text-muted-foreground">{user.badge}</p>
            </div>
            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              className="text-muted-foreground hover:text-foreground"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button onClick={handleLogout} title="Log out" className="text-muted-foreground hover:text-foreground">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
          <button
            onClick={handleReset}
            className="mt-3 w-full rounded-md border border-border px-3 py-1.5 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            Reset demo data
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col md:pl-64">
        {/* Top mobile bar */}
        <div className="sticky top-0 z-20 flex items-center justify-between border-b bg-card/80 px-4 py-2 backdrop-blur md:hidden">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <span className="text-sm font-bold">Veridoc</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{user.checkpointName}</Badge>
            <button onClick={toggleTheme} title="Toggle theme" className="text-muted-foreground hover:text-foreground">
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button onClick={handleLogout} className="text-muted-foreground hover:text-foreground">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        <div className="sticky top-12 z-20 flex gap-1 overflow-x-auto border-b bg-card/80 px-2 py-2 backdrop-blur md:hidden">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium',
                  isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary',
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>

        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

function NavigateToLogin() {
  const navigate = useNavigate()
  React.useEffect(() => {
    navigate('/login', { replace: true })
  }, [navigate])
  return null
}
