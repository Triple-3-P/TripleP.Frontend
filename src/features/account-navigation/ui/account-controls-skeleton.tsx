'use client';
import { useTranslate } from '@tolgee/react';
import { Skeleton } from '@/shared/ui/skeleton';
import styles from './account-controls.module.css';

export function AccountControlsSkeleton() {
  const { t } = useTranslate();
  return (
    <div className={styles.controls} role="status">
      <Skeleton className={styles.placeholder} aria-hidden="true" />
      <Skeleton className={styles.placeholder} aria-hidden="true" />
      <span className="sr-only">{t('account.loading')}</span>
    </div>
  );
}
