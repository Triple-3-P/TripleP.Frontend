'use client';
import { useState } from 'react';
import type { Ref } from 'react';
import Link from 'next/link';
import { useTranslate } from '@tolgee/react';
import { LogOut, Settings, UserRound } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/shared/ui/button';
import { UserAvatar } from '@/shared/ui/user-avatar';
import { Separator } from '@/shared/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover';
import { useSignOutMutation } from '../api/auth-api';

interface IAccountPopoverProps {
  email: string;
  triggerRef: Ref<HTMLButtonElement>;
}
export function AccountPopover({ email, triggerRef }: IAccountPopoverProps) {
  const { t } = useTranslate();
  const [open, setOpen] = useState(false);
  const [signOut, { isLoading }] = useSignOutMutation();
  async function logout() {
    try {
      await signOut().unwrap();
      setOpen(false);
      toast.success(t('account.signedOut'));
    } catch {
      toast.error(t('account.signOutFailed'));
    }
  }
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          ref={triggerRef}
          variant="ghost"
          size="icon"
          className="rounded-full"
          aria-label={t('account.menu')}
        >
          <UserAvatar displayName={email} className="size-9 rounded-full" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="max-w-[calc(100vw-2rem)] space-y-3"
        aria-label={t('account.menu')}
      >
        <div className="flex min-w-0 items-center gap-3">
          <UserAvatar
            displayName={email}
            className="size-10 shrink-0 rounded-full"
          />
          <p className="min-w-0 break-all text-sm">{email}</p>
        </div>
        <Separator />
        <div className="flex flex-col gap-1">
          <Button asChild variant="ghost" className="justify-start">
            <Link href="/profile" onClick={() => setOpen(false)}>
              <UserRound aria-hidden="true" />
              {t('account.profileLink')}
            </Link>
          </Button>
          <Button asChild variant="ghost" className="justify-start">
            <Link href="/settings" onClick={() => setOpen(false)}>
              <Settings aria-hidden="true" />
              {t('account.settings')}
            </Link>
          </Button>
          <Separator />
          <Button
            type="button"
            variant="ghost"
            className="justify-start"
            disabled={isLoading}
            onClick={() => {
              void logout();
            }}
          >
            <LogOut aria-hidden="true" />
            {t(isLoading ? 'account.signingOut' : 'account.signOut')}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
