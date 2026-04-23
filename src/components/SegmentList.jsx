import { useState, useRef } from 'react'
import styles from './SegmentList.module.css'

const EMPTY = { label: '', subtitle: '', icon: '', useColor: false, customColor: '#b51c00', weight: 1 }

export default function SegmentList({
  segments, removeAfterWin, onToggleRemoveAfterWin,
  onDelete, onToggleEnabled, onUpload, onDownloadExample, onAdd,
}) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [error, setError] = useState('')
  const labelRef = useRef(null)

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  const openForm = () => {
    setShowForm(true)
    setError('')
    setTimeout(() => labelRef.current?.focus(), 50)
  }

  const cancel = () => { setForm(EMPTY); setShowForm(false); setError('') }
  const sortedSegments = [...segments].sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: 'base' }))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.label.trim()) { setError('Name is required.'); return }
    onAdd({
      label: form.label.trim(),
      subtitle: form.subtitle.trim(),
      icon: form.icon.trim() || null,
      color: form.useColor ? form.customColor : null,
      weight: Math.max(0.1, parseFloat(form.weight) || 1),
    })
    setForm(EMPTY)
    setShowForm(false)
    setError('')
  }

  return (
    <section className={styles.panel}>
      {/* Header */}
      <div className={styles.header}>
        <h2 className={styles.title}>Configuration</h2>
        <label className={styles.uploadBtn}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          Upload JSON
          <input type="file" accept=".json,application/json" onChange={onUpload} style={{ display: 'none' }} />
        </label>
      </div>

      {/* Remove-after-win toggle */}
      <div className={styles.removeToggleRow}>
        <div className={styles.removeToggleInfo}>
          <span className={styles.removeToggleLabel}>Remove after win</span>
          <span className={styles.removeToggleDesc}>Disable a segment once it's picked</span>
        </div>
        <button
          role="switch" aria-checked={removeAfterWin}
          className={`${styles.toggle} ${removeAfterWin ? styles.toggleOn : ''}`}
          onClick={onToggleRemoveAfterWin}
        >
          <span className={styles.toggleThumb} />
        </button>
      </div>

      <p className={styles.sectionLabel}>Current segments</p>

      {/* Segment list */}
      <ul className={styles.list}>
        {sortedSegments.map((seg) => (
          <li key={seg.id} className={`${styles.item} ${!seg.enabled ? styles.itemDisabled : ''}`}>
            {seg.icon ? (
              <div className={styles.avatarWrap} style={{ opacity: seg.enabled ? 1 : 0.4 }}>
                <img src={seg.icon} alt="" className={styles.avatarImg} />
              </div>
            ) : (
              <div className={styles.iconBox} style={{ background: seg.enabled ? seg.color : '#ccc' }}>
                <span className={styles.iconEmoji}>{seg.emoji ?? seg.label[0]}</span>
              </div>
            )}
            <div className={styles.info}>
              <span className={styles.label}>{seg.label}</span>
              {seg.subtitle && <span className={styles.subtitle}>{seg.subtitle}</span>}
            </div>
            <div className={styles.actions}>
              <button
                role="switch" aria-checked={seg.enabled}
                className={`${styles.toggle} ${seg.enabled ? styles.toggleOn : ''}`}
                onClick={() => onToggleEnabled(seg.id)}
                title={seg.enabled ? 'Disable segment' : 'Enable segment'}
              >
                <span className={styles.toggleThumb} />
              </button>
              <button className={styles.deleteBtn} onClick={() => onDelete(seg.id)} title="Delete segment">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                  <path d="M10 11v6M14 11v6"/>
                  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                </svg>
              </button>
            </div>
          </li>
        ))}
      </ul>

      {/* Add segment — button or inline form */}
      {showForm ? (
        <form className={styles.addForm} onSubmit={handleSubmit} noValidate>
          <p className={styles.addFormTitle}>New segment</p>

          {error && <p className={styles.addError}>{error}</p>}

          <div className={styles.field}>
            <label className={styles.fieldLabel}>Name <span className={styles.required}>*</span></label>
            <input
              ref={labelRef}
              className={styles.input}
              value={form.label}
              onChange={e => set('label', e.target.value)}
              placeholder="e.g. Alice, Review PR, Yoga"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel}>Subtitle <span className={styles.optional}>optional</span></label>
            <input
              className={styles.input}
              value={form.subtitle}
              onChange={e => set('subtitle', e.target.value)}
              placeholder="e.g. Engineering, Morning"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel}>Photo URL <span className={styles.optional}>optional</span></label>
            <input
              className={styles.input}
              type="url"
              value={form.icon}
              onChange={e => set('icon', e.target.value)}
              placeholder="https://example.com/photo.jpg"
            />
          </div>

          <div className={styles.fieldRow}>
            <div className={styles.field} style={{ flex: 1 }}>
              <label className={styles.fieldLabel}>Color</label>
              <div className={styles.colorRow}>
                <button
                  type="button"
                  className={`${styles.colorChip} ${!form.useColor ? styles.colorChipActive : ''}`}
                  onClick={() => set('useColor', false)}
                >
                  Theme
                </button>
                <button
                  type="button"
                  className={`${styles.colorChip} ${form.useColor ? styles.colorChipActive : ''}`}
                  onClick={() => set('useColor', true)}
                >
                  Custom
                </button>
                {form.useColor && (
                  <label className={styles.colorPickerWrap}>
                    <span className={styles.colorSwatch} style={{ background: form.customColor }} />
                    <input
                      type="color"
                      className={styles.colorPicker}
                      value={form.customColor}
                      onChange={e => set('customColor', e.target.value)}
                    />
                  </label>
                )}
              </div>
            </div>

            <div className={styles.field} style={{ width: 76 }}>
              <label className={styles.fieldLabel}>Weight</label>
              <input
                className={styles.input}
                type="number"
                min="0.1"
                step="0.1"
                value={form.weight}
                onChange={e => set('weight', e.target.value)}
              />
            </div>
          </div>

          <div className={styles.addFormActions}>
            <button type="button" className={styles.cancelBtn} onClick={cancel}>Cancel</button>
            <button type="submit" className={styles.submitBtn}>Add segment</button>
          </div>
        </form>
      ) : (
        <button className={styles.addBtn} onClick={openForm}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add Segment
        </button>
      )}

      {/* Footer */}
      <button className={styles.exampleBtn} onClick={onDownloadExample}>
        Download current JSON
      </button>
    </section>
  )
}
