import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {fileURLToPath} from 'node:url';
const input={};
for(const lang of ['fr','en','nl'])for(const [page,route]of [['home',''],['agency','agence/'],['portfolio','portfolio/']]){
 input[lang+'-'+page]=fileURLToPath(new URL('./'+(lang==='fr'?'':lang+'/')+route+'index.html',import.meta.url));
}
export default defineConfig({
 base:process.env.SITE_BASE || '/',
 plugins:[react()],
 build:{rollupOptions:{input}},
 server:{proxy:{'/api':'http://127.0.0.1:3001'}},
 preview:{proxy:{'/api':'http://127.0.0.1:3001'}},
});
