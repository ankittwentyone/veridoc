import * as React from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Fingerprint,
  Printer,
} from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RiskGauge } from '@/components/risk-gauge'
import { DocumentPreview } from '@/components/document-preview'
import { cn, formatDate } from '@/lib/utils'
import type { ScanReport, DecisionType } from '@/types/domain'

export function ScanResultDetail({ report, canDecide }: { report: ScanReport; canDecide: boolean }) {
  const { decide } = useApp()
  const [selectedRegion, setSelectedRegion] = React.useState<string | null>(null)
  const [decision, setDecision] = React.useState<DecisionType | null>(report.decision ?? null)
  const [reasonOpen, setReasonOpen] = React.useState(false)
  const [reason, setReason] = React.useState(report.decisionReason ?? '')

  const isFlagged = report.hasTampering || report.riskScore >= 60

  const handleDecision = (d: DecisionType) => {
    setDecision(d)
    if (d === 'approve') {
      decide(report, d, 'Approved at checkpoint')
      return
    }
    setReasonOpen(true)
  }

  const confirmWithReason = () => {
    if (decision) decide(report, decision, reason || 'No additional notes')
    setReasonOpen(false)
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link to="/app/history" className="no-print">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold">{report.travelerName}</h1>
              <Badge variant={isFlagged ? 'destructive' : 'success'}>{report.scanNumber}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {report.documentTitle} · {formatDate(report.scannedAt)} · {report.checkpointName}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 no-print">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" /> Export report
          </Button>
          {report.decision ? (
            <Badge variant="secondary">Decision logged · {report.decision}</Badge>
          ) : (
            canDecide && <Badge variant="warning">Awaiting decision</Badge>
          )}
        </div>
      </div>

      <Card className={cn('border-l-4', isFlagged ? 'border-l-destructive' : 'border-l-success')}>
        <CardContent className="flex flex-col items-center gap-6 p-6 md:flex-row md:items-start">
          <div className="flex flex-col items-center">
            <RiskGauge score={report.riskScore} size={170} />
            <Badge variant={isFlagged ? 'destructive' : 'success'} className="mt-2 text-sm">
              {isFlagged ? (
                <>
                  <ShieldAlert className="h-3.5 w-3.5" /> FLAGGED
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5" /> CLEARED
                </>
              )}
            </Badge>
          </div>

          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">
                {isFlagged ? 'Manual review recommended' : 'Document appears genuine'}
              </h2>
            </div>
            <p className="text-sm text-muted-foreground">{report.verificationMessage}</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Metric label="OCR Accuracy" value={Math.round(report.faceConfidence * 100) + '%'} />
              <Metric label="Face Match" value={Math.round(report.faceConfidence * 100) + '%'} />
              <Metric label="Tamper Flags" value={report.tamperRegions.length.toString()} />
              <Metric label="Liveness" value={report.livenessPassed ? 'Passed' : 'Uncertain'} />
            </div>
          </div>
        </CardContent>
      </Card>

      {canDecide && !report.decision && (
        <DecisionPanel
          decision={decision}
          onDecision={handleDecision}
          reasonOpen={reasonOpen}
          reason={reason}
          setReason={setReason}
          confirmWithReason={confirmWithReason}
          isFlagged={isFlagged}
        />
      )}

      {canDecide && report.decision && (
        <RevisedDecisionBar
          report={report}
          onRevise={() => {
            setDecision(report.decision ?? null)
            setReason(report.decisionReason ?? '')
            setReasonOpen(true)
          }}
        />
      )}

      {canDecide && report.decision && reasonOpen && (
        <DecisionPanel
          decision={decision}
          onDecision={handleDecision}
          reasonOpen={reasonOpen}
          reason={reason}
          setReason={setReason}
          confirmWithReason={confirmWithReason}
          isFlagged={isFlagged}
        />
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Fingerprint className="h-4 w-4 text-primary" /> Face Verification
            </CardTitle>
            <CardDescription>Live capture vs. document portrait biometric check</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="overflow-hidden rounded-lg border">
                <img src={report.faceUrl} alt="Live capture" className="aspect-square w-full object-cover" />
                <div className="bg-secondary/60 px-2 py-1.5 text-center text-[11px] font-medium text-muted-foreground">
                  Live capture
                </div>
              </div>
              <div className="overflow-hidden rounded-lg border">
                <div className="flex aspect-square w-full items-center justify-center bg-muted">
                  <ShieldAlert className="h-8 w-8 text-muted-foreground/40" />
                </div>
                <div className="bg-secondary/60 px-2 py-1.5 text-center text-[11px] font-medium text-muted-foreground">
                  Document portrait (redacted)
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Biometric match</p>
                <p className="text-xs text-muted-foreground">FaceNet-style embedding similarity</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold" style={{ color: report.faceConfidence >= 0.9 ? '#16a34a' : '#d97706' }}>
                  {Math.round(report.faceConfidence * 100)}%
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {report.livenessPassed ? 'Liveness passed' : 'Liveness uncertain'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" /> Tampering Analysis
            </CardTitle>
            <CardDescription>
              {report.hasTampering
                ? 'Click a highlighted region for details on suspected manipulation.'
                : 'No manipulation indicators detected.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <DocumentPreview
              imageUrl={report.imageUrl}
              title={report.documentTitle}
              regions={report.tamperRegions}
              selectedRegion={selectedRegion}
              onSelectRegion={setSelectedRegion}
            />
            {selectedRegion && report.imageUrl && (
              <TamperCompare imageUrl={report.imageUrl} regionLabel={selectedRegion} regions={report.tamperRegions} />
            )}
            {report.tamperRegions.length === 0 && (
              <div className="rounded-lg bg-success/10 p-3 text-center text-sm text-success">
                <CheckCircle2 className="mx-auto mb-1 h-5 w-5" />
                No tamper regions detected. ELA and security-feature scans were clean.
              </div>
            )}
            {report.tamperRegions.map((r) => (
              <button
                key={r.label}
                onClick={() => setSelectedRegion(selectedRegion === r.label ? null : r.label)}
                className={cn(
                  'w-full rounded-lg border p-3 text-left transition-colors',
                  selectedRegion === r.label ? 'border-primary bg-primary/5' : 'hover:bg-secondary',
                )}
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{r.label}</p>
                  <span className="text-xs font-semibold text-destructive">
                    {Math.round(r.confidence * 100)}% confidence
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  <span className="font-medium">Technique:</span> {r.technique}
                </p>
                <p className="text-xs text-muted-foreground">{r.description}</p>
              </button>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Why this score?</CardTitle>
              <CardDescription>Explainable contribution of each module.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {report.factors.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Detailed factor breakdown unavailable for this historical record.
                </p>
              ) : (
                report.factors.map((f) => (
                  <div key={f.code} className="rounded-lg border p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{f.title}</p>
                      <Badge variant={SEVERITY_BADGE[f.severity]}>{f.severity}</Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{f.explanation}</p>
                    {f.impact > 0 && (
                      <div className="mt-2">
                        <div className="flex justify-between text-[11px] text-muted-foreground">
                          <span>Impact</span>
                          <span>+{f.impact} pts</span>
                        </div>
                        <div className="mt-1 h-1.5 w-full overflow-hidden rounded bg-secondary">
                          <div className="h-full rounded bg-warning" style={{ width: `${Math.min(100, f.impact)}%` }} />
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {report.ocrFields.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Fingerprint className="h-4 w-4 text-primary" /> Verified Fields
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {report.ocrFields.map((f) => (
                  <div key={f.label} className="flex items-center justify-between rounded-md border px-3 py-2">
                    <div>
                      <p className="text-xs text-muted-foreground">{f.label}</p>
                      <p className="text-sm font-medium">{f.value}</p>
                    </div>
                    {f.matched ? (
                      <Badge variant="success">Matches DB</Badge>
                    ) : (
                      <Badge variant="destructive">Mismatch</Badge>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <div className="print-root">
        <PrintableReport report={report} />
      </div>
    </div>
  )
}

const SEVERITY_BADGE: Record<string, 'success' | 'warning' | 'destructive'> = {
  low: 'success',
  medium: 'warning',
  high: 'destructive',
  critical: 'destructive',
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-secondary/60 p-2.5">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold">{value}</p>
    </div>
  )
}

const TONE_MAP: Record<string, string> = {
  success: 'border-success bg-success/10 text-success hover:bg-success/20',
  warning: 'border-warning bg-warning/10 text-warning hover:bg-warning/20',
  destructive: 'border-destructive bg-destructive/10 text-destructive hover:bg-destructive/20',
  info: 'border-info bg-info/10 text-info hover:bg-info/20',
}

function TamperCompare({
  imageUrl,
  regionLabel,
  regions,
}: {
  imageUrl: string
  regionLabel: string
  regions: { label: string; confidence: number; x: number; y: number; width: number; height: number }[]
}) {
  const region = regions.find((r) => r.label === regionLabel)
  if (!region) return null
  return (
    <div className="rounded-lg border border-warning/40 bg-warning/5 p-3">
      <p className="mb-2 text-xs font-semibold text-warning">
        Suspected manipulation — {regionLabel} ({Math.round(region.confidence * 100)}% confidence)
      </p>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <p className="mb-1 text-[10px] uppercase tracking-wide text-muted-foreground">Extracted region</p>
          <div
            className="relative overflow-hidden rounded border"
            style={{ aspectRatio: region.width / region.height }}
          >
            <img
              src={imageUrl}
              alt="region"
              className="absolute h-auto max-w-none"
              style={{
                width: `${100 / (region.width / 100) * 9}%`,
                clipPath: `inset(${region.y}% ${100 - region.x - region.width}% ${100 - region.y - region.height}% ${region.x}%)`,
              }}
            />
          </div>
        </div>
        <div>
          <p className="mb-1 text-[10px] uppercase tracking-wide text-muted-foreground">Forensic heatmap</p>
          <ForensicHeatmap imageUrl={imageUrl} region={region} />
        </div>
      </div>
    </div>
  )
}

function ForensicHeatmap({
  imageUrl,
  region,
}: {
  imageUrl: string
  region: { label: string; confidence: number }
}) {
  const seed = region.label.length
  const spots = Array.from({ length: 4 }, (_, i) => ({
    x: (seed * 17 + i * 31) % 100,
    y: (seed * 29 + i * 47) % 100,
    r: 18 + ((seed * 7 + i * 13) % 26),
    o: 0.4 + ((seed + i) % 4) * 0.14,
  }))
  return (
    <div className="relative h-full min-h-[90px] overflow-hidden rounded border bg-slate-900">
      <img src={imageUrl} alt="original" className="absolute inset-0 h-full w-full object-cover opacity-30" />
      <div className="absolute inset-0">
        {spots.map((s, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-warning/70"
            style={{
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: `${s.r * 2}%`,
              height: `${s.r * 2}%`,
              opacity: s.o,
              filter: 'blur(4px)',
            }}
          />
        ))}
      </div>
      <div className="absolute bottom-1 right-1 rounded bg-black/70 px-1.5 py-0.5 text-[9px] font-semibold text-warning">
        ELA HEATMAP
      </div>
    </div>
  )
}

function PrintableReport({ report }: { report: ScanReport }) {
  const isFlagged = report.hasTampering || report.riskScore >= 60
  return (
    <div className="space-y-5 text-sm">
      <div className="flex items-start justify-between border-b border-slate-300 pb-3">
        <div>
          <p className="text-lg font-bold">Veridoc — Verification Report</p>
          <p className="text-slate-600">AI-based Fake Identity &amp; Document Screening · MHA / SSB</p>
        </div>
        <div className="text-right">
          <p className="font-semibold">{report.scanNumber}</p>
          <p className="text-slate-600">{formatDate(report.scannedAt)}</p>
        </div>
      </div>

      <div>
        <p className="font-bold">Subject</p>
        <p>{report.travelerName}</p>
        <p className="text-slate-600">
          {report.documentTitle} · Checkpoint: {report.checkpointName}
        </p>
      </div>

      <div className="flex gap-6">
        <div>
          <p className="text-slate-600">Risk score</p>
          <p className="text-2xl font-bold">{report.riskScore} / 100</p>
        </div>
        <div>
          <p className="text-slate-600">Verdict</p>
          <p className="text-2xl font-bold">{isFlagged ? 'FLAGGED' : 'CLEARED'}</p>
        </div>
        <div>
          <p className="text-slate-600">Decision</p>
          <p className="text-2xl font-bold">{report.decision ?? 'Pending'}</p>
        </div>
      </div>

      <div>
        <p className="mb-1 font-bold">Assessment</p>
        <p className="text-slate-700">{report.verificationMessage}</p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <p>OCR accuracy: {Math.round(report.faceConfidence * 100)}%</p>
          <p>Face match: {Math.round(report.faceConfidence * 100)}%</p>
          <p>Tamper flags: {report.tamperRegions.length}</p>
          <p>Liveness: {report.livenessPassed ? 'Passed' : 'Uncertain'}</p>
        </div>
      </div>

      {report.factors.length > 0 && (
        <div>
          <p className="mb-1 font-bold">Contributing factors</p>
          {report.factors.map((f) => (
            <div key={f.code} className="mb-1">
              <p>
                <span className="font-medium">{f.title}</span> ({f.severity})
              </p>
              <p className="text-slate-600">{f.explanation}</p>
            </div>
          ))}
        </div>
      )}

      {report.tamperRegions.length > 0 && (
        <div>
          <p className="mb-1 font-bold">Tamper regions</p>
          {report.tamperRegions.map((r) => (
            <p key={r.label}>
              {r.label} — {Math.round(r.confidence * 100)}% ({r.technique})
            </p>
          ))}
        </div>
      )}

      {report.decisionReason && (
        <div>
          <p className="font-bold">Officer note</p>
          <p className="text-slate-700">{report.decisionReason}</p>
        </div>
      )}

      <p className="border-t border-slate-300 pt-2 text-[11px] text-slate-500">
        Generated by Veridoc screening system. This report is a demo artefact and not an official government
        document.
      </p>
    </div>
  )
}

function RevisedDecisionBar({ report, onRevise }: { report: ScanReport; onRevise: () => void }) {
  const tone = report.approved ? 'success' : report.decision === 'escalate' ? 'warning' : 'destructive'
  return (
    <Card>
      <CardContent className="flex flex-col items-start justify-between gap-3 p-5 sm:flex-row sm:items-center">
        <div className="flex items-start gap-3">
          <Badge variant={tone as 'success' | 'warning' | 'destructive'} className="mt-0.5">
            {report.decision?.toUpperCase()}
          </Badge>
          <div>
            <p className="text-sm font-semibold">Decision recorded</p>
            <p className="text-xs text-muted-foreground">
              {report.decisionReason || 'No recorded notes'} ·{' '}
              {report.decisionAt ? formatDate(report.decisionAt) : ''}
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={onRevise}>
          Revise decision
        </Button>
      </CardContent>
    </Card>
  )
}

function DecisionPanel({
  decision,
  onDecision,
  reasonOpen,
  reason,
  setReason,
  confirmWithReason,
  isFlagged,
}: {  decision: DecisionType | null
  onDecision: (d: DecisionType) => void
  reasonOpen: boolean
  reason: string
  setReason: (s: string) => void
  confirmWithReason: () => void
  isFlagged: boolean
}) {
  const buttons: { d: DecisionType; label: string; tone: string; disabled?: boolean }[] = [
    { d: 'approve', label: 'Approve', tone: 'success', disabled: isFlagged },
    { d: 'escalate', label: 'Escalate', tone: 'warning' },
    { d: 'deny', label: 'Deny Entry', tone: 'destructive' },
    { d: 'override', label: 'Override', tone: 'info' },
  ]
  return (
    <Card>
      <CardContent className="p-5">
        <p className="mb-3 text-sm font-semibold">Officer Decision</p>
        <div className="flex flex-wrap gap-2">
          {buttons.map((b) => (
            <button
              key={b.d}
              onClick={() => onDecision(b.d)}
              disabled={b.disabled && decision !== b.d}
              className={cn(
                'rounded-lg border px-4 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40',
                decision === b.d ? TONE_MAP[b.tone] : 'border-border bg-card hover:bg-secondary',
              )}
            >
              {b.label}
              {b.disabled && decision !== b.d && <span className="ml-1 text-[10px]">(cleared only)</span>}
            </button>
          ))}
        </div>
        {reasonOpen && (
          <div className="mt-3 space-y-2 rounded-lg border bg-secondary/40 p-3">
            <Label>Reason / notes</Label>
            <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Document this decision…" />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={confirmWithReason}>
                Cancel
              </Button>
              <Button size="sm" onClick={confirmWithReason}>
                Confirm &amp; Log
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
