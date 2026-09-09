import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Equipment, EquipmentListResponse, EquipmentFilterParams } from '../models/equipment.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EquipmentService {
  private apiUrl = `${environment.apiUrl}/equipment`;

  constructor(private http: HttpClient) {}

  getEquipmentList(filters?: EquipmentFilterParams): Observable<EquipmentListResponse> {
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

  getDefaultImage(item: Equipment | null): string {
    if (!item) return 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=120&q=80';
    const catName = item.category?.name?.toLowerCase() || '';
    const name = item.name.toLowerCase();
    if (name.includes('macbook') || name.includes('apple')) return 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=120&q=80';
    if (name.includes('thinkpad') || catName.includes('laptop')) return 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=120&q=80';
    if (name.includes('monitor') || catName.includes('monitor')) return 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=120&q=80';
    if (name.includes('mouse') || name.includes('keyboard') || catName.includes('periph')) return 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=120&q=80';
    if (name.includes('switch') || name.includes('wifi') || catName.includes('network')) return 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=120&q=80';
    if (name.includes('cable') || name.includes('adapter') || item.isConsumable) return 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=120&q=80';
    return 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=120&q=80';
  }

  getEquipmentImageUrl(item: Equipment | null): string {
    if (!item) return this.getDefaultImage(null);
    return this.resolveImageUrl(item.imageUrl) || this.getDefaultImage(item);
  }
}
