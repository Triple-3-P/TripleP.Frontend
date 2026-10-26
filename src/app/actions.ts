'use server';

import { cookies } from 'next/headers';

import { isLocale } from '@/shared/config/i18n';

export async function changeLocale(value: string): Promise<void> {
  if (!isLocale(value)) return;

  const cookieStore = await cookies();
  cookieStore.set('triplep-locale', value, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
  });
}
