# Quick Deploy to Heroku ⚡

## Fastest Way to Deploy (10 minutes)

### Prerequisites
- Heroku account (free): https://signup.heroku.com/
- Git installed
- Heroku CLI installed

---

## Step-by-Step Deployment

### 1. Install Heroku CLI (if not installed)
```bash
# macOS
brew tap heroku/brew && brew install heroku

# Or download: https://devcenter.heroku.com/articles/heroku-cli
```

### 2. Login to Heroku
```bash
heroku login
```
Press any key to open browser and login.

### 3. Create Heroku App
```bash
heroku create your-recipe-app-name
```
Replace `your-recipe-app-name` with your desired name (must be unique).

### 4. Add MySQL Database
```bash
heroku addons:create cleardb:ignite
```
This adds a free MySQL database.

### 5. Get Database URL
```bash
heroku config:get CLEARDB_DATABASE_URL
```
Copy this URL - you'll need it!

### 6. Parse Database URL
The URL looks like:
```
mysql://username:password@host/database?reconnect=true
```

Extract:
- **host**: The part after @ and before /
- **username**: The part after mysql:// and before :
- **password**: The part after : and before @
- **database**: The part after / and before ?

### 7. Set Environment Variables
```bash
# Set all environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=$(openssl rand -base64 32)
heroku config:set EMAIL_USER=recipica@gmail.com
heroku config:set EMAIL_PASSWORD=hpzb sbdo yzvx fivn
heroku config:set CLIENT_URL=https://recipica.herokuapp.com
```

Replace `your-recipe-app-name` with your actual app name.

### 8. Setup Database
```bash
# Connect to ClearDB
mysql -h [host] -u [username] -p [database]
# Enter password when prompted

# Once connected, run:
source database.sql
source setup-database.sql
exit
```

### 9. Initialize Git (if not already)
```bash
git init
git add .
git commit -m "Initial commit for deployment"
```

### 10. Deploy to Heroku
```bash
git push heroku main
```

If your branch is named `master`:
```bash
git push heroku master
```

### 11. Open Your App
```bash
heroku open
```

Your app is now live! 🎉

---

## Verify Deployment

### Check if server is running:
```bash
heroku logs --tail
```

### Test API:
```bash
curl https://recipica.herokuapp.com/api/health
```

Should return:
```json
{"message":"Server is running!"}
```

---

## Update Deployment

When you make changes:
```bash
git add .
git commit -m "Your update message"
git push heroku main
```

---

## Troubleshooting

### App crashed?
```bash
heroku logs --tail
```
Check the error messages.

### Database not working?
```bash
heroku config
```
Verify all environment variables are set.

### Need to restart?
```bash
heroku restart
```

---

## Your App URLs

- **Frontend:** https://recipica.herokuapp.com
- **API:** https://recipica.herokuapp.com/api
- **Health Check:** https://recipica.herokuapp.com/api/health

---

## Free Tier Limits

Heroku free tier includes:
- ✅ 550-1000 dyno hours/month
- ✅ Free MySQL database (5MB)
- ✅ SSL certificate
- ⚠️ App sleeps after 30 min of inactivity
- ⚠️ Takes ~30 seconds to wake up

---

## Upgrade Options

### Need more?
```bash
# Upgrade database
heroku addons:upgrade cleardb:punch

# Keep app awake
heroku ps:scale web=1:hobby
```

---

**That's it! Your app is deployed!** 🚀

Visit: https://recipica.herokuapp.com
