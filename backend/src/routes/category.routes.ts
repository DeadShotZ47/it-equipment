import { Router } from 'express';
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/category.controller.js';
import { authenticate, requireAdmin } from '../middleware/auth.middleware.js';

export const categoryRoutes = Router();

categoryRoutes.get('/', authenticate, getCategories);
categoryRoutes.get('/:id', authenticate, getCategoryById);
categoryRoutes.post('/', authenticate, requireAdmin, createCategory);
categoryRoutes.put('/:id', authenticate, requireAdmin, updateCategory);
categoryRoutes.delete('/:id', authenticate, requireAdmin, deleteCategory);
