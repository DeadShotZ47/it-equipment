import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { User, Role, CreateUserDto, UpdateUserDto } from '../models/user.model';
import { ModalComponent } from '../../../shared/components/modal/modal.component';

@Component({
  selector: 'app-user-form-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent],
  template: `
    <app-modal [isOpen]="isOpen" [title]="isEditing ? '✏️ แก้ไขข้อมูลผู้ใช้งาน' : '➕ เพิ่มผู้ใช้งานใหม่'" maxWidth="lg" (close)="onCancel()">
      <form (ngSubmit)="onSubmit()" class="space-y-4">
        <div *ngIf="errorMessage" class="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
          {{ errorMessage }}
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">
            ชื่อ-นามสกุล <span class="text-red-500">*</span>
          </label>
          <input type="text" [(ngModel)]="formFullName" name="formFullName" required
                 placeholder="เช่น สมศักดิ์ สุขสันต์"
                 class="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">
              รหัสพนักงาน <span class="text-red-500">*</span>
            </label>
            <input type="text" [(ngModel)]="formEmployeeId" name="formEmployeeId" required
                   placeholder="เช่น EMP-001"
                   class="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">แผนก / ฝ่าย</label>
            <input type="text" [(ngModel)]="formDepartment" name="formDepartment"
                   placeholder="เช่น IT, HR, การเงิน"
                   class="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">
            อีเมล (Email) <span class="text-red-500">*</span>
          </label>
          <input type="email" [(ngModel)]="formEmail" name="formEmail" required
                 placeholder="user@company.com"
                 class="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">สิทธิ์การใช้งาน (Role)</label>
            <select [(ngModel)]="formRole" name="formRole"
                    class="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
              <option value="USER">👤 พนักงาน (USER)</option>
              <option value="ADMIN">🛡️ ผู้ดูแลระบบ (ADMIN)</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">สถานะการใช้งาน</label>
            <select [(ngModel)]="formIsActive" name="formIsActive"
                    class="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
              <option [ngValue]="true">✅ เปิดใช้งาน (Active)</option>
              <option [ngValue]="false">⛔ ระงับการใช้งาน (Inactive)</option>
            </select>
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">
            {{ isEditing ? 'รหัสผ่านใหม่ (เว้นว่างไว้ถ้าไม่ต้องการเปลี่ยน)' : 'รหัสผ่าน (Password) *' }}
          </label>
          <input type="password" [(ngModel)]="formPassword" name="formPassword"
                 [required]="!isEditing"
                 placeholder="อย่างน้อย 6 ตัวอักษร"
                 class="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <div class="flex justify-end gap-2 pt-4 border-t border-slate-100">
          <button (click)="onCancel()" type="button"
                  class="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg">
            ยกเลิก
          </button>
          <button type="submit" [disabled]="isSaving"
                  class="px-5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm disabled:opacity-50 flex items-center gap-1.5">
            <span *ngIf="isSaving" class="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent"></span>
            <span>{{ isEditing ? 'บันทึกการแก้ไข' : 'สร้างผู้ใช้' }}</span>
          </button>
        </div>
      </form>
    </app-modal>
  `
})
export class UserFormModalComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() isEditing = false;
  @Input() user: User | null = null;
  @Input() isSaving = false;
  @Input() errorMessage: string | null = null;

  @Output() save = new EventEmitter<{ isEditing: boolean; id?: string; payload: CreateUserDto | UpdateUserDto }>();
  @Output() close = new EventEmitter<void>();

  formFullName = '';
  formEmployeeId = '';
  formDepartment = '';
  formEmail = '';
  formRole: Role = 'USER';
  formIsActive = true;
  formPassword = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && this.isOpen) {
      if (this.isEditing && this.user) {
        this.formFullName = this.user.fullName;
        this.formEmployeeId = this.user.employeeId;
        this.formDepartment = this.user.department || '';
        this.formEmail = this.user.email;
        this.formRole = this.user.role;
        this.formIsActive = this.user.isActive !== false;
        this.formPassword = '';
      } else {
        this.formFullName = '';
        this.formEmployeeId = `EMP-${Date.now().toString().slice(-4)}`;
        this.formDepartment = '';
        this.formEmail = '';
        this.formRole = 'USER';
        this.formIsActive = true;
        this.formPassword = '';
      }
    }
  }

  onSubmit(): void {
    if (!this.formFullName.trim() || !this.formEmail.trim() || !this.formEmployeeId.trim()) {
      alert('กรุณากรอกชื่อ-นามสกุล, รหัสพนักงาน และอีเมล');
      return;
    }

    if (!this.isEditing && (!this.formPassword || this.formPassword.length < 6)) {
      alert('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
      return;
    }

    if (this.isEditing && this.user) {
      const updatePayload: UpdateUserDto = {
        fullName: this.formFullName.trim(),
        employeeId: this.formEmployeeId.trim(),
        department: this.formDepartment.trim() || undefined,
        email: this.formEmail.trim().toLowerCase(),
        role: this.formRole,
        isActive: this.formIsActive
      };
      if (this.formPassword && this.formPassword.trim()) {
        updatePayload.password = this.formPassword.trim();
      }
      this.save.emit({ isEditing: true, id: this.user.id, payload: updatePayload });
    } else {
      const createPayload: CreateUserDto = {
        fullName: this.formFullName.trim(),
        employeeId: this.formEmployeeId.trim(),
        department: this.formDepartment.trim() || undefined,
        email: this.formEmail.trim().toLowerCase(),
        password: this.formPassword,
        role: this.formRole,
        isActive: this.formIsActive
      };
      this.save.emit({ isEditing: false, payload: createPayload });
    }
  }

  onCancel(): void {
    this.close.emit();
  }
}
