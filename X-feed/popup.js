
function loadPage(view) {
  console.log("Loading page:", view);

  chrome.storage.local.set({ currentPage: view });  // <-- set current view
