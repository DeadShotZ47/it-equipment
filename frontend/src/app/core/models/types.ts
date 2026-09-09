export type Role = 'USER' | 'ADMIN';

export interface User {
  id: string;
  employeeId: string;
  email: string;
  fullName: string;
  department?: string;
  role: Role;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  _count?: {
    requests?: number;
  };
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  createdAt?: string;
  updatedAt?: string;
  _count?: {
    equipment: number;
  };
}

export type EquipmentStatus = 'AVAILABLE' | 'CHECKED_OUT' | 'MAINTENANCE' | 'RETIRED';

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

export type RequestType = 'CHECKOUT' | 'CONSUME';
export type RequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'RETURNED' | 'CANCELLED';

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
  approvedAt?: string;
  rejectedAt?: string;
  createdAt: string;
  updatedAt: string;
  requester: User;
  items: RequestItem[];
}

export interface DashboardStats {
  totalEquipment: number;
  totalFixedAssets: number;
  totalConsumables: number;
  checkedOut: number;
  available: number;
  maintenance: number;
  lowStock: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  returnedRequests: number;
}

export interface MonthlyTrend {
  month: string;
  total: number;
  approved: number;
  rejected: number;
  returned: number;
}

export interface CategoryStat {
  category_name: string;
  count: number;
}

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
