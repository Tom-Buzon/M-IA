import { renderToString } from 'react-dom/server';
import App from './App.jsx';
export function render(page,locale='fr') { return renderToString(<App page={page} locale={locale} />); }
