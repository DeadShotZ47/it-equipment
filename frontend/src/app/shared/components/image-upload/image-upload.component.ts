import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-image-upload',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-2">
      <div class="flex items-center justify-between">
        <label class="block text-xs font-semibold text-slate-700 uppercase">{{ label }}</label>
        <button type="button" (click)="toggleMode()" class="text-[11px] text-blue-600 hover:underline">
          {{ useCustomUrl ? '📁 สลับไปอัปโหลดไฟล์จากเครื่อง' : '🔗 สลับไปใส่เป็น URL' }}
        </button>
      </div>

      <!-- Upload File Mode -->
      <div *ngIf="!useCustomUrl" class="space-y-2">
        <div *ngIf="imageUrl" class="relative w-28 h-28 rounded-xl overflow-hidden border border-slate-200 shadow-xs group">
          <img [src]="imageUrl" class="w-full h-full object-cover" alt="Uploaded Image" />
          <button type="button" (click)="removeImage()"
                  class="absolute top-1.5 right-1.5 p-1 rounded-full bg-rose-600 text-white opacity-90 hover:opacity-100 shadow-sm transition" title="ลบรูปภาพ">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div *ngIf="!imageUrl"
             class="border-2 border-dashed border-slate-300 hover:border-blue-400 rounded-xl p-4 text-center cursor-pointer transition bg-slate-50/60 hover:bg-blue-50/30"
             (click)="fileInput.click()">
          <svg class="w-8 h-8 mx-auto text-slate-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p class="text-xs font-medium text-slate-700">คลิกเพื่อเลือกไฟล์รูปภาพจากเครื่อง</p>
          <p class="text-[10px] text-slate-400 mt-0.5">รองรับ JPG, PNG, WEBP ขนาดไม่เกิน 5MB</p>
        </div>
        <input #fileInput type="file" accept="image/*" class="hidden" (change)="onFileSelected($event)" />
      </div>

      <!-- Custom URL Mode -->
      <div *ngIf="useCustomUrl" class="space-y-2">
        <input type="url" [ngModel]="imageUrl" (ngModelChange)="onUrlChange($event)"
               placeholder="https://images.unsplash.com/... หรือ URL รูปภาพ"
               class="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
        <div *ngIf="imageUrl" class="w-24 h-24 rounded-lg overflow-hidden border border-slate-200 shadow-xs">
          <img [src]="imageUrl" class="w-full h-full object-cover" (error)="removeImage()" alt="Preview" />
        </div>
      </div>
    </div>
  `
})
export class ImageUploadComponent {
  @Input() label = 'รูปภาพอุปกรณ์';
  @Input() imageUrl = '';
  @Output() imageUrlChange = new EventEmitter<string>();

  useCustomUrl = false;

  toggleMode() {
    this.useCustomUrl = !this.useCustomUrl;
  }

  onFileSelected(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('ขนาดไฟล์ต้องไม่เกิน 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      this.imageUrl = result;
      this.imageUrlChange.emit(result);
    };
    reader.readAsDataURL(file);
  }

  onUrlChange(val: string) {
    this.imageUrl = val;
    this.imageUrlChange.emit(val);
  }

  removeImage() {
    this.imageUrl = '';
    this.imageUrlChange.emit('');
  }
}
