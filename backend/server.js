import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";

import passport from "./config/passport.js";

// routes
import authRoutes from "./routes/auth.js";
import recipeRoutes from "./routes/recipes.js";
import userRoutes from "./routes/users.js";
import likesRoutes from "./routes/likes.js";
import followsRoutes from "./routes/follows.js";
import recommendationRoutes from "./routes/recommendation.js";

// 👇 METRICS IMPORT (IMPORTANT FIX)
import {
  metricsMiddleware,
  exposeMetricsEndpoint,
} from "./metrics.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

/**
 * Middlewares
 */
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(passport.initialize());

/**
 * 🔥 IMPORTANT: metrics middleware MUST be before routes
 */
app.use(metricsMiddleware);

/**
 * Routes
 */
app.use("/api/auth", authRoutes);
app.use("/api/recipes", recipeRoutes);
app.use("/api/users", userRoutes);
app.use("/api/likes", likesRoutes);
app.use("/api/follows", followsRoutes);
app.use("/api/recommend-recipes", recommendationRoutes);

/**
 * Health check
 */
app.get("/api/health", (req, res) => {
  res.json({ message: "Server is running!" });
});

/**
 * Metrics endpoint
 */
exposeMetricsEndpoint(app);

/**
 * Start server
 */
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Metrics available at /metrics`);
});

export default app;