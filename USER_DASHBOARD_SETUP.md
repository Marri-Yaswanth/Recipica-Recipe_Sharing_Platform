# User Dashboard & Social Features Setup Guide 🎯

## New Features Added ✨

### 1. User Dashboard
- View all your posted recipes
- See total likes across all recipes
- Track followers and following count
- Manage your recipes (edit/delete)

### 2. Recipe Likes System
- Users can like/unlike recipes
- Real-time like counts
- Like tracking per user

### 3. User Follow System
- Follow other recipe creators
- See follower/following counts
- Follow button on each recipe

---

## 🗄️ Database Setup

### Step 1: Update Database Schema

Run these SQL commands to add the new tables:

```sql
-- Likes table (for recipe likes)
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

-- Follows table (user following other users)
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

### Step 2: Run Database Migration

```bash
mysql -u root -p recipe_platform < database.sql
```

Or manually in MySQL:
```bash
mysql -u root -p
use recipe_platform;
source database.sql;
```

---

## 🚀 Features Overview

### Dashboard Features

**Stats Cards:**
- 📝 Total Recipes Posted
- ❤️ Total Likes Received
- 👥 Followers Count
- 👤 Following Count

**My Recipes Section:**
- View all your posted recipes
- See like count for each recipe
- Edit recipe (coming soon)
- Delete recipe
- Recipe metadata (prep time, cook time, servings)

### Recipe Page Features

**Community Recipes:**
- View recipes posted by other users
- See recipe author name
- Like/unlike recipes
- Follow/unfollow recipe authors
- Real-time like counts

**Featured Recipes:**
- Static recipes from JSON files
- Like functionality
- Search across all recipes

---

## 📡 API Endpoints

### Likes API

```javascript
// Like a recipe
POST /api/likes/:recipeId
Headers: Authorization: Bearer <token>

// Unlike a recipe
DELETE /api/likes/:recipeId
Headers: Authorization: Bearer <token>

// Get recipe likes
GET /api/likes/recipe/:recipeId

// Check if user liked a recipe
GET /api/likes/check/:recipeId
Headers: Authorization: Bearer <token>
```

### Follows API

```javascript
// Follow a user
POST /api/follows/:userId
Headers: Authorization: Bearer <token>

// Unfollow a user
DELETE /api/follows/:userId
Headers: Authorization: Bearer <token>

// Get user's followers
GET /api/follows/followers/:userId

// Get users that a user is following
GET /api/follows/following/:userId

// Check if following a user
GET /api/follows/check/:userId
Headers: Authorization: Bearer <token>

// Get follow stats
GET /api/follows/stats/:userId
```

---

## 🎨 Frontend Components

### New Components

1. **Dashboard.js**
   - User dashboard with stats
   - Recipe management
   - Located: `client/src/components/Dashboard.js`

2. **Updated Recipe.js**
   - Added like functionality
   - Added follow buttons
   - Community recipes section

### New Styles

1. **Dashboard.css**
   - Dashboard styling
   - Stats cards
   - Recipe grid
   - Located: `client/src/stylesSheets/Dashboard.css`

2. **Updated recipe.css**
   - Like button styles
   - Follow button styles
   - Recipe actions bar

---

## 🧪 Testing the Features

### Test Dashboard

1. **Login** to your account
2. **Click** "Dashboard" in navigation
3. **View** your stats and recipes

### Test Likes

1. **Go to** Recipe page
2. **Scroll** to Community Recipes
3. **Click** heart icon to like
4. **Click again** to unlike

### Test Follows

1. **Find** a recipe by another user
2. **Click** "+ Follow" button
3. **Button changes** to "✓ Following"
4. **Click again** to unfollow

---

## 📊 Database Schema

### Likes Table
```
id (INT, PRIMARY KEY)
user_id (INT, FOREIGN KEY → users.id)
recipe_id (INT, FOREIGN KEY → recipes.id)
created_at (TIMESTAMP)
```

### Follows Table
```
id (INT, PRIMARY KEY)
follower_id (INT, FOREIGN KEY → users.id)
following_id (INT, FOREIGN KEY → users.id)
created_at (TIMESTAMP)
```

---

## 🔧 Configuration

### Backend Routes Added

```javascript
// server.js
import likesRoutes from './routes/likes.js';
import followsRoutes from './routes/follows.js';

app.use('/api/likes', likesRoutes);
app.use('/api/follows', followsRoutes);
```

### Frontend Routes Added

```javascript
// App.js
<Route path="/dashboard" element={<DashboardWrapper />} />
```

---

## 🎯 User Flow

### Dashboard Flow
```
Login → Click Dashboard → View Stats → Manage Recipes
```

### Like Flow
```
View Recipe → Click Heart → Like Added → Count Updates
```

### Follow Flow
```
View Recipe → Click Follow → Following User → Stats Update
```

---

## 📱 Responsive Design

All new features are fully responsive:
- ✅ Desktop (1200px+)
- ✅ Tablet (768px - 1199px)
- ✅ Mobile (< 768px)

---

## 🔐 Security Features

- ✅ JWT authentication required for likes
- ✅ JWT authentication required for follows
- ✅ Users can't follow themselves
- ✅ Unique constraints prevent duplicate likes/follows
- ✅ Cascade delete on user deletion

---

## 🎨 UI/UX Features

### Dashboard
- Beautiful gradient stat cards
- Hover effects on cards
- Loading spinner
- Empty state messages
- Responsive grid layout

### Likes
- Heart animation on like
- Color change when liked
- Real-time count updates
- Smooth transitions

### Follows
- Button state changes
- Color coding (blue = follow, green = following)
- Hover effects
- Instant feedback

---

## 📝 Next Steps

### Recommended Enhancements

1. **Add Recipe Creation Form**
   - Allow users to post new recipes
   - Image upload functionality
   - Category selection

2. **Edit Recipe Functionality**
   - Update recipe details
   - Change images
   - Modify ingredients

3. **User Profile Pages**
   - View other users' profiles
   - See their recipes
   - Follow from profile

4. **Notifications**
   - New follower notifications
   - Like notifications
   - Comment notifications

5. **Recipe Comments**
   - Add comment system
   - Reply to comments
   - Like comments

---

## 🐛 Troubleshooting

### Database Errors

**Error: Table doesn't exist**
```bash
# Run database migration
mysql -u root -p recipe_platform < database.sql
```

**Error: Foreign key constraint fails**
```bash
# Make sure users and recipes tables exist first
# Check database.sql file order
```

### API Errors

**Error: 401 Unauthorized**
- Make sure user is logged in
- Check JWT token in localStorage
- Verify token is being sent in headers

**Error: 404 Not Found**
- Check API endpoint URLs
- Verify routes are mounted in server.js
- Check network tab in browser DevTools

### Frontend Errors

**Dashboard not loading**
- Check if user is logged in
- Verify API endpoints are working
- Check browser console for errors

**Likes not working**
- Ensure database tables are created
- Check if user is authenticated
- Verify API responses in Network tab

---

## ✅ Checklist

- [ ] Database tables created (likes, follows)
- [ ] Backend routes added (likes.js, follows.js)
- [ ] Server.js updated with new routes
- [ ] Frontend components created (Dashboard.js)
- [ ] API service updated (likes, follows)
- [ ] Navbar updated with Dashboard link
- [ ] Styles added (Dashboard.css, recipe.css)
- [ ] App.js updated with Dashboard route
- [ ] Server restarted
- [ ] Tested dashboard access
- [ ] Tested like functionality
- [ ] Tested follow functionality

---

## 🎉 Success!

Once setup is complete, users can:
- ✅ View their dashboard
- ✅ See their recipe stats
- ✅ Like recipes
- ✅ Follow other users
- ✅ Track followers/following
- ✅ Manage their recipes

---

**All features are ready to use!** 🚀
