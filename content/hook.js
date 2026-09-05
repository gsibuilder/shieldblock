// ShieldBlock Main-World API Hook (Web & YouTube Ad Interceptor)

(function () {
  'use strict';

  // Prevent multiple injections
  if (window.__SHIELDBLOCK_HOOK_INJECTED__) return;
  window.__SHIELDBLOCK_HOOK_INJECTED__ = true;

  const AD_URL_PATTERNS = [
    /doubleclick\.net/i,
    /googlesyndication\.com/i,
    /adservice\.google\.com/i,
    /amazon-adsystem\.com/i,
    /adnxs\.com/i,
    /taboola\.com/i,
    /outbrain\.com/i,
    /popads\.net/i,
    /popcash\.net/i,
    /youtube\.com\/api\/stats\/ads/i,
    /youtube\.com\/pagead\//i,
    /googleads\.g\.doubleclick\.net/i
  ];

  function isAdUrl(url) {
    if (!url) return false;
    const urlStr = String(url);
    return AD_URL_PATTERNS.some(pattern => pattern.test(urlStr));
  }

  // --- 1. YouTube JSON Player Response Sanitize Hook ---
  function sanitizeYouTubeData(obj) {
    if (!obj || typeof obj !== 'object') return obj;

    // Delete YouTube ad containers
    delete obj.adPlacements;
    delete obj.playerAds;
    delete obj.adSlots;
    delete obj.adBreakHeartbeatParams;

    if (obj.playerResponse) {
      delete obj.playerResponse.adPlacements;
      delete obj.playerResponse.playerAds;
    }

    return obj;
  }

  // Hook window.ytInitialPlayerResponse
  let originalYtResponse = window.ytInitialPlayerResponse;
  Object.defineProperty(window, 'ytInitialPlayerResponse', {
    get() {
      return originalYtResponse;
    },
    set(val) {
      originalYtResponse = sanitizeYouTubeData(val);
    },
    configurable: true,
    enumerable: true
  });

  // Hook window.ytInitialData
  let originalYtData = window.ytInitialData;
  Object.defineProperty(window, 'ytInitialData', {
    get() {
      return originalYtData;
    },
    set(val) {
      originalYtData = sanitizeYouTubeData(val);
    },
    configurable: true,
    enumerable: true
  });

  // --- 2. Window fetch Hook ---
  const originalFetch = window.fetch;
  window.fetch = async function (input, init) {
    const url = typeof input === 'string' ? input : (input && input.url ? input.url : '');

    // Block known ad network fetch requests
    if (isAdUrl(url)) {
      return new Response('', { status: 204, statusText: 'No Content' });
    }

    const response = await originalFetch.apply(this, arguments);

    // Intercept YouTube player API responses to strip ad payloads dynamically
    if (url.includes('/youtubei/v1/player')) {
      try {
        const clone = response.clone();
        const data = await clone.json();
        const sanitized = sanitizeYouTubeData(data);
        return new Response(JSON.stringify(sanitized), {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers
        });
      } catch (e) {
        return response;
      }
    }

    return response;
  };

  // --- 3. XMLHttpRequest Hook ---
  const origOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function (method, url) {
    this._shieldblock_url = url;
    if (isAdUrl(url)) {
      // Point blocked ad XHRs to blank data URI
      return origOpen.call(this, method, 'data:text/plain,');
    }
    return origOpen.apply(this, arguments);
  };
})();
