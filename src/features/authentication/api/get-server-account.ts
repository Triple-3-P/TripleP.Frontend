import 'server-only';

import { cookies } from 'next/headers';
import { identityCookiePattern } from '@/shared/api/identity-cookie';
import { accountSchema } from '../model/account';
import type { TAccount } from '../model/account';

// null is a confirmed guest; undefined leaves the client query free to retry.
export async function getServerAccount(): Promise<TAccount | null | undefined> {
  const cookieStore = await cookies();
  const sessionCookies = cookieStore
    .getAll()
    .filter(({ name }) => identityCookiePattern.test(name));
  if (sessionCookies.length === 0) return null;

  try {
    const response = await fetch(
      new URL(
        '/api/manage/info',
        process.env.BACKEND_URL ?? 'http://localhost:5047',
      ),
      {
        headers: {
          Cookie: sessionCookies
            .map(({ name, value }) => `${name}=${value}`)
            .join('; '),
        },
        cache: 'no-store',
        redirect: 'error',
        signal: AbortSignal.timeout(15000),
      },
    );
    if (response.status === 401) return null;
    if (!response.ok) return undefined;

    const body: unknown = await response.json();
    const result = accountSchema.safeParse(body);
    return result.success ? result.data : undefined;
  } catch {
    // Do not cache a backend outage as a signed-out session or expose credentials.
    return undefined;
  }
}
