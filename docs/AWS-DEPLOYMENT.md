# AWS Deployment (EC2 + Nginx + PM2)

This guide deploys the app on an Ubuntu EC2 instance with Nginx and PM2.

## 1. Create EC2 Instance

- Launch Ubuntu 22.04 LTS
- Security group inbound rules:
  - SSH (22) from your IP
  - HTTP (80) from anywhere
  - HTTPS (443) from anywhere

## 2. SSH to the Server

```bash
ssh -i /path/to/key.pem ubuntu@YOUR_EC2_PUBLIC_IP
```

## 3. Install System Dependencies

```bash
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs nginx
sudo npm install -g pm2
```

## 4. App Setup

```bash
cd /var/www
sudo git clone https://github.com/yourusername/cyberguruindia.git
cd cyberguruindia
sudo npm install --production
sudo nano .env
```

Example .env:

```env
NODE_ENV=production
PORT=3000
MONGODB_URI=
SESSION_SECRET=your-super-secret
ADMIN_SEED_USERNAME=admin
ADMIN_SEED_PASSWORD=strong-password
SITE_BASE_URL=https://yourdomain.com
```

```bash
sudo chmod 600 .env
sudo chown www-data:www-data .env
sudo mkdir -p public/uploads
sudo chown -R www-data:www-data public/uploads
npm run seed
```

## 5. Start with PM2

```bash
sudo pm2 start server.js --name cyberguruindia
sudo pm2 startup systemd
sudo pm2 save
```

## 6. Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/cyberguruindia
```

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

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
sudo ln -s /etc/nginx/sites-available/cyberguruindia /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 7. SSL with Lets Encrypt

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

## 8. MongoDB

Use MongoDB Atlas for production. Update MONGODB_URI in .env.

## 9. Updates

```bash
cd /var/www/cyberguruindia
sudo git pull origin main
sudo npm install --production
sudo pm2 restart cyberguruindia
```

## 10. Troubleshooting

- Check logs: pm2 logs cyberguruindia
- Port 3000 in use: change PORT and update Nginx
- File upload errors: verify public/uploads permissions
