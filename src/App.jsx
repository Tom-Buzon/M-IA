import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import Home from './pages/Home';
import Agency from './pages/Agency';
import Portfolio from './pages/Portfolio';
import Chatbot from './components/chat/Chatbot';
import { email } from './data';
import { LocaleProvider, useLocale } from './i18n/Locale';
import { localeUrl } from './i18n/core';
import SignalText from './components/SignalText';
import AtticWorld from './components/AtticWorld';
import { useMotion } from './lib/useMotion';

const pages = [['home','/','Accueil'],['agency','/agence/','L’agence'],['portfolio','/portfolio/','Portfolio']];
const chapters = {
 home: [['top','Le départ'],['depart','Votre besoin'],['methode','La méthode'],['atelier','L’atelier'],['origine','L’origine'],['questions','Les questions'],['contact','Le contact']],
 agency: [['top','L’agence'],['services','Les services'],['methode','La méthode'],['mesures','Les mesures'],['tom','La personne'],['brief','Le brief']],
 portfolio: [['top','Portfolio'],['mastermind','La mémoire'],['vesper','L’écoute'],['frameforge','Le mouvement'],['matiere','L’espace'],['archives','Les détours']],
};
function Roof() { return <svg viewBox="0 0 38 32" aria-hidden="true"><path d="M3 27 19 5l16 22M11 27l8-11 8 11M19 5v-3" fill="none" stroke="currentColor" strokeWidth="2.2" /></svg>; }
function Shell({ page }) {
 const { t, locale, url } = useLocale();
 const [menu,setMenu] = useState(false);
 const [preview,setPreview] = useState(page);
 const [active,setActive] = useState('top');
 const [motion,setMotion] = useState(true);
 const [systemReduced,setSystemReduced] = useState(false);
 const modal=useRef(null), menuButton=useRef(null);
 const route=pages.find(p=>p[0]===page)?.[1]||'/';
 const next=pages[(pages.findIndex(p=>p[0]===page)+1)%pages.length];
 useMotion(motion, page);
 useEffect(()=>{
   const media=matchMedia('(prefers-reduced-motion: reduce)');
   const read=()=>{ setSystemReduced(media.matches); let saved; try {saved=localStorage.getItem('attic-motion');}catch { /* Storage can be unavailable in private browsing. */ } setMotion(!media.matches && saved!=='off'); };
   read(); media.addEventListener('change',read);
   return ()=>media.removeEventListener('change',read);
 },[]);
 useEffect(()=>{
   document.documentElement.dataset.motion=motion?'on':'off';
   window.dispatchEvent(new CustomEvent('attic:motion',{detail:motion}));
 },[motion]);
 useEffect(()=>{
   if(menu){ modal.current?.showModal(); document.body.classList.add('menu-is-open'); }
   else {modal.current?.close();document.body.classList.remove('menu-is-open');}
   return ()=>document.body.classList.remove('menu-is-open');
 },[menu]);
 useEffect(()=>{
   const nodes=chapters[page].map(([id])=>document.getElementById(id)).filter(Boolean);
   const observer=new IntersectionObserver(entries=>{
     entries.forEach(e=>{if(e.isIntersecting)setActive(e.target.id);});
   },{rootMargin:'-15% 0px -65% 0px'});
   nodes.forEach(n=>observer.observe(n));
   return ()=>observer.disconnect();
 },[page]);
 const closeMenu=()=>{setMenu(false);menuButton.current?.focus();};
 const languages=<div className="language-switch" role="group" aria-label={t('Choisir une langue')}>{['fr','en','nl'].map(lang=><a key={lang} href={localeUrl(route,lang)} hrefLang={lang} lang={lang} aria-current={lang===locale?'true':undefined} aria-label={{fr:'Français',en:'English',nl:'Nederlands'}[lang]}>{lang.toUpperCase()}</a>)}</div>;
 return <div className={'site page-'+page} id="top">
   <AtticWorld page={page}/>
   <a className="skip-link" href="#main">{t('Aller au contenu')}</a>
   <div className="reading-progress" aria-hidden="true"><i /></div>
   <header className="site-header">
     <a className="brand" href={url('/')} aria-label={t('Attic-Ai — accueil')}><Roof/><span>attic-ai<span className="brand-point">.</span></span></a>
     <span className="header-location"><i /> LEIDEN / NL <span>—</span> {String(pages.findIndex(p=>p[0]===page)+1).padStart(2,'0')}</span>
     <div className="header-actions">{languages}<button ref={menuButton} className="nav-trigger" aria-expanded={menu} aria-controls="immersive-menu" onClick={()=>setMenu(true)}><SignalText text={t('Menu')}/><span className="menu-grid" aria-hidden="true">{Array.from({length:9},(_,i)=><i key={i}/>)}</span></button></div>
   </header>
   <dialog ref={modal} className="immersive-menu" id="immersive-menu" aria-label={t('Explorer Attic-Ai')} onCancel={e=>{e.preventDefault();closeMenu();}} onClick={e=>{if(e.target===modal.current)closeMenu();}}>
     <div className="menu-top"><a className="brand" href={url('/')}><Roof/><span>attic-ai.</span></a>{languages}<button className="nav-trigger" onClick={closeMenu}>{t('Fermer')} <span aria-hidden="true">×</span></button></div>
     <div className={'menu-art art-'+preview} aria-hidden="true"><div className="menu-art-frame"/><Roof/><span>ATTIC / SIGNAL</span></div>
     <nav aria-label={t('Navigation principale')} className="immersive-links">{pages.map(([id,path,label],i)=><a href={url(path)} key={id} aria-current={page===id?'page':undefined} onPointerEnter={()=>setPreview(id)} onFocus={()=>setPreview(id)}><span className="menu-number">0{i+1}</span><SignalText text={t(label)}/><span className="menu-arrow">↗</span></a>)}</nav>
     <div className="menu-bottom"><p>{t('Un pied dans le code.')}<br/>{t('L’autre dans le réel.')}</p><a href={url('/agence/#brief')}>{t('Parlons de votre projet')} ↗</a><a href={'mailto:'+email}>{email}</a></div>
   </dialog>
   <nav className="chapter-rail" aria-label={t('Navigation par chapitres')}>{chapters[page].map(([id,label],i)=><a key={id} href={'#'+id} aria-label={t(label)} aria-current={active===id?'location':undefined}><span>{t(label)}</span><i/><small>{String(i+1).padStart(2,'0')}</small></a>)}</nav>
   <main id="main">{page==='agency'?<Agency/>:page==='portfolio'?<Portfolio/>:<Home/>}</main>
   <footer className="site-footer">
    <div className="footer-top"><a className="brand" href={url('/')}><Roof/><span>attic-ai.</span></a><p>{t('Un atelier indépendant.')}<br/>{t('Des idées qui prennent forme.')}</p><a href={'mailto:'+email}>{email} ↗</a></div>
    <div className="footer-bottom"><span>{t('Tom Buzon · Leiden, Pays-Bas')}</span><nav aria-label={t('Liens de pied de page')}><a href={url('/agence/')}>{t('Services & méthode')}</a><a href={url('/portfolio/')}>{t('Projets & explorations')}</a><a href="https://linkedin.com/in/tom-buzon-93833b229" target="_blank" rel="noreferrer">LinkedIn ↗</a><a href={url('/agence/#confidentialite')}>{t('Données & contact')}</a></nav><span>© {new Date().getFullYear()} Attic-Ai</span></div>
    <a className="next-page" href={url(next[1])}><span>{t('Suite de la visite')} / 0{pages.indexOf(next)+1}</span><strong>{t(next[2])}</strong><b aria-hidden="true">↗</b></a>
   </footer>
   <button className="motion-toggle" disabled={systemReduced} title={systemReduced?t('Le mouvement est réduit dans les préférences de votre appareil.'):undefined} aria-pressed={!motion} onClick={()=>{const next=!motion;setMotion(next);try{localStorage.setItem('attic-motion',next?'on':'off');}catch { /* Storage can be unavailable in private browsing. */ }}}><span className="motion-bars" aria-hidden="true"><i/><i/><i/></span>{t(motion?'Mouvement activé':'Mouvement réduit')}</button>
   <Chatbot/>
 </div>;
}
Shell.propTypes={page:PropTypes.string.isRequired};
export default function App({page='home',locale='fr'}) {return <LocaleProvider locale={locale}><Shell page={page}/></LocaleProvider>;}
App.propTypes={page:PropTypes.string,locale:PropTypes.string};
