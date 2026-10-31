// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from './route';

const origin = 'http://localhost:3000';
describe('browser logout', () => {
  it('accepts the browser host when Next.js normalizes the request URL', () => {
    const response = POST(
      new NextRequest(`${origin}/api/session/logout`, {
        method: 'POST',
        headers: { origin: 'http://127.0.0.1:3000', host: '127.0.0.1:3000' },
      }),
    );
    expect(response.status).toBe(204);
  });
  it.each([undefined, 'https://other.example'])(
    'rejects an untrusted origin: %s',
    (requestOrigin) => {
      const response = POST(
        new NextRequest(`${origin}/api/session/logout`, {
          method: 'POST',
          headers: requestOrigin ? { origin: requestOrigin } : {},
        }),
      );
      expect(response.status).toBe(403);
      expect(response.cookies.getAll()).toEqual([]);
    },
  );

  it('expires the Identity cookie and its chunks without changing unrelated cookies', () => {
    const response = POST(
      new NextRequest(`${origin}/api/session/logout`, {
        method: 'POST',
        headers: {
          origin,
          cookie:
            '.AspNetCore.Identity.Application=chunks-2; .AspNetCore.Identity.ApplicationC1=one; .AspNetCore.Identity.ApplicationC2=two; locale=ru; other=value',
        },
      }),
    );
    expect(response.status).toBe(204);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(response.cookies.getAll().map(({ name }) => name)).toEqual([
      '.AspNetCore.Identity.Application',
      '.AspNetCore.Identity.ApplicationC1',
      '.AspNetCore.Identity.ApplicationC2',
    ]);
    for (const cookie of response.cookies.getAll()) {
      expect(cookie).toMatchObject({
        value: '',
        maxAge: 0,
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
      });
    }
  });

  it('is idempotent and expires secure cookies on HTTPS', () => {
    const response = POST(
      new NextRequest('https://triplep.example/api/session/logout', {
        method: 'POST',
        headers: { origin: 'https://triplep.example' },
      }),
    );
    expect(response.status).toBe(204);
    expect(
      response.cookies.get('.AspNetCore.Identity.Application'),
    ).toMatchObject({ maxAge: 0, secure: true });
  });
});
