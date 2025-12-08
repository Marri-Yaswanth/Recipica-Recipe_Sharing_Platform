# Recipe Email Setup Guide 📧

## Overview
When users click on any popular recipe category (Cheese Cake, Chicken Biriyani, Chocolate Brownie, Pizza, Fried Eggs Avocado, Pancake, or Ramen), the complete recipe with ingredients will be sent to their registered/login email account.

## ✅ What's Already Done

The email functionality is now fully implemented with:
- Complete recipe details including ingredients and step-by-step instructions
- Beautiful HTML email template with proper formatting
- Automatic detection of logged-in user's email
- Toast notifications for success/error messages
- Proper error handling and user feedback

## 🚀 Setup Instructions

### Step 1: Configure Gmail for Sending Emails

#### Enable 2-Step Verification
1. Go to your Google Account: https://myaccount.google.com/
2. Click on **"Security"** in the left menu
3. Under **"How you sign in to Google"**, enable **"2-Step Verification"**
4. Follow the setup process

#### Generate App Password
1. After enabling 2-Step Verification, go back to Security
2. Under **"How you sign in to Google"**, click **"App passwords"**
3. Select app: **"Mail"**
4. Select device: **"Other (Custom name)"** - enter **"Recipe Platform"**
5. Click **"Generate"**
6. Copy the 16-character password (format: `xxxx xxxx xxxx xxxx`)

### Step 2: Update .env File

Open the `.env` file in the root directory and update these lines:

```env
EMAIL_USER=your-actual-gmail@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
```

**Example:**
```env
EMAIL_USER=myrecipeapp@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop
```

### Step 3: Restart the Server

Stop the current server (press `Ctrl+C` in terminal) and restart:

```bash
npm run concurrently
```

Or if running separately:
```bash
npm run dev
```

## 📝 How It Works

1. **User logs in** to the platform
2. **User clicks** on any popular recipe image (Cheese Cake, Chicken Biriyani, etc.)
3. **System automatically**:
   - Detects the logged-in user's email
   - Retrieves complete recipe details with ingredients
   - Sends a beautifully formatted email
   - Shows success notification
4. **User receives** email with:
   - Recipe name and description
   - Prep time, cook time, and servings
   - Complete list of ingredients
   - Step-by-step cooking instructions
   - Professional HTML formatting

## 📧 Email Features

The email includes:
- ✅ Recipe name and description
- ✅ Preparation and cooking time
- ✅ Number of servings
- ✅ Complete ingredients list
- ✅ Detailed step-by-step instructions
- ✅ Beautiful HTML formatting with colors and icons
- ✅ Mobile-responsive design

## 🧪 Testing

1. Make sure your `.env` file has valid Gmail credentials
2. Start the server: `npm run concurrently`
3. Open the app: http://localhost:3000
4. Log in with your account
5. Scroll to "Popular Recipes" section
6. Click on any recipe image
7. Check your email inbox (and spam folder)

## 🔧 Troubleshooting

### Error: "Invalid login" or "Email authentication failed"
- Make sure you're using an **App Password**, not your regular Gmail password
- Verify **2-Step Verification** is enabled
- Check that there are no extra spaces in the password

### No email received
- Check your **spam/junk folder**
- Verify `EMAIL_USER` and `EMAIL_PASSWORD` are correct in `.env`
- Make sure the server was restarted after updating `.env`
- Check server console for error messages

### Error: "Please log in first"
- User must be logged in to receive recipe emails
- Click the "Login" button and sign in
- Try clicking the recipe again

### Error: "Email service not configured"
- The `.env` file still has placeholder values
- Update `EMAIL_USER` and `EMAIL_PASSWORD` with real credentials

## 🔐 Security Notes

- ✅ Never commit your `.env` file with real credentials to version control
- ✅ The `.env` file is already in `.gitignore`
- ✅ Use App Passwords instead of your main Gmail password
- ✅ Keep your credentials secure and private

## 🎯 Alternative Email Services (For Development)

If you don't want to use Gmail, you can use these test services:

### Mailtrap (Recommended for Testing)
1. Sign up at https://mailtrap.io
2. Get SMTP credentials
3. Update `.env`:
```env
EMAIL_USER=your-mailtrap-username
EMAIL_PASSWORD=your-mailtrap-password
```
4. Update `routes/recipes.js` transporter config:
```javascript
const transporter = nodemailer.createTransport({
    host: 'smtp.mailtrap.io',
    port: 2525,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});
```

### Ethereal Email (Free Testing)
1. Visit https://ethereal.email
2. Click "Create Ethereal Account"
3. Use the provided credentials in your `.env`

## 📋 Recipe Categories Available

The following recipes are available with complete ingredients:

1. **Cheese Cake** - Delicious creamy cheesecake
2. **Chicken Biriyani** - Aromatic and flavorful biriyani
3. **Chocolate Brownie** - Rich and fudgy brownies
4. **Pizza** - Classic homemade pizza
5. **Fried Eggs with Avocado** - Healthy breakfast option
6. **Pancake** - Fluffy and delicious pancakes
7. **Ramen** - Authentic Japanese ramen

Each recipe includes:
- Complete ingredients list
- Detailed cooking instructions
- Prep and cook times
- Serving sizes

## 🎉 Success!

Once configured, users will receive professional recipe emails instantly when they click on popular recipes. The email will be sent to their registered email address (the one they used to sign up or log in).

---

**Need Help?** Check the server console logs for detailed error messages.
