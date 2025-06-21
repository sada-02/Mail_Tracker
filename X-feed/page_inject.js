// page_inject.js

(function() {
  if (window.__twikit_captureInjected) return;
  window.__twikit_captureInjected = true;

  // Helper: extract URL string from fetch resource
  function getResourceUrl(resource) {
    try {
      if (typeof resource === 'string') {
        return resource;
      } else if (resource instanceof Request) {
        return resource.url;
      }
    } catch (_) {}
    return null;
  }

  // Helper: log headers object or Headers instance
  function logHeaders(initHeaders) {
    try {
      if (!initHeaders) return null;
      // initHeaders can be a plain object, Headers instance, or array of [key,v]
      if (initHeaders instanceof Headers) {
        const obj = {};
        for (const [k, v] of initHeaders.entries()) {
          obj[k] = v;
        }
        return obj;
      }
      if (Array.isArray(initHeaders)) {
        // array of [key, value]
        const obj = {};
        initHeaders.forEach(pair => {
          if (Array.isArray(pair) && pair.length >= 2) {
            obj[pair[0]] = pair[1];
          }
        });
        return obj;
      }
      if (typeof initHeaders === 'object') {
        return initHeaders;
      }
    } catch (_) {}
    return null;
  }

  // Override fetch to log every call
  const origFetch = window.fetch;
  window.fetch = function(resource, init) {
    try {
      const url = getResourceUrl(resource);
      const headersLog = logHeaders(init && init.headers);
      console.debug('twikit: fetch called:', url, headersLog);
      // If you want automatic capture, you can check:
      // if (!window.__twikit_feedCaptured && url && url.includes('/HomeTimeline')) { ... capture logic ... }
    } catch (e) {
      console.warn('twikit: fetch override error', e);
    }
    return origFetch.call(this, resource, init);
  };

  // Override XMLHttpRequest to log URLs
  const origOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(method, url) {
    try {
      this._twikit_url = url;
    } catch (_) {}
    return origOpen.apply(this, arguments);
  };
  const origSend = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.send = function(body) {
    this.addEventListener('loadstart', () => {
      try {
        console.debug('twikit: XHR request to:', this._twikit_url);
      } catch (_) {}
    });
    this.addEventListener('load', () => {
      try {
        console.debug('twikit: XHR response from:', this._twikit_url, 'status:', this.status);
      } catch (_) {}
    });
    return origSend.apply(this, arguments);
  };

  console.log('twikit: page_inject.js initialized for capture');
})();
