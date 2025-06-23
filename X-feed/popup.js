
function loadPage(view) {
  console.log("Loading page:", view);

  chrome.storage.local.set({ currentPage: view });  // <-- set current view

  fetch(`${view}.html`)
    .then(res => res.text())
    .then(html => {
      document.getElementById("container").innerHTML = html;

      if (view === "login") import("./auth.js").then(m => m.initLogin());
      if (view === "signup") import("./auth.js").then(m => m.initSignup());
      if (view === "dashboard") import("./dashboard.js").then(m => m.initDashboard());
    });
}


chrome.storage.local.get(["loggedInUser", "currentPage"], (data) => {
  if (data.currentPage) {
    loadPage(data.currentPage); // Load last requested page
  } else {
    if (data.loggedInUser) {
      loadPage("dashboard");
    } else {
      loadPage("login");
    }
  }
});
