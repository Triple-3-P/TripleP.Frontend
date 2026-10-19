'use client';
import { useTranslate } from '@tolgee/react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/shared/ui/accordion';
import { SectionHeading } from './section-heading';
import styles from './landing-page.module.css';

const questionColumns = [
  [0, 1, 2],
  [3, 4, 5],
] as const;

export function FaqSection() {
  const { t } = useTranslate();
  return (
    <section className={styles.section} id="faq" aria-labelledby="faq-title">
      <SectionHeading section="faq" />
      <Accordion type="multiple" className={styles.faqGrid}>
        {questionColumns.map((questions, column) => (
          <div className={styles.faqColumn} key={column}>
            {questions.map((index) => (
              <AccordionItem key={index} value={`faq-${index}`}>
                <AccordionTrigger>
                  {t(`faq.items.${index}.question`)}
                </AccordionTrigger>
                <AccordionContent>
                  <p>{t(`faq.items.${index}.answer`)}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </div>
        ))}
      </Accordion>
    </section>
  );
}
