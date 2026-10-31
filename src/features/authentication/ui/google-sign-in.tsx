'use client';

import { useTranslate } from '@tolgee/react';
import { Button } from '@/shared/ui/button';
import { FieldSeparator } from '@/shared/ui/field';

export function GoogleSignIn() {
  const { t } = useTranslate();

  return (
    <div className="min-w-0 space-y-3">
      <FieldSeparator className="my-0">{t('auth.or')}</FieldSeparator>
      <Button type="button" variant="outline" className="w-full">
        {t('auth.google')}
      </Button>
    </div>
  );
}
