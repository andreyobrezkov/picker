import { useState, useCallback } from 'react'
import Wheel from './components/Wheel.jsx'
import SegmentList from './components/SegmentList.jsx'
import WinnerModal from './components/WinnerModal.jsx'
import Settings from './components/Settings.jsx'
import { parseSegments } from './utils/parseSegments.js'
import defaultSegments from './utils/defaultSegments.js'
import { DEFAULT_SPIN_SPEED } from './utils/spinSpeeds.js'
import { themeById, DEFAULT_THEME } from './utils/themes.js'
import styles from './App.module.css'

const EXAMPLE_JSON = JSON.stringify([
  { label: 'Alice Chen',  subtitle: 'Engineering', icon: 'https://i.pravatar.cc/150?img=1'  },
  { label: 'Bob Torres',  subtitle: 'Product',     icon: 'https://i.pravatar.cc/150?img=12' },
  { label: 'Carol Kim',   subtitle: 'Design',      icon: 'https://i.pravatar.cc/150?img=5'  },
  { label: 'David Park',  subtitle: 'Engineering', icon: 'https://i.pravatar.cc/150?img=15', color: '#0077b6' },
  { label: 'Eve Santos',  subtitle: 'QA',          icon: 'https://i.pravatar.cc/150?img=9'  },
  { label: 'Frank Müller', subtitle: 'DevOps',     icon: 'https://i.pravatar.cc/150?img=33' },
], null, 2)

function applyTheme(segments, themeId) {
  const palette = themeById[themeId]?.colors ?? themeById[DEFAULT_THEME].colors
  return segments.map((seg, i) => ({
    ...seg,
    color: seg.color ?? palette[i % palette.length],
  }))
}

export default function App() {
  const [page, setPage] = useState('spin')
  const [segments, setSegments] = useState(defaultSegments)
  const [themeId, setThemeId] = useState(DEFAULT_THEME)
  const [spinSpeed, setSpinSpeed] = useState(DEFAULT_SPIN_SPEED)
  const [spinRequestId, setSpinRequestId] = useState(0)
  const [removeAfterWin, setRemoveAfterWin] = useState(false)
  const [winner, setWinner] = useState(null)
  const [error, setError] = useState(null)
  const [dragging, setDragging] = useState(false)

  // Resolve theme colours — JSON colour wins when present, theme fills the rest
  const resolvedSegments = applyTheme(segments, themeId)
  const activeSegments = resolvedSegments.filter(s => s.enabled)

  const handleFile = useCallback(async (file) => {
    if (!file) return
    setError(null)
    try {
      const parsed = await parseSegments(file)
      setSegments(parsed)
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
    const blob = new Blob([EXAMPLE_JSON], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'example-segments.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <span className={styles.brand}>Picker</span>
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
