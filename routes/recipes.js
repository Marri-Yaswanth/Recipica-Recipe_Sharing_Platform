import express from 'express';
import { query } from '../config/database.js';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

const router = express.Router();

// Initialize email transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

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

// Get all recipes
router.get('/', async (req, res) => {
    try {
        const { category, search } = req.query;
        let sql = `SELECT r.*, u.name as author_name, u.email as author_email,
                   (SELECT COUNT(*) FROM likes WHERE recipe_id = r.id) as like_count
                   FROM recipes r
                   JOIN users u ON r.user_id = u.id
                   WHERE r.status = "active"`;
        const params = [];

        if (category && category !== 'all') {
            sql += ' AND r.category = ?';
            params.push(category);
        }

        if (search) {
            sql += ' AND (r.name LIKE ? OR r.description LIKE ?)';
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm);
        }

        sql += ' ORDER BY r.created_at DESC LIMIT 50';

        const recipes = await query(sql, params);
        res.json(recipes);
    } catch (error) {
        console.error('Error fetching recipes:', error);
        res.status(500).json({ error: 'Error fetching recipes' });
    }
});

// Get recipe by category
router.get('/category/:category', async (req, res) => {
    try {
        const { category } = req.params;
        const recipes = await query(
            'SELECT * FROM recipes WHERE category = ? AND status = "active" ORDER BY created_at DESC',
            [category]
        );
        res.json(recipes);
    } catch (error) {
        console.error('Error fetching recipes:', error);
        res.status(500).json({ error: 'Error fetching recipes' });
    }
});

// Get single recipe
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const recipes = await query('SELECT * FROM recipes WHERE id = ?', [id]);
        
        if (recipes.length === 0) {
            return res.status(404).json({ error: 'Recipe not found' });
        }

        res.json(recipes[0]);
    } catch (error) {
        console.error('Error fetching recipe:', error);
        res.status(500).json({ error: 'Error fetching recipe' });
    }
});

// Create recipe (requires authentication)
router.post('/', verifyToken, async (req, res) => {
    try {
        const { name, description, ingredients, instructions, category, dietType, imageUrl, prepTime, cookTime, servings } = req.body;

        if (!name || !description || !ingredients || !instructions || !category) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Get user info
        const users = await query('SELECT id FROM users WHERE id = ?', [req.userId]);
        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if diet_type column exists
        try {
            // Validate diet type
            const validDietTypes = ['vegetarian', 'eggetarian', 'non-vegetarian'];
            const finalDietType = validDietTypes.includes(dietType) ? dietType : 'vegetarian';

            const result = await query(
                `INSERT INTO recipes (user_id, name, description, ingredients, instructions, category, diet_type, image_url, prep_time, cook_time, servings, status, created_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', NOW())`,
                [req.userId, name, description, JSON.stringify(ingredients), instructions, category, finalDietType, imageUrl || null, prepTime || 0, cookTime || 0, servings || 4]
            );

            res.status(201).json({ 
                message: 'Recipe created successfully',
                recipeId: result.insertId
            });
        } catch (error) {
            // If diet_type column doesn't exist, insert without it
            if (error.code === 'ER_BAD_FIELD_ERROR') {
                console.log('diet_type column not found, inserting without it');
                const result = await query(
                    `INSERT INTO recipes (user_id, name, description, ingredients, instructions, category, image_url, prep_time, cook_time, servings, status, created_at)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', NOW())`,
                    [req.userId, name, description, JSON.stringify(ingredients), instructions, category, imageUrl || null, prepTime || 0, cookTime || 0, servings || 4]
                );

                res.status(201).json({ 
                    message: 'Recipe created successfully (diet type will be available after database update)',
                    recipeId: result.insertId
                });
            } else {
                throw error;
            }
        }
    } catch (error) {
        console.error('Error creating recipe:', error);
        res.status(500).json({ error: 'Error creating recipe' });
    }
});

// Update recipe (only by owner)
router.put('/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, ingredients, instructions, category, imageUrl, prepTime, cookTime, servings } = req.body;

        // Check if recipe exists and belongs to user
        const recipes = await query('SELECT * FROM recipes WHERE id = ? AND user_id = ?', [id, req.userId]);
        if (recipes.length === 0) {
            return res.status(404).json({ error: 'Recipe not found or unauthorized' });
        }

        await query(
            `UPDATE recipes SET name = ?, description = ?, ingredients = ?, instructions = ?, category = ?, image_url = ?, prep_time = ?, cook_time = ?, servings = ? WHERE id = ?`,
            [name, description, JSON.stringify(ingredients), instructions, category, imageUrl || null, prepTime || 0, cookTime || 0, servings || 4, id]
        );

        res.json({ message: 'Recipe updated successfully' });
    } catch (error) {
        console.error('Error updating recipe:', error);
        res.status(500).json({ error: 'Error updating recipe' });
    }
});

// Delete recipe (only by owner)
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;

        // Check if recipe exists and belongs to user
        const recipes = await query('SELECT * FROM recipes WHERE id = ? AND user_id = ?', [id, req.userId]);
        if (recipes.length === 0) {
            return res.status(404).json({ error: 'Recipe not found or unauthorized' });
        }

        await query('DELETE FROM recipes WHERE id = ?', [id]);
        res.json({ message: 'Recipe deleted successfully' });
    } catch (error) {
        console.error('Error deleting recipe:', error);
        res.status(500).json({ error: 'Error deleting recipe' });
    }
});

// Send recipe email
router.post('/send-recipe-email', verifyToken, async (req, res) => {
    try {
        const { imageId, recipeName } = req.body;
        let userEmail = req.userEmail;
        let userName = req.body.name;
        
        // If email not in token, fetch from database
        if (!userEmail && req.userId) {
            const users = await query('SELECT email, name FROM users WHERE id = ?', [req.userId]);
            if (users.length > 0) {
                userEmail = users[0].email;
                userName = userName || users[0].name;
            }
        }
        
        if (!userEmail) {
            return res.status(400).json({ error: 'User email not found' });
        }

        // Recipe details mapping with complete ingredients and instructions
        const recipeDetails = {
            'one': { 
                name: 'Cheese Cake', 
                description: 'Delicious creamy cheesecake recipe',
                prepTime: '30 minutes',
                cookTime: '1 hour',
                servings: '8',
                ingredients: [
                    '2 cups graham cracker crumbs',
                    '1/2 cup melted butter',
                    '4 packages (8 oz each) cream cheese, softened',
                    '1 cup granulated sugar',
                    '1 tsp vanilla extract',
                    '4 large eggs',
                    '1 cup sour cream',
                    '1/4 cup all-purpose flour'
                ],
                instructions: [
                    'Preheat oven to 325°F (165°C)',
                    'Mix graham cracker crumbs with melted butter and press into bottom of 9-inch springform pan',
                    'Beat cream cheese until fluffy, add sugar and vanilla',
                    'Add eggs one at a time, beating well after each addition',
                    'Mix in sour cream and flour until smooth',
                    'Pour mixture over crust',
                    'Bake for 55-60 minutes until center is almost set',
                    'Cool completely, then refrigerate for at least 4 hours'
                ]
            },
            'two': { 
                name: 'Chicken Biriyani', 
                description: 'Aromatic and flavorful chicken biriyani',
                prepTime: '45 minutes',
                cookTime: '1 hour',
                servings: '6',
                ingredients: [
                    '2 lbs chicken, cut into pieces',
                    '3 cups basmati rice',
                    '2 large onions, sliced',
                    '1 cup yogurt',
                    '4 tomatoes, chopped',
                    '2 tbsp ginger-garlic paste',
                    '1 tsp turmeric powder',
                    '2 tsp red chili powder',
                    '1 tsp garam masala',
                    'Fresh mint and cilantro leaves',
                    '4 tbsp ghee or oil',
                    'Whole spices (bay leaves, cinnamon, cardamom, cloves)',
                    'Salt to taste',
                    'Saffron soaked in warm milk'
                ],
                instructions: [
                    'Marinate chicken with yogurt, ginger-garlic paste, turmeric, chili powder, and salt for 30 minutes',
                    'Soak rice in water for 30 minutes, then parboil with whole spices until 70% cooked',
                    'Heat ghee in a heavy-bottomed pot, fry onions until golden brown',
                    'Add marinated chicken and cook until 80% done',
                    'Layer the rice over chicken, sprinkle fried onions, mint, cilantro, and saffron milk',
                    'Cover tightly and cook on low heat for 25-30 minutes (dum cooking)',
                    'Let it rest for 5 minutes before serving',
                    'Garnish with boiled eggs and serve with raita'
                ]
            },
            'three': { 
                name: 'Chocolate Brownie', 
                description: 'Rich and fudgy chocolate brownies',
                prepTime: '15 minutes',
                cookTime: '30 minutes',
                servings: '12',
                ingredients: [
                    '1 cup unsalted butter',
                    '2 cups granulated sugar',
                    '4 large eggs',
                    '3/4 cup cocoa powder',
                    '1 cup all-purpose flour',
                    '1/2 tsp salt',
                    '1/2 tsp baking powder',
                    '2 tsp vanilla extract',
                    '1 cup chocolate chips (optional)'
                ],
                instructions: [
                    'Preheat oven to 350°F (175°C) and grease a 9x13 inch baking pan',
                    'Melt butter and mix with sugar until well combined',
                    'Beat in eggs one at a time, then add vanilla',
                    'Sift together cocoa powder, flour, salt, and baking powder',
                    'Fold dry ingredients into wet mixture until just combined',
                    'Stir in chocolate chips if using',
                    'Pour batter into prepared pan and spread evenly',
                    'Bake for 25-30 minutes until a toothpick comes out with moist crumbs',
                    'Cool completely before cutting into squares'
                ]
            },
            'four': { 
                name: 'Pizza', 
                description: 'Classic homemade pizza recipe',
                prepTime: '2 hours (including rising time)',
                cookTime: '15 minutes',
                servings: '4',
                ingredients: [
                    '3 cups all-purpose flour',
                    '1 packet active dry yeast',
                    '1 cup warm water',
                    '2 tbsp olive oil',
                    '1 tsp sugar',
                    '1 tsp salt',
                    '1 cup pizza sauce',
                    '2 cups mozzarella cheese, shredded',
                    'Toppings of choice (pepperoni, mushrooms, bell peppers, onions, olives)',
                    'Italian herbs and oregano'
                ],
                instructions: [
                    'Dissolve yeast and sugar in warm water, let sit for 5 minutes until foamy',
                    'Mix flour and salt, add yeast mixture and olive oil',
                    'Knead dough for 8-10 minutes until smooth and elastic',
                    'Place in oiled bowl, cover and let rise for 1-2 hours until doubled',
                    'Preheat oven to 475°F (245°C) with pizza stone if available',
                    'Punch down dough and roll out to desired thickness',
                    'Spread pizza sauce, add cheese and toppings',
                    'Bake for 12-15 minutes until crust is golden and cheese is bubbly',
                    'Sprinkle with herbs and let cool for 2 minutes before slicing'
                ]
            },
            'five': { 
                name: 'Fried Eggs with Avocado', 
                description: 'Healthy breakfast with fried eggs and avocado',
                prepTime: '5 minutes',
                cookTime: '5 minutes',
                servings: '2',
                ingredients: [
                    '4 large eggs',
                    '2 ripe avocados',
                    '4 slices whole grain bread',
                    '2 tbsp butter or olive oil',
                    '1 lime, juiced',
                    'Salt and pepper to taste',
                    'Red pepper flakes (optional)',
                    'Fresh cilantro or parsley for garnish',
                    'Cherry tomatoes (optional)'
                ],
                instructions: [
                    'Toast the bread slices until golden brown',
                    'Cut avocados in half, remove pit, and scoop flesh into a bowl',
                    'Mash avocado with lime juice, salt, and pepper',
                    'Heat butter or oil in a non-stick pan over medium heat',
                    'Crack eggs into pan and fry to desired doneness (sunny side up or over easy)',
                    'Spread mashed avocado on toasted bread',
                    'Top with fried eggs',
                    'Season with salt, pepper, and red pepper flakes',
                    'Garnish with fresh herbs and serve with cherry tomatoes'
                ]
            },
            'six': { 
                name: 'Pancake', 
                description: 'Fluffy and delicious pancakes',
                prepTime: '10 minutes',
                cookTime: '15 minutes',
                servings: '4',
                ingredients: [
                    '2 cups all-purpose flour',
                    '2 tbsp granulated sugar',
                    '2 tsp baking powder',
                    '1 tsp baking soda',
                    '1/2 tsp salt',
                    '2 cups buttermilk',
                    '2 large eggs',
                    '1/4 cup melted butter',
                    '1 tsp vanilla extract',
                    'Butter for cooking',
                    'Maple syrup and fresh berries for serving'
                ],
                instructions: [
                    'In a large bowl, whisk together flour, sugar, baking powder, baking soda, and salt',
                    'In another bowl, whisk buttermilk, eggs, melted butter, and vanilla',
                    'Pour wet ingredients into dry ingredients and mix until just combined (lumps are okay)',
                    'Let batter rest for 5 minutes',
                    'Heat a griddle or non-stick pan over medium heat and add a little butter',
                    'Pour 1/4 cup batter for each pancake',
                    'Cook until bubbles form on surface and edges look set (2-3 minutes)',
                    'Flip and cook for another 1-2 minutes until golden brown',
                    'Serve warm with maple syrup, butter, and fresh berries'
                ]
            },
            'seven': { 
                name: 'Ramen', 
                description: 'Authentic Japanese ramen recipe',
                prepTime: '30 minutes',
                cookTime: '2 hours',
                servings: '4',
                ingredients: [
                    '4 packs ramen noodles',
                    '2 lbs pork belly or chicken',
                    '8 cups chicken or pork broth',
                    '4 soft-boiled eggs',
                    '2 tbsp soy sauce',
                    '2 tbsp miso paste',
                    '1 tbsp sesame oil',
                    '4 cloves garlic, minced',
                    '1 inch ginger, sliced',
                    '2 green onions, sliced',
                    '1 cup bamboo shoots',
                    'Nori (seaweed) sheets',
                    '1 cup corn kernels',
                    'Bean sprouts',
                    'Chili oil (optional)'
                ],
                instructions: [
                    'Prepare broth: Simmer pork/chicken bones with garlic, ginger in water for 2 hours',
                    'Strain broth and add soy sauce, miso paste, and sesame oil',
                    'Cook pork belly until tender, slice thinly',
                    'Prepare soft-boiled eggs: boil for 6-7 minutes, then ice bath',
                    'Cook ramen noodles according to package instructions',
                    'Divide noodles among bowls',
                    'Pour hot broth over noodles',
                    'Top with sliced pork, halved eggs, green onions, bamboo shoots, corn, and nori',
                    'Add bean sprouts and drizzle with chili oil if desired',
                    'Serve immediately while hot'
                ]
            }
        };

        const recipe = recipeDetails[imageId];
        
        if (!recipe) {
            return res.status(400).json({ error: 'Invalid recipe ID' });
        }

        // Create formatted ingredients list
        const ingredientsList = recipe.ingredients.map(ing => `<li>${ing}</li>`).join('');
        const instructionsList = recipe.instructions.map((inst, idx) => `<li><strong>Step ${idx + 1}:</strong> ${inst}</li>`).join('');

        // Send email with complete recipe details
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: userEmail,
            subject: `Recipe: ${recipe.name} - Complete Recipe with Ingredients`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
                    <div style="background-color: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
                        <h1 style="margin: 0;">🍳 ${recipe.name}</h1>
                    </div>
                    
                    <div style="background-color: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                        <h2 style="color: #333;">Hello ${userName}! 👋</h2>
                        <p style="color: #666; font-size: 16px; line-height: 1.6;">
                            Thank you for your interest in our <strong>${recipe.name}</strong> recipe. 
                            Here's the complete recipe with all ingredients and instructions!
                        </p>
                        
                        <div style="background-color: #f0f0f0; padding: 15px; border-radius: 5px; margin: 20px 0;">
                            <p style="margin: 5px 0;"><strong>📝 Description:</strong> ${recipe.description}</p>
                            <p style="margin: 5px 0;"><strong>⏱️ Prep Time:</strong> ${recipe.prepTime}</p>
                            <p style="margin: 5px 0;"><strong>🔥 Cook Time:</strong> ${recipe.cookTime}</p>
                            <p style="margin: 5px 0;"><strong>🍽️ Servings:</strong> ${recipe.servings}</p>
                        </div>

                        <h3 style="color: #4CAF50; border-bottom: 2px solid #4CAF50; padding-bottom: 10px;">
                            🛒 Ingredients
                        </h3>
                        <ul style="color: #555; line-height: 1.8; padding-left: 20px;">
                            ${ingredientsList}
                        </ul>

                        <h3 style="color: #4CAF50; border-bottom: 2px solid #4CAF50; padding-bottom: 10px; margin-top: 30px;">
                            👨‍🍳 Instructions
                        </h3>
                        <ol style="color: #555; line-height: 1.8; padding-left: 20px;">
                            ${instructionsList}
                        </ol>

                        <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin-top: 30px; border-radius: 5px;">
                            <p style="margin: 0; color: #856404;">
                                <strong>💡 Tip:</strong> Save this email for future reference, or print it out to keep in your recipe collection!
                            </p>
                        </div>

                        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
                            <p style="color: #888; font-size: 14px;">
                                Happy Cooking! 🎉<br>
                                <strong>Recipe Platform Team</strong>
                            </p>
                        </div>
                    </div>
                </div>
            `
        };

        console.log(`Attempting to send email to: ${userEmail}`);
        
        // Check if email is configured
        if (!process.env.EMAIL_USER || process.env.EMAIL_USER === 'your-email@gmail.com') {
            console.error('Email not configured in .env file');
            return res.status(500).json({ 
                error: 'Email service not configured. Please update EMAIL_USER and EMAIL_PASSWORD in .env file.' 
            });
        }

        await transporter.sendMail(mailOptions);
        
        console.log(`Email sent successfully to: ${userEmail}`);
        res.json({ message: 'Recipe email sent successfully!' });
    } catch (error) {
        console.error('Error sending recipe email:', error);
        
        // More detailed error message
        let errorMsg = 'Failed to send email. Please try again.';
        if (error.code === 'EAUTH') {
            errorMsg = 'Email authentication failed. Please check EMAIL_USER and EMAIL_PASSWORD in .env file.';
        } else if (error.code === 'ECONNECTION') {
            errorMsg = 'Could not connect to email server. Check your internet connection.';
        }
        
        res.status(500).json({ error: errorMsg });
    }
});

export default router;
