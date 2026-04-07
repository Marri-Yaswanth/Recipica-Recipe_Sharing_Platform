import express from 'express';
import { recommendRecipesController } from '../controllers/recommendationController.js';

const router = express.Router();

router.post('/', recommendRecipesController);

export default router;
