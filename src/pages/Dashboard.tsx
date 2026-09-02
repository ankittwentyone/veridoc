import * as React from 'react'
import { Link } from 'react-router-dom'
import {
  ScanLine,
  ShieldCheck,
  Activity,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  Clock,
  X,
} from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { RiskGauge } from '@/components/risk-gauge'
import { formatDate, cn } from '@/lib/utils'
import type { RiskLevel, ScanReport } from '@/types/domain'

const RISK_BADGE: Record<RiskLevel, 'success' | 'warning' | 'destructive'> = {
  low: 'success',
  medium: 'warning',
  high: 'destructive',
  critical: 'destructive',
}

function LastScanBanner({ scan, onDismiss }: { scan: ScanReport; onDismiss: () => void }) {
  const flagged = scan.hasTampering || scan.riskScore >= 60
  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-lg border bg-background p-4 sm:flex-row sm:items-center sm:justify-between',
        flagged ? 'border-l-4 border-l-destructive' : 'border-l-4 border-l-success',
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-full',
            flagged ? 'bg-destructive/10 text-destructive' : 'bg-success/10 text-success',
          )}
        >
          {flagged ? <ShieldAlert className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
        </div>
        <div>
          <p className="text-sm font-semibold">
            Scan {scan.scanNumber} complete — {flagged ? 'flagged for review' : 'cleared'}
          </p>
          <p className="text-xs text-muted-foreground">
            {scan.travelerName} · risk {scan.riskScore}/100
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Link to={`/app/history/${scan.id}`}>
          <Button size="sm" variant={flagged ? 'default' : 'outline'}>
            View result <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </Link>
        <Button variant="ghost" size="icon" onClick={onDismiss} title="Dismiss">
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

export function DashboardPage() {
  const { state, dismissLastScan } = useApp()
  const user = state.currentUser!
  const isOfficer = user.role === 'officer'

  const myScans =
    isOfficer && user.role === 'officer'
      ? state.scans.filter((s) => s.checkpointId === user.checkpointId)
      : state.scans

  const todays = myScans
  const highRisk = todays.filter((s) => s.riskScore >= 60).length
  const lowRisk = todays.filter((s) => s.riskScore < 30).length
  const pending = todays.filter((s) => s.approved === null).length

  const lastScan = state.lastScanId ? state.scans.find((s) => s.id === state.lastScanId) : null

  if (isOfficer) {
    return (
      <div className="space-y-6">
        {lastScan && <LastScanBanner scan={lastScan} onDismiss={dismissLastScan} />}
        <HeroHeader
          title={`Good day, ${user.name.split(' ')[0]}`}
          subtitle={`${user.checkpointName} · Processing queue & recent activity`}
          action={
            <Link to="/app/scan">
              <Button>
                <ScanLine className="h-4 w-4" /> Start New Scan
              </Button>
            </Link>
          }
        />

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard icon={<ScanLine className="h-4 w-4" />} label="Scans Today" value={todays.length} />
          <StatCard icon={<ShieldAlert className="h-4 w-4" />} label="High Risk Flagged" value={highRisk} tone="destructive" />
          <StatCard icon={<CheckCircle2 className="h-4 w-4" />} label="Cleared / Low Risk" value={lowRisk} tone="success" />
          <StatCard icon={<Clock className="h-4 w-4" />} label="Awaiting Decision" value={pending} tone="warning" />
        </div>

        <RecentScans scans={todays.slice(0, 6)} />
      </div>
    )
  }

  // Admin/analyst dashboard
  const total = state.scans.length
  const critical = state.scans.filter((s) => s.riskScore >= 80).length
  const flagged = state.scans.filter((s) => s.hasTampering).length
  const decisions = state.audit.length

  return (
    <div className="space-y-6">
      {lastScan && <LastScanBanner scan={lastScan} onDismiss={dismissLastScan} />}
      <HeroHeader
        title={`Overview — ${user.checkpointName}`}
        subtitle="Command-wide screening intelligence summary"
        action={null}
      />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={<ScanLine className="h-4 w-4" />} label="Total Scans" value={total} />
        <StatCard icon={<ShieldAlert className="h-4 w-4" />} label="Critical (80+)" value={critical} tone="destructive" />
        <StatCard icon={<Activity className="h-4 w-4" />} label="Tampering Detected" value={flagged} tone="warning" />
        <StatCard icon={<ShieldCheck className="h-4 w-4" />} label="Audit Entries" value={decisions} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Scans</CardTitle>
            <CardDescription>Across all connected checkpoints</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {todays.slice(0, 6).map((s) => (
              <Link
                key={s.id}
                to={`/app/history/${s.id}`}
                className="flex items-center justify-between gap-3 rounded-lg border p-3 transition-colors hover:bg-secondary"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary">
                    <span className="text-[10px] font-bold uppercase">{s.documentType.slice(0, 3)}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{s.travelerName}</p>
                    <p className="text-xs text-muted-foreground">{s.checkpointName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={RISK_BADGE[s.riskLevel]}>
                    {s.riskScore} · {s.riskLevel}
                  </Badge>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Decisions</CardTitle>
            <CardDescription>Immutable audit trail</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {state.audit.slice(0, 5).map((a) => (
              <div key={a.id} className="flex items-start gap-3 rounded-lg border p-3">
                <Avatar className="h-8 w-8 bg-secondary">
                  <AvatarFallback className="text-xs">{a.officerName.split(' ').map((n) => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-xs font-medium">{a.travelerName}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {a.action} · {formatDate(a.timestamp)}
                  </p>
                </div>
              </div>
            ))}
            {state.audit.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">No decisions recorded yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <RecentScans scans={todays.slice(0, 5)} />
    </div>
  )
}

function HeroHeader({
  title,
  subtitle,
  action,
}: {
  title: string
  subtitle: string
  action: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-xl font-bold sm:text-2xl">{title}</h1>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
      {action}
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode
  label: string
  value: number
  tone?: 'success' | 'warning' | 'destructive'
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          {icon}
          <span className="text-xs">{label}</span>
        </div>
        <p
          className={cn(
            'mt-2 text-2xl font-bold',
            tone === 'destructive' && 'text-destructive',
            tone === 'success' && 'text-success',
            tone === 'warning' && 'text-warning',
          )}
        >
          {value}
        </p>
      </CardContent>
    </Card>
  )
}

function RecentScans({ scans }: { scans: ReturnType<typeof useApp>['state']['scans'] }) {
  if (scans.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
          <ScanLine className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm font-medium">No scans yet</p>
          <p className="text-xs text-muted-foreground">Run your first document scan to see results here.</p>
        </CardContent>
      </Card>
    )
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest scans at your checkpoint</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {scans.map((s) => (
          <Link
            key={s.id}
            to={`/app/history/${s.id}`}
            className="flex items-center justify-between gap-3 rounded-lg border p-3 transition-colors hover:bg-secondary"
          >
            <div className="flex min-w-0 items-center gap-3">
              <RiskGauge score={s.riskScore} size={44} showLabel={false} />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{s.travelerName}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {s.documentTitle} · {formatDate(s.scannedAt)}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {s.hasTampering && <Badge variant="destructive">Tampered</Badge>}
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  )
}
