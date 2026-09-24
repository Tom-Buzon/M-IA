import { mkdir,writeFile } from 'node:fs/promises';
const content={
fr:[
['Attic-Ai — Build, conseil & IA appliquée','Du conseil au produit : prototypes, applications et IA appliquée. Attic-Ai, l’atelier indépendant de Tom Buzon à Leiden.'],
['L’agence Attic-Ai — Services & méthode','Conseil, MVP, applications, IA, data, automatisation et création. Livrables, critères de réussite et brief de projet.'],
['Portfolio Attic-Ai — Mastermind, audio, vidéo & 3D','Les projets de Tom Buzon : Mastermind, VESPER, FrameForge, modélisation Blender et prototypes connectés.']],
en:[
['Attic-Ai — Build, consulting & applied AI','From advice to a working product: prototypes, applications and applied AI. Tom Buzon’s independent workshop in Leiden.'],
['Attic-Ai studio — Services & process','Consulting, MVPs, applications, AI, data, automation and creative experiences. Deliverables, success criteria and project brief.'],
['Attic-Ai portfolio — Mastermind, audio, video & 3D','Projects by Tom Buzon: Mastermind, VESPER, FrameForge, Blender modelling and connected prototypes.']],
nl:[
['Attic-Ai — Bouw, advies & toegepaste AI','Van advies tot een werkend product: prototypes, applicaties en toegepaste AI. De onafhankelijke werkplaats van Tom Buzon in Leiden.'],
['Attic-Ai studio — Diensten & werkwijze','Advies, MVP’s, applicaties, AI, data, automatisering en creatieve ervaringen. Opleveringen, succescriteria en projectbriefing.'],
['Attic-Ai portfolio — Mastermind, audio, video & 3D','Projecten van Tom Buzon: Mastermind, VESPER, FrameForge, Blender-modellering en verbonden prototypes.']]
};
const pages=[['home',''],['agency','agence/'],['portfolio','portfolio/']];
for(const lang of ['fr','en','nl'])for(let i=0;i<pages.length;i++){
 const [page,route]=pages[i],prefix=lang==='fr'?'':lang+'/',directory=prefix+route;
 const [title,description]=content[lang][i];
 if(directory)await mkdir(directory,{recursive:true});
 const schema=JSON.stringify({'@context':'https://schema.org','@type':page==='portfolio'?'CollectionPage':'ProfessionalService',name:'Attic-Ai',description,inLanguage:lang,[page==='portfolio'?'author':'founder']:{'@type':'Person',name:'Tom Buzon'}});
 await writeFile(directory+'index.html','<!doctype html>\n<html lang="'+lang+'"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><meta name="theme-color" content="#090e15" /><link rel="icon" type="image/svg+xml" href="/favicon.svg" /><title>'+title+'</title><meta name="description" content="'+description+'" /><meta property="og:type" content="website" /><meta property="og:locale" content="'+({fr:'fr_FR',en:'en_GB',nl:'nl_NL'}[lang])+'" /><meta property="og:site_name" content="Attic-Ai" /><meta property="og:title" content="'+title+'" /><meta property="og:description" content="'+description+'" /><link rel="preconnect" href="https://fonts.googleapis.com" /><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />'+(page==='home'?'<link rel="preload" as="image" href="/images/attic-studio.webp" />':'')+'<script type="application/ld+json">'+schema+'</script></head><body data-page="'+page+'" data-locale="'+lang+'"><div id="root"></div><script type="module" src="/src/main.jsx"></script></body></html>');
}
