'use client';

import { setupListeners } from '@reduxjs/toolkit/query';
import { useEffect, useState } from 'react';
import type { IWithChild } from '@/shared/utils/props';
import { Provider } from 'react-redux';
import type { TAccount } from '@/features/authentication';

import { makeStore } from './store';

interface IStoreProviderProps extends IWithChild {
  initialAccount: TAccount | null | undefined;
}

export function StoreProvider({
  children,
  initialAccount,
}: IStoreProviderProps) {
  const [store] = useState(() => makeStore(initialAccount));

  useEffect(() => setupListeners(store.dispatch), [store]);

  return <Provider store={store}>{children}</Provider>;
}
