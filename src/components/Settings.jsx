import { themes } from '../utils/themes.js'
import styles from './Settings.module.css'

export default function Settings({ selectedTheme, onSelectTheme }) {
  return (
    <div className={styles.page}>
      <h1 className={styles.pageTitle}>Settings</h1>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Wheel Color Theme</h2>
          <p className={styles.sectionDesc}>
            Segments use the selected palette by default. Adding a <code>color</code> field to an individual segment in your JSON overrides it for that entry only.
          </p>
        </div>

        <div className={styles.grid}>
          {themes.map(theme => (
            <button
              key={theme.id}
              className={`${styles.card} ${selectedTheme === theme.id ? styles.cardActive : ''}`}
              onClick={() => onSelectTheme(theme.id)}
            >
              <div className={styles.swatches}>
                {theme.colors.slice(0, 6).map((c, i) => (
                  <span key={i} className={styles.swatch} style={{ background: c }} />
                ))}
              </div>
              <span className={styles.themeName}>{theme.name}</span>
              {selectedTheme === theme.id && (
                <span className={styles.check}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </span>
              )}
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}
