import { StrictMode } from 'react';
import { createRoot,hydrateRoot } from 'react-dom/client';
import './index.css';
import './motion.css';
import App from './App.jsx';
const root=document.getElementById('root');
const app=<StrictMode><App page={document.body.dataset.page} locale={document.body.dataset.locale||'fr'}/></StrictMode>;
if(root.hasChildNodes())hydrateRoot(root,app);else createRoot(root).render(app);
