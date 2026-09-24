import { createServer } from 'vite';
import { readFile,writeFile } from 'node:fs/promises';
const vite=await createServer({mode:'production',server:{middlewareMode:true},appType:'custom'});
try{
 const {render}=await vite.ssrLoadModule('/src/entry-server.jsx');
 for(const locale of ['fr','en','nl'])for(const [page,route] of [['home',''],['agency','agence/'],['portfolio','portfolio/']]){
  const path='dist/'+(locale==='fr'?'':locale+'/')+route+'index.html';
  const alternates=['fr','en','nl'].map(l=>'<link rel="alternate" hreflang="'+l+'" href="'+vite.config.base+(l==='fr'?'':l+'/')+route+'" />').join('');
  const html=(await readFile(path,'utf8')).replace('</head>',alternates+'</head>');
  await writeFile(path,html.replace('<div id="root"></div>','<div id="root">'+render(page,locale)+'</div>'));
  console.log('HTML: '+path);
 }
 await writeFile('dist/.nojekyll','');
}finally{await vite.close();}
