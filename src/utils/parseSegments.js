let _id = 1000
const id = () => String(_id++)

export async function parseSegments(file) {
  const text = await file.text()
  let raw
  try {
    raw = JSON.parse(text)
  } catch {
    throw new Error('Invalid JSON — could not parse the file.')
  }

  const arr = Array.isArray(raw) ? raw : raw?.segments
  if (!Array.isArray(arr) || arr.length === 0) {
    throw new Error('JSON must be an array of segments, or an object with a "segments" array.')
  }

  return arr.map((item, i) => {
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
      enabled: true,
    }
  })
}
