const featuredRecipes = [
  {
    id: 'featured-butter-chicken',
    name: 'Butter Chicken',
    description: 'Creamy, comforting chicken curry with rich spices.',
    category: 'Indian',
    foodCategory: 'non-vegetarian',
    image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=1200&q=80',
    prepTime: '20 min',
    cookTime: '40 min',
    servings: 4,
    ingredients: [
      '500g chicken',
      '1 cup yogurt',
      '2 tbsp butter',
      '1 onion',
      '3 tomatoes',
      'Garam masala',
      'Ginger and garlic paste',
      'Cream'
    ],
    instructions: [
      'Marinate the chicken with yogurt, ginger-garlic paste, and spices.',
      'Cook onions and tomatoes until soft, then blend into a smooth sauce.',
      'Add butter, chicken, and simmer until cooked through.',
      'Finish with cream and serve hot with rice or naan.'
    ]
  },
  {
    id: 'featured-pizza',
    name: 'Classic Pizza',
    description: 'Cheesy homemade pizza with crisp crust and fresh toppings.',
    category: 'Italian',
    foodCategory: 'vegetarian',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=80',
    prepTime: '25 min',
    cookTime: '15 min',
    servings: 4,
    ingredients: [
      'Pizza dough',
      'Tomato sauce',
      'Mozzarella cheese',
      'Bell peppers',
      'Olives',
      'Mushrooms',
      'Oregano'
    ],
    instructions: [
      'Roll out the dough and spread tomato sauce evenly.',
      'Add cheese and your favorite toppings.',
      'Bake in a hot oven until the crust is golden.',
      'Slice and serve immediately.'
    ]
  },
  {
    id: 'featured-pancakes',
    name: 'Fluffy Pancakes',
    description: 'Soft breakfast pancakes with syrup and berries.',
    category: 'Breakfast',
    foodCategory: 'eggetarian',
    image: 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=1200&q=80',
    prepTime: '10 min',
    cookTime: '15 min',
    servings: 2,
    ingredients: [
      'Flour',
      'Milk',
      'Eggs',
      'Baking powder',
      'Butter',
      'Sugar',
      'Vanilla'
    ],
    instructions: [
      'Whisk the dry ingredients in one bowl.',
      'Mix milk, eggs, butter, and vanilla in another bowl.',
      'Combine both mixtures and cook on a greased pan.',
      'Serve with syrup, berries, or honey.'
    ]
  },
  {
    id: 'featured-ramen',
    name: 'Spicy Ramen',
    description: 'Warm noodle bowl with broth, egg, and fresh toppings.',
    category: 'Asian',
    foodCategory: 'eggetarian',
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=1200&q=80',
    prepTime: '20 min',
    cookTime: '25 min',
    servings: 2,
    ingredients: [
      'Ramen noodles',
      'Broth',
      'Egg',
      'Green onion',
      'Soy sauce',
      'Mushrooms',
      'Chili oil'
    ],
    instructions: [
      'Cook the broth with soy sauce and seasonings.',
      'Boil noodles until tender and drain lightly.',
      'Add noodles to bowls and pour hot broth over them.',
      'Top with egg, green onion, mushrooms, and chili oil.'
    ]
  },
  {
    id: 'featured-sushi',
    name: 'Sushi Bowl',
    description: 'Fresh sushi-inspired bowl with rice, salmon, and avocado.',
    category: 'Japanese',
    foodCategory: 'non-vegetarian',
    image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=1200&q=80',
    prepTime: '15 min',
    cookTime: '10 min',
    servings: 2,
    ingredients: [
      'Sushi rice',
      'Salmon',
      'Avocado',
      'Cucumber',
      'Soy sauce',
      'Sesame seeds',
      'Nori'
    ],
    instructions: [
      'Cook the sushi rice and let it cool slightly.',
      'Slice the salmon, avocado, and cucumber.',
      'Layer rice and toppings in a bowl.',
      'Drizzle with soy sauce and sprinkle sesame seeds.'
    ]
  },
  {
    id: 'featured-brownies',
    name: 'Chocolate Brownies',
    description: 'Fudgy brownies with a rich chocolate center.',
    category: 'Dessert',
    foodCategory: 'eggetarian',
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=1200&q=80',
    prepTime: '15 min',
    cookTime: '30 min',
    servings: 8,
    ingredients: [
      'Butter',
      'Sugar',
      'Eggs',
      'Cocoa powder',
      'Flour',
      'Salt',
      'Vanilla extract'
    ],
    instructions: [
      'Melt the butter and mix with sugar.',
      'Whisk in eggs and vanilla.',
      'Fold in cocoa powder, flour, and salt.',
      'Bake until the center is set and cool before slicing.'
    ]
  },
  {
    id: 'featured-avocado-toast',
    name: 'Avocado Toast',
    description: 'Simple, fresh toast topped with avocado and tomatoes.',
    category: 'Healthy',
    foodCategory: 'vegetarian',
    image: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=80',
    prepTime: '5 min',
    cookTime: '5 min',
    servings: 1,
    ingredients: [
      'Bread',
      'Avocado',
      'Tomato',
      'Lemon juice',
      'Salt',
      'Pepper',
      'Olive oil'
    ],
    instructions: [
      'Toast the bread until golden.',
      'Mash avocado with lemon juice, salt, and pepper.',
      'Spread on toast and top with sliced tomato.',
      'Finish with olive oil and serve immediately.'
    ]
  },
  {
    id: 'featured-pasta',
    name: 'Creamy Pasta',
    description: 'Velvety pasta with garlic, parmesan, and herbs.',
    category: 'Italian',
    foodCategory: 'vegetarian',
    image: 'https://images.unsplash.com/photo-1498579150354-977475b7ea0b?auto=format&fit=crop&w=1200&q=80',
    prepTime: '15 min',
    cookTime: '20 min',
    servings: 3,
    ingredients: [
      'Pasta',
      'Cream',
      'Garlic',
      'Parmesan cheese',
      'Olive oil',
      'Parsley',
      'Black pepper'
    ],
    instructions: [
      'Cook the pasta until al dente.',
      'Sauté garlic in olive oil and add cream.',
      'Mix in cheese and seasonings to make the sauce.',
      'Toss pasta with sauce and garnish with parsley.'
    ]
  },
  {
    id: 'featured-paneer-tikka',
    name: 'Paneer Tikka',
    description: 'Smoky paneer cubes grilled with peppers and spices.',
    category: 'Indian',
    foodCategory: 'vegetarian',
    image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=1200&q=80',
    prepTime: '25 min',
    cookTime: '20 min',
    servings: 4,
    ingredients: [
      'Paneer',
      'Yogurt',
      'Bell peppers',
      'Onion',
      'Garam masala',
      'Turmeric',
      'Chili powder'
    ],
    instructions: [
      'Marinate paneer and vegetables in yogurt and spices.',
      'Skewer and grill until lightly charred.',
      'Serve with mint chutney and lemon wedges.'
    ]
  },
  {
    id: 'featured-egg-fried-rice',
    name: 'Egg Fried Rice',
    description: 'Quick fried rice with eggs, vegetables, and soy sauce.',
    category: 'Asian',
    foodCategory: 'eggetarian',
    image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=1200&q=80',
    prepTime: '15 min',
    cookTime: '15 min',
    servings: 2,
    ingredients: [
      'Cooked rice',
      'Eggs',
      'Carrots',
      'Peas',
      'Soy sauce',
      'Spring onion',
      'Oil'
    ],
    instructions: [
      'Scramble the eggs and set aside.',
      'Stir fry vegetables, then add rice and soy sauce.',
      'Mix in eggs and finish with spring onion.'
    ]
  },
  {
    id: 'featured-grilled-chicken-salad',
    name: 'Grilled Chicken Salad',
    description: 'Healthy salad with juicy grilled chicken and fresh greens.',
    category: 'Healthy',
    foodCategory: 'non-vegetarian',
    image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?auto=format&fit=crop&w=1200&q=80',
    prepTime: '15 min',
    cookTime: '15 min',
    servings: 2,
    ingredients: [
      'Chicken breast',
      'Lettuce',
      'Tomato',
      'Cucumber',
      'Olive oil',
      'Lemon juice',
      'Pepper'
    ],
    instructions: [
      'Season and grill the chicken until cooked through.',
      'Slice the vegetables and arrange them in a bowl.',
      'Top with chicken and drizzle with olive oil and lemon juice.'
    ]
  },
  {
    id: 'featured-hyderabadi-biryani',
    name: 'Hyderabadi Biryani',
    description: 'Fragrant dum-style rice layered with spiced chicken and herbs.',
    category: 'Indian',
    foodCategory: 'non-vegetarian',
    image: 'https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?auto=format&fit=crop&w=1200&q=80',
    prepTime: '35 min',
    cookTime: '55 min',
    servings: 5,
    ingredients: [
      'Basmati rice',
      'Chicken',
      'Yogurt',
      'Onion',
      'Mint leaves',
      'Coriander leaves',
      'Garam masala',
      'Saffron milk'
    ],
    instructions: [
      'Marinate chicken with yogurt, spices, and ginger-garlic paste.',
      'Parboil basmati rice with whole spices.',
      'Layer chicken and rice with fried onions, mint, and saffron milk.',
      'Seal and cook on low heat until aromatic and fully done.'
    ]
  },
  {
    id: 'featured-masala-dosa',
    name: 'Masala Dosa',
    description: 'South Indian crisp dosa filled with spiced potato masala.',
    category: 'Indian',
    foodCategory: 'vegetarian',
    image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=1200&q=80',
    prepTime: '20 min',
    cookTime: '25 min',
    servings: 4,
    ingredients: [
      'Dosa batter',
      'Potatoes',
      'Onion',
      'Mustard seeds',
      'Curry leaves',
      'Turmeric',
      'Oil'
    ],
    instructions: [
      'Cook potatoes and mash lightly for masala filling.',
      'Temper mustard seeds, curry leaves, onions, and spices.',
      'Spread dosa batter thinly on hot tawa until crisp.',
      'Place potato masala in center, fold, and serve with chutney.'
    ]
  },
  {
    id: 'featured-chole-bhature',
    name: 'Chole Bhature',
    description: 'Classic Punjabi chickpea curry served with fluffy fried bread.',
    category: 'Indian',
    foodCategory: 'vegetarian',
    image: 'https://upload.wikimedia.org/wikipedia/commons/9/9e/Chole_Bhature_from_Nagpur.JPG',
    prepTime: '25 min',
    cookTime: '35 min',
    servings: 4,
    ingredients: [
      'Chickpeas',
      'Onion',
      'Tomato',
      'Chole masala',
      'Flour',
      'Yogurt',
      'Oil'
    ],
    instructions: [
      'Pressure cook chickpeas until soft.',
      'Cook onion-tomato masala with chole spices and add chickpeas.',
      'Prepare bhature dough using flour and yogurt, then rest.',
      'Roll and deep fry bhature, serve hot with chole and onions.'
    ]
  },
  {
    id: 'featured-rajma-chawal',
    name: 'Rajma Chawal',
    description: 'Comforting kidney bean curry with steamed rice.',
    category: 'Indian',
    foodCategory: 'vegetarian',
    image: 'https://upload.wikimedia.org/wikipedia/commons/3/37/Rajma_Masala_%2832081557778%29.jpg',
    prepTime: '20 min',
    cookTime: '40 min',
    servings: 4,
    ingredients: [
      'Kidney beans',
      'Onion',
      'Tomato',
      'Ginger',
      'Garlic',
      'Cumin',
      'Rice'
    ],
    instructions: [
      'Cook soaked kidney beans until tender.',
      'Make onion-tomato gravy with ginger, garlic, and spices.',
      'Simmer beans in gravy until thick and flavorful.',
      'Serve with steamed rice and fresh coriander.'
    ]
  },
  {
    id: 'featured-thai-green-curry',
    name: 'Thai Green Curry',
    description: 'Coconut-based Thai curry with vegetables and fragrant herbs.',
    category: 'Thai',
    foodCategory: 'vegetarian',
    image: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?auto=format&fit=crop&w=1200&q=80',
    prepTime: '15 min',
    cookTime: '20 min',
    servings: 3,
    ingredients: [
      'Coconut milk',
      'Green curry paste',
      'Tofu',
      'Bell peppers',
      'Basil',
      'Soy sauce',
      'Rice'
    ],
    instructions: [
      'Saute green curry paste briefly in oil.',
      'Add coconut milk and simmer until aromatic.',
      'Add tofu and vegetables, then cook until tender.',
      'Finish with basil and serve with jasmine rice.'
    ]
  },
  {
    id: 'featured-mexican-tacos',
    name: 'Mexican Street Tacos',
    description: 'Quick tacos with fresh salsa, lime, and spicy filling.',
    category: 'Mexican',
    foodCategory: 'non-vegetarian',
    image: 'https://images.unsplash.com/photo-1613514785940-daed07799d9b?auto=format&fit=crop&w=1200&q=80',
    prepTime: '15 min',
    cookTime: '18 min',
    servings: 3,
    ingredients: [
      'Chicken strips',
      'Tortillas',
      'Onion',
      'Tomato',
      'Lime',
      'Chili flakes',
      'Coriander'
    ],
    instructions: [
      'Season and saute chicken until cooked and slightly charred.',
      'Warm tortillas on a skillet.',
      'Top with chicken, onion, tomato salsa, and coriander.',
      'Serve with fresh lime wedges.'
    ]
  },
  {
    id: 'featured-moroccan-tagine',
    name: 'Moroccan Chickpea Tagine',
    description: 'Slow-cooked North African stew with warm spices and vegetables.',
    category: 'Moroccan',
    foodCategory: 'vegetarian',
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=1200&q=80',
    prepTime: '20 min',
    cookTime: '35 min',
    servings: 4,
    ingredients: [
      'Chickpeas',
      'Carrot',
      'Zucchini',
      'Tomato',
      'Cinnamon',
      'Cumin',
      'Olive oil'
    ],
    instructions: [
      'Saute onion and garlic with olive oil and spices.',
      'Add tomatoes, chickpeas, and chopped vegetables.',
      'Simmer until vegetables are tender and sauce thickens.',
      'Serve hot with couscous or flatbread.'
    ]
  }
];

export default featuredRecipes;
