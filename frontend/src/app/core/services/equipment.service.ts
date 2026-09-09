import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Equipment } from '../models/types';
import { environment } from '../../../environments/environment';

export interface EquipmentListResponse {
  items: Equipment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable({
  providedIn: 'root'
})
export class EquipmentService {
  private apiUrl = `${environment.apiUrl}/equipment`;

  constructor(private http: HttpClient) {}

  getEquipmentList(filters?: {
    search?: string;
    categoryId?: string;
    status?: string;
    isConsumable?: boolean;
    page?: number;
    limit?: number;
  }): Observable<EquipmentListResponse> {
    let params = new HttpParams();
    if (filters) {
      if (filters.search) params = params.set('search', filters.search);
      if (filters.categoryId) params = params.set('categoryId', filters.categoryId);
      if (filters.status) params = params.set('status', filters.status);
      if (filters.isConsumable !== undefined) params = params.set('isConsumable', String(filters.isConsumable));
      if (filters.page) params = params.set('page', String(filters.page));
      if (filters.limit) params = params.set('limit', String(filters.limit));
    }
    return this.http.get<EquipmentListResponse>(this.apiUrl, { params });
  }

  getEquipment(id: string): Observable<Equipment> {
    return this.http.get<Equipment>(`${this.apiUrl}/${id}`);
  }

  getEquipmentQr(id: string): Observable<{ qrCode: string; qrDataUrl: string; equipment: Equipment }> {
    return this.http.get<{ qrCode: string; qrDataUrl: string; equipment: Equipment }>(`${this.apiUrl}/${id}/qr`);
  }

  createEquipment(data: Partial<Equipment>): Observable<Equipment> {
    return this.http.post<Equipment>(this.apiUrl, data);
  }

  updateEquipment(id: string, data: Partial<Equipment>): Observable<Equipment> {
    return this.http.put<Equipment>(`${this.apiUrl}/${id}`, data);
  }

  deleteEquipment(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }

  uploadImage(file: File): Observable<{ url: string; filename: string; size: number }> {
    const formData = new FormData();
    formData.append('image', file);
    const uploadApi = `${environment.apiUrl}/upload`;
    return this.http.post<{ url: string; filename: string; size: number }>(uploadApi, formData);
  }

  resolveImageUrl(url?: string | null): string {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
      return url;
    }
    const base = environment.apiUrl.replace(/\/api\/?$/, '');
    return `${base}${url.startsWith('/') ? '' : '/'}${url}`;
  }
}
