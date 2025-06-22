// twikit.js

(function() {
  // Add a class to body so content script or CSS could reference if needed
  document.body.classList.add("twikit-friend-mode");

  // Create a full-page transparent overlay to block all clicks
  const overlay = document.createElement("div");
  overlay.id = "twikitOverlay";
  Object.assign(overlay.style, {
    position: "fixed",
    top: "0",
    left: "0",
    width: "100%",
    height: "100%",
    background: "transparent",
    zIndex: "2147483646",
    pointerEvents: "auto"
  });
  document.body.appendChild(overlay);

  // Block mouse events on overlay (itself) so underlying UI cannot be clicked
  overlay.addEventListener("click", e => {
    e.stopPropagation();
    e.preventDefault();
  }, true);
  overlay.addEventListener("mousedown", e => {
    e.stopPropagation();
    e.preventDefault();
  }, true);
  overlay.addEventListener("mouseup", e => {
    e.stopPropagation();
    e.preventDefault();
  }, true);
  overlay.addEventListener("contextmenu", e => {
    e.stopPropagation();
    e.preventDefault();
  }, true);

  // Block keyboard events globally (e.g., liking via "L", navigating via keys, etc.)
  function blockKey(e) {
    e.stopImmediatePropagation();
    e.preventDefault();
  }
  window.addEventListener("keydown", blockKey, true);
  window.addEventListener("keypress", blockKey, true);
  window.addEventListener("keyup", blockKey, true);

  // Optionally hide any floating action buttons if you want purely read-only view.
  // But overlay already blocks clicks; the UI remains visible but not interactive.

  console.log("twikit: Friend mode active — interactions blocked.");
})();
