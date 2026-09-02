import type {
  ModuleResult,
  ScanReport,
  TamperRegion,
  DocumentType,
  RiskFactor,
  OcrField,
} from '@/types/domain'
import { documentTypeSample } from '@/lib/sampleDocs'

export interface PipelineInput {
  documentType: DocumentType
  travelerName: string
  nationality: string
  docNumber: string
  tamperMode: 'clean' | 'subtle' | 'obvious'
  imageUrl?: string
  faceUrl?: string
  officerId: string
  officerName: string
  checkpointId: string
  checkpointName: string
}

const TAMPER_SCORE: Record<'clean' | 'subtle' | 'obvious', number> = {
  clean: 0,
  subtle: 45,
  obvious: 78,
}

const REGION_LIBRARY: Record<string, TamperRegion> = {
  mrz: {
    label: 'MRZ area',
    x: 6,
    y: 78,
    width: 86,
    height: 18,
    description: 'Data alteration in the machine-readable zone (MRZ).',
    technique: 'Character substitution / pixel splicing',
    confidence: 0.92,
  },
  photo: {
    label: 'Portrait photo',
    x: 64,
    y: 16,
    width: 30,
    height: 40,
    description: 'Portrait region shows signs of digital manipulation.',
    technique: 'Morphing / face replacement',
    confidence: 0.88,
  },
  dob: {
    label: 'Date of birth',
    x: 12,
    y: 44,
    width: 30,
    height: 12,
    description: 'Altered date of birth field.',
    technique: 'Overlay patch / reprint',
    confidence: 0.81,
  },
  number: {
    label: 'Document number',
    x: 12,
    y: 30,
    width: 34,
    height: 12,
    description: 'Document number field shows artifact edges.',
    technique: 'Airbrushing / clone stamp',
    confidence: 0.85,
  },
  hologram: {
    label: 'Security hologram',
    x: 40,
    y: 62,
    width: 22,
    height: 16,
    description: 'Holographic element absent or inconsistent under UV.',
    technique: 'Missing laminate / re-lamination',
    confidence: 0.9,
  },
  visa: {
    label: 'Visa sticker area',
    x: 14,
    y: 56,
    width: 40,
    height: 30,
    description: 'Visa sticker shows evidence of removal and re-application.',
    technique: 'Sticker transfer / glue residue',
    confidence: 0.86,
  },
}

const DOC_SPECS: Record<
  DocumentType,
  { title: string; numberLabel: string; regions: string[]; numberPrefix: string }
> = {
  passport: {
    title: 'Indian Passport',
    numberLabel: 'Passport No.',
    numberPrefix: 'P',
    regions: ['mrz', 'photo', 'dob'],
  },
  visa: {
    title: 'Visa',
    numberLabel: 'Visa No.',
    numberPrefix: 'V',
    regions: ['visa', 'photo'],
  },
  'national-id': {
    title: 'National ID (Aadhaar)',
    numberLabel: 'Aadhaar No.',
    numberPrefix: 'A',
    regions: ['number', 'photo'],
  },
  'driving-license': {
    title: 'Driving License',
    numberLabel: 'License No.',
    numberPrefix: 'DL',
    regions: ['dob', 'hologram', 'photo'],
  },
  permit: {
    title: 'Border Pass / Permit',
    numberLabel: 'Permit No.',
    numberPrefix: 'PRM',
    regions: ['hologram', 'mrz', 'visa'],
  },
}

export function generateScan(input: PipelineInput): ScanReport {
  const spec = DOC_SPECS[input.documentType]
  const tamperScore = TAMPER_SCORE[input.tamperMode]
  const hasTampering = tamperScore > 0

  const faceConfidence = input.tamperMode === 'clean' ? 0.96 : 0.62
  const liveness = input.tamperMode !== 'obvious'

  const factors: RiskFactor[] = []

  if (hasTampering) {
    factors.push({
      code: 'tamper-mrz',
      title: 'Tamper flags detected',
      explanation:
        'Image forensics detected pixel artifacts, clone-stamp traces and inconsistent lighting in key security regions.',
      severity: input.tamperMode === 'obvious' ? 'high' : 'medium',
      impact: input.tamperMode === 'obvious' ? 42 : 26,
    })
  } else {
    factors.push({
      code: 'clean',
      title: 'No tamper indicators',
      explanation:
        'ELA, LBP noise analysis, and printer-pattern checks found no signs of digital manipulation or reprinting.',
      severity: 'low',
      impact: 0,
    })
  }

  if (input.tamperMode !== 'clean') {
    factors.push({
      code: 'face-low',
      title: 'Low face-match confidence',
      explanation: `Biometric similarity score between document photo and live capture was ${Math.round(
        faceConfidence * 100,
      )}%, below the 90% acceptance threshold.`,
      severity: 'medium',
      impact: 16,
    })
  } else {
    factors.push({
      code: 'face-ok',
      title: 'Face match confirmed',
      explanation: 'Liveness check passed and biometric similarity exceeded the acceptance threshold.',
      severity: 'low',
      impact: 0,
    })
  }

  if (!liveness) {
    factors.push({
      code: 'liveness-fail',
      title: 'Liveness check inconclusive',
      explanation:
        'Anti-spoofing analysis could not confidently confirm a live subject on the presented face sample.',
      severity: 'high',
      impact: 20,
    })
  }

  const regions = hasTampering ? spec.regions.map((id) => REGION_LIBRARY[id]) : []

  const ocrFields: OcrField[] = [
    { label: 'Full Name', value: input.travelerName, matched: true, source: 'ocr' },
    { label: 'Nationality', value: input.nationality, matched: true, source: 'ocr' },
    { label: spec.numberLabel, value: input.docNumber, matched: true, source: 'ocr' },
    {
      label: 'Date of Birth',
      value: input.tamperMode === 'obvious' ? '12/08/1995' : '15/03/1992',
      matched: input.tamperMode === 'clean',
      source: 'ocr',
    },
  ]

  if (input.tamperMode !== 'clean') {
    const mismatched = Math.random() > 0.5 ? 1 : 0
    for (let i = 0; i < 2; i++) {
      ocrFields.push({
        label: i === 0 ? 'Father\'s Name' : 'Address',
        value: input.tamperMode === 'obvious' ? 'RAVI KUMAR' : input.travelerName,
        matched: i !== mismatched,
        source: i === 0 ? 'database' : 'ocr',
      })
    }
  }

  const primaryScore = factors.reduce((s, f) => s + f.impact, 0)
  // Cap & shape into 0-100 with risk level semantics
  const raw = Math.min(100, Math.max(0, primaryScore + (hasTampering ? tamperScore * 0.45 : 4)))
  const riskScore = Math.round(raw)

  const verificationMessage = hasTampering
    ? tamperScore > 60
      ? 'Multiple high-confidence manipulation indicators detected. Manual review strongly recommended.'
      : 'Indicators of possible tampering found. Escalate for manual forensic review.'
    : 'Document passes structural, security and biometric verification. No anomalies detected.'

  const scanNumber = `VD-${Date.now().toString(36).toUpperCase()}`
  const sample = documentTypeSample(input.documentType)

  return {
    id: `scan-${Math.random().toString(36).slice(2, 8)}`,
    scanNumber,
    documentType: input.documentType,
    documentTitle: spec.title,
    travelerName: input.travelerName,
    nationality: input.nationality,
    passportNumber: input.docNumber,
    scannedAt: new Date(),
    officerId: input.officerId,
    officerName: input.officerName,
    checkpointId: input.checkpointId,
    checkpointName: input.checkpointName,
    riskScore,
    riskLevel: scoreLevel(riskScore),
    factors,
    ocrFields,
    faceConfidence,
    livenessPassed: liveness,
    tamperRegions: regions,
    hasTampering,
    verificationMessage,
    approved: null,
    imageUrl: input.imageUrl && input.imageUrl !== 'simulated' ? input.imageUrl : sample.imageUrl,
    faceUrl: input.faceUrl && input.faceUrl !== 'simulated' ? input.faceUrl : sample.faceUrl,
    processingMs: 2800 + Math.round(Math.random() * 1500),
  }
}

function scoreLevel(score: number) {
  if (score >= 80) return 'critical' as const
  if (score >= 60) return 'high' as const
  if (score >= 30) return 'medium' as const
  return 'low' as const
}

export function generateModules(): Omit<ModuleResult, 'status'>[] {
  const order: ModuleResult['key'][] = ['ocr', 'validation', 'tampering', 'face']
  const map: Record<ModuleResult['key'], Omit<ModuleResult, 'status'>> = {
    ocr: {
      key: 'ocr',
      title: 'OCR Extraction',
      pass: null,
      details: ['Running layout detector', 'Extracting fields with OCR engine', 'Normalizing text'],
      confidence: 0.98,
    },
    validation: {
      key: 'validation',
      title: 'Document Validation',
      pass: null,
      details: ['Verifying MRZ checksum', 'Cross-checking security templates', 'Looking up registry'],
      confidence: 0.94,
    },
    tampering: {
      key: 'tampering',
      title: 'Tampering / Forgery Detection',
      pass: null,
      details: ['Running ELA (error level analysis)', 'Detecting clone-stamp artifacts', 'Scanning security features'],
      confidence: 0.91,
    },
    face: {
      key: 'face',
      title: 'Face Verification',
      pass: null,
      details: ['Extracting face embeddings', 'Running liveness check', 'Computing biometric similarity'],
      confidence: 0.96,
    },
  }
  return order.map((k) => map[k])
}
