'use client';
import { useTranslate } from '@tolgee/react';
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Focus,
  Layers3,
  UsersRound,
} from 'lucide-react';
import Image from 'next/image';
import type { ReactNode } from 'react';
import { ProductPreview } from './product-preview';
import styles from './landing-page.module.css';

const pillarIcons = [Focus, Layers3, UsersRound, ArrowUpRight] as const;

interface IHeroSectionProps {
  heroAccount: ReactNode;
}

export function HeroSection({ heroAccount }: IHeroSectionProps) {
  const { t } = useTranslate();
  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <div className={styles.heroCopy}>
        <span className={styles.eyebrow}>
          <span />
          {t('hero.eyebrow')}
        </span>
        <h1 id="hero-title">{t('hero.title')}</h1>
        <p className={styles.heroDescription}>{t('hero.description')}</p>
        {heroAccount}
        <div className={styles.heroExplore}>
          <a href="#workflow">
            {t('hero.action')}
            <ArrowRight size={15} />
          </a>
          <a href="#benefits">
            {t('hero.secondary')}
            <ArrowDown size={14} />
          </a>
        </div>
        <p className={styles.heroNote}>
          <span />
          {t('hero.note')}
        </p>
      </div>
      <figure className={styles.heroFigure}>
        <div className={styles.heroScene}>
          <Image
            src="/images/mountain-backdrop.webp"
            alt=""
            fill
            priority
            sizes="(max-width: 1100px) 100vw, 1064px"
            className={styles.backdrop}
          />
          <div className={styles.sceneShade} />
          <div className={styles.heroPreview}>
            <ProductPreview />
          </div>
        </div>
        <figcaption>{t('preview.caption')}</figcaption>
      </figure>
      <div className={styles.pillars}>
        {pillarIcons.map((Icon, index) => (
          <div key={index}>
            <h3>
              <Icon size={15} />
              {t(`pillars.${index}.title`)}
            </h3>
            <p>{t(`pillars.${index}.description`)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
