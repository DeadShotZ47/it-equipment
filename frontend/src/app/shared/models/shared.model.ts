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

export type EquipmentStatus = 'AVAILABLE' | 'CHECKED_OUT' | 'MAINTENANCE' | 'RETIRED';
export type RequestType = 'CHECKOUT' | 'CONSUME';
export type RequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'RETURNED' | 'CANCELLED';
