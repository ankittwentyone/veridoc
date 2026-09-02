import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  FileText,
  ScanLine,
  ShieldAlert,
  Check,
} from 'lucide-react'
import { useApp } from '@/context/AppContext'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { CameraCapture } from '@/components/capture-camera'
import { ModuleStepper, type StepDef } from '@/components/module-stepper'
import { generateScan, generateModules } from '@/lib/mockEngine'
import { DOCUMENT_TYPES, documentTypeMeta, type DocumentType, type ModuleResult, type ModuleStatus } from '@/types/domain'
import { cn } from '@/lib/utils'

type WizardStep = 'details' | 'capture-doc' | 'capture-face' | 'processing'

const TAMPER_MODES: { value: 'clean' | 'subtle' | 'obvious'; label: string; desc: string }[] = [
  { value: 'clean', label: 'Genuine document', desc: 'All checks should pass' },
  { value: 'subtle', label: 'Subtle tampering', desc: 'Minor alteration demo' },
  { value: 'obvious', label: 'Clear forgery', desc: 'Highly manipulated demo' },
]

const MODULE_SEQUENCE: { key: ModuleResult['key']; duration: number }[] = [
  { key: 'ocr', duration: 1400 },
  { key: 'validation', duration: 1200 },
  { key: 'tampering', duration: 1500 },
  { key: 'face', duration: 1200 },
]

export function ScanPage() {
  const navigate = useNavigate()
  const { state, submitScan } = useApp()
  const user = state.currentUser!

  const [step, setStep] = React.useState<WizardStep>('details')
  const [documentType, setDocumentType] = React.useState<DocumentType>('passport')
  const [tamperMode, setTamperMode] = React.useState<'clean' | 'subtle' | 'obvious'>('clean')
  const [travelerName, setTravelerName] = React.useState('')
  const [nationality, setNationality] = React.useState('IND')
  const [docNumber, setDocNumber] = React.useState('')

  const [docImage, setDocImage] = React.useState<string | undefined>(undefined)
  const [faceImage, setFaceImage] = React.useState<string | undefined>(undefined)

  // Processing state
  const [modules, setModules] = React.useState<Omit<ModuleResult, 'status'>[]>([])
  const [moduleStatus, setModuleStatus] = React.useState<Record<string, ModuleStatus>>({})

  React.useEffect(() => {
    if (user.role !== 'officer') navigate('/app/dashboard', { replace: true })
  }, [user, navigate])

  const canProceedDetails =
    step === 'details' && travelerName.trim().length > 1 && docNumber.trim().length >= 3
  const canProceedDoc = step === 'capture-doc' && !!docImage

  const startProcessing = () => {
    setStep('processing')
    const mods = generateModules()
    setModules(mods)
    const initial: Record<string, ModuleStatus> = { ocr: 'pending', validation: 'pending', tampering: 'pending', face: 'pending' }
    setModuleStatus(initial)

    let elapsed = 0
    MODULE_SEQUENCE.forEach(({ key, duration }) => {
      window.setTimeout(() => {
        setModuleStatus((prev) => ({ ...prev, [key]: 'running' }))
      }, 500 + elapsed)
      elapsed += duration
      window.setTimeout(() => {
        setModuleStatus((prev) => ({ ...prev, [key]: 'done' }))
      }, 500 + elapsed)
    })

    const totalMs = 520 + 1400 + 1200 + 1500 + 1200
    window.setTimeout(() => {
      const result = generateScan({
        documentType,
        travelerName,
        nationality,
        docNumber,
        tamperMode,
        imageUrl: docImage,
        faceUrl: faceImage,
        officerId: user.id,
        officerName: user.name,
        checkpointId: user.checkpointId,
        checkpointName: user.checkpointName,
      })
      submitScan(result)
      navigate(`/app/history/${result.id}`)
    }, totalMs)
  }

  const moduleSteps: StepDef[] = modules.map((m) => ({
    key: m.key,
    title: m.title,
    subtitle: m.details[0],
    status: moduleStatus[m.key] ?? 'pending',
  }))

  if (step === 'details') {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/app/dashboard')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">New Document Scan</h1>
            <p className="text-sm text-muted-foreground">Step 1 of 3 · Document information</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" /> Document Details
            </CardTitle>
            <CardDescription>
              Enter the document metadata before capture. For a production build this would auto-fill from OCR.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Document Type</Label>
              <Select value={documentType} onValueChange={(v) => setDocumentType(v as DocumentType)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENT_TYPES.map((d) => (
                    <SelectItem key={d.value} value={d.value}>
                      {d.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Traveler Name</Label>
                <Input
                  placeholder="Full name on document"
                  value={travelerName}
                  onChange={(e) => setTravelerName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>{documentTypeMeta(documentType).idLabel}</Label>
                <Input
                  placeholder={documentTypeMeta(documentType).placeholder}
                  value={docNumber}
                  onChange={(e) => setDocNumber(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Nationality (ISO)</Label>
              <Input
                placeholder="IND"
                value={nationality}
                onChange={(e) => setNationality(e.target.value.toUpperCase())}
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-warning" /> Demo Scenario
              </Label>
              <div className="space-y-2">
                {TAMPER_MODES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setTamperMode(t.value)}
                    className={cn(
                      'flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors',
                      tamperMode === t.value ? 'border-primary bg-primary/5' : 'hover:bg-secondary',
                    )}
                  >
                    <div
                      className={cn(
                        'mt-0.5 flex h-4 w-4 items-center justify-center rounded-full border',
                        tamperMode === t.value && 'border-primary bg-primary',
                      )}
                    >
                      {tamperMode === t.value && <Check className="h-3 w-3 text-white" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{t.label}</p>
                      <p className="text-xs text-muted-foreground">{t.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={() => setStep('capture-doc')} disabled={!canProceedDetails} className="gap-2">
            Continue to Capture <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }

  if (step === 'capture-doc' || step === 'capture-face') {
    const isDoc = step === 'capture-doc'
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setStep(isDoc ? 'details' : 'capture-doc')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">{isDoc ? 'Capture Document' : 'Capture Face'}</h1>
              <p className="text-sm text-muted-foreground">
                Step {isDoc ? '2' : '3'} of 3 · {isDoc ? 'Align document in the guide box' : 'Align face within the oval'}
              </p>
            </div>
          </div>
          <Badge variant="secondary">{isDoc ? 'Document' : 'Face Liveness'}</Badge>
        </div>

        <Card>
          <CardContent className="p-4">
            <CameraCapture
              step={isDoc ? 'document' : 'face'}
              onCapture={(url) => (isDoc ? setDocImage(url) : setFaceImage(url))}
              onSkip={() => {
                if (isDoc) {
                  setDocImage('simulated')
                  setStep('capture-face')
                } else {
                  setFaceImage('simulated')
                  startProcessing()
                }
              }}
            />
            {isDoc && (
              <p className="mt-3 text-center text-xs text-muted-foreground">
                Auto-crop extracts the document region and corrects perspective before OCR.
              </p>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end">
          {isDoc ? (
            <Button
              onClick={() => setStep('capture-face')}
              disabled={!canProceedDoc && !docImage}
              className="gap-2"
            >
              Continue <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={startProcessing} className="gap-2">
              <ScanLine className="h-4 w-4" /> Run AI Analysis
            </Button>
          )}
        </div>
      </div>
    )
  }

  if (step === 'processing') {
    return (
      <div className="mx-auto max-w-lg space-y-6">
        <div className="text-center">
          <h1 className="text-xl font-bold">Analyzing Document</h1>
          <p className="text-sm text-muted-foreground">
            Running the four screening modules in sequence
          </p>
        </div>

        <Card>
          <CardContent className="p-5">
            <div className="mb-4 grid grid-cols-2 gap-3 rounded-lg bg-secondary/60 p-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Traveler</p>
                <p className="font-medium">{travelerName}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Document</p>
                <p className="font-medium">
                  {DOCUMENT_TYPES.find((d) => d.value === documentType)?.label} · {docNumber}
                </p>
              </div>
            </div>
            <ModuleStepper steps={moduleSteps} />
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          Each module outputs its own confidence. Risk is aggregated with explainable factors.
        </p>
      </div>
    )
  }

  return null
}

