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

// Like a recipe
router.post('/:recipeId', verifyToken, async (req, res) => {
    try {
        const { recipeId } = req.params;
        
        // Check if recipe exists
        const recipes = await query('SELECT id FROM recipes WHERE id = ?', [recipeId]);
        if (recipes.length === 0) {
            return res.status(404).json({ error: 'Recipe not found' });
        }

        // Check if already liked
        const existingLike = await query(
            'SELECT id FROM likes WHERE user_id = ? AND recipe_id = ?',
            [req.userId, recipeId]
        );

        if (existingLike.length > 0) {
            return res.status(400).json({ error: 'Recipe already liked' });
        }

        // Add like
        await query(
            'INSERT INTO likes (user_id, recipe_id) VALUES (?, ?)',
            [req.userId, recipeId]
        );

        // Get updated like count
        const likeCount = await query(
            'SELECT COUNT(*) as count FROM likes WHERE recipe_id = ?',
            [recipeId]
        );

        res.json({ 
            message: 'Recipe liked successfully',
            likeCount: likeCount[0].count
        });
    } catch (error) {
        console.error('Error liking recipe:', error);
        res.status(500).json({ error: 'Error liking recipe' });
    }
});

// Unlike a recipe
router.delete('/:recipeId', verifyToken, async (req, res) => {
    try {
        const { recipeId } = req.params;

        const result = await query(
            'DELETE FROM likes WHERE user_id = ? AND recipe_id = ?',
            [req.userId, recipeId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Like not found' });
        }

        // Get updated like count
        const likeCount = await query(
            'SELECT COUNT(*) as count FROM likes WHERE recipe_id = ?',
            [recipeId]
        );

        res.json({ 
            message: 'Recipe unliked successfully',
            likeCount: likeCount[0].count
        });
    } catch (error) {
        console.error('Error unliking recipe:', error);
        res.status(500).json({ error: 'Error unliking recipe' });
    }
});

// Get likes for a recipe
router.get('/recipe/:recipeId', async (req, res) => {
    try {
        const { recipeId } = req.params;

        const likes = await query(
            `SELECT l.id, l.created_at, u.id as user_id, u.name, u.email 
             FROM likes l 
             JOIN users u ON l.user_id = u.id 
             WHERE l.recipe_id = ? 
             ORDER BY l.created_at DESC`,
            [recipeId]
        );

        const likeCount = await query(
            'SELECT COUNT(*) as count FROM likes WHERE recipe_id = ?',
            [recipeId]
        );

        res.json({
            likes,
            count: likeCount[0].count
        });
    } catch (error) {
        console.error('Error fetching likes:', error);
        res.status(500).json({ error: 'Error fetching likes' });
    }
});

// Check if user liked a recipe
router.get('/check/:recipeId', verifyToken, async (req, res) => {
    try {
        const { recipeId } = req.params;

        const like = await query(
            'SELECT id FROM likes WHERE user_id = ? AND recipe_id = ?',
            [req.userId, recipeId]
        );

        res.json({ liked: like.length > 0 });
    } catch (error) {
        console.error('Error checking like:', error);
        res.status(500).json({ error: 'Error checking like' });
    }
});

export default router;
