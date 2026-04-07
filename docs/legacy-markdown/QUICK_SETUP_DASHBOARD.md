# Quick Setup: Dashboard & Social Features ⚡

## 🚀 Quick Start (2 minutes)

### Step 1: Create Database Tables

Run this command in your terminal:

```bash
mysql -u root -p recipe_platform < setup-database.sql
```

Or manually:
```bash
mysql -u root -p
```

Then in MySQL:
```sql
USE recipe_platform;

CREATE TABLE IF NOT EXISTS likes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    recipe_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
    UNIQUE KEY unique_like (user_id, recipe_id),
    INDEX idx_recipe_id (recipe_id),
    INDEX idx_user_id (user_id)
);

CREATE TABLE IF NOT EXISTS follows (
    id INT PRIMARY KEY AUTO_INCREMENT,
    follower_id INT NOT NULL,
    following_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_follow (follower_id, following_id),
    INDEX idx_follower (follower_id),
    INDEX idx_following (following_id),
    CHECK (follower_id != following_id)
);
```

### Step 2: Verify Tables Created

```sql
SHOW TABLES;
```

You should see:
- users
- recipes
- favorites
- comments
- ratings
- **likes** ← NEW
- **follows** ← NEW

### Step 3: Server is Already Running!

The server should automatically restart and work now.

---

## ✨ New Features

### 1. Dashboard
- Access: Click "Dashboard" in navigation (when logged in)
- URL: http://localhost:3000/dashboard
- Features:
  - View your posted recipes
  - See total likes
  - Track followers/following
  - Delete recipes

### 2. Like Recipes
- Click ❤️ icon on any recipe
- Real-time like counts
- Toggle like/unlike

### 3. Follow Users
- Click "+ Follow" button on recipes
- Follow recipe creators
- Track who you're following

---

## 🧪 Test It Now!

### Test Dashboard
1. Login at http://localhost:3000
2. Click "Dashboard" in navigation
3. View your stats

### Test Likes
1. Go to Recipe page
2. Scroll to "Community Recipes"
3. Click heart icon ❤️
4. See count increase

### Test Follows
1. Find a recipe by another user
2. Click "+ Follow" button
3. Button changes to "✓ Following"

---

## 📊 What You Get

### Dashboard Stats
- 📝 Total Recipes Posted
- ❤️ Total Likes Received
- 👥 Followers Count
- 👤 Following Count

### Recipe Features
- Like/unlike recipes
- Follow recipe authors
- See like counts
- View author names

---

## 🔧 Files Created/Modified

### Backend
- ✅ `routes/likes.js` - Like functionality
- ✅ `routes/follows.js` - Follow functionality
- ✅ `server.js` - Added new routes
- ✅ `database.sql` - Updated schema
- ✅ `setup-database.sql` - Quick setup script

### Frontend
- ✅ `client/src/components/Dashboard.js` - Dashboard component
- ✅ `client/src/stylesSheets/Dashboard.css` - Dashboard styles
- ✅ `client/src/components/recipe.js` - Updated with likes/follows
- ✅ `client/src/stylesSheets/recipe.css` - Updated styles
- ✅ `client/src/services/api.js` - Added likes/follows API
- ✅ `client/src/App.js` - Added dashboard route
- ✅ `client/src/components/Navbar.js` - Added dashboard link

---

## ⚠️ Important Notes

1. **Database Required**: Must create `likes` and `follows` tables
2. **Login Required**: Must be logged in to use features
3. **Server Running**: Server should be running on port 5001
4. **Client Running**: Client should be running on port 3000

---

## 🐛 Troubleshooting

### Error: "Table 'likes' doesn't exist"
**Solution:** Run the database setup commands above

### Dashboard not showing
**Solution:** Make sure you're logged in

### Likes not working
**Solution:** 
1. Check if tables are created
2. Verify you're logged in
3. Check browser console for errors

---

## 📋 Quick Checklist

- [ ] Run database setup commands
- [ ] Verify tables created (`SHOW TABLES;`)
- [ ] Server running (should auto-restart)
- [ ] Login to application
- [ ] Click "Dashboard" in navigation
- [ ] Test like functionality
- [ ] Test follow functionality

---

## 🎉 That's It!

Once the database tables are created, everything else is ready!

**Access Dashboard:** http://localhost:3000/dashboard

---

**Need detailed docs?** Check `USER_DASHBOARD_SETUP.md`
