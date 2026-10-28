import { RequestType, RequestStatus, User } from '../../../shared/models/shared.model';
import { Equipment } from '../../equipment/models/equipment.model';

export interface RequestItem {
  id: string;
  requestId: string;
  equipmentId: string;
  quantity: number;
  checkedOutAt?: string;
  returnedAt?: string;
  qrScannedAt?: string;
  equipment: Equipment;
}

export interface RequestRecord {
  id: string;
  requestNumber: string;
  requesterId: string;
  type: RequestType;
  status: RequestStatus;
  reason?: string;
  adminNote?: string;
  returnNote?: string;
  approvedAt?: string;
  rejectedAt?: string;
  returnRequestedAt?: string;
  createdAt: string;
  updatedAt: string;
  requester: User;
  items: RequestItem[];
}

export interface RequestListResponse {
  items: RequestRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
