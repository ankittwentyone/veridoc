import * as React from 'react'
import { Link } from 'react-router-dom'
import { Search, CheckCircle2, Clock, ScanLine, ArrowRight } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RiskGauge } from '@/components/risk-gauge'
import { formatDate } from '@/lib/utils'
import type { RiskLevel } from '@/types/domain'

const RISK_BADGE: Record<RiskLevel, 'success' | 'warning' | 'destructive'> = {
  low: 'success',
  medium: 'warning',
  high: 'destructive',
  critical: 'destructive',
}

export function HistoryPage() {
  const { state } = useApp()
  const user = state.currentUser!
  const [query, setQuery] = React.useState('')
  const [filter, setFilter] = React.useState<string>('all')

  let scans = state.scans
  if (user.role === 'officer') {
    scans = scans.filter((s) => s.checkpointId === user.checkpointId)
  }
  if (filter !== 'all') {
    scans = scans.filter((s) => (filter === 'flagged' ? s.hasTampering || s.riskScore >= 60 : s.riskScore < 60))
  }
  if (query.trim()) {
    const q = query.toLowerCase()
    scans = scans.filter((s) =>
      [s.travelerName, s.documentTitle, s.scanNumber, s.passportNumber].some((f) =>
        (f || '').toLowerCase().includes(q),
      ),
    )
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold">Scan History</h1>
          <p className="text-sm text-muted-foreground">All scans at {user.checkpointName}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search name, number…"
              className="w-56 pl-8"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All results</SelectItem>
              <SelectItem value="flagged">Flagged</SelectItem>
              <SelectItem value="cleared">Cleared</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {scans.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
            {state.scans.length === 0 ? (
              <>
                <ScanLine className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm font-medium">No scans recorded</p>
                {user.role === 'officer' ? (
                  <Link to="/app/scan">
                    <Button size="sm" className="mt-1">
                      Start a new scan <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  </Link>
                ) : (
                  <p className="text-xs text-muted-foreground">No scans have been submitted across checkpoints yet.</p>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No scans match your search.</p>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Results ({scans.length})</CardTitle>
            <CardDescription>Click a scan to review details and forensic breakdown</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {scans.map((s) => (
              <Link
                key={s.id}
                to={`/app/history/${s.id}`}
                className="flex items-center justify-between gap-3 rounded-lg border p-3 transition-colors hover:bg-secondary"
              >
                <div className="flex min-w-0 items-center gap-4">
                  <RiskGauge score={s.riskScore} size={48} showLabel={false} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{s.travelerName}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {s.documentTitle} · {s.passportNumber}
                    </p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">{formatDate(s.scannedAt)}</p>
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <div className="flex items-center gap-1.5">
                    {s.hasTampering && <Badge variant="destructive">Tampered</Badge>}
                    {!s.hasTampering && <Badge variant="success">Clean</Badge>}
                  </div>
                  <Badge variant={RISK_BADGE[s.riskLevel]}>
                    {s.riskLevel} · {s.riskScore}
                  </Badge>
                  {s.decision && (
                    <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      {s.decision === 'approve' || s.decision === 'override' ? (
                        <CheckCircle2 className="h-3 w-3 text-success" />
                      ) : (
                        <Clock className="h-3 w-3" />
                      )}
                      {s.decision}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
