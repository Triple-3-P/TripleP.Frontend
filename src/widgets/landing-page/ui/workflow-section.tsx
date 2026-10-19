'use client';
import { useTranslate } from '@tolgee/react';
import { ArrowUpRight } from 'lucide-react';
import { SectionHeading } from './section-heading';
import styles from './landing-page.module.css';

const workflowIndexes = [0, 1, 2] as const;

export function WorkflowSection() {
  const { t } = useTranslate();
  return (
    <section
      className={styles.section}
      id="workflow"
      aria-labelledby="workflow-title"
    >
      <SectionHeading section="workflow" />
      <div className={styles.workflowGrid}>
        {workflowIndexes.map((index) => (
          <div key={index} className={styles.workflowStep}>
            <span>{t(`workflow.steps.${index}.number`)}</span>
            <div>
              <h3>{t(`workflow.steps.${index}.title`)}</h3>
              <p>{t(`workflow.steps.${index}.description`)}</p>
            </div>
            <ArrowUpRight size={18} />
          </div>
        ))}
      </div>
    </section>
  );
}
