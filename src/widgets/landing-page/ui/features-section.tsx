'use client';
import { useTranslate } from '@tolgee/react';
import { Check, FolderKanban, ListTodo, UsersRound } from 'lucide-react';
import { Badge } from '@/shared/ui/badge';
import { Card, CardContent } from '@/shared/ui/card';
import { Avatar, AvatarFallback } from '@/shared/ui/avatar';
import { SectionHeading } from './section-heading';
import styles from './landing-page.module.css';

const featureIndexes = [0, 1, 2] as const;
const peopleIndexes = [0, 1, 2] as const;

export function FeaturesSection() {
  const { t } = useTranslate();
  return (
    <section
      className={styles.section}
      id="features"
      aria-labelledby="features-title"
    >
      <SectionHeading section="features" />
      <div className={styles.featureGrid}>
        {featureIndexes.map((index) => (
          <Card key={index} className={styles.featureCard}>
            <div className={styles.featureVisual}>
              <div className={styles.featureVisualTop}>
                <span />
                <span />
                <span />
                <span className={styles.visualConcept}>
                  {t('preview.label')}
                </span>
              </div>
              {index === 0 ? (
                <div className={styles.projectVisual}>
                  <FolderKanban size={28} />
                  <strong>{t('features.cards.0.sample')}</strong>
                  <span>{t('features.cards.0.detail')}</span>
                  <div>
                    <i />
                    <i />
                    <i />
                  </div>
                </div>
              ) : index === 1 ? (
                <div className={styles.taskVisual}>
                  <span>
                    <ListTodo size={14} />
                    {t('preview.inProgress')}
                  </span>
                  <strong>{t('features.cards.1.sample')}</strong>
                  <Badge variant="secondary" className={styles.taskTag}>
                    {t('preview.design')}
                  </Badge>
                  <div>
                    <span className={styles.taskCheck}>
                      <Check size={10} />
                    </span>
                    <span>{t('features.cards.1.detail')}</span>
                  </div>
                </div>
              ) : (
                <div className={styles.peopleVisual}>
                  <div>
                    {peopleIndexes.map((person) => (
                      <Avatar key={person}>
                        <AvatarFallback>
                          <UsersRound size={26} />
                        </AvatarFallback>
                      </Avatar>
                    ))}
                  </div>
                  <strong>{t('features.cards.2.sample')}</strong>
                  <span>{t('features.cards.2.detail')}</span>
                </div>
              )}
            </div>
            <CardContent className={styles.featureCopy}>
              <span className={styles.eyebrow}>
                <span />
                {t(`features.cards.${index}.badge`)}
              </span>
              <h3>{t(`features.cards.${index}.title`)}</h3>
              <p>{t(`features.cards.${index}.description`)}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
