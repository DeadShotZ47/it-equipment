import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EquipmentService } from '../services/equipment.service';
import { CategoryService } from '../../categories/services/category.service';
import { RequestService } from '../../requests/services/request.service';
import { AuthService } from '../../../core/services/auth.service';
import { Equipment, EquipmentFilterParams } from '../models/equipment.model';
import { Category } from '../../categories/models/category.model';
import { EquipmentFilterComponent } from '../components/equipment-filter.component';
import { EquipmentTableComponent } from '../components/equipment-table.component';
import { EquipmentFormModalComponent } from '../components/equipment-form-modal.component';
import { EquipmentQrModalComponent } from '../components/equipment-qr-modal.component';
import { EquipmentCheckoutModalComponent, CheckoutSubmitEvent } from '../components/equipment-checkout-modal.component';

@Component({
  selector: 'app-equipment-page',
  standalone: true,
  imports: [
    CommonModule,
    EquipmentFilterComponent,
    EquipmentTableComponent,
    EquipmentFormModalComponent,
    EquipmentQrModalComponent,
    EquipmentCheckoutModalComponent
  ],
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

      <!-- Filter Component -->
      <app-equipment-filter
        [categories]="categories()"
        (filterChange)="onFilterChange($event)">
      </app-equipment-filter>

      <!-- AG-Grid Table Component -->
      <app-equipment-table
        [equipmentList]="equipmentList()"
        (onRequest)="openRequestModal($event)"
        (onQr)="openQrModal($event)"
        (onEdit)="openEditModal($event)"
        (onDelete)="deleteItem($event)">
      </app-equipment-table>

      <!-- Add/Edit Form Modal -->
      <app-equipment-form-modal
        [isOpen]="showModal()"
        [isEditing]="isEditing()"
        [equipment]="selectedEquipment"
        [categories]="categories()"
        [isSaving]="modalSaving()"
        (save)="saveEquipment($event)"
        (close)="showModal.set(false)">
      </app-equipment-form-modal>

      <!-- QR Code Modal -->
      <app-equipment-qr-modal
        [isOpen]="showQrModal()"
        [equipmentName]="qrEquipmentName"
        [qrCodeValue]="qrCodeValue"
        [qrDataUrl]="qrDataUrl"
        (close)="showQrModal.set(false)">
      </app-equipment-qr-modal>

      <!-- Checkout Request Modal -->
      <app-equipment-checkout-modal
        [isOpen]="showRequestModal()"
        [equipment]="selectedEquipment"
        [isSubmitting]="requestSubmitting()"
        (submitRequest)="submitRequest($event)"
        (close)="showRequestModal.set(false)">
      </app-equipment-checkout-modal>
    </div>
  `
})
export class EquipmentPageComponent implements OnInit {
  auth = inject(AuthService);
  equipmentService = inject(EquipmentService);
  categoryService = inject(CategoryService);
  requestService = inject(RequestService);

  equipmentList = signal<Equipment[]>([]);
  categories = signal<Category[]>([]);
  currentFilters: EquipmentFilterParams = {};

  // Add/Edit State
  showModal = signal(false);
  isEditing = signal(false);
  selectedEquipment: Equipment | null = null;
  modalSaving = signal(false);

  // QR Modal State
  showQrModal = signal(false);
  qrEquipmentName = '';
  qrCodeValue = '';
  qrDataUrl = '';

  // Request Modal State
  showRequestModal = signal(false);
  requestSubmitting = signal(false);

  ngOnInit(): void {
    this.loadCategories();
    this.loadEquipment();
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (cats) => this.categories.set(cats),
      error: (err) => console.error('[EquipmentPage] ❌ ไม่สามารถโหลดหมวดหมู่ได้:', err)
    });
  }

  loadEquipment(): void {
    this.equipmentService.getEquipmentList(this.currentFilters).subscribe({
      next: (res) => this.equipmentList.set(res.items),
      error: (err) => console.error('[EquipmentPage] ❌ ไม่สามารถโหลดรายการอุปกรณ์ได้:', err)
    });
  }

  onFilterChange(filters: EquipmentFilterParams): void {
    this.currentFilters = filters;
    this.loadEquipment();
  }

  openAddModal(): void {
    this.isEditing.set(false);
    this.selectedEquipment = null;
    this.showModal.set(true);
  }

  openEditModal(item: Equipment): void {
    this.isEditing.set(true);
    this.selectedEquipment = item;
    this.showModal.set(true);
  }

  saveEquipment(payload: Partial<Equipment>): void {
    this.modalSaving.set(true);

    if (this.isEditing() && this.selectedEquipment) {
      this.equipmentService.updateEquipment(this.selectedEquipment.id, payload).subscribe({
        next: () => {
          this.modalSaving.set(false);
          this.showModal.set(false);
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
          this.showModal.set(false);
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

  openRequestModal(item: Equipment): void {
    this.selectedEquipment = item;
    this.showRequestModal.set(true);
  }

  submitRequest(event: CheckoutSubmitEvent): void {
    this.requestSubmitting.set(true);
    this.requestService.createRequest({
      equipmentId: event.equipmentId,
      quantity: event.quantity,
      reason: event.reason
    }).subscribe({
      next: () => {
        this.requestSubmitting.set(false);
        this.showRequestModal.set(false);
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
