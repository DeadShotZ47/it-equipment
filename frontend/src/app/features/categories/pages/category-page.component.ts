import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoryService } from '../services/category.service';
import { Category } from '../models/category.model';
import { CategoryFormModalComponent } from '../components/category-form-modal.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-category-page',
  standalone: true,
  imports: [CommonModule, CategoryFormModalComponent, EmptyStateComponent],
  template: `
    <div class="space-y-5">
      <!-- Title Bar -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-slate-900 tracking-tight">หมวดหมู่อุปกรณ์ (Equipment Categories)</h1>
          <p class="text-xs text-slate-500 mt-1">จัดการประเภทหมวดหมู่อุปกรณ์และของสิ้นเปลืองแบบยืดหยุ่น (Dynamic Categories)</p>
        </div>
        <button (click)="openAddModal()"
                class="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm shadow-blue-600/20 transition">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          + เพิ่มหมวดหมู่ใหม่
        </button>
      </div>

      <!-- Categories Table -->
      <div class="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <table class="min-w-full divide-y divide-slate-200 text-left text-xs">
          <thead class="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider">
            <tr>
              <th class="px-6 py-3.5">ชื่อหมวดหมู่</th>
              <th class="px-6 py-3.5">คำอธิบาย</th>
              <th class="px-6 py-3.5">จำนวนอุปกรณ์ที่ผูกอยู่</th>
              <th class="px-6 py-3.5 text-right">การดำเนินการ</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-slate-700">
            <tr *ngFor="let cat of categories()" class="hover:bg-slate-50/80 transition">
              <td class="px-6 py-4 font-semibold text-slate-900 flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 shadow-2xs">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                {{ cat.name }}
              </td>
              <td class="px-6 py-4 text-slate-500">{{ cat.description || '-' }}</td>
              <td class="px-6 py-4">
                <span class="px-2.5 py-1 rounded-full bg-slate-100 font-medium text-slate-800 text-[11px]">
                  {{ cat._count?.equipment ?? 0 }} ชิ้น
                </span>
              </td>
              <td class="px-6 py-4 text-right space-x-3">
                <button (click)="openEditModal(cat)" class="text-blue-600 hover:text-blue-800 font-medium transition">แก้ไข</button>
                <button (click)="deleteCategory(cat)" class="text-rose-600 hover:text-rose-800 font-medium transition">ลบ</button>
              </td>
            </tr>
            <tr *ngIf="categories().length === 0">
              <td colspan="4" class="px-6 py-8 text-center text-slate-400">
                <app-empty-state icon="🏷️" title="ยังไม่มีหมวดหมู่" description="คลิกปุ่มเพิ่มหมวดหมู่เพื่อสร้างรายการแรก" actionText="+ เพิ่มหมวดหมู่" (action)="openAddModal()"></app-empty-state>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Add/Edit Form Modal -->
      <app-category-form-modal
        [isOpen]="showModal()"
        [isEditing]="isEditing()"
        [category]="selectedCategory"
        [isSaving]="saving()"
        (save)="saveCategory($event)"
        (close)="showModal.set(false)">
      </app-category-form-modal>
    </div>
  `
})
export class CategoryPageComponent implements OnInit {
  categoryService = inject(CategoryService);
  categories = signal<Category[]>([]);

  showModal = signal(false);
  isEditing = signal(false);
  selectedCategory: Category | null = null;
  saving = signal(false);

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (data) => this.categories.set(data)
    });
  }

  openAddModal(): void {
    this.isEditing.set(false);
    this.selectedCategory = null;
    this.showModal.set(true);
  }

  openEditModal(cat: Category): void {
    this.isEditing.set(true);
    this.selectedCategory = cat;
    this.showModal.set(true);
  }

  saveCategory(payload: { name: string; description?: string }): void {
    this.saving.set(true);

    if (this.isEditing() && this.selectedCategory) {
      this.categoryService.updateCategory(this.selectedCategory.id, payload).subscribe({
        next: () => {
          this.saving.set(false);
          this.showModal.set(false);
          this.loadCategories();
        },
        error: (err) => {
          this.saving.set(false);
          alert(err.error?.message || 'เกิดข้อผิดพลาดในการแก้ไขหมวดหมู่');
        }
      });
    } else {
      this.categoryService.createCategory(payload).subscribe({
        next: () => {
          this.saving.set(false);
          this.showModal.set(false);
          this.loadCategories();
        },
        error: (err) => {
          this.saving.set(false);
          alert(err.error?.message || 'เกิดข้อผิดพลาดในการสร้างหมวดหมู่');
        }
      });
    }
  }

  deleteCategory(cat: Category): void {
    if (!confirm(`คุณต้องการลบหมวดหมู่ "${cat.name}" ใช่หรือไม่?`)) return;
    this.categoryService.deleteCategory(cat.id).subscribe({
      next: () => this.loadCategories(),
      error: (err) => alert(err.error?.message || 'ไม่สามารถลบหมวดหมู่ได้')
    });
  }
}
