/**
 * AD-002: the single empty-section rule. A section renders only when its data has content:
 * a non-empty array, an object with at least one key, or a string with non-blank text.
 */
export function hasContent(data: unknown): boolean {
  if (data === null || data === undefined) return false;
  if (typeof data === 'string') return data.trim() !== '';
  if (Array.isArray(data)) return data.length > 0;
  if (typeof data === 'object') return Object.keys(data).length > 0;
  return true;
}
