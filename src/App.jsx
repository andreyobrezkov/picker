import { useState, useCallback, useEffect } from 'react'
import Wheel from './components/Wheel.jsx'
import SegmentList from './components/SegmentList.jsx'
import WinnerModal from './components/WinnerModal.jsx'
import Settings from './components/Settings.jsx'
import { DEFAULT_PICKER_NAME, parseSegments } from './utils/parseSegments.js'
import defaultSegments from './utils/defaultSegments.js'
import { DEFAULT_SPIN_SPEED } from './utils/spinSpeeds.js'
import { themeById, DEFAULT_THEME } from './utils/themes.js'
import styles from './App.module.css'

const PICKER_STATE_STORAGE_KEY = 'picker:state'
const LEGACY_SEGMENTS_STORAGE_KEY = 'picker:segments'
const LEGACY_PICKER_NAME_STORAGE_KEY = 'picker:name'

function normalizeStoredSegments(parsed) {
  if (!Array.isArray(parsed)) {
    return null
  }

  const segments = parsed
    .filter(item => typeof item?.label === 'string' && item.label.trim())
    .map((item, index) => ({
      id: typeof item.id === 'string' && item.id.trim() ? item.id : `stored-${index}`,
      label: item.label.trim(),
      subtitle: typeof item.subtitle === 'string' ? item.subtitle.trim() : '',
      color: typeof item.color === 'string' && item.color.trim() ? item.color.trim() : null,
      icon: typeof item.icon === 'string' && item.icon.trim() ? item.icon.trim() : null,
      emoji: typeof item.emoji === 'string' && item.emoji.trim() ? item.emoji.trim() : null,
      weight: typeof item.weight === 'number' && item.weight > 0 ? item.weight : 1,
      enabled: typeof item.enabled === 'boolean' ? item.enabled : true,
    }))

  return segments.length > 0 ? segments : null
}

function normalizeStoredPickerName(value) {
  if (typeof value !== 'string') {
    return DEFAULT_PICKER_NAME
  }

  const trimmed = value.trim()
  return trimmed || DEFAULT_PICKER_NAME
}

function normalizeStoredSpinSpeed(value) {
  return value === 'slow' || value === 'normal' || value === 'fast'
    ? value
    : DEFAULT_SPIN_SPEED
}

function loadStoredState() {
  const raw = window.localStorage.getItem(PICKER_STATE_STORAGE_KEY)
  if (raw != null) {
    try {
      const parsed = JSON.parse(raw)
      const segments = normalizeStoredSegments(parsed?.segments)
      if (segments) {
        return {
          segments,
          pickerName: normalizeStoredPickerName(parsed?.picker_name),
          removeAfterWin: typeof parsed?.remove_after_win === 'boolean' ? parsed.remove_after_win : false,
          spinSpeed: normalizeStoredSpinSpeed(parsed?.spin_speed),
        }
      }
    } catch {
      // Fall through to defaults and legacy keys
    }
  }

  let legacySegments = null
  const legacySegmentsRaw = window.localStorage.getItem(LEGACY_SEGMENTS_STORAGE_KEY)
  if (legacySegmentsRaw != null) {
    try {
      legacySegments = normalizeStoredSegments(JSON.parse(legacySegmentsRaw))
    } catch {
      legacySegments = null
    }
  }

  return {
    segments: legacySegments ?? defaultSegments,
    pickerName: normalizeStoredPickerName(window.localStorage.getItem(LEGACY_PICKER_NAME_STORAGE_KEY)),
    removeAfterWin: false,
    spinSpeed: DEFAULT_SPIN_SPEED,
  }
}

function applyTheme(segments, themeId) {
  const palette = themeById[themeId]?.colors ?? themeById[DEFAULT_THEME].colors
  return segments.map((seg, i) => ({
    ...seg,
    color: seg.color ?? palette[i % palette.length],
  }))
}

export default function App() {
  const [storedState] = useState(loadStoredState)
  const [page, setPage] = useState('spin')
  const [segments, setSegments] = useState(storedState.segments)
  const [pickerName, setPickerName] = useState(storedState.pickerName)
  const [themeId, setThemeId] = useState(DEFAULT_THEME)
  const [spinSpeed, setSpinSpeed] = useState(storedState.spinSpeed)
  const [spinRequestId, setSpinRequestId] = useState(0)
  const [removeAfterWin, setRemoveAfterWin] = useState(storedState.removeAfterWin)
  const [winner, setWinner] = useState(null)
  const [error, setError] = useState(null)
  const [dragging, setDragging] = useState(false)

  // Resolve theme colours — JSON colour wins when present, theme fills the rest
  const resolvedSegments = applyTheme(segments, themeId)
  const activeSegments = resolvedSegments.filter(s => s.enabled)

  useEffect(() => {
    window.localStorage.setItem(PICKER_STATE_STORAGE_KEY, JSON.stringify({
      picker_name: pickerName,
      remove_after_win: removeAfterWin,
      spin_speed: spinSpeed,
      segments,
    }))
  }, [pickerName, removeAfterWin, spinSpeed, segments])

  const handleFile = useCallback(async (file) => {
    if (!file) return
    setError(null)
    try {
      const parsed = await parseSegments(file)
      setSegments(parsed.segments)
      setPickerName(parsed.pickerName)
      setRemoveAfterWin(parsed.removeAfterWin)
      setSpinSpeed(parsed.spinSpeed)
    } catch (e) {
      setError(e.message)
    }
  }, [])

  const handleUpload = (e) => handleFile(e.target.files[0])

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    handleFile(e.dataTransfer.files[0])
  }

  const handleAdd = useCallback((data) => {
    setSegments(prev => [...prev, {
      ...data,
      id: crypto.randomUUID(),
      emoji: null,
      enabled: true,
    }])
  }, [])

  const handleUpdate = useCallback((id, data) => {
    setSegments(prev => prev.map(seg => (
      seg.id === id
        ? {
            ...seg,
            ...data,
          }
        : seg
    )))
  }, [])

  const handleDelete = useCallback((id) => {
    setSegments(prev => prev.filter(s => s.id !== id))
  }, [])

  const handleToggleEnabled = useCallback((id) => {
    setSegments(prev => prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s))
  }, [])

  const handleResult = useCallback((seg) => {
    setWinner(seg)
    if (removeAfterWin) {
      setSegments(prev => prev.map(s => s.id === seg.id ? { ...s, enabled: false } : s))
    }
  }, [removeAfterWin])

  const handleCloseWinner = useCallback(() => {
    setWinner(null)
  }, [])

  const handleSpinAgain = useCallback(() => {
    setWinner(null)
    setSpinRequestId(prev => prev + 1)
  }, [])

  const downloadExample = () => {
    const payload = {
      picker_name: pickerName,
      remove_after_win: removeAfterWin,
      spin_speed: spinSpeed,
      segments: segments.map(({ label, subtitle, color, icon, emoji, weight, enabled }) => ({
        label,
        subtitle,
        color,
        icon,
        emoji,
        weight,
        enabled,
      })),
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const safeName = (pickerName || DEFAULT_PICKER_NAME)
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'picker'
    a.download = `${safeName}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <span className={styles.brand}>{pickerName}</span>
        <nav className={styles.nav}>
          {['spin', 'settings'].map(p => (
            <button
              key={p}
              className={page === p ? styles.navActive : styles.navLink}
              onClick={() => setPage(p)}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </nav>
      </header>

      <main
        className={styles.main}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        {dragging && <div className={styles.dropOverlay}>Drop JSON to load segments</div>}

        {error && (
          <div className={styles.errorBanner}>
            <span>{error}</span>
            <button onClick={() => setError(null)}>✕</button>
          </div>
        )}

        {page === 'settings' ? (
          <Settings
            selectedTheme={themeId}
            onSelectTheme={setThemeId}
            spinSpeed={spinSpeed}
            onSpinSpeedChange={setSpinSpeed}
          />
        ) : (
          <div className={styles.grid}>
            <div className={styles.wheelCol}>
              <Wheel
                segments={activeSegments}
                onResult={handleResult}
                spinSpeed={spinSpeed}
                spinRequestId={spinRequestId}
              />
              <div className={styles.tagline}>
                <h1 className={styles.taglineHead}>Spin to Decide</h1>
                <p className={styles.taglineBody}>
                  Names, tasks, options — anything goes. Upload a JSON file or edit the list, then spin.
                </p>
              </div>
            </div>

            <div className={styles.configCol}>
              <SegmentList
                segments={resolvedSegments}
                removeAfterWin={removeAfterWin}
                onToggleRemoveAfterWin={() => setRemoveAfterWin(v => !v)}
                onDelete={handleDelete}
                onUpdate={handleUpdate}
                onToggleEnabled={handleToggleEnabled}
                onUpload={handleUpload}
                onDownloadExample={downloadExample}
                onAdd={handleAdd}
              />
            </div>
          </div>
        )}
      </main>

      <WinnerModal winner={winner} onClose={handleCloseWinner} onSpinAgain={handleSpinAgain} />
    </div>
  )
}
