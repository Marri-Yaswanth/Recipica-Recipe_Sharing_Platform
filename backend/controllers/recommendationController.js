import { getRecipeRecommendations } from '../services/recommendationService.js';

export async function recommendRecipesController(req, res) {
    try {
        const { mainIngredient, availableIngredients } = req.body || {};

        if (!mainIngredient || typeof mainIngredient !== 'string') {
            return res.status(400).json({
                error: 'mainIngredient is required and must be a string'
            });
        }

        const ingredientList = Array.isArray(availableIngredients) ? availableIngredients : [];

        const recommendationResult = await getRecipeRecommendations({
            mainIngredient,
            availableIngredients: ingredientList
        });

        return res.json({
            input: {
                mainIngredient,
                availableIngredients: ingredientList
            },
            source: recommendationResult.source,
            fallbackReason: recommendationResult.fallbackReason,
            totalSuggestions: recommendationResult.recipes.length,
            recipes: recommendationResult.recipes
        });
    } catch (error) {
        console.error('Error generating recipe recommendations:', error);
        return res.status(500).json({
            error: 'Failed to generate recipe recommendations'
        });
    }
}
