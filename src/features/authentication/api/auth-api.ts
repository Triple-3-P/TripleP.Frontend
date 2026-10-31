import { z } from 'zod';
import { baseApi } from '@/shared/api';

export interface ICredentials {
  email: string;
  password: string;
}
export interface ILoginRequest extends ICredentials {
  twoFactorCode?: string;
  twoFactorRecoveryCode?: string;
}
const accountSchema = z.object({
  email: z.string().email(),
  isEmailConfirmed: z.boolean(),
});
export type TAccount = z.infer<typeof accountSchema>;

export const authApi = baseApi
  .enhanceEndpoints({ addTagTypes: ['Account'] })
  .injectEndpoints({
    endpoints: (builder) => ({
      account: builder.query<TAccount, void>({
        query: () => 'manage/info',
        transformResponse: (response: unknown) => accountSchema.parse(response),
        providesTags: ['Account'],
      }),
      signIn: builder.mutation<void, ILoginRequest>({
        query: (body) => ({
          url: 'login?useSessionCookies=true',
          method: 'POST',
          body,
        }),
        invalidatesTags: (_result, error) => (error ? [] : ['Account']),
      }),
      signUp: builder.mutation<void, ICredentials>({
        query: (body) => ({ url: 'register', method: 'POST', body }),
      }),
    }),
  });
export const { useAccountQuery, useSignInMutation, useSignUpMutation } =
  authApi;
