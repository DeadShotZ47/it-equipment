import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-request-filter',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center gap-1.5 p-1 bg-white border border-slate-200 rounded-lg shadow-xs text-xs overflow-x-auto">
      <button (click)="select('')" [class.bg-blue-600]="selectedStatus === ''" [class.text-white]="selectedStatus === ''"
              class="px-3 py-1.5 rounded-md font-medium text-slate-600 hover:text-slate-900 transition whitespace-nowrap">ทั้งหมด</button>
      <button (click)="select('PENDING')" [class.bg-amber-500]="selectedStatus === 'PENDING'" [class.text-white]="selectedStatus === 'PENDING'"
              class="px-3 py-1.5 rounded-md font-medium text-slate-600 hover:text-slate-900 transition whitespace-nowrap">รออนุมัติ</button>
      <button (click)="select('APPROVED')" [class.bg-emerald-600]="selectedStatus === 'APPROVED'" [class.text-white]="selectedStatus === 'APPROVED'"
              class="px-3 py-1.5 rounded-md font-medium text-slate-600 hover:text-slate-900 transition whitespace-nowrap">อนุมัติแล้ว</button>
      <button (click)="select('RETURNED')" [class.bg-blue-600]="selectedStatus === 'RETURNED'" [class.text-white]="selectedStatus === 'RETURNED'"
              class="px-3 py-1.5 rounded-md font-medium text-slate-600 hover:text-slate-900 transition whitespace-nowrap">ส่งคืนแล้ว</button>
      <button (click)="select('REJECTED')" [class.bg-rose-600]="selectedStatus === 'REJECTED'" [class.text-white]="selectedStatus === 'REJECTED'"
              class="px-3 py-1.5 rounded-md font-medium text-slate-600 hover:text-slate-900 transition whitespace-nowrap">ปฏิเสธ</button>
    </div>
  `
})
export class RequestFilterComponent {
  @Input() selectedStatus = '';
  @Output() statusChange = new EventEmitter<string>();

  select(status: string) {
    this.selectedStatus = status;
    this.statusChange.emit(status);
  }
}
