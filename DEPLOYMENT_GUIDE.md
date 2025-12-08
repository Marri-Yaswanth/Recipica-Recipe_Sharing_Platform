# Recipe Platform - Deployment Guide 🚀

## Deployment Options

This guide covers deploying your full-stack recipe platform to production.

---

## 📋 Pre-Deployment Checklist

### 1. Prepare Your Code
- [ ] All features working locally
- [ ] Database tables created
- [ ] Environment variables configured
- [ ] No console errors
- [ ] Tested all features

### 2. Build Frontend
```bash
cd client
npm run build
```

### 3. Update Environment Variables
- [ ] Production database credentials
- [ ] Production email credentials
- [ ] Production URLs
- [ ] Secure JWT secret

---

## 🌐 Deployment Options

### Option 1: Heroku (Easiest - Free Tier Available)
### Option 2: Vercel + Railway (Modern & Fast)
### Option 3: DigitalOcean (Full Control)
### Option 4: AWS (Enterprise)

---

## 🎯 Option 1: Heroku Deployment (Recommended for Beginners)

### Step 1: Install Heroku CLI
```bash
# macOS
brew tap heroku/brew && brew install heroku

# Or download from: https://devcenter.heroku.com/articles/heroku-cli
```

### Step 2: Login to Heroku
```bash
heroku login
```

### Step 3: Create Heroku App
```bash
heroku create your-recipe-platform
```

### Step 4: Add MySQL Database
```bash
# Add ClearDB MySQL addon (free tier)
heroku addons:create cleardb:ignite

# Get database URL
heroku config:get CLEARDB_DATABASE_URL
```

### Step 5: Configure Environment Variables
```bash
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-super-secret-jwt-key-change-this
heroku config:set EMAIL_USER=recipica@gmail.com
heroku config:set EMAIL_PASSWORD=your-app-password
heroku config:set CLIENT_URL=https://your-recipe-platform.herokuapp.com
```

### Step 6: Update package.json
Add to root `package.json`:
```json
{
  "scripts": {
    "start": "node server.js",
    "build": "cd client && npm install && npm run build",
    "heroku-postbuild": "npm run build"
  },
  "engines": {
    "node": "18.x",
    "npm": "9.x"
  }
}
```

### Step 7: Update server.js for Production
Add this to `server.js`:
```javascript
// Serve static files in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'client/build')));
    
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
    });
}
```

### Step 8: Create Procfile
```bash
echo "web: node server.js" > Procfile
```

### Step 9: Deploy
```bash
git add .
git commit -m "Prepare for Heroku deployment"
git push heroku main
```

### Step 10: Setup Database
```bash
# Get database credentials
heroku config:get CLEARDB_DATABASE_URL

# Connect to database
mysql -h [host] -u [username] -p [database]

# Run database.sql
source database.sql
```

### Step 11: Open Your App
```bash
heroku open
```

---

## 🚀 Option 2: Vercel (Frontend) + Railway (Backend)

### Frontend on Vercel

#### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

#### Step 2: Deploy Frontend
```bash
cd client
vercel
```

Follow prompts and deploy!

### Backend on Railway

#### Step 1: Go to Railway.app
Visit: https://railway.app

#### Step 2: Create New Project
- Click "New Project"
- Select "Deploy from GitHub repo"
- Connect your repository

#### Step 3: Add MySQL Database
- Click "New" → "Database" → "MySQL"
- Railway will provide connection details

#### Step 4: Configure Environment Variables
Add in Railway dashboard:
```
NODE_ENV=production
PORT=5000
DB_HOST=[from Railway]
DB_USER=[from Railway]
DB_PASSWORD=[from Railway]
DB_NAME=[from Railway]
JWT_SECRET=your-secret-key
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
CLIENT_URL=https://your-vercel-app.vercel.app
```

#### Step 5: Deploy
Railway auto-deploys on git push!

---

## 💻 Option 3: DigitalOcean Droplet

### Step 1: Create Droplet
- Go to DigitalOcean
- Create Ubuntu 22.04 droplet
- Choose plan ($6/month minimum)

### Step 2: SSH into Server
```bash
ssh root@your-droplet-ip
```

### Step 3: Install Dependencies
```bash
# Update system
apt update && apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Install MySQL
apt install -y mysql-server

# Install Nginx
apt install -y nginx

# Install PM2
npm install -g pm2
```

### Step 4: Setup MySQL
```bash
mysql_secure_installation

# Create database
mysql -u root -p
CREATE DATABASE recipe_platform;
CREATE USER 'recipeuser'@'localhost' IDENTIFIED BY 'strong-password';
GRANT ALL PRIVILEGES ON recipe_platform.* TO 'recipeuser'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Step 5: Clone Your Repository
```bash
cd /var/www
git clone https://github.com/your-username/recipe-platform.git
cd recipe-platform
```

### Step 6: Install Dependencies
```bash
# Backend
npm install

# Frontend
cd client
npm install
npm run build
cd ..
```

### Step 7: Configure Environment
```bash
nano .env
```

Add production values:
```env
NODE_ENV=production
PORT=5000
DB_HOST=localhost
DB_USER=recipeuser
DB_PASSWORD=strong-password
DB_NAME=recipe_platform
JWT_SECRET=your-super-secret-key
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
CLIENT_URL=http://your-domain.com
```

### Step 8: Setup Database
```bash
mysql -u recipeuser -p recipe_platform < database.sql
```

### Step 9: Start with PM2
```bash
pm2 start server.js --name recipe-platform
pm2 save
pm2 startup
```

### Step 10: Configure Nginx
```bash
nano /etc/nginx/sites-available/recipe-platform
```

Add:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site:
```bash
ln -s /etc/nginx/sites-available/recipe-platform /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### Step 11: Setup SSL (Optional but Recommended)
```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d your-domain.com
```

---

## 🔐 Security Checklist

### Before Deployment:
- [ ] Change JWT_SECRET to strong random string
- [ ] Use environment variables for all secrets
- [ ] Enable HTTPS/SSL
- [ ] Set secure CORS origins
- [ ] Update database passwords
- [ ] Remove console.logs from production
- [ ] Add rate limiting
- [ ] Enable helmet.js for security headers

### Add Security Packages:
```bash
npm install helmet express-rate-limit cors
```

Update `server.js`:
```javascript
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// CORS for production
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}));
```

---

## 📝 Environment Variables for Production

### Backend (.env)
```env
NODE_ENV=production
PORT=5000

# Database
DB_HOST=your-production-db-host
DB_USER=your-db-user
DB_PASSWORD=strong-secure-password
DB_NAME=recipe_platform

# JWT
JWT_SECRET=super-secret-random-string-min-32-chars

# Email
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# URLs
CLIENT_URL=https://your-frontend-url.com
SERVER_URL=https://your-backend-url.com

# OAuth (if using)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### Frontend (.env in client folder)
```env
REACT_APP_API_URL=https://your-backend-url.com/api
```

---

## 🧪 Testing Deployment

### 1. Test Backend
```bash
curl https://your-backend-url.com/api/health
```

Should return:
```json
{"message":"Server is running!"}
```

### 2. Test Frontend
Visit: https://your-frontend-url.com

### 3. Test Features
- [ ] User registration
- [ ] User login
- [ ] Add recipe
- [ ] Like recipe
- [ ] Follow user
- [ ] Email sending
- [ ] Dashboard access

---

## 🔄 Continuous Deployment

### GitHub Actions (Auto-deploy on push)

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Deploy to Heroku
      uses: akhileshns/heroku-deploy@v3.12.12
      with:
        heroku_api_key: ${{secrets.HEROKU_API_KEY}}
        heroku_app_name: "your-app-name"
        heroku_email: "your-email@example.com"
```

---

## 📊 Monitoring

### Setup Monitoring Tools:
1. **Heroku Logs**
   ```bash
   heroku logs --tail
   ```

2. **PM2 Monitoring**
   ```bash
   pm2 monit
   ```

3. **Error Tracking**
   - Sentry.io
   - LogRocket
   - New Relic

---

## 🐛 Common Deployment Issues

### Issue 1: Database Connection Failed
**Solution:**
- Check database credentials
- Verify database is running
- Check firewall rules
- Ensure database accepts remote connections

### Issue 2: Build Failed
**Solution:**
```bash
# Clear cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Issue 3: Environment Variables Not Working
**Solution:**
- Restart server after changing .env
- Check variable names (case-sensitive)
- Verify .env is not in .gitignore for deployment

### Issue 4: CORS Errors
**Solution:**
Update CORS in server.js:
```javascript
app.use(cors({
    origin: [
        'http://localhost:3000',
        'https://your-production-url.com'
    ],
    credentials: true
}));
```

---

## 📚 Post-Deployment

### 1. Setup Domain
- Buy domain from Namecheap/GoDaddy
- Point DNS to your server IP
- Configure SSL certificate

### 2. Setup Backups
```bash
# Database backup script
mysqldump -u user -p recipe_platform > backup.sql

# Automate with cron
crontab -e
# Add: 0 2 * * * mysqldump -u user -p recipe_platform > /backups/backup-$(date +\%Y\%m\%d).sql
```

### 3. Monitor Performance
- Setup Google Analytics
- Monitor server resources
- Track error rates
- Monitor API response times

---

## 🎉 Deployment Complete!

Your recipe platform is now live! 🚀

### Next Steps:
1. Test all features thoroughly
2. Monitor logs for errors
3. Setup automated backups
4. Configure monitoring alerts
5. Share with users!

---

## 📞 Support Resources

- **Heroku Docs:** https://devcenter.heroku.com/
- **Vercel Docs:** https://vercel.com/docs
- **Railway Docs:** https://docs.railway.app/
- **DigitalOcean Tutorials:** https://www.digitalocean.com/community/tutorials

---

**Need help? Check the logs and error messages first!**

Good luck with your deployment! 🎊
