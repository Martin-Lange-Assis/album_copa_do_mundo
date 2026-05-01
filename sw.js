const CACHE_NAME = 'album-copa-2026-v3';

const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './script.js',
    './selecoes.js',
    './manifest.json',
    './icon-192.png',
    './icon-512.png',
    './bandeiras/',
    './bandeiras/FWC.svg',
    './bandeiras/COK.svg',
    './bandeiras/MEX.svg',
    './bandeiras/RSA.svg',
    './bandeiras/KOR.svg',
    './bandeiras/CZE.svg',
    './bandeiras/CAN.svg',
    './bandeiras/BIH.svg',
    './bandeiras/QAT.svg',
    './bandeiras/SUI.svg',
    './bandeiras/BRA.svg',
    './bandeiras/MAR.svg',
    './bandeiras/HAI.svg',
    './bandeiras/SCO.svg',
    './bandeiras/USA.svg',
    './bandeiras/PAR.svg',
    './bandeiras/AUS.svg',
    './bandeiras/TUR.svg',
    './bandeiras/GER.svg',
    './bandeiras/CUW.svg',
    './bandeiras/CIV.svg',
    './bandeiras/ECU.svg',
    './bandeiras/NED.svg',
    './bandeiras/JPN.svg',
    './bandeiras/SWE.svg',
    './bandeiras/TUN.svg',
    './bandeiras/BEL.svg',
    './bandeiras/EGY.svg',
    './bandeiras/IRN.svg',
    './bandeiras/NZL.svg',
    './bandeiras/ESP.svg',
    './bandeiras/CPV.svg',
    './bandeiras/KSA.svg',
    './bandeiras/URU.svg',
    './bandeiras/FRA.svg',
    './bandeiras/SEN.svg',
    './bandeiras/IRQ.svg',
    './bandeiras/NOR.svg',
    './bandeiras/ARG.svg',
    './bandeiras/ALG.svg',
    './bandeiras/AUT.svg',
    './bandeiras/JOR.svg',
    './bandeiras/POR.svg',
    './bandeiras/COD.svg',
    './bandeiras/UZB.svg',
    './bandeiras/COL.svg',
    './bandeiras/ENG.svg',
    './bandeiras/CRO.svg',
    './bandeiras/GHA.svg',
    './bandeiras/PAN.svg'
];

// Instalação: Guarda tudo no cache e força a atualização imediata
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('PWA: Arquivos guardados no cache!');
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting(); // Faz o novo Service Worker assumir na hora
});

// Ativação: O "Lixeiro" - Apaga os caches antigos (da versão v1)
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('PWA: Apagando cache antigo:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim(); // Atualiza todas as telas abertas instantaneamente
});

// Interceptador: Estratégia "Stale-While-Revalidate"
self.addEventListener('fetch', (event) => {
    // Evita interceptar requisições que não sejam GET (como POSTs) e requisições de extensões do Chrome
    if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) {
        return;
    }

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            // Cria uma requisição para a rede
            const fetchPromise = fetch(event.request).then((networkResponse) => {
                // Se a requisição deu certo, atualiza o cache com a nova versão
                if (networkResponse && networkResponse.status === 200) {
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, networkResponse.clone());
                    });
                }
                return networkResponse;
            }).catch(() => {
                // Opcional: Aqui você pode retornar uma página offline genérica se a rede falhar
                console.log('PWA: Usuário offline e recurso não cacheado.');
            });

            // Retorna o cache imediatamente (se existir). 
            // Paralelamente, o fetchPromise vai atualizar o cache no background.
            // Se NÃO existir no cache, ele espera a resposta da rede.
            return cachedResponse || fetchPromise;
        })
    );
});
