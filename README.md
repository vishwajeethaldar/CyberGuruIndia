# CyberGuruIndia

Full-stack video showcase and management platform for CyberGuruIndia YouTube content.

## Stack

- Node.js + Express (MVC)
- MongoDB + Mongoose
- Passport Local Authentication (session-based)
- MongoDB session store (`connect-mongo`)
- EJS + Bootstrap UI

## Features

- Public video listing in responsive grid
- SEO-friendly video URLs (`/videos/:slug`)
- Video detail page with embedded YouTube player
- Threaded comments + reply system
- Like / Dislike for videos and comments
- Session/IP-based duplicate vote prevention
- Category-based filtering + text search
- Admin login and dashboard
- Admin CRUD for videos
- Admin category management
- Admin comment moderation (video-wise block/unblock/delete)
- Discussion enable/disable per video
- Basic anti-spam rate limiting

## Setup

See [docs/LOCAL-DEVELOPMENT.md](docs/LOCAL-DEVELOPMENT.md) for full local setup (WSL Ubuntu, Docker, MongoDB).

## Admin Login

- Username: `ADMIN_SEED_USERNAME` from `.env` (default `admin`)
- Password: `ADMIN_SEED_PASSWORD` from `.env` (default `admin123`)

## Project Structure

```text
src/
  app.js
  config/
  controllers/
  middleware/
  models/
  routes/
  utils/
  views/
public/
  css/
  js/
scripts/
  seed.js
server.js
```

## Documentation

- Local development: [docs/LOCAL-DEVELOPMENT.md](docs/LOCAL-DEVELOPMENT.md)
- AWS deployment: [docs/AWS-DEPLOYMENT.md](docs/AWS-DEPLOYMENT.md)
