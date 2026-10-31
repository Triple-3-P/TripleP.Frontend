import { describe, expect, it } from 'vitest';
import { createAuthSchema, getAuthError } from './auth-validation';

const values = {
  email: 'person@example.com',
  password: 'Valid123!',
  confirmPassword: 'Valid123!',
  twoFactorCode: '',
  twoFactorRecoveryCode: '',
};
describe('authentication validation', () => {
  it('normalizes email without modifying passwords', () => {
    const parsed = createAuthSchema('signUp').parse({
      ...values,
      email: ' person@example.com ',
      password: ' Valid123! ',
      confirmPassword: ' Valid123! ',
    });
    expect(parsed.email).toBe('person@example.com');
    expect(parsed.password).toBe(' Valid123! ');
  });
  it.each(['short', 'lowercase1!', 'UPPERCASE1!', 'NoNumbers!', 'NoSymbols1'])(
    'rejects registration password %s',
    (password) => {
      expect(
        createAuthSchema('signUp').safeParse({
          ...values,
          password,
          confirmPassword: password,
        }).success,
      ).toBe(false);
    },
  );
  it('requires matching confirmation only for registration', () => {
    expect(
      createAuthSchema('signUp').safeParse({
        ...values,
        confirmPassword: 'different',
      }).success,
    ).toBe(false);
    expect(
      createAuthSchema('signIn').safeParse({
        ...values,
        password: 'old',
        confirmPassword: '',
      }).success,
    ).toBe(true);
  });
  it('rejects missing login credentials', () => {
    expect(
      createAuthSchema('signIn').safeParse({
        ...values,
        email: '',
        password: '',
      }).success,
    ).toBe(false);
  });
  it.each([
    [
      { status: 401, data: { detail: 'RequiresTwoFactor' } },
      'auth.error.twoFactor',
    ],
    [{ status: 401, data: { detail: 'LockedOut' } }, 'auth.error.lockedOut'],
    [{ status: 401 }, 'auth.error.credentials'],
    [
      {
        status: 400,
        data: { errors: { DuplicateUserName: ['private information'] } },
      },
      'auth.error.duplicate',
    ],
    [
      {
        status: 400,
        data: { errors: { PasswordRequiresDigit: ['private information'] } },
      },
      'auth.passwordRequirements',
    ],
    [{ status: 'FETCH_ERROR' }, 'auth.error.unavailable'],
    [
      { status: 500, data: '<html>Internal error</html>' },
      'auth.error.unavailable',
    ],
  ])('maps backend errors to localizable messages', (error, expected) => {
    expect(getAuthError(error)).toBe(expected);
  });
});
