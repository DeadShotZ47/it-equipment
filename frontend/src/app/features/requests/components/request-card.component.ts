import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RequestRecord } from '../models/request.model';
import { AuthService } from '../../../core/services/auth.service';
import { EquipmentService } from '../../equipment/services/equipment.service';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-request-card',
  standalone: true,
  imports: [CommonModule, StatusBadgeComponent],
  template: `
    <div class="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-100">
        <div class="flex items-center gap-3">
          <span class="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm">
            {{ request.type === 'CHECKOUT' ? '📦' : '⚡' }}
          </span>
          <div>
            <div class="flex items-center gap-2">
              <span class="font-bold text-sm text-slate-900 font-mono">{{ request.requestNumber }}</span>
              <span [ngClass]="typeBadgeClass" class="px-2.5 py-0.5 rounded-full text-[10px] font-semibold border">
                {{ request.type === 'CHECKOUT' ? 'ขอยืมสินทรัพย์ถาวร' : 'ขอเบิกของสิ้นเปลือง' }}
              </span>
            </div>
            <p class="text-xs text-slate-400 mt-0.5">
              ยื่นคำขอโดย <span class="font-medium text-slate-700">{{ request.requester?.fullName }}</span> ({{ request.requester?.department || 'พนักงาน' }})
              · {{ request.createdAt | date:'medium' }}
            </p>
          </div>
        </div>

        <!-- Status Badge & Actions -->
        <div class="flex items-center gap-2.5 self-start md:self-auto">
          <app-status-badge [status]="request.status"></app-status-badge>

          <!-- Admin 1-Step Actions -->
          <ng-container *ngIf="auth.isAdmin() && request.status === 'PENDING'">
            <button (click)="onApprove.emit(request)" class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition">
              ✓ อนุมัติ
            </button>
            <button (click)="onReject.emit(request)" class="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-xs transition">
              ✕ ปฏิเสธ
            </button>
          </ng-container>

          <!-- Return Action -->
          <button *ngIf="request.status === 'APPROVED' && request.type === 'CHECKOUT'"
                  (click)="onReturn.emit(request)"
                  class="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition">
            ↩ บันทึกส่งคืนอุปกรณ์
          </button>
        </div>
      </div>

      <!-- Items Detail -->
      <div class="pt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
        <div *ngFor="let item of request.items" class="p-2.5 rounded-xl bg-slate-50 border border-slate-150 flex items-start gap-3">
          <div class="w-12 h-12 rounded-lg overflow-hidden border border-slate-200 bg-white shrink-0 shadow-2xs">
            <img [src]="getItemImage(item.equipment)" [alt]="item.equipment?.name" class="w-full h-full object-cover" />
          </div>
          <div class="min-w-0 flex-1">
            <span class="font-semibold text-slate-900 block truncate text-xs">{{ item.equipment?.name }}</span>
            <div class="text-[11px] text-slate-500 mt-0.5 space-y-0.5">
              <p>จำนวน: <span class="font-semibold text-slate-700">{{ item.quantity }}</span></p>
              <p *ngIf="item.equipment?.serialNumber">ซีเรียล#: <span class="font-mono text-slate-700">{{ item.equipment.serialNumber }}</span></p>
              <p *ngIf="item.checkedOutAt">วันที่เริ่มเบิก: {{ item.checkedOutAt | date:'short' }}</p>
              <p *ngIf="item.returnedAt" class="text-emerald-600 font-medium">วันที่ส่งคืน: {{ item.returnedAt | date:'short' }}</p>
            </div>
          </div>
        </div>

        <div class="p-2.5 rounded-lg bg-slate-50 border border-slate-150 sm:col-span-2">
          <span class="font-semibold text-slate-700 block">เหตุผลการเบิก:</span>
          <p class="text-slate-600 text-xs mt-0.5">{{ request.reason || 'ไม่ได้ระบุเหตุผล' }}</p>
          <div *ngIf="request.adminNote" class="mt-2 pt-2 border-t border-slate-200">
            <span class="font-semibold text-slate-800">บันทึกจากเจ้าหน้าที่ IT:</span>
            <span class="text-slate-600 ml-1">{{ request.adminNote }}</span>
          </div>
        </div>
      </div>
    </div>
  `
})
export class RequestCardComponent {
  auth = inject(AuthService);
  equipmentService = inject(EquipmentService);

  @Input({ required: true }) request!: RequestRecord;
  @Output() onApprove = new EventEmitter<RequestRecord>();
  @Output() onReject = new EventEmitter<RequestRecord>();
  @Output() onReturn = new EventEmitter<RequestRecord>();

  get typeBadgeClass(): string {
    return this.request.type === 'CHECKOUT'
      ? 'bg-blue-50 text-blue-700 border-blue-200'
      : 'bg-purple-50 text-purple-700 border-purple-200';
  }

  getItemImage(eq: any): string {
    return this.equipmentService.getEquipmentImageUrl(eq);
  }
}
