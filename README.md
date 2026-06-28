# ThreadStack

ThreadStack is a full-stack web application that allows users to create posts, upload screenshots, reply in nested threads, and interact through voting. The application follows a RESTful architecture and is containerized using Docker.

---

## 🚀 Tech Stack

- Frontend: Next.js (React)
- Backend: Next.js API Routes (Node.js)
- Database: SQLite
- Containerization: Docker & Docker Compose

---

## ⚙️ How to Run the Application

### Option 1: Using Docker (Recommended)

On first run, the application initializes the SQLite database and required tables automatically.

1. Build and start the application:

```bash
docker compose up --build
```
2. open browser and go to:
http://localhost:3000

### Option 2: Without Docker (Development)

1. Install dependencies:
```bash
npm install
```
2. Start the development server:
```bash
npm run dev
```
3. Open:
http://localhost:3000


## PORTS

| Service           | Port |
|-------------------|------|
| Web App (Next.js) | 3000 |

## ADMIN CREDENTIALS

Username: Yuki (case-sensitive)
Password: 123456789. (period included)

## Environment Configuration

A sample environment file is included:

.env.example

Example variables:

SESSION_SECRET=replace_with_a_long_random_secret  
ADMIN_EMAIL=admin@example.com  
RATE_LIMIT_WINDOW_MS=60000  
RATE_LIMIT_MAX_ATTEMPTS=5  

## Features Implemented
1. User authentication with session cookies
2. Create, edit, delete posts
3. Nested replies (threaded discussions)
4. Voting system on posts and replies
5. Screenshot uploads
6. Search functionality
7. Pagination support
8. Input validation and error handling
9. Responsive UI design

## File Upload Handling

- Uploaded files are stored in a local `uploads/` directory
- Files persist using Docker volume mapping
- Files are served via a controlled API route:  
  `/api/uploads/{id}`

Each file stores:
- file name
- file path
- MIME type
- file size

## Security Features
1. Password hashing
2. HTTP-only cookies
3. SameSite cookie protection
4. Session cookies use HTTP-only and SameSite settings to help mitigate CSRF risks
5. Rate limiting for:
    login attempts
    post creation
    replies
6. Input validation and sanitization
7. Safe rendering to prevent XSS

## System Overview
1. The frontend communicates with backend API routes under /api
2. The backend handles business logic and database queries
3. SQLite stores all application data
4. Uploaded files are stored on disk and accessed via API endpoints

## Demo Video
Click here: https://www.loom.com/share/1708a706c5874ac38623fde9492fabfa




