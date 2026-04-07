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
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};

// Follow a user
router.post('/:userId', verifyToken, async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Can't follow yourself
        if (parseInt(userId) === req.userId) {
            return res.status(400).json({ error: 'Cannot follow yourself' });
        }

        // Check if user exists
        const users = await query('SELECT id FROM users WHERE id = ?', [userId]);
        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if already following
        const existingFollow = await query(
            'SELECT id FROM follows WHERE follower_id = ? AND following_id = ?',
            [req.userId, userId]
        );

        if (existingFollow.length > 0) {
            return res.status(400).json({ error: 'Already following this user' });
        }

        // Add follow
        await query(
            'INSERT INTO follows (follower_id, following_id) VALUES (?, ?)',
            [req.userId, userId]
        );

        // Get updated follower count
        const followerCount = await query(
            'SELECT COUNT(*) as count FROM follows WHERE following_id = ?',
            [userId]
        );

        res.json({ 
            message: 'User followed successfully',
            followerCount: followerCount[0].count
        });
    } catch (error) {
        console.error('Error following user:', error);
        res.status(500).json({ error: 'Error following user' });
    }
});

// Unfollow a user
router.delete('/:userId', verifyToken, async (req, res) => {
    try {
        const { userId } = req.params;

        const result = await query(
            'DELETE FROM follows WHERE follower_id = ? AND following_id = ?',
            [req.userId, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Follow relationship not found' });
        }

        // Get updated follower count
        const followerCount = await query(
            'SELECT COUNT(*) as count FROM follows WHERE following_id = ?',
            [userId]
        );

        res.json({ 
            message: 'User unfollowed successfully',
            followerCount: followerCount[0].count
        });
    } catch (error) {
        console.error('Error unfollowing user:', error);
        res.status(500).json({ error: 'Error unfollowing user' });
    }
});

// Get user's followers
router.get('/followers/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const followers = await query(
            `SELECT f.id, f.created_at, u.id as user_id, u.name, u.email 
             FROM follows f 
             JOIN users u ON f.follower_id = u.id 
             WHERE f.following_id = ? 
             ORDER BY f.created_at DESC`,
            [userId]
        );

        res.json({
            followers,
            count: followers.length
        });
    } catch (error) {
        console.error('Error fetching followers:', error);
        res.status(500).json({ error: 'Error fetching followers' });
    }
});

// Get users that a user is following
router.get('/following/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const following = await query(
            `SELECT f.id, f.created_at, u.id as user_id, u.name, u.email 
             FROM follows f 
             JOIN users u ON f.following_id = u.id 
             WHERE f.follower_id = ? 
             ORDER BY f.created_at DESC`,
            [userId]
        );

        res.json({
            following,
            count: following.length
        });
    } catch (error) {
        console.error('Error fetching following:', error);
        res.status(500).json({ error: 'Error fetching following' });
    }
});

// Check if current user is following another user
router.get('/check/:userId', verifyToken, async (req, res) => {
    try {
        const { userId } = req.params;

        const follow = await query(
            'SELECT id FROM follows WHERE follower_id = ? AND following_id = ?',
            [req.userId, userId]
        );

        res.json({ following: follow.length > 0 });
    } catch (error) {
        console.error('Error checking follow:', error);
        res.status(500).json({ error: 'Error checking follow' });
    }
});

// Get follow stats for a user
router.get('/stats/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const followers = await query(
            'SELECT COUNT(*) as count FROM follows WHERE following_id = ?',
            [userId]
        );

        const following = await query(
            'SELECT COUNT(*) as count FROM follows WHERE follower_id = ?',
            [userId]
        );

        res.json({
            followers: followers[0].count,
            following: following[0].count
        });
    } catch (error) {
        console.error('Error fetching follow stats:', error);
        res.status(500).json({ error: 'Error fetching follow stats' });
    }
});

export default router;
