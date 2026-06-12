# 🔗 URL Shortener with Analytics (Full Stack)

## 📌 Project Overview

This is a full-stack URL Shortener application that allows users to generate short URLs and track real-time analytics such as click count, visit history, and user activity. The application is built using modern web technologies with a clean architecture and user-friendly interface.

---

## 🚀 Features

### 🔐 Authentication

* User Registration & Login
* Secure password hashing using bcrypt
* JWT-based authentication
* Protected routes for authorized users

---

### 🔗 URL Shortening

* Convert long URLs into short links
* Custom alias support
* Unique short URL generation
* Automatic redirection to original URL

---

### 📊 Dashboard

* View all created URLs
* Displays:

  * Original URL
  * Short URL
  * Created Date
  * Click Count
* Copy to clipboard feature
* Delete URL functionality

---

### 📈 Analytics

* Track total clicks per URL
* Store visit history with timestamps
* Monitor user activity
* Analyze link performance

---

## ⭐ Advanced Features

* Device/User-Agent tracking
* Clean and responsive UI
* Protected dashboard access
* Modular backend architecture

---

## 🛠️ Tech Stack

### 💻 Frontend

* React.js (Vite)
* Tailwind CSS

### ⚙️ Backend

* Node.js
* Express.js

### 🗄️ Database

* MongoDB (Mongoose)

### 🔐 Authentication

* JSON Web Token (JWT)
* bcryptjs

---

## 📂 Project Structure

```id="l8f3rm"
url-shortener-analytics/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   │   ├── authController.js
│   │   └── urlController.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Url.js
│   │   └── Visit.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── urlRoutes.js
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   └── App.jsx
│   └── index.html
```

---

## ⚙️ Installation & Setup

### 🔹 Clone Repository

```id="c3tq7j"
git clone https://github.com/your-username/url-shortener-analytics.git
cd url-shortener-analytics
```

---

### 🔹 Backend Setup

```id="a9w5nr"
cd backend
npm install
npm run dev
```

---

### 🔹 Frontend Setup

```id="m2j8lp"
cd frontend
npm install
npm run dev
```

---

## 🌐 Environment Variables

Create a `.env` file in the backend folder:

```id="zq0f94"
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret_key
BASE_URL=http://localhost:5000
```


## 🧠 Key Learnings

* Full-stack application architecture
* JWT authentication and security
* REST API design
* MongoDB schema design
* State management in React

---

## 📌 Hackathon Note

This project is a part of a hackathon run by https://katomaran.com
