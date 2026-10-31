import { afterEach, describe, expect, it } from 'vitest';
import { authApi } from '@/features/authentication';
import { makeStore } from './store';
import type { TAppStore } from './store';

const stores: TAppStore[] = [];
const account = { email: 'person@example.com', isEmailConfirmed: false };

afterEach(() => {
  for (const store of stores) store.dispatch(authApi.util.resetApiState());
  stores.length = 0;
});

describe('server account initialization', () => {
  it('makes the account available before the first render and reuses it on subscription', async () => {
    const store = makeStore(account);
    stores.push(store);
    expect(authApi.endpoints.account.select()(store.getState())).toMatchObject({
      status: 'fulfilled',
      data: account,
    });

    const query = store.dispatch(authApi.endpoints.account.initiate());
    try {
      await expect(query.unwrap()).resolves.toEqual(account);
    } finally {
      query.unsubscribe();
    }
  });

  it('distinguishes a confirmed guest from an unknown session', () => {
    const guest = makeStore(null);
    const unknown = makeStore();
    stores.push(guest, unknown);
    expect(authApi.endpoints.account.select()(guest.getState())).toMatchObject({
      status: 'fulfilled',
      data: null,
    });
    expect(
      authApi.endpoints.account.select()(unknown.getState()),
    ).toMatchObject({
      status: 'uninitialized',
      isUninitialized: true,
    });
  });

  it('keeps account data isolated between requests and clears it on reset', () => {
    const first = makeStore(account);
    const secondAccount = {
      email: 'another@example.com',
      isEmailConfirmed: true,
    };
    const second = makeStore(secondAccount);
    stores.push(first, second);
    first.dispatch(authApi.util.resetApiState());

    expect(
      authApi.endpoints.account.select()(first.getState()).data,
    ).toBeUndefined();
    expect(authApi.endpoints.account.select()(second.getState()).data).toEqual(
      secondAccount,
    );
  });
});
