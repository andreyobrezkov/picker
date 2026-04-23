import styles from './SegmentList.module.css'

export default function SegmentList({ segments, removeAfterWin, onToggleRemoveAfterWin, onDelete, onToggleEnabled, onUpload, onDownloadExample }) {
  return (
    <section className={styles.panel}>
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

      <div className={styles.removeToggleRow}>
        <div className={styles.removeToggleInfo}>
          <span className={styles.removeToggleLabel}>Remove after win</span>
          <span className={styles.removeToggleDesc}>Disable a segment once it's picked</span>
        </div>
        <button
          role="switch"
          aria-checked={removeAfterWin}
          className={`${styles.toggle} ${removeAfterWin ? styles.toggleOn : ''}`}
          onClick={onToggleRemoveAfterWin}
        >
          <span className={styles.toggleThumb} />
        </button>
      </div>

      <p className={styles.sectionLabel}>Current segments</p>

      <ul className={styles.list}>
        {segments.map((seg) => (
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
                role="switch"
                aria-checked={seg.enabled}
                className={`${styles.toggle} ${seg.enabled ? styles.toggleOn : ''}`}
                onClick={() => onToggleEnabled(seg.id)}
                title={seg.enabled ? 'Disable segment' : 'Enable segment'}
              >
                <span className={styles.toggleThumb} />
              </button>
              <button
                className={styles.deleteBtn}
                onClick={() => onDelete(seg.id)}
                title="Delete segment"
              >
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

      <button className={styles.exampleBtn} onClick={onDownloadExample}>
        Download example JSON
      </button>

      <div className={styles.tip}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, color: 'var(--primary)' }}>
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <p className={styles.tipText}>Add names, tasks, or any options. Use the <code>icon</code> field in JSON to load photos as circular avatars.</p>
      </div>
    </section>
  )
}
