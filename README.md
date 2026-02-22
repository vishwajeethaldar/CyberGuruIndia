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

1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure environment:
   ```bash
   copy .env.example .env
   ```
3. Start MongoDB locally or set `MONGODB_URI` in `.env`.
   - Option A (local service): run your installed MongoDB service.
   - Option B (WSL Docker):
     ```bash
     npm run mongo:up
     ```
4. Seed admin user and default categories:
   ```bash
   npm run seed
   ```
5. **[Important]** If upgrading from a version without blog categories, run the migration:
   ```bash
   node scripts/migrate-blog-categories.js
   ```
6. Start development server:
   ```bash
   npm run dev
   ```

App runs at `http://localhost:3000`.

To stop WSL Docker MongoDB:

```bash
npm run mongo:down
```

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

## Deployment Guide

### Prerequisites

- Node.js 18+ installed on server
- MongoDB instance (local or MongoDB Atlas)
- Domain name (optional but recommended)
- SSL certificate (Let's Encrypt recommended)

### Option 1: Deploy to VPS (Ubuntu/Debian)

#### 1. Server Setup

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Node.js (using NodeSource)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 globally for process management
sudo npm install -g pm2

# Install Nginx as reverse proxy
sudo apt install -y nginx
```

#### 2. MongoDB Setup

**Option A: MongoDB Atlas (Recommended for production)**

1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Whitelist your server IP in Network Access
4. Create database user in Database Access
5. Get connection string from "Connect" → "Connect your application"
6. Update `.env` with Atlas connection string:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cyberguruindia?retryWrites=true&w=majority
   ```

**Option B: Local MongoDB Installation**

```bash
# Import MongoDB GPG key
curl -fsSL https://pgp.mongodb.com/server-7.0.asc | sudo gpg --dearmor -o /usr/share/keyrings/mongodb-server-7.0.gpg

# Add MongoDB repository
echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Install MongoDB
sudo apt update
sudo apt install -y mongodb-org

# Start and enable MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

#### 3. Deploy Application

```bash
# Clone your repository
cd /var/www
sudo git clone https://github.com/yourusername/cyberguruindia.git
cd cyberguruindia

# Install dependencies
sudo npm install --production

# Create production environment file
sudo nano .env
```

**Production `.env` configuration:**

```env
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/cyberguruindia  # Or MongoDB Atlas URI
SESSION_SECRET=your-super-secret-random-string-change-this-in-production
ADMIN_SEED_USERNAME=admin
ADMIN_SEED_PASSWORD=choose-strong-password-here
SITE_BASE_URL=https://yourdomain.com
```

```bash
# Set proper environment permissions
sudo chmod 600 .env
sudo chown www-data:www-data .env

# Create uploads directory with proper permissions
sudo mkdir -p public/uploads
sudo chown -R www-data:www-data public/uploads

# Seed database
npm run seed

# Start with PM2
sudo pm2 start server.js --name cyberguruindia
sudo pm2 startup systemd
sudo pm2 save
```

#### 4. Configure Nginx Reverse Proxy

```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/cyberguruindia
```

**Nginx configuration:**

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Upload size limit
    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Serve static files directly
    location /css {
        alias /var/www/cyberguruindia/public/css;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    location /js {
        alias /var/www/cyberguruindia/public/js;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    location /uploads {
        alias /var/www/cyberguruindia/public/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

```bash
# Enable site and test configuration
sudo ln -s /etc/nginx/sites-available/cyberguruindia /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 5. Setup SSL with Let's Encrypt (Recommended)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain and install SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal is configured automatically
# Test renewal with:
sudo certbot renew --dry-run
```

#### 6. Firewall Configuration

```bash
# Setup UFW firewall
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

### Option 2: Deploy to Heroku

```bash
# Install Heroku CLI
# Visit: https://devcenter.heroku.com/articles/heroku-cli

# Login to Heroku
heroku login

# Create new app
heroku create your-app-name

# Add MongoDB addon (or use MongoDB Atlas)
heroku addons:create mongocloud:free
# OR set MongoDB Atlas URI
heroku config:set MONGODB_URI="mongodb+srv://..."

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set SESSION_SECRET="your-secret-here"
heroku config:set ADMIN_SEED_USERNAME=admin
heroku config:set ADMIN_SEED_PASSWORD="strong-password"
heroku config:set SITE_BASE_URL="https://your-app-name.herokuapp.com"

# Deploy
git push heroku main

# Run seed script
heroku run npm run seed
```

### Option 3: Deploy to DigitalOcean App Platform

1. Push code to GitHub/GitLab
2. Create new App in DigitalOcean App Platform
3. Connect your repository
4. Configure environment variables in App settings
5. Add MongoDB database (managed or Atlas)
6. Deploy automatically on push

### Option 4: Deploy to Railway

1. Visit [Railway.app](https://railway.app)
2. Create new project from GitHub repo
3. Add MongoDB database service or use Atlas
4. Set environment variables in Railway dashboard
5. Deploy automatically

### Post-Deployment Checklist

- [ ] Change default admin password
- [ ] Set strong `SESSION_SECRET` in production
- [ ] Configure proper `SITE_BASE_URL`
- [ ] Setup MongoDB backups
- [ ] Configure monitoring (PM2 monitoring, UptimeRobot, etc.)
- [ ] Setup log rotation for PM2 logs
- [ ] Test all features (videos, blogs, comments, admin panel)
- [ ] Verify SSL certificate and HTTPS
- [ ] Test file uploads work correctly
- [ ] Configure automated backups

### Useful PM2 Commands

```bash
# View application logs
pm2 logs cyberguruindia

# Restart application
pm2 restart cyberguruindia

# Stop application
pm2 stop cyberguruindia

# Monitor resources
pm2 monit

# List all processes
pm2 list

# Delete process
pm2 delete cyberguruindia
```

### Updating Deployment

```bash
# Pull latest changes
cd /var/www/cyberguruindia
sudo git pull origin main

# Install any new dependencies
sudo npm install --production

# Restart application
sudo pm2 restart cyberguruindia

# Clear PM2 logs if needed
sudo pm2 flush
```

### Troubleshooting

**Cannot connect to MongoDB:**
- Check MongoDB service status: `sudo systemctl status mongod`
- Verify MongoDB connection string in `.env`
- Check MongoDB Atlas IP whitelist (add 0.0.0.0/0 for testing)

**Port 3000 already in use:**
- Change `PORT` in `.env` to another port (e.g., 3001)
- Update Nginx proxy_pass accordingly

**File uploads not working:**
- Check `public/uploads` directory permissions
- Verify disk space: `df -h`
- Check Nginx `client_max_body_size` setting

**Session not persisting:**
- Verify MongoDB connection is stable
- Check `SESSION_SECRET` is set in `.env`
- Clear browser cookies and test again

**Application crashes:**
- Check logs: `pm2 logs cyberguruindia`
- Verify all environment variables are set
- Check Node.js version compatibility

### Security Best Practices

1. **Never commit `.env` file** - Add to `.gitignore`
2. **Use strong passwords** for admin and database
3. **Keep dependencies updated:** `npm audit fix`
4. **Use HTTPS in production** with valid SSL certificate
5. **Limit MongoDB access** to specific IPs only
6. **Regular backups** of MongoDB database
7. **Monitor logs** for suspicious activity
8. **Rate limiting** is already configured for POST endpoints
9. **Set secure session cookie** in production (already configured in app.js)

### Backup Strategy

**MongoDB Backup (Local):**
```bash
# Create backup
mongodump --uri="mongodb://localhost:27017/cyberguruindia" --out=/backups/cyberguruindia-$(date +%Y%m%d)

# Restore backup
mongorestore --uri="mongodb://localhost:27017/cyberguruindia" /backups/cyberguruindia-20260222
```

**MongoDB Atlas Backup:**
- Atlas provides automated backups
- Configure backup schedule in Atlas dashboard
- Test restore procedures regularly

**Uploaded Files Backup:**
```bash
# Backup uploads directory
tar -czf uploads-backup-$(date +%Y%m%d).tar.gz public/uploads/

# Restore
tar -xzf uploads-backup-20260222.tar.gz -C public/
```
