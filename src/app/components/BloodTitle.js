"use client";
import { useEffect, useRef } from 'react';
import styles from './BloodTitle.module.css';

export default function BloodTitle({ text }) {
  const titleRef = useRef(null);

  useEffect(() => {
    // Animation setup logic could be added here if needed
  }, []);

  return (
    <div className={styles.titleContainer}>
      <h1 ref={titleRef} className={styles.bloodTitle}>
        {text}
      </h1>
      <div className={styles.bloodDrip1}></div>
      <div className={styles.bloodDrip2}></div>
      <div className={styles.bloodDrip3}></div>
      <div className={styles.bloodDrip4}></div>
      <div className={styles.bloodDrip5}></div>
    </div>
  );
}
