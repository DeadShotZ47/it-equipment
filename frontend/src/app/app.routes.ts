import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent)
  },
  {
    path: '',
    loadComponent: () => import('./layout/layout.component').then(m => m.LayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/pages/dashboard-page.component').then(m => m.DashboardPageComponent),
        canActivate: [adminGuard]
      },
      {
        path: 'equipment',
        loadComponent: () => import('./features/equipment/pages/equipment-page.component').then(m => m.EquipmentPageComponent)
      },
      {
        path: 'categories',
        loadComponent: () => import('./features/categories/pages/category-page.component').then(m => m.CategoryPageComponent),
        canActivate: [adminGuard]
      },
      {
        path: 'users',
        loadComponent: () => import('./features/users/pages/user-page.component').then(m => m.UserPageComponent),
        canActivate: [adminGuard]
      },
      {
        path: 'requests',
        loadComponent: () => import('./features/requests/pages/request-page.component').then(m => m.RequestPageComponent)
      },
      {
        path: 'history',
        loadComponent: () => import('./features/history/pages/history-page.component').then(m => m.HistoryPageComponent)
      },
      { path: '', redirectTo: 'equipment', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: 'equipment' }
];
