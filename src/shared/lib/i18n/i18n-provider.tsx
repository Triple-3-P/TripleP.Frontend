'use client';

import { TolgeeProvider, useTolgeeSSR } from '@tolgee/react';
import { useState } from 'react';
import type { ReactNode } from 'react';

import { translationCatalogs } from '@/shared/config/i18n';
import type { Locale } from '@/shared/config/i18n';

import { createTolgee } from './tolgee';

export function I18nProvider({
  children,
  locale,
}: {
  children: ReactNode;
  locale: Locale;
}) {
  const [tolgee] = useState(() => createTolgee().init({ language: locale }));
  const ssrTolgee = useTolgeeSSR(tolgee, locale, translationCatalogs);

  return <TolgeeProvider tolgee={ssrTolgee}>{children}</TolgeeProvider>;
}
