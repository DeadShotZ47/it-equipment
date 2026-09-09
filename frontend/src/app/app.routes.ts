import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login.component';
import { LayoutComponent } from './layout/layout.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { EquipmentListComponent } from './features/equipment/equipment-list.component';
import { CategoryListComponent } from './features/categories/category-list.component';
import { RequestListComponent } from './features/requests/request-list.component';
import { HistoryListComponent } from './features/history/history-list.component';
import { QrScannerComponent } from './features/qr-scanner/qr-scanner.component';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent, canActivate: [adminGuard] },
      { path: 'equipment', component: EquipmentListComponent },
      { path: 'categories', component: CategoryListComponent, canActivate: [adminGuard] },
      { path: 'users', loadComponent: () => import('./features/users/user-list.component').then(m => m.UserListComponent), canActivate: [adminGuard] },
      { path: 'requests', component: RequestListComponent },
      { path: 'history', component: HistoryListComponent },
      // { path: 'qr-scanner', component: QrScannerComponent }, // ตัดออกชั่วคราว รอทำในอนาคต
      { path: '', redirectTo: 'equipment', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: 'equipment' }
];
