import express from 'express';
import { query } from '../config/database.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        req.userId = decoded.userId;
        req.userEmail = decoded.email;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};

// Get user profile
router.get('/profile', verifyToken, async (req, res) => {
    try {
        const users = await query('SELECT id, name, email, created_at FROM users WHERE id = ?', [req.userId]);
        
        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(users[0]);
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ error: 'Error fetching profile' });
    }
});

// Get user's recipes
router.get('/recipes', verifyToken, async (req, res) => {
    try {
        const recipes = await query(
            'SELECT * FROM recipes WHERE user_id = ? ORDER BY created_at DESC',
            [req.userId]
        );
        res.json(recipes);
    } catch (error) {
        console.error('Error fetching user recipes:', error);
        res.status(500).json({ error: 'Error fetching user recipes' });
    }
});

// Update user profile
router.put('/profile', verifyToken, async (req, res) => {
    try {
        const { name, email } = req.body;

        if (!name || !email) {
            return res.status(400).json({ error: 'Name and email are required' });
        }

        // Check if email is already taken by another user
        const existingUsers = await query('SELECT * FROM users WHERE email = ? AND id != ?', [email, req.userId]);
        if (existingUsers.length > 0) {
            return res.status(400).json({ error: 'Email already taken' });
        }

        await query('UPDATE users SET name = ?, email = ? WHERE id = ?', [name, email, req.userId]);
        res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ error: 'Error updating profile' });
    }
});

export default router;
