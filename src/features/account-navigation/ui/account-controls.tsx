'use client';

import { useTranslate } from '@tolgee/react';
import { Bell, UserRound } from 'lucide-react';
import Link from 'next/link';
import { useId } from 'react';

import { Button } from '@/shared/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar';
import { Skeleton } from '@/shared/ui/skeleton';

import type { AccountNavigation } from '../model/account-navigation';
import styles from './account-controls.module.css';

function AccountLink({
  href,
  label,
  primary = false,
  unavailableId,
}: {
  href: string | undefined;
  label: string;
  primary?: boolean;
  unavailableId: string;
}) {
  const { t } = useTranslate();
  const className = primary ? styles.signUp : styles.signIn;

  if (href) {
    return (
      <Button
        asChild
        className={className}
        variant={primary ? 'default' : 'outline'}
      >
        <Link href={href}>{label}</Link>
      </Button>
    );
  }

  return (
    <span title={t('account.unavailable')}>
      <Button
        type="button"
        className={className}
        variant={primary ? 'default' : 'outline'}
        disabled
        aria-describedby={unavailableId}
      >
        {label}
      </Button>
    </span>
  );
}

export function AccountControls({ account }: { account: AccountNavigation }) {
  const { t } = useTranslate();
  const unavailableId = useId();

  if (account.status === 'loading') {
    return (
      <div className={styles.controls} role="status">
        <Skeleton className={styles.placeholder} aria-hidden="true" />
        <Skeleton className={styles.placeholder} aria-hidden="true" />
        <span className="sr-only">{t('account.loading')}</span>
      </div>
    );
  }

  if (account.status === 'signed-out') {
    return (
      <div
        className={styles.controls}
        aria-label={t('account.label')}
        role="group"
      >
        <span className="sr-only" id={unavailableId}>
          {t('account.unavailable')}
        </span>
        <AccountLink
          href={account.signInHref}
          label={t('account.signIn')}
          unavailableId={unavailableId}
        />
        <AccountLink
          href={account.signUpHref}
          label={t('account.signUp')}
          primary
          unavailableId={unavailableId}
        />
      </div>
    );
  }

  const initials = account.displayName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')
    .toLocaleUpperCase();

  return (
    <div
      className={styles.controls}
      aria-label={t('account.label')}
      role="group"
    >
      <Button
        asChild
        variant="ghost"
        size="icon"
        className={styles.notificationButton}
      >
        <Link
          href={account.notificationsHref}
          aria-label={t(
            account.hasUnreadNotifications
              ? 'account.unreadNotifications'
              : 'account.notifications',
          )}
        >
          <Bell size={18} aria-hidden="true" />
          {account.hasUnreadNotifications && (
            <span className={styles.unreadDot} aria-hidden="true" />
          )}
        </Link>
      </Button>
      <Button
        asChild
        variant="ghost"
        size="icon"
        className={styles.profileButton}
      >
        <Link
          href={account.profileHref}
          aria-label={t('account.profile', { name: account.displayName })}
        >
          <Avatar className={styles.avatar}>
            {account.avatarUrl && (
              <AvatarImage src={account.avatarUrl} alt="" />
            )}
            <AvatarFallback>
              {initials || <UserRound size={18} aria-hidden="true" />}
            </AvatarFallback>
          </Avatar>
        </Link>
      </Button>
    </div>
  );
}
