'use client';
import { useTranslate } from '@tolgee/react';
import { ArrowUpRight } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/shared/ui/button';
import { Brand } from './landing-brand';
import styles from './landing-page.module.css';

export function ClosingSection() {
  const { t } = useTranslate();
  return (
    <section className={styles.closing} aria-labelledby="closing-title">
      <div className={styles.closingCopy}>
        <span className={styles.eyebrow}>
          <span />
          {t('cta.eyebrow')}
        </span>
        <h2 id="closing-title">{t('cta.title')}</h2>
        <p>{t('cta.description')}</p>
        <Button asChild>
          <a href="#top">
            {t('cta.action')}
            <ArrowUpRight size={14} />
          </a>
        </Button>
      </div>
      <div className={styles.closingArt}>
        <Image
          src="/images/mountain-backdrop.webp"
          fill
          alt=""
          sizes="(max-width: 700px) 100vw, 530px"
          className={styles.backdrop}
        />
        <div className={styles.sceneShade} />
        <div className={styles.closingMark}>
          <Brand />
          <span>{t('footer.concept')}</span>
        </div>
      </div>
    </section>
  );
}
