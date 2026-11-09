import { expect, test, type Page } from './base';

// Fixtures configure formEndpoint = https://formspree.io/f/teste.
const ENDPOINT = 'https://formspree.io/f/teste';
const form = (page: Page) => page.locator('form[data-contact-form]');
const errorOf = (page: Page, label: string) =>
  form(page)
    .locator('[data-field-box]', { has: page.getByLabel(label) })
    .locator('[data-error]');

async function fillValid(page: Page) {
  const f = form(page);
  await f.getByLabel('Seu nome / empresa').fill('Ana Teste');
  await f.getByLabel('E-mail corporativo ou contato').fill('ana@exemplo.com');
  await f.getByLabel('Telefone / WhatsApp').fill('+55 (41) 90000-0000');
  await f.getByLabel('Assunto').selectOption('Imprensa & Mídia');
  await f.getByLabel('Cidade & estado').fill('Curitiba - PR');
  await f.getByLabel('Data prevista / estimada').fill('2099-06-01');
  await f.getByLabel('Mensagem Detalhada').fill('Pedido de entrevista.');
  await f.getByRole('checkbox').check();
}

test('CONT-04 invalid submit shows messages and focuses first invalid field', async ({ page }) => {
  let posted = false;
  await page.route(ENDPOINT, (r) => {
    posted = true;
    return r.fulfill({ status: 200, body: '{}' });
  });
  await page.goto('contato/');
  const f = form(page);
  await f.getByRole('button', { name: /Enviar Mensagem/i }).click();

  for (const label of [
    'Seu nome / empresa',
    'E-mail corporativo ou contato',
    'Assunto',
    'Mensagem Detalhada',
  ]) {
    await expect(errorOf(page, label)).toHaveText('Campo obrigatório');
    await expect(f.getByLabel(label)).toHaveAttribute('aria-invalid', 'true');
  }
  const consentError = f
    .locator('[data-field-box]', { has: page.getByRole('checkbox') })
    .locator('[data-error]');
  await expect(consentError).toHaveText('Campo obrigatório');
  // Optional fields carry no message.
  await expect(errorOf(page, 'Telefone / WhatsApp')).toBeHidden();
  await expect(f.getByLabel('Seu nome / empresa')).toBeFocused();

  // Invalid e-mail: its own message; focus moves to it as the first invalid field.
  await f.getByLabel('Seu nome / empresa').fill('Ana Teste');
  await f.getByLabel('E-mail corporativo ou contato').fill('ana@');
  await f.getByRole('button', { name: /Enviar Mensagem/i }).click();
  await expect(errorOf(page, 'E-mail corporativo ou contato')).toHaveText(
    'Informe um e-mail válido',
  );
  await expect(errorOf(page, 'Seu nome / empresa')).toBeHidden();
  await expect(f.getByLabel('E-mail corporativo ou contato')).toBeFocused();
  await expect(f).toBeVisible();
  expect(posted).toBe(false);
});

test('CONT-05 configured endpoint POST shows success', async ({ page }) => {
  let body: Record<string, unknown> | null = null;
  let method = '';
  await page.route(ENDPOINT, async (r) => {
    method = r.request().method();
    body = r.request().postDataJSON();
    await r.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
  });
  await page.goto('contato/');
  await fillValid(page);
  await form(page)
    .getByRole('button', { name: /Enviar Mensagem/i })
    .click();

  const success = page.locator('[data-form-success]');
  await expect(success).toBeVisible();
  await expect(
    success.getByText('Mensagem enviada! Responderemos em breve.', { exact: true }),
  ).toBeVisible();
  await expect(form(page)).toBeHidden();
  expect(method).toBe('POST');
  expect(body).toMatchObject({
    nome: 'Ana Teste',
    email: 'ana@exemplo.com',
    telefone: '+55 (41) 90000-0000',
    departamento: 'Imprensa & Mídia',
    cidade: 'Curitiba - PR',
    data: '2099-06-01',
    mensagem: 'Pedido de entrevista.',
  });
});

test('CONT-06 failed POST keeps form and shows error', async ({ page }) => {
  await page.route(ENDPOINT, (r) => r.fulfill({ status: 500, body: 'erro' }));
  await page.goto('contato/');
  await fillValid(page);
  const f = form(page);
  await f.getByRole('button', { name: /Enviar Mensagem/i }).click();

  await expect(f.locator('[data-form-error]')).toHaveText(
    'Não foi possível enviar. Escreva para contatoeutenia@gmail.com.',
  );
  await expect(f).toBeVisible();
  await expect(page.locator('[data-form-success]')).toBeHidden();
  await expect(f.getByLabel('Seu nome / empresa')).toHaveValue('Ana Teste');
  await expect(f.getByLabel('E-mail corporativo ou contato')).toHaveValue('ana@exemplo.com');
  await expect(f.getByLabel('Assunto')).toHaveValue('Imprensa & Mídia');
  await expect(f.getByLabel('Mensagem Detalhada')).toHaveValue('Pedido de entrevista.');
  await expect(f.getByRole('checkbox')).toBeChecked();
});

test('CONT-07 mailto mode lists every filled field with the department', async ({ page }) => {
  await page.goto('contato/');
  const f = form(page);
  // The real build has no endpoint: run the mailto path.
  await f.evaluate((el: HTMLFormElement) => (el.dataset.endpoint = ''));
  await fillValid(page);
  await f.getByRole('button', { name: /Enviar Mensagem/i }).click();

  const link = f.locator('[data-mailto-link]');
  await expect(link).toBeVisible();
  const href = (await link.getAttribute('href'))!;
  expect(
    href.startsWith(
      'mailto:contatoeutenia@gmail.com?subject=Imprensa%20%26%20M%C3%ADdia%20-%20Ana%20Teste&body=',
    ),
  ).toBe(true);
  const body = decodeURIComponent(href.split('&body=')[1]).split('\r\n');
  expect(body).toEqual([
    'Seu nome / empresa: Ana Teste',
    'E-mail corporativo ou contato: ana@exemplo.com',
    'Telefone / WhatsApp: +55 (41) 90000-0000',
    'Assunto: Imprensa & Mídia',
    'Cidade & estado (local do show): Curitiba - PR',
    'Data prevista / estimada: 2099-06-01',
    'Mensagem Detalhada: Pedido de entrevista.',
  ]);
});

test('CONT-01 city and date sit together in an inset sub-panel', async ({ page }) => {
  await page.goto('contato/');
  const f = form(page);
  const panel = f.locator('[data-subpanel="show"]');
  await expect(panel).toBeVisible();
  await expect(panel.getByLabel('Cidade & estado (local do show)')).toBeVisible();
  await expect(panel.getByLabel('Data prevista / estimada')).toBeVisible();
  await expect(panel.locator('[data-field-box]')).toHaveCount(2);
  // An inset panel: its own border and a surface distinct from the form's.
  await expect(panel).toHaveCSS('border-top-style', 'solid');
  const bg = await panel.evaluate((el) => getComputedStyle(el).backgroundColor);
  expect(bg).not.toBe('rgba(0, 0, 0, 0)');
  const p = (await panel.boundingBox())!;
  const city = (await panel.getByLabel('Cidade & estado (local do show)').boundingBox())!;
  expect(city.x).toBeGreaterThan(p.x);
  // Other fields stay outside the panel.
  await expect(panel.getByLabel('Seu nome / empresa')).toHaveCount(0);
});
