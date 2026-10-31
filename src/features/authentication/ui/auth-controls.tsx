'use client';
import { useRef, useState } from 'react';
import Link from 'next/link';
import { AccountPopover } from './account-popover';
import { useTranslate } from '@tolgee/react';
import { Button } from '@/shared/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/shared/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/ui/tabs';
import { useAccountQuery } from '../api/auth-api';
import type { TAuthMode } from '../model/auth-validation';
import { AuthForm } from './auth-form';
import { GoogleSignIn } from './google-sign-in';

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
  const [busy, setBusy] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const accountRef = useRef<HTMLButtonElement>(null);
  const workspaceRef = useRef<HTMLAnchorElement>(null);
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
          <>
            <Button asChild>
              <Link ref={workspaceRef} href="/workspaces">
                {t('account.workspaces')}
              </Link>
            </Button>
            {placement === 'header' && (
              <AccountPopover email={account.email} triggerRef={accountRef} />
            )}
          </>
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
                  setBusy(false);
                }}
              >
                {t('account.' + action)}
              </Button>
            </DialogTrigger>
          ))
        )}
      </div>
      <DialogContent
        ref={contentRef}
        className="flex h-[28rem] max-h-[calc(100dvh-2rem)] min-w-0 flex-col overflow-hidden p-5 sm:max-w-md"
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          contentRef.current?.querySelector('input')?.focus();
        }}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          (
            accountRef.current ??
            workspaceRef.current ??
            triggerRef.current
          )?.focus();
        }}
        closeLabel={t('auth.close')}
      >
        <Tabs
          value={mode}
          onValueChange={(value) => {
            if (busy || (value !== 'signIn' && value !== 'signUp')) return;
            setRegistered(false);
            setMode(value);
          }}
          className="min-h-0 min-w-0 flex-1 gap-4"
        >
          <TabsList
            className="w-[calc(100%-2rem)] shrink-0"
            aria-label={t('account.label')}
          >
            <TabsTrigger
              value="signIn"
              disabled={busy}
              className="data-[state=active]:bg-black data-[state=active]:text-white dark:data-[state=active]:bg-black dark:data-[state=active]:text-white"
            >
              {t('account.signIn')}
            </TabsTrigger>
            <TabsTrigger
              value="signUp"
              disabled={busy}
              className="data-[state=active]:bg-black data-[state=active]:text-white dark:data-[state=active]:bg-black dark:data-[state=active]:text-white"
            >
              {t('account.signUp')}
            </TabsTrigger>
          </TabsList>
          <div className="min-h-0 min-w-0 flex-1 space-y-3 overflow-x-hidden overflow-y-auto">
            <DialogHeader className="sr-only">
              <DialogTitle>{t('account.' + mode)}</DialogTitle>
              <DialogDescription>
                {t('auth.' + mode + 'Description')}
              </DialogDescription>
            </DialogHeader>
            {(['signIn', 'signUp'] as const).map((tab) => (
              <TabsContent value={tab} key={tab} className="min-w-0">
                {mode === tab && (
                  <AuthForm
                    mode={tab}
                    initialEmail={email}
                    registered={registered}
                    onEmailChange={setEmail}
                    onBusyChange={setBusy}
                    onRegistered={(registeredEmail) => {
                      setRegistered(true);
                      setEmail(registeredEmail);
                      setBusy(false);
                      setMode('signIn');
                    }}
                    onSuccess={() => {
                      setBusy(false);
                      setOpen(false);
                    }}
                  />
                )}
              </TabsContent>
            ))}
            <GoogleSignIn />
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
