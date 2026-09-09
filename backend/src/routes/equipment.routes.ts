import { Router } from 'express';
import {
  getEquipmentList,
  getEquipmentById,
  createEquipment,
  updateEquipment,
  deleteEquipment,
  getEquipmentQr
} from '../controllers/equipment.controller.js';
import { authenticate, requireAdmin } from '../middleware/auth.middleware.js';

export const equipmentRoutes = Router();

equipmentRoutes.get('/', authenticate, getEquipmentList);
equipmentRoutes.get('/:id', authenticate, getEquipmentById);
equipmentRoutes.get('/:id/qr', authenticate, requireAdmin, getEquipmentQr);
equipmentRoutes.post('/', authenticate, requireAdmin, createEquipment);
equipmentRoutes.put('/:id', authenticate, requireAdmin, updateEquipment);
equipmentRoutes.delete('/:id', authenticate, requireAdmin, deleteEquipment);
