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
  await dialog
    .getByRole('button', { name: 'Show password', exact: true })
    .click();
  await expect(dialog.getByLabel('Password', { exact: true })).toHaveAttribute(
    'type',
    'text',
  );
  await expect(
    dialog.getByLabel('Confirm password', { exact: true }),
  ).toHaveAttribute('type', 'password');
  await dialog
    .getByRole('button', { name: 'Show confirmation password', exact: true })
    .click();
  await expect(
    dialog.getByLabel('Confirm password', { exact: true }),
  ).toHaveAttribute('type', 'text');
  await dialog
    .getByRole('button', { name: 'Hide password', exact: true })
    .click();
  await expect(dialog.getByLabel('Password', { exact: true })).toHaveAttribute(
    'type',
    'password',
  );
  await dialog.getByRole('tab', { name: 'Sign in', exact: true }).click();
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

test('validates edited fields before submission and clears corrected errors', async ({
  page,
}) => {
  await page
    .getByRole('button', { name: 'Sign up', exact: true })
    .first()
    .click();
  const dialog = page.getByRole('dialog');
  const email = dialog.getByLabel('Email', { exact: true });
  const password = dialog.getByLabel('Password', { exact: true });
  await email.fill('invalid');
  await password.focus();
  await expect(email).toHaveAttribute('aria-invalid', 'true');
  await expect(email).toHaveAccessibleDescription(
    'Enter a valid email address.',
  );
  await email.fill('person@example.com');
  await expect(email).toHaveAttribute('aria-invalid', 'false');
  await password.fill('weak');
  await dialog
    .getByRole('button', { name: 'Show password', exact: true })
    .focus();
  await expect(password).toHaveAttribute('aria-invalid', 'true');
  await expect(dialog.getByRole('alert')).toHaveText(
    'Use at least 6 characters, including an uppercase letter, a lowercase letter, a number, and a symbol.',
  );
  await password.fill('Valid123!');
  await expect(password).toHaveAttribute('aria-invalid', 'false');
  await expect(dialog.getByRole('alert')).toHaveCount(0);
});

test('switches auth tabs with the keyboard and clears password state', async ({
  page,
}) => {
  await page
    .getByRole('button', { name: 'Sign in', exact: true })
    .first()
    .click();
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('Password', { exact: true }).fill('Private123!');
  const signIn = dialog.getByRole('tab', { name: 'Sign in', exact: true });
  await signIn.focus();
  await page.keyboard.press('ArrowRight');
  await expect(
    dialog.getByRole('tab', { name: 'Sign up', exact: true }),
  ).toHaveAttribute('aria-selected', 'true');
  await expect(
    dialog.getByRole('tabpanel', { name: 'Sign up', exact: true }),
  ).toBeVisible();
  await expect(
    dialog.getByLabel('Confirm password', { exact: true }),
  ).toBeVisible();
  await expect(dialog.getByLabel('Password', { exact: true })).toHaveValue('');
  await page.keyboard.press('ArrowLeft');
  await expect(signIn).toHaveAttribute('aria-selected', 'true');
  await expect(
    dialog.getByLabel('Confirm password', { exact: true }),
  ).toHaveCount(0);
});

test('keeps tabs above the form and preserves modal bounds when switching', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page
    .getByRole('button', { name: 'Sign in', exact: true })
    .first()
    .click();
  const dialog = page.getByRole('dialog');
  await dialog.evaluate(async (element) => {
    await Promise.all(
      element.getAnimations().map((animation) => animation.finished),
    );
  });
  const initialBounds = await dialog.boundingBox();
  const tabs = dialog.getByRole('tablist');
  const tabsBounds = await tabs.boundingBox();
  const headingBounds = await dialog
    .getByLabel('Email', { exact: true })
    .boundingBox();
  expect(tabsBounds).not.toBeNull();
  expect(headingBounds).not.toBeNull();
  if (tabsBounds && headingBounds)
    expect(tabsBounds.y + tabsBounds.height).toBeLessThan(headingBounds.y);
  await dialog.getByRole('tab', { name: 'Sign up', exact: true }).click();
  await expect(
    dialog.getByLabel('Confirm password', { exact: true }),
  ).toBeVisible();
  expect(await dialog.boundingBox()).toEqual(initialBounds);
  await dialog.getByRole('button', { name: 'Sign up', exact: true }).click();
  await expect(dialog.getByLabel('Password', { exact: true })).toHaveAttribute(
    'aria-invalid',
    'true',
  );
  expect(await dialog.boundingBox()).toEqual(initialBounds);
  await dialog.getByRole('tab', { name: 'Sign in', exact: true }).click();
  expect(await dialog.boundingBox()).toEqual(initialBounds);
});

for (const viewport of [
  { width: 1280, height: 720 },
  { width: 390, height: 844 },
]) {
  test(`auth forms fit without scroll at ${viewport.width}px and Google is a placeholder`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await page
      .getByRole('button', { name: 'Sign in', exact: true })
      .first()
      .click();
    const dialog = page.getByRole('dialog');
    const authRequests: string[] = [];
    page.on('request', (request) => {
      if (/\/api\/(login|register)/.test(request.url()))
        authRequests.push(request.url());
    });
    for (const name of ['Sign in', 'Sign up']) {
      await dialog.getByRole('tab', { name, exact: true }).click();
      const panel = dialog.getByRole('tabpanel', { name, exact: true });
      const bounds = await panel.evaluate((element) => {
        const body = element.parentElement;
        if (!body) throw new Error('Missing modal body');
        return {
          width: body.clientWidth,
          contentWidth: body.scrollWidth,
          height: body.clientHeight,
          contentHeight: body.scrollHeight,
        };
      });
      expect(bounds.contentWidth).toBeLessThanOrEqual(bounds.width);
      expect(bounds.contentHeight).toBeLessThanOrEqual(bounds.height);
      const google = dialog.getByRole('button', {
        name: 'Sign in with Google',
        exact: true,
      });
      await expect(google).toBeEnabled();
      const submitBounds = await panel
        .getByRole('button', { name, exact: true })
        .boundingBox();
      const googleBounds = await google.boundingBox();
      expect(submitBounds).not.toBeNull();
      expect(googleBounds).not.toBeNull();
      if (submitBounds && googleBounds)
        expect(googleBounds.y).toBeGreaterThan(
          submitBounds.y + submitBounds.height,
        );
      await google.click();
      await expect(
        dialog.getByRole('tab', { name, exact: true }),
      ).toHaveAttribute('aria-selected', 'true');
      await expect(dialog.getByRole('alert')).toHaveCount(0);
    }
    expect(authRequests).toEqual([]);
  });
}
