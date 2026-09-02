import * as React from 'react'
import { Camera, RefreshCw, FileText, X, Loader2, UploadCloud } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export type CaptureStep = 'document' | 'face'

type CaptureMode = 'camera' | 'upload'

interface CameraCaptureProps {
  step: CaptureStep
  onCapture: (dataUrl: string) => void
  onSkip?: () => void
  allowManual?: boolean
}

export function CameraCapture({ step, onCapture, onSkip }: CameraCaptureProps) {
  const [mode, setMode] = React.useState<CaptureMode>('camera')

  return (
    <div className="flex flex-col gap-3">
      {/* Mode toggle */}
      <div className="mx-auto flex w-full max-w-md rounded-lg bg-secondary p-1">
        <button
          type="button"
          onClick={() => setMode('camera')}
          className={cn(
            'flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
            mode === 'camera' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
          )}
        >
          <Camera className="h-4 w-4" /> Live Camera
        </button>
        <button
          type="button"
          onClick={() => setMode('upload')}
          className={cn(
            'flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
            mode === 'upload' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
          )}
        >
          <UploadCloud className="h-4 w-4" /> Upload File
        </button>
      </div>

      {mode === 'camera' ? (
        <CameraFeed step={step} onCapture={onCapture} onSkip={onSkip} />
      ) : (
        <UploadPanel step={step} onCapture={onCapture} onSkip={onSkip} />
      )}
    </div>
  )
}

function CameraFeed({
  step,
  onCapture,
  onSkip,
}: {
  step: CaptureStep
  onCapture: (dataUrl: string) => void
  onSkip?: () => void
}) {
  const videoRef = React.useRef<HTMLVideoElement>(null)
  const streamRef = React.useRef<MediaStream | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [ready, setReady] = React.useState(false)
  const [preview, setPreview] = React.useState<string | null>(null)
  const [starting, setStarting] = React.useState(true)

  React.useEffect(() => {
    let cancelled = false
    async function init() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 } },
          audio: false,
        })
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
        }
        setReady(true)
      } catch {
        setError(
          'Camera access is unavailable or not permitted. Use the "Upload File" tab above to provide the document image instead.',
        )
      } finally {
        setStarting(false)
      }
    }
    init()
    return () => {
      cancelled = true
      streamRef.current?.getTracks().forEach((t) => t.stop())
    }
  }, [])

  const capture = () => {
    const video = videoRef.current
    if (!video || !ready) return
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d')!.drawImage(video, 0, 0)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85)
    setPreview(dataUrl)
    onCapture(dataUrl)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative mx-auto aspect-[1.5/1] w-full max-w-md overflow-hidden rounded-xl border-2 border-primary bg-black">
        {starting && !error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="text-sm">Initializing camera…</p>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-900 p-4 text-center">
            <X className="h-8 w-8 text-destructive" />
            <p className="text-sm text-white">{error}</p>
          </div>
        )}
        {!error && (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={cn('h-full w-full object-cover transition-opacity', ready ? 'opacity-100' : 'opacity-0')}
          />
        )}
        {ready && !error && (
          <div className="pointer-events-none absolute inset-0">
            {step === 'document' ? (
              <>
                <div className="absolute inset-x-6 top-[28%] flex aspect-[1.4/1] items-center justify-center rounded-sm border-2 border-primary/80">
                  <span className="bg-primary/10 px-2 py-1 text-[11px] font-medium text-white">
                    Align document within the frame
                  </span>
                </div>
                <div className="absolute left-0 top-0 h-6 w-6 border-l-4 border-t-4 border-white/70" />
                <div className="absolute right-0 top-0 h-6 w-6 border-r-4 border-t-4 border-white/70" />
                <div className="absolute bottom-0 left-0 h-6 w-6 border-b-4 border-l-4 border-white/70" />
                <div className="absolute bottom-0 right-0 h-6 w-6 border-b-4 border-r-4 border-white/70" />
              </>
            ) : (
              <>
                <div className="absolute inset-x-[22%] top-[6%] flex aspect-[3/4] items-center justify-center overflow-hidden rounded-full border-2 border-primary/80 bg-primary/5">
                  <span className="text-center text-[11px] font-medium text-white">
                    Face inside
                    <br />
                    the oval
                  </span>
                </div>
              </>
            )}
          </div>
        )}
        {preview && ready && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <img src={preview} alt="capture preview" className="max-h-full max-w-full object-contain" />
          </div>
        )}
      </div>

      <div className="mx-auto flex max-w-md items-center justify-center gap-2">
        {!error && (
          <Button onClick={capture} size="lg" className="gap-2">
            <Camera className="h-4 w-4" /> Capture {step === 'document' ? 'document' : 'face'}
          </Button>
        )}
        {onSkip && (
          <Button onClick={onSkip} variant="outline">
            <RefreshCw className="h-4 w-4" /> Simulate
          </Button>
        )}
      </div>
    </div>
  )
}

function UploadPanel({
  step,
  onCapture,
  onSkip,
}: {
  step: CaptureStep
  onCapture: (dataUrl: string) => void
  onSkip?: () => void
}) {
  const fileRef = React.useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = React.useState(false)
  const [fileName, setFileName] = React.useState<string | null>(null)

  const readFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = () => {
      setFileName(file.name)
      onCapture(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="flex flex-col gap-3">
      <div
        role="button"
        tabIndex={0}
        onClick={() => fileRef.current?.click()}
        onKeyDown={(e) => e.key === 'Enter' && fileRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragOver(false)
          const file = e.dataTransfer.files?.[0]
          if (file) readFile(file)
        }}
        className={cn(
          'mx-auto flex aspect-[1.5/1] w-full max-w-md cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-colors',
          dragOver ? 'border-primary bg-primary/5' : 'border-input hover:border-primary/60 hover:bg-secondary/40',
        )}
      >
        {fileName ? (
          <>
            <FileText className="mb-2 h-8 w-8 text-success" />
            <p className="text-sm font-medium">{fileName}</p>
            <p className="text-xs text-muted-foreground">File loaded — ready to continue</p>
          </>
        ) : (
          <>
            <UploadCloud className="mb-2 h-10 w-10 text-muted-foreground" />
            {step === 'document' ? (
              <p className="text-sm font-medium">Upload scanned document</p>
            ) : (
              <p className="text-sm font-medium">Upload a face photo</p>
            )}
            <p className="mt-1 text-xs text-muted-foreground">
              Click to browse, or drag &amp; drop an image here
            </p>
            <Button size="sm" className="mt-3 pointer-events-none">
              Choose file
            </Button>
          </>
        )}
      </div>

      <div className="mx-auto flex max-w-md items-center justify-center gap-2">
        {onSkip && (
          <>
            <Button
              onClick={onSkip}
              variant="outline"
              disabled={!fileName && step === 'document'}
              className={cn(!fileName && step === 'document' && 'opacity-50')}
            >
              <RefreshCw className="h-4 w-4" /> {step === 'document' ? 'Use sample document' : 'Simulate face'}
            </Button>
          </>
        )}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) readFile(file)
        }}
      />
    </div>
  )
}
