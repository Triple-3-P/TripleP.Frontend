'use client';
import { useTranslate } from '@tolgee/react';
import { ArrowUpRight, CircleCheck, Sparkles } from 'lucide-react';
import { Separator } from '@/shared/ui/separator';
import { Brand } from './landing-brand';
import styles from './landing-page.module.css';
export function LandingFooter() {
  const { t } = useTranslate();
  return (
    <footer className={styles.footer}>
      <div className={styles.footerTop}>
        <div>
          <a href="#top" aria-label="TripleP">
            <Brand small />
          </a>
          <p>{t('footer.description')}</p>
        </div>
        <div className={styles.footerLinks}>
          <span>{t('footer.product')}</span>
          <a href="#benefits">{t('footer.about')}</a>
          <a href="#workflow">{t('footer.workflow')}</a>
          <a href="#features">{t('footer.features')}</a>
          <a href="#faq">{t('footer.questions')}</a>
        </div>
        <div className={styles.footerStatus}>
          <Sparkles size={15} />
          <span>{t('footer.concept')}</span>
        </div>
      </div>
      <Separator className={styles.footerDivider} />
      <div className={styles.footerBottom}>
        <span>© {t('footer.copyright')}</span>
        <a href="#top">
          {t('footer.back')}
          <ArrowUpRight size={12} />
        </a>
        <CircleCheck size={13} aria-hidden="true" />
      </div>
    </footer>
  );
}
