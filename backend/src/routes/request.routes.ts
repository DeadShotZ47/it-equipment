import { Router } from 'express';
import {
  getRequests,
  getRequestById,
  createRequest,
  approveRequest,
  rejectRequest,
  returnRequest,
  confirmQrScan
} from '../controllers/request.controller.js';
import { authenticate, requireAdmin } from '../middleware/auth.middleware.js';

export const requestRoutes = Router();

requestRoutes.get('/', authenticate, getRequests);
requestRoutes.get('/:id', authenticate, getRequestById);
requestRoutes.post('/', authenticate, createRequest);
requestRoutes.patch('/:id/approve', authenticate, requireAdmin, approveRequest);
requestRoutes.patch('/:id/reject', authenticate, requireAdmin, rejectRequest);
requestRoutes.patch('/:id/return', authenticate, returnRequest);
requestRoutes.post('/qr-confirm', authenticate, confirmQrScan);
