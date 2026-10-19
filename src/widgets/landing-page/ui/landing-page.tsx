'use client';
import { useTranslate } from '@tolgee/react';
import type { ReactNode } from 'react';
import type { Locale } from '@/shared/config/i18n';
import { LandingHeader } from './landing-header';
import { HeroSection } from './hero-section';
import { BenefitsSection } from './benefits-section';
import { WorkflowSection } from './workflow-section';
import { FeaturesSection } from './features-section';
import { PrinciplesSection } from './principles-section';
import { FaqSection } from './faq-section';
import { ClosingSection } from './closing-section';
import { LandingFooter } from './landing-footer';
import styles from './landing-page.module.css';

export function LandingPage({
  locale,
  changeLocale,
  account,
  heroAccount,
}: {
  locale: Locale;
  changeLocale: (value: string) => Promise<void>;
  account: ReactNode;
  heroAccount: ReactNode;
}) {
  const { t } = useTranslate();

  return (
    <div className={styles.landing} id="top">
      <a className={styles.skipLink} href="#main">
        {t('navigation.skip')}
      </a>
      <LandingHeader
        locale={locale}
        changeLocale={changeLocale}
        account={account}
      />
      <main id="main">
        <HeroSection heroAccount={heroAccount} />
        <BenefitsSection />
        <WorkflowSection />
        <FeaturesSection />
        <PrinciplesSection />
        <FaqSection />
        <ClosingSection />
      </main>
      <LandingFooter />
    </div>
  );
}
