'use client';

import { setupListeners } from '@reduxjs/toolkit/query';
import { useEffect, useState } from 'react';
import type { IWithChild } from '@/shared/utils/props';
import { Provider } from 'react-redux';

import { makeStore } from './store';

interface IStoreProviderProps extends IWithChild {}

export function StoreProvider({ children }: IStoreProviderProps) {
  const [store] = useState(makeStore);

  useEffect(() => setupListeners(store.dispatch), [store]);

  return <Provider store={store}>{children}</Provider>;
}
