import { useNavigate } from 'react-router-dom'
import { ShieldCheck, Fingerprint, ArrowRight } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { getUsers } from '@/lib/store'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

const ROLE_LABEL: Record<string, string> = {
  officer: 'Checkpoint Officer',
  admin: 'Administrator',
  analyst: 'Intelligence Analyst',
}

export function LoginPage() {
  const { login } = useApp()
  const navigate = useNavigate()
  const users = getUsers()

  const handleLogin = (userId: string) => {
    const user = login(userId)
    if (user) navigate('/app/dashboard', { replace: true })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-primary/25 to-slate-950 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/30">
            <ShieldCheck className="h-9 w-9" />
          </div>
          <h1 className="text-2xl font-bold text-white">Veridoc</h1>
          <p className="text-sm text-white/70">AI-Based Fake Identity & Document Screening System</p>
          <p className="mt-1 text-xs text-white/50">Ministry of Home Affairs · SIH 2026 · SSB</p>
        </div>

        <Card>
          <CardContent className="p-2">
            <div className="border-b p-4">
              <div className="flex items-center gap-2">
                <Fingerprint className="h-4 w-4 text-primary" />
                <p className="text-sm font-semibold">Select operator profile</p>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Role-based access controls which modules are available. Sign-in is tied to your checkpoint ID for traceability.
              </p>
            </div>
            <div className="divide-y">
              {users.map((u) => (
                <button
                  key={u.id}
                  onClick={() => handleLogin(u.id)}
                  className="flex w-full items-center gap-3 p-3 text-left transition-colors hover:bg-secondary"
                >
                  <Avatar className="h-10 w-10" style={{ backgroundColor: u.avatarColor }}>
                    <AvatarFallback className="text-white">{u.initials}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{u.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{u.checkpointName}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant="secondary">{ROLE_LABEL[u.role]}</Badge>
                    <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      {u.badge} <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <p className="mt-4 text-center text-[11px] text-white/50">
          Demo build — all data is simulated locally. No documents are uploaded to a server.
        </p>
      </div>
    </div>
  )
}
