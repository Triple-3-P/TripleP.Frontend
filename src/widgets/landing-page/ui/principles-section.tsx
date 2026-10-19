'use client';
import { useTranslate } from '@tolgee/react';
import { ScanEye, Shapes, UsersRound, Compass } from 'lucide-react';
import { Card } from '@/shared/ui/card';
import { SectionHeading } from './section-heading';
import styles from './landing-page.module.css';

const principleIcons = [ScanEye, Shapes, UsersRound, Compass] as const;

export function PrinciplesSection() {
  const { t } = useTranslate();
  return (
    <section className={styles.section} aria-labelledby="principles-title">
      <SectionHeading section="principles" />
      <div className={styles.principleGrid}>
        {principleIcons.map((Icon, index) => (
          <Card key={index} className={styles.principleCard}>
            <Icon size={35} strokeWidth={1} />
            <h3>{t(`principles.items.${index}.title`)}</h3>
            <p>{t(`principles.items.${index}.description`)}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}
