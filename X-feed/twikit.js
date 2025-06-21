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