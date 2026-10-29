import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from './sidebar/sidebar.component';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent],
  template: `
    <div class="flex h-screen overflow-hidden bg-slate-50 relative">
      <!-- Left Sidebar (Responsive Mobile Drawer + Desktop Fixed) -->
      <app-sidebar [isOpen]="sidebarOpen()" (close)="closeSidebar()"></app-sidebar>

      <!-- Main Content Area -->
      <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
        <!-- Top Navigation Bar -->
        <header class="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 flex items-center justify-between shadow-xs z-10 shrink-0">
          <div class="flex items-center gap-3">
            <!-- Mobile Hamburger Button -->
            <button (click)="toggleSidebar()" type="button"
                    class="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    title="เปิดเมนู">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <!-- Brand / Title -->
            <div class="flex items-center gap-2 text-sm text-slate-500">
              <span class="font-medium text-slate-800 hidden md:inline">ระบบบริหารจัดการและเบิกจ่ายอุปกรณ์ IT</span>
              <span class="hidden md:inline">/</span>
              <span class="text-blue-600 font-bold">ReqIT</span>
            </div>
          </div>

          <div class="flex items-center gap-2.5 sm:gap-4">
            <!-- Role indicator -->
            <div class="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs">
              <span class="w-2 h-2 rounded-full shrink-0" [ngClass]="auth.isAdmin() ? 'bg-indigo-500' : 'bg-emerald-500'"></span>
              <span class="font-medium text-slate-700 hidden sm:inline">ผู้ใช้งาน:</span>
              <span class="font-semibold text-slate-900 truncate max-w-[100px] sm:max-w-none">{{ auth.currentUser()?.fullName }}</span>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0"
                    [ngClass]="auth.isAdmin() ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'">
                {{ auth.isAdmin() ? 'Admin' : 'User' }}
              </span>
            </div>

            <!-- Quick Request CTA for Users -->
            <a routerLink="/requests"
               class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition shrink-0">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              <span class="hidden sm:inline">ยื่นคำขอเบิกด่วน</span>
              <span class="sm:hidden">ขอเบิก</span>
            </a>
          </div>
        </header>

        <!-- Dynamic Main Outlet with responsive padding -->
        <main class="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `
})
export class LayoutComponent {
  auth = inject(AuthService);
  sidebarOpen = signal(false);

  toggleSidebar(): void {
    this.sidebarOpen.update(v => !v);
  }

  closeSidebar(): void {
    this.sidebarOpen.set(false);
  }
}
