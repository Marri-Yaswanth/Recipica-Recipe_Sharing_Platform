-- Add diet_type column to recipes table

USE recipe_platform;

-- Add diet_type column if it doesn't exist
ALTER TABLE recipes 
ADD COLUMN IF NOT EXISTS diet_type ENUM('vegetarian', 'eggetarian', 'non-vegetarian') DEFAULT 'vegetarian' 
AFTER category;

-- Add index for diet_type
ALTER TABLE recipes 
ADD INDEX IF NOT EXISTS idx_diet_type (diet_type);

-- Update existing recipes to have default diet_type
UPDATE recipes 
SET diet_type = 'vegetarian' 
WHERE diet_type IS NULL;

SELECT 'Diet type column added successfully!' as message;
