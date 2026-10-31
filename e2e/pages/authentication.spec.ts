import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('sign-in modal supports focus, validation and keyboard dismissal', async ({
  page,
}) => {
  const trigger = page
    .getByRole('button', { name: 'Sign in', exact: true })
    .first();
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: 'Sign in', exact: true });
  await expect(dialog.getByLabel('Email', { exact: true })).toBeFocused();
  await dialog.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(dialog.getByText('Enter a valid email address.')).toBeVisible();
  await expect(dialog.getByText('Enter your password.')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});

test('sign-up checks confirmation, toggles password visibility and switches forms', async ({
  page,
}) => {
  await page
    .getByRole('button', { name: 'Sign up', exact: true })
    .last()
    .click();
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('Email', { exact: true }).fill('person@example.com');
  await dialog.getByLabel('Password', { exact: true }).fill('Valid123!');
  await dialog
    .getByLabel('Confirm password', { exact: true })
    .fill('Mismatch123!');
  await dialog.getByRole('button', { name: 'Sign up', exact: true }).click();
  await expect(dialog.getByText('Passwords do not match.')).toBeVisible();
  await dialog.getByLabel('Show password').check();
  await expect(dialog.getByLabel('Password', { exact: true })).toHaveAttribute(
    'type',
    'text',
  );
  await dialog.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(
    dialog.getByRole('heading', { name: 'Sign in', exact: true }),
  ).toBeVisible();
  await expect(dialog.getByLabel('Email', { exact: true })).toHaveValue(
    'person@example.com',
  );
  await expect(dialog.getByLabel('Password', { exact: true })).toHaveValue('');
  await expect(
    dialog.getByText('Your account has been created. Sign in to continue.'),
  ).toBeHidden();
  await dialog.getByRole('button', { name: 'Close', exact: true }).click();
  await expect(dialog).toBeHidden();
});
