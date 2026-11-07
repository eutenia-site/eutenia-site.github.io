import { expect, test } from '@playwright/test';

test('smoke: fixtures build serves the home page under the base path', async ({ page }) => {
  const response = await page.goto('./');
  expect(response?.status()).toBe(200);
  await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');
});
