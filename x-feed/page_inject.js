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