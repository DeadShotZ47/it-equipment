import { EquipmentStatus } from '../../../shared/models/shared.model';
import { Category } from '../../categories/models/category.model';

export interface Equipment {
  id: string;
  name: string;
  description?: string | null;
  categoryId: string;
  category?: Category;
  serialNumber?: string | null;
  isConsumable: boolean;
  quantity: number;
  status: EquipmentStatus;
  location?: string | null;
  imageUrl?: string | null;
  qrCode?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface EquipmentListResponse {
  items: Equipment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface EquipmentFilterParams {
  search?: string;
  categoryId?: string;
  status?: string;
  isConsumable?: boolean;
  page?: number;
  limit?: number;
}
