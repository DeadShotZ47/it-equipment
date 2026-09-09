import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, Role } from '../models/types';
import { environment } from '../../../environments/environment';

export interface UserListResponse {
  items: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateUserDto {
  fullName: string;
  email: string;
  password: string;
  employeeId?: string;
  department?: string;
  role?: Role;
  isActive?: boolean;
}

export interface UpdateUserDto {
  fullName?: string;
  email?: string;
  password?: string;
  employeeId?: string;
  department?: string;
  role?: Role;
  isActive?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  getUsers(filters?: { search?: string; role?: string; status?: string; page?: number; limit?: number }): Observable<UserListResponse> {
    let params = new HttpParams();
    if (filters) {
      if (filters.search) params = params.set('search', filters.search);
      if (filters.role) params = params.set('role', filters.role);
      if (filters.status) params = params.set('status', filters.status);
      if (filters.page) params = params.set('page', filters.page.toString());
      if (filters.limit) params = params.set('limit', filters.limit.toString());
    }
    return this.http.get<UserListResponse>(this.apiUrl, { params });
  }

  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  createUser(data: CreateUserDto): Observable<User> {
    return this.http.post<User>(this.apiUrl, data);
  }

  updateUser(id: string, data: UpdateUserDto): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, data);
  }

  deleteUser(id: string): Observable<{ message: string; deleted?: boolean; deactivated?: boolean }> {
    return this.http.delete<{ message: string; deleted?: boolean; deactivated?: boolean }>(`${this.apiUrl}/${id}`);
  }
}
