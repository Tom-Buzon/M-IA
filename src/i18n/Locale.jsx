import { createContext, useContext, useMemo } from 'react';
import PropTypes from 'prop-types';
import { translate, localizeData, localeUrl } from './core';
const LocaleContext = createContext(null);
export function LocaleProvider({ locale = 'fr', children }) {
  const value = useMemo(() => ({ locale, t: text => translate(text, locale), localize: data => localizeData(data, locale), url: path => localeUrl(path, locale) }), [locale]);
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}
LocaleProvider.propTypes = { locale: PropTypes.string, children: PropTypes.node };
// Shared by page content and interactive controls.
// eslint-disable-next-line react-refresh/only-export-components
export function useLocale() {
  const value = useContext(LocaleContext);
  if (!value) throw new Error('LocaleProvider is required');
  return value;
}
