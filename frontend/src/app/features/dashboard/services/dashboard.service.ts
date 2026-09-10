import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DashboardStats, MonthlyTrend, CategoryStat, TrendFilterOptions } from '../models/dashboard.model';
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

  getMonthlyTrends(options?: number | TrendFilterOptions): Observable<MonthlyTrend[]> {
    let params = new HttpParams();
    if (typeof options === 'number') {
      params = params.set('mode', 'year').set('year', String(options));
    } else if (options) {
      if (options.mode) params = params.set('mode', options.mode);
      if (options.year) params = params.set('year', String(options.year));
      if (options.month) params = params.set('month', String(options.month));
      if (options.startDate) params = params.set('startDate', options.startDate);
      if (options.endDate) params = params.set('endDate', options.endDate);
    }
    return this.http.get<MonthlyTrend[]>(`${this.apiUrl}/monthly-trends`, { params });
  }

  getEquipmentByCategory(): Observable<CategoryStat[]> {
    return this.http.get<CategoryStat[]>(`${this.apiUrl}/by-category`);
  }
}
