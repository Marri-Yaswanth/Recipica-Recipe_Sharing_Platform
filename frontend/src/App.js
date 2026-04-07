import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import featuredRecipes from './recipeData';

const API_BASE = process.env.REACT_APP_API_BASE || '';
const authClient = axios.create({ baseURL: API_BASE });
const apiClient = axios.create({ baseURL: API_BASE });
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80';

const FOOD_CATEGORY_META = {
  all: { label: 'All', icon: '🍽️' },
  vegetarian: { label: 'Vegetarian', icon: '🥬' },
  eggetarian: { label: 'Eggetarian', icon: '🥚' },
  'non-vegetarian': { label: 'Non-vegetarian', icon: '🍗' },
};

function readToken() {
  const storedToken = localStorage.getItem('recipica_token') || '';

  if (!storedToken) {
    return '';
  }

  const normalized = storedToken.trim();
  if (!normalized || normalized === 'undefined' || normalized === 'null') {
    localStorage.removeItem('recipica_token');
    return '';
  }

  return normalized;
}

function readUser() {
  try {
    return JSON.parse(localStorage.getItem('recipica_user') || 'null');
  } catch {
    return null;
  }
}

function toList(value) {
  if (Array.isArray(value)) {
    return value;
  }

  if (!value) {
    return [];
  }

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [value];
    } catch {
      return value
        .split(/,|\r?\n/)
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }

  return [String(value)];
}

function normalizeRecipe(recipe) {
  const foodCategory = recipe.foodCategory || recipe.diet_type || 'vegetarian';

  return {
    ...recipe,
    image: recipe.image || recipe.image_url || FALLBACK_IMAGE,
    ingredients: toList(recipe.ingredients),
    instructions: toList(recipe.instructions),
    prepTime: recipe.prepTime || recipe.prep_time || '10 min',
    cookTime: recipe.cookTime || recipe.cook_time || '20 min',
    servings: recipe.servings || 4,
    foodCategory,
  };
}

function recipeWords(recipe) {
  return [
    recipe.name,
    recipe.description,
    recipe.category,
    ...(recipe.ingredients || []),
    ...(recipe.instructions || []),
  ]
    .join(' ')
    .toLowerCase();
}

function combineRecipes(apiRecipes) {
  const combined = new Map();

  featuredRecipes.forEach((recipe) => {
    combined.set(recipe.name.toLowerCase(), normalizeRecipe(recipe));
  });

  apiRecipes.forEach((recipe) => {
    const key = (recipe.name || '').toLowerCase();
    const existing = combined.get(key) || {};
    combined.set(key, normalizeRecipe({ ...existing, ...recipe }));
  });

  return Array.from(combined.values());
}

function applyFallbackImage(event) {
  if (event.currentTarget.src !== FALLBACK_IMAGE) {
    event.currentTarget.src = FALLBACK_IMAGE;
  }
}

export default function App() {
  const [health, setHealth] = useState('Checking...');
  const [mode, setMode] = useState('login');
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });
  const [resetForm, setResetForm] = useState({ password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [authMessage, setAuthMessage] = useState('');
  const [authError, setAuthError] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [user, setUser] = useState(() => readUser());
  const [apiRecipes, setApiRecipes] = useState([]);
  const [recipesLoading, setRecipesLoading] = useState(false);
  const [recipesError, setRecipesError] = useState('');
  const [search, setSearch] = useState('');
  const [foodFilter, setFoodFilter] = useState('all');
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [shareForm, setShareForm] = useState({ recipientEmail: '', note: '' });
  const [shareMessage, setShareMessage] = useState('');
  const [shareError, setShareError] = useState('');
  const [aiForm, setAiForm] = useState({ mainIngredient: '', availableIngredients: '' });
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [aiMeta, setAiMeta] = useState({ source: '', fallbackReason: '' });
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [shoppingList, setShoppingList] = useState([]);

  const token = readToken();
  const allRecipes = useMemo(() => combineRecipes(apiRecipes), [apiRecipes]);
  const filteredRecipes = useMemo(() => {
    const term = search.trim().toLowerCase();
    return allRecipes.filter((recipe) => {
      const matchesSearch = !term || recipeWords(recipe).includes(term);
      const matchesFood = foodFilter === 'all' || recipe.foodCategory === foodFilter;
      return matchesSearch && matchesFood;
    });
  }, [allRecipes, search, foodFilter]);
  const popularRecipes = filteredRecipes.slice(0, 3);

  function categoryMeta(categoryKey) {
    return FOOD_CATEGORY_META[categoryKey] || { label: categoryKey, icon: '🍴' };
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const resetMode = params.get('mode') || '';
    const tokenFromUrl = params.get('token') || '';

    if (resetMode === 'reset-password' && tokenFromUrl) {
      setMode('reset-password');
      setResetToken(tokenFromUrl);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  useEffect(() => {
    const loadHealth = async () => {
      try {
        const res = await apiClient.get('/api/health');
        setHealth(res.data.message || 'Server running');
      } catch {
        setHealth('Unavailable');
      }
    };

    loadHealth();
  }, []);

  useEffect(() => {
    if (token) {
      loadRecipes();
    }
  }, [token]);

  useEffect(() => {
    if (selectedRecipe && !allRecipes.some((recipe) => recipe.id === selectedRecipe.id)) {
      setSelectedRecipe(null);
    }
  }, [allRecipes, selectedRecipe]);

  useEffect(() => {
    const main = aiForm.mainIngredient.trim();
    const available = aiForm.availableIngredients.trim();

    if (!main && !available) {
      setAiSuggestions([]);
      setAiMeta({ source: '', fallbackReason: '' });
      setAiError('');
    }
  }, [aiForm.mainIngredient, aiForm.availableIngredients]);

  async function loadRecipes() {
    setRecipesLoading(true);
    setRecipesError('');

    try {
      const res = await apiClient.get('/api/recipes');
      setApiRecipes(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      setRecipesError(error.response?.data?.error || 'Error fetching recipes');
    } finally {
      setRecipesLoading(false);
    }
  }

  async function handleAuthSubmit(event) {
    event.preventDefault();
    setAuthError('');
    setAuthMessage('');

    try {
      const endpoint = mode === 'signup' ? '/api/auth/signup' : '/api/auth/login';
      const payload = mode === 'signup'
        ? { name: authForm.name, email: authForm.email, password: authForm.password }
        : { email: authForm.email, password: authForm.password };

      const res = await authClient.post(endpoint, payload);
      const nextUser = res.data.user || { email: authForm.email, name: authForm.name || authForm.email };

      localStorage.setItem('recipica_token', res.data.token);
      localStorage.setItem('recipica_user', JSON.stringify(nextUser));
      setUser(nextUser);
      setAuthMessage(res.data.message || 'Authenticated successfully');
      setAuthForm({ name: '', email: '', password: '' });
      setMode('login');
      loadRecipes();
    } catch (error) {
      setAuthError(error.response?.data?.error || 'Authentication failed');
    }
  }

  async function handleForgotPasswordSubmit(event) {
    event.preventDefault();
    setAuthError('');
    setAuthMessage('');

    try {
      const res = await authClient.post('/api/auth/forgot-password', { email: authForm.email });
      const responseMessage = res.data.warning
        ? `${res.data.message}. ${res.data.warning}`
        : res.data.message || 'Password reset link sent to your email';

      setAuthMessage(res.data.resetLink ? `${responseMessage} Open this link: ${res.data.resetLink}` : responseMessage);
    } catch (error) {
      setAuthError(error.response?.data?.error || 'Could not send password reset email');
    }
  }

  async function handleResetPasswordSubmit(event) {
    event.preventDefault();
    setAuthError('');
    setAuthMessage('');

    if (!resetToken) {
      setAuthError('Reset token is missing. Open the reset link from your email.');
      return;
    }

    if (!resetForm.password || !resetForm.confirmPassword) {
      setAuthError('Please enter and confirm a new password');
      return;
    }

    if (resetForm.password !== resetForm.confirmPassword) {
      setAuthError('Passwords do not match');
      return;
    }

    try {
      const res = await authClient.post('/api/auth/reset-password', {
        token: resetToken,
        newPassword: resetForm.password,
      });

      setAuthMessage(res.data.message || 'Password reset successful');
      setMode('login');
      setResetToken('');
      setResetForm({ password: '', confirmPassword: '' });
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (error) {
      setAuthError(error.response?.data?.error || 'Could not reset password');
    }
  }

  function logout() {
    localStorage.removeItem('recipica_token');
    localStorage.removeItem('recipica_user');
    setUser(null);
    setApiRecipes([]);
    setShareForm({ recipientEmail: '', note: '' });
    setShareMessage('');
    setShareError('');
    setSelectedRecipe(null);
  }

  async function handleShareSubmit(event) {
    event.preventDefault();
    setShareMessage('');
    setShareError('');

    if (!selectedRecipe) {
      setShareError('Choose a recipe first');
      return;
    }

    try {
      const recipeId = Number.isInteger(Number(selectedRecipe.id)) ? Number(selectedRecipe.id) : null;

      const res = await apiClient.post('/api/recipes/share-email', {
        recipeId,
        recipe: selectedRecipe,
        recipientEmail: shareForm.recipientEmail,
        note: shareForm.note,
      }, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      setShareMessage(res.data.message || 'Recipe shared successfully');
      setShareForm({ recipientEmail: '', note: '' });
    } catch (error) {
        const apiError = error.response?.data?.error || 'Could not share recipe';

        if (apiError.toLowerCase().includes('invalid token') || error.response?.status === 401) {
          localStorage.removeItem('recipica_token');
          localStorage.removeItem('recipica_user');
          setUser(null);
          setMode('login');
          setShareError('Session expired. Please login again and retry sending the recipe.');
          return;
        }

        setShareError(apiError);
    }
  }

  function openRecipe(recipe) {
    setSelectedRecipe(recipe);
    setShareMessage('');
    setShareError('');
  }

  function parseIngredientInput(value) {
    return String(value || '')
      .split(/,|\r?\n/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  function addMissingToShoppingList(recipeSuggestion) {
    const items = Array.isArray(recipeSuggestion?.missingIngredients)
      ? recipeSuggestion.missingIngredients
      : [];

    if (!items.length) {
      return;
    }

    setShoppingList((current) => {
      const next = new Set(current);
      items.forEach((item) => next.add(item));
      return Array.from(next);
    });
  }

  async function handleAiRecommendSubmit(event) {
    event.preventDefault();
    setAiError('');
    setAiLoading(true);

    const mainIngredient = aiForm.mainIngredient.trim();
    const availableIngredients = parseIngredientInput(aiForm.availableIngredients);

    if (!mainIngredient) {
      setAiLoading(false);
      setAiError('Please enter a main ingredient.');
      return;
    }

    try {
      const res = await apiClient.post('/api/recommend-recipes', {
        mainIngredient,
        availableIngredients,
      }, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      setAiSuggestions(Array.isArray(res.data?.recipes) ? res.data.recipes : []);
      setAiMeta({
        source: res.data?.source || 'rule-based',
        fallbackReason: res.data?.fallbackReason || '',
      });
    } catch (error) {
      setAiError(error.response?.data?.error || 'Could not generate AI recommendations.');
      setAiSuggestions([]);
      setAiMeta({ source: '', fallbackReason: '' });
    } finally {
      setAiLoading(false);
    }
  }

  function clearShoppingList() {
    setShoppingList([]);
  }

  const canShare = Boolean(token);

  return (
    <main className="site">
      {!user ? (
        <section id="auth" className="auth-gate">
          <div className="auth-gate-card">
            <div className="auth-gate-grid">
              <div className="auth-intro">
                <div className="brand-logo" aria-hidden="true">
                  <span className="brand-mark">R</span>
                  <div>
                    <p className="brand-name">Recipica</p>
                    <p className="brand-tag">Smart cooking companion</p>
                  </div>
                </div>
                <p className="eyebrow">Login required</p>
                <h1>Sign in to unlock the recipe library.</h1>
                <p className="hero-copy">
                  Recipica keeps the recipe collection private until you log in. Once inside, you can browse featured dishes, open full recipe details, and share them by email.
                </p>

                <div className="hero-badges">
                  <span>Protected content</span>
                  <span>Recipe browsing</span>
                  <span>Email sharing</span>
                </div>

                <div className="auth-stat-grid">
                  <div>
                    <strong>{allRecipes.length}</strong>
                    <span>recipes ready</span>
                  </div>
                  <div>
                    <strong>{popularRecipes.length}</strong>
                    <span>featured dishes</span>
                  </div>
                  <div>
                    <strong>1 tap</strong>
                    <span>to share a meal</span>
                  </div>
                </div>
              </div>

              <div className="auth-panel auth-panel-inline">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Account access</p>
                  <h2>Login or create an account</h2>
                </div>
              </div>

              <div className="tabs">
                <button type="button" className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>Login</button>
                <button type="button" className={mode === 'signup' ? 'active' : ''} onClick={() => setMode('signup')}>Create account</button>
                <button type="button" className={mode === 'forgot-password' ? 'active' : ''} onClick={() => setMode('forgot-password')}>Forgot password</button>
                <button type="button" className={mode === 'reset-password' ? 'active' : ''} onClick={() => setMode('reset-password')}>Reset password</button>
              </div>

              {mode === 'forgot-password' ? (
                <form className="auth-form" onSubmit={handleForgotPasswordSubmit}>
                  <label>
                    Email
                    <input
                      type="email"
                      value={authForm.email}
                      onChange={(e) => setAuthForm((current) => ({ ...current, email: e.target.value }))}
                      placeholder="you@example.com"
                    />
                  </label>

                  <button type="submit">Send reset link</button>
                  <button type="button" className="ghost-button" onClick={() => setMode('login')}>Back to login</button>
                  {authMessage ? <p className="success">{authMessage}</p> : null}
                  {authError ? <p className="error">{authError}</p> : null}
                </form>
              ) : null}

              {mode === 'reset-password' ? (
                <form className="auth-form" onSubmit={handleResetPasswordSubmit}>
                  <label>
                    New password
                    <div className="password-row">
                      <input
                        type={showResetPassword ? 'text' : 'password'}
                        value={resetForm.password}
                        onChange={(e) => setResetForm((current) => ({ ...current, password: e.target.value }))}
                        placeholder="Create a new password"
                      />
                      <button type="button" className="ghost-button" onClick={() => setShowResetPassword((current) => !current)}>
                        {showResetPassword ? 'Hide' : 'Show'}
                      </button>
                    </div>
                  </label>

                  <label>
                    Confirm new password
                    <input
                      type={showResetPassword ? 'text' : 'password'}
                      value={resetForm.confirmPassword}
                      onChange={(e) => setResetForm((current) => ({ ...current, confirmPassword: e.target.value }))}
                      placeholder="Repeat the new password"
                    />
                  </label>

                  <button type="submit">Reset password</button>
                  <button type="button" className="ghost-button" onClick={() => setMode('login')}>Back to login</button>
                  {authMessage ? <p className="success">{authMessage}</p> : null}
                  {authError ? <p className="error">{authError}</p> : null}
                </form>
              ) : null}

              {mode === 'login' || mode === 'signup' ? (
                <form className="auth-form" onSubmit={handleAuthSubmit}>
                  {mode === 'signup' ? (
                    <label>
                      Name
                      <input
                        value={authForm.name}
                        onChange={(e) => setAuthForm((current) => ({ ...current, name: e.target.value }))}
                        placeholder="Your name"
                      />
                    </label>
                  ) : null}

                  <label>
                    Email
                    <input
                      type="email"
                      value={authForm.email}
                      onChange={(e) => setAuthForm((current) => ({ ...current, email: e.target.value }))}
                      placeholder="you@example.com"
                    />
                  </label>

                  <label>
                    Password
                    <div className="password-row">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={authForm.password}
                        onChange={(e) => setAuthForm((current) => ({ ...current, password: e.target.value }))}
                        placeholder="Your password"
                      />
                      <button type="button" className="ghost-button" onClick={() => setShowPassword((current) => !current)}>
                        {showPassword ? 'Hide' : 'Show'}
                      </button>
                    </div>
                  </label>

                  <button type="submit">{mode === 'signup' ? 'Create account' : 'Login'}</button>
                  {mode === 'login' ? (
                    <button type="button" className="link-button" onClick={() => setMode('forgot-password')}>
                      Forgot password?
                    </button>
                  ) : null}
                  {authMessage ? <p className="success">{authMessage}</p> : null}
                  {authError ? <p className="error">{authError}</p> : null}
                </form>
              ) : null}
              </div>
            </div>
          </div>
        </section>
      ) : (
        <>
          <header className="topbar">
            <div className="brand brand-logo">
              <span className="brand-mark">R</span>
              <div>
                <p className="brand-name">Recipica</p>
                <p className="brand-tag">Recipe sharing platform</p>
              </div>
            </div>
            <nav className="nav">
              <a href="#home">Home</a>
              <a href="#ai-finder">AI Finder</a>
              <a href="#popular">Popular recipes</a>
              <a href="#recipes">Recipes</a>
              <a href="#auth">Account</a>
            </nav>
          </header>

          <section id="home" className="hero">
            <div>
              <p className="eyebrow">Weekly recipe sharing</p>
              <h1>Cook, browse, and email recipes with ingredients in one place.</h1>
              <p className="hero-copy">
                Explore the popular recipes of the week, open any card to view ingredients and steps, and send the full recipe through email.
              </p>
              <div className="hero-badges">
                <span>Popular recipes</span>
                <span>Searchable cards</span>
                <span>Email sharing</span>
              </div>
            </div>
            <div className="hero-panel">
              <p>API Status</p>
              <strong>{health}</strong>
              <p>{`Signed in as ${user.email}`}</p>
            </div>
          </section>

          <section id="ai-finder" className="section-block ai-finder-section">
            <div className="section-heading">
              <div>
                <p className="eyebrow">AI recipe finder</p>
                <h2>Find recipes from what you already have</h2>
              </div>
            </div>

            <div className="ai-finder-layout">
              <form className="ai-form" onSubmit={handleAiRecommendSubmit}>
                <label>
                  Main ingredient
                  <input
                    type="text"
                    value={aiForm.mainIngredient}
                    onChange={(event) => setAiForm((current) => ({ ...current, mainIngredient: event.target.value }))}
                    placeholder="chicken, paneer, rice"
                  />
                </label>

                <label>
                  Available ingredients (comma or new line separated)
                  <textarea
                    rows="4"
                    value={aiForm.availableIngredients}
                    onChange={(event) => setAiForm((current) => ({ ...current, availableIngredients: event.target.value }))}
                    placeholder={'onion, tomato, garlic, rice'}
                  />
                </label>

                <button type="submit" disabled={aiLoading}>
                  {aiLoading ? 'Finding recipes...' : 'Suggest recipes'}
                </button>

                {aiMeta.source ? <p className="ai-meta">Source: {aiMeta.source === 'ai' ? 'AI' : 'Rule-based fallback'}</p> : null}
                {aiMeta.fallbackReason ? <p className="ai-meta">Fallback reason: {aiMeta.fallbackReason}</p> : null}
                {aiError ? <p className="error">{aiError}</p> : null}
              </form>

              <div className="ai-results">
                {(!aiForm.mainIngredient.trim() && !aiForm.availableIngredients.trim()) ? (
                  <p className="empty-state">Enter ingredients to get AI suggestions.</p>
                ) : aiSuggestions.length === 0 ? (
                  <p className="empty-state">No AI suggestions yet. Enter ingredients and click Suggest recipes.</p>
                ) : (
                  <div className="ai-card-grid">
                    {aiSuggestions.map((recipe, index) => (
                      <article className="ai-card" key={`${recipe.name}-${index}`}>
                        <div className="ai-card-head">
                          <h3>{recipe.name}</h3>
                          <span className={`cost-chip ${String(recipe.cost || '').toLowerCase()}`}>{recipe.cost || 'Medium'}</span>
                        </div>

                        <p className="ai-match">Match score: {Number.isFinite(recipe.matchPercentage) ? `${recipe.matchPercentage}%` : 'N/A'}</p>

                        <div className="ai-list-block">
                          <h4>Ingredients used</h4>
                          <ul>
                            {(recipe.usedIngredients || []).map((item) => (
                              <li key={`${recipe.name}-used-${item}`}>{item}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="ai-list-block">
                          <h4>Missing ingredients</h4>
                          {recipe.missingIngredients?.length ? (
                            <ul>
                              {recipe.missingIngredients.map((item) => (
                                <li key={`${recipe.name}-missing-${item}`}>{item}</li>
                              ))}
                            </ul>
                          ) : (
                            <p>Nothing missing. You can cook this now.</p>
                          )}
                        </div>

                        <div className="ai-list-block">
                          <h4>Cheap alternatives</h4>
                          {recipe.cheapAlternatives?.length ? (
                            <ul>
                              {recipe.cheapAlternatives.map((item) => (
                                <li key={`${recipe.name}-alt-${item}`}>{item}</li>
                              ))}
                            </ul>
                          ) : (
                            <p>No alternatives suggested.</p>
                          )}
                        </div>

                        <button type="button" className="card-button" onClick={() => addMissingToShoppingList(recipe)}>
                          Add missing items to shopping list
                        </button>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="shopping-list-panel">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Shopping list</p>
                  <h3>One-click list from missing ingredients</h3>
                </div>
                <button type="button" className="ghost-button" onClick={clearShoppingList} disabled={!shoppingList.length}>Clear list</button>
              </div>

              {shoppingList.length ? (
                <ul className="shopping-list">
                  {shoppingList.map((item) => (
                    <li key={`shop-${item}`}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p className="empty-state">Your shopping list is empty. Add missing ingredients from a suggested recipe.</p>
              )}
            </div>
          </section>

          <section id="popular" className="section-block">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Popular recipes of the week</p>
                <h2>Featured dishes</h2>
              </div>
              <button type="button" onClick={loadRecipes} disabled={recipesLoading}>
                {recipesLoading ? 'Loading...' : 'Refresh recipes'}
              </button>
            </div>

            <div className="popular-grid">
              {popularRecipes.map((recipe) => (
                <article className="popular-card" key={recipe.id}>
                  <img className="recipe-image popular-image" src={recipe.image} alt={recipe.name} onError={applyFallbackImage} />
                  <div className="popular-card-top" onClick={() => openRecipe(recipe)} role="button" tabIndex={0} onKeyDown={(event) => event.key === 'Enter' && openRecipe(recipe)}>
                    <p className="popular-week">Popular this week</p>
                    <h3>{recipe.name}</h3>
                    <p>{recipe.description}</p>
                    <span className={`food-badge ${recipe.foodCategory}`}>
                      <span className="pill-icon">{categoryMeta(recipe.foodCategory).icon}</span>
                      <span>{categoryMeta(recipe.foodCategory).label}</span>
                    </span>
                    <div className="meta-row">
                      <span>{recipe.category}</span>
                      <span>{recipe.like_count || 0} likes</span>
                    </div>
                  </div>
                  <button type="button" onClick={() => openRecipe(recipe)}>
                    Open recipe
                  </button>
                </article>
              ))}
            </div>
          </section>

          <section id="recipes" className="section-block">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Recipe library</p>
                <h2>Browse the cards</h2>
              </div>
              <div className="filter-bar">
                <div className="pill-group" role="tablist" aria-label="Recipe food category filter">
                  <button type="button" className={foodFilter === 'all' ? 'pill active' : 'pill'} onClick={() => setFoodFilter('all')}>
                    <span className="pill-icon">{categoryMeta('all').icon}</span>
                    <span>{categoryMeta('all').label}</span>
                  </button>
                  <button type="button" className={foodFilter === 'vegetarian' ? 'pill active' : 'pill'} onClick={() => setFoodFilter('vegetarian')}>
                    <span className="pill-icon">{categoryMeta('vegetarian').icon}</span>
                    <span>{categoryMeta('vegetarian').label}</span>
                  </button>
                  <button type="button" className={foodFilter === 'eggetarian' ? 'pill active' : 'pill'} onClick={() => setFoodFilter('eggetarian')}>
                    <span className="pill-icon">{categoryMeta('eggetarian').icon}</span>
                    <span>{categoryMeta('eggetarian').label}</span>
                  </button>
                  <button type="button" className={foodFilter === 'non-vegetarian' ? 'pill active' : 'pill'} onClick={() => setFoodFilter('non-vegetarian')}>
                    <span className="pill-icon">{categoryMeta('non-vegetarian').icon}</span>
                    <span>{categoryMeta('non-vegetarian').label}</span>
                  </button>
                </div>
                <input
                  className="search-bar"
                  type="search"
                  placeholder="Search recipes, ingredients, or steps"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            {recipesError ? <p className="error">{recipesError}</p> : null}

            <div className={`recipes-layout ${selectedRecipe ? '' : 'no-detail'}`}>
              <div className="recipe-grid">
                {filteredRecipes.map((recipe) => (
                  <article
                    className={`recipe-card ${selectedRecipe?.id === recipe.id ? 'selected' : ''}`}
                    key={recipe.id}
                    onClick={() => openRecipe(recipe)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(event) => event.key === 'Enter' && openRecipe(recipe)}
                  >
                    <img className="recipe-image" src={recipe.image} alt={recipe.name} onError={applyFallbackImage} />
                    <p className="recipe-label">Recipe card</p>
                    <h3>{recipe.name}</h3>
                    <p>{recipe.description}</p>
                    <span className={`food-badge ${recipe.foodCategory}`}>
                      <span className="pill-icon">{categoryMeta(recipe.foodCategory).icon}</span>
                      <span>{categoryMeta(recipe.foodCategory).label}</span>
                    </span>
                    <div className="meta-row">
                      <span>{recipe.category}</span>
                      <span>{recipe.like_count || 0} likes</span>
                    </div>
                  </article>
                ))}
                {filteredRecipes.length === 0 ? <p className="empty-state">No recipes match your search.</p> : null}
              </div>

              {selectedRecipe ? (
                <aside className="detail-panel">
                  <>
                    <p className="eyebrow">Recipe details</p>
                    <img className="detail-image" src={selectedRecipe.image} alt={selectedRecipe.name} onError={applyFallbackImage} />
                    <h3>{selectedRecipe.name}</h3>
                    <p>{selectedRecipe.description}</p>
                    <span className={`food-badge ${selectedRecipe.foodCategory}`}>
                      <span className="pill-icon">{categoryMeta(selectedRecipe.foodCategory).icon}</span>
                      <span>{categoryMeta(selectedRecipe.foodCategory).label}</span>
                    </span>

                    <div>
                      <h4>Ingredients</h4>
                      <ul className="detail-list">
                        {selectedRecipe.ingredients.map((ingredient, index) => (
                          <li key={`${selectedRecipe.id}-ingredient-${index}`}>{ingredient}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4>Making process</h4>
                      <ol className="detail-list steps-list">
                        {selectedRecipe.instructions.map((step, index) => (
                          <li key={`${selectedRecipe.id}-step-${index}`}>{step}</li>
                        ))}
                      </ol>
                    </div>

                    {canShare ? (
                      <form className="share-form compact-share" onSubmit={handleShareSubmit}>
                        <label>
                          Recipient email
                          <input
                            type="email"
                            value={shareForm.recipientEmail}
                            onChange={(e) => setShareForm((current) => ({ ...current, recipientEmail: e.target.value }))}
                            placeholder="friend@example.com"
                          />
                        </label>

                        <label>
                          Note
                          <textarea
                            rows="3"
                            value={shareForm.note}
                            onChange={(e) => setShareForm((current) => ({ ...current, note: e.target.value }))}
                            placeholder="Add a short note"
                          />
                        </label>

                        <button type="submit">Send recipe by email</button>
                        {shareMessage ? <p className="success">{shareMessage}</p> : null}
                        {shareError ? <p className="error">{shareError}</p> : null}
                      </form>
                    ) : null}
                  </>
                </aside>
              ) : null}
            </div>
          </section>

          <section id="auth" className="section-block auth-section">
            <div className="auth-panel">
              <div className="dashboard-header">
                <div>
                  <p className="eyebrow">Signed in</p>
                  <h2>{user.name || user.email}</h2>
                  <p>{user.email}</p>
                </div>
                <button type="button" onClick={logout}>Logout</button>
              </div>
            </div>
          </section>

          <footer className="site-footer">
            <div className="footer-brand">
              <span className="brand-mark">R</span>
              <div>
                <p className="brand-name">Recipica</p>
                <p className="brand-tag">Cook smarter. Waste less. Share more.</p>
              </div>
            </div>

            <div className="footer-links">
              <a href="#home">Home</a>
              <a href="#ai-finder">AI Finder</a>
              <a href="#popular">Popular</a>
              <a href="#recipes">Recipes</a>
            </div>

            <p className="footer-note">© {new Date().getFullYear()} Recipica. Built for delicious and budget-friendly cooking.</p>
          </footer>
        </>
      )}

      {!user ? (
        <footer className="site-footer guest-footer">
          <div className="footer-brand">
            <span className="brand-mark">R</span>
            <div>
              <p className="brand-name">Recipica</p>
              <p className="brand-tag">AI-powered recipe inspiration and smart shopping suggestions.</p>
            </div>
          </div>
          <p className="footer-note">Sign in to access recipe discovery, AI suggestions, and email sharing.</p>
        </footer>
      ) : null}
    </main>
  );
}
