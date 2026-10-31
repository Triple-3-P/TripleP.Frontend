'use client';

import { useTranslate } from '@tolgee/react';
import { Skeleton } from '@/shared/ui/skeleton';

export function AuthControlsSkeleton() {
  const { t } = useTranslate();

  return (
    <div className="flex items-center gap-2" role="status">
      <Skeleton
        className="inline-flex h-9 shrink-0 items-center px-4 text-sm font-medium whitespace-nowrap motion-reduce:animate-none"
        aria-hidden="true"
      >
        <span className="invisible">{t('account.workspaces')}</span>
      </Skeleton>
      <Skeleton
        className="size-9 shrink-0 rounded-full motion-reduce:animate-none"
        aria-hidden="true"
      />
      <span className="sr-only">{t('account.loading')}</span>
    </div>
  );
}
