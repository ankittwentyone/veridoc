import type { ScanReport, User, DecisionType } from '@/types/domain'

export interface AuditEntry {
  id: string
  scanId: string
  scanNumber: string
  travelerName: string
  action: DecisionType
  officerId: string
  officerName: string
  checkpointId: string
  timestamp: Date
  reason?: string
  previousRiskScore?: number
  previousDecision?: DecisionType
}

export interface AppState {
  currentUser: User | null
  scans: ScanReport[]
  audit: AuditEntry[]
  lastScanId?: string | null
}

const USERS: User[] = [
  {
    id: 'officer-1',
    name: 'Inspector A. Sharma',
    role: 'officer',
    badge: 'SSB-4521',
    checkpointId: 'CP-0042',
    checkpointName: 'Munabao Rail Checkpoint',
    avatarColor: '#2563eb',
    initials: 'AS',
  },
  {
    id: 'officer-2',
    name: 'Inspector R. Chauhan',
    role: 'officer',
    badge: 'SSB-3307',
    checkpointId: 'CP-0019',
    checkpointName: 'Banbasa Border Post',
    avatarColor: '#0d9488',
    initials: 'RC',
  },
  {
    id: 'admin-1',
    name: 'Commandant V. Menon',
    role: 'admin',
    badge: 'ADM-001',
    checkpointId: 'HQ-NEWDELHI',
    checkpointName: 'SSB HQ, New Delhi',
    avatarColor: '#7c3aed',
    initials: 'VM',
  },
  {
    id: 'analyst-1',
    name: 'Analyst S. Iyer',
    role: 'analyst',
    badge: 'ANL-208',
    checkpointId: 'HQ-NEWDELHI',
    checkpointName: 'SSB HQ, New Delhi',
    avatarColor: '#db2777',
    initials: 'SI',
  },
]

const STORAGE_KEY = 'veridoc.appstate.v1'

const fallbackScans: ScanReport[] = [
  {
    id: 'scan-hist-1',
    scanNumber: 'VD-8F2A1B3C',
    documentType: 'passport',
    documentTitle: 'Indian Passport',
    travelerName: 'Mohammed Iqbal',
    nationality: 'IND',
    passportNumber: 'P1234567',
    scannedAt: new Date(Date.now() - 1000 * 60 * 38),
    officerId: 'officer-1',
    officerName: 'Inspector A. Sharma',
    checkpointId: 'CP-0042',
    checkpointName: 'Munabao Rail Checkpoint',
    riskScore: 86,
    riskLevel: 'critical',
    factors: [],
    ocrFields: [],
    faceConfidence: 0.41,
    livenessPassed: false,
    tamperRegions: [],
    hasTampering: true,
    verificationMessage: '',
    approved: false,
    decision: 'deny',
    decisionAt: new Date(Date.now() - 1000 * 60 * 30),
    decisionReason: 'MRZ alteration and face mismatch confirmed with live subject.',
    processingMs: 3900,
  },
  {
    id: 'scan-hist-2',
    scanNumber: 'VD-91C4D2E5',
    documentType: 'driving-license',
    documentTitle: 'Driving License',
    travelerName: 'Priya Patel',
    nationality: 'IND',
    passportNumber: 'DL8877665',
    scannedAt: new Date(Date.now() - 1000 * 60 * 90),
    officerId: 'officer-2',
    officerName: 'Inspector R. Chauhan',
    checkpointId: 'CP-0019',
    checkpointName: 'Banbasa Border Post',
    riskScore: 14,
    riskLevel: 'low',
    factors: [],
    ocrFields: [],
    faceConfidence: 0.97,
    livenessPassed: true,
    tamperRegions: [],
    hasTampering: false,
    verificationMessage: '',
    approved: true,
    decision: 'approve',
    decisionAt: new Date(Date.now() - 1000 * 60 * 82),
    processingMs: 2100,
  },
  {
    id: 'scan-hist-3',
    scanNumber: 'VD-77A9E0B1',
    documentType: 'visa',
    documentTitle: 'Visa',
    travelerName: 'Chen Wei',
    nationality: 'CHN',
    passportNumber: 'E99887766',
    scannedAt: new Date(Date.now() - 1000 * 60 * 150),
    officerId: 'officer-1',
    officerName: 'Inspector A. Sharma',
    checkpointId: 'CP-0042',
    checkpointName: 'Munabao Rail Checkpoint',
    riskScore: 67,
    riskLevel: 'high',
    factors: [],
    ocrFields: [],
    faceConfidence: 0.55,
    livenessPassed: true,
    tamperRegions: [],
    hasTampering: true,
    verificationMessage: '',
    approved: null,
    decision: 'escalate',
    decisionAt: new Date(Date.now() - 1000 * 60 * 144),
    decisionReason: 'Visa sticker transfer suspected; referred to forensic lab.',
    processingMs: 3400,
  },
]

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as AppState
      return {
        ...parsed,
        scans: parsed.scans ?? fallbackScans,
        audit: parsed.audit ?? [],
      }
    }
  } catch {
    /* ignore */
  }
  return { currentUser: null, scans: fallbackScans, audit: [] }
}

let state: AppState = loadState()

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    /* ignore */
  }
}

export function getUsers(): User[] {
  return USERS
}

export function loginUser(userId: string): User | null {
  const user = USERS.find((u) => u.id === userId) ?? null
  if (user) {
    state = { ...state, currentUser: user }
    persist()
  }
  return user
}

export function logoutUser() {
  state = { ...state, currentUser: null }
  persist()
}

export function getState(): AppState {
  return state
}

export function addScan(scan: ScanReport) {
  state = { ...state, scans: [scan, ...state.scans], lastScanId: scan.id }
  persist()
}

export function dismissLastScan() {
  state = { ...state, lastScanId: null }
  persist()
}

export function recordDecision(scan: ScanReport, decision: DecisionType, reason?: string) {
  const now = new Date()
  let nextScan = scan
  const prevDecision = scan.decision
  if (
    scan.decision !== decision ||
    scan.decisionReason !== reason ||
    scan.approved === null
  ) {
    nextScan = {
      ...scan,
      decision,
      decisionAt: now,
      decisionReason: reason,
      approved: decision === 'approve' || decision === 'override',
    }
    const auditEntry: AuditEntry = {
      id: `aud-${Math.random().toString(36).slice(2, 9)}`,
      scanId: scan.id,
      scanNumber: scan.scanNumber,
      travelerName: scan.travelerName,
      action: decision,
      officerId: (state.currentUser ?? { id: 'unknown' })!.id,
      officerName: (state.currentUser ?? { name: 'unknown' })!.name,
      checkpointId: scan.checkpointId,
      timestamp: now,
      reason,
      previousRiskScore: scan.riskScore,
      previousDecision: prevDecision,
    }
    state = {
      ...state,
      scans: state.scans.map((s) => (s.id === scan.id ? nextScan : s)),
      audit: [auditEntry, ...state.audit],
    }
    persist()
  }
  return nextScan
}

export function resetState() {
  localStorage.removeItem(STORAGE_KEY)
  state = { currentUser: null, scans: fallbackScans, audit: [] }
  persist()
}
