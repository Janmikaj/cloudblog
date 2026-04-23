# 🚀 CloudBlog: Full-Stack Web Application

A modern, secure, and production-ready full-stack blog platform built with React, Node.js, Express, and MongoDB.

## ✨ Features
- **Frontend**: Built with React and Vite for blazing fast performance.
- **Backend**: Robust Express.js API with security hardening.
- **Database**: MongoDB Atlas integration for scalable data storage.
- **Security**: 
  - JWT Authentication for secure user sessions.
  - Password hashing with Bcrypt.
  - Helmet for security headers and protection against common web attacks.
  - CORS configuration for cloud deployment.
- **Responsive Design**: Fully responsive UI for mobile and desktop.

## 🛠️ Tech Stack
- **Frontend**: React, Vite, Axios, Lucide-react (icons).
- **Backend**: Node.js, Express, Mongoose, JWT, Bcrypt, Helmet, Cors.
- **Database**: MongoDB (Atlas).
- **Deployment**: Ready for Render and Vercel.

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- A MongoDB Atlas connection string.

### 2. Installation
Run the following command in the root directory to install all dependencies:
```bash
npm run install:all
```

### 3. Environment Setup
Create a `.env` file in the `backend/` directory:
```env
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_super_secret_key
FRONTEND_URL=http://localhost:5173
```

### 4. Running Locally
Terminal 1 (Backend):
```bash
npm run start:backend
```

Terminal 2 (Frontend):
```bash
npm run start:frontend
```

---

## 🏗️ Deployment
For detailed deployment instructions on **Render** or **Vercel**, please refer to the [Deployment Guide](./deployment_guide.md).

## 🧹 Cleanup Note
This project was recently migrated from a DevSecOps exam setup. All intentional vulnerabilities and exam-related artifacts have been removed to ensure a production-ready baseline.
