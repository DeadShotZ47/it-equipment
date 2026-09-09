import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RequestRecord, RequestListResponse } from '../models/request.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RequestService {
  private apiUrl = `${environment.apiUrl}/requests`;

  constructor(private http: HttpClient) {}

  getRequests(filters?: { status?: string; type?: string; page?: number; limit?: number }): Observable<RequestListResponse> {
    let params = new HttpParams();
    if (filters) {
      if (filters.status) params = params.set('status', filters.status);
      if (filters.type) params = params.set('type', filters.type);
      if (filters.page) params = params.set('page', String(filters.page));
      if (filters.limit) params = params.set('limit', String(filters.limit));
    }
    return this.http.get<RequestListResponse>(this.apiUrl, { params });
  }

  getRequest(id: string): Observable<RequestRecord> {
    return this.http.get<RequestRecord>(`${this.apiUrl}/${id}`);
  }

  createRequest(data: { equipmentId: string; quantity: number; reason?: string }): Observable<RequestRecord> {
    return this.http.post<RequestRecord>(this.apiUrl, data);
  }

  approveRequest(id: string, adminNote?: string): Observable<RequestRecord> {
    return this.http.patch<RequestRecord>(`${this.apiUrl}/${id}/approve`, { adminNote });
  }

  rejectRequest(id: string, adminNote?: string): Observable<RequestRecord> {
    return this.http.patch<RequestRecord>(`${this.apiUrl}/${id}/reject`, { adminNote });
  }

  returnRequest(id: string): Observable<RequestRecord> {
    return this.http.patch<RequestRecord>(`${this.apiUrl}/${id}/return`, {});
  }

  confirmQrScan(qrCode: string, requestId?: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/qr-confirm`, { qrCode, requestId });
  }
}
