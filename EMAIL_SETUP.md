# Email Configuration Guide

The recipe email feature requires proper email configuration. Follow these steps:

## Setup Gmail for Sending Emails

### Step 1: Enable 2-Step Verification
1. Go to your Google Account: https://myaccount.google.com/
2. Click on "Security" in the left menu
3. Under "How you sign in to Google", enable "2-Step Verification"
4. Follow the setup process

### Step 2: Generate App Password
1. After enabling 2-Step Verification, go back to Security
2. Under "How you sign in to Google", click "App passwords"
3. Select app: "Mail"
4. Select device: "Other (Custom name)" - enter "Recipe Platform"
5. Click "Generate"
6. Copy the 16-character password (it looks like: xxxx xxxx xxxx xxxx)

### Step 3: Update .env File
Open `/recipe-platform-combined/.env` and update:

```env
EMAIL_USER=recipica@gmail.com
EMAIL_PASSWORD=hpzb sbdo yzvx fivn
```

Replace with your actual Gmail address and the app password you generated.

### Step 4: Restart the Server
```bash
# Stop current server (Ctrl+C)
npm run concurrently
```

## Testing
1. Log in to the app
2. Click on any recipe in "Popular Recipes"
3. Check your email inbox for the recipe email

## Troubleshooting

**Error: "Invalid login"**
- Make sure you're using an App Password, not your regular Gmail password
- Verify 2-Step Verification is enabled

**No email received**
- Check spam folder
- Verify EMAIL_USER and EMAIL_PASSWORD are correct in .env
- Make sure server restarted after updating .env

**Alternative: Use a test email service**
For development, you can use services like:
- Mailtrap.io (fake SMTP for testing)
- Ethereal Email (ethereal.email)

## Security Note
Never commit your .env file with real credentials to version control!
