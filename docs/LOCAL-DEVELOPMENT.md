# Local Development

This guide covers local development setup, including WSL Ubuntu and Docker.

## Prerequisites

- Windows 10/11 (for WSL) or macOS/Linux
- Node.js 18+ and npm
- Git

## WSL Ubuntu Installation (Windows)

1. Open PowerShell as Administrator and install WSL with Ubuntu:

```powershell
wsl --install -d Ubuntu
```

2. Reboot when prompted, then open Ubuntu and complete the first-time setup.

3. Confirm WSL 2 is active:

```powershell
wsl -l -v
```

If Ubuntu is not version 2, run:

```powershell
wsl --set-version Ubuntu 2
```

## Docker Desktop Installation (Windows)

1. Install Docker Desktop from https://www.docker.com/products/docker-desktop/
2. Open Docker Desktop and enable WSL integration for Ubuntu:
   - Settings -> Resources -> WSL Integration -> Enable
3. Verify Docker is available inside Ubuntu:

```bash
docker ps
```

## Clone and Install

```bash
git clone https://github.com/yourusername/cyberguruindia.git
cd cyberguruindia
npm install
```

## Configure Environment

```bash
copy .env.example .env
```

Update values in .env if needed.

## Start MongoDB (Docker)

```bash
npm run mongo:up
```

To stop:

```bash
npm run mongo:down
```

## Seed and Migrate

```bash
npm run seed
node scripts/migrate-blog-categories.js
```

## Start the App

```bash
npm run dev
```

App runs at http://localhost:3000

## Optional: Local MongoDB (No Docker)

If you want to run MongoDB locally, install it and set MONGODB_URI in .env.

## Troubleshooting

- Port 3000 in use: change PORT in .env
- MongoDB not reachable: make sure Docker is running
- WSL Docker not found: enable WSL integration in Docker Desktop
