

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

    function render(users) {
      list.innerHTML = '';
      users.forEach(user => {
        const li = document.createElement("li");
        li.className = "list-item";

        const span = document.createElement("span");
        span.textContent = user.email;

        const btn = document.createElement("button");
        btn.textContent = "Add";
        btn.className = "btn add-btn";
        btn.onclick = () => {
          fetch("http://localhost:3000/add-friend", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fromEmail: loggedInUser.email, toEmail: user.email })
          }).then(() => {
            loggedInUser.friends.push(user.email);
            chrome.storage.local.set({ loggedInUser }, () => {
              loadGlobalUsers();
              loadFriendCards();
              loadAddedByCards();
            });
          });
        };

        li.appendChild(span);
        li.appendChild(btn);
        list.appendChild(li);
      });
    }
  });
}

function loadFriendCards() {
  const container = document.getElementById("friendsList");
  container.innerHTML = '';
    
  chrome.storage.local.get(["loggedInUser"], ({ loggedInUser }) => {
    if (!loggedInUser) return;

    loggedInUser.friends.forEach(friendEmail => {
      const card = document.createElement("div");
      card.className = "card";

      const email = document.createElement("div");
      email.textContent = friendEmail;

      const btn = document.createElement("button");
      btn.textContent = "Remove";
      btn.className = "btn remove-btn";
      btn.onclick = () => {
        fetch("http://localhost:3000/remove-friend", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fromEmail: loggedInUser.email, toEmail: friendEmail })
        }).then(() => {
          loggedInUser.friends = loggedInUser.friends.filter(f => f !== friendEmail);
          chrome.storage.local.set({ loggedInUser }, () => {
            loadGlobalUsers();
            loadFriendCards();
          });
        });
      };

      card.appendChild(email);
      card.appendChild(btn);
      container.appendChild(card);
    });
  });
}

function loadAddedByCards() {
  const container = document.getElementById("addedByList");
  container.innerHTML = '';
  
  chrome.storage.local.get(["loggedInUser"], ({ loggedInUser }) => {
    if (!loggedInUser || !loggedInUser.email) return;
    
    const myCookies = loggedInUser.cookies;


    // Get full user info from DB to get fresh addedBy list
    fetch(`http://localhost:3000/user/${encodeURIComponent(loggedInUser.email)}`)
      .then(res => res.json())
      .then(updatedUser => {
        if (!updatedUser || !Array.isArray(updatedUser.addedBy)) return;

        // Store latest version
        chrome.storage.local.set({ loggedInUser: updatedUser });

        // For each user in 'addedBy', get their cookies
        updatedUser.addedBy.forEach(userEmail => {
          // Fetch each addedBy user to get their cookies
          fetch(`http://localhost:3000/user/${encodeURIComponent(userEmail)}`)
            .then(res => res.json())
            .then(friendUser => {
              const card = document.createElement("div");
              card.className = "card";

              const email = document.createElement("div");
              email.textContent = userEmail;

              const btn = document.createElement("button");
              btn.className = "btn view-btn";

              if (friendUser && friendUser.cookies) {
                btn.textContent = "Show Feed";
                btn.onclick = () => {
                  loadFriendSession(friendUser.email, friendUser.cookies);
                };
              } else {
                btn.textContent = "No Cookies";
                btn.disabled = true;
              }

              card.appendChild(email);
              card.appendChild(btn);
              container.appendChild(card);
            });
        });