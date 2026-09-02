import * as React from 'react'
import { ShieldCheck, ShieldAlert, Scale, Undo2, TrendingUp } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { formatDate } from '@/lib/utils'
import type { DecisionType } from '@/types/domain'

const ACTION_STYLE: Record<DecisionType, { label: string; variant: 'success' | 'warning' | 'destructive' | 'info' }> = {
  approve: { label: 'Approved', variant: 'success' },
  override: { label: 'Override', variant: 'info' },
  escalate: { label: 'Escalated', variant: 'warning' },
  deny: { label: 'Denied', variant: 'destructive' },
}

const ACTION_ICON: Record<DecisionType, React.ReactNode> = {
  approve: <ShieldCheck className="h-4 w-4" />,
  override: <Undo2 className="h-4 w-4" />,
  escalate: <TrendingUp className="h-4 w-4" />,
  deny: <ShieldAlert className="h-4 w-4" />,
}

export function AuditPage() {
  const { state } = useApp()

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-xl font-bold">Audit Trail</h1>
        <p className="text-sm text-muted-foreground">
          Immutable log of every officer decision — the digital trail for investigations.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Decisions ({state.audit.length})</CardTitle>
          <CardDescription>Each entry links a traveler, decision, officer, and checkpoint with a timestamp.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-1">
          {state.audit.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              No decisions recorded yet. Make a decision on a scan to populate this trail.
            </p>
          ) : (
            state.audit.map((entry, idx) => {
              const style = ACTION_STYLE[entry.action]
              const showConnector = idx < state.audit.length - 1
              return (
                <React.Fragment key={entry.id}>
                  <div className="flex items-start gap-4 rounded-lg p-3 hover:bg-secondary/50">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary">
                      {ACTION_ICON[entry.action]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold">{entry.travelerName}</p>
                        <Badge variant="secondary">{entry.scanNumber}</Badge>
                        <Badge variant={style.variant}>
                          {style.label} · {entry.action}
                        </Badge>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        by {entry.officerName} ({entry.officerId}) · {entry.checkpointId} ·{' '}
                        {formatDate(entry.timestamp)}
                      </p>
                      {entry.reason && (
                        <p className="mt-1 rounded bg-secondary/60 px-2 py-1 text-xs">
                          Notes: {entry.reason}
                        </p>
                      )}
                      {entry.previousRiskScore !== undefined && (
                        <p className="mt-1 text-[11px] text-muted-foreground">
                          Prior state: risk {entry.previousRiskScore}
                          {entry.previousDecision ? ` · decision "${entry.previousDecision}"` : ' · no decision'}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-7 w-7 bg-secondary">
                        <AvatarFallback className="text-[10px]">
                          {entry.officerName.split(' ').map((n) => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <Scale className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                  {showConnector && <div className="ml-[1.4rem] h-3 w-0.5 bg-border" />}
                </React.Fragment>
              )
            })
          )}
        </CardContent>
      </Card>
    </div>
  )
}