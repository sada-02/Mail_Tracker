

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

  document.querySelectorAll(".tab-btn").forEach(button => {
    button.addEventListener("click", () => {
      const tab = button.dataset.tab;

      // Remove active class from all buttons and tab contents
      document.querySelectorAll(".tab-btn").forEach(btn => btn.classList.remove("active"));
      document.querySelectorAll(".tab-content").forEach(content => content.classList.remove("active"));

      // Add active class to the clicked button and its tab
      button.classList.add("active");
      document.getElementById(`tab-${tab}`).classList.add("active");
    });
  });


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

        // Show "Restore My Feed" button if session was switched
        if (typeof myCookies === "string" && myCookies.trim().length > 0) {
          const restoreBtn = document.createElement("button");
          restoreBtn.textContent = "Restore My Feed";
          restoreBtn.className = "btn remove-btn";
          restoreBtn.onclick = restoreMyCookies;

          container.appendChild(restoreBtn);
        }
      });
  });
}

function setupPublicToggle() {
  const toggle = document.getElementById("publicSwitch");

  chrome.storage.local.get(["loggedInUser"], ({ loggedInUser }) => {
    if (!loggedInUser) return;

    // Set initial toggle state
    toggle.checked = loggedInUser.public === true;

    toggle.onchange = () => {
      const makePublic = toggle.checked;

      fetch("http://localhost:3000/toggle-public", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userEmail: loggedInUser.email,
          makePublic
        })
      })
        .then(res => res.json())
        .then(() => {
          // Refetch updated user object
          return fetch(`http://localhost:3000/user/${encodeURIComponent(loggedInUser.email)}`);
        })
        .then(res => res.json())
        .then(updatedUser => {
          chrome.storage.local.set({ loggedInUser: updatedUser }, () => {
            loadGlobalUsers();
            loadFriendCards();
            loadAddedByCards();
            alert(`Your feed is now ${makePublic ? "public" : "friends-only"}.`);
          });
        })
        .catch(err => {
          console.error("Failed to toggle public mode:", err);
          alert("Something went wrong while toggling public mode.");
        });
    };
  });
}


function loadFriendSession(friendName, friendCookieString) {
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    const tab = tabs[0];

    if (!tab.url.startsWith("https://x.com")) {
      if (!confirm("You are not on x.com. Continue to load friend’s session?")) return;
    }

    // Remove current user's cookies
    removeAllXComCookies(() => {
      // Convert cookie string into an array of cookie objects
      const cookiePairs = friendCookieString.split(";").map(s => s.trim()).filter(Boolean);
      const cookiesArray = cookiePairs.map(pair => {
        const [name, value] = pair.split("=");
        return {
          name: name.trim(),
          value: value.trim(),
          domain: ".x.com",
          path: "/",
          secure: true,
          httpOnly: false
        };
      });

      // Set each cookie in browser
      cookiesArray.forEach(c => {
        chrome.cookies.set({
          url: "https://x.com",
          name: c.name,
          value: c.value,
          domain: c.domain,
          path: c.path,
          secure: c.secure,
          httpOnly: c.httpOnly
        });
      });

      // Wait and reload to X homepage
      setTimeout(() => {
        chrome.tabs.update(tab.id, { url: "https://x.com/home" });

        chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
          if (tabId === tab.id && info.status === "complete") {
            chrome.scripting.executeScript({
              target: { tabId: tab.id },
              files: ["twikit.js"]
            });
            chrome.tabs.onUpdated.removeListener(listener);
          }
        });
      }, 500);
    });
  });
}

function restoreMyCookies() {
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    const tab = tabs[0];
    if (!tab.url.startsWith("https://x.com")) {
      if (!confirm("You are not on x.com. Restore your session anyway?")) return;
    }

    chrome.storage.local.get(["loggedInUser"], ({ loggedInUser }) => {
      const cookieString = loggedInUser?.cookies;
      if (!cookieString || typeof cookieString !== "string" || cookieString.trim().length === 0) {
        return alert("No saved original cookies found.");
      }

      // Remove all current x.com cookies
      removeAllXComCookies(() => {
        const pairs = cookieString.split(";").map(p => p.trim()).filter(Boolean);

        pairs.forEach(pair => {
          const idx = pair.indexOf("=");
          if (idx > -1) {
            const name = pair.slice(0, idx).trim();
            const value = pair.slice(idx + 1).trim();
            if (name && value) {
              chrome.cookies.set({
                url: "https://x.com",
                name,
                value,
                domain: ".x.com",
                path: "/",
                secure: true,
                httpOnly: false
              });
            }
          }
        });

        setTimeout(() => {
          chrome.tabs.update(tab.id, { url: "https://x.com/home" });
          alert("Restored your session.");
        }, 500);
      });
    });
  });
}

function removeAllXComCookies(callback) {
  chrome.cookies.getAll({ domain: "x.com" }, cookies => {
    if (!cookies || cookies.length === 0) {
      callback();
      return;
    }
    let count = 0;
    cookies.forEach(c => {
      const domainNoDot = c.domain.startsWith(".") ? c.domain.slice(1) : c.domain;
      const url = `https://${domainNoDot}${c.path}`;
      chrome.cookies.remove({ url: url, name: c.name }, () => {
        count++;
        if (count >= cookies.length) {
          callback();
        }
      });
    });
    // fallback if removal events don’t fire
    setTimeout(() => {
      callback();
    }, 1500);
  });
}

