# Quick Start Guide - Recipe Platform Combined

This guide will help you get the combined recipe platform up and running quickly.

## 🚀 One-Command Setup (Recommended)

```bash
cd "/Users/yashu/Desktop/untitled folder/recipe-platform-combined"
./setup.sh
```

The setup script will:
- Check prerequisites (Node.js, MySQL)
- Install all dependencies (server + client)
- Create .env configuration file
- Setup the MySQL database

## 📋 Manual Setup

### Step 1: Install Dependencies

```bash
# Install server dependencies
npm install

# Install client dependencies
cd client && npm install && cd ..
```

### Step 2: Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit with your settings
nano .env
```

Required configuration:
```env
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=recipe_platform
JWT_SECRET=generate-random-string-here
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-gmail-app-password
```

### Step 3: Setup Database

```bash
# Create database
mysql -u root -p -e "CREATE DATABASE recipe_platform;"

# Import schema
mysql -u root -p recipe_platform < database.sql
```

### Step 4: Run the Application

**Option A: Run both together (Recommended)**
```bash
npm run concurrently
```

**Option B: Run separately**

Terminal 1 - Backend:
```bash
npm run dev
```

Terminal 2 - Frontend:
```bash
cd client
npm start
```

## 🌐 Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health

## 🧪 Test the Application

### 1. Test Backend Health

```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{"message":"Server is running!"}
```

### 2. Create a Test User

**Via Frontend:**
1. Go to http://localhost:3000
2. Click "Login" button
3. Switch to "Sign Up" tab
4. Fill in the form
5. Click "Sign Up"

**Via API:**
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "Test123!@#"
  }'
```

### 3. Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#"
  }'
```

Save the returned token for authenticated requests.

### 4. Get Recipes

```bash
curl http://localhost:5000/api/recipes
```

### 5. Create a Recipe (requires token)

```bash
curl -X POST http://localhost:5000/api/recipes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "Test Recipe",
    "description": "A delicious test recipe",
    "ingredients": ["ingredient1", "ingredient2"],
    "instructions": "Cook it well",
    "category": "indian",
    "prepTime": 15,
    "cookTime": 30,
    "servings": 4
  }'
```

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Kill backend process (port 5000)
lsof -ti:5000 | xargs kill -9

# Kill frontend process (port 3000)
lsof -ti:3000 | xargs kill -9
```

### Database Connection Failed

1. Check MySQL is running:
```bash
mysql -u root -p
```

2. Verify database exists:
```sql
SHOW DATABASES;
USE recipe_platform;
SHOW TABLES;
```

3. Check .env credentials match your MySQL setup

### Module Not Found

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

cd client
rm -rf node_modules package-lock.json
npm install
```

### CORS Errors

Make sure both servers are running:
- Backend on port 5000
- Frontend on port 3000

The `proxy` setting in `client/package.json` should be:
```json
"proxy": "http://localhost:5000"
```

## 📧 Email Setup (Gmail)

For forgot password functionality:

1. Enable 2-Step Verification on your Gmail account
2. Generate an App Password: https://myaccount.google.com/apppasswords
3. Use the app password in `.env`:

```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
```

## 🎯 Key Features to Test

### Authentication
- ✅ Sign up with new user
- ✅ Login with existing user
- ✅ Logout functionality
- ✅ Forgot password (email must be configured)

### Recipes
- ✅ Browse all recipes
- ✅ Filter by category
- ✅ Search recipes
- ✅ Create new recipe (requires login)
- ✅ Edit your recipe (requires login)
- ✅ Delete your recipe (requires login)

### Navigation
- ✅ Home section
- ✅ Recipe section
- ✅ About section
- ✅ Contact section
- ✅ Smooth scrolling

## 📱 Responsive Testing

Test on different screen sizes:
- Desktop (1920px+)
- Laptop (1024px - 1920px)
- Tablet (768px - 1024px)
- Mobile (< 768px)

## 🔒 Security Checklist

Before deploying:
- [ ] Change JWT_SECRET to a strong random string
- [ ] Use environment-specific .env files
- [ ] Enable HTTPS in production
- [ ] Set secure cookie options
- [ ] Configure CORS for specific origins
- [ ] Add rate limiting
- [ ] Implement input sanitization
- [ ] Enable SQL injection prevention

## 📚 Additional Resources

- [Full Documentation](./README.md)
- [API Documentation](./README.md#-api-documentation)
- [Database Schema](./database.sql)
- [Environment Setup](./.env.example)

## 🆘 Need Help?

1. Check the main README.md
2. Review the API documentation
3. Check console logs for errors
4. Verify all environment variables
5. Ensure database is properly configured

---

**Happy Coding! 🚀**
