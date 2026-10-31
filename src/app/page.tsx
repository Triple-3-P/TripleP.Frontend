import type { Metadata } from 'next';

import { AuthControls } from '@/features/authentication';
import { getRequestLocale } from '@/shared/lib/i18n/request-locale';
import { getTranslate } from '@/shared/lib/i18n/server';
import { withProps } from '@/shared/utils/with-props';
import { LandingPage } from '@/widgets/landing-page';

import { changeLocale } from './actions';

const HeroAccountControls = withProps(AuthControls, {
  placement: 'hero',
});

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
      account={<AuthControls />}
      heroAccount={<HeroAccountControls />}
    />
  );
}
