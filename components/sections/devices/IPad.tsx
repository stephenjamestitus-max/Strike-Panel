import styles from './devices.module.css'
import AppContent from './AppContent'

export default function IPad() {
  return (
    <div className={styles.ipad}>
      <div className={styles.ipadCam} />
      <div className={styles.ipadScreen}>
        <AppContent scale={0.50} />
      </div>
      <div className={styles.ipadHomeBar} />
    </div>
  )
}
