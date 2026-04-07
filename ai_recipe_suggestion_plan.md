# AI Recipe Suggestion Plan

## Goal
Add an AI-assisted feature that lets a user enter ingredients they already have and receive:
- recipe suggestions they can cook now
- missing ingredients needed to finish a recipe
- a shopping list of the extra items to buy

## Recommended Approach
Use a hybrid recommendation flow:
1. deterministic ingredient matching for fast and cheap first-pass scoring
2. AI model call only for ranking, substitutions, and natural-language explanation
3. return structured JSON so the frontend can render cards, missing items, and shopping suggestions

This avoids sending the whole app through AI on every request and keeps costs and latency under control.

## Backend Changes
### New API endpoints
- `POST /api/ai/recipe-suggestions`
  - input: `ingredients`, optional `diet_type`, `category`, `avoid`, `mealType`
  - output: top matched recipes, match score, missing items, substitution ideas
- `POST /api/ai/shopping-list`
  - input: selected recipe or ingredient set
  - output: missing items grouped by pantry / produce / dairy / protein / spices

### Server logic
- Normalize ingredients to lowercase and trim punctuation
- Compare user ingredients against recipe ingredients from `backend/database.sql` and existing recipe rows
- Rank by:
  - ingredient overlap
  - category / diet_type match
  - prep time or difficulty if available
- Call the AI only after candidate recipes are selected

### Suggested helper functions
- `normalizeIngredient(text)`
- `parseIngredientList(value)`
- `scoreRecipeMatch(userIngredients, recipeIngredients)`
- `buildMissingItems(recipeIngredients, userIngredients)`
- `suggestSubstitutions(missingItems)`

### Data source
- Use the existing recipes table and featured frontend recipes as seed data
- If needed, add a small persistent recipe index table later for faster matching

## Frontend Changes
### New UI area
- Add a new section on the protected homepage called something like:
  - “Cook with what you have”
  - “Ingredient AI assistant”

### User flow
1. user enters ingredients in a textarea or tag input
2. user optionally chooses vegetarian / eggetarian / non-vegetarian and category
3. app calls the AI suggestion endpoint
4. app shows ranked recipe cards with:
   - match percentage
   - missing items
   - buy list button
5. clicking a recipe opens the existing detail panel with the gap analysis

### UX details
- show a loading state while AI is generating suggestions
- show a fallback message if the AI is unavailable
- let the user copy the shopping list
- let the user save or email the suggested recipe later

## AI Prompt / Response Design
### Prompt should ask for
- top recipes from the ingredient list
- missing ingredients required to complete each recipe
- practical substitutions for unavailable items
- concise explanation in a friendly tone

### Response should be strict JSON
Example fields:
- `suggestions[]`
- `matchScore`
- `availableIngredients`
- `missingIngredients`
- `shoppingList`
- `substitutions`
- `reasoningSummary`

## Security And Reliability
- keep API key and model config only in backend `.env`
- never send user tokens or unrelated private data to the AI provider
- validate input length to prevent oversized prompts
- rate limit the AI endpoint if possible
- always keep deterministic fallback results when the AI request fails

## Implementation Order
1. add backend ingredient parsing and scoring helpers
2. add AI suggestion endpoint returning structured JSON
3. add shopping-list endpoint
4. add frontend ingredient entry UI and results panel
5. connect the recipe detail page to missing-item analysis
6. polish empty states, loading, and error handling

## Files Likely To Change
- `backend/routes/recipes.js`
- `backend/server.js`
- `backend/.env.example`
- `frontend/src/App.js`
- `frontend/src/styles.css`
- possibly `frontend/src/recipeData.js`

## Verification
- run backend syntax check
- run frontend syntax check
- test suggestions with:
  - a full ingredient list
  - a partial ingredient list
  - no ingredients
  - vegetarian-only filtering
- verify the UI shows ranked recipes and a shopping list
- verify fallback behavior when AI credentials are missing

## Open Questions
- which AI provider to use: OpenAI, Azure OpenAI, or another service
- whether suggestions should use only the database recipes or also the featured frontend recipes
- whether shopping list recommendations should be editable before email sharing