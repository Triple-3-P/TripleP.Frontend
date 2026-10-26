import { cookies } from 'next/headers';
import { cache } from 'react';

import { isLocale } from '@/shared/config/i18n';
import type { TLocale } from '@/shared/config/i18n';

export const getRequestLocale = cache(async (): Promise<TLocale> => {
  const cookieStore = await cookies();
  const value = cookieStore.get('triplep-locale')?.value;
  return isLocale(value) ? value : 'en';
});
