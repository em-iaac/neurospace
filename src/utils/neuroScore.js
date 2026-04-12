/**
 * NeuroScore utility — scoring logic and research content for NeuroSpace
 * Based on neuroarchitecture research by Dr. Cleo Valentine (cleovalentine.io)
 */

// ─────────────────────────────────────────────────────────────────
// Internal helpers — shared by calculateNeuroScore & getParameterContributions
// ─────────────────────────────────────────────────────────────────

function _normParams(params) {
  const wallCount = params['Wall Count'] ?? 4
  const curvature = params['Wall Curvature'] ?? 0.8
  const height    = params['Height'] ?? 5
  const biophilic = params['Biophilic Organic Form'] ?? 0
  const openings  = params['Opening Count'] ?? 2
  const openSize  = params['Opening Size'] ?? 5
  const plants    = params['Potted Plants'] ?? 0

  return {
    heightN:     (height - 2) / 13,
    wallCountN:  (wallCount - 3) / 5,
    curvatureN:  (curvature - 0.7) / 0.25,
    biophilicN:  biophilic / 100,
    openingsN:   (openings - 1) / 9,
    openSizeN:   (openSize - 5) / 25,
    plantsN:     Math.min(plants / 5, 1),
  }
}

function _dimScores(n) {
  return {
    heightScore:    n.heightN,
    curveScore:     n.curvatureN * 0.6 + n.wallCountN * 0.4,
    daylightScore:  n.openingsN * 0.4 + n.openSizeN * 0.6,
    biophilicScore: Math.max(0, 1 - Math.abs(n.biophilicN - 0.4) * 1.5), // optimal ~0.4
    plantScore:     n.plantsN,
  }
}

// ─────────────────────────────────────────────────────────────────
// Score calculation
// ─────────────────────────────────────────────────────────────────

export function calculateNeuroScore(params) {
  const d = _dimScores(_normParams(params))
  const raw = (
    d.heightScore    * 0.22 +  // Ceiling height → cognitive freedom
    d.curveScore     * 0.25 +  // Wall curvature → visual stress reduction
    d.daylightScore  * 0.22 +  // Natural light → wellbeing
    d.biophilicScore * 0.18 +  // Biophilic form → neuroinflammation
    d.plantScore     * 0.13    // Potted plants → attention restoration
  )
  return Math.round(Math.max(0, Math.min(1, raw)) * 100)
}

// ─────────────────────────────────────────────────────────────────
// Score labelling
// ─────────────────────────────────────────────────────────────────

export function getScoreLabel(score) {
  if (score <= 30) return { label: 'High Stress Potential',    color: '#C50000', bg: '#fff0f0' }
  if (score <= 55) return { label: 'Moderate Stress Potential', color: '#888888', bg: '#f5f5f5' }
  if (score <= 75) return { label: 'Calming',                   color: '#4A7C59', bg: '#eef5f1' }
  return                  { label: 'Restorative',               color: '#2D6A4F', bg: '#e6f4ee' }
}

// ─────────────────────────────────────────────────────────────────
// Per-dimension contributions (for donut chart)
// Returns values in 0–100 range representing each dimension's earned score
// ─────────────────────────────────────────────────────────────────

export function getParameterContributions(params) {
  const d = _dimScores(_normParams(params))
  return {
    'Ceiling Height': Math.round(d.heightScore    * 0.22 * 100),  // display name kept
    'Wall Quality':   Math.round(d.curveScore     * 0.25 * 100),
    'Natural Light':  Math.round(d.daylightScore  * 0.22 * 100),
    'Biophilic Form': Math.round(d.biophilicScore * 0.18 * 100),
    'Potted Plants':  Math.round(d.plantScore     * 0.13 * 100),
  }
}

// Max possible contribution per dimension (for chart reference)
export const contributionMaxima = {
  'Ceiling Height': 22,
  'Wall Quality':   25,
  'Natural Light':  22,
  'Biophilic Form': 18,
  'Potted Plants':  13,
}

// ─────────────────────────────────────────────────────────────────
// Dimension metadata — drives Scoring tab + hypothesis cards
// ─────────────────────────────────────────────────────────────────

export const dimensionMeta = {
  'Ceiling Height': {
    contributorKeys:   ['Height'],
    contributorLabels: ['Ceiling Height'],
    maxPts: 22,
    tagline: 'Cortisol regulation & cognitive mode',
    consequence: 'Affects whether occupants enter abstract or constrained cognitive states.',
    rules: [
      { range: '< 2.4m', outcome: 'Containment stress — elevated cortisol',       risk: 'high' },
      { range: '2.4–4m', outcome: 'Moderate constraint — limited cognitive range', risk: 'moderate' },
      { range: '> 4m',   outcome: 'Abstract thinking mode — reduced stress',       risk: 'low' },
    ],
    hypothesis(params) {
      const h = params['Height'] ?? 5
      if (h < 2.4) return `At ${h}m, ceiling height may trigger containment stress and elevated cortisol.`
      if (h < 4)   return `At ${h}m, ceiling height is below the threshold for abstract thinking mode.`
      return `At ${h}m, ceiling height supports abstract thinking and reduced cortisol markers.`
    },
  },
  'Wall Quality': {
    contributorKeys:   ['Wall Curvature', 'Wall Count'],
    contributorLabels: ['Wall Curvature', 'Wall Count'],
    maxPts: 25,
    tagline: 'Visual cortex load & threat response',
    consequence: 'Angular and low-facet surfaces increase activation in visual stress pathways.',
    rules: [
      { range: 'Low curvature', outcome: 'Angular forms → visual cortex overload',  risk: 'high' },
      { range: 'Mid curvature', outcome: 'Reduced threat-response activation',       risk: 'moderate' },
      { range: 'High curvature', outcome: 'Smooth surfaces → minimal visual stress', risk: 'low' },
    ],
    hypothesis(params) {
      const c = params['Wall Curvature'] ?? 0.8
      const n = params['Wall Count'] ?? 4
      if (c < 0.75 && n <= 4) return `Low curvature (${c}) and few facets (${n}) may activate visual stress responses.`
      if (c >= 0.85) return `High curvature (${c}) suppresses neural stress signals in the visual system.`
      return `Moderate curvature (${c}) with ${n} facets presents a reduced visual stress risk.`
    },
  },
  'Natural Light': {
    contributorKeys:   ['Opening Count', 'Opening Size'],
    contributorLabels: ['Opening Count', 'Opening Size'],
    maxPts: 22,
    tagline: 'Circadian rhythm & psychological wellbeing',
    consequence: 'Daylight access is the strongest predictor of occupant psychological wellbeing.',
    rules: [
      { range: 'Few / small',   outcome: 'Circadian disruption — artificial light dependence', risk: 'high' },
      { range: 'Moderate',      outcome: 'Partial daylight benefit',                           risk: 'moderate' },
      { range: 'Multiple / large', outcome: 'Full circadian support — reduced eye strain',     risk: 'low' },
    ],
    hypothesis(params) {
      const n = params['Opening Count'] ?? 3
      const s = params['Opening Size'] ?? 15
      if (n <= 2 && s < 12) return `Low daylight access (${n} openings, size ${s}) may disrupt circadian rhythms.`
      if (n >= 6 || s >= 22) return `Strong daylight access (${n} openings, size ${s}) supports circadian health.`
      return `Moderate daylight access (${n} openings, size ${s}) provides partial circadian benefit.`
    },
  },
  'Biophilic Form': {
    contributorKeys:   ['Biophilic Organic Form'],
    contributorLabels: ['Biomorphic Form'],
    maxPts: 18,
    tagline: 'Neuroinflammation & visual coherence',
    consequence: 'Biomorphic geometry reduces neuroinflammation markers, but coherence drops if excessive.',
    rules: [
      { range: '0–20%',  outcome: 'Rectilinear — neuroinflammation benefit absent', risk: 'moderate' },
      { range: '30–50%', outcome: 'Optimal range — reduced inflammation markers',   risk: 'low' },
      { range: '> 60%',  outcome: 'Excessive complexity — visual coherence loss',   risk: 'moderate' },
    ],
    hypothesis(params) {
      const b = params['Biophilic Organic Form'] ?? 0
      if (b < 20) return `At ${b}%, the geometry is largely rectilinear — the neuroinflammation benefit of biomorphic form is not activated.`
      if (b >= 30 && b <= 55) return `At ${b}%, biomorphic form is in its most restorative range — linked to reduced neuroinflammation markers.`
      return `At ${b}%, organic complexity is high — visual coherence may be reduced, increasing cognitive load.`
    },
  },
  'Potted Plants': {
    contributorKeys:   [],
    contributorLabels: ['Greenery (placed in scene)'],
    maxPts: 13,
    tagline: 'Attention restoration & cortisol reduction',
    consequence: 'Even visual access to vegetation measurably activates parasympathetic responses.',
    rules: [
      { range: '0 plants',   outcome: 'No biophilic benefit from vegetation',                risk: 'moderate' },
      { range: '1–2 plants', outcome: 'Partial cortisol reduction',                          risk: 'low' },
      { range: '3–5 plants', outcome: 'Parasympathetic activation — full restorative benefit', risk: 'low' },
    ],
    hypothesis(params) {
      const p = params['Potted Plants'] ?? 0
      if (p === 0) return `No plants placed — the cortisol-reducing and attention-restoring effects of vegetation are absent.`
      if (p <= 2) return `${p} plant${p > 1 ? 's' : ''} placed — beginning to activate parasympathetic responses and cortisol reduction.`
      return `${p} plants placed — strong biophilic presence supports attention restoration and reduced stress markers.`
    },
  },
}

// ─────────────────────────────────────────────────────────────────
// Research content per GH parameter key
// ─────────────────────────────────────────────────────────────────

export const paramInfo = {
  'Wall Count': {
    label: 'Wall Count',
    group: 'Surface Quality',
    min: 3, max: 8, step: 1, defaultValue: 4,
    text: 'More wall facets approach a curved surface. Smoother, less angular forms lower cognitive load and reduce neural stress signals. Sharp corners and angular geometries are associated with threat-response patterns in the visual system.',
    source: 'Valentine, C. — Visual Stress in Architectural Façades',
  },
  'Wall Curvature': {
    label: 'Wall Curvature',
    group: 'Surface Quality',
    min: 0.70, max: 0.95, step: 0.01, defaultValue: 0.8,
    text: 'Angular architectural forms activate threat-response areas of the brain. Curved walls are linked to reduced visual stress signals. Research demonstrates measurable differences in cortisol response between angular and curved environments.',
    source: 'Valentine, C. — Visual Stress in Architectural Façades',
  },
  'Height': {
    label: 'Ceiling Height',
    group: 'Spatial Form',
    min: 2, max: 15, step: 1, defaultValue: 5,
    text: 'Higher ceilings are linked to abstract thinking and reduced cortisol. Spaces below 2.4m can trigger feelings of containment and elevate stress markers. Ceiling height directly modulates cognitive mode and emotional state.',
    source: 'Valentine, C. — Architectural Neuroimmunology',
  },
  'Biophilic Organic Form': {
    label: 'Biomorphic Form',
    group: 'Biophilic & Biomorphic',
    min: 0, max: 100, step: 1, defaultValue: 0,
    text: 'Biomorphic (nature-inspired) geometry is associated with reduced neuroinflammation markers — distinct from biophilic elements like plants or water. A pilot study found measurable immune response differences in biomorphic vs. rectilinear spaces. Score peaks near 40% — excessive organic complexity can reduce visual coherence and become fatiguing.',
    source: 'Valentine, C. — Biophilic Design & Neuroinflammation Pilot Study',
  },
  'Opening Count': {
    label: 'Opening Count',
    group: 'Natural Light',
    min: 1, max: 10, step: 1, defaultValue: 3,
    text: 'Multiple window openings distribute natural light and provide varied views across the space. Access to daylight and exterior views is one of the strongest predictors of psychological wellbeing in built environments.',
    source: 'Valentine, C. — Spatial Variables & Neurophysiological Stress',
  },
  'Opening Size': {
    label: 'Opening Size',
    group: 'Natural Light',
    min: 5, max: 30, step: 1, defaultValue: 15,
    text: 'Window-to-wall ratio directly affects daylight penetration, circadian rhythm regulation, and eye strain. Larger openings support the body\'s natural light cycle and reduce dependence on artificial lighting.',
    source: 'Valentine, C. — Spatial Variables & Neurophysiological Stress',
  },
}

// ─────────────────────────────────────────────────────────────────
// Grouped parameter order for the UI
// ─────────────────────────────────────────────────────────────────

export const paramGroups = [
  { name: 'Spatial Form',    keys: ['Height'] },
  { name: 'Surface Quality', keys: ['Wall Curvature', 'Wall Count'] },
  { name: 'Natural Light',   keys: ['Opening Count', 'Opening Size'] },
  { name: 'Biophilic & Biomorphic', keys: ['Biophilic Organic Form'] },
]
