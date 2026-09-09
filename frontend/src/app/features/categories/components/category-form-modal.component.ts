import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Category } from '../models/category.model';
import { ModalComponent } from '../../../shared/components/modal/modal.component';

@Component({
  selector: 'app-category-form-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent],
  template: `
    <app-modal [isOpen]="isOpen" [title]="isEditing ? 'แก้ไขหมวดหมู่' : 'สร้างหมวดหมู่ใหม่'" maxWidth="md" (close)="onCancel()">
      <form (ngSubmit)="onSubmit()" class="space-y-4">
        <div>
          <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">ชื่อหมวดหมู่ *</label>
          <input type="text" [(ngModel)]="formName" name="name" required placeholder="เช่น โน้ตบุ๊ก, จอภาพ, อุปกรณ์ต่อพ่วง"
                 class="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">คำอธิบาย</label>
          <textarea [(ngModel)]="formDescription" name="description" rows="2" placeholder="ระบุประเภทอุปกรณ์ภายใต้หมวดหมู่นี้..."
                    class="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"></textarea>
        </div>

        <div class="pt-3 border-t border-slate-200 flex justify-end gap-2">
          <button type="button" (click)="onCancel()" class="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg">ยกเลิก</button>
          <button type="submit" [disabled]="isSaving"
                  class="px-5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition disabled:opacity-50">
            {{ isSaving ? 'กำลังบันทึก...' : 'บันทึกหมวดหมู่' }}
          </button>
        </div>
      </form>
    </app-modal>
  `
})
export class CategoryFormModalComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() isEditing = false;
  @Input() category: Category | null = null;
  @Input() isSaving = false;

  @Output() save = new EventEmitter<{ name: string; description?: string }>();
  @Output() close = new EventEmitter<void>();

  formName = '';
  formDescription = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && this.isOpen) {
      if (this.isEditing && this.category) {
        this.formName = this.category.name;
        this.formDescription = this.category.description || '';
      } else {
        this.formName = '';
        this.formDescription = '';
      }
    }
  }

  onSubmit(): void {
    if (!this.formName.trim()) return;
    this.save.emit({
      name: this.formName.trim(),
      description: this.formDescription.trim() || undefined
    });
  }

  onCancel(): void {
    this.close.emit();
  }
}
