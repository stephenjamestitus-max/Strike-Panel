import styles from './devices.module.css'
import AppContent from './AppContent'

export default function IPhone() {
  return (
    <div className={styles.iphone}>
      <div className={[styles.btn, styles.btnSilent].join(' ')} />
      <div className={[styles.btn, styles.btnVolUp].join(' ')} />
      <div className={[styles.btn, styles.btnVolDn].join(' ')} />
      <div className={styles.btnPower} />

      <div className={styles.iphoneScreen}>
        <div className={styles.iphoneTopBar}>
          <span className={styles.statusTime}>9:41</span>
          <div className={styles.island} />
          <div className={styles.statusBatt} />
        </div>
        <div className={styles.iphoneContent}>
          <AppContent scale={0.38} />
        </div>
        <div className={styles.homeBar} />
      </div>
    </div>
  )
}
