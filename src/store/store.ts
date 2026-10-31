import { configureStore } from '@reduxjs/toolkit';

import { authApi } from '@/features/authentication';
import type { TAccount } from '@/features/authentication';

export function makeStore(initialAccount?: TAccount | null) {
  const store = configureStore({
    reducer: {
      [authApi.reducerPath]: authApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(authApi.middleware),
  });

  if (initialAccount !== undefined) {
    store.dispatch(
      authApi.util.upsertQueryEntries([
        { endpointName: 'account', arg: undefined, value: initialAccount },
      ]),
    );
  }

  return store;
}

export type TAppStore = ReturnType<typeof makeStore>;
export type TRootState = ReturnType<TAppStore['getState']>;
export type TAppDispatch = TAppStore['dispatch'];
