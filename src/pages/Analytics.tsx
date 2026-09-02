import * as React from 'react'
import { useApp } from '@/context/AppContext'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { DOCUMENT_TYPES } from '@/types/domain'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type RangeKey = 'all' | '7d' | '30d'

const RANGE_OPTIONS: { key: RangeKey; label: string; ms: number | null }[] = [
  { key: 'all', label: 'All time', ms: null },
  { key: '7d', label: 'Last 7 days', ms: 7 * 24 * 60 * 60 * 1000 },
  { key: '30d', label: 'Last 30 days', ms: 30 * 24 * 60 * 60 * 1000 },
]

export function AnalyticsPage() {
  const { state } = useApp()
  const allScans = state.scans
  const [checkpoint, setCheckpoint] = React.useState<string>('all')
  const [range, setRange] = React.useState<RangeKey>('all')

  const checkpoints = React.useMemo<string[]>(() => {
    const set = new Set<string>()
    allScans.forEach((s) => set.add(s.checkpointName))
    return ['all', ...Array.from(set)]
  }, [allScans])

  const scans = React.useMemo(() => {
    const rangeMs = RANGE_OPTIONS.find((r) => r.key === range)?.ms ?? null
    const now = Date.now()
    return allScans.filter((s) => {
      if (checkpoint !== 'all' && s.checkpointName !== checkpoint) return false
      if (rangeMs !== null && now - new Date(s.scannedAt).getTime() > rangeMs) return false
      return true
    })
  }, [allScans, checkpoint, range])

  const total = scans.length
  const byLevel = {
    low: scans.filter((s) => s.riskLevel === 'low').length,
    medium: scans.filter((s) => s.riskLevel === 'medium').length,
    high: scans.filter((s) => s.riskLevel === 'high').length,
    critical: scans.filter((s) => s.riskLevel === 'critical').length,
  }
  const byDoc = DOCUMENT_TYPES.map((d) => ({
    ...d,
    count: scans.filter((s) => s.documentType === d.value).length,
  }))
  const tamperRate = total ? Math.round((scans.filter((s) => s.hasTampering).length / total) * 100) : 0
  const avgRisk = total ? Math.round(scans.reduce((sum, s) => sum + s.riskScore, 0) / total) : 0
  const topCheckpoint = mostCommon(scans.map((s) => s.checkpointName))

  const levelConfig = [
    { key: 'low' as const, color: '#16a34a', label: 'Low risk' },
    { key: 'medium' as const, color: '#d97706', label: 'Medium risk' },
    { key: 'high' as const, color: '#ea580c', label: 'High risk' },
    { key: 'critical' as const, color: '#dc2626', label: 'Critical' },
  ]

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-xl font-bold">Analytics</h1>
        <p className="text-sm text-muted-foreground">Screening intelligence across all checkpoints</p>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="w-full sm:max-w-xs">
            <Select value={checkpoint} onValueChange={setCheckpoint}>
              <SelectTrigger>
                <SelectValue placeholder="Checkpoint" />
              </SelectTrigger>
              <SelectContent>
                {checkpoints.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c === 'all' ? 'All checkpoints' : c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-1 rounded-lg border p-1">
            {RANGE_OPTIONS.map((r) => (
              <button
                key={r.key}
                onClick={() => setRange(r.key)}
                className={cn(
                  'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                  range === r.key ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary',
                )}
              >
                {r.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Summary label="Total Scans" value={total} />
        <Summary label="Avg Risk Score" value={`${avgRisk}/100`} />
        <Summary label="Tamper Rate" value={`${tamperRate}%`} />
        <Summary label="Top Checkpoint" value={topCheckpoint} small />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Risk Distribution</CardTitle>
            <CardDescription>Share of scans by risk band</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {levelConfig.map((l) => {
              const pct = total ? (byLevel[l.key] / total) * 100 : 0
              return (
                <div key={l.key}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: l.color }} />
                      {l.label}
                    </span>
                    <span className="text-muted-foreground">
                      {byLevel[l.key]} ({pct.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded bg-secondary">
                    <div
                      className="h-full rounded"
                      style={{ width: `${pct}%`, backgroundColor: l.color, transition: 'width 0.6s ease' }}
                    />
                  </div>
                </div>
              )
            })}
            {total === 0 && <p className="py-6 text-center text-sm text-muted-foreground">No data yet</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Document Types</CardTitle>
            <CardDescription>Volume by document category</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {byDoc.map((d) => {
              const pct = total ? (d.count / total) * 100 : 0
              return (
                <div key={d.value}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span>{d.label}</span>
                    <span className="text-muted-foreground">{d.count}</span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded bg-secondary">
                    <div
                      className="h-full rounded bg-primary"
                      style={{ width: `${pct}%`, transition: 'width 0.6s ease' }}
                    />
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Scan Risk Trend</CardTitle>
          <CardDescription>Risk score of the last up-to-20 scans, in order</CardDescription>
        </CardHeader>
        <CardContent>
          <MiniBars scans={scans.slice(0, 20)} />
        </CardContent>
      </Card>
    </div>
  )
}

function Summary({ label, value, small }: { label: string; value: string | number; small?: boolean }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={cn('mt-1 font-bold', small ? 'truncate text-base' : 'text-2xl')}>{value}</p>
      </CardContent>
    </Card>
  )
}

function MiniBars({ scans }: { scans: { id: string; riskScore: number; riskLevel: string }[] }) {
  const max = 100
  if (scans.length === 0) {
    return <p className="py-6 text-center text-sm text-muted-foreground">No scans to plot.</p>
  }
  return (
    <div className="space-y-2">
      {scans.slice(0, 20).map((s) => {
        const color =
          s.riskLevel === 'low' ? '#16a34a' : s.riskLevel === 'medium' ? '#d97706' : s.riskLevel === 'high' ? '#ea580c' : '#dc2626'
        return (
          <div key={s.id} className="flex items-center gap-3">
            <div className="w-16 shrink-0 text-right text-[11px] text-muted-foreground">{s.riskScore}</div>
            <div className="h-3 flex-1 overflow-hidden rounded bg-secondary">
              <div
                className="h-full rounded"
                style={{ width: `${(s.riskScore / max) * 100}%`, backgroundColor: color }}
              />
            </div>
            <Badge variant="secondary" className="w-24 justify-center">
              {s.riskLevel}
            </Badge>
          </div>
        )
      })}
    </div>
  )
}

function mostCommon(values: string[]): string {
  const counts = new Map<string, number>()
  for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1)
  let top = '—'
  let topCount = 0
  for (const [k, v] of counts) {
    if (v > topCount) {
      top = k
      topCount = v
    }
  }
  return top
}