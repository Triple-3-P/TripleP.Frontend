import { baseApi } from '@/shared/api';
import { accountSchema } from '../model/account';
import type { TAccount } from '../model/account';

export interface ICredentials {
  email: string;
  password: string;
}
export interface ILoginRequest extends ICredentials {
  twoFactorCode?: string;
  twoFactorRecoveryCode?: string;
}

export const authApi = baseApi
  .enhanceEndpoints({ addTagTypes: ['Account'] })
  .injectEndpoints({
    endpoints: (builder) => ({
      account: builder.query<TAccount | null, void>({
        async queryFn(_argument, _api, _options, baseQuery) {
          const result = await baseQuery('manage/info');
          if (result.error) {
            return result.error.status === 401
              ? { data: null }
              : { error: result.error };
          }
          const account = accountSchema.safeParse(result.data);
          return account.success
            ? { data: account.data }
            : {
                error: {
                  status: 'CUSTOM_ERROR',
                  error: 'Invalid account response',
                },
              };
        },
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
      signOut: builder.mutation<void, void>({
        query: () => ({ url: 'session/logout', method: 'POST' }),
        async onQueryStarted(_argument, { dispatch, queryFulfilled }) {
          try {
            await queryFulfilled;
            dispatch(baseApi.util.resetApiState());
          } catch {
            // Preserve the account cache when logout fails; the caller reports the error.
          }
        },
      }),
    }),
  });
export const {
  useAccountQuery,
  useSignInMutation,
  useSignUpMutation,
  useSignOutMutation,
} = authApi;
