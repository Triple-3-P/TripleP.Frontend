import { z } from 'zod';

export type TAuthMode = 'signIn' | 'signUp';
export function createAuthSchema(mode: TAuthMode) {
  return z
    .object({
      email: z.string().trim().email('auth.invalidEmail'),
      password:
        mode === 'signUp'
          ? z
              .string()
              .min(6, 'auth.passwordRequirements')
              .regex(/[a-z]/, 'auth.passwordRequirements')
              .regex(/[A-Z]/, 'auth.passwordRequirements')
              .regex(/[0-9]/, 'auth.passwordRequirements')
              .regex(/[^a-zA-Z0-9]/, 'auth.passwordRequirements')
          : z.string().min(1, 'auth.passwordRequired'),
      confirmPassword: z.string(),
      twoFactorCode: z.string(),
      twoFactorRecoveryCode: z.string(),
    })
    .refine(
      (values) =>
        mode !== 'signUp' || values.password === values.confirmPassword,
      {
        message: 'auth.passwordMismatch',
        path: ['confirmPassword'],
      },
    );
}
export type TAuthValues = z.infer<ReturnType<typeof createAuthSchema>>;

const apiErrorSchema = z.object({
  status: z.union([z.number(), z.string()]),
  data: z
    .object({
      detail: z.string().optional(),
      errors: z.record(z.array(z.string())).optional(),
    })
    .optional(),
});
export function getAuthError(error: unknown): string {
  const parsed = apiErrorSchema.safeParse(error);
  if (!parsed.success) return 'auth.error.unavailable';
  const { status, data } = parsed.data;
  if (data?.detail === 'RequiresTwoFactor') return 'auth.error.twoFactor';
  if (data?.detail === 'LockedOut') return 'auth.error.lockedOut';
  if (data?.detail === 'NotAllowed') return 'auth.error.notAllowed';
  if (status === 401) return 'auth.error.credentials';
  const codes = Object.keys(data?.errors ?? {});
  if (
    codes.some(
      (code) => code === 'DuplicateUserName' || code === 'DuplicateEmail',
    )
  )
    return 'auth.error.duplicate';
  if (codes.includes('InvalidEmail')) return 'auth.invalidEmail';
  if (codes.some((code) => code.startsWith('Password')))
    return 'auth.passwordRequirements';
  if (status === 400) return 'auth.error.validation';
  if (status === 429) return 'auth.error.rateLimit';
  return 'auth.error.unavailable';
}
