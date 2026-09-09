import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RequestService } from '../services/request.service';
import { AuthService } from '../../../core/services/auth.service';
import { RequestRecord } from '../models/request.model';
import { RequestFilterComponent } from '../components/request-filter.component';
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
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-slate-900 tracking-tight">คำขอเบิก & อนุมัติ (Requests & Approvals)</h1>
          <p class="text-xs text-slate-500 mt-1">
            {{ auth.isAdmin() ? 'ขั้นตอนอนุมัติ 1 ขั้นตอนสำหรับเจ้าหน้าที่ IT · ตัดยอดสต็อกของสิ้นเปลืองอัตโนมัติ' : 'ติดตามสถานะคำขอเบิก-ยืมของฉัน และการส่งคืนอุปกรณ์' }}
          </p>
        </div>

        <!-- Filter Status Tabs -->
        <app-request-filter
          [selectedStatus]="selectedStatus"
          (statusChange)="filterStatus($event)">
        </app-request-filter>
      </div>

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
          description="ไม่พบรายการคำขอเบิก-ยืมในหมวดหมู่นี้">
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
  selectedStatus = '';

  // Modal State
  showActionModal = signal(false);
  actionType: 'approve' | 'reject' = 'approve';
  targetRequest: RequestRecord | null = null;
  isActionSubmitting = signal(false);

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
    if (!confirm(`ยืนยันการรับคืนอุปกรณ์ตามคำขอ ${req.requestNumber}? สถานะอุปกรณ์จะกลับเป็นพร้อมใช้งาน`)) return;

    this.requestService.returnRequest(req.id).subscribe({
      next: () => {
        alert('บันทึกส่งคืนอุปกรณ์เรียบร้อยแล้ว!');
        this.loadRequests();
      },
      error: (err) => alert(err.error?.message || 'เกิดข้อผิดพลาดในการส่งคืน')
    });
  }
}
