import recommendationRecipes from '../data/recommendationRecipes.js';
import axios from 'axios';

const CHEAP_SUBSTITUTIONS = {
    butter: 'oil',
    paneer: 'tofu',
    cream: 'milk',
    ghee: 'oil',
    chicken: 'egg',
    basmati: 'regular rice',
    mushroom: 'potato'
};

function normalizeIngredient(value) {
    return String(value || '')
        .trim()
        .toLowerCase()
        .replace(/\s+/g, ' ');
}

function normalizeIngredientList(list = []) {
    const base = Array.isArray(list) ? list : [];
    const normalized = base
        .map((item) => normalizeIngredient(item))
        .filter(Boolean);

    return [...new Set(normalized)];
}

function toRecommendationShape({
    name,
    usedIngredients,
    missingIngredients,
    cost,
    cheapAlternatives,
    matchPercentage
}) {
    return {
        name,
        usedIngredients: Array.isArray(usedIngredients) ? usedIngredients : [],
        missingIngredients: Array.isArray(missingIngredients) ? missingIngredients : [],
        cost: ['Low', 'Medium', 'High'].includes(cost) ? cost : 'Medium',
        cheapAlternatives: Array.isArray(cheapAlternatives) ? cheapAlternatives : [],
        matchPercentage: Number.isFinite(matchPercentage) ? matchPercentage : undefined
    };
}

function extractJsonPayload(rawContent = '') {
    const trimmed = String(rawContent || '').trim();
    if (!trimmed) {
        throw new Error('AI response was empty');
    }

    try {
        return JSON.parse(trimmed);
    } catch {
        const start = trimmed.indexOf('{');
        const end = trimmed.lastIndexOf('}');
        if (start >= 0 && end > start) {
            const candidate = trimmed.slice(start, end + 1);
            return JSON.parse(candidate);
        }
        throw new Error('AI response did not contain valid JSON');
    }
}

function toCostRank(level) {
    if (level === 'Low') return 0;
    if (level === 'Medium') return 1;
    return 2;
}

function buildAlternatives(recipeIngredients, missingIngredients) {
    const substitutionMap = {};
    const candidates = [...new Set([...recipeIngredients, ...missingIngredients])];

    candidates.forEach((ingredient) => {
        const alternative = CHEAP_SUBSTITUTIONS[ingredient];
        if (alternative) {
            substitutionMap[ingredient] = alternative;
        }
    });

    return substitutionMap;
}

function buildAlternativeHints(substitutionMap) {
    return Object.entries(substitutionMap).map(([ingredient, alt]) => `use ${alt} instead of ${ingredient}`);
}

export function recommendRecipesRuleBased({ mainIngredient, availableIngredients = [] }) {
    const normalizedMain = normalizeIngredient(mainIngredient);
    const normalizedAvailable = normalizeIngredientList(availableIngredients);

    if (!normalizedMain) {
        return [];
    }

    const availableSet = new Set([normalizedMain, ...normalizedAvailable]);

    const ranked = recommendationRecipes
        .map((recipe) => {
            const normalizedRecipeIngredients = normalizeIngredientList(recipe.ingredients);
            const hasMainIngredient = normalizedRecipeIngredients.includes(normalizedMain);
            const usedIngredients = normalizedRecipeIngredients.filter((ingredient) => availableSet.has(ingredient));
            const missingIngredients = normalizedRecipeIngredients.filter((ingredient) => !availableSet.has(ingredient));
            const matchPercentage = Math.round((usedIngredients.length / normalizedRecipeIngredients.length) * 100);
            const cheapAlternatives = buildAlternatives(normalizedRecipeIngredients, missingIngredients);

            return {
                name: recipe.name,
                usedIngredients,
                missingIngredients,
                cost: recipe.estimatedCostLevel,
                cheapAlternatives: buildAlternativeHints(cheapAlternatives),
                matchPercentage,
                hasMainIngredient,
                usedCount: usedIngredients.length
            };
        })
        .filter((recipe) => recipe.hasMainIngredient || recipe.usedCount >= 2)
        .sort((a, b) => {
            if (b.usedCount !== a.usedCount) {
                return b.usedCount - a.usedCount;
            }

            if (b.matchPercentage !== a.matchPercentage) {
                return b.matchPercentage - a.matchPercentage;
            }

            return toCostRank(a.estimatedCostLevel) - toCostRank(b.estimatedCostLevel);
        })
        .slice(0, 5)
        .map(({ hasMainIngredient, usedCount, ...result }) => toRecommendationShape(result));

    return ranked;
}

async function recommendRecipesWithAI({ mainIngredient, availableIngredients }) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        throw new Error('OPENAI_API_KEY is missing');
    }

    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
    const baseURL = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';

    const systemPrompt = [
        'You are a recipe recommendation assistant.',
        'Return strict JSON only.',
        'Suggest 3 to 5 recipes using the provided main ingredient and available ingredients.',
        'If exact matches are limited, suggest creative but realistic recipes.',
        'Each recipe object must include: name, usedIngredients, missingIngredients, cost, cheapAlternatives, matchPercentage.',
        'cost must be one of Low, Medium, High.',
        'cheapAlternatives must be an array of actionable strings for budget substitutions.'
    ].join(' ');

    const userPrompt = JSON.stringify({
        mainIngredient,
        availableIngredients,
        requiredResponseShape: {
            recipes: [
                {
                    name: 'string',
                    usedIngredients: ['string'],
                    missingIngredients: ['string'],
                    cost: 'Low|Medium|High',
                    cheapAlternatives: ['string'],
                    matchPercentage: 0
                }
            ]
        }
    });

    const response = await axios.post(
        `${baseURL}/chat/completions`,
        {
            model,
            temperature: 0.3,
            response_format: { type: 'json_object' },
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ]
        },
        {
            headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            timeout: 15000
        }
    );

    const content = response.data?.choices?.[0]?.message?.content;
    const payload = extractJsonPayload(content);
    const recipes = Array.isArray(payload?.recipes) ? payload.recipes : [];

    if (!recipes.length) {
        throw new Error('AI returned no recipes');
    }

    return recipes.slice(0, 5).map((item) => toRecommendationShape(item));
}

export async function getRecipeRecommendations({ mainIngredient, availableIngredients = [] }) {
    const normalizedMain = normalizeIngredient(mainIngredient);
    const normalizedAvailable = normalizeIngredientList(availableIngredients);

    if (!normalizedMain) {
        return {
            source: 'rule-based',
            recipes: []
        };
    }

    try {
        const aiRecipes = await recommendRecipesWithAI({
            mainIngredient: normalizedMain,
            availableIngredients: normalizedAvailable
        });

        return {
            source: 'ai',
            recipes: aiRecipes
        };
    } catch (error) {
        const fallbackRecipes = recommendRecipesRuleBased({
            mainIngredient: normalizedMain,
            availableIngredients: normalizedAvailable
        });

        return {
            source: 'rule-based',
            fallbackReason: error.message || 'AI recommendation failed',
            recipes: fallbackRecipes
        };
    }
}
