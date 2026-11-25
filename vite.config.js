import {defineConfig} from 'vite';
import {createHash} from 'node:crypto';
export default defineConfig({base:'./',plugins:[{name:'offline',generateBundle(_,bundle){
const revision=createHash('sha256').update(Object.keys(bundle).sort().join('|')).digest('hex').slice(0,12);
const files=['./','./manifest.webmanifest','./icons/icon.svg','./icons/icon-180.png','./icons/icon-192.png','./icons/icon-512.png',...Object.keys(bundle).map(p=>'./'+p)];
this.emitFile({type:'asset',fileName:'sw.js',source:`const CACHE='shizhang-${revision}',FILES=${JSON.stringify(files)};self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES))));self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('shizhang-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||new URL(e.request.url).origin!==self.location.origin)return;e.respondWith(caches.open(CACHE).then(async c=>(await c.match(e.request,{ignoreSearch:e.request.mode==='navigate',ignoreVary:true}))||fetch(e.request)));});`});}}]});
