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