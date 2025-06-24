**🐦 X Feed Viewer – Social Feed Platform**

**X Feed Viewer** is a lightweight web application (and accompanying Chrome extension) that allows users to browse public or friends-only X (formerly Twitter) feeds for other users. Built using Twikit for secure authentication, it provides a simple read-only feed experience while respecting each user’s privacy settings.

---

## 🌟 Key Features

### 🔐 Authentication

* **Sign Up & Login**: User registration and login flows
* **Session-Based Auth**: Secure sessions managed via a JSON backend

### 🔒 Feed Privacy Controls

* **Public** or **Friends-Only** feed settings
* **Read-only** access that honors each user’s chosen privacy level

### 👥 Friend System

* **Friends List**: Feeds of users you have added
* **Added By**: Feeds of users who have added you
* **Global Feed**: Public posts from all users

### 🗃 Data Storage

* JSON-based file storage for simplicity and ease of use

### 🧭 Feed Sections

* **Global Feed**: All public posts
* **Added By**: Feeds of users who follow you
* **Friends**: Feeds of users you follow

---

## ⚙ Tech Stack

* **Frontend**: HTML, CSS, Twikit
* **Backend**: Node.js, Express.js
* **Database**: JSON file storage
* **Auth**: Session-based login via the JSON database

---

## 🚀 Local Setup & Usage

1. **Clone the repository**:

   ```bash
   git clone https://github.com/infinitin007/XView.git
   cd XView
   ```

2. **Start the backend**:

   ```bash
   cd x-server
   npm install
   # then run either:
   nodemon index.js
   # or:
   node index.js
   ```

3. **Load the Chrome Extension**:

   1. Open `chrome://extensions/` in your browser
   2. Enable **Developer Mode** (toggle in the top right)
   3. Click **Load Unpacked**
   4. Select the **X-view** folder in this repository

---

Enjoy exploring feeds with **X Feed Viewer**! Feel free to contribute or report issues on GitHub.

---