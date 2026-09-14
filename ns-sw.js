// Cache only the same-origin demo shell; never cache external requests.
const CACHE='ns-demo-shell-v1';
const ASSETS=['nirmaan-setu-site-report.html', 'nirmaan-setu-ai-processing.html', 'nirmaan-setu-match-confirmation.html', 'nirmaan-setu-planner-review.html', 'nirmaan-setu-dashboard.html', 'nirmaan-setu-history.html', 'nirmaan-setu-sync.html', 'nirmaan-setu-delay-conflict.html', 'nirmaan-setu-settings.html', 'nirmaan-setu.css', 'ns-demo-core.js', 'ns-demo.js', 'ns-cookies.js'];
self.addEventListener('install', e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));});
self.addEventListener('activate', e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('ns-demo-shell-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch', e=>{
 const u=new URL(e.request.url);
 if(e.request.method!=='GET'||u.origin!==self.location.origin||!ASSETS.some(a=>u.pathname.endsWith('/'+a)))return;
 e.respondWith(fetch(e.request).catch(()=>caches.match(u.origin+u.pathname)));
});
