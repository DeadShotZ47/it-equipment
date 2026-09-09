import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import { Equipment } from '../models/equipment.model';
import { EquipmentService } from '../services/equipment.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-equipment-table',
  standalone: true,
  imports: [CommonModule, AgGridAngular],
  template: `
    <div class="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      <ag-grid-angular
        style="width: 100%; height: 560px;"
        class="ag-theme-quartz"
        [rowData]="equipmentList"
        [columnDefs]="colDefs"
        [pagination]="true"
        [paginationPageSize]="20"
        [paginationPageSizeSelector]="[10, 20, 50, 100]"
        [rowHeight]="58"
        [headerHeight]="44"
        (gridReady)="onGridReady($event)">
      </ag-grid-angular>
    </div>

    <!-- Table Legend / Count -->
    <div class="flex flex-wrap items-center justify-between text-xs text-slate-500 px-2 mt-3">
      <div class="flex items-center gap-4">
        <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> พร้อมใช้งาน</span>
        <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-blue-500"></span> กำลังถูกยืม</span>
        <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-amber-500"></span> ซ่อมบำรุง</span>
        <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-slate-400"></span> เลิกใช้งาน</span>
      </div>
      <p>แสดงข้อมูลทั้งหมด {{ equipmentList.length }} รายการ</p>
    </div>
  `
})
export class EquipmentTableComponent {
  auth = inject(AuthService);
  equipmentService = inject(EquipmentService);

  @Input() equipmentList: Equipment[] = [];
  @Output() onRequest = new EventEmitter<Equipment>();
  @Output() onQr = new EventEmitter<Equipment>();
  @Output() onEdit = new EventEmitter<Equipment>();
  @Output() onDelete = new EventEmitter<Equipment>();

  gridApi!: GridApi;

  colDefs: ColDef[] = [
    {
      headerName: 'ชื่ออุปกรณ์ (Item Name)',
      field: 'name',
      flex: 2.5,
      minWidth: 260,
      tooltipField: 'name',
      cellRenderer: (params: any) => {
        const item = params.data as Equipment;
        const imgUrl = this.equipmentService.getEquipmentImageUrl(item);
        return `
          <div class="flex items-center gap-3 h-full py-1">
            <div class="w-10 h-10 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 shrink-0 flex items-center justify-center shadow-2xs">
              <img src="${imgUrl}" alt="${item.name}" class="w-full h-full object-cover" onerror="this.src='https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=120&q=80'" />
            </div>
            <div class="min-w-0 flex-1 leading-normal">
              <span class="font-semibold text-slate-900 block truncate text-xs hover:text-blue-600 transition cursor-pointer" title="${item.name}">${item.name}</span>
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
          this.onRequest.emit(item);
        } else if (action === 'qr') {
          this.onQr.emit(item);
        } else if (action === 'edit') {
          this.onEdit.emit(item);
        } else if (action === 'delete') {
          this.onDelete.emit(item);
        }
      }
    }
  ];

  onGridReady(params: GridReadyEvent): void {
    this.gridApi = params.api;
    this.gridApi.sizeColumnsToFit();
  }
}
