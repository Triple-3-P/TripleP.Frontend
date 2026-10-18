'use client';

import { useTranslate } from '@tolgee/react';
import { Bell, UserRound } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useId, useState } from 'react';

import { Button } from '@/shared/ui/button';

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
  const [failedAvatarUrl, setFailedAvatarUrl] = useState<string>();

  if (account.status === 'loading') {
    return (
      <div className={styles.controls} role="status">
        <span className={styles.placeholder} aria-hidden="true" />
        <span className={styles.placeholder} aria-hidden="true" />
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
  const avatarSrc =
    account.avatarUrl && failedAvatarUrl !== account.avatarUrl
      ? account.avatarUrl
      : undefined;

  return (
    <div
      className={styles.controls}
      aria-label={t('account.label')}
      role="group"
    >
      <Link
        className={styles.notificationButton}
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
      <Link
        className={styles.avatar}
        href={account.profileHref}
        aria-label={t('account.profile', { name: account.displayName })}
      >
        {avatarSrc ? (
          <Image
            src={avatarSrc}
            alt=""
            width={32}
            height={32}
            unoptimized
            onError={() => setFailedAvatarUrl(avatarSrc)}
          />
        ) : (
          initials || <UserRound size={18} aria-hidden="true" />
        )}
      </Link>
    </div>
  );
}
