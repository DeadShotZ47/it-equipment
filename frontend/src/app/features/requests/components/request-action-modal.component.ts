import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { RequestRecord } from '../models/request.model';

@Component({
  selector: 'app-request-action-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent],
  template: `
    <app-modal [isOpen]="isOpen" [title]="titleText" maxWidth="md" (close)="onCancel()">
      <div class="space-y-4">
        <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
          <p class="font-bold text-slate-800">คำขอเลขที่: <span class="font-mono text-blue-600">{{ request?.requestNumber }}</span></p>
          <p class="text-slate-500 mt-1">ผู้ยื่น: {{ request?.requester?.fullName }} ({{ request?.requester?.department || 'พนักงาน' }})</p>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">
            {{ actionType === 'approve' ? 'หมายเหตุการอนุมัติ (ถ้ามี)' : 'เหตุผลในการปฏิเสธคำขอ *' }}
          </label>
          <textarea [(ngModel)]="note" rows="3"
                    [placeholder]="actionType === 'approve' ? 'ระบุหมายเหตุหรือคำแนะนำ...' : 'โปรดระบุสาเหตุที่ไม่อนุมัติ...'"
                    class="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"></textarea>
        </div>

        <div class="pt-3 border-t border-slate-200 flex justify-end gap-2">
          <button type="button" (click)="onCancel()" class="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg">ยกเลิก</button>
          <button type="button" (click)="onSubmit()" [disabled]="isSubmitting"
                  [ngClass]="actionType === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'"
                  class="px-5 py-2 text-xs font-semibold text-white rounded-lg shadow-sm transition disabled:opacity-50">
            {{ isSubmitting ? 'กำลังดำเนินการ...' : (actionType === 'approve' ? '✓ ยืนยันการอนุมัติ' : '✕ ยืนยันการปฏิเสธ') }}
          </button>
        </div>
      </div>
    </app-modal>
  `
})
export class RequestActionModalComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() actionType: 'approve' | 'reject' = 'approve';
  @Input() request: RequestRecord | null = null;
  @Input() isSubmitting = false;

  @Output() submitAction = new EventEmitter<{ actionType: 'approve' | 'reject'; note: string }>();
  @Output() close = new EventEmitter<void>();

  note = '';

  get titleText(): string {
    return this.actionType === 'approve' ? 'อนุมัติคำขอเบิก/ยืม' : 'ปฏิเสธคำขอ';
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && this.isOpen) {
      this.note = '';
    }
  }

  onSubmit(): void {
    if (this.actionType === 'reject' && !this.note.trim()) {
      alert('โปรดระบุเหตุผลในการปฏิเสธ');
      return;
    }
    this.submitAction.emit({ actionType: this.actionType, note: this.note.trim() });
  }

  onCancel(): void {
    this.close.emit();
  }
}
