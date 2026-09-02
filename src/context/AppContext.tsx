import * as React from 'react'
import {
  getState,
  loginUser,
  logoutUser,
  addScan,
  recordDecision,
  resetState,
  dismissLastScan as dismissLastScanStore,
  type AppState,
} from '@/lib/store'
import type { ScanReport, DecisionType, User } from '@/types/domain'

interface Ctx {
  state: AppState
  login: (userId: string) => User | null
  logout: () => void
  submitScan: (scan: ScanReport) => void
  decide: (scan: ScanReport, decision: DecisionType, reason?: string) => ScanReport
  reset: () => void
  dismissLastScan: () => void
}

const AppContext = React.createContext<Ctx | null>(null)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<AppState>(getState())

  const login = React.useCallback((userId: string) => {
    const user = loginUser(userId)
    setState(getState())
    return user
  }, [])

  const logout = React.useCallback(() => {
    logoutUser()
    setState(getState())
  }, [])

  const submitScan = React.useCallback((scan: ScanReport) => {
    addScan(scan)
    setState(getState())
  }, [])

  const decide = React.useCallback(
    (scan: ScanReport, decision: DecisionType, reason?: string) => {
      const updated = recordDecision(scan, decision, reason)
      setState(getState())
      return updated
    },
    [],
  )

  const reset = React.useCallback(() => {
    resetState()
    setState(getState())
  }, [])

  const dismissLastScan = React.useCallback(() => {
    dismissLastScanStore()
    setState(getState())
  }, [])

  const value = React.useMemo(
    () => ({ state, login, logout, submitScan, decide, reset, dismissLastScan }),
    [state, login, logout, submitScan, decide, reset, dismissLastScan],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp(): Ctx {
  const ctx = React.useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
