

export function initDashboard() {
  loadGlobalUsers();
  loadFriendCards();
  loadAddedByCards();
  setupPublicToggle();
  
  document.getElementById("logoutBtn").onclick = () => {
  chrome.storage.local.clear(() => {
    loadPage("login");
  });
};

}

function loadGlobalUsers() {
  const list = document.getElementById("globalUserList");
  const searchInput = document.getElementById("globalSearch");


  chrome.storage.local.get(["loggedInUser"], ({ loggedInUser }) => {
    if (!loggedInUser || !loggedInUser.email){
        alert("You are not logged in.");
        loadPage("login");
    } 
    fetch("http://localhost:3000/allUsers")
      .then(res => res.json())
      .then(users => {
        const filtered = users.filter(u => u.email !== loggedInUser.email && !loggedInUser.friends.includes(u.email));
        render(filtered);

        searchInput.oninput = () => {
          const q = searchInput.value.toLowerCase();
          const filtered = users.filter(u =>
            u.email !== loggedInUser.email &&
            !loggedInUser.friends.includes(u.email) &&
            u.email.toLowerCase().includes(q)
          );
          render(filtered);
        };
      });