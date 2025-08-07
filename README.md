# 🚀 JobSeekr – Smart Job Search & Recruitment Platform

A **comprehensive job and talent management platform** connecting employers and job seekers with **real-time messaging**, **smart job tracking**, and a **modern, responsive UI**.

---

## ✨ Features

- 🔍 **Advanced Job Posting & Search** – Post, browse, and filter jobs intelligently.
- 💬 **Real-Time Chat** – Instant communication between employers and candidates via WebSockets.
- 🔔 **Live Notifications** – Push updates for messages, job status, and system alerts.
- 👥 **Role-Based Access Control (RBAC)** – Admin, Employer, and Job Seeker roles.
- 🔐 **Secure Auth System** – JWT-based registration, login, and session handling.
- 📄 **Resume & Profile Uploads** – Upload resumes, cover letters, and images.
- 📊 **Admin Dashboard** – Manage users, jobs, and platform analytics.
- 📌 **Bookmarking** – Save jobs for future reference.
- 📈 **Analytics & Reporting** – Insightful metrics for hiring and engagement.
- ✅ **Application Tracking** – Track job applications in real-time.
- 📱 **Responsive UI** – Optimized for mobile, tablet, and desktop.

---

## 🏗️ Tech Stack

### 🔹 Frontend

- **React 19** – Component-based UI library.
- **Vite** – Ultra-fast development & build tool.
- **Tailwind CSS** – Utility-first styling framework.
- **Framer Motion** – Smooth, animated UI interactions.
- **React Router** – Declarative routing and navigation.

### 🔸 Backend (Core API)

- **Laravel 11 (PHP)** – Robust framework for core business logic.
- **Sanctum** – API token authentication for SPA/mobile apps.
- **MySQL** – Relational database for structured data.

### 🔸 Backend (Real-Time Chat & Notifications)

- **Node.js + Express** – Lightweight API server for chat/notification logic.
- **MongoDB** – NoSQL document database for messages and alerts.
- **Socket.io** – Real-time WebSocket communication.

### ⚙️ Tooling & Utilities

- **JWT** – Secure token-based authentication across services.
- **Docker + Docker Compose** – Containerized development & deployment.
- **NGINX** – Reverse proxy server for production setups.
- **ESLint + Prettier** – Code formatting and quality checks.

---

## 🚀 Quick Start (Development)

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/PraveenS-dev/jobseekr-platform.git
cd jobseekr-platform
```

### 2️⃣ Start All Services with Docker

```bash
docker-compose up --build
```

---

## ⚙️ Environment Setup

Create `.env` files in the following folders:

### 🔹 Frontend (`frontend-react/.env`)
```env
VITE_LARAVEL_BASE_URL=http://localhost:8000/api
VITE_NODE_BASE_URL=http://localhost:5000/api
VITE_NODE_CHAT_URL=http://localhost:5000
```

### 🔸 Node Backend (`backend-node/.env`)
```env
MONGO_URI=mongodb://localhost:27017/jobseeker
JWT_SECRET_KEY=YourSecretKey
```

### 🔸 Laravel Backend (`backend-laravel/.env`)
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=jobseekr_laravel
DB_USERNAME=root
DB_PASSWORD=
```

---

## 📸 Preview

This repo uses Open Graph metadata to display a custom preview banner when shared on social platforms.

---

## 📜 License

MIT License © 2025 [Praveen S](https://github.com/PraveenS-dev)

---

> **Note:** This project is actively maintained and is open to contributions, feedback, and feature requests. Feel free to fork, star ⭐, and submit pull requests!
