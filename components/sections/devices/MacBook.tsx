import styles from './devices.module.css'
import AppContent from './AppContent'

export default function MacBook() {
  return (
    <div className={styles.macbook}>
      <div className={styles.macLid}>
        <div className={styles.macCam} />
        <div className={styles.macScreen}>
          <AppContent scale={0.88} />
        </div>
      </div>
      <div className={styles.macHinge} />
      <div className={styles.macBase}>
        <div className={styles.macTrackpad} />
      </div>
    </div>
  )
}
