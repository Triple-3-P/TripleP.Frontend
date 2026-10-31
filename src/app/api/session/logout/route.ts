import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// The unmodified ASP.NET Identity application cookie, verified against the API.
const identityCookie = '.AspNetCore.Identity.Application';
const identityCookiePattern =
  /^\.AspNetCore\.Identity\.Application(?:C[1-9]\d*)?$/;

export function POST(request: NextRequest) {
  // Next.js can normalize the URL hostname to localhost in development.
  // Compare against the original request Host so 127.0.0.1 works as well.
  const requestOrigin = `${request.nextUrl.protocol}//${request.headers.get('host') ?? request.nextUrl.host}`;
  if (request.headers.get('origin') !== requestOrigin) {
    return new NextResponse(null, { status: 403 });
  }

  const response = new NextResponse(null, {
    status: 204,
    headers: { 'Cache-Control': 'no-store' },
  });
  const cookieNames = new Set([
    identityCookie,
    ...request.cookies
      .getAll()
      .map(({ name }) => name)
      .filter((name) => identityCookiePattern.test(name)),
  ]);
  for (const name of cookieNames) {
    response.cookies.set(name, '', {
      expires: new Date(0),
      maxAge: 0,
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: request.nextUrl.protocol === 'https:',
    });
  }
  return response;
}
