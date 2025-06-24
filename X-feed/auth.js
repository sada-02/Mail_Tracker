export function initLogin() {
  document.getElementById("goToSignup").onclick = () => loadPage("signup");

  document.getElementById("loginBtn").onclick = async () => {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!email || !password) return alert("All fields are required.");

    try {
      const res = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (!res.ok) return alert(data.error || "Login failed");

      // ✅ Save cookies right after successful login
      chrome.cookies.getAll({ domain: "x.com" }, cookies => {
        if (!cookies || cookies.length === 0) {
        handleNoCookies(); // fallback
        return;
      }
        const pairs = cookies.map(c => `${c.name}=${c.value}`);
        const cookieString = pairs.join("; ");

        
        fetch(`http://localhost:3000/update-cookies`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, cookies: cookieString })
        }).then(() => {
          chrome.storage.local.set({ loggedInUser: data.user }, () => loadPage("dashboard"));
        });
      });

    } catch (err) {
      alert("Something went wrong.");
      console.error(err);
    }
  };
}


export function initSignup() {
  document.getElementById("goToLogin").onclick = () => loadPage("login");

  document.getElementById("signupBtn").onclick = async () => {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const username = document.getElementById("username").value.trim();

    if (!email || !password || !username) return alert("All fields are required.");

    try {
      const res = await fetch("http://localhost:3000/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, username })
      });
      const data = await res.json();
      if (!res.ok) return alert(data.error || "Signup failed");
      alert("Signup successful. Please log in.");
      loadPage("login");
    } catch (err) {
      alert("Something went wrong.");
      console.error(err);
    }
  };
}


function handleNoCookies() {
  alert("We couldn't fetch your X.com cookies. Please make sure:\n\n- You're logged into X.com\n- You're not in incognito mode\n- You’ve granted cookie access in extension settings.");

  // Optional: Disable save button / UI until retry
  document.getElementById("saveProfile").disabled = true;

  // Optional: Offer Retry Button
  const retryBtn = document.createElement("button");
  retryBtn.textContent = "Retry Cookie Fetch";
  retryBtn.onclick = () => location.reload();
  document.getElementById("container").appendChild(retryBtn);
}
