import { expect, test, type Page } from '@playwright/test';

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
  await f.getByLabel('Departamento / finalidade').selectOption('Imprensa & Mídia');
  await f.getByLabel('Cidade & estado').fill('Curitiba - PR');
  await f.getByLabel('Data prevista / estimada').fill('2099-06-01');
  await f.getByLabel('Proposta ou mensagem detalhada').fill('Pedido de entrevista.');
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
  await f.getByRole('button', { name: /Enviar proposta para a produção/i }).click();

  for (const label of [
    'Seu nome / empresa',
    'E-mail corporativo ou contato',
    'Departamento / finalidade',
    'Proposta ou mensagem detalhada',
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
  await f.getByRole('button', { name: /Enviar proposta para a produção/i }).click();
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
    .getByRole('button', { name: /Enviar proposta para a produção/i })
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
  await f.getByRole('button', { name: /Enviar proposta para a produção/i }).click();

  await expect(f.locator('[data-form-error]')).toHaveText(
    'Não foi possível enviar. Escreva para contato@eutenia.com.br.',
  );
  await expect(f).toBeVisible();
  await expect(page.locator('[data-form-success]')).toBeHidden();
  await expect(f.getByLabel('Seu nome / empresa')).toHaveValue('Ana Teste');
  await expect(f.getByLabel('E-mail corporativo ou contato')).toHaveValue('ana@exemplo.com');
  await expect(f.getByLabel('Departamento / finalidade')).toHaveValue('Imprensa & Mídia');
  await expect(f.getByLabel('Proposta ou mensagem detalhada')).toHaveValue('Pedido de entrevista.');
  await expect(f.getByRole('checkbox')).toBeChecked();
});
