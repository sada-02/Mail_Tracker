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