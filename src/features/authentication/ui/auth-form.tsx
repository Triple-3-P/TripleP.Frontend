'use client';
import { useEffect, useId, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { useTranslate } from '@tolgee/react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { PasswordInput } from '@/shared/ui/password-input';
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldSet,
} from '@/shared/ui/field';
import { useSignInMutation, useSignUpMutation } from '../api/auth-api';
import {
  createAuthSchema,
  getAuthError,
  type TAuthMode,
  type TAuthValues,
} from '../model/auth-validation';

interface IAuthFormProps {
  mode: TAuthMode;
  onRegistered: (email: string) => void;
  onEmailChange: (email: string) => void;
  onBusyChange: (busy: boolean) => void;
  onSuccess: () => void;
  initialEmail: string;
  registered: boolean;
}
interface IAuthField {
  name: keyof TAuthValues;
  label: string;
  autoComplete: string;
  password?: boolean;
}
export function AuthForm({
  mode,
  onRegistered,
  onEmailChange,
  onBusyChange,
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
  const [twoFactor, setTwoFactor] = useState(false);
  const [recovery, setRecovery] = useState(false);
  const [signIn] = useSignInMutation();
  const [signUp] = useSignUpMutation();
  const {
    control,
    handleSubmit,
    setError,
    clearErrors,
    trigger,
    getFieldState,
    formState: { errors, isSubmitting },
  } = useForm<TAuthValues>({
    resolver: zodResolver(
      createAuthSchema(
        mode,
        twoFactor ? (recovery ? 'recovery' : 'authenticator') : undefined,
      ),
    ),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      email: initialEmail,
      password: '',
      confirmPassword: '',
      twoFactorCode: '',
      twoFactorRecoveryCode: '',
    },
  });
  async function submit(values: TAuthValues) {
    clearErrors();
    onBusyChange(true);
    try {
      if (mode === 'signUp') {
        await signUp({
          email: values.email,
          password: values.password,
        }).unwrap();
        toast.success(t('auth.registered'));
        if (mounted.current) onRegistered(values.email);
      } else {
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
        toast.success(t('auth.successTitle'));
        if (mounted.current) onSuccess();
      }
    } catch (error: unknown) {
      const key = getAuthError(error);
      if (key === 'auth.error.twoFactor') {
        toast.info(t(key));
      } else {
        toast.error(
          t(mode === 'signUp' ? 'auth.signUpFailed' : 'auth.signInFailed'),
          { description: t(key) },
        );
      }
      if (!mounted.current) return;
      if (key === 'auth.error.twoFactor') setTwoFactor(true);
      const field =
        key === 'auth.error.duplicate' || key === 'auth.invalidEmail'
          ? 'email'
          : key === 'auth.passwordRequirements'
            ? 'password'
            : 'root';
      setError(field, { message: key }, { shouldFocus: field !== 'root' });
    } finally {
      if (mounted.current) onBusyChange(false);
    }
  }
  const fields: IAuthField[] = [
    { name: 'email', label: 'auth.email', autoComplete: 'email' },
    {
      name: 'password',
      label: 'auth.password',
      autoComplete: mode === 'signUp' ? 'new-password' : 'current-password',
      password: true,
    },
  ];
  if (mode === 'signUp')
    fields.push({
      name: 'confirmPassword',
      label: 'auth.confirmPassword',
      autoComplete: 'new-password',
      password: true,
    });
  if (twoFactor)
    fields.push({
      name: recovery ? 'twoFactorRecoveryCode' : 'twoFactorCode',
      label: recovery ? 'auth.recoveryCode' : 'auth.twoFactorCode',
      autoComplete: 'one-time-code',
    });
  return (
    <form
      noValidate
      onSubmit={(event) => {
        void handleSubmit(submit, () => {
          toast.error(t('auth.error.validation'));
        })(event);
      }}
      aria-busy={isSubmitting}
    >
      <FieldSet disabled={isSubmitting} className="min-w-0 gap-3">
        {registered && (
          <p role="status" className="text-sm">
            {t('auth.registered')}
          </p>
        )}
        <FieldGroup className="min-w-0 gap-3">
          {fields.map((definition) => (
            <Controller
              key={definition.name}
              name={definition.name}
              control={control}
              render={({ field, fieldState }) => {
                const inputId = id + definition.name;
                const showHint =
                  definition.name === 'password' && mode === 'signUp';
                const describedBy =
                  [
                    showHint && !fieldState.invalid && inputId + '-hint',
                    fieldState.invalid && inputId + '-error',
                  ]
                    .filter(Boolean)
                    .join(' ') || undefined;
                const inputProps = {
                  ...field,
                  id: inputId,
                  autoComplete: definition.autoComplete,
                  required: true,
                  disabled: isSubmitting,
                  'aria-invalid': fieldState.invalid,
                  'aria-describedby': describedBy,
                  onChange: (event: ChangeEvent<HTMLInputElement>) => {
                    field.onChange(event);
                    if (definition.name === 'email')
                      onEmailChange(event.target.value);
                    if (
                      definition.name === 'password' &&
                      mode === 'signUp' &&
                      getFieldState('confirmPassword').isTouched
                    ) {
                      void trigger('confirmPassword');
                    }
                  },
                };
                return (
                  <Field
                    data-invalid={fieldState.invalid}
                    className="min-w-0 gap-1"
                  >
                    <FieldLabel htmlFor={inputId}>
                      {t(definition.label)}
                    </FieldLabel>
                    {definition.password ? (
                      <PasswordInput
                        {...inputProps}
                        showLabel={t(
                          definition.name === 'confirmPassword'
                            ? 'auth.showConfirmPassword'
                            : 'auth.showPassword',
                        )}
                        hideLabel={t(
                          definition.name === 'confirmPassword'
                            ? 'auth.hideConfirmPassword'
                            : 'auth.hidePassword',
                        )}
                      />
                    ) : (
                      <Input
                        {...inputProps}
                        type={definition.name === 'email' ? 'email' : 'text'}
                      />
                    )}
                    {showHint && !fieldState.invalid && (
                      <FieldDescription
                        className="text-xs"
                        id={inputId + '-hint'}
                      >
                        {t('auth.passwordRequirements')}
                      </FieldDescription>
                    )}
                    {fieldState.error?.message && (
                      <FieldError
                        className="text-xs"
                        id={inputId + '-error'}
                        errors={[{ message: t(fieldState.error.message) }]}
                      />
                    )}
                  </Field>
                );
              }}
            />
          ))}
          {twoFactor && (
            <Button
              type="button"
              variant="link"
              onClick={() => {
                setRecovery(!recovery);
                clearErrors(['twoFactorCode', 'twoFactorRecoveryCode']);
              }}
            >
              {t(recovery ? 'auth.useAuthenticator' : 'auth.useRecovery')}
            </Button>
          )}
          {errors.root?.message && (
            <FieldError errors={[{ message: t(errors.root.message) }]} />
          )}
          <Button type="submit" className="w-full">
            {t(isSubmitting ? 'auth.submitting' : 'account.' + mode)}
          </Button>
        </FieldGroup>
      </FieldSet>
    </form>
  );
}
