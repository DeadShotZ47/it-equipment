import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import { EquipmentService } from '../../core/services/equipment.service';
import { CategoryService } from '../../core/services/category.service';
import { RequestService } from '../../core/services/request.service';
import { AuthService } from '../../core/services/auth.service';
import { Equipment, Category } from '../../core/models/types';

@Component({
  selector: 'app-equipment-list',
  standalone: true,
  imports: [CommonModule, FormsModule, AgGridAngular],
  template: `
    <div class="space-y-5">
      <!-- Top Title & Action Bar -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-slate-900 tracking-tight">คลังอุปกรณ์ IT (Equipment Inventory)</h1>
          <p class="text-xs text-slate-500 mt-1">
            จัดการคลังอุปกรณ์แบบไฮบริด (สินทรัพย์ถาวร & ของสิ้นเปลือง) · ขับเคลื่อนด้วย AG-Grid
          </p>
        </div>
        <div class="flex items-center gap-2.5">
          <button *ngIf="auth.isAdmin()" (click)="openAddModal()"
                  class="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm shadow-blue-600/20 transition">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            + เพิ่มอุปกรณ์ใหม่
          </button>
        </div>
      </div>

      <!-- Filter Bar -->
      <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-3">
        <!-- Search -->
        <div class="relative flex-1 min-w-[220px]">
          <span class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input type="text" [(ngModel)]="searchQuery" (input)="onFilterChange()"
                 placeholder="ค้นหาตามชื่ออุปกรณ์, ซีเรียล, สถานที่จัดเก็บ..."
                 class="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
        </div>

        <!-- Category Filter -->
        <select [(ngModel)]="selectedCategory" (change)="onFilterChange()"
                class="px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700">
          <option value="">ทุกหมวดหมู่</option>
          <option *ngFor="let cat of categories()" [value]="cat.id">{{ cat.name }}</option>
        </select>

        <!-- Type Filter (Fixed Asset vs Consumable) -->
        <select [(ngModel)]="selectedType" (change)="onFilterChange()"
                class="px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700">
          <option value="">ทุกประเภท (ไฮบริด)</option>
          <option value="false">สินทรัพย์ถาวร (ยืม-คืน)</option>
          <option value="true">ของสิ้นเปลือง (ตัดสต็อก)</option>
        </select>

        <!-- Status Filter -->
        <select [(ngModel)]="selectedStatus" (change)="onFilterChange()"
                class="px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700">
          <option value="">ทุกสถานะ</option>
          <option value="AVAILABLE">พร้อมใช้งาน (Available)</option>
          <option value="CHECKED_OUT">กำลังถูกยืม (Checked Out)</option>
          <option value="MAINTENANCE">ส่งซ่อมบำรุง (Maintenance)</option>
          <option value="RETIRED">เลิกใช้งาน (Retired)</option>
        </select>

        <!-- Reset Button -->
        <button (click)="resetFilters()"
                class="px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition">
          ล้างตัวกรอง
        </button>
      </div>

      <!-- AG-Grid Table Container with ample row height (no text clipping) -->
      <div class="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <ag-grid-angular
          style="width: 100%; height: 560px;"
          class="ag-theme-quartz"
          [rowData]="equipmentList()"
          [columnDefs]="colDefs"
          [pagination]="true"
          [paginationPageSize]="20"
          [paginationPageSizeSelector]="[10, 20, 50, 100]"
          [rowHeight]="58"
          [headerHeight]="44"
          (gridReady)="onGridReady($event)">
        </ag-grid-angular>
      </div>

      <!-- Legend -->
      <div class="flex flex-wrap items-center justify-between text-xs text-slate-500 px-2">
        <div class="flex items-center gap-4">
          <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> พร้อมใช้งาน</span>
          <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-blue-500"></span> กำลังถูกยืม</span>
          <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-amber-500"></span> ซ่อมบำรุง</span>
          <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-slate-400"></span> เลิกใช้งาน</span>
        </div>
        <p>แสดงข้อมูลทั้งหมด {{ equipmentList().length }} รายการ</p>
      </div>
    </div>

    <!-- ================= ADD / EDIT MODAL ================= -->
    <div *ngIf="showModal()" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div class="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div class="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <h3 class="text-sm font-bold tracking-wide">{{ isEditing() ? 'แก้ไขข้อมูลอุปกรณ์' : 'เพิ่มอุปกรณ์ใหม่เข้าคลัง' }}</h3>
          <button (click)="closeModal()" class="text-slate-400 hover:text-white transition">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <form (ngSubmit)="saveEquipment()" class="p-6 space-y-4">
          <!-- Hybrid Inventory Switch -->
          <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <span class="text-xs font-bold text-slate-800 block">พฤติกรรมการจัดการคลัง (Hybrid)</span>
              <p class="text-[11px] text-slate-500">
                {{ formIsConsumable ? 'ของสิ้นเปลือง: ตัดยอดสต็อกทันที (ไม่ต้องส่งคืน)' : 'สินทรัพย์ถาวร: บังคับระบุ Serial# และมีรอบยืม-คืน' }}
              </p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" [(ngModel)]="formIsConsumable" name="isConsumable" class="sr-only peer" (change)="onConsumableToggle()" />
              <div class="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <!-- Equipment Name -->
          <div>
            <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">ชื่ออุปกรณ์ *</label>
            <input type="text" [(ngModel)]="formName" name="name" required placeholder="เช่น MacBook Pro 16 นิ้ว หรือ สาย HDMI 2.1"
                   class="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
          </div>

          <!-- Category -->
          <div>
            <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">หมวดหมู่อุปกรณ์ *</label>
            <select [(ngModel)]="formCategoryId" name="categoryId" required
                    class="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white">
              <option value="" disabled>เลือกหมวดหมู่...</option>
              <option *ngFor="let cat of categories()" [value]="cat.id">{{ cat.name }}</option>
            </select>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <!-- Serial Number (Only if NOT consumable) -->
            <div *ngIf="!formIsConsumable">
              <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">หมายเลขซีเรียล (Serial Number) *</label>
              <input type="text" [(ngModel)]="formSerialNumber" name="serialNumber" [required]="!formIsConsumable" placeholder="เช่น C02DF123GJK4"
                     class="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono" />
            </div>

            <!-- Quantity (Only if Consumable) -->
            <div *ngIf="formIsConsumable">
              <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">จำนวนคงเหลือในสต็อก *</label>
              <input type="number" min="0" [(ngModel)]="formQuantity" name="quantity" required
                     class="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>

            <!-- Status -->
            <div>
              <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">สถานะอุปกรณ์</label>
              <select [(ngModel)]="formStatus" name="status"
                      class="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white">
                <option value="AVAILABLE">พร้อมใช้งาน (Available)</option>
                <option value="CHECKED_OUT">กำลังถูกยืม (Checked Out)</option>
                <option value="MAINTENANCE">ซ่อมบำรุง (Maintenance)</option>
                <option value="RETIRED">เลิกใช้งาน (Retired)</option>
              </select>
            </div>
          </div>

          <!-- Location -->
          <div>
            <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">สถานที่จัดเก็บ / ตู้เก็บของ</label>
            <input type="text" [(ngModel)]="formLocation" name="location" placeholder="เช่น ตู้เก็บอุปกรณ์ IT ชั้น A, ลิ้นชัก 2"
                   class="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
          </div>

          <!-- Description -->
          <div>
            <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">รายละเอียด / สเปกเพิ่มเติม</label>
            <textarea [(ngModel)]="formDescription" name="description" rows="2" placeholder="ระบุข้อมูลสเปก สภาพการใช้งาน หรือหมายเหตุ..."
                      class="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"></textarea>
          </div>

          <!-- Buttons -->
          <div class="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <button type="button" (click)="closeModal()" class="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition">ยกเลิก</button>
            <button type="submit" [disabled]="modalSaving()"
                    class="px-5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition disabled:opacity-50">
              {{ modalSaving() ? 'กำลังบันทึก...' : 'บันทึกข้อมูล' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- ================= QR CODE MODAL ================= -->
    <div *ngIf="showQrModal()" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div class="bg-white rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl border border-slate-100">
        <h3 class="text-base font-bold text-slate-900">QR Code ประจำอุปกรณ์</h3>
        <p class="text-xs text-slate-500 mt-1 mb-4">{{ qrEquipmentName }}</p>

        <div class="bg-slate-50 p-4 rounded-xl border border-slate-200 inline-block mb-4 shadow-inner">
          <img *ngIf="qrDataUrl" [src]="qrDataUrl" alt="QR Code" class="w-48 h-48 mx-auto" />
        </div>

        <p class="text-xs font-mono font-semibold text-slate-700 bg-slate-100 py-1 px-3 rounded-md mb-5 inline-block">
          {{ qrCodeValue }}
        </p>

        <div class="flex gap-2 justify-center">
          <button (click)="closeQrModal()" class="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg">ปิด</button>
          <button (click)="printQr()" class="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm">
            🖨️ พิมพ์ป้ายบาร์โค้ด
          </button>
        </div>
      </div>
    </div>

    <!-- ================= REQUEST CHECKOUT MODAL ================= -->
    <div *ngIf="showRequestModal()" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div class="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden">
        <div class="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <h3 class="text-sm font-bold">ยื่นคำขอเบิก/ยืมอุปกรณ์</h3>
          <button (click)="closeRequestModal()" class="text-slate-400 hover:text-white transition">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div class="p-6 space-y-4">
          <div class="p-3 rounded-lg bg-blue-50 border border-blue-100 text-blue-900 text-xs">
            <span class="font-semibold block text-blue-950 text-sm mb-0.5">{{ reqEquipment?.name }}</span>
            <span>หมวดหมู่: {{ reqEquipment?.category?.name }} · สถานที่เก็บ: {{ reqEquipment?.location || 'Storage' }}</span>
          </div>

          <div *ngIf="reqEquipment?.isConsumable">
            <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">
              จำนวนที่ต้องการเบิก (คงเหลือในสต็อก: {{ reqEquipment?.quantity }})
            </label>
            <input type="number" [(ngModel)]="reqQuantity" [max]="reqEquipment?.quantity || 1" min="1"
                   class="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">เหตุผลและวัตถุประสงค์ในการเบิก *</label>
            <textarea [(ngModel)]="reqReason" rows="3" placeholder="ระบุชื่องาน โปรเจกต์ หรือความจำเป็นในการใช้อุปกรณ์..."
                      class="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"></textarea>
          </div>

          <div class="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <button type="button" (click)="closeRequestModal()" class="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg">ยกเลิก</button>
            <button type="button" (click)="submitRequest()" [disabled]="requestSubmitting()"
                    class="px-5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition disabled:opacity-50">
              {{ requestSubmitting() ? 'กำลังส่งคำขอ...' : 'ส่งคำขอเบิก' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class EquipmentListComponent implements OnInit {
  auth = inject(AuthService);
  equipmentService = inject(EquipmentService);
  categoryService = inject(CategoryService);
  requestService = inject(RequestService);

  gridApi!: GridApi;
  equipmentList = signal<Equipment[]>([]);
  categories = signal<Category[]>([]);

  searchQuery = '';
  selectedCategory = '';
  selectedType = '';
  selectedStatus = '';

  // Add/Edit Modal
  showModal = signal(false);
  isEditing = signal(false);
  editingId: string | null = null;
  modalSaving = signal(false);

  formName = '';
  formCategoryId = '';
  formSerialNumber = '';
  formIsConsumable = false;
  formQuantity = 1;
  formStatus: any = 'AVAILABLE';
  formLocation = '';
  formDescription = '';

  // QR Modal
  showQrModal = signal(false);
  qrEquipmentName = '';
  qrCodeValue = '';
  qrDataUrl = '';

  // Request Modal
  showRequestModal = signal(false);
  reqEquipment: Equipment | null = null;
  reqQuantity = 1;
  reqReason = '';
  requestSubmitting = signal(false);

  colDefs: ColDef[] = [
    {
      headerName: 'ชื่ออุปกรณ์ (Item Name)',
      field: 'name',
      flex: 2.5,
      minWidth: 260,
      tooltipField: 'name',
      cellRenderer: (params: any) => {
        const item = params.data as Equipment;
        const icon = item.isConsumable ? '⚡' : '💻';
        return `
          <div class="flex items-center gap-3 h-full py-1">
            <span class="text-xl shrink-0">${icon}</span>
            <div class="min-w-0 flex-1 leading-normal">
              <span class="font-semibold text-slate-900 block truncate text-xs" title="${item.name}">${item.name}</span>
              <span class="text-[11px] text-slate-400 block truncate">${item.location || 'คลังอุปกรณ์'}</span>
            </div>
          </div>
        `;
      }
    },
    {
      headerName: 'หมวดหมู่',
      field: 'category.name',
      width: 140,
      cellRenderer: (params: any) => {
        return `<span class="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-medium">${params.value || '-'}</span>`;
      }
    },
    {
      headerName: 'ประเภทพฤติกรรม',
      field: 'isConsumable',
      width: 140,
      cellRenderer: (params: any) => {
        const isCons = params.value;
        return isCons
          ? `<span class="px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-[11px] font-semibold">ของสิ้นเปลือง</span>`
          : `<span class="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-semibold">สินทรัพย์ถาวร</span>`;
      }
    },
    {
      headerName: 'หมายเลขซีเรียล (SN)',
      field: 'serialNumber',
      width: 160,
      cellRenderer: (params: any) => {
        return params.value
          ? `<span class="font-mono text-xs text-slate-700 font-medium">${params.value}</span>`
          : `<span class="text-slate-400 text-xs">-</span>`;
      }
    },
    {
      headerName: 'จำนวนคงเหลือ',
      field: 'quantity',
      width: 140,
      cellRenderer: (params: any) => {
        const item = params.data as Equipment;
        if (item.isConsumable) {
          const isLow = item.quantity <= 5;
          const badgeClass = isLow ? 'bg-red-100 text-red-700 font-bold' : 'bg-slate-100 text-slate-700 font-medium';
          return `<span class="px-2 py-0.5 rounded-md text-xs ${badgeClass}">สต็อก ${item.quantity} ${isLow ? '⚠️' : ''}</span>`;
        }
        return `<span class="text-xs text-slate-600">1 ชิ้น</span>`;
      }
    },
    {
      headerName: 'สถานะ',
      field: 'status',
      width: 140,
      cellRenderer: (params: any) => {
        const status = params.value;
        let colorClass = 'bg-slate-100 text-slate-700';
        let label = status;

        if (status === 'AVAILABLE') {
          colorClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
          label = 'พร้อมใช้งาน';
        } else if (status === 'CHECKED_OUT') {
          colorClass = 'bg-blue-50 text-blue-700 border-blue-200';
          label = 'กำลังถูกยืม';
        } else if (status === 'MAINTENANCE') {
          colorClass = 'bg-amber-50 text-amber-700 border-amber-200';
          label = 'ส่งซ่อมบำรุง';
        } else if (status === 'RETIRED') {
          colorClass = 'bg-slate-100 text-slate-500 border-slate-200';
          label = 'เลิกใช้งาน';
        }

        return `<span class="px-2.5 py-1 rounded-full text-xs font-semibold border ${colorClass}">${label}</span>`;
      }
    },
    {
      headerName: 'การดำเนินการ',
      width: 190,
      sortable: false,
      filter: false,
      cellRenderer: (params: any) => {
        const item = params.data as Equipment;
        const isAdmin = this.auth.isAdmin();
        const canRequest = item.status === 'AVAILABLE' && (!item.isConsumable || item.quantity > 0);

        let buttons = `<div class="flex items-center gap-1.5 h-full">`;

        if (canRequest) {
          buttons += `<button data-action="request" class="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded text-xs font-medium transition">ขอเบิก</button>`;
        }

        if (isAdmin) {
          buttons += `
            <button data-action="qr" class="p-1 text-slate-500 hover:text-blue-600 rounded" title="ดู QR Code">📷</button>
            <button data-action="edit" class="p-1 text-slate-500 hover:text-indigo-600 rounded" title="แก้ไข">✏️</button>
            <button data-action="delete" class="p-1 text-slate-500 hover:text-red-600 rounded" title="ลบ">🗑️</button>
          `;
        }

        buttons += `</div>`;
        return buttons;
      },
      onCellClicked: (params: any) => {
        const target = (params.event.target as HTMLElement).closest('button');
        if (!target) return;
        const action = target.getAttribute('data-action');
        const item = params.data as Equipment;

        if (action === 'request') {
          this.openRequestModal(item);
        } else if (action === 'qr') {
          this.openQrModal(item);
        } else if (action === 'edit') {
          this.openEditModal(item);
        } else if (action === 'delete') {
          this.deleteItem(item);
        }
      }
    }
  ];

  ngOnInit(): void {
    this.loadCategories();
    this.loadEquipment();
  }

  onGridReady(params: GridReadyEvent): void {
    this.gridApi = params.api;
    this.gridApi.sizeColumnsToFit();
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (cats) => this.categories.set(cats)
    });
  }

  loadEquipment(): void {
    const filters: any = {};
    if (this.searchQuery) filters.search = this.searchQuery;
    if (this.selectedCategory) filters.categoryId = this.selectedCategory;
    if (this.selectedType !== '') filters.isConsumable = this.selectedType === 'true';
    if (this.selectedStatus) filters.status = this.selectedStatus;

    this.equipmentService.getEquipmentList(filters).subscribe({
      next: (res) => this.equipmentList.set(res.items)
    });
  }

  onFilterChange(): void {
    this.loadEquipment();
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.selectedCategory = '';
    this.selectedType = '';
    this.selectedStatus = '';
    this.loadEquipment();
  }

  onConsumableToggle(): void {
    if (this.formIsConsumable) {
      this.formSerialNumber = '';
      if (this.formQuantity < 1) this.formQuantity = 1;
    } else {
      this.formQuantity = 1;
    }
  }

  openAddModal(): void {
    this.isEditing.set(false);
    this.editingId = null;
    this.formName = '';
    this.formCategoryId = this.categories().length > 0 ? this.categories()[0].id : '';
    this.formSerialNumber = '';
    this.formIsConsumable = false;
    this.formQuantity = 1;
    this.formStatus = 'AVAILABLE';
    this.formLocation = '';
    this.formDescription = '';
    this.showModal.set(true);
  }

  openEditModal(item: Equipment): void {
    this.isEditing.set(true);
    this.editingId = item.id;
    this.formName = item.name;
    this.formCategoryId = item.categoryId;
    this.formSerialNumber = item.serialNumber || '';
    this.formIsConsumable = item.isConsumable;
    this.formQuantity = item.quantity;
    this.formStatus = item.status;
    this.formLocation = item.location || '';
    this.formDescription = item.description || '';
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  saveEquipment(): void {
    if (!this.formName || !this.formCategoryId) return;
    this.modalSaving.set(true);

    const payload: Partial<Equipment> = {
      name: this.formName,
      categoryId: this.formCategoryId,
      serialNumber: this.formIsConsumable ? null : this.formSerialNumber,
      isConsumable: this.formIsConsumable,
      quantity: this.formIsConsumable ? Number(this.formQuantity) : 1,
      status: this.formStatus,
      location: this.formLocation,
      description: this.formDescription
    };

    if (this.isEditing() && this.editingId) {
      this.equipmentService.updateEquipment(this.editingId, payload).subscribe({
        next: () => {
          this.modalSaving.set(false);
          this.closeModal();
          this.loadEquipment();
        },
        error: (err) => {
          this.modalSaving.set(false);
          alert(err.error?.message || 'เกิดข้อผิดพลาดในการแก้ไขข้อมูล');
        }
      });
    } else {
      this.equipmentService.createEquipment(payload).subscribe({
        next: () => {
          this.modalSaving.set(false);
          this.closeModal();
          this.loadEquipment();
        },
        error: (err) => {
          this.modalSaving.set(false);
          alert(err.error?.message || 'เกิดข้อผิดพลาดในการสร้างอุปกรณ์');
        }
      });
    }
  }

  deleteItem(item: Equipment): void {
    if (!confirm(`คุณต้องการลบ "${item.name}" ใช่หรือไม่?`)) return;
    this.equipmentService.deleteEquipment(item.id).subscribe({
      next: () => this.loadEquipment(),
      error: (err) => alert(err.error?.message || 'ไม่สามารถลบอุปกรณ์ได้')
    });
  }

  openQrModal(item: Equipment): void {
    this.qrEquipmentName = item.name;
    this.equipmentService.getEquipmentQr(item.id).subscribe({
      next: (res) => {
        this.qrCodeValue = res.qrCode;
        this.qrDataUrl = res.qrDataUrl;
        this.showQrModal.set(true);
      }
    });
  }

  closeQrModal(): void {
    this.showQrModal.set(false);
  }

  printQr(): void {
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(`
        <html>
          <head><title>พิมพ์ QR Code - ${this.qrEquipmentName}</title></head>
          <body style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh; font-family:sans-serif;">
            <h2 style="margin-bottom:4px;">${this.qrEquipmentName}</h2>
            <p style="font-family:monospace; margin-bottom:16px;">${this.qrCodeValue}</p>
            <img src="${this.qrDataUrl}" style="width:280px; height:280px;" />
            <script>window.print();</script>
          </body>
        </html>
      `);
      win.document.close();
    }
  }

  openRequestModal(item: Equipment): void {
    this.reqEquipment = item;
    this.reqQuantity = 1;
    this.reqReason = '';
    this.showRequestModal.set(true);
  }

  closeRequestModal(): void {
    this.showRequestModal.set(false);
  }

  submitRequest(): void {
    if (!this.reqEquipment || !this.reqReason) {
      alert('โปรดระบุเหตุผลในการเบิกอุปกรณ์');
      return;
    }

    this.requestSubmitting.set(true);
    this.requestService.createRequest({
      equipmentId: this.reqEquipment.id,
      quantity: this.reqEquipment.isConsumable ? Number(this.reqQuantity) : 1,
      reason: this.reqReason
    }).subscribe({
      next: () => {
        this.requestSubmitting.set(false);
        this.closeRequestModal();
        alert('ส่งคำขอเบิกเรียบร้อยแล้ว! อยู่ระหว่างรอการตรวจสอบจากเจ้าหน้าที่ IT');
        this.loadEquipment();
      },
      error: (err) => {
        this.requestSubmitting.set(false);
        alert(err.error?.message || 'ส่งคำขอเบิกไม่สำเร็จ');
      }
    });
  }
}
