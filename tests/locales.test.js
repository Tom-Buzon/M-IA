import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';
import { readFile, access } from 'node:fs/promises';
test('language routing preserves anchors and data identifiers',async()=>{
 const vite=await createServer({configFile:false,server:{middlewareMode:true},appType:'custom'});
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
test('all nine built pages have local language, content, navigation and alternates',async t=>{
 try{await access('dist/nl/portfolio/index.html');}catch{t.skip('Run npm run build first to verify generated documents.');return;}
 for(const locale of ['fr','en','nl']){
  for(const route of ['', 'agence/', 'portfolio/']){
   const html=await readFile('dist/'+(locale==='fr'?'':locale+'/')+route+'index.html','utf8');
   assert.match(html,new RegExp('<html lang="'+locale+'"'));
   assert.equal((html.match(/<h1[ >]/g)||[]).length,1);
   assert.match(html,/hreflang="fr"/);assert.match(html,/hreflang="en"/);assert.match(html,/hreflang="nl"/);
   assert.ok(html.includes('href="/'+(locale==='fr'?'':locale+'/')+'agence/"'));
   if(!route)assert.ok(!html.includes('Mastermind'));
   if(route==='portfolio/')assert.ok(html.includes('Mastermind'));
   if(locale==='nl')assert.ok(html.includes('De studio'));
   if(locale==='en')assert.ok(html.includes('The studio'));
  }
 }
});
