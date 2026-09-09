import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4">
      <div class="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100">
        <!-- Brand Header -->
        <div class="bg-gradient-to-r from-blue-700 to-indigo-800 p-8 text-white text-center">
          <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 mb-4 shadow-inner">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h1 class="text-2xl font-bold tracking-tight">ระบบเบิกจ่ายอุปกรณ์ IT</h1>
          <p class="text-blue-200 text-xs mt-1">CheqIT · จัดการคลังอุปกรณ์และสินทรัพย์ไอที</p>
        </div>

        <!-- Login Form -->
        <div class="p-8">
          <div *ngIf="errorMessage()" class="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <svg class="w-4 h-4 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{{ errorMessage() }}</span>
          </div>

          <form (ngSubmit)="onSubmit()" class="space-y-4">
            <div>
              <label class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">อีเมลผู้ใช้งาน (Email)</label>
              <input type="email" [(ngModel)]="email" name="email" required
                     placeholder="admin@company.com"
                     class="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" />
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">รหัสผ่าน (Password)</label>
              <input type="password" [(ngModel)]="password" name="password" required
                     placeholder="••••••••"
                     class="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" />
            </div>

            <button type="submit" [disabled]="loading()"
                    class="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-md shadow-blue-600/30 transition disabled:opacity-50 flex items-center justify-center gap-2">
              <span *ngIf="loading()" class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
              <span>{{ loading() ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ (Sign In)' }}</span>
            </button>
          </form>

          <!-- Fast Demo Login Buttons -->
          <div class="mt-6 pt-6 border-t border-slate-200">
            <p class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center mb-3">เข้าสู่ระบบทดสอบด่วน (Quick Demo Access)</p>
            <div class="grid grid-cols-2 gap-2">
              <button (click)="quickLogin('admin@company.com')" type="button"
                      class="px-3 py-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs font-medium transition text-center">
                🛡️ บัญชีแอดมิน IT
                <span class="block text-[10px] text-indigo-500 font-normal">IT Administrator</span>
              </button>
              <button (click)="quickLogin('somchai@company.com')" type="button"
                      class="px-3 py-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-medium transition text-center">
                👤 บัญชีพนักงาน
                <span class="block text-[10px] text-emerald-500 font-normal">สมชาย (วิศวกรซอฟต์แวร์)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  authService = inject(AuthService);
  router = inject(Router);

  email = '';
  password = '';
  loading = signal(false);
  errorMessage = signal<string | null>(null);

  quickLogin(demoEmail: string): void {
    this.email = demoEmail;
    this.password = 'password123';
    this.onSubmit();
  }

  onSubmit(): void {
    if (!this.email || !this.password) return;
    this.loading.set(true);
    this.errorMessage.set(null);

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.user.role === 'ADMIN') {
          this.router.navigate(['/dashboard']);
        } else {
          this.router.navigate(['/equipment']);
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err.error?.message || 'เข้าสู่ระบบไม่สำเร็จ โปรดตรวจสอบอีเมลและรหัสผ่าน');
      }
    });
  }
}
