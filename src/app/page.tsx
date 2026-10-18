import type { Metadata } from 'next';

import { AccountControls } from '@/features/account-navigation';
import { getRequestLocale } from '@/shared/lib/i18n/request-locale';
import { getTranslate } from '@/shared/lib/i18n/server';
import { LandingPage } from '@/widgets/landing-page';

import { changeLocale } from './actions';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslate();
  return { title: t('metadata.title'), description: t('metadata.description') };
}

export default async function HomePage() {
  const locale = await getRequestLocale();
  return (
    <LandingPage
      locale={locale}
      changeLocale={changeLocale}
      account={<AccountControls account={{ status: 'signed-out' }} />}
    />
  );
}
