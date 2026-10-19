'use client';

import { useTranslate } from '@tolgee/react';
import { Bell } from 'lucide-react';
import Link from 'next/link';
import { useId } from 'react';

import { Button } from '@/shared/ui/button';
import { UserAvatar } from '@/shared/ui/user-avatar';
import { AccountControlsSkeleton } from './account-controls-skeleton';
import { cn } from '@/shared/lib/cn';

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

const accountActions = {
  header: ['signIn', 'signUp'],
  hero: ['signUp', 'signIn'],
} as const;

export function AccountControls({
  account,
  placement = 'header',
}: {
  account: AccountNavigation;
  placement?: 'header' | 'hero';
}) {
  const { t } = useTranslate();
  const unavailableId = useId();

  if (placement === 'hero' && account.status !== 'signed-out') return null;

  if (account.status === 'loading') {
    return <AccountControlsSkeleton />;
  }

  if (account.status === 'signed-out') {
    return (
      <div
        className={cn(
          styles.controls,
          placement === 'hero' && styles.heroControls,
        )}
        aria-label={t('account.label')}
        role="group"
      >
        <span className="sr-only" id={unavailableId}>
          {t('account.unavailable')}
        </span>
        {accountActions[placement].map((action) => (
          <AccountLink
            key={action}
            href={action === 'signIn' ? account.signInHref : account.signUpHref}
            label={t(`account.${action}`)}
            primary={action === 'signUp'}
            unavailableId={unavailableId}
          />
        ))}
      </div>
    );
  }

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
          <UserAvatar
            displayName={account.displayName}
            imageUrl={account.avatarUrl}
            className={styles.avatar}
          />
        </Link>
      </Button>
    </div>
  );
}
