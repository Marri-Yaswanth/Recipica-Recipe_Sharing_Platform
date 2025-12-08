# OAuth Setup Guide

This guide will help you set up Google, Facebook, and Instagram OAuth authentication for the Recipe Platform.

## Prerequisites

- Google Cloud Console account
- Facebook Developer account
- Instagram Basic Display API setup (optional)
- Backend server running on `http://localhost:5001`
- Frontend running on `http://localhost:3000`

---

## 1. Google OAuth Setup

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **"Create Project"**
3. Name your project (e.g., "Recipe Platform")
4. Click **"Create"**

### Step 2: Enable Google+ API

1. In the left sidebar, click **"APIs & Services"** → **"Library"**
2. Search for **"Google+ API"**
3. Click on it and press **"Enable"**

### Step 3: Create OAuth Credentials

1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"Create Credentials"** → **"OAuth 2.0 Client ID"**
3. Configure the consent screen if prompted:
   - User Type: **External**
   - App name: **Recipe Platform**
   - User support email: Your email
   - Developer contact: Your email
4. Application type: **Web application**
5. Name: **Recipe Platform OAuth**
6. Authorized JavaScript origins:
   ```
   http://localhost:3000
   http://localhost:5001
   ```
7. Authorized redirect URIs:
   ```
   http://localhost:5001/api/auth/google/callback
   ```
8. Click **"Create"**
9. Copy the **Client ID** and **Client Secret**

### Step 4: Update Environment Variables

Add to `.env` file in project root:

```env
GOOGLE_CLIENT_ID=your-actual-google-client-id
GOOGLE_CLIENT_SECRET=your-actual-google-client-secret
```

---

## 2. Facebook OAuth Setup

### Step 1: Create Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click **"My Apps"** → **"Create App"**
3. Choose **"Consumer"** use case
4. App Display Name: **Recipe Platform**
5. App Contact Email: Your email
6. Click **"Create App"**

### Step 2: Add Facebook Login Product

1. In your app dashboard, click **"Add Product"**
2. Find **"Facebook Login"** and click **"Set Up"**
3. Choose **"Web"** platform
4. Site URL: `http://localhost:3000`
5. Click **"Save"** and **"Continue"**

### Step 3: Configure OAuth Settings

1. In the left sidebar, go to **"Facebook Login"** → **"Settings"**
2. Valid OAuth Redirect URIs:
   ```
   http://localhost:5001/api/auth/facebook/callback
   ```
3. Click **"Save Changes"**

### Step 4: Get App Credentials

1. Go to **"Settings"** → **"Basic"**
2. Copy **"App ID"** and **"App Secret"** (click Show)

### Step 5: Update Environment Variables

Add to `.env` file:

```env
FACEBOOK_APP_ID=your-actual-facebook-app-id
FACEBOOK_APP_SECRET=your-actual-facebook-app-secret
```

---

## 3. Instagram OAuth Setup (Optional)

Instagram Basic Display API is more complex and requires Facebook Business verification for production use.

### Development Setup:

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Use the same app or create a new one
3. Add **"Instagram Basic Display"** product
4. Create an Instagram Test User
5. Configure redirect URI: `http://localhost:5001/api/auth/instagram/callback`

### Update Environment Variables:

```env
INSTAGRAM_CLIENT_ID=your-instagram-app-id
INSTAGRAM_CLIENT_SECRET=your-instagram-app-secret
```

**Note:** Instagram OAuth is currently a placeholder in the code and requires additional implementation.

---

## 4. Complete .env Configuration

Your final `.env` file should look like this:

```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=recipe_platform

# Server
PORT=5001
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Email (for password reset)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password

# URLs
CLIENT_URL=http://localhost:3000
SERVER_URL=http://localhost:5001

# Google OAuth
GOOGLE_CLIENT_ID=your-actual-google-client-id
GOOGLE_CLIENT_SECRET=your-actual-google-client-secret

# Facebook OAuth
FACEBOOK_APP_ID=your-actual-facebook-app-id
FACEBOOK_APP_SECRET=your-actual-facebook-app-secret

# Instagram OAuth (Optional)
INSTAGRAM_CLIENT_ID=your-instagram-client-id
INSTAGRAM_CLIENT_SECRET=your-instagram-client-secret
```

---

## 5. Testing OAuth Flow

### Start the Application:

```bash
# In project root
npm run concurrently
```

### Test Google Login:

1. Navigate to `http://localhost:3000/login`
2. Click **"Sign in with Google"**
3. You'll be redirected to Google's login page
4. After successful login, you'll be redirected back to the app
5. Check that you're logged in and redirected to `/home`

### Test Facebook Login:

1. Click **"Sign in with Facebook"**
2. Authorize the app
3. You'll be redirected back after successful login

### Verify Database:

Check the `users` table to see new OAuth users:

```sql
SELECT id, name, email, oauth_provider, oauth_id FROM users;
```

---

## 6. Troubleshooting

### Issue: "Redirect URI Mismatch"

**Solution:** 
- Ensure redirect URIs in Google/Facebook console exactly match your backend routes
- Check for trailing slashes
- Verify port numbers

### Issue: "Client ID not found"

**Solution:**
- Double-check `.env` file exists and has correct values
- Restart the server after updating `.env`
- Verify no extra spaces in environment variables

### Issue: "User already exists with this email"

**Solution:**
- This happens if you previously signed up with the same email
- OAuth will link to the existing account
- Check `oauth_provider` and `oauth_id` columns in database

### Issue: "Cannot GET /auth/callback"

**Solution:**
- Ensure `AuthCallback.js` component exists
- Check `App.js` has the `/auth/callback` route
- Verify backend is redirecting with proper query params

---

## 7. Production Deployment

When deploying to production:

1. **Update OAuth redirect URIs** in Google/Facebook consoles to use your production domain
2. **Update environment variables**:
   ```env
   CLIENT_URL=https://your-domain.com
   SERVER_URL=https://api.your-domain.com
   ```
3. **Enable HTTPS** for all OAuth flows
4. **Review Facebook App Review** requirements for production use
5. **Test all OAuth flows** thoroughly in production environment

---

## 8. Security Best Practices

- Never commit `.env` file to version control
- Use strong `JWT_SECRET` in production
- Enable rate limiting on authentication endpoints
- Regularly rotate OAuth secrets
- Monitor authentication logs for suspicious activity
- Use HTTPS in production
- Implement CSRF protection for OAuth flows

---

## Need Help?

- Google OAuth: https://developers.google.com/identity/protocols/oauth2
- Facebook Login: https://developers.facebook.com/docs/facebook-login
- Instagram API: https://developers.facebook.com/docs/instagram-basic-display-api

---

## OAuth Flow Diagram

```
User clicks "Sign in with Google"
    ↓
Frontend redirects to: http://localhost:5001/api/auth/google
    ↓
Backend redirects to: Google OAuth consent page
    ↓
User approves access
    ↓
Google redirects to: http://localhost:5001/api/auth/google/callback
    ↓
Backend:
    - Receives user profile from Google
    - Checks if user exists in database
    - Creates new user if needed (with oauth_provider='google')
    - Generates JWT token
    - Redirects to: http://localhost:3000/auth/callback?token=...&name=...&email=...
    ↓
Frontend AuthCallback component:
    - Extracts token, name, email from URL
    - Stores token in localStorage
    - Updates UserContext
    - Redirects to /home
    ↓
User is now logged in!
```
