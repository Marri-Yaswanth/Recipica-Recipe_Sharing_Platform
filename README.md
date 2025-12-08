# Recipe Platform Combined

A full-stack recipe sharing platform combining the best features from both recipe-share (PHP) and recipe-react projects. This unified application uses **React** for the frontend and **Express.js + Node.js** for the backend, with MySQL database integration.

## 🎯 Project Overview

This project merges two recipe platforms into one cohesive application:
- **Frontend**: React 18.3.1 with React Router, Context API, and modern UI components
- **Backend**: Express.js REST API replacing the original PHP backend
- **Database**: MySQL with proper schema and relationships
- **Authentication**: JWT-based auth with bcrypt password hashing
- **Email**: Nodemailer integration for password reset and notifications

## ✨ Features

### User Features
- 🔐 **Authentication System**
  - User signup/login with validation
  - JWT token-based authentication
  - Password reset via email
  - Secure password hashing with bcrypt

- 🍳 **Recipe Management**
  - Browse recipes by category (Indian, Italian, Korean, etc.)
  - Search recipes by name or description
  - View detailed recipe information
  - Add new recipes (authenticated users)
  - Edit/delete your own recipes
  - Recipe ingredients, instructions, prep/cook time

- 👤 **User Profile**
  - View and edit profile information
  - Manage your recipe collection
  - Track recipe creation history

- 🎨 **Modern UI/UX**
  - Responsive design for all devices
  - Smooth animations and transitions
  - Parallax scrolling effects
  - Interactive recipe cards
  - Toast notifications for user feedback

## 🏗️ Project Structure

```
recipe-platform-combined/
├── server.js                 # Express server entry point
├── package.json              # Server dependencies
├── .env.example              # Environment variables template
├── database.sql              # MySQL database schema
├── config/
│   └── database.js           # Database connection configuration
├── routes/
│   ├── auth.js               # Authentication routes (signup, login, forgot password)
│   ├── recipes.js            # Recipe CRUD operations
│   └── users.js              # User profile management
└── client/                   # React frontend
    ├── package.json          # Client dependencies
    ├── public/               # Static assets
    └── src/
        ├── components/       # React components (Login, Navbar, Recipe, etc.)
        ├── services/         # API service layer
        ├── stylesSheets/     # CSS files
        ├── images/           # Image assets
        └── jsonFiles/        # Recipe JSON data
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v16+ recommended)
- **npm** or **yarn**
- **MySQL** (v5.7+ or v8.0+)
- **Git**

### Installation

1. **Clone the repository**
```bash
cd "/Users/yashu/Desktop/untitled folder/recipe-platform-combined"
```

2. **Install server dependencies**
```bash
npm install
```

3. **Install client dependencies**
```bash
cd client
npm install
cd ..
```

4. **Setup MySQL database**

Create a new database:
```bash
mysql -u root -p
CREATE DATABASE recipe_platform;
exit;
```

Import the schema:
```bash
mysql -u root -p recipe_platform < database.sql
```

5. **Configure environment variables**

Create `.env` file in the root directory:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=recipe_platform

JWT_SECRET=your-secret-key-change-this-to-random-string

EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-gmail-app-password

CLIENT_URL=http://localhost:3000
```

**Note**: For Gmail, you need to create an [App Password](https://support.google.com/accounts/answer/185833) instead of using your regular password.

### Running the Application

**Option 1: Run both server and client concurrently**
```bash
npm run concurrently
```

**Option 2: Run separately**

Terminal 1 - Backend:
```bash
npm run dev
```

Terminal 2 - Frontend:
```bash
cd client
npm start
```

**Access the application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 📚 API Documentation

### Authentication Endpoints

**POST** `/api/auth/signup`
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123!"
}
```

**POST** `/api/auth/login`
```json
{
  "email": "john@example.com",
  "password": "Password123!"
}
```

**POST** `/api/auth/forgot-password`
```json
{
  "email": "john@example.com"
}
```

**POST** `/api/auth/reset-password`
```json
{
  "token": "jwt-token-from-email",
  "newPassword": "NewPassword123!"
}
```

### Recipe Endpoints

**GET** `/api/recipes` - Get all recipes (with optional filters)
- Query params: `?category=indian&search=curry`

**GET** `/api/recipes/category/:category` - Get recipes by category

**GET** `/api/recipes/:id` - Get single recipe

**POST** `/api/recipes` - Create recipe (requires auth)
```json
{
  "name": "Chicken Curry",
  "description": "Delicious curry",
  "ingredients": ["chicken", "curry powder"],
  "instructions": "Cook the chicken...",
  "category": "indian",
  "imageUrl": "https://example.com/image.jpg",
  "prepTime": 15,
  "cookTime": 30,
  "servings": 4
}
```

**PUT** `/api/recipes/:id` - Update recipe (requires auth, owner only)

**DELETE** `/api/recipes/:id` - Delete recipe (requires auth, owner only)

### User Endpoints

**GET** `/api/users/profile` - Get user profile (requires auth)

**GET** `/api/users/recipes` - Get user's recipes (requires auth)

**PUT** `/api/users/profile` - Update profile (requires auth)
```json
{
  "name": "John Smith",
  "email": "john.smith@example.com"
}
```

## 🔒 Authentication Flow

1. User signs up or logs in
2. Server validates credentials
3. Server generates JWT token
4. Client stores token in localStorage
5. Client includes token in subsequent API requests
6. Server verifies token on protected routes

## 🗄️ Database Schema

### Users Table
- `id` - Primary key
- `name` - User's full name
- `email` - Unique email address
- `password` - Hashed password
- `created_at`, `updated_at` - Timestamps

### Recipes Table
- `id` - Primary key
- `user_id` - Foreign key to users
- `name` - Recipe name
- `description` - Recipe description
- `ingredients` - JSON array of ingredients
- `instructions` - Cooking instructions
- `category` - Recipe category (indian, italian, korean, etc.)
- `image_url` - Recipe image URL
- `prep_time` - Preparation time in minutes
- `cook_time` - Cooking time in minutes
- `servings` - Number of servings
- `status` - active/draft/archived
- `created_at`, `updated_at` - Timestamps

### Additional Tables
- **Favorites** - User favorite recipes
- **Comments** - Recipe comments
- **Ratings** - Recipe ratings (1-5 stars)

## 🛠️ Technologies Used

### Frontend
- React 18.3.1
- React Router DOM 6.27.0
- Axios 1.7.7
- React Toastify 10.0.6
- React Icons 5.3.0
- CSS3 with modern features

### Backend
- Node.js
- Express.js 4.21.1
- MySQL2 3.6.5
- bcryptjs 2.4.3
- jsonwebtoken 9.1.2
- Nodemailer 6.9.15
- dotenv 16.4.5
- CORS 2.8.5

### Development Tools
- nodemon 3.0.2
- concurrently 9.0.1

## 🎨 Features from Original Projects

### From recipe-share (PHP)
✅ User authentication with database
✅ Recipe categories (Indian, Italian, Korean)
✅ Email functionality (password reset)
✅ User sessions and logout
✅ Database integration
✅ Form validation

### From recipe-react
✅ Modern React architecture
✅ Component-based design
✅ React Router navigation
✅ Context API for state management
✅ Responsive UI design
✅ Parallax effects
✅ Interactive recipe cards
✅ Footer and contact sections

## 🔐 Security Features

- ✅ Password hashing with bcrypt
- ✅ JWT token authentication
- ✅ Input validation and sanitization
- ✅ SQL injection prevention (prepared statements)
- ✅ CORS configuration
- ✅ Environment variables for sensitive data
- ✅ Secure password requirements

## 📝 Password Requirements

Passwords must contain:
- At least 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (@$!%*?&)

## 🚧 Future Enhancements

- [ ] Google OAuth integration
- [ ] Image upload functionality
- [ ] Recipe favorites system
- [ ] Comments and ratings
- [ ] Advanced search filters
- [ ] Recipe recommendations
- [ ] Social sharing features
- [ ] Nutritional information
- [ ] Meal planning calendar
- [ ] Shopping list generator

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Check MySQL is running
mysql -u root -p

# Verify database exists
SHOW DATABASES;
USE recipe_platform;
SHOW TABLES;
```

### Port Already in Use
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Module Not Found Errors
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Client dependencies
cd client
rm -rf node_modules package-lock.json
npm install
```

## 📄 License

© 2025 Marri Venkata Siva Naga Yaswanth. All rights reserved.

## 👤 Author

**Marri Venkata Siva Naga Yaswanth**

## 🤝 Contributing

This is a demonstration project. Feel free to fork and customize for your needs.

## 📞 Support

For issues or questions, please create an issue in the repository.

---

**Note**: This is a combined educational project demonstrating full-stack development with React and Express.js. For production use, additional security measures and optimizations are recommended.
