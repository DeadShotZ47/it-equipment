import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from './sidebar/sidebar.component';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent],
  template: `
    <div class="flex h-screen overflow-hidden bg-slate-50">
      <!-- Left Sidebar -->
      <app-sidebar></app-sidebar>

      <!-- Main Content Area -->
      <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
        <!-- Top Navigation Bar -->
        <header class="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shadow-xs">
          <div class="flex items-center gap-3">
            <div class="flex items-center gap-2 text-sm text-slate-500">
              <span class="font-medium text-slate-800">ระบบบริหารจัดการและเบิกจ่ายอุปกรณ์ IT</span>
              <span>/</span>
              <span class="text-blue-600 font-medium">CheqIT Platform</span>
            </div>
          </div>

          <div class="flex items-center gap-4">
            <!-- Role indicator -->
            <div class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs">
              <span class="w-2 h-2 rounded-full" [ngClass]="auth.isAdmin() ? 'bg-indigo-500' : 'bg-emerald-500'"></span>
              <span class="font-medium text-slate-700">ผู้ใช้งาน:</span>
              <span class="font-semibold text-slate-900">{{ auth.currentUser()?.fullName }}</span>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold"
                    [ngClass]="auth.isAdmin() ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'">
                {{ auth.isAdmin() ? 'แอดมิน IT' : 'พนักงาน' }}
              </span>
            </div>

            <!-- Quick Request CTA for Users -->
            <a routerLink="/requests"
               class="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              ยื่นคำขอเบิกด่วน
            </a>
          </div>
        </header>

        <!-- Dynamic Main Outlet -->
        <main class="flex-1 overflow-y-auto p-6 bg-slate-50">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `
})
export class LayoutComponent {
  auth = inject(AuthService);
}
