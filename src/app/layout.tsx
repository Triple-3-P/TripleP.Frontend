import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { StoreProvider } from '@/store';

import '@/shared/styles/globals.css';

export const metadata: Metadata = {
  title: 'TripleP',
  description: 'TripleP task manager',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
