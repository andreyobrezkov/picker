import { DEFAULT_SPIN_SPEED, SPIN_SPEED_OPTIONS } from './spinSpeeds.js'

let _id = 1000
const id = () => String(_id++)

const DEFAULT_PICKER_NAME = 'Picker'
const VALID_SPIN_SPEEDS = new Set(SPIN_SPEED_OPTIONS.map(option => option.id))

function normalizeRootConfig(raw) {
  if (Array.isArray(raw)) {
    return {
      pickerName: DEFAULT_PICKER_NAME,
      removeAfterWin: false,
      spinSpeed: DEFAULT_SPIN_SPEED,
      segments: raw,
    }
  }

  if (!raw || typeof raw !== 'object') {
    throw new Error('JSON must be an array of segments, or an object with a "segments" array.')
  }

  const segments = raw.segments
  if (!Array.isArray(segments)) {
    throw new Error('JSON root object must include a "segments" array.')
  }

  if ('picker_name' in raw && (typeof raw.picker_name !== 'string' || !raw.picker_name.trim())) {
    throw new Error('"picker_name" must be a non-empty string when provided.')
  }

  if ('remove_after_win' in raw && typeof raw.remove_after_win !== 'boolean') {
    throw new Error('"remove_after_win" must be a boolean when provided.')
  }

  if ('spin_speed' in raw && !VALID_SPIN_SPEEDS.has(raw.spin_speed)) {
    throw new Error(`"spin_speed" must be one of: ${Array.from(VALID_SPIN_SPEEDS).join(', ')}.`)
  }

  return {
    pickerName: typeof raw.picker_name === 'string' ? raw.picker_name.trim() : DEFAULT_PICKER_NAME,
    removeAfterWin: typeof raw.remove_after_win === 'boolean' ? raw.remove_after_win : false,
    spinSpeed: typeof raw.spin_speed === 'string' ? raw.spin_speed : DEFAULT_SPIN_SPEED,
    segments,
  }
}

export { DEFAULT_PICKER_NAME }

export async function parseSegments(file) {
  const text = await file.text()
  let raw
  try {
    raw = JSON.parse(text)
  } catch {
    throw new Error('Invalid JSON — could not parse the file.')
  }

  const parsed = normalizeRootConfig(raw)
  if (parsed.segments.length === 0) {
    throw new Error('JSON must include at least one segment.')
  }

  return {
    ...parsed,
    segments: parsed.segments.map((item, i) => {
      if (typeof item.label !== 'string' || !item.label.trim()) {
        throw new Error(`Segment ${i + 1} is missing a "label" string.`)
      }
      const color = typeof item.color === 'string' && item.color.trim() ? item.color.trim() : null
      return {
        id: id(),
        label: item.label.trim(),
        subtitle: typeof item.subtitle === 'string' ? item.subtitle.trim() : '',
        color,
        icon: typeof item.icon === 'string' && item.icon.trim() ? item.icon.trim() : null,
        emoji: typeof item.emoji === 'string' && item.emoji.trim() ? item.emoji.trim() : null,
        weight: typeof item.weight === 'number' && item.weight > 0 ? item.weight : 1,
        enabled: typeof item.enabled === 'boolean' ? item.enabled : true,
      }
    }),
  }
}
