import type { TamperRegion } from '@/types/domain'
import { cn } from '@/lib/utils'

interface DocumentPreviewProps {
  imageUrl?: string
  title: string
  regions: TamperRegion[]
  showOverlay?: boolean
  selectedRegion?: string | null
  onSelectRegion?: (label: string | null) => void
  className?: string
  aspectRatio?: number
}

export function DocumentPreview({
  imageUrl,
  title,
  regions,
  showOverlay = true,
  selectedRegion = null,
  onSelectRegion,
  className,
  aspectRatio = 1.5,
}: DocumentPreviewProps) {
  return (
    <div className={cn('relative w-full overflow-hidden rounded-lg bg-muted', className)} style={{ aspectRatio }}>
      {imageUrl ? (
        <img src={imageUrl} alt={title} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-1 bg-gradient-to-br from-muted to-secondary/60 p-6 text-center">
          <span className="text-2xl font-bold tracking-[0.3em] text-primary/70 uppercase">SAMPLE</span>
          <span className="text-sm font-medium text-muted-foreground">{title}</span>
          <span className="text-xs text-muted-foreground">Document scan preview</span>
        </div>
      )}
      {showOverlay &&
        regions.map((r) => {
          const isSelected = selectedRegion === r.label
          return (
            <button
              key={r.label}
              type="button"
              onClick={() => onSelectRegion?.(isSelected ? null : r.label)}
              className="group absolute block cursor-pointer focus:outline-none"
              style={{
                left: `${r.x}%`,
                top: `${r.y}%`,
                width: `${r.width}%`,
                height: `${r.height}%`,
              }}
              title={r.label}
            >
              <span
                className={cn(
                  'block h-full w-full rounded-sm border-2 transition-colors',
                  isSelected ? 'border-danger bg-danger/35' : 'border-danger/90 bg-danger/15 group-hover:bg-danger/30',
                )}
              />
              <span className="absolute -top-9 left-0 whitespace-nowrap rounded bg-danger px-1.5 py-0.5 text-[10px] font-semibold text-white opacity-0 shadow transition-opacity group-hover:opacity-100">
                {r.label} · {Math.round(r.confidence * 100)}%
              </span>
            </button>
          )
        })}
    </div>
  )
}
