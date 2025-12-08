# Commands Reference

Quick reference for all available commands in the recipe-platform-combined project.

## 🚀 Setup Commands

### Automated Setup
```bash
./setup.sh
```
Runs interactive setup wizard that:
- Checks prerequisites
- Installs dependencies
- Creates .env file
- Sets up database

### Manual Installation
```bash
# Install all dependencies
npm install                    # Backend dependencies
cd client && npm install      # Frontend dependencies
```

## 🗄️ Database Commands

### Create Database
```bash
mysql -u root -p -e "CREATE DATABASE recipe_platform;"
```

### Import Schema
```bash
mysql -u root -p recipe_platform < database.sql
```

### Access Database
```bash
mysql -u root -p recipe_platform
```

### Verify Tables
```sql
SHOW TABLES;
DESCRIBE users;
DESCRIBE recipes;
```

### Drop Database (if needed)
```bash
mysql -u root -p -e "DROP DATABASE recipe_platform;"
```

## 🏃 Running the Application

### Development Mode

**Run Both Servers (Recommended)**
```bash
npm run concurrently
```
Starts both backend (port 5000) and frontend (port 3000)

**Run Backend Only**
```bash
npm run dev
# or
npm start
```

**Run Frontend Only**
```bash
cd client
npm start
```

### Production Mode

**Build Frontend**
```bash
cd client
npm run build
```

**Start Production Server**
```bash
NODE_ENV=production npm start
```

## 🧪 Testing Commands

### Test Backend Health
```bash
curl http://localhost:5000/api/health
```

### Test Signup
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "Test123!@#"
  }'
```

### Test Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#"
  }'
```

### Test Get Recipes
```bash
curl http://localhost:5000/api/recipes
```

### Test Create Recipe (with token)
```bash
curl -X POST http://localhost:5000/api/recipes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "Test Recipe",
    "description": "A delicious test",
    "ingredients": ["item1", "item2"],
    "instructions": "Cook well",
    "category": "indian",
    "prepTime": 15,
    "cookTime": 30,
    "servings": 4
  }'
```

### Test Get User Profile (with token)
```bash
curl http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 🛠️ Development Commands

### Install New Package

**Backend**
```bash
npm install package-name
npm install --save-dev package-name  # Dev dependency
```

**Frontend**
```bash
cd client
npm install package-name
```

### Check for Updates
```bash
npm outdated
cd client && npm outdated
```

### Update Packages
```bash
npm update
cd client && npm update
```

## 🐛 Troubleshooting Commands

### Kill Port Processes

**Kill Backend (port 5000)**
```bash
lsof -ti:5000 | xargs kill -9
```

**Kill Frontend (port 3000)**
```bash
lsof -ti:3000 | xargs kill -9
```

**Find Process on Port**
```bash
lsof -i :5000
lsof -i :3000
```

### Clean Installation

**Backend**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Frontend**
```bash
cd client
rm -rf node_modules package-lock.json
npm install
```

### Check Node Version
```bash
node -v
npm -v
```

### Check MySQL Status
```bash
# macOS
brew services list | grep mysql

# Start MySQL
brew services start mysql

# Stop MySQL
brew services stop mysql
```

## 📝 Git Commands

### Initialize Repository
```bash
git init
git add .
git commit -m "Initial commit: Combined recipe platform"
```

### Create Remote Repository
```bash
git remote add origin https://github.com/yourusername/recipe-platform-combined.git
git branch -M main
git push -u origin main
```

### Common Git Operations
```bash
git status
git add .
git commit -m "Your message"
git push
git pull
git log --oneline
```

## 🔍 Debugging Commands

### Check Environment Variables
```bash
# View .env file
cat .env

# Check if loaded
node -e "require('dotenv').config(); console.log(process.env.DB_NAME)"
```

### View Logs

**Backend Logs**
```bash
# Real-time logs
npm run dev

# With debug info
DEBUG=* npm run dev
```

**Frontend Logs**
- Check browser console (F12)
- Network tab for API calls

### Database Query Testing
```bash
mysql -u root -p recipe_platform -e "SELECT * FROM users LIMIT 5;"
mysql -u root -p recipe_platform -e "SELECT COUNT(*) FROM recipes;"
```

## 📊 Monitoring Commands

### Check Server Status
```bash
# Check if server is running
curl -I http://localhost:5000/api/health
curl -I http://localhost:3000
```

### View Running Processes
```bash
ps aux | grep node
ps aux | grep mysql
```

### Check Memory Usage
```bash
top -o MEM
```

## 🔒 Security Commands

### Generate JWT Secret
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Create MySQL User
```sql
CREATE USER 'recipe_user'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON recipe_platform.* TO 'recipe_user'@'localhost';
FLUSH PRIVILEGES;
```

### Hash Password (for testing)
```bash
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('Test123!@#', 10).then(h => console.log(h))"
```

## 📦 Build Commands

### Frontend Production Build
```bash
cd client
npm run build
```

### Serve Production Build
```bash
# Install serve globally
npm install -g serve

# Serve build folder
cd client/build
serve -s .
```

## 🧹 Cleanup Commands

### Remove All node_modules
```bash
rm -rf node_modules client/node_modules
```

### Remove Build Files
```bash
rm -rf client/build
```

### Clean npm Cache
```bash
npm cache clean --force
```

## 📋 Useful Aliases (Optional)

Add to `~/.zshrc`:

```bash
# Recipe Platform Aliases
alias recipe-start="cd '/Users/yashu/Desktop/untitled folder/recipe-platform-combined' && npm run concurrently"
alias recipe-backend="cd '/Users/yashu/Desktop/untitled folder/recipe-platform-combined' && npm run dev"
alias recipe-frontend="cd '/Users/yashu/Desktop/untitled folder/recipe-platform-combined/client' && npm start"
alias recipe-setup="cd '/Users/yashu/Desktop/untitled folder/recipe-platform-combined' && ./setup.sh"
```

Apply changes:
```bash
source ~/.zshrc
```

## 🎯 Quick Actions

### Complete Reset
```bash
# Stop all processes
lsof -ti:5000 | xargs kill -9
lsof -ti:3000 | xargs kill -9

# Clean install
rm -rf node_modules client/node_modules package-lock.json client/package-lock.json
npm install
cd client && npm install && cd ..

# Reset database
mysql -u root -p -e "DROP DATABASE IF EXISTS recipe_platform;"
mysql -u root -p -e "CREATE DATABASE recipe_platform;"
mysql -u root -p recipe_platform < database.sql

# Start fresh
npm run concurrently
```

### Quick Test Suite
```bash
# 1. Health check
curl http://localhost:5000/api/health

# 2. Create user
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"Test123!@#"}'

# 3. Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123!@#"}'

# 4. Get recipes
curl http://localhost:5000/api/recipes
```

## 📖 Documentation Commands

### View Documentation
```bash
cat README.md
cat QUICK_START.md
cat PROJECT_COMBINATION_ANALYSIS.md
cat COMBINATION_SUMMARY.md
```

### Open in Browser (macOS)
```bash
open README.md
```

---

**Note**: Replace `YOUR_TOKEN_HERE` with actual JWT token received from login/signup responses.

**Tip**: Use `jq` for pretty JSON output:
```bash
curl http://localhost:5000/api/recipes | jq
```
