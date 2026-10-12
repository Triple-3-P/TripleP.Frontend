import type { ReactNode } from 'react';

import { I18nProvider } from '@/shared/lib/i18n/i18n-provider';
import { getRequestLocale } from '@/shared/lib/i18n/request-locale';
import { StoreProvider } from '@/store';

import '@/shared/styles/globals.css';

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const locale = await getRequestLocale();
  return (
    <html lang={locale}>
      <body>
        <I18nProvider locale={locale}>
          <StoreProvider>{children}</StoreProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
