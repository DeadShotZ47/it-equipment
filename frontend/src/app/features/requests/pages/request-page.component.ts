import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RequestService } from '../services/request.service';
import { AuthService } from '../../../core/services/auth.service';
import { RequestRecord } from '../models/request.model';
import { RequestFilterComponent, RequestFilterParams } from '../components/request-filter.component';
import { RequestCardComponent } from '../components/request-card.component';
import { RequestActionModalComponent } from '../components/request-action-modal.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-request-page',
  standalone: true,
  imports: [
    CommonModule,
    RequestFilterComponent,
    RequestCardComponent,
    RequestActionModalComponent,
    EmptyStateComponent
  ],
  template: `
    <div class="space-y-5">
      <!-- Title Bar -->
      <div>
        <h1 class="text-2xl font-bold text-slate-900 tracking-tight">คำขอเบิก & อนุมัติ (Requests & Approvals)</h1>
        <p class="text-xs text-slate-500 mt-1">
          {{ auth.isAdmin() ? 'ขั้นตอนอนุมัติและรับคืนอุปกรณ์สำหรับเจ้าหน้าที่ IT · ตัดยอดสต็อกของสิ้นเปลืองอัตโนมัติ' : 'ติดตามสถานะคำขอเบิก-ยืมของฉัน และตรวจสอบรายการที่ต้องส่งคืน' }}
        </p>
      </div>

      <!-- Filter Component (Search, Type, Status) -->
      <app-request-filter
        [search]="searchQuery"
        [selectedStatus]="selectedStatus"
        [selectedType]="selectedType"
        (filterChange)="onFilterChange($event)">
      </app-request-filter>

      <!-- Requests Cards/List -->
      <div class="space-y-3">
        <app-request-card
          *ngFor="let req of requests()"
          [request]="req"
          (onApprove)="openApproveModal($event)"
          (onReject)="openRejectModal($event)"
          (onReturn)="returnItem($event)">
        </app-request-card>

        <app-empty-state
          *ngIf="requests().length === 0"
          icon="📋"
          title="ไม่พบรายการคำขอ"
          [description]="emptyDescription">
        </app-empty-state>
      </div>

      <!-- Approve/Reject Modal -->
      <app-request-action-modal
        [isOpen]="showActionModal()"
        [actionType]="actionType"
        [request]="targetRequest"
        [isSubmitting]="isActionSubmitting()"
        (submitAction)="handleModalAction($event)"
        (close)="showActionModal.set(false)">
      </app-request-action-modal>
    </div>
  `
})
export class RequestPageComponent implements OnInit {
  requestService = inject(RequestService);
  auth = inject(AuthService);

  requests = signal<RequestRecord[]>([]);
  searchQuery = '';
  selectedStatus = '';
  selectedType = '';

  // Modal State
  showActionModal = signal(false);
  actionType: 'approve' | 'reject' = 'approve';
  targetRequest: RequestRecord | null = null;
  isActionSubmitting = signal(false);

  get emptyDescription(): string {
    if (this.searchQuery) {
      return `ไม่พบรายการที่ตรงกับคำค้นหา: "${this.searchQuery}"`;
    }
    if (this.selectedStatus || this.selectedType) {
      return 'ไม่พบรายการคำขอที่ตรงกับเงื่อนไขตัวกรองที่เลือก';
    }
    return 'ไม่พบรายการคำขอเบิก-ยืมในขณะนี้';
  }

  ngOnInit(): void {
    this.loadRequests();
  }

  onFilterChange(params: RequestFilterParams): void {
    this.searchQuery = params.search;
    this.selectedStatus = params.status;
    this.selectedType = params.type;
    this.loadRequests();
  }

  loadRequests(): void {
    const filters: any = {};
    if (this.searchQuery) filters.search = this.searchQuery;
    if (this.selectedStatus) filters.status = this.selectedStatus;
    if (this.selectedType) filters.type = this.selectedType;

    this.requestService.getRequests(filters).subscribe({
      next: (res) => this.requests.set(res.items),
      error: (err) => console.error(err)
    });
  }

  openApproveModal(req: RequestRecord): void {
    this.actionType = 'approve';
    this.targetRequest = req;
    this.showActionModal.set(true);
  }

  openRejectModal(req: RequestRecord): void {
    this.actionType = 'reject';
    this.targetRequest = req;
    this.showActionModal.set(true);
  }

  handleModalAction(event: { actionType: 'approve' | 'reject'; note: string }): void {
    if (!this.targetRequest) return;
    this.isActionSubmitting.set(true);

    if (event.actionType === 'approve') {
      this.requestService.approveRequest(this.targetRequest.id, event.note).subscribe({
        next: () => {
          this.isActionSubmitting.set(false);
          this.showActionModal.set(false);
          alert('อนุมัติคำขอเรียบร้อยแล้ว! ระบบได้อัปเดตสต็อกหรือสถานะอุปกรณ์ในฐานข้อมูลแล้ว');
          this.loadRequests();
        },
        error: (err) => {
          this.isActionSubmitting.set(false);
          alert(err.error?.message || 'เกิดข้อผิดพลาดในการอนุมัติ');
        }
      });
    } else {
      this.requestService.rejectRequest(this.targetRequest.id, event.note).subscribe({
        next: () => {
          this.isActionSubmitting.set(false);
          this.showActionModal.set(false);
          alert('ปฏิเสธคำขอเรียบร้อยแล้ว');
          this.loadRequests();
        },
        error: (err) => {
          this.isActionSubmitting.set(false);
          alert(err.error?.message || 'เกิดข้อผิดพลาดในการปฏิเสธ');
        }
      });
    }
  }

  returnItem(req: RequestRecord): void {
    if (!this.auth.isAdmin()) {
      alert('เฉพาะเจ้าหน้าที่ IT (Admin) เท่านั้นที่สามารถกดยืนยันการรับคืนอุปกรณ์ได้');
      return;
    }

    if (!confirm(`ยืนยันการรับคืนอุปกรณ์ตามคำขอ ${req.requestNumber} จากผู้ยืมเรียบร้อยแล้วใช่หรือไม่?\n(โปรดตรวจสอบสภาพอุปกรณ์จริงก่อนยืนยันรับคืนเข้าคลัง)`)) return;

    this.requestService.returnRequest(req.id).subscribe({
      next: () => {
        alert('บันทึกรับคืนอุปกรณ์เข้าคลังเรียบร้อยแล้ว! สถานะอุปกรณ์กลับเป็นพร้อมใช้งาน');
        this.loadRequests();
      },
      error: (err) => alert(err.error?.message || 'เกิดข้อผิดพลาดในการรับคืนอุปกรณ์')
    });
  }
}
