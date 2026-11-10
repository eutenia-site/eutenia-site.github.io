import { expect, test } from './base';

for (const route of ['contato/', 'shows/']) {
  test(`${route} offers forms on phones and copyable email on desktop`, async ({
    page,
  }, testInfo) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: {
          writeText: async (text: string) => {
            document.documentElement.dataset.copiedEmail = text;
          },
        },
      });
    });
    await page.goto(route);
    const form = page.locator('form[data-contact-form]');
    const help = page.locator('[data-email-browser]');
    if (testInfo.project.name === 'mobile') {
      await expect(form).toBeVisible();
      await expect(help).toBeHidden();
    } else {
      await expect(form).toBeHidden();
      await expect(help).toBeVisible();
      await expect(help).toContainText('Para propostas de shows e festivais');
      await help.getByRole('button', { name: 'Copiar e-mail' }).click();
      await expect(page.locator('html')).toHaveAttribute(
        'data-copied-email',
        'contatoeutenia@gmail.com',
      );
      await expect(help.getByRole('status')).toContainText('E-mail copiado.');
    }
  });
}
