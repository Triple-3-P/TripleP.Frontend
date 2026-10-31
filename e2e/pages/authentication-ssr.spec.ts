import { expect, test } from '@playwright/test';

test('renders guest controls on the server without JavaScript', async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto('/');
    const header = page.getByRole('banner');
    await expect(
      header.getByRole('button', { name: 'Sign in', exact: true }),
    ).toBeEnabled();
    await expect(
      header.getByRole('button', { name: 'Sign up', exact: true }),
    ).toBeEnabled();
    await expect(header.getByRole('status')).toHaveCount(0);
  } finally {
    await context.close();
  }
});

test('hydrates the server guest state without a duplicate account request', async ({
  page,
}) => {
  const accountRequests: string[] = [];
  page.on('request', (request) => {
    if (new URL(request.url()).pathname === '/api/manage/info') {
      accountRequests.push(request.url());
    }
  });

  await page.goto('/');
  await page
    .getByRole('banner')
    .getByRole('button', { name: 'Sign in', exact: true })
    .click();
  await expect(page.getByRole('dialog')).toBeVisible();
  expect(accountRequests).toEqual([]);
});
