import { Router } from 'express';
import { getHistory } from '../controllers/history.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

export const historyRoutes = Router();

historyRoutes.get('/', authenticate, getHistory);
