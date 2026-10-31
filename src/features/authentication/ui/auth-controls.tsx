'use client';
import { useRef, useState } from 'react';
import { useTranslate } from '@tolgee/react';
import { Button } from '@/shared/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/shared/ui/dialog';
import { useAccountQuery } from '../api/auth-api';
import type { TAuthMode } from '../model/auth-validation';
import { AuthForm } from './auth-form';

interface IAuthControlsProps {
  placement?: 'header' | 'hero';
}
export function AuthControls({ placement = 'header' }: IAuthControlsProps) {
  const { t } = useTranslate();
  const { currentData, error, isLoading } = useAccountQuery(undefined, {
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });
  const account =
    error && 'status' in error && error.status === 401
      ? undefined
      : currentData;
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<TAuthMode>('signIn');
  const [email, setEmail] = useState('');
  const [registered, setRegistered] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const accountRef = useRef<HTMLParagraphElement>(null);
  const actions: TAuthMode[] =
    placement === 'hero' ? ['signUp', 'signIn'] : ['signIn', 'signUp'];
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div
        role="group"
        aria-label={t('account.label')}
        className="flex items-center gap-2"
      >
        {account && !open ? (
          <p
            ref={accountRef}
            tabIndex={-1}
            className="max-w-48 truncate text-sm"
            title={account.email}
          >
            {account.email}
          </p>
        ) : (
          actions.map((action) => (
            <DialogTrigger asChild key={action}>
              <Button
                variant={action === 'signUp' ? 'default' : 'outline'}
                disabled={isLoading}
                onClick={(event) => {
                  triggerRef.current = event.currentTarget;
                  setMode(action);
                  setEmail('');
                  setRegistered(false);
                  setSignedIn(false);
                }}
              >
                {t('account.' + action)}
              </Button>
            </DialogTrigger>
          ))
        )}
      </div>
      <DialogContent
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          (accountRef.current ?? triggerRef.current)?.focus();
        }}
        title={t(signedIn ? 'auth.successTitle' : 'account.' + mode)}
        description={t(
          signedIn ? 'auth.successDescription' : 'auth.' + mode + 'Description',
        )}
        closeLabel={t('auth.close')}
      >
        {signedIn ? (
          <p role="status">{t('auth.successDescription')}</p>
        ) : (
          <AuthForm
            key={mode}
            mode={mode}
            initialEmail={email}
            registered={registered}
            onModeChange={(nextMode, nextEmail, wasRegistered) => {
              setRegistered(wasRegistered ?? false);
              setMode(nextMode);
              setEmail(nextEmail ?? '');
            }}
            onSuccess={() => setSignedIn(true)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
