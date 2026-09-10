import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DashboardStats, MonthlyTrend, CategoryStat } from '../models/dashboard.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = `${environment.apiUrl}/dashboard`;

  constructor(private http: HttpClient) {}

  getStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/stats`);
  }

  getMonthlyTrends(year?: number): Observable<MonthlyTrend[]> {
    let params = new HttpParams();
    if (year) params = params.set('year', String(year));
    return this.http.get<MonthlyTrend[]>(`${this.apiUrl}/monthly-trends`, { params });
  }

  getEquipmentByCategory(): Observable<CategoryStat[]> {
    return this.http.get<CategoryStat[]>(`${this.apiUrl}/by-category`);
  }
}
