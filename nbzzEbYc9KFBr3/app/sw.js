const C='yjp-v6';
const F=['./','index.html','style.css','app.js','manifest.webmanifest','icon-180.png','icon-192.png','icon-512.png','fonts/Pretendard-Regular.woff2','fonts/Pretendard-Bold.woff2','emoji/hold.svg'].concat([...Array(12).keys()].map(i=>'emoji/p'+i+'.svg'));
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(F)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(caches.match(e.request,{ignoreSearch:true}).then(r=>r||fetch(e.request).then(res=>{const cp=res.clone();caches.open(C).then(c=>c.put(e.request,cp));return res;}).catch(()=>caches.match('index.html'))))});
