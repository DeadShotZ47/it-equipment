import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Equipment } from '../models/equipment.model';
import { Category } from '../../categories/models/category.model';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { ImageUploadComponent } from '../../../shared/components/image-upload/image-upload.component';

@Component({
  selector: 'app-equipment-form-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent, ImageUploadComponent],
  template: `
    <app-modal [isOpen]="isOpen" [title]="isEditing ? 'แก้ไขข้อมูลอุปกรณ์' : 'เพิ่มอุปกรณ์ใหม่เข้าคลัง'" maxWidth="lg" (close)="onCancel()">
      <form (ngSubmit)="onSubmit()" class="space-y-4">
        <!-- Hybrid Inventory Switch -->
        <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
          <div>
            <span class="text-xs font-bold text-slate-800 block">พฤติกรรมการจัดการคลัง (Hybrid)</span>
            <p class="text-[11px] text-slate-500">
              {{ formIsConsumable ? 'ของสิ้นเปลือง: ตัดยอดสต็อกทันที (ไม่ต้องส่งคืน)' : 'สินทรัพย์ถาวร: บังคับระบุ Serial# และมีรอบยืม-คืน' }}
            </p>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" [(ngModel)]="formIsConsumable" name="isConsumable" class="sr-only peer" (change)="onConsumableToggle()" />
            <div class="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <!-- Equipment Name -->
        <div>
          <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">ชื่ออุปกรณ์ *</label>
          <input type="text" [(ngModel)]="formName" name="name" required placeholder="เช่น MacBook Pro 16 นิ้ว หรือ สาย HDMI 2.1"
                 class="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
        </div>

        <!-- Category -->
        <div>
          <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">หมวดหมู่อุปกรณ์ *</label>
          <select [(ngModel)]="formCategoryId" name="categoryId" required
                  class="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white">
            <option value="" disabled>เลือกหมวดหมู่...</option>
            <option *ngFor="let cat of categories" [value]="cat.id">{{ cat.name }}</option>
          </select>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <!-- Serial Number (Only if NOT consumable) -->
          <div *ngIf="!formIsConsumable">
            <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">หมายเลขซีเรียล (Serial Number) *</label>
            <input type="text" [(ngModel)]="formSerialNumber" name="serialNumber" [required]="!formIsConsumable" placeholder="เช่น C02DF123GJK4"
                   class="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono" />
          </div>

          <!-- Quantity (Only if Consumable) -->
          <div *ngIf="formIsConsumable">
            <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">จำนวนคงเหลือในสต็อก *</label>
            <input type="number" min="0" [(ngModel)]="formQuantity" name="quantity" required
                   class="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
          </div>

          <!-- Status -->
          <div>
            <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">สถานะอุปกรณ์</label>
            <select [(ngModel)]="formStatus" name="status"
                    class="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white">
              <option value="AVAILABLE">พร้อมใช้งาน (Available)</option>
              <option value="CHECKED_OUT">กำลังถูกยืม (Checked Out)</option>
              <option value="MAINTENANCE">ซ่อมบำรุง (Maintenance)</option>
              <option value="RETIRED">เลิกใช้งาน (Retired)</option>
            </select>
          </div>
        </div>

        <!-- Location -->
        <div>
          <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">สถานที่จัดเก็บ / ตู้เก็บของ</label>
          <input type="text" [(ngModel)]="formLocation" name="location" placeholder="เช่น ตู้เก็บอุปกรณ์ IT ชั้น A, ลิ้นชัก 2"
                 class="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
        </div>

        <!-- Image Upload Component -->
        <app-image-upload [(imageUrl)]="formImageUrl" label="รูปภาพอุปกรณ์ (Equipment Image)"></app-image-upload>

        <!-- Description -->
        <div>
          <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">รายละเอียด / สเปกเพิ่มเติม</label>
          <textarea [(ngModel)]="formDescription" name="description" rows="2" placeholder="ระบุข้อมูลสเปก สภาพการใช้งาน หรือหมายเหตุ..."
                    class="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"></textarea>
        </div>

        <!-- Buttons -->
        <div class="pt-3 border-t border-slate-200 flex justify-end gap-2">
          <button type="button" (click)="onCancel()" class="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition">ยกเลิก</button>
          <button type="submit" [disabled]="isSaving"
                  class="px-5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition disabled:opacity-50">
            {{ isSaving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล' }}
          </button>
        </div>
      </form>
    </app-modal>
  `
})
export class EquipmentFormModalComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() isEditing = false;
  @Input() equipment: Equipment | null = null;
  @Input() categories: Category[] = [];
  @Input() isSaving = false;

  @Output() save = new EventEmitter<Partial<Equipment>>();
  @Output() close = new EventEmitter<void>();

  formName = '';
  formCategoryId = '';
  formSerialNumber = '';
  formIsConsumable = false;
  formQuantity = 1;
  formStatus: any = 'AVAILABLE';
  formLocation = '';
  formDescription = '';
  formImageUrl = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && this.isOpen) {
      if (this.isEditing && this.equipment) {
        this.formName = this.equipment.name;
        this.formCategoryId = this.equipment.categoryId;
        this.formSerialNumber = this.equipment.serialNumber || '';
        this.formIsConsumable = this.equipment.isConsumable;
        this.formQuantity = this.equipment.quantity;
        this.formStatus = this.equipment.status;
        this.formLocation = this.equipment.location || '';
        this.formDescription = this.equipment.description || '';
        this.formImageUrl = this.equipment.imageUrl || '';
      } else {
        this.resetForm();
      }
    }
  }

  onConsumableToggle(): void {
    if (this.formIsConsumable) {
      this.formSerialNumber = '';
      if (this.formQuantity < 1) this.formQuantity = 1;
    } else {
      this.formQuantity = 1;
    }
  }

  resetForm(): void {
    this.formName = '';
    this.formCategoryId = this.categories.length > 0 ? this.categories[0].id : '';
    this.formSerialNumber = '';
    this.formIsConsumable = false;
    this.formQuantity = 1;
    this.formStatus = 'AVAILABLE';
    this.formLocation = '';
    this.formDescription = '';
    this.formImageUrl = '';
  }

  onSubmit(): void {
    if (!this.formName || !this.formCategoryId) return;

    const payload: Partial<Equipment> = {
      name: this.formName.trim(),
      categoryId: this.formCategoryId,
      serialNumber: this.formIsConsumable ? null : (this.formSerialNumber.trim() || null),
      isConsumable: this.formIsConsumable,
      quantity: this.formIsConsumable ? Number(this.formQuantity) : 1,
      status: this.formStatus,
      location: this.formLocation.trim() || null,
      description: this.formDescription.trim() || null,
      imageUrl: this.formImageUrl.trim() || null
    };

    this.save.emit(payload);
  }

  onCancel(): void {
    this.close.emit();
  }
}
