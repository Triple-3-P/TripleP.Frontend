import type { Metadata } from 'next';
import { getTranslate } from '@/shared/lib/i18n/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslate();
  return { title: t('pages.profile') };
}

export default async function Page() {
  const t = await getTranslate();
  return <main aria-label={t('pages.profile')} />;
}
