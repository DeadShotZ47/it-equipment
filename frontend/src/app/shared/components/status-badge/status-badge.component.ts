import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EquipmentStatus, RequestStatus, RequestType } from '../../models/shared.model';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span [ngClass]="badgeClass" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide border shadow-2xs">
      <span *ngIf="showDot" [ngClass]="dotClass" class="w-1.5 h-1.5 rounded-full"></span>
      {{ labelText }}
    </span>
  `
})
export class StatusBadgeComponent {
  @Input() status?: EquipmentStatus | RequestStatus | RequestType | string;
  @Input() customLabel?: string;
  @Input() showDot = true;

  get labelText(): string {
    if (this.customLabel) return this.customLabel;
    switch (this.status) {
      // Equipment Status
      case 'AVAILABLE': return 'พร้อมใช้งาน';
      case 'CHECKED_OUT': return 'กำลังถูกยืม';
      case 'MAINTENANCE': return 'ส่งซ่อมบำรุง';
      case 'RETIRED': return 'เลิกใช้งาน';

      // Request Status
      case 'PENDING': return 'รออนุมัติ';
      case 'APPROVED': return 'อนุมัติแล้ว';
      case 'REJECTED': return 'ปฏิเสธ';
      case 'RETURNED': return 'ส่งคืนแล้ว';
      case 'CANCELLED': return 'ยกเลิกแล้ว';

      // Request Types
      case 'CHECKOUT': return 'ขอยืมสินทรัพย์ถาวร';
      case 'CONSUME': return 'ขอเบิกของสิ้นเปลือง';

      default: return this.status || '-';
    }
  }

  get badgeClass(): string {
    switch (this.status) {
      case 'AVAILABLE':
      case 'APPROVED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
      case 'CHECKED_OUT':
      case 'RETURNED':
        return 'bg-blue-50 text-blue-700 border-blue-200/80';
      case 'PENDING':
      case 'MAINTENANCE':
        return 'bg-amber-50 text-amber-700 border-amber-200/80';
      case 'REJECTED':
      case 'CANCELLED':
        return 'bg-rose-50 text-rose-700 border-rose-200/80';
      case 'RETIRED':
        return 'bg-slate-100 text-slate-600 border-slate-200';
      case 'CHECKOUT':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200/80';
      case 'CONSUME':
        return 'bg-purple-50 text-purple-700 border-purple-200/80';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  }

  get dotClass(): string {
    switch (this.status) {
      case 'AVAILABLE':
      case 'APPROVED':
        return 'bg-emerald-500';
      case 'CHECKED_OUT':
      case 'RETURNED':
        return 'bg-blue-500';
      case 'PENDING':
      case 'MAINTENANCE':
        return 'bg-amber-500';
      case 'REJECTED':
      case 'CANCELLED':
        return 'bg-rose-500';
      case 'RETIRED':
        return 'bg-slate-400';
      case 'CHECKOUT':
        return 'bg-indigo-500';
      case 'CONSUME':
        return 'bg-purple-500';
      default:
        return 'bg-slate-400';
    }
  }
}
