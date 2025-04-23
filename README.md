# 🚀 Real-Time Notification System

A comprehensive real-time notification system built with modern web technologies. This system allows users to register, log in, send notifications to other users, and receive notifications in real-time.

---

## 📦 Features

- ✅ User Authentication with JWT
- 📩 Real-Time Notifications via WebSockets (Socket.IO)
- 🗃 PostgreSQL for persistent storage
- 📡 RESTful API Endpoints
- ✅ Mark individual or all notifications as read
- 🔄 Pagination support
- 🐳 Docker + Docker Compose support
- 🌐 Ready for cloud deployment (Render)

---

## 💻 Technologies Used

### 🛠 Backend

- **Node.js** – JavaScript runtime environment
- **Express.js** – Web framework for API development
- **Socket.IO** – Real-time bidirectional communication
- **PostgreSQL** – Relational database for structured storage
- **JWT (JSON Web Tokens)** – For secure token-based authentication
- **bcrypt** – Password hashing
- **EJS** – Server-side templating engine

### 🧪 Testing

- **Jest** – JavaScript testing framework
- **Supertest** – HTTP assertion testing for Express

### ⚙️ DevOps

- **Docker** – Containerization
- **Docker Compose** – Multi-container orchestration
- **Render** – Cloud platform for web app + database deployment

---

## ⚙️ Quick Start

### 🧰 Prerequisites

- Node.js (v14+)
- PostgreSQL (v14 recommended)
- npm or yarn

---

### 🔧 Local Installation

```bash
# Clone the repository
git clone https://github.com/Prithiviraj69/notification-system
cd notification-system

# Install dependencies
npm install

# Create PostgreSQL database
createdb notification_system

# Run database migrations
node migrations.js

# Start the server
npm start
```

### Docker Installation
docker-compose up -d

### Running Tests
# Create test database
createdb notification_system_test

# Run tests
npm test

### Project Structure
notification-system/
├── app.js                  # Main application entry point
├── migrations.js           # Database migration logic
├── config/
│   └── db.js               # PostgreSQL configuration
├── controllers/            # Route controller logic
├── middleware/             # Custom middlewares (auth, error handling)
├── models/                 # DB schemas and queries
├── routes/                 # API route definitions
├── services/               # Business logic services
├── utils/                  # Utility functions (e.g., token helpers)
├── views/                  # EJS template files
└── __tests__/              # Jest + Supertest test cases


