# Task 5 — Social Media Platform

A complete full-stack social media platform built with **HTML/CSS/JavaScript + Node.js/Express + MongoDB + JWT**.

## Features

- User registration and login with JWT authentication
- User profile view/update: name, bio, avatar URL
- Create posts containing text and/or a media reference URL
- Feed sorted newest first
- Like/unlike posts
- Add comments to posts
- Delete your own posts
- MongoDB persistence
- Seed/sample dataset
- Responsive UI for desktop and mobile
- CORS configured for both `localhost:5500` and `127.0.0.1:5500`

## Entity schema

### User
- `_id`
- `name`
- `username` (unique)
- `email` (unique)
- `password` (bcrypt hash)
- `bio`
- `avatar`
- `createdAt`

### Post
- `_id`
- `author` → User
- `text`
- `mediaUrl`
- `mediaType` (`image`, `video`, `link`, or empty)
- `likes` → array of User IDs
- `comments` → embedded comments
- `createdAt`

### Comment
- `_id`
- `user` → User
- `text`
- `createdAt`

## API list

### Authentication
- `POST /api/auth/register` — create account
- `POST /api/auth/login` — login and receive JWT

### Users
- `GET /api/users/me` — current authenticated user
- `PUT /api/users/me` — update current profile
- `GET /api/users/:username` — public profile

### Posts
- `GET /api/posts` — newest-first feed
- `POST /api/posts` — create post (JWT required)
- `POST /api/posts/:id/like` — like/unlike (JWT required)
- `POST /api/posts/:id/comments` — add comment (JWT required)
- `DELETE /api/posts/:id` — delete own post (JWT required)

## Setup — Windows

### 1. Requirements
Install:
- Node.js
- MongoDB Community Server, or use a MongoDB Atlas connection string

### 2. Backend

Open PowerShell in the `backend` folder:

```powershell
npm install
copy .env.example .env
```

Edit `.env` if required. Default local MongoDB configuration:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/task5_social_media
JWT_SECRET=change_this_to_a_long_random_secret
CLIENT_URL=http://127.0.0.1:5500
```

Start MongoDB, then:

```powershell
npm run seed
npm start
```

You should see:

```text
MongoDB connected
Server running on http://localhost:5000
```

### 3. Frontend

In another PowerShell window:

```powershell
cd frontend
npx http-server -p 5500
```

Open:

`http://127.0.0.1:5500`

You can also use VS Code Live Server. If it uses port 5500, the included CORS configuration supports both localhost and 127.0.0.1.

## Demo accounts

All seeded users use:

**Password:** `Password123`

- `aarav@example.com`
- `meera@example.com`
- `kabir@example.com`

## Screenshots / demo deliverable

For your submission, run the app and capture:
1. Login/register screen
2. Home feed with sample posts
3. Create post screen/result
4. Like and comment interaction
5. Edit profile dialog

## Important

Do not commit your real `.env` file or JWT secret to GitHub. Commit `.env.example` instead.

## Suggested GitHub submission structure

```text
Task5_SocialMediaPlatform/
├── backend/
│   ├── models/
│   ├── routes/
│   ├── .env.example
│   ├── middleware_auth.js
│   ├── seed.js
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── app.js
└── README.md
```
