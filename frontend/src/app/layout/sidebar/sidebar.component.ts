import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen border-r border-slate-800 select-none">
      <!-- Brand / Logo -->
      <div class="h-16 flex items-center px-6 border-b border-slate-800 gap-3">
        <div class="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <div>
          <span class="text-white font-semibold text-base tracking-wide flex items-center gap-1.5">
            ReqIT
            <span class="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400">Hub</span>
          </span>
          <p class="text-[11px] text-slate-400 leading-tight">ระบบเบิกจ่ายอุปกรณ์ IT</p>
        </div>
      </div>

      <!-- Navigation Links -->
      <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <!-- Admin Dashboard -->
        <a *ngIf="auth.isAdmin()"
           routerLink="/dashboard"
           routerLinkActive="bg-blue-600 text-white shadow-md shadow-blue-600/30"
           class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800/80 hover:text-white transition group">
          <svg class="w-5 h-5 text-slate-400 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          แดชบอร์ดสรุปผล
        </a>

        <!-- Equipment Inventory -->
        <a routerLink="/equipment"
           routerLinkActive="bg-blue-600 text-white shadow-md shadow-blue-600/30"
           class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800/80 hover:text-white transition group">
          <svg class="w-5 h-5 text-slate-400 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          คลังอุปกรณ์ IT
        </a>

        <!-- Categories (Admin Only) -->
        <a *ngIf="auth.isAdmin()"
           routerLink="/categories"
           routerLinkActive="bg-blue-600 text-white shadow-md shadow-blue-600/30"
           class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800/80 hover:text-white transition group">
          <svg class="w-5 h-5 text-slate-400 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          หมวดหมู่อุปกรณ์
        </a>

        <!-- Requests -->
        <a routerLink="/requests"
           routerLinkActive="bg-blue-600 text-white shadow-md shadow-blue-600/30"
           class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800/80 hover:text-white transition group">
          <svg class="w-5 h-5 text-slate-400 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          คำขอเบิก & อนุมัติ
        </a>

        <!-- History & Audits -->
        <a routerLink="/history"
           routerLinkActive="bg-blue-600 text-white shadow-md shadow-blue-600/30"
           class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800/80 hover:text-white transition group">
          <svg class="w-5 h-5 text-slate-400 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          ประวัติการเบิก-คืน
        </a>
      </nav>

      <!-- User Profile & Logout -->
      <div class="p-3 border-t border-slate-800 bg-slate-950/40">
        <div class="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-900 border border-slate-800">
          <div class="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-semibold text-white text-xs">
            {{ (auth.currentUser()?.fullName || 'U').charAt(0) }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-xs font-medium text-white truncate">{{ auth.currentUser()?.fullName }}</p>
            <div class="flex items-center gap-1.5 mt-0.5">
              <span [ngClass]="auth.isAdmin() ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'"
                    class="text-[10px] font-semibold uppercase px-1.5 py-0.2 rounded border">
                {{ auth.isAdmin() ? 'ผู้ดูแลระบบ IT' : 'พนักงานทั่วไป' }}
              </span>
              <span class="text-[10px] text-slate-400 truncate">{{ auth.currentUser()?.department || 'IT' }}</span>
            </div>
          </div>
          <button (click)="auth.logout()" title="ออกจากระบบ" class="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  `
})
export class SidebarComponent {
  auth = inject(AuthService);
}
