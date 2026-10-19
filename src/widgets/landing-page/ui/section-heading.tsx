'use client';
import { useTranslate } from '@tolgee/react';
import styles from './landing-page.module.css';

export function SectionHeading({
  section,
}: {
  section: 'benefits' | 'workflow' | 'features' | 'principles' | 'faq';
}) {
  const { t } = useTranslate();
  return (
    <div className={styles.sectionHeading}>
      <span className={styles.eyebrow}>
        <span />
        {t(`${section}.eyebrow`)}
      </span>
      <h2 id={`${section}-title`}>{t(`${section}.title`)}</h2>
      <p>{t(`${section}.description`)}</p>
    </div>
  );
}
