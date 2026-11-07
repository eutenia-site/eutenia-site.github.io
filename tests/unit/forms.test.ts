import { afterEach, describe, expect, test, vi } from 'vitest';
import { buildMailto, submitForm, validate, type FormSchema } from '../../src/lib/forms';

const contato: FormSchema = {
  nome: { required: true },
  email: { required: true, email: true },
  telefone: {},
  departamento: { required: true },
  mensagem: { required: true },
  consentimento: { required: true },
};

const valid = {
  nome: 'Ana Souza',
  email: 'ana@exemplo.com.br',
  telefone: '',
  departamento: 'Imprensa',
  mensagem: 'Olá',
  consentimento: true,
};

describe('validate (CONT-04)', () => {
  test('CONT-04 empty required fields report Campo obrigatório in form order', () => {
    const errors = validate({ telefone: '', consentimento: false }, contato);
    expect(errors).toEqual({
      nome: 'Campo obrigatório',
      email: 'Campo obrigatório',
      departamento: 'Campo obrigatório',
      mensagem: 'Campo obrigatório',
      consentimento: 'Campo obrigatório',
    });
    expect(Object.keys(errors)[0]).toBe('nome');
  });

  test('CONT-04 invalid e-mail reports Informe um e-mail válido', () => {
    for (const email of ['ana', 'ana@', 'ana@exemplo', 'ana exemplo@x.com', '@exemplo.com']) {
      expect(validate({ ...valid, email }, contato)).toEqual({ email: 'Informe um e-mail válido' });
    }
  });

  test('whitespace-only counts as empty; a valid form has no errors', () => {
    expect(validate({ ...valid, nome: '   ' }, contato)).toEqual({ nome: 'Campo obrigatório' });
    expect(validate(valid, contato)).toEqual({});
  });

  test('an empty optional e-mail field is not an error, a malformed one is', () => {
    const schema: FormSchema = { email: { email: true } };
    expect(validate({ email: '' }, schema)).toEqual({});
    expect(validate({ email: 'x@' }, schema)).toEqual({ email: 'Informe um e-mail válido' });
  });
});

describe('buildMailto (CONT-07, SHOW-08)', () => {
  test('CONT-07 mailto has subject Departamento - nome and filled fields', () => {
    const href = buildMailto('contato@eutenia.com.br', 'Imprensa', 'Ana Souza', [
      { label: 'Nome/Empresa', value: 'Ana Souza' },
      { label: 'E-mail', value: 'ana@exemplo.com.br' },
      { label: 'Telefone/WhatsApp', value: '' },
      { label: 'Departamento', value: 'Imprensa' },
      { label: 'Cidade/Estado', value: '   ' },
      { label: 'Mensagem', value: 'Entrevista & fotos +1' },
    ]);
    expect(href).toBe(
      'mailto:contato@eutenia.com.br' +
        '?subject=Imprensa%20-%20Ana%20Souza' +
        '&body=Nome%2FEmpresa%3A%20Ana%20Souza%0D%0A' +
        'E-mail%3A%20ana%40exemplo.com.br%0D%0A' +
        'Departamento%3A%20Imprensa%0D%0A' +
        'Mensagem%3A%20Entrevista%20%26%20fotos%20%2B1',
    );
    const [, query] = href.split('?');
    const params = Object.fromEntries(
      query.split('&').map((p) => p.split('=').map(decodeURIComponent)),
    );
    expect(params.subject).toBe('Imprensa - Ana Souza');
    expect(params.body.split('\r\n')).toEqual([
      'Nome/Empresa: Ana Souza',
      'E-mail: ana@exemplo.com.br',
      'Departamento: Imprensa',
      'Mensagem: Entrevista & fotos +1',
    ]);
    expect(href).not.toContain('+');
  });

  test('SHOW-08 booking subject is Booking - nome, accents encoded', () => {
    const href = buildMailto('contato@eutenia.com.br', 'Booking', 'João Produções', [
      { label: 'Cidade/UF', value: 'São Paulo/SP' },
    ]);
    expect(href).toBe(
      'mailto:contato@eutenia.com.br?subject=Booking%20-%20Jo%C3%A3o%20Produ%C3%A7%C3%B5es' +
        '&body=Cidade%2FUF%3A%20S%C3%A3o%20Paulo%2FSP',
    );
  });
});

describe('submitForm (CONT-05, CONT-06)', () => {
  afterEach(() => vi.useRealTimers());

  const respond = (status: number) =>
    vi.fn(async (_url: RequestInfo | URL, _init?: RequestInit) => new Response('{}', { status }));

  test('CONT-05 2xx response returns ok after a JSON POST to the endpoint', async () => {
    const fetch = respond(200);
    const result = await submitForm('https://formspree.io/f/abc', valid, { fetch });
    expect(result).toBe('ok');
    const [url, init] = fetch.mock.calls[0];
    expect(url).toBe('https://formspree.io/f/abc');
    expect(init?.method).toBe('POST');
    expect(init?.headers).toEqual({
      'Content-Type': 'application/json',
      Accept: 'application/json',
    });
    expect(JSON.parse(String(init?.body))).toEqual(valid);
  });

  test('CONT-06 HTTP 500 returns erro', async () => {
    expect(await submitForm('https://x.test/f', valid, { fetch: respond(500) })).toBe('erro');
    expect(await submitForm('https://x.test/f', valid, { fetch: respond(404) })).toBe('erro');
  });

  test('CONT-06 network failure returns erro', async () => {
    const fetch = vi.fn(async () => {
      throw new TypeError('Failed to fetch');
    });
    expect(await submitForm('https://x.test/f', valid, { fetch })).toBe('erro');
  });

  test('CONT-06 no response within 10 s returns erro', async () => {
    vi.useFakeTimers();
    const fetch = vi.fn(
      (_url: RequestInfo | URL, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => reject(new DOMException('', 'AbortError')));
        }),
    );
    let settled: string | undefined;
    const pending = submitForm('https://x.test/f', valid, { fetch }).then((r) => (settled = r));
    await vi.advanceTimersByTimeAsync(9_999);
    expect(settled).toBeUndefined();
    await vi.advanceTimersByTimeAsync(1);
    await pending;
    expect(settled).toBe('erro');
  });

  test('a custom timeout applies', async () => {
    vi.useFakeTimers();
    const fetch = vi.fn(
      (_url: RequestInfo | URL, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => reject(new DOMException('', 'AbortError')));
        }),
    );
    const pending = submitForm('https://x.test/f', valid, { fetch, timeoutMs: 500 });
    await vi.advanceTimersByTimeAsync(500);
    expect(await pending).toBe('erro');
  });
});
