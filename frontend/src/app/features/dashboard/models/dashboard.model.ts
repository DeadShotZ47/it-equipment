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
  month: string;
  total: number;
  approved: number;
  rejected: number;
  returned: number;
}

export interface CategoryStat {
  category_name: string;
  count: number;
}
