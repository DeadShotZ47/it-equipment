import { User, Role } from '../../../shared/models/shared.model';

export type { User, Role };

export interface CreateUserDto {
  employeeId: string;
  email: string;
  password?: string;
  fullName: string;
  department?: string;
  role: Role;
  isActive?: boolean;
}

export interface UpdateUserDto {
  employeeId?: string;
  email?: string;
  password?: string;
  fullName?: string;
  department?: string;
  role?: Role;
  isActive?: boolean;
}

export interface UserListResponse {
  items: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
