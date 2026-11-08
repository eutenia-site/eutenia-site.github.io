import { expect, test, type Page } from '@playwright/test';
import site from '../fixtures/content/site.json' with { type: 'json' };

// Fixtures: 6 shows in 2099 (two on 2099-03-10), 2 in 2020; festivals in Rio (2099) and Salvador (2020).
const panel = (page: Page, name: string) => page.getByRole('tabpanel', { name });
const places = (page: Page, name: string) =>
  panel(page, name).locator('[data-show] [data-show-place]');

test('SHOW-05 tabs recompute with browser date', async ({ page }) => {
  await page.goto('shows/');
  await expect(places(page, 'Próximos shows')).toHaveText([
    'Curitiba, PR',
    'São Paulo, SP',
    'Rio de Janeiro, RJ',
    'Belo Horizonte, MG',
    'Brasília, DF',
    'Porto Alegre, RS',
  ]);

  // The browser is a day past the two 2099-03-10 shows: they move to Passados.
  await page.clock.setFixedTime(new Date('2099-03-11T12:00:00-03:00'));
  await page.reload();
  await expect(places(page, 'Próximos shows')).toHaveText([
    'Rio de Janeiro, RJ',
    'Belo Horizonte, MG',
    'Brasília, DF',
    'Porto Alegre, RS',
  ]);
  await page.getByRole('tab', { name: 'Passados' }).click();
  await expect(places(page, 'Passados')).toHaveText([
    'Curitiba, PR',
    'São Paulo, SP',
    'Salvador, BA',
    'Recife, PE',
  ]);
});

test('SHOW-06 empty tab shows message with social links', async ({ page }) => {
  // In 2100 every fixture show has passed: Próximos and Festivais are empty.
  await page.clock.setFixedTime(new Date('2100-01-01T12:00:00-03:00'));
  await page.goto('shows/');
  for (const name of ['Próximos shows', 'Festivais']) {
    await page.getByRole('tab', { name }).click();
    await expect(page.getByRole('tab', { name })).toHaveAttribute('aria-selected', 'true');
    const p = panel(page, name);
    await expect(p.locator('[data-show]')).toHaveCount(0);
    await expect(p.getByText('Nenhum show anunciado no momento')).toBeVisible();
    await expect(p.getByRole('link', { name: 'Instagram' })).toHaveAttribute(
      'href',
      site.social.instagram,
    );
    await expect(p.getByRole('link', { name: 'YouTube' })).toHaveAttribute(
      'href',
      site.social.youtube,
    );
  }
  // A tab with shows does not show the message.
  await page.getByRole('tab', { name: 'Passados' }).click();
  await expect(panel(page, 'Passados').locator('[data-show]')).toHaveCount(8);
  await expect(panel(page, 'Passados').getByText('Nenhum show anunciado no momento')).toBeHidden();
});

test('SHOW-07 row action matches status', async ({ page }) => {
  await page.goto('shows/');
  const row = (place: string) =>
    panel(page, 'Próximos shows').locator('[data-show]', { hasText: place });

  for (const [place, href, badge] of [
    ['São Paulo, SP', 'https://ingressos.exemplo.com/sao-paulo', 'Ingressos disponíveis'],
    ['Curitiba, PR', 'https://ingressos.exemplo.com/curitiba', 'Últimos ingressos'],
  ]) {
    const r = row(place);
    await expect(r).toContainText(badge);
    const buy = r.getByRole('link', { name: /Comprar ingresso/ });
    await expect(buy).toHaveText(/Comprar ingresso/i);
    await expect(buy).toHaveAttribute('href', href);
    await expect(buy).toHaveAttribute('target', '_blank');
    const [popup] = await Promise.all([page.waitForEvent('popup'), buy.click()]);
    expect(popup.url()).toContain(href.replace('https://', ''));
    await popup.close();
  }

  const soldOut = row('Belo Horizonte, MG').locator('[data-show-action]');
  await expect(soldOut).toHaveText(/Esgotado/i);
  await expect(soldOut).toBeDisabled();
  await expect(row('Belo Horizonte, MG').getByRole('link')).toHaveCount(0);

  const notify = row('Brasília, DF').getByRole('link', { name: /Avise-me/ });
  await expect(notify).toHaveAttribute('href', site.social.instagram);
  await expect(notify).toHaveAttribute('target', '_blank');

  // Each row shows day, month, year, city/UF, venue and address.
  const sp = row('São Paulo, SP');
  for (const text of ['10', 'MAR', '2099', 'Casa Teste SP', 'Rua Teste, 100 - Centro']) {
    await expect(sp).toContainText(text);
  }
});

test('SHOW-08 booking form opens mailto with Booking subject', async ({ page }) => {
  await page.route(/ingressos\.exemplo\.com/, (r) => r.fulfill({ body: 'ok' }));
  await page.goto('shows/');
  const form = page.locator('form[data-contact-form]');
  // The fixtures configure an endpoint; this test runs the no-endpoint path.
  await form.evaluate((el: HTMLFormElement) => (el.dataset.endpoint = ''));

  await form.getByLabel('Nome do contratante / produtora').fill('Maria Teste');
  await form.getByLabel('E-mail de contato').fill('maria@exemplo.com');
  await form.getByLabel('Cidade / UF').fill('Goiânia / GO');
  await form.getByLabel('Local do evento / venue').fill('Centro de Convenções');
  await form.getByLabel('Data pretendida').fill('2099-05-01');
  await form.getByLabel('Tipo de evento').selectOption('Evento Corporativo / Privado');
  await form.getByLabel('Capacidade estimada do local').selectOption('800 a 2.500 pessoas');
  await form.getByLabel('Mensagem / detalhes adicionais').fill('Show de abertura.');
  await form.getByRole('checkbox').check();
  await form.getByRole('button', { name: /Enviar proposta/i }).click();

  const link = form.locator('[data-mailto-link]');
  await expect(link).toBeVisible();
  const href = (await link.getAttribute('href'))!;
  expect(
    href.startsWith('mailto:contato@eutenia.com.br?subject=Booking%20-%20Maria%20Teste&body='),
  ).toBe(true);
  const body = decodeURIComponent(href.split('&body=')[1]).split('\r\n');
  expect(body).toEqual([
    'Nome do contratante / produtora: Maria Teste',
    'E-mail de contato: maria@exemplo.com',
    'Cidade / UF: Goiânia / GO',
    'Local do evento / venue: Centro de Convenções',
    'Data pretendida: 2099-05-01',
    'Tipo de evento: Evento Corporativo / Privado',
    'Capacidade estimada do local: 800 a 2.500 pessoas',
    'Mensagem / detalhes adicionais: Show de abertura.',
  ]);
});

test('SHOW-08 untouched optional selects stay out of mailto body and POST', async ({ page }) => {
  await page.route(/ingressos\.exemplo\.com/, (r) => r.fulfill({ body: 'ok' }));
  let posted: Record<string, unknown> | null = null;
  await page.route('https://formspree.io/f/teste', async (r) => {
    posted = r.request().postDataJSON();
    await r.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
  });
  await page.goto('shows/');
  const form = page.locator('form[data-contact-form]');
  for (const label of ['Tipo de evento', 'Capacidade estimada do local']) {
    // Optional selects start on an empty option.
    await expect(form.getByLabel(label)).toHaveValue('');
    await expect(form.getByLabel(label).locator('option').first()).toHaveText('Selecione...');
  }

  const fill = async () => {
    await form.getByLabel('Nome do contratante / produtora').fill('Maria Teste');
    await form.getByLabel('E-mail de contato').fill('maria@exemplo.com');
    await form.getByLabel('Cidade / UF').fill('Goiânia / GO');
    await form.getByLabel('Local do evento / venue').fill('Centro de Convenções');
    await form.getByLabel('Data pretendida').fill('2099-05-01');
    await form.getByLabel('Mensagem / detalhes adicionais').fill('Show de abertura.');
    await form.getByRole('checkbox').check();
  };

  // Mailto mode.
  await form.evaluate((el: HTMLFormElement) => (el.dataset.endpoint = ''));
  await fill();
  await form.getByRole('button', { name: /Enviar proposta/i }).click();
  const link = form.locator('[data-mailto-link]');
  await expect(link).toBeVisible();
  const body = decodeURIComponent((await link.getAttribute('href'))!.split('&body=')[1]);
  expect(body.split('\r\n')).toEqual([
    'Nome do contratante / produtora: Maria Teste',
    'E-mail de contato: maria@exemplo.com',
    'Cidade / UF: Goiânia / GO',
    'Local do evento / venue: Centro de Convenções',
    'Data pretendida: 2099-05-01',
    'Mensagem / detalhes adicionais: Show de abertura.',
  ]);

  // Endpoint mode.
  await page.reload();
  await fill();
  await form.getByRole('button', { name: /Enviar proposta/i }).click();
  await expect(page.locator('[data-form-success]')).toBeVisible();
  expect(posted).toMatchObject({ nome: 'Maria Teste', cidade: 'Goiânia / GO' });
  expect(posted).not.toHaveProperty('tipo');
  expect(posted).not.toHaveProperty('capacidade');
});

test('QUAL-03 shows tabs move with arrow keys', async ({ page }) => {
  await page.goto('shows/');
  const tab = (name: RegExp) => page.getByRole('tab', { name });
  const proximos = tab(/Próximos shows/i);
  const passados = tab(/Passados/i);
  await expect(proximos).toHaveAttribute('aria-selected', 'true');
  await expect(proximos).toHaveAttribute('tabindex', '0');
  await expect(passados).toHaveAttribute('tabindex', '-1');

  await proximos.focus();
  await page.keyboard.press('ArrowRight');
  await expect(passados).toBeFocused();
  await expect(passados).toHaveAttribute('aria-selected', 'true');
  await expect(passados).toHaveAttribute('tabindex', '0');
  await expect(proximos).toHaveAttribute('aria-selected', 'false');
  await expect(page.getByRole('tabpanel', { name: /Passados/i })).toBeVisible();

  await page.keyboard.press('ArrowLeft');
  await expect(proximos).toBeFocused();
  await expect(proximos).toHaveAttribute('aria-selected', 'true');
  await expect(passados).toHaveAttribute('aria-selected', 'false');
  await expect(page.getByRole('tabpanel', { name: /Próximos shows/i })).toBeVisible();

  // ArrowLeft on the first tab wraps to the last.
  await page.keyboard.press('ArrowLeft');
  await expect(tab(/Festivais/i)).toBeFocused();
  await expect(tab(/Festivais/i)).toHaveAttribute('aria-selected', 'true');
});
