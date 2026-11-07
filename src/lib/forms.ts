export const MSG_REQUIRED = 'Campo obrigatório';
export const MSG_EMAIL = 'Informe um e-mail válido';

export interface FieldRule {
  required?: boolean;
  email?: boolean;
}

/** Field name → rule, in the order the fields appear on the form. */
export type FormSchema = Record<string, FieldRule>;
export type FormValues = Record<string, string | boolean | undefined>;
/** Field name → message, in schema order, so the first key is the field to focus (CONT-04). */
export type FormErrors = Record<string, string>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const isEmpty = (value: FormValues[string]) =>
  value === undefined || value === false || (typeof value === 'string' && value.trim() === '');

/** CONT-04: required fields (a checkbox must be checked) and e-mail format. */
export function validate(values: FormValues, schema: FormSchema): FormErrors {
  const errors: FormErrors = {};
  for (const [name, rule] of Object.entries(schema)) {
    const value = values[name];
    if (isEmpty(value)) {
      if (rule.required) errors[name] = MSG_REQUIRED;
    } else if (rule.email && !(typeof value === 'string' && EMAIL.test(value.trim()))) {
      errors[name] = MSG_EMAIL;
    }
  }
  return errors;
}

export interface MailtoField {
  label: string;
  value: string;
}

// SPEC_DEVIATION: design.md lists buildMailto(to, departamento, fields); the subject also needs
// the sender's name, so it is a separate argument.
// Reason: CONT-07 subject is "<Departamento> - <nome>".
/**
 * CONT-07 / SHOW-08: mailto link with subject "<Departamento> - <nome>" and a body with one
 * "label: value" line per filled field. Percent-encoded (spaces as %20, lines as %0D%0A).
 */
export function buildMailto(
  to: string,
  departamento: string,
  nome: string,
  fields: readonly MailtoField[],
): string {
  const subject = `${departamento.trim()} - ${nome.trim()}`;
  const body = fields
    .filter((f) => f.value.trim() !== '')
    .map((f) => `${f.label}: ${f.value.trim()}`)
    .join('\r\n');
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export type SubmitResult = 'ok' | 'erro';

export interface SubmitOptions {
  timeoutMs?: number;
  fetch?: typeof fetch;
}

/**
 * CONT-05/06: POST the form as JSON. 'ok' on a 2xx response; 'erro' on any other status,
 * a network failure, or no response within timeoutMs (10 s by default).
 */
export async function submitForm(
  endpoint: string,
  data: Record<string, unknown>,
  { timeoutMs = 10_000, fetch: doFetch = globalThis.fetch }: SubmitOptions = {},
): Promise<SubmitResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await doFetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(data),
      signal: controller.signal,
    });
    return response.ok ? 'ok' : 'erro';
  } catch {
    return 'erro';
  } finally {
    clearTimeout(timer);
  }
}
