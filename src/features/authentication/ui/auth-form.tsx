'use client';
import { useEffect, useId, useRef, useState } from 'react';
import { useTranslate } from '@tolgee/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { useSignInMutation, useSignUpMutation } from '../api/auth-api';
import {
  createAuthSchema,
  getAuthError,
  type TAuthMode,
  type TAuthValues,
} from '../model/auth-validation';

interface IAuthFormProps {
  mode: TAuthMode;
  onModeChange: (mode: TAuthMode, email?: string, registered?: boolean) => void;
  onSuccess: () => void;
  initialEmail: string;
  registered: boolean;
}
export function AuthForm({
  mode,
  onModeChange,
  onSuccess,
  initialEmail,
  registered,
}: IAuthFormProps) {
  const { t } = useTranslate();
  const id = useId();
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const [showPassword, setShowPassword] = useState(false);
  const [twoFactor, setTwoFactor] = useState(false);
  const [recovery, setRecovery] = useState(false);
  const [signIn] = useSignInMutation();
  const [signUp] = useSignUpMutation();
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<TAuthValues>({
    resolver: zodResolver(createAuthSchema(mode)),
    defaultValues: {
      email: initialEmail,
      password: '',
      confirmPassword: '',
      twoFactorCode: '',
      twoFactorRecoveryCode: '',
    },
  });
  async function submit(values: TAuthValues) {
    clearErrors('root');
    try {
      if (mode === 'signUp') {
        await signUp({
          email: values.email,
          password: values.password,
        }).unwrap();
        if (mounted.current) onModeChange('signIn', values.email, true);
      } else {
        if (
          twoFactor &&
          !(
            recovery ? values.twoFactorRecoveryCode : values.twoFactorCode
          ).trim()
        ) {
          setError(
            recovery ? 'twoFactorRecoveryCode' : 'twoFactorCode',
            { message: 'auth.codeRequired' },
            { shouldFocus: true },
          );
          return;
        }
        await signIn({
          email: values.email,
          password: values.password,
          ...(twoFactor && !recovery
            ? { twoFactorCode: values.twoFactorCode.trim() }
            : {}),
          ...(twoFactor && recovery
            ? { twoFactorRecoveryCode: values.twoFactorRecoveryCode.trim() }
            : {}),
        }).unwrap();
        if (mounted.current) onSuccess();
      }
    } catch (error: unknown) {
      if (!mounted.current) return;
      const key = getAuthError(error);
      if (key === 'auth.error.twoFactor') setTwoFactor(true);
      setError('root', { message: key });
    }
  }
  const fields = [
    {
      name: 'email',
      type: 'email',
      autoComplete: 'email',
      label: 'auth.email',
    },
    {
      name: 'password',
      type: showPassword ? 'text' : 'password',
      autoComplete: mode === 'signUp' ? 'new-password' : 'current-password',
      label: 'auth.password',
    },
    ...(mode === 'signUp'
      ? [
          {
            name: 'confirmPassword' as const,
            type: showPassword ? 'text' : 'password',
            autoComplete: 'new-password',
            label: 'auth.confirmPassword',
          },
        ]
      : []),
    ...(twoFactor
      ? [
          {
            name: recovery
              ? ('twoFactorRecoveryCode' as const)
              : ('twoFactorCode' as const),
            type: 'text',
            autoComplete: 'one-time-code',
            label: recovery ? 'auth.recoveryCode' : 'auth.twoFactorCode',
          },
        ]
      : []),
  ] satisfies {
    name: keyof TAuthValues;
    type: string;
    autoComplete: string;
    label: string;
  }[];
  return (
    <form
      noValidate
      onSubmit={(event) => {
        void handleSubmit(submit)(event);
      }}
      className="space-y-4"
      aria-busy={isSubmitting}
    >
      {registered && (
        <p role="status" className="text-sm">
          {t('auth.registered')}
        </p>
      )}
      <fieldset disabled={isSubmitting} className="space-y-4">
        {fields.map((field) => (
          <div key={field.name} className="space-y-2">
            <label htmlFor={id + field.name} className="text-sm font-medium">
              {t(field.label)}
            </label>
            <Input
              {...register(field.name)}
              id={id + field.name}
              type={field.type}
              autoComplete={field.autoComplete}
              required
              aria-invalid={Boolean(errors[field.name])}
              aria-describedby={
                errors[field.name]
                  ? id + field.name + '-error'
                  : field.name === 'password' && mode === 'signUp'
                    ? id + '-hint'
                    : undefined
              }
            />
            {errors[field.name]?.message && (
              <p
                id={id + field.name + '-error'}
                role="alert"
                className="text-sm text-destructive"
              >
                {t(errors[field.name]?.message ?? '')}
              </p>
            )}
          </div>
        ))}
        {mode === 'signUp' && (
          <p id={id + '-hint'} className="text-xs text-muted-foreground">
            {t('auth.passwordRequirements')}
          </p>
        )}
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={showPassword}
            onChange={(event) => setShowPassword(event.target.checked)}
          />
          {t('auth.showPassword')}
        </label>
        {twoFactor && (
          <Button
            type="button"
            variant="link"
            onClick={() => setRecovery(!recovery)}
          >
            {t(recovery ? 'auth.useAuthenticator' : 'auth.useRecovery')}
          </Button>
        )}
        {errors.root?.message && (
          <p role="alert" className="text-sm text-destructive">
            {t(errors.root.message)}
          </p>
        )}
        <Button type="submit" className="w-full">
          {t(isSubmitting ? 'auth.submitting' : 'account.' + mode)}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          {t(mode === 'signIn' ? 'auth.noAccount' : 'auth.hasAccount')}{' '}
          <Button
            type="button"
            variant="link"
            className="h-auto p-0"
            onClick={() =>
              onModeChange(
                mode === 'signIn' ? 'signUp' : 'signIn',
                getValues('email'),
              )
            }
          >
            {t(mode === 'signIn' ? 'account.signUp' : 'account.signIn')}
          </Button>
        </p>
      </fieldset>
    </form>
  );
}
