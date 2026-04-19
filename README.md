# CloudBlog DevSecOps Platform

This is a full-stack cloud-based blog platform built with React, Node.js, Express, and MongoDB. It has been specifically designed with intentional security vulnerabilities to be used as a target for DevSecOps testing (using tools like OWASP ZAP, Burp Suite, and Wireshark) and CI/CD pipeline deployments.

## Intentional Vulnerabilities Included
* **Plaintext Passwords**: User passwords are saved and checked in plain text without hashing (no bcrypt).
* **No Input Sanitization / NoSQL Injection**: Login endpoint and inputs are not sanitized.
* **Cross-Site Scripting (XSS)**: Blog comments are rendered using `dangerouslySetInnerHTML`, allowing script injection.
* **Missing Security Headers**: No helmet or standard security headers are implemented.
* **Missing Authentication Middleware**: Endpoints like creating a blog or commenting do not strictly verify user tokens.

## Prerequisites
* Node.js (v18+)
* MongoDB Atlas Account or Local MongoDB Server

---

## 1. How to Connect MongoDB Atlas

1. Log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a new Cluster (the free tier works fine).
3. Under **Database Access**, create a new database user with a username and password.
4. Under **Network Access**, add your current IP address (or `0.0.0.0/0` to allow access from anywhere for testing purposes).
5. Go to **Databases** -> **Connect** -> **Connect your application**.
6. Copy the connection string. It will look like:
   `mongodb+srv://<username>:<password>@cluster0.mongodb.net/blog_platform?retryWrites=true&w=majority`
7. Replace `<username>` and `<password>` with your database user credentials.
8. Create a `.env` file in the `backend` folder and add your connection string:
   ```env
   PORT=5000
   MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/blog_platform?retryWrites=true&w=majority
   ```

---

## 2. Steps to Run Locally

### Backend Setup
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Seed the database with sample data:
   ```bash
   node seed.js
   ```
4. Start the server:
   ```bash
   npm run dev
   ```
   The backend will run on `http://localhost:5000`.

### Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   The frontend will run on `http://localhost:5173`.
4. Log in using the sample admin credentials:
   - **Username**: admin
   - **Password**: adminpassword

---

## 3. Steps to Build for Deployment (DevOps Compatibility)

### Frontend Build (Apache / Nginx / S3)
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Run the build command:
   ```bash
   npm run build
   ```
3. The build artifact will be generated in the `frontend/dist` directory.
4. **Deploying to Apache Server**:
   Copy the contents of the `dist` folder to your Apache document root (usually `/var/www/html`):
   ```bash
   sudo cp -r dist/* /var/www/html/
   ```
   *(Note: Ensure your web server is configured to handle client-side routing by redirecting all requests to `index.html`)*

### Backend Deployment (EC2 / Systemd)
1. Clone the repository on your EC2 instance.
2. Navigate to the backend directory and run `npm install`.
3. Start the application using a process manager like PM2:
   ```bash
   npm install -g pm2
   pm2 start server.js --name "blog-backend"
   pm2 save
   pm2 startup
   ```

---

## Fixing Vulnerabilities (Phase 2)
For your second improved version, you should implement the following:
1. **Password Hashing**: Use `bcrypt` in `User.js` pre-save hook and login route.
2. **JWT Authentication**: Issue tokens on login and create an `authMiddleware` to protect API routes.
3. **Input Sanitization**: Use `DOMPurify` on the frontend before rendering user input, and `express-validator` on the backend.
4. **Security Headers**: Install and apply `helmet` in `server.js`.
