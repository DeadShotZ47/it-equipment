import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div class="bg-white rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
        <!-- Icon -->
        <div [ngClass]="iconBgClass" class="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg *ngIf="type === 'danger'" class="w-6 h-6 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <svg *ngIf="type === 'warning'" class="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <svg *ngIf="type === 'info' || type === 'success'" class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <h3 class="text-base font-bold text-slate-900 mb-1">{{ title }}</h3>
        <p class="text-xs text-slate-500 mb-6 leading-relaxed">{{ message }}</p>

        <div class="flex items-center justify-center gap-3">
          <button type="button" (click)="cancel.emit()"
                  class="flex-1 px-4 py-2.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition">
            {{ cancelText }}
          </button>
          <button type="button" (click)="confirm.emit()" [disabled]="isLoading"
                  [ngClass]="confirmBtnClass"
                  class="flex-1 px-4 py-2.5 text-xs font-semibold text-white rounded-xl shadow-sm transition disabled:opacity-50">
            {{ isLoading ? 'กำลังดำเนินการ...' : confirmText }}
          </button>
        </div>
      </div>
    </div>
  `
})
export class ConfirmDialogComponent {
  @Input() isOpen = false;
  @Input() title = 'ยืนยันการทำรายการ';
  @Input() message = 'คุณแน่ใจหรือไม่ว่าต้องการดำเนินการต่อ?';
  @Input() confirmText = 'ยืนยัน';
  @Input() cancelText = 'ยกเลิก';
  @Input() type: 'danger' | 'warning' | 'info' | 'success' = 'danger';
  @Input() isLoading = false;

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  get iconBgClass(): string {
    switch (this.type) {
      case 'danger': return 'bg-rose-50';
      case 'warning': return 'bg-amber-50';
      case 'success': return 'bg-emerald-50';
      default: return 'bg-blue-50';
    }
  }

  get confirmBtnClass(): string {
    switch (this.type) {
      case 'danger': return 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20';
      case 'warning': return 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20';
      case 'success': return 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20';
      default: return 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20';
    }
  }
}
