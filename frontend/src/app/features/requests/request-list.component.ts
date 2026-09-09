import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RequestService } from '../../core/services/request.service';
import { AuthService } from '../../core/services/auth.service';
import { RequestRecord } from '../../core/models/types';

@Component({
  selector: 'app-request-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-5">
      <!-- Title Bar -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-slate-900 tracking-tight">คำขอเบิก & อนุมัติ (Requests & Approvals)</h1>
          <p class="text-xs text-slate-500 mt-1">
            {{ auth.isAdmin() ? 'ขั้นตอนอนุมัติ 1 ขั้นตอนสำหรับเจ้าหน้าที่ IT · ตัดยอดสต็อกของสิ้นเปลืองอัตโนมัติ' : 'ติดตามสถานะคำขอเบิก-ยืมของฉัน และการส่งคืนอุปกรณ์' }}
          </p>
        </div>

        <!-- Filter Status tabs -->
        <div class="flex items-center gap-1.5 p-1 bg-white border border-slate-200 rounded-lg shadow-xs text-xs">
          <button (click)="filterStatus('')" [class.bg-blue-600]="selectedStatus === ''" [class.text-white]="selectedStatus === ''"
                  class="px-3 py-1.5 rounded-md font-medium text-slate-600 hover:text-slate-900 transition">ทั้งหมด</button>
          <button (click)="filterStatus('PENDING')" [class.bg-amber-500]="selectedStatus === 'PENDING'" [class.text-white]="selectedStatus === 'PENDING'"
                  class="px-3 py-1.5 rounded-md font-medium text-slate-600 hover:text-slate-900 transition">รออนุมัติ</button>
          <button (click)="filterStatus('APPROVED')" [class.bg-emerald-600]="selectedStatus === 'APPROVED'" [class.text-white]="selectedStatus === 'APPROVED'"
                  class="px-3 py-1.5 rounded-md font-medium text-slate-600 hover:text-slate-900 transition">อนุมัติแล้ว</button>
          <button (click)="filterStatus('RETURNED')" [class.bg-blue-600]="selectedStatus === 'RETURNED'" [class.text-white]="selectedStatus === 'RETURNED'"
                  class="px-3 py-1.5 rounded-md font-medium text-slate-600 hover:text-slate-900 transition">ส่งคืนแล้ว</button>
          <button (click)="filterStatus('REJECTED')" [class.bg-rose-600]="selectedStatus === 'REJECTED'" [class.text-white]="selectedStatus === 'REJECTED'"
                  class="px-3 py-1.5 rounded-md font-medium text-slate-600 hover:text-slate-900 transition">ปฏิเสธ</button>
        </div>
      </div>

      <!-- Requests Cards/List -->
      <div class="space-y-3">
        <div *ngFor="let req of requests()" class="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-100">
            <div class="flex items-center gap-3">
              <span class="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm">
                {{ req.type === 'CHECKOUT' ? '📦' : '⚡' }}
              </span>
              <div>
                <div class="flex items-center gap-2">
                  <span class="font-bold text-sm text-slate-900 font-mono">{{ req.requestNumber }}</span>
                  <span [ngClass]="getTypeBadge(req.type)" class="px-2.5 py-0.5 rounded-full text-[10px] font-semibold border">
                    {{ req.type === 'CHECKOUT' ? 'ขอยืมสินทรัพย์ถาวร' : 'ขอเบิกของสิ้นเปลือง' }}
                  </span>
                </div>
                <p class="text-xs text-slate-400 mt-0.5">
                  ยื่นคำขอโดย <span class="font-medium text-slate-700">{{ req.requester?.fullName }}</span> ({{ req.requester?.department || 'พนักงาน' }})
                  · {{ req.createdAt | date:'medium' }}
                </p>
              </div>
            </div>

            <!-- Status Badge & Action -->
            <div class="flex items-center gap-2.5 self-start md:self-auto">
              <span [ngClass]="getStatusBadge(req.status)" class="px-3 py-1 rounded-full text-xs font-semibold border">
                {{ getStatusLabel(req.status) }}
              </span>

              <!-- Admin 1-Step Actions -->
              <ng-container *ngIf="auth.isAdmin() && req.status === 'PENDING'">
                <button (click)="approve(req)" class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition">
                  ✓ อนุมัติ
                </button>
                <button (click)="reject(req)" class="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-xs transition">
                  ✕ ปฏิเสธ
                </button>
              </ng-container>

              <!-- Return Action -->
              <button *ngIf="req.status === 'APPROVED' && req.type === 'CHECKOUT'"
                      (click)="returnItem(req)"
                      class="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition">
                ↩ บันทึกส่งคืนอุปกรณ์
              </button>
            </div>
          </div>

          <!-- Items detail inside Request -->
          <div class="pt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            <div *ngFor="let item of req.items" class="p-2.5 rounded-lg bg-slate-50 border border-slate-150">
              <span class="font-semibold text-slate-900 block">{{ item.equipment?.name }}</span>
              <div class="text-[11px] text-slate-500 mt-1 space-y-0.5">
                <p>จำนวน: <span class="font-semibold text-slate-700">{{ item.quantity }}</span></p>
                <p *ngIf="item.equipment?.serialNumber">ซีเรียล#: <span class="font-mono text-slate-700">{{ item.equipment.serialNumber }}</span></p>
                <p *ngIf="item.checkedOutAt">วันที่เริ่มเบิก: {{ item.checkedOutAt | date:'short' }}</p>
                <p *ngIf="item.returnedAt" class="text-emerald-600 font-medium">วันที่ส่งคืน: {{ item.returnedAt | date:'short' }}</p>
              </div>
            </div>

            <div class="p-2.5 rounded-lg bg-slate-50 border border-slate-150 sm:col-span-2">
              <span class="font-semibold text-slate-700 block">เหตุผลการเบิก:</span>
              <p class="text-slate-600 text-xs mt-0.5">{{ req.reason || 'ไม่ได้ระบุเหตุผล' }}</p>
              <div *ngIf="req.adminNote" class="mt-2 pt-2 border-t border-slate-200">
                <span class="font-semibold text-slate-800">บันทึกจากเจ้าหน้าที่ IT:</span>
                <span class="text-slate-600 ml-1">{{ req.adminNote }}</span>
              </div>
            </div>
          </div>
        </div>

        <div *ngIf="requests().length === 0" class="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400 text-xs">
          ไม่พบรายการคำขอในหมวดนี้
        </div>
      </div>
    </div>
  `
})
export class RequestListComponent implements OnInit {
  requestService = inject(RequestService);
  auth = inject(AuthService);

  requests = signal<RequestRecord[]>([]);
  selectedStatus = '';

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests(): void {
    const filters: any = {};
    if (this.selectedStatus) filters.status = this.selectedStatus;

    this.requestService.getRequests(filters).subscribe({
      next: (res) => this.requests.set(res.items),
      error: (err) => console.error(err)
    });
  }

  filterStatus(status: string): void {
    this.selectedStatus = status;
    this.loadRequests();
  }

  approve(req: RequestRecord): void {
    const note = prompt('ระบุหมายเหตุการอนุมัติ (ถ้ามี):');
    if (note === null) return;

    this.requestService.approveRequest(req.id, note).subscribe({
      next: () => {
        alert('อนุมัติคำขอเรียบร้อยแล้ว! ระบบได้อัปเดตสต็อกหรือสถานะอุปกรณ์ในฐานข้อมูลแล้ว');
        this.loadRequests();
      },
      error: (err) => alert(err.error?.message || 'เกิดข้อผิดพลาดในการอนุมัติ')
    });
  }

  reject(req: RequestRecord): void {
    const note = prompt('ระบุเหตุผลในการปฏิเสธคำขอ:');
    if (note === null) return;

    this.requestService.rejectRequest(req.id, note).subscribe({
      next: () => {
        alert('ปฏิเสธคำขอเรียบร้อยแล้ว');
        this.loadRequests();
      },
      error: (err) => alert(err.error?.message || 'เกิดข้อผิดพลาดในการปฏิเสธ')
    });
  }

  returnItem(req: RequestRecord): void {
    if (!confirm(`ยืนยันการรับคืนอุปกรณ์ตามคำขอ ${req.requestNumber}? สถานะอุปกรณ์จะกลับเป็นพร้อมใช้งาน`)) return;

    this.requestService.returnRequest(req.id).subscribe({
      next: () => {
        alert('บันทึกส่งคืนอุปกรณ์เรียบร้อยแล้ว!');
        this.loadRequests();
      },
      error: (err) => alert(err.error?.message || 'เกิดข้อผิดพลาดในการส่งคืน')
    });
  }

  getTypeBadge(type: string): string {
    return type === 'CHECKOUT'
      ? 'bg-blue-50 text-blue-700 border-blue-200'
      : 'bg-purple-50 text-purple-700 border-purple-200';
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'PENDING': return 'รอการอนุมัติ';
      case 'APPROVED': return 'อนุมัติแล้ว';
      case 'RETURNED': return 'ส่งคืนแล้ว';
      case 'REJECTED': return 'ปฏิเสธ';
      default: return status;
    }
  }

  getStatusBadge(status: string): string {
    switch (status) {
      case 'PENDING':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'APPROVED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'RETURNED':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'REJECTED':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  }
}
