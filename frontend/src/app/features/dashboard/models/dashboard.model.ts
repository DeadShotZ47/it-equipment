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
  label?: string;
  month?: string;
  day?: number;
  date?: string;
  total: number;
  approved: number;
  rejected: number;
  returned: number;
}

export interface TrendFilterOptions {
  mode: 'year' | 'month' | 'range';
  year?: number;
  month?: number;
  startDate?: string;
  endDate?: string;
}

export interface CategoryStat {
  category_name: string;
  count: number;
}
