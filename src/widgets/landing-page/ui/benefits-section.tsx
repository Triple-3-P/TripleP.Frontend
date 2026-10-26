'use client';
import { useTranslate } from '@tolgee/react';
import { Check, Focus } from 'lucide-react';
import { Card } from '@/shared/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/shared/ui/accordion';
import { SectionHeading } from './section-heading';
import styles from './landing-page.module.css';

const benefitIndexes = [0, 1, 2, 3] as const;

export function BenefitsSection() {
  const { t } = useTranslate();
  return (
    <section
      className={styles.section}
      id="benefits"
      aria-labelledby="benefits-title"
    >
      <SectionHeading section="benefits" />
      <div className={styles.benefitGrid}>
        <Accordion
          type="single"
          defaultValue="benefit-0"
          collapsible
          className={styles.benefitList}
        >
          {benefitIndexes.map((index) => (
            <AccordionItem key={index} value={`benefit-${index}`}>
              <AccordionTrigger>
                {t(`benefits.items.${index}.title`)}
              </AccordionTrigger>
              <AccordionContent>
                <p>{t(`benefits.items.${index}.description`)}</p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        <div className={styles.focusArtwork}>
          <div className={styles.artworkGrid} />
          <span className={styles.artworkOrb} />
          <Card className={styles.focusCard}>
            <span className={styles.eyebrow}>
              <span />
              {t('preview.label')}
            </span>
            <span className={styles.focusTitle}>
              <Focus size={20} />
              {t('pillars.0.title')}
            </span>
            <div className={styles.focusTask}>
              <span className={styles.taskCheck}>
                <Check size={12} />
              </span>
              <span>{t('preview.taskFive')}</span>
            </div>
            <div className={styles.focusTask}>
              <span className={styles.taskCircle} />
              <span>{t('preview.taskOne')}</span>
            </div>
            <div className={styles.focusTask}>
              <span className={styles.taskCircle} />
              <span>{t('preview.taskTwo')}</span>
            </div>
            <div className={styles.focusProgress}>
              <i />
              <i />
              <i />
              <i />
              <i />
              <i />
              <i />
              <i />
            </div>
          </Card>
          <span className={styles.artworkCaption}>01 / TRIPLEP</span>
        </div>
      </div>
    </section>
  );
}
