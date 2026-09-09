import { RequestType, RequestStatus } from '../../../shared/models/shared.model';

export interface HistoryRow {
  id: string;
  requestId: string;
  requestNumber: string;
  requestType: RequestType;
  status: RequestStatus;
  createdAt: string;
  approvedAt?: string;
  rejectedAt?: string;
  returnedAt?: string;
  checkedOutAt?: string;
  requesterName: string;
  requesterEmail: string;
  department?: string;
  equipmentName: string;
  categoryName?: string;
  serialNumber: string;
  isConsumable: boolean;
  quantity: number;
  adminNote?: string;
  reason?: string;
}

export interface HistoryListResponse {
  items: HistoryRow[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
