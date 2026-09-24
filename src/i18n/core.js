import catalog from './catalog.json';
import { publicUrl } from '../lib/publicUrl';
export const locales = ['fr', 'en', 'nl'];
export function translate(text, locale = 'fr') {
  if (locale === 'fr' || typeof text !== 'string') return text;
  if (catalog[text]?.[locale]) return catalog[text][locale];
  const clean = text.trim();
  const translated = catalog[clean]?.[locale];
  return translated ? text.slice(0, text.indexOf(clean)) + translated + text.slice(text.indexOf(clean) + clean.length) : text;
}
export function localizeData(data, locale) {
  if (typeof data === 'string') return translate(data, locale);
  if (Array.isArray(data)) return data.map(value => localizeData(value, locale));
  if (data && typeof data === 'object') return Object.fromEntries(Object.entries(data).map(([key,value]) => [key, key === 'id' ? value : localizeData(value, locale)]));
  return data;
}
export function localeUrl(path, locale = 'fr') {
  if (!path.startsWith('/') || path.startsWith('//') || path.startsWith('/api/')) return path;
  const base = import.meta.env.BASE_URL;
  const unprefixed = base !== '/' && path.startsWith(base) ? '/' + path.slice(base.length) : path;
  const clean = unprefixed.replace(/^\/(en|nl)(?=\/|$)/, '') || '/';
  return publicUrl(locale === 'fr' ? clean : '/' + locale + clean);
}
