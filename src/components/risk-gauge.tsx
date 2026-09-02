import { cn } from '@/lib/utils'
import { riskLevelForScore } from '@/types/domain'

interface RiskGaugeProps {
  score: number
  size?: number
  className?: string
  showLabel?: boolean
}

const LEVEL_COLORS: Record<string, string> = {
  low: '#16a34a',
  medium: '#d97706',
  high: '#ea580c',
  critical: '#dc2626',
}

export function RiskGauge({ score, size = 180, className, showLabel = true }: RiskGaugeProps) {
  const level = riskLevelForScore(score)
  const color = LEVEL_COLORS[level]
  const radius = size / 2 - 10
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference - (score / 100) * circumference

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={12}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={12}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{ transition: 'stroke-dashoffset 1s ease, stroke 0.5s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-bold leading-none" style={{ fontSize: size * 0.24, color }}>
          {score}
        </span>
        {showLabel && (
          <span className="mt-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">Risk</span>
        )}
      </div>
    </div>
  )
}
