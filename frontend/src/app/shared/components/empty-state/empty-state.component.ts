import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center justify-center">
      <div class="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-3xl mb-4 shadow-inner">
        {{ icon }}
      </div>
      <h3 class="text-sm font-bold text-slate-800">{{ title }}</h3>
      <p class="text-xs text-slate-400 mt-1 max-w-sm">{{ description }}</p>
      <button *ngIf="actionText" (click)="action.emit()"
              class="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition inline-flex items-center gap-2">
        {{ actionText }}
      </button>
    </div>
  `
})
export class EmptyStateComponent {
  @Input() icon = '📦';
  @Input() title = 'ไม่พบข้อมูล';
  @Input() description = 'ยังไม่มีข้อมูลในระบบ หรือไม่มีรายการที่ตรงกับเงื่อนไขการค้นหา';
  @Input() actionText?: string;
  @Output() action = new EventEmitter<void>();
}
