import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';
import { readFile, access } from 'node:fs/promises';

test('language routing preserves anchors and data identifiers',async()=>{
 const vite=await createServer({configFile:false,optimizeDeps:{noDiscovery:true,include:[]},server:{middlewareMode:true},appType:'custom'});
 try{
  const {translate,localeUrl,localizeData}=await vite.ssrLoadModule('/src/i18n/core.js');
  assert.equal(localeUrl('/agence/#brief','nl'),'/nl/agence/#brief');
  assert.equal(localeUrl('/en/portfolio/','fr'),'/portfolio/');
  assert.equal(localeUrl('https://example.com/','nl'),'https://example.com/');
  assert.equal(translate('L’agence','en'),'The studio');
  assert.equal(translate('Une idée','nl'),'Een idee');
  assert.equal(translate(' Votre besoin ','en'),' Your need ');
  assert.deepEqual(localizeData({id:'Contexte',title:'Contexte'},'en'),{id:'Contexte',title:'Context'});
 }finally{await vite.close();}
});

test('project-site routes, language switches and runtime textures retain the deployment prefix',async()=>{
 const vite=await createServer({configFile:false,optimizeDeps:{noDiscovery:true,include:[]},base:'/M-IA/',server:{middlewareMode:true},appType:'custom'});
 try{
  const {localeUrl}=await vite.ssrLoadModule('/src/i18n/core.js');
  const {publicUrl}=await vite.ssrLoadModule('/src/lib/publicUrl.js');
  assert.equal(localeUrl('/agence/#brief','nl'),'/M-IA/nl/agence/#brief');
  assert.equal(localeUrl('/M-IA/en/portfolio/#vesper','fr'),'/M-IA/portfolio/#vesper');
  assert.equal(localeUrl('/','en'),'/M-IA/en/');
  assert.equal(localeUrl('#methode','nl'),'#methode');
  assert.equal(localeUrl('https://example.com/','en'),'https://example.com/');
  assert.equal(publicUrl('/images/vesper.webp'),'/M-IA/images/vesper.webp');
  assert.equal(publicUrl('/M-IA/images/vesper.webp'),'/M-IA/images/vesper.webp');
  assert.equal(publicUrl('//example.com/image.webp'),'//example.com/image.webp');
 }finally{await vite.close();}
});

test('all nine built pages have compiled assets, valid local links, languages and alternates',async t=>{
 try{await access('dist/nl/portfolio/index.html');}catch{t.skip('Run npm run build first to verify generated documents.');return;}
 const home=await readFile('dist/index.html','utf8');
 const base=home.match(/src="([^"]*\/)assets\/[^"/]+\.js"/)?.[1];
 assert.ok(base,'HTML must reference compiled JavaScript, not /src/main.jsx');
 for(const locale of ['fr','en','nl'])for(const route of ['', 'agence/', 'portfolio/']){
   const html=await readFile('dist/'+(locale==='fr'?'':locale+'/')+route+'index.html','utf8');
   assert.match(html,new RegExp('<html lang="'+locale+'"'));
   assert.equal((html.match(/<h1[ >]/g)||[]).length,1);
   assert.match(html,/hreflang="fr"/);assert.match(html,/hreflang="en"/);assert.match(html,/hreflang="nl"/);
   assert.ok(html.includes('href="'+base+(locale==='fr'?'':locale+'/')+'agence/"'));
   if(!route)assert.ok(!html.includes('Mastermind'));
   if(route==='portfolio/')assert.ok(html.includes('Mastermind'));
   if(locale==='nl')assert.ok(html.includes('De studio'));
   if(locale==='en')assert.ok(html.includes('The studio'));
   for(const [,url] of html.matchAll(/(?:href|src)="(\/[^"#?]*)[^" ]*"/g)){
     if(url.startsWith('//'))continue;
     assert.ok(url.startsWith(base),`Unprefixed URL: ${url}`);
     const file=url.slice(base.length);
     await access('dist/'+file+(file.endsWith('/')||!file?'index.html':''));
   }
 }
 if(base==='/M-IA/'){
   assert.ok(!home.includes('chat-launcher'),'the static demo must not offer the unavailable API');
   await access('dist/.nojekyll');
 }
});
