import styles from './WinnerModal.module.css'

export default function WinnerModal({ winner, onClose }) {
  if (!winner) return null

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div
        className={styles.card}
        style={{ '--accent': winner.color }}
        onClick={e => e.stopPropagation()}
      >
        {winner.icon ? (
          <div className={styles.avatarWrap}>
            <img src={winner.icon} alt={winner.label} className={styles.avatarImg} />
          </div>
        ) : (
          <div className={styles.iconWrap}>
            <span className={styles.iconEmoji}>{winner.emoji ?? '🎉'}</span>
          </div>
        )}
        <p className={styles.eyebrow}>And the winner is…</p>
        <h2 className={styles.label}>{winner.label}</h2>
        {winner.subtitle && <p className={styles.subtitle}>{winner.subtitle}</p>}
        <div className={styles.colorBar} />
        <button className={styles.btn} onClick={onClose}>Spin again</button>
      </div>
    </div>
  )
}
