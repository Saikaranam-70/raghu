// src/utils/helpers.js

export function getPctStatus(pct) {
  if (pct === null || pct === undefined) return 'unknown'
  if (pct >= 75) return 'ok'
  if (pct >= 60) return 'warn'
  return 'danger'
}

export function getPctColor(pct) {
  const s = getPctStatus(pct)
  return s === 'ok' ? '#10b981' : s === 'warn' ? '#f59e0b' : '#ef4444'
}

export function getTabClass(pct) {
  const s = getPctStatus(pct)
  return s === 'warn' ? 't-warn' : s === 'danger' ? 't-danger' : ''
}

export function calcSkipOrNeed(attended, total, cpd = 7) {
  if (!attended || !total) return null
  const x = Math.ceil((0.75 * total - attended) / 0.25)
  if (x <= 0) {
    const canSkip = Math.floor((attended - 0.75 * total) / 0.75)
    return { type: 'skip', count: Math.max(canSkip, 0), days: Math.ceil(Math.max(canSkip, 0) / cpd) }
  }
  return { type: 'need', count: x, days: Math.ceil(x / cpd) }
}

// Generate synthetic absent dates + lecture history for visual display
// (Replace with real date data if your sheet contains dates)
export function generateHistory(attended, total) {
  if (!attended || !total || total === 0) return { absent: [], history: [] }
  const history = []
  const absent  = []
  const absentNeeded = total - attended
  const MONTHS = ['Jun','Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar']

  let absentCount = 0
  const stride = absentNeeded > 0 ? Math.floor(total / absentNeeded) : total + 1

  for (let i = 0; i < total; i++) {
    if (absentCount < absentNeeded && i % stride === stride - 1) {
      history.push('absent')
      const monthIdx = Math.min(Math.floor((i / total) * MONTHS.length), MONTHS.length - 1)
      const day = (i % 28) + 1
      absent.push(`${day} ${MONTHS[monthIdx]}`)
      absentCount++
    } else {
      history.push('present')
    }
  }
  return { absent, history }
}

export const SUBJECT_NAMES = {
  'UHV':    'Universal Human Values',
  'DLACC':  'DL & CO',
  'ADSA':   'Data Structures & Algo',
  'JAVA':   'Java Programming',
  'FOSS L': 'FOSS Lab',
  'DMAG':   'Digital Marketing',
  'PP':     'Professional Practice',
  'NPTEL':  'NPTEL Course',
  'CRT':    'Communication & Reasoning',
}

export function getSubjectFullName(code) {
  return SUBJECT_NAMES[code] || code
}
