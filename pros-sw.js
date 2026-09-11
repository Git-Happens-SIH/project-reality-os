// Cache only the same-origin demo shell; never cache external requests.
const CACHE='pros-demo-shell-v1';
const ASSETS=['project-reality-os-site-report.html', 'project-reality-os-ai-processing.html', 'project-reality-os-match-confirmation.html', 'project-reality-os-planner-review.html', 'project-reality-os-dashboard.html', 'project-reality-os-history.html', 'project-reality-os-sync.html', 'project-reality-os-delay-conflict.html', 'project-reality-os-settings.html', 'project-reality-os.css', 'pros-demo-core.js', 'pros-demo.js', 'pros-cookies.js'];
self.addEventListener('install', e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));});
self.addEventListener('activate', e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('pros-demo-shell-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch', e=>{
 const u=new URL(e.request.url);
 if(e.request.method!=='GET'||u.origin!==self.location.origin||!ASSETS.some(a=>u.pathname.endsWith('/'+a)))return;
 e.respondWith(fetch(e.request).catch(()=>caches.match(u.origin+u.pathname)));
});
