import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DashboardStats, MonthlyTrend, CategoryStat } from '../models/types';
import { environment } from '../../../environments/environment';

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
    const yr = year || new Date().getFullYear();
    return this.http.get<MonthlyTrend[]>(`${this.apiUrl}/monthly-trends?year=${yr}`);
  }

  getEquipmentByCategory(): Observable<CategoryStat[]> {
    return this.http.get<CategoryStat[]>(`${this.apiUrl}/by-category`);
  }
}
