import type { IWithChild } from '@/shared/utils/props';

import { I18nProvider } from '@/shared/lib/i18n/i18n-provider';
import { getRequestLocale } from '@/shared/lib/i18n/request-locale';
import { StoreProvider } from '@/store';
import { Toaster } from '@/shared/ui/sonner';
import { getServerAccount } from '@/features/authentication/server';

import '@/shared/styles/globals.css';

interface IRootLayoutProps extends IWithChild {}

export default async function RootLayout({ children }: IRootLayoutProps) {
  const [locale, initialAccount] = await Promise.all([
    getRequestLocale(),
    getServerAccount(),
  ]);
  return (
    <html lang={locale}>
      <body>
        <I18nProvider locale={locale}>
          <StoreProvider initialAccount={initialAccount}>
            {children}
          </StoreProvider>
          <Toaster />
        </I18nProvider>
      </body>
    </html>
  );
}
