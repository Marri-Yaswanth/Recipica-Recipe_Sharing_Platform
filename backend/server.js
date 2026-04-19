import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import passport from './config/passport.js';
import client from 'prom-client'; // ✅ Prometheus
import { metricsMiddleware, metricsEndpoint } from './metrics.js';

// Import routes
import authRoutes from './routes/auth.js';
import recipeRoutes from './routes/recipes.js';
import userRoutes from './routes/users.js';
import likesRoutes from './routes/likes.js';
import followsRoutes from './routes/follows.js';
import recommendationRoutes from './routes/recommendation.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Initialize Prometheus metrics
client.collectDefaultMetrics();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(passport.initialize());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/users', userRoutes);
app.use('/api/likes', likesRoutes);
app.use('/api/follows', followsRoutes);
app.use('/api/recommend-recipes', recommendationRoutes);
app.use(metricsMiddleware);
app.use('/api/auth', authRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ message: 'Server is running!' });
});

// ✅ Prometheus Metrics Endpoint
app.get('/metrics', async (req, res) => {
    res.set('Content-Type', client.register.contentType);
    res.end(await client.register.metrics());
});

app.get('/metrics', metricsEndpoint);

// Serve static files in production
// if (process.env.NODE_ENV === 'production') {
//     const clientBuildPath = path.join(__dirname, '..', 'frontend', 'build');

//     app.use(express.static(clientBuildPath));

//     app.get('*', (req, res) => {
//         res.sendFile(path.join(clientBuildPath, 'index.html'));
//     });
// }

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;