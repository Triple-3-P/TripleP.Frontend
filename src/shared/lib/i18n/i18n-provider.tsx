'use client';

import { TolgeeProvider, useTolgeeSSR } from '@tolgee/react';
import { useState } from 'react';
import type { IWithChild } from '@/shared/utils/props';

import { translationCatalogs } from '@/shared/config/i18n';
import type { TLocale } from '@/shared/config/i18n';

import { createTolgee } from './tolgee';

interface ITranslationProviderProps extends IWithChild {
  locale: TLocale;
}

export function I18nProvider({ children, locale }: ITranslationProviderProps) {
  const [tolgee] = useState(() => createTolgee().init({ language: locale }));
  const ssrTolgee = useTolgeeSSR(tolgee, locale, translationCatalogs);

  return <TolgeeProvider tolgee={ssrTolgee}>{children}</TolgeeProvider>;
}
