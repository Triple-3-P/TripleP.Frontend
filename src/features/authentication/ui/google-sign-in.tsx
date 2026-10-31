'use client';

import { useTranslate } from '@tolgee/react';
import Image from 'next/image';
import { Button } from '@/shared/ui/button';
import { FieldSeparator } from '@/shared/ui/field';

export function GoogleSignIn() {
  const { t } = useTranslate();

  return (
    <div className="min-w-0 space-y-3">
      <FieldSeparator className="my-0">{t('auth.or')}</FieldSeparator>
      <Button type="button" variant="outline" className="w-full">
        <span
          aria-hidden="true"
          className="relative size-5 shrink-0 overflow-hidden"
        >
          <Image
            src="/images/google-sign-in.png"
            alt=""
            width={40}
            height={40}
            unoptimized
            className="absolute -top-2.5 -left-2.5 max-w-none"
          />
        </span>
        {t('auth.google')}
      </Button>
    </div>
  );
}
