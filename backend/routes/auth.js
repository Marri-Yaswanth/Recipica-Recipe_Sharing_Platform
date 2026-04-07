import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/database.js';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import passportConfig from '../config/passport.js';

dotenv.config();

const router = express.Router();
const passport = passportConfig;

// Initialize email transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Validation function
function validateInput(name, email, password) {
    if (!name || !email || !password) {
        return 'All fields are required';
    }
    if (!name.match(/^[a-zA-Z\s'-]*$/)) {
        return 'Only letters and whitespace allowed in name';
    }
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        return 'Invalid email format';
    }
    if (!password.match(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)) {
        return 'Password must be at least 8 characters, contain uppercase, lowercase, number, and special character';
    }
    return '';
}

// Sign up
router.post('/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validate input
        const validationError = validateInput(name, email, password);
        if (validationError) {
            return res.status(400).json({ error: validationError });
        }

        // Check if user exists
        const existingUser = await query('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const result = await query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', 
            [name, email, hashedPassword]);
        
        const userId = result.insertId;

        // Generate JWT token
        const token = jwt.sign({ userId, email }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '24h' });

        res.status(201).json({ 
            message: 'User registered successfully',
            token,
            user: { name, email }
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Server error during signup' });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' });
        }

        // Find user
        const users = await query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const user = users[0];

        // Compare password
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Create JWT token
        const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '24h' });

        res.json({ 
            message: 'Login successful',
            token,
            user: { id: user.id, name: user.name, email: user.email }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error during login' });
    }
});

// Forgot password
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        // Check if user exists
        const users = await query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(404).json({ error: 'Email not found' });
        }

        // Generate reset token
        const resetToken = jwt.sign({ email }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '1h' });

        // Send email
        const clientUrl = req.headers.origin || process.env.CLIENT_URL || 'http://localhost:3000';
        const resetLink = `${clientUrl}/?mode=reset-password&token=${resetToken}`;

        let emailSent = false;
        let deliveryWarning = '';

        if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
            try {
                await transporter.sendMail({
                    to: email,
                    subject: 'Password Reset Request',
                    html: `
                        <p>You requested a password reset</p>
                        <p>Click the link below to reset your password (valid for 1 hour):</p>
                        <a href="${resetLink}">${resetLink}</a>
                    `
                });
                emailSent = true;
            } catch (mailError) {
                console.error('Password reset email delivery failed:', mailError);
                deliveryWarning = 'Email delivery failed, but a reset link was generated.';
            }
        } else {
            deliveryWarning = 'Email credentials are not configured, so only the reset link was generated.';
        }

        res.json({
            message: emailSent ? 'Password reset link sent to email' : 'Password reset link generated',
            resetLink,
            warning: deliveryWarning || undefined
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ error: 'Server error during password reset request' });
    }
});

// Reset password
router.post('/reset-password', async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({ error: 'Token and new password required' });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        
        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password
        await query('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, decoded.email]);

        res.json({ message: 'Password reset successful' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(401).json({ error: 'Invalid or expired token' });
    }
});

// Google OAuth Routes
router.get('/google', passport.authenticate('google', { 
    scope: ['profile', 'email'],
    session: false 
}));

router.get('/google/callback', 
    passport.authenticate('google', { session: false, failureRedirect: '/login' }),
    async (req, res) => {
        try {
            const token = jwt.sign(
                { userId: req.user.id, email: req.user.email }, 
                process.env.JWT_SECRET || 'your-secret-key', 
                { expiresIn: '24h' }
            );
            
            // Redirect to frontend with token
            res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/auth/callback?token=${token}&name=${encodeURIComponent(req.user.name)}&email=${encodeURIComponent(req.user.email)}`);
        } catch (error) {
            console.error('Google auth error:', error);
            res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/login?error=auth_failed`);
        }
    }
);

// Facebook OAuth Routes
router.get('/facebook', passport.authenticate('facebook', { 
    scope: ['email'],
    session: false 
}));

router.get('/facebook/callback',
    passport.authenticate('facebook', { session: false, failureRedirect: '/login' }),
    async (req, res) => {
        try {
            const token = jwt.sign(
                { userId: req.user.id, email: req.user.email }, 
                process.env.JWT_SECRET || 'your-secret-key', 
                { expiresIn: '24h' }
            );
            
            // Redirect to frontend with token
            res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/auth/callback?token=${token}&name=${encodeURIComponent(req.user.name)}&email=${encodeURIComponent(req.user.email)}`);
        } catch (error) {
            console.error('Facebook auth error:', error);
            res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/login?error=auth_failed`);
        }
    }
);

// Instagram OAuth (Note: Instagram Basic Display API has limited scope)
router.post('/instagram', async (req, res) => {
    try {
        const { accessToken } = req.body;
        
        if (!accessToken) {
            return res.status(400).json({ error: 'Access token required' });
        }
        
        // Verify Instagram token and get user info
        // This would require Instagram API integration
        res.json({ message: 'Instagram auth endpoint - requires Instagram API setup' });
    } catch (error) {
        console.error('Instagram auth error:', error);
        res.status(500).json({ error: 'Instagram authentication failed' });
    }
});

export default router;
