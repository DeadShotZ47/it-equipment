import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import { HistoryService } from '../../core/services/history.service';
import { AuthService } from '../../core/services/auth.service';
import { HistoryRow } from '../../core/models/types';

@Component({
  selector: 'app-history-list',
  standalone: true,
  imports: [CommonModule, FormsModule, AgGridAngular],
  template: `
    <div class="space-y-5">
      <!-- Title -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-slate-900 tracking-tight">ประวัติการเบิก-จ่ายและตรวจสอบ (Audit & History)</h1>
          <p class="text-xs text-slate-500 mt-1">
            ตารางบันทึกประวัติการเบิก-คืนอุปกรณ์ขนาดใหญ่แบบ High-Performance ด้วย AG-Grid
          </p>
        </div>
        <div class="flex items-center gap-2">
          <button (click)="exportCsv()" class="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg shadow-xs transition flex items-center gap-1.5">
            📥 ส่งออกไฟล์ CSV
          </button>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-3">
        <div class="relative flex-1 min-w-[200px]">
          <span class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </span>
          <input type="text" [(ngModel)]="searchQuery" (input)="onFilterChange()" placeholder="ค้นหาเลขที่คำขอ, ชื่อผู้เบิก, ชื่ออุปกรณ์..."
                 class="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <select [(ngModel)]="selectedType" (change)="onFilterChange()"
                class="px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700">
          <option value="">ทุกประเภทคำขอ</option>
          <option value="CHECKOUT">ยืมสินทรัพย์ถาวร (Fixed Asset)</option>
          <option value="CONSUME">เบิกของสิ้นเปลือง (Consumable)</option>
        </select>

        <select [(ngModel)]="selectedStatus" (change)="onFilterChange()"
                class="px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700">
          <option value="">ทุกสถานะ</option>
          <option value="APPROVED">อนุมัติแล้ว</option>
          <option value="RETURNED">ส่งคืนแล้ว</option>
          <option value="REJECTED">ปฏิเสธ</option>
          <option value="PENDING">รออนุมัติ</option>
        </select>

        <button (click)="resetFilters()" class="px-3 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg">ล้างตัวกรอง</button>
      </div>

      <!-- AG-Grid Table -->
      <div class="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <ag-grid-angular
          style="width: 100%; height: 560px;"
          class="ag-theme-quartz"
          [rowData]="historyRows()"
          [columnDefs]="colDefs"
          [pagination]="true"
          [paginationPageSize]="20"
          [paginationPageSizeSelector]="[10, 20, 50, 100]"
          [rowHeight]="58"
          [headerHeight]="44"
          (gridReady)="onGridReady($event)">
        </ag-grid-angular>
      </div>
    </div>
  `
})
export class HistoryListComponent implements OnInit {
  historyService = inject(HistoryService);
  auth = inject(AuthService);

  gridApi!: GridApi;
  historyRows = signal<HistoryRow[]>([]);

  searchQuery = '';
  selectedType = '';
  selectedStatus = '';

  colDefs: ColDef[] = [
    {
      headerName: 'เลขที่คำขอ',
      field: 'requestNumber',
      width: 170,
      cellRenderer: (p: any) => `<span class="font-mono text-xs font-bold text-slate-900">${p.value}</span>`
    },
    {
      headerName: 'รายการอุปกรณ์ที่เบิก',
      field: 'equipmentName',
      flex: 2.5,
      minWidth: 260,
      tooltipField: 'equipmentName',
      cellRenderer: (p: any) => {
        const row = p.data as HistoryRow;
        return `
          <div class="h-full py-1 leading-normal">
            <span class="font-semibold text-slate-900 block truncate text-xs" title="${row.equipmentName}">${row.equipmentName}</span>
            <span class="text-[11px] text-slate-400 font-mono block truncate">ซีเรียล: ${row.serialNumber}</span>
          </div>
        `;
      }
    },
    {
      headerName: 'ประเภท',
      field: 'requestType',
      width: 140,
      cellRenderer: (p: any) => {
        return p.value === 'CHECKOUT'
          ? `<span class="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-semibold">สินทรัพย์ถาวร</span>`
          : `<span class="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-[11px] font-semibold">ของสิ้นเปลือง</span>`;
      }
    },
    {
      headerName: 'จำนวน',
      field: 'quantity',
      width: 90,
      cellRenderer: (p: any) => `<span class="font-semibold text-slate-700">${p.value}</span>`
    },
    {
      headerName: 'ผู้ยื่นคำขอ',
      field: 'requesterName',
      width: 180,
      cellRenderer: (p: any) => {
        const row = p.data as HistoryRow;
        return `
          <div class="h-full py-1 leading-normal">
            <span class="font-medium text-slate-800 block truncate text-xs">${row.requesterName}</span>
            <span class="text-[10px] text-slate-400 block truncate">${row.department || ''}</span>
          </div>
        `;
      }
    },
    {
      headerName: 'สถานะ',
      field: 'status',
      width: 130,
      cellRenderer: (p: any) => {
        const s = p.value;
        let c = 'bg-slate-100 text-slate-600';
        let label = s;
        if (s === 'APPROVED') { c = 'bg-emerald-50 text-emerald-700 border-emerald-200'; label = 'อนุมัติแล้ว'; }
        if (s === 'RETURNED') { c = 'bg-blue-50 text-blue-700 border-blue-200'; label = 'ส่งคืนแล้ว'; }
        if (s === 'REJECTED') { c = 'bg-rose-50 text-rose-700 border-rose-200'; label = 'ปฏิเสธ'; }
        if (s === 'PENDING') { c = 'bg-amber-50 text-amber-700 border-amber-200'; label = 'รออนุมัติ'; }
        return `<span class="px-2.5 py-0.5 rounded-full text-xs font-semibold border ${c}">${label}</span>`;
      }
    },
    {
      headerName: 'วันที่ทำรายการ',
      field: 'createdAt',
      width: 150,
      valueFormatter: (p: any) => p.value ? new Date(p.value).toLocaleDateString('th-TH') + ' ' + new Date(p.value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'
    },
    {
      headerName: 'วันที่ส่งคืน',
      field: 'returnedAt',
      width: 150,
      valueFormatter: (p: any) => p.value ? new Date(p.value).toLocaleDateString('th-TH') + ' ' + new Date(p.value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'
    }
  ];

  ngOnInit(): void {
    this.loadHistory();
  }

  onGridReady(params: GridReadyEvent): void {
    this.gridApi = params.api;
    this.gridApi.sizeColumnsToFit();
  }

  loadHistory(): void {
    const filters: any = {};
    if (this.searchQuery) filters.search = this.searchQuery;
    if (this.selectedType) filters.type = this.selectedType;
    if (this.selectedStatus) filters.status = this.selectedStatus;

    this.historyService.getHistory(filters).subscribe({
      next: (res) => this.historyRows.set(res.items),
      error: (err) => console.error(err)
    });
  }

  onFilterChange(): void {
    this.loadHistory();
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.selectedType = '';
    this.selectedStatus = '';
    this.loadHistory();
  }

  exportCsv(): void {
    if (this.gridApi) {
      this.gridApi.exportDataAsCsv({ fileName: 'it-equipment-history.csv' });
    }
  }
}
