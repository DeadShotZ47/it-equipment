import { Router } from 'express';
import {
  getDashboardStats,
  getMonthlyTrends,
  getEquipmentByCategory
} from '../controllers/dashboard.controller.js';
import { authenticate, requireAdmin } from '../middleware/auth.middleware.js';

export const dashboardRoutes = Router();

dashboardRoutes.get('/stats', authenticate, requireAdmin, getDashboardStats);
dashboardRoutes.get('/monthly-trends', authenticate, requireAdmin, getMonthlyTrends);
dashboardRoutes.get('/by-category', authenticate, requireAdmin, getEquipmentByCategory);
