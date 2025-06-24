
import express from "express";
import cors from "cors";
import fs from "fs";
import bodyParser from "body-parser";

const app = express();
const PORT = 3000;
const DB_FILE = "./db.json";

app.use(cors()); // Allow all origins for dev
app.use(bodyParser.json());

// Utility functions
function readDB() {
  const data = fs.readFileSync(DB_FILE, "utf-8");
  return JSON.parse(data);
}

function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
}

// ---------------------- ROUTES ------------------------

// Signup
app.post("/signup", (req, res) => {
  const { username, email, password } = req.body;
  const db = readDB();

  if (db.users.some(u => u.email === email)) {
    return res.status(400).json({ error: "Email already exists" });
  }

  db.users.push({
    username,
    email,
    password,
    cookies: "",
    public: false,
    friends: [],
    addedBy: []
  });

  writeDB(db);
  res.json({ message: "Signup successful" });
});

// Login
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const db = readDB();

  const user = db.users.find(u => u.email === email);

  if (!user) {
    return res.status(404).json({ error: "Email not found" });
  }

  if (user.password !== password) {
    return res.status(401).json({ error: "Incorrect password" });
  }

  res.json({ message: "Login successful", user });
});

// Get all users (for Global section)
app.get("/allUsers", (req, res) => {
  const db = readDB();
  res.json(db.users.map(({ password, cookies, ...rest }) => rest));
});

app.get("/user/:email", (req, res) => {
  const db = readDB();
  const email = decodeURIComponent(req.params.email);
  const user = db.users.find(u => u.email === email);
  if (user) res.json(user);
  else res.status(404).json({ error: "User not found" });
});
// Add friend
app.post("/add-friend", (req, res) => {
  const { fromEmail, toEmail } = req.body;
  const db = readDB();

  const from = db.users.find(u => u.email === fromEmail);
  const to = db.users.find(u => u.email === toEmail);

  if (!from || !to) return res.status(404).json({ error: "User not found" });

  if (!from.friends.includes(toEmail)) from.friends.push(toEmail);
  if (!to.addedBy.includes(fromEmail)) to.addedBy.push(fromEmail);

  writeDB(db);
  res.json({ message: "Friend added" });
});

// Remove friend ✅
app.post("/remove-friend", (req, res) => {
  const { fromEmail, toEmail } = req.body;
  const db = readDB();

  const from = db.users.find(u => u.email === fromEmail);
  const to = db.users.find(u => u.email === toEmail);

  if (!from || !to) return res.status(404).json({ error: "User not found" });

  from.friends = from.friends.filter(email => email !== toEmail);
  to.addedBy = to.addedBy.filter(email => email !== fromEmail);

  writeDB(db);
  res.json({ message: "Friend removed" });
});

// Toggle public status (optional)
app.post("/set-public", (req, res) => {
  const { email, publicStatus } = req.body;
  const db = readDB();

  const user = db.users.find(u => u.email === email);
  if (!user) return res.status(404).json({ error: "User not found" });

  user.public = publicStatus;
  writeDB(db);
  res.json({ message: "Status updated" });
});

// Update cookies (after X login)
app.post("/update-cookies", (req, res) => {
  const { email, cookies } = req.body;
  const db = readDB();

  const user = db.users.find(u => u.email === email);
  if (!user) return res.status(404).json({ error: "User not found" });

  user.cookies = cookies;
  writeDB(db);
  res.json({ message: "Cookies updated" });
});


// Toggle public route
app.post("/toggle-public", (req, res) => {
  const { userEmail, makePublic } = req.body;
  const db = readDB();

  const currentUser = db.users.find(u => u.email === userEmail);
  if (!currentUser) return res.status(404).json({ error: "User not found" });

  if (makePublic) {
    // Make user public: add everyone as friend, and self to their addedBy
    db.users.forEach(user => {
      if (user.email !== userEmail) {
        if (!currentUser.friends.includes(user.email)) {
          currentUser.friends.push(user.email);
        }
        if (!user.addedBy.includes(userEmail)) {
          user.addedBy.push(userEmail);
        }
      }
    });
  } else {
    // Remove all users from friends and addedBy
    db.users.forEach(user => {
      if (user.email !== userEmail) {
        // Remove others from currentUser's friends
        currentUser.friends = currentUser.friends.filter(f => f !== user.email);
        // Remove currentUser from other's addedBy
        user.addedBy = user.addedBy.filter(a => a !== userEmail);
      }
    });
  }

  currentUser.public = makePublic;
  writeDB(db);
  res.json({ message: `Public set to ${makePublic}` });
});

// ---------------------- START ------------------------

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});

