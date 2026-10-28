import { Component, EventEmitter, Input, Output, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

export interface RequestFilterParams {
  search: string;
  status: string;
  type: string;
}

@Component({
  selector: 'app-request-filter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs space-y-3">
      <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <!-- Search Input with Icon and Clear Button -->
        <div class="relative flex-1">
          <span class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input type="text" [(ngModel)]="search" (ngModelChange)="onSearchInput($event)"
                 placeholder="ค้นหาตามเลขที่คำขอ (REQ-...), ชื่อผู้ยื่น, อุปกรณ์, หรือซีเรียล..."
                 class="w-full pl-9 pr-8 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" />
          <button *ngIf="search" (click)="clearSearch()" type="button"
                  class="absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400 hover:text-slate-600 transition"
                  title="ล้างข้อความค้นหา">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Type Filter -->
        <div class="sm:w-56 shrink-0">
          <select [(ngModel)]="selectedType" (ngModelChange)="emitChange()"
                  class="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700">
            <option value="">ทุกประเภทคำขอ</option>
            <option value="CHECKOUT">ขอยืมสินทรัพย์ถาวร (ยืม-คืน)</option>
            <option value="CONSUME">ขอเบิกของสิ้นเปลือง (ตัดสต็อก)</option>
          </select>
        </div>
      </div>

      <!-- Status Filter Tabs -->
      <div class="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg text-xs overflow-x-auto">
        <button type="button" (click)="selectStatus('')"
                [class.bg-white]="selectedStatus === ''" [class.shadow-2xs]="selectedStatus === ''" [class.text-blue-700]="selectedStatus === ''" [class.font-semibold]="selectedStatus === ''"
                class="px-3 py-1.5 rounded-md text-slate-600 hover:text-slate-900 transition whitespace-nowrap">
          ทั้งหมด
        </button>
        <button type="button" (click)="selectStatus('PENDING')"
                [class.bg-white]="selectedStatus === 'PENDING'" [class.shadow-2xs]="selectedStatus === 'PENDING'" [class.text-amber-700]="selectedStatus === 'PENDING'" [class.font-semibold]="selectedStatus === 'PENDING'"
                class="px-3 py-1.5 rounded-md text-slate-600 hover:text-slate-900 transition whitespace-nowrap">
          รออนุมัติ
        </button>
        <button type="button" (click)="selectStatus('APPROVED')"
                [class.bg-white]="selectedStatus === 'APPROVED'" [class.shadow-2xs]="selectedStatus === 'APPROVED'" [class.text-emerald-700]="selectedStatus === 'APPROVED'" [class.font-semibold]="selectedStatus === 'APPROVED'"
                class="px-3 py-1.5 rounded-md text-slate-600 hover:text-slate-900 transition whitespace-nowrap">
          อนุมัติแล้ว
        </button>
        <button type="button" (click)="selectStatus('RETURNED')"
                [class.bg-white]="selectedStatus === 'RETURNED'" [class.shadow-2xs]="selectedStatus === 'RETURNED'" [class.text-blue-700]="selectedStatus === 'RETURNED'" [class.font-semibold]="selectedStatus === 'RETURNED'"
                class="px-3 py-1.5 rounded-md text-slate-600 hover:text-slate-900 transition whitespace-nowrap">
          ส่งคืนแล้ว
        </button>
        <button type="button" (click)="selectStatus('REJECTED')"
                [class.bg-white]="selectedStatus === 'REJECTED'" [class.shadow-2xs]="selectedStatus === 'REJECTED'" [class.text-rose-700]="selectedStatus === 'REJECTED'" [class.font-semibold]="selectedStatus === 'REJECTED'"
                class="px-3 py-1.5 rounded-md text-slate-600 hover:text-slate-900 transition whitespace-nowrap">
          ปฏิเสธ
        </button>

        <!-- Reset Button if filtered -->
        <button *ngIf="hasActiveFilter" type="button" (click)="resetFilters()"
                class="ml-auto px-2.5 py-1 text-[11px] font-medium text-slate-500 hover:text-slate-800 transition whitespace-nowrap">
          ✕ ล้างตัวกรอง
        </button>
      </div>
    </div>
  `
})
export class RequestFilterComponent implements OnInit, OnDestroy {
  @Input() search = '';
  @Input() selectedStatus = '';
  @Input() selectedType = '';

  @Output() filterChange = new EventEmitter<RequestFilterParams>();
  @Output() statusChange = new EventEmitter<string>();

  private searchSubject = new Subject<string>();
  private sub?: Subscription;

  get hasActiveFilter(): boolean {
    return !!(this.search || this.selectedStatus || this.selectedType);
  }

  ngOnInit(): void {
    this.sub = this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      this.emitChange();
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  onSearchInput(val: string): void {
    this.searchSubject.next(val);
  }

  clearSearch(): void {
    this.search = '';
    this.emitChange();
  }

  selectStatus(status: string): void {
    this.selectedStatus = status;
    this.statusChange.emit(status);
    this.emitChange();
  }

  resetFilters(): void {
    this.search = '';
    this.selectedStatus = '';
    this.selectedType = '';
    this.statusChange.emit('');
    this.emitChange();
  }

  emitChange(): void {
    this.filterChange.emit({
      search: this.search.trim(),
      status: this.selectedStatus,
      type: this.selectedType
    });
  }
}
