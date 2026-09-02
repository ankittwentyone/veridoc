import type { DocumentType } from '@/types/domain'

function svgToDataUrl(svg: string): string {
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

interface DocLayout {
  header: string
  subheader: string
  numberLabel: string
  number: string
  name: string
  nationality: string
  dob: string
  valid: string
  accent: string
  chip: string
}

const LAYOUTS: Record<DocumentType, DocLayout> = {
  passport: {
    header: 'INDIAN PASSPORT',
    subheader: 'REPUBLIC OF INDIA · PASSPORT',
    numberLabel: 'Passport No.',
    number: 'P1234567',
    name: 'Mohammed Iqbal',
    nationality: 'INDIAN',
    dob: '15/03/1992',
    valid: '19/08/2031',
    accent: '#2563eb',
    chip: '30',
  },
  visa: {
    header: 'VISA',
    subheader: 'ENTRY VISA · SINGLE JOURNEY',
    numberLabel: 'Visa No.',
    number: 'V99887766',
    name: 'Chen Wei',
    nationality: 'CHINA',
    dob: '22/01/1995',
    valid: '31/12/2026',
    accent: '#7c3aed',
    chip: '45',
  },
  'national-id': {
    header: 'NATIONAL ID',
    subheader: 'AADHAAR · UNIQUE IDENTIFICATION',
    numberLabel: 'Aadhaar No.',
    number: 'A5647382910',
    name: 'Priya Patel',
    nationality: 'INDIAN',
    dob: '02/09/1988',
    valid: 'LIFETIME',
    accent: '#b45309',
    chip: '38',
  },
  'driving-license': {
    header: 'DRIVING LICENSE',
    subheader: 'INDIA · MOTOR VEHICLES ACT 1988',
    numberLabel: 'License No.',
    number: 'DL-04-1995-8877665',
    name: 'Priya Patel',
    nationality: 'INDIAN',
    dob: '02/09/1988',
    valid: '17/06/2042',
    accent: '#0891b2',
    chip: '22',
  },
  permit: {
    header: 'BORDER PASS',
    subheader: 'PERMIT · INTERNATIONAL / DOMESTIC',
    numberLabel: 'Permit No.',
    number: 'PRM-2024-88912',
    name: 'Arun Kumar',
    nationality: 'INDIAN',
    dob: '30/11/1985',
    valid: '14/04/2027',
    accent: '#15803d',
    chip: '38',
  },
}

export function sampleDocumentImage(type: DocumentType): string {
  const l = LAYOUTS[type]
  const holo =
    type === 'passport'
      ? `<circle cx="300" cy="170" r="46" fill="none" stroke="${l.accent}" stroke-opacity="0.35" stroke-width="2"/>`
      : ''
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="320" viewBox="0 0 480 320">
  <rect width="480" height="320" fill="#f8fafc"/>
  <rect width="480" height="320" fill="url(#g)" opacity="0.55"/>
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#e2e8f0"/><stop offset="1" stop-color="#f1f5f9"/>
    </linearGradient>
    <radialGradient id="bg" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="${l.accent}"/><stop offset="1" stop-color="#0f172a"/>
    </radialGradient>
  </defs>
  <rect x="10" y="10" width="46" height="300" fill="url(#bg)"/>
  <text x="33" y="160" fill="#ffffff" font-family="Arial, sans-serif" font-size="13" font-weight="bold" transform="rotate(-90 33 160)" letter-spacing="4">INDIA</text>
  <rect x="60" y="18" width="410" height="284" rx="8" fill="#ffffff" stroke="${l.accent}" stroke-opacity="0.4" stroke-width="1.5"/>
  <text x="80" y="48" fill="${l.accent}" font-family="Arial, sans-serif" font-size="20" font-weight="bold" letter-spacing="2">${esc(l.header)}</text>
  <text x="80" y="66" fill="#334155" font-family="Arial, sans-serif" font-size="10" letter-spacing="1">${esc(l.subheader)}</text>
  ${holo}
  <rect x="360" y="70" width="86" height="110" rx="4" fill="#e2e8f0"/>
  <text x="403" y="130" fill="#64748b" font-family="Arial, sans-serif" font-size="22" font-weight="bold">MLL</text>
  <text x="403" y="150" fill="#cbd5e1" font-family="Arial, sans-serif" font-size="8" text-anchor="middle">PHOTO</text>
  <text x="80" y="112" fill="#475569" font-family="Arial, sans-serif" font-size="10">${esc(l.numberLabel)}</text>
  <text x="80" y="132" fill="#0f172a" font-family="Arial, sans-serif" font-size="18" font-weight="bold" letter-spacing="1">${esc(l.number)}</text>
  <text x="80" y="164" fill="#475569" font-family="Arial, sans-serif" font-size="10">NAME</text>
  <text x="80" y="184" fill="#0f172a" font-family="Arial, sans-serif" font-size="16" font-weight="bold">${esc(l.name)}</text>
  <text x="80" y="212" fill="#475569" font-family="Arial, sans-serif" font-size="10">NATIONALITY</text>
  <text x="80" y="230" fill="#0f172a" font-family="Arial, sans-serif" font-size="13" font-weight="bold">${esc(l.nationality)}</text>
  <text x="210" y="212" fill="#475569" font-family="Arial, sans-serif" font-size="10">DATE OF BIRTH</text>
  <text x="210" y="230" fill="#0f172a" font-family="Arial, sans-serif" font-size="13" font-weight="bold">${esc(l.dob)}</text>
  <text x="80" y="258" fill="#475569" font-family="Arial, sans-serif" font-size="10">VALID UNTIL</text>
  <text x="80" y="276" fill="#0f172a" font-family="Arial, sans-serif" font-size="13" font-weight="bold">${esc(l.valid)}</text>
  <text x="220" y="258" fill="#475569" font-family="Arial, sans-serif" font-size="10">CHIP</text>
  <text x="220" y="276" fill="#0f172a" font-family="Arial, sans-serif" font-size="13" font-weight="bold">IC-${esc(l.chip)}</text>
  <rect x="62" y="288" width="94" height="9" rx="2" fill="url(#g)"/>
  <text x="70" y="295" fill="#334155" font-family="monospace" font-size="7" letter-spacing="1">${esc(l.number)}&lt;&lt;${esc(l.nationality)}</text>
  <text x="180" y="295" fill="#475569" font-family="monospace" font-size="7" letter-spacing="1">MRZ SIMULATED</text>
</svg>`
  return svgToDataUrl(svg)
}

export function sampleFaceImage(name: string): string {
  const initials = name
    .split(' ')
    .map((n) => (n[0] ?? '').toUpperCase())
    .slice(0, 2)
    .join('')
  const hue = (initials.charCodeAt(0) * 37 + (initials.charCodeAt(1) ?? 0) * 13) % 360
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 240 240">
  <defs>
    <radialGradient id="bg" cx="0.5" cy="0.4" r="0.7">
      <stop offset="0" stop-color="hsl(${hue} 55% 72%)"/>
      <stop offset="1" stop-color="hsl(${hue} 45% 55%)"/>
    </radialGradient>
  </defs>
  <rect width="240" height="240" fill="hsl(${hue} 40% 42%)"/>
  <circle cx="120" cy="118" r="86" fill="url(#bg)"/>
  <ellipse cx="120" cy="150" rx="52" ry="58" fill="hsl(${hue} 45% 60%)"/>
  <ellipse cx="120" cy="120" rx="40" ry="34" fill="hsl(${hue} 35% 70%)"/>
  <g transform="translate(120 130)">
    <path d="M-8 0 Q0 -22 8 0 Z" fill="#0f172a"/>
    <path d="M-8 2 Q0 -16 8 2" fill="none" stroke="#94a3b8" stroke-width="1"/>
  </g>
  <circle cx="104" cy="120" r="3" fill="#0f172a"/>
  <circle cx="136" cy="120" r="3" fill="#0f172a"/>
  <path d="M108 150 Q120 158 132 150" fill="none" stroke="#7c2d12" stroke-width="2.5" stroke-linecap="round"/>
  <text x="120" y="218" text-anchor="middle" fill="#ffffff" font-family="Arial, sans-serif" font-size="28" font-weight="bold" letter-spacing="3">${esc(initials)}</text>
</svg>`
  return svgToDataUrl(svg)
}

export function documentTypeSample(type: DocumentType) {
  return { imageUrl: sampleDocumentImage(type), faceUrl: sampleFaceImage(LAYOUTS[type].name) }
}