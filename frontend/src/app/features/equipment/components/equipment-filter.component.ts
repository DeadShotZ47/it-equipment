import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Category } from '../../categories/models/category.model';
import { EquipmentFilterParams } from '../models/equipment.model';

@Component({
  selector: 'app-equipment-filter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-3">
      <!-- Search Input -->
      <div class="relative flex-1 min-w-[220px]">
        <span class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </span>
        <input type="text" [(ngModel)]="search" (ngModelChange)="onFilterChange()"
               placeholder="ค้นหาตามชื่ออุปกรณ์, ซีเรียล, สถานที่จัดเก็บ..."
               class="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
      </div>

      <!-- Category Filter -->
      <select [(ngModel)]="categoryId" (ngModelChange)="onFilterChange()"
              class="px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700">
        <option value="">ทุกหมวดหมู่</option>
        <option *ngFor="let cat of categories" [value]="cat.id">{{ cat.name }}</option>
      </select>

      <!-- Type Filter (Fixed Asset vs Consumable) -->
      <select [(ngModel)]="isConsumableStr" (ngModelChange)="onFilterChange()"
              class="px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700">
        <option value="">ทุกประเภท (ไฮบริด)</option>
        <option value="false">สินทรัพย์ถาวร (ยืม-คืน)</option>
        <option value="true">ของสิ้นเปลือง (ตัดสต็อก)</option>
      </select>

      <!-- Status Filter -->
      <select [(ngModel)]="status" (ngModelChange)="onFilterChange()"
              class="px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700">
        <option value="">ทุกสถานะ</option>
        <option value="AVAILABLE">พร้อมใช้งาน (Available)</option>
        <option value="CHECKED_OUT">กำลังถูกยืม (Checked Out)</option>
        <option value="MAINTENANCE">ส่งซ่อมบำรุง (Maintenance)</option>
        <option value="RETIRED">เลิกใช้งาน (Retired)</option>
      </select>

      <!-- Reset Button -->
      <button type="button" (click)="resetFilters()"
              class="px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition">
        ล้างตัวกรอง
      </button>
    </div>
  `
})
export class EquipmentFilterComponent {
  @Input() categories: Category[] = [];
  @Output() filterChange = new EventEmitter<EquipmentFilterParams>();

  search = '';
  categoryId = '';
  isConsumableStr = '';
  status = '';

  onFilterChange() {
    const params: EquipmentFilterParams = {};
    if (this.search) params.search = this.search;
    if (this.categoryId) params.categoryId = this.categoryId;
    if (this.isConsumableStr !== '') params.isConsumable = this.isConsumableStr === 'true';
    if (this.status) params.status = this.status;

    this.filterChange.emit(params);
  }

  resetFilters() {
    this.search = '';
    this.categoryId = '';
    this.isConsumableStr = '';
    this.status = '';
    this.filterChange.emit({});
  }
}
