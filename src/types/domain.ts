export type Role = 'officer' | 'admin' | 'analyst'

export type DocumentType = 'passport' | 'visa' | 'national-id' | 'driving-license' | 'permit'

export type ModuleStatus = 'pending' | 'running' | 'done'

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'

export type DecisionType = 'approve' | 'escalate' | 'deny' | 'override'

export interface User {
  id: string
  name: string
  role: Role
  badge: string
  checkpointId: string
  checkpointName: string
  avatarColor: string
  initials: string
}

export interface RiskFactor {
  code: string
  title: string
  explanation: string
  severity: RiskLevel
  impact: number
}

export interface ModuleResult {
  key: 'ocr' | 'validation' | 'tampering' | 'face'
  title: string
  status: ModuleStatus
  statusText?: string
  pass: boolean | null
  details: string[]
  confidence?: number
}

export interface TamperRegion {
  label: string
  x: number
  y: number
  width: number
  height: number
  description: string
  technique: string
  confidence: number
}

export interface FaceResult {
  match: boolean | null
  confidence?: number
  livenessPassed?: boolean
  desc?: string
}

export interface OcrField {
  label: string
  value: string
  matched: boolean
  source: 'ocr' | 'database'
}

export interface ScanReport {
  id: string
  scanNumber: string
  documentType: DocumentType
  documentTitle: string
  travelerName: string
  nationality: string
  passportNumber: string
  scannedAt: Date
  officerId: string
  officerName: string
  checkpointId: string
  checkpointName: string
  riskScore: number
  riskLevel: RiskLevel
  factors: RiskFactor[]
  ocrFields: OcrField[]
  faceConfidence: number
  livenessPassed: boolean
  tamperRegions: TamperRegion[]
  hasTampering: boolean
  verificationMessage: string
  decision?: DecisionType
  decisionAt?: Date
  decisionReason?: string
  approved: boolean | null
  imageUrl?: string
  faceUrl?: string
  processingMs: number
}

export const DOCUMENT_TYPES: { value: DocumentType; label: string; idLabel: string; placeholder: string }[] = [
  { value: 'passport', label: 'Passport', idLabel: 'Passport No.', placeholder: 'e.g. P1234567' },
  { value: 'visa', label: 'Visa', idLabel: 'Visa No.', placeholder: 'e.g. V99887766' },
  { value: 'national-id', label: 'National ID (Aadhaar)', idLabel: 'Aadhaar No.', placeholder: 'e.g. 5647 3829 1081' },
  { value: 'driving-license', label: 'Driving License', idLabel: 'License No.', placeholder: 'e.g. DL-04-1995-8877665' },
  { value: 'permit', label: 'Permit / VISA', idLabel: 'Permit No.', placeholder: 'e.g. PRM-2024-88912' },
]

export function documentTypeMeta(type: DocumentType) {
  return DOCUMENT_TYPES.find((d) => d.value === type) ?? DOCUMENT_TYPES[0]
}

export const RISK_LEVELS: { level: RiskLevel; threshold: number; label: string; color: string }[] = [
  { level: 'low', threshold: 0, label: 'Low Risk', color: '#16a34a' },
  { level: 'medium', threshold: 30, label: 'Medium Risk', color: '#d97706' },
  { level: 'high', threshold: 60, label: 'High Risk', color: '#ea580c' },
  { level: 'critical', threshold: 80, label: 'Critical', color: '#dc2626' },
]

export function riskLevelForScore(score: number): RiskLevel {
  let level: RiskLevel = 'low'
  for (const r of RISK_LEVELS) {
    if (score >= r.threshold) level = r.level
  }
  return level
}
