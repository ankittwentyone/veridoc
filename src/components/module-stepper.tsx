import { Check, Loader2, Scan } from 'lucide-react'
import type { ModuleStatus } from '@/types/domain'
import { cn } from '@/lib/utils'

export interface StepDef {
  key: string
  title: string
  subtitle?: string
  status: ModuleStatus
  pass?: boolean | null
  icon?: React.ReactNode
}

export function ModuleStepper({ steps }: { steps: StepDef[] }) {
  return (
    <div className="space-y-3">
      {steps.map((step, idx) => {
        const isActive = step.status === 'running'
        const isDone = step.status === 'done'
        const isPending = step.status === 'pending'
        return (
          <div key={step.key} className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-full border-2 transition-colors',
                  isDone && 'border-success bg-success/15 text-success',
                  isActive && 'border-primary bg-primary/10 text-primary',
                  isPending && 'border-border bg-muted text-muted-foreground',
                )}
              >
                {isDone ? <Check className="h-4 w-4" /> : <Scan className={cn('h-4 w-4', isActive && 'animate-spin')} />}
              </div>
              {idx < steps.length - 1 && (
                <div className={cn('my-1 h-6 w-0.5 rounded', isDone ? 'bg-success/40' : 'bg-border')} />
              )}
            </div>
            <div className="pt-1.5">
              <p
                className={cn(
                  'text-sm font-medium',
                  isPending ? 'text-muted-foreground' : 'text-foreground',
                )}
              >
                {step.title}
              </p>
              {step.subtitle && <p className="text-xs text-muted-foreground">{step.subtitle}</p>}
              {step.pass === true && !isPending && (
                <p className="text-xs font-medium text-success">Passed</p>
              )}
              {step.pass === false && !isPending && (
                <p className="text-xs font-semibold text-destructive">Flagged</p>
              )}
              {isActive && (
                <span className="mt-1 inline-flex items-center gap-1 text-xs text-primary">
                  <Loader2 className="h-3 w-3 animate-spin" /> Processing…
                </span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
