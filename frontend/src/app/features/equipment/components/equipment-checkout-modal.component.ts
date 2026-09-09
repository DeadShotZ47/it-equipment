import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Equipment } from '../models/equipment.model';
import { EquipmentService } from '../services/equipment.service';
import { ModalComponent } from '../../../shared/components/modal/modal.component';

export interface CheckoutSubmitEvent {
  equipmentId: string;
  quantity: number;
  reason: string;
}

@Component({
  selector: 'app-equipment-checkout-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent],
  template: `
    <app-modal [isOpen]="isOpen" title="ยื่นคำขอเบิก/ยืมอุปกรณ์" maxWidth="md" (close)="onCancel()">
      <div class="space-y-4">
        <!-- Item Overview -->
        <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs flex items-center gap-3.5">
          <div class="w-14 h-14 rounded-lg overflow-hidden border border-slate-200 bg-white shrink-0 shadow-2xs">
            <img [src]="equipmentImageUrl" [alt]="equipment?.name" class="w-full h-full object-cover" />
          </div>
          <div class="min-w-0 flex-1">
            <span class="font-semibold block text-slate-950 text-sm mb-0.5 truncate">{{ equipment?.name }}</span>
            <span class="text-slate-500 block text-[11px]">
              หมวดหมู่: {{ equipment?.category?.name || '-' }} · สถานที่: {{ equipment?.location || 'คลังอุปกรณ์' }}
            </span>
          </div>
        </div>

        <!-- Quantity (For Consumables) -->
        <div *ngIf="equipment?.isConsumable">
          <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">
            จำนวนที่ต้องการเบิก (คงเหลือในสต็อก: {{ equipment?.quantity }})
          </label>
          <input type="number" [(ngModel)]="quantity" [max]="equipment?.quantity || 1" min="1"
                 class="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
        </div>

        <!-- Reason -->
        <div>
          <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">เหตุผลและวัตถุประสงค์ในการเบิก *</label>
          <textarea [(ngModel)]="reason" rows="3" placeholder="ระบุชื่องาน โปรเจกต์ หรือความจำเป็นในการใช้อุปกรณ์..."
                    class="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"></textarea>
        </div>

        <!-- Actions -->
        <div class="pt-3 border-t border-slate-200 flex justify-end gap-2">
          <button type="button" (click)="onCancel()" class="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg">ยกเลิก</button>
          <button type="button" (click)="onSubmit()" [disabled]="isSubmitting"
                  class="px-5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition disabled:opacity-50">
            {{ isSubmitting ? 'กำลังส่งคำขอ...' : 'ส่งคำขอเบิก' }}
          </button>
        </div>
      </div>
    </app-modal>
  `
})
export class EquipmentCheckoutModalComponent implements OnChanges {
  equipmentService = inject(EquipmentService);

  @Input() isOpen = false;
  @Input() equipment: Equipment | null = null;
  @Input() isSubmitting = false;

  @Output() submitRequest = new EventEmitter<CheckoutSubmitEvent>();
  @Output() close = new EventEmitter<void>();

  quantity = 1;
  reason = '';

  get equipmentImageUrl(): string {
    return this.equipmentService.getEquipmentImageUrl(this.equipment);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && this.isOpen) {
      this.quantity = 1;
      this.reason = '';
    }
  }

  onSubmit(): void {
    if (!this.equipment || !this.reason.trim()) {
      alert('โปรดระบุเหตุผลในการเบิกอุปกรณ์');
      return;
    }

    this.submitRequest.emit({
      equipmentId: this.equipment.id,
      quantity: this.equipment.isConsumable ? Number(this.quantity) : 1,
      reason: this.reason.trim()
    });
  }

  onCancel(): void {
    this.close.emit();
  }
}
