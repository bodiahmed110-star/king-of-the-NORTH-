const CACHE_NAME='king-of-the-north-pwa-supabase-v3';
const APP_FILES=['/','/index.html','/admin.html','/manifest.webmanifest','/icons/icon-192.png','/icons/icon-512.png'];
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(APP_FILES)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE_NAME).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET')return;
  const url=new URL(request.url);
  if(url.origin!==self.location.origin)return;
  if(request.mode==='navigate'){
    const cacheKey=url.pathname==='/'?'/index.html':url.pathname;
    const fallback=(url.pathname==='/admin'||url.pathname==='/admin.html')?'/admin.html':'/index.html';
    event.respondWith(fetch(request).then(response=>{
      const copy=response.clone();caches.open(CACHE_NAME).then(cache=>cache.put(cacheKey,copy));return response;
    }).catch(()=>caches.match(cacheKey).then(hit=>hit||caches.match(fallback))));
    return;
  }
  event.respondWith(caches.match(request).then(cached=>cached||fetch(request).then(response=>{
    if(response&&response.ok){const copy=response.clone();caches.open(CACHE_NAME).then(cache=>cache.put(request,copy));}
    return response;
  })));
});
