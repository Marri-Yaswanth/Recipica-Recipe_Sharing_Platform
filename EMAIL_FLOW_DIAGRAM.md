# Email Flow Diagram 📊

## Complete Flow: From Click to Email

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER JOURNEY                             │
└─────────────────────────────────────────────────────────────────┘

1. User Opens App
   │
   ├─→ http://localhost:3000
   │
   └─→ Sees Homepage

2. User Logs In
   │
   ├─→ Clicks "Login" button
   │
   ├─→ Enters credentials
   │
   └─→ JWT token stored in localStorage

3. User Scrolls to Popular Recipes
   │
   └─→ Sees 7 recipe images:
       • Cheese Cake
       • Chicken Biriyani
       • Chocolate Brownie
       • Pizza
       • Fried Eggs Avocado
       • Pancake
       • Ramen

4. User Clicks Recipe Image
   │
   └─→ Triggers handleImageClick()


┌─────────────────────────────────────────────────────────────────┐
│                      TECHNICAL FLOW                              │
└─────────────────────────────────────────────────────────────────┘

Frontend (Slider.js)
│
├─→ Check if user is logged in
│   │
│   ├─→ YES: Continue
│   │
│   └─→ NO: Show "Please log in" → Redirect to /login
│
├─→ Call recipeAPI.sendRecipeEmail()
│   │
│   └─→ Sends: { imageId: 'one', name: 'John' }
│
└─→ API Service (api.js)
    │
    └─→ POST /api/recipes/send-recipe-email
        │
        └─→ Includes JWT token in Authorization header


Backend (routes/recipes.js)
│
├─→ Verify JWT Token (verifyToken middleware)
│   │
│   ├─→ Extract userId and userEmail from token
│   │
│   └─→ If no email in token, fetch from database
│
├─→ Get Recipe Details
│   │
│   └─→ Map imageId to complete recipe data:
│       • Name
│       • Description
│       • Prep Time
│       • Cook Time
│       • Servings
│       • Ingredients (array)
│       • Instructions (array)
│
├─→ Format HTML Email
│   │
│   └─→ Create beautiful HTML with:
│       • Header with recipe name
│       • User greeting
│       • Recipe info box
│       • Ingredients list
│       • Instructions list
│       • Tips section
│       • Footer
│
├─→ Send Email via Nodemailer
│   │
│   ├─→ Connect to Gmail SMTP
│   │
│   ├─→ Authenticate with App Password
│   │
│   └─→ Send email to user's address
│
└─→ Return Response
    │
    ├─→ SUCCESS: { message: 'Recipe email sent successfully!' }
    │
    └─→ ERROR: { error: 'Error message' }


Frontend Response
│
├─→ SUCCESS
│   │
│   ├─→ Show green toast: "Recipe sent to your email successfully!"
│   │
│   └─→ User checks email
│
└─→ ERROR
    │
    └─→ Show red toast with error message


┌─────────────────────────────────────────────────────────────────┐
│                      EMAIL DELIVERY                              │
└─────────────────────────────────────────────────────────────────┘

Gmail SMTP Server
│
├─→ Receives email from app
│
├─→ Validates sender credentials
│
├─→ Delivers to recipient inbox
│
└─→ User receives email within 1-2 minutes


User's Email Inbox
│
└─→ Email appears with:
    • Subject: "Recipe: [Recipe Name] - Complete Recipe with Ingredients"
    • From: your-email@gmail.com
    • Beautiful HTML content
    • All ingredients listed
    • All instructions listed
    • Professional formatting


┌─────────────────────────────────────────────────────────────────┐
│                      DATA FLOW                                   │
└─────────────────────────────────────────────────────────────────┘

Click Event
    ↓
imageId (e.g., 'one', 'two', 'three')
    ↓
API Request
    ↓
JWT Token → userId + userEmail
    ↓
Recipe Data Lookup
    ↓
{
  name: "Cheese Cake",
  ingredients: ["2 cups graham cracker crumbs", ...],
  instructions: ["Preheat oven to 325°F", ...],
  prepTime: "30 minutes",
  cookTime: "1 hour",
  servings: "8"
}
    ↓
HTML Email Template
    ↓
Nodemailer
    ↓
Gmail SMTP
    ↓
User's Inbox
    ↓
✅ Success!


┌─────────────────────────────────────────────────────────────────┐
│                      ERROR HANDLING                              │
└─────────────────────────────────────────────────────────────────┘

Possible Errors:

1. User Not Logged In
   └─→ Show: "Please log in first!"
   └─→ Redirect to /login

2. Email Not Configured
   └─→ Show: "Email service not configured"
   └─→ Admin needs to update .env

3. Invalid Recipe ID
   └─→ Show: "Invalid recipe ID"
   └─→ Check imageId parameter

4. Email Authentication Failed
   └─→ Show: "Email authentication failed"
   └─→ Check EMAIL_USER and EMAIL_PASSWORD

5. Network Error
   └─→ Show: "Failed to send email"
   └─→ Check internet connection


┌─────────────────────────────────────────────────────────────────┐
│                      SECURITY FLOW                               │
└─────────────────────────────────────────────────────────────────┘

1. User Authentication
   └─→ JWT token required for all requests

2. Token Verification
   └─→ Middleware checks token validity

3. Email Privacy
   └─→ Only logged-in user's email is used
   └─→ No email address exposed to frontend

4. Secure SMTP
   └─→ App Password (not main password)
   └─→ Encrypted connection to Gmail

5. Environment Variables
   └─→ Credentials stored in .env
   └─→ .env excluded from git


┌─────────────────────────────────────────────────────────────────┐
│                      TIMING                                      │
└─────────────────────────────────────────────────────────────────┘

User clicks recipe
    ↓ (< 1 second)
API request sent
    ↓ (< 1 second)
Token verified
    ↓ (< 1 second)
Email formatted
    ↓ (1-2 seconds)
Email sent via SMTP
    ↓ (5-30 seconds)
Email delivered to inbox
    ↓
Total: ~10-35 seconds


┌─────────────────────────────────────────────────────────────────┐
│                      COMPONENTS INVOLVED                         │
└─────────────────────────────────────────────────────────────────┘

Frontend:
├─→ Slider.js (Popular Recipes component)
├─→ api.js (API service)
├─→ UserContext.js (User state management)
└─→ react-toastify (Notifications)

Backend:
├─→ routes/recipes.js (Email endpoint)
├─→ config/database.js (User data)
├─→ nodemailer (Email sending)
└─→ jsonwebtoken (Authentication)

External:
├─→ Gmail SMTP Server
└─→ User's Email Provider

Configuration:
├─→ .env (Credentials)
└─→ package.json (Dependencies)
```

---

## Summary

**Simple Version:**
1. User clicks recipe → 
2. App checks login → 
3. App sends email → 
4. User receives recipe

**Complete Version:**
1. User clicks recipe image
2. Frontend checks authentication
3. API call with JWT token
4. Backend verifies token
5. Backend fetches recipe data
6. Backend formats HTML email
7. Nodemailer sends via Gmail
8. User receives email
9. Success notification shown

---

**Total Time: ~10-35 seconds from click to inbox**
