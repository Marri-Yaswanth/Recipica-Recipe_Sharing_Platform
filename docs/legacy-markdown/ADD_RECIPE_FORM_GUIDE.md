# Add Recipe Form - Setup Guide 🍳

## New Feature: Recipe Submission Form

Users can now add their own recipes with diet type categorization!

---

## ✨ Features Added

### 1. Add Recipe Form
- Complete recipe submission form
- User-friendly interface
- Real-time validation
- Dynamic ingredient fields

### 2. Diet Type Categories
- 🥬 **Vegetarian** - No meat, no eggs
- 🥚 **Eggetarian** - Vegetarian + eggs
- 🍗 **Non-Vegetarian** - Contains meat/fish

### 3. Recipe Fields
- Recipe name
- Description
- Category (Indian, Italian, Chinese, etc.)
- Diet type
- Ingredients (dynamic list)
- Cooking instructions
- Prep time
- Cook time
- Servings
- Image URL (optional)

---

## 🗄️ Database Setup

### Step 1: Add diet_type Column

Run this command:
```bash
mysql -u root -p recipe_platform < add-diet-type.sql
```

Or manually in MySQL:
```sql
USE recipe_platform;

ALTER TABLE recipes 
ADD COLUMN diet_type ENUM('vegetarian', 'eggetarian', 'non-vegetarian') DEFAULT 'vegetarian' 
AFTER category;

ALTER TABLE recipes 
ADD INDEX idx_diet_type (diet_type);
```

### Step 2: Verify Column Added
```sql
DESCRIBE recipes;
```

You should see `diet_type` column in the table.

---

## 🎨 Components Created

### 1. AddRecipe.js
- Location: `client/src/components/AddRecipe.js`
- Full recipe submission form
- Dynamic ingredient fields
- Form validation
- Loading states

### 2. AddRecipe.css
- Location: `client/src/stylesSheets/AddRecipe.css`
- Beautiful form styling
- Responsive design
- Button animations

---

## 🚀 How to Use

### For Users:

1. **Login** to your account
2. **Go to Dashboard** (click Dashboard in navigation)
3. **Click "Add New Recipe"** button
4. **Fill in the form:**
   - Recipe name
   - Description
   - Select category
   - Select diet type (Vegetarian/Eggetarian/Non-Vegetarian)
   - Add ingredients (click "+ Add Ingredient" for more)
   - Write cooking instructions
   - Add prep/cook time and servings
   - Optionally add image URL
5. **Click "Add Recipe"**
6. **Recipe is published!**

### Access Points:
- Dashboard → "Add New Recipe" button
- Direct URL: http://localhost:3000/add-recipe

---

## 📊 Form Fields

### Required Fields (*)
- **Recipe Name** - Name of your dish
- **Description** - Brief description
- **Category** - Cuisine type
- **Diet Type** - Vegetarian/Eggetarian/Non-Vegetarian
- **Ingredients** - At least one ingredient
- **Instructions** - Cooking steps

### Optional Fields
- **Image URL** - Link to recipe image
- **Prep Time** - Preparation time in minutes
- **Cook Time** - Cooking time in minutes
- **Servings** - Number of servings

---

## 🎯 Diet Type Categories

### Vegetarian 🥬
- No meat
- No eggs
- No fish/seafood
- Examples: Salads, Pasta, Vegetable Curry

### Eggetarian 🥚
- Vegetarian + eggs
- No meat
- No fish/seafood
- Examples: Omelette, Egg Curry, Pancakes

### Non-Vegetarian 🍗
- Contains meat, fish, or seafood
- Examples: Chicken Curry, Fish Fry, Beef Stew

---

## 🎨 UI Features

### Form Design
- Clean, modern interface
- Gradient submit button
- Responsive layout
- Mobile-friendly

### Dynamic Ingredients
- Add unlimited ingredients
- Remove ingredients
- Reorder fields
- Clear interface

### Validation
- Required field checks
- Real-time feedback
- Error messages
- Success notifications

### Loading States
- Submit button shows loading
- Prevents double submission
- User feedback

---

## 📱 Responsive Design

Works perfectly on:
- ✅ Desktop (1200px+)
- ✅ Tablet (768px - 1199px)
- ✅ Mobile (< 768px)

---

## 🔄 User Flow

```
Login → Dashboard → Add Recipe → Fill Form → Submit → Success!
```

Detailed flow:
1. User logs in
2. Navigates to Dashboard
3. Clicks "Add New Recipe"
4. Fills out form fields
5. Adds ingredients dynamically
6. Writes instructions
7. Selects diet type
8. Submits form
9. Recipe is saved to database
10. Redirected to Dashboard
11. Recipe appears in "My Recipes"

---

## 🎨 Diet Type Display

### On Dashboard
- Shows diet badge on each recipe
- Color-coded:
  - Green for Vegetarian
  - Yellow for Eggetarian
  - Orange for Non-Vegetarian

### On Recipe Page
- Diet indicator icon on recipe image
- Shows emoji:
  - 🥬 for Vegetarian
  - 🥚 for Eggetarian
  - 🍗 for Non-Vegetarian

---

## 📁 Files Created/Modified

### New Files:
1. `client/src/components/AddRecipe.js` - Form component
2. `client/src/stylesSheets/AddRecipe.css` - Form styles
3. `add-diet-type.sql` - Database migration

### Modified Files:
1. `client/src/App.js` - Added /add-recipe route
2. `client/src/components/Dashboard.js` - Added navigation to form
3. `client/src/components/recipe.js` - Added diet indicator
4. `client/src/stylesSheets/Dashboard.css` - Added diet badge styles
5. `client/src/stylesSheets/recipe.css` - Added diet indicator styles
6. `routes/recipes.js` - Added diet_type handling
7. `database.sql` - Updated schema

---

## 🔐 Security

- ✅ JWT authentication required
- ✅ User must be logged in
- ✅ Input validation
- ✅ SQL injection prevention
- ✅ XSS protection

---

## 🧪 Testing

### Test Add Recipe:
1. Login to application
2. Go to Dashboard
3. Click "Add New Recipe"
4. Fill in all required fields
5. Select diet type
6. Add multiple ingredients
7. Submit form
8. Verify success message
9. Check Dashboard for new recipe
10. Verify diet badge shows correctly

### Test Diet Types:
1. Add vegetarian recipe
2. Add eggetarian recipe
3. Add non-vegetarian recipe
4. Verify badges show correctly
5. Verify indicators show on recipe page

---

## 📊 Database Schema

### Updated recipes table:
```sql
CREATE TABLE recipes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    ingredients JSON,
    instructions TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    diet_type ENUM('vegetarian', 'eggetarian', 'non-vegetarian') DEFAULT 'vegetarian',
    image_url VARCHAR(500),
    prep_time INT DEFAULT 0,
    cook_time INT DEFAULT 0,
    servings INT DEFAULT 4,
    status ENUM('active', 'draft', 'archived') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_category (category),
    INDEX idx_diet_type (diet_type),
    INDEX idx_user_id (user_id)
);
```

---

## 🎯 Example Recipe Submission

```javascript
{
  name: "Paneer Butter Masala",
  description: "Creamy and delicious paneer curry",
  category: "Indian",
  dietType: "vegetarian",
  ingredients: [
    "250g paneer cubes",
    "2 tomatoes",
    "1 onion",
    "2 tbsp butter",
    "1/2 cup cream",
    "Spices"
  ],
  instructions: "1. Heat butter in pan\n2. Add onions and cook\n3. Add tomatoes and spices\n4. Add paneer and cream\n5. Simmer for 10 minutes",
  prepTime: 15,
  cookTime: 20,
  servings: 4,
  imageUrl: "https://example.com/paneer.jpg"
}
```

---

## 🐛 Troubleshooting

### Form not showing
- Check if user is logged in
- Verify route is added in App.js
- Check browser console for errors

### Submit button not working
- Check all required fields are filled
- Verify at least one ingredient is added
- Check network tab for API errors

### Diet type not showing
- Run database migration
- Verify diet_type column exists
- Check recipes table schema

### Images not loading
- Verify image URL is valid
- Check CORS settings
- Use placeholder if no image

---

## ✅ Setup Checklist

- [ ] Run database migration (add-diet-type.sql)
- [ ] Verify diet_type column exists
- [ ] Server running (should auto-restart)
- [ ] Client running
- [ ] Login to application
- [ ] Navigate to Dashboard
- [ ] Click "Add New Recipe"
- [ ] Test form submission
- [ ] Verify recipe appears in Dashboard
- [ ] Check diet badge displays
- [ ] Test all three diet types

---

## 🎉 Success!

Once setup is complete, users can:
- ✅ Add their own recipes
- ✅ Categorize by diet type
- ✅ Add multiple ingredients
- ✅ Include cooking instructions
- ✅ Specify prep/cook times
- ✅ Add recipe images
- ✅ View recipes on Dashboard
- ✅ See diet type badges
- ✅ Share recipes with community

---

## 📚 Next Steps (Optional)

### Recommended Enhancements:
1. **Image Upload** - Upload images instead of URLs
2. **Recipe Edit** - Edit existing recipes
3. **Draft Recipes** - Save as draft
4. **Recipe Categories** - More categories
5. **Nutrition Info** - Add calorie/nutrition data
6. **Cooking Tips** - Add tips section
7. **Video URL** - Add cooking video links
8. **Tags** - Add recipe tags
9. **Difficulty Level** - Easy/Medium/Hard
10. **Recipe Rating** - Self-rate recipes

---

**Everything is ready! Just run the database migration and start adding recipes!** 🚀
