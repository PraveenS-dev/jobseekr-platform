# JobSeekr 🚀  
A **comprehensive job search & recruitment platform** connecting employers and job seekers with **real-time communication**, smart job tracking, and a sleek, modern interface.

---

## ✨ Features
- **Job Posting & Search** — Post, browse, and apply for jobs with advanced filtering.
- **Real-Time Chat** — Instant messaging between employers & candidates.
- **Notifications System** — Real-time push notifications for job updates & messages.
- **Role-Based Access Control (RBAC)** — Secure access for Admin, Employer, and Job Seeker roles.
- **Secure Authentication** — JWT-based login, registration & session management.
- **Resume & Profile Uploads** — Upload and manage resumes, cover letters, and profile images.
- **Admin Dashboard** — Approve jobs, view analytics, and manage users.
- **Application Tracking** — Track job application statuses in real time.
- **Bookmarking** — Save jobs for later.
- **Responsive UI** — Works seamlessly on mobile, tablet, and desktop.
- **Analytics & Reports** — View hiring trends and user engagement reports.

---

## 🏗️ Tech Stack

### **Frontend**
- **React 19** — Modern frontend library for dynamic UIs.
- **Vite** — Lightning-fast build tool.
- **Tailwind CSS** — Utility-first responsive styling.
- **Framer Motion** — Smooth animations.
- **React Router** — Routing & navigation.

### **Backend (Core)**
- **Laravel 11 (PHP)** — Main backend for business logic.
- **MySQL** — Relational database for core data.
- **Sanctum** — Authentication token handling for Laravel API.

### **Backend (Real-Time & Messaging)**
- **Node.js (Express)** — Dedicated backend for chat & notifications.
- **MongoDB** — NoSQL database for chat messages & notification data.
- **Socket.io** — Real-time communication for chat, typing indicators & read receipts.
- **WebSockets** — Low-latency bi-directional communication.

### **Other Tools**
- **JWT** — Secure JSON Web Token authentication.
- **Docker & Docker Compose** — Containerized deployment.
- **NGINX** — Reverse proxy for production.
- **ESLint & Prettier** — Code quality & formatting.

---

## 🚀 Quick Start

```bash
# Clone repository
git clone https://github.com/PraveenS-dev/jobseekr-platform.git
cd jobseekr-platform

# Start Docker containers
docker-compose up --build
Environment Variables
Set up .env in:

frontend-react/

backend-laravel/

backend-node/

Example for React:

VITE_LARAVEL_BASE_URL=http://localhost:8000/api
VITE_NODE_BASE_URL=http://localhost:5000/api
VITE_NODE_CHAT_URL=http://localhost:5000

Example for Node.js:

MONGO_URI=mongodb://localhost:27017/jobseeker
JWT_SECRET_KEY=YourKey

Example for Laravel:

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=jobseekr_laravel
DB_USERNAME=root
DB_PASSWORD=
📸 Preview
When sharing this project link, a custom branded preview banner will be shown thanks to Open Graph tags.

📜 License
MIT License © 2025 The Beast
