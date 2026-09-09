import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService, CreateUserDto, UpdateUserDto } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { User, Role } from '../../core/models/types';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>👥</span> จัดการผู้ใช้งาน (User Management)
          </h1>
          <p class="text-xs text-slate-500 mt-1">
            จัดการบัญชีผู้ใช้งาน กำหนดสิทธิ์แอดมิน/พนักงาน และควบคุมสถานะการเข้าสู่ระบบ
          </p>
        </div>

        <button (click)="openCreateModal()"
                class="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          เพิ่มผู้ใช้งานใหม่
        </button>
      </div>

      <!-- Quick Summary Cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div class="text-xs font-medium text-slate-500">ผู้ใช้ทั้งหมด</div>
          <div class="text-2xl font-bold text-slate-900 mt-1">{{ totalCount() }}</div>
        </div>
        <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div class="text-xs font-medium text-indigo-600">ผู้ดูแลระบบ (Admin)</div>
          <div class="text-2xl font-bold text-indigo-600 mt-1">{{ adminCount() }}</div>
        </div>
        <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div class="text-xs font-medium text-emerald-600">พนักงานทั่วไป (User)</div>
          <div class="text-2xl font-bold text-emerald-600 mt-1">{{ userCount() }}</div>
        </div>
        <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div class="text-xs font-medium text-rose-500">ระงับการใช้งาน (Inactive)</div>
          <div class="text-2xl font-bold text-rose-600 mt-1">{{ inactiveCount() }}</div>
        </div>
      </div>

      <!-- Filter Toolbar -->
      <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-3">
        <div class="flex-1 min-w-[220px]">
          <div class="relative">
            <svg class="w-4 h-4 absolute left-3 top-2.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" [(ngModel)]="searchQuery" (input)="onSearchChange()"
                   placeholder="ค้นหาชื่อ, รหัสพนักงาน, อีเมล หรือแผนก..."
                   class="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white" />
          </div>
        </div>

        <select [(ngModel)]="selectedRole" (change)="loadUsers()"
                class="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500">
          <option value="">สิทธิ์ทั้งหมด (All Roles)</option>
          <option value="ADMIN">ผู้ดูแลระบบ (ADMIN)</option>
          <option value="USER">พนักงาน (USER)</option>
        </select>

        <select [(ngModel)]="selectedStatus" (change)="loadUsers()"
                class="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500">
          <option value="">สถานะทั้งหมด (All Status)</option>
          <option value="active">เปิดใช้งาน (Active)</option>
          <option value="inactive">ระงับการใช้งาน (Inactive)</option>
        </select>

        <button *ngIf="searchQuery || selectedRole || selectedStatus" (click)="resetFilters()"
                class="px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition">
          ล้างตัวกรอง
        </button>
      </div>

      <!-- Users Table -->
      <div class="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th class="py-3 px-4">ผู้ใช้งาน</th>
                <th class="py-3 px-4">อีเมล</th>
                <th class="py-3 px-4">แผนก / ฝ่าย</th>
                <th class="py-3 px-4">สิทธิ์การใช้งาน</th>
                <th class="py-3 px-4">สถานะ</th>
                <th class="py-3 px-4 text-center">ประวัติคำขอ</th>
                <th class="py-3 px-4 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-xs">
              <tr *ngIf="loading()" class="text-center py-8">
                <td colspan="7" class="py-8 text-slate-400">กำลังโหลดข้อมูลผู้ใช้งาน...</td>
              </tr>

              <tr *ngIf="!loading() && users().length === 0" class="text-center py-8">
                <td colspan="7" class="py-8 text-slate-400">ไม่พบข้อมูลผู้ใช้งานที่ตรงตามเงื่อนไข</td>
              </tr>

              <tr *ngFor="let u of users()" class="hover:bg-slate-50/80 transition">
                <!-- User Name + Employee ID -->
                <td class="py-3.5 px-4">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs">
                      {{ u.fullName.charAt(0) }}
                    </div>
                    <div>
                      <div class="font-semibold text-slate-900 flex items-center gap-1.5">
                        {{ u.fullName }}
                        <span *ngIf="u.id === currentUserId" class="px-1.5 py-0.5 rounded text-[10px] bg-blue-100 text-blue-700 font-normal">(คุณ)</span>
                      </div>
                      <div class="text-[11px] text-slate-500 flex items-center gap-1">
                        <span class="font-mono bg-slate-100 px-1 rounded">{{ u.employeeId }}</span>
                      </div>
                    </div>
                  </div>
                </td>

                <!-- Email -->
                <td class="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                  {{ u.email }}
                </td>

                <!-- Department -->
                <td class="py-3.5 px-4 text-slate-600">
                  <span *ngIf="u.department" class="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px]">
                    {{ u.department }}
                  </span>
                  <span *ngIf="!u.department" class="text-slate-400 text-[11px]">-</span>
                </td>

                <!-- Role Badge -->
                <td class="py-3.5 px-4">
                  <span *ngIf="u.role === 'ADMIN'"
                        class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700">
                    🛡️ ผู้ดูแลระบบ
                  </span>
                  <span *ngIf="u.role === 'USER'"
                        class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                    👤 พนักงาน
                  </span>
                </td>

                <!-- Status Badge -->
                <td class="py-3.5 px-4">
                  <span *ngIf="u.isActive !== false"
                        class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium text-emerald-700 bg-emerald-50">
                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> ใช้งานปกติ
                  </span>
                  <span *ngIf="u.isActive === false"
                        class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium text-rose-700 bg-rose-50">
                    <span class="w-1.5 h-1.5 rounded-full bg-rose-500"></span> ระงับการใช้งาน
                  </span>
                </td>

                <!-- Request Count -->
                <td class="py-3.5 px-4 text-slate-600 text-center">
                  <span class="font-semibold text-slate-800">{{ u._count?.requests || 0 }}</span> รายการ
                </td>

                <!-- Actions -->
                <td class="py-3.5 px-4 text-right">
                  <div class="inline-flex items-center gap-1.5">
                    <button (click)="openEditModal(u)"
                            class="px-2.5 py-1 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition">
                      แก้ไข
                    </button>
                    <button *ngIf="u.id !== currentUserId" (click)="openDeleteModal(u)"
                            class="px-2.5 py-1 text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-md transition">
                      ลบ/ระงับ
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ================= CREATE / EDIT USER MODAL ================= -->
      <div *ngIf="showModal()" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
        <div class="bg-white rounded-2xl shadow-xl border border-slate-100 w-full max-w-lg overflow-hidden my-8">
          <div class="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
            <h3 class="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>{{ isEditing() ? '✏️ แก้ไขข้อมูลผู้ใช้งาน' : '➕ เพิ่มผู้ใช้งานใหม่' }}</span>
            </h3>
            <button (click)="closeModal()" class="text-slate-400 hover:text-slate-600 text-lg">✕</button>
          </div>

          <form (ngSubmit)="saveUser()" class="p-6 space-y-4">
            <div *ngIf="modalError()" class="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
              {{ modalError() }}
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
                        class="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="USER">👤 พนักงาน (USER)</option>
                  <option value="ADMIN">🛡️ ผู้ดูแลระบบ (ADMIN)</option>
                </select>
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">สถานะการใช้งาน</label>
                <select [(ngModel)]="formIsActive" name="formIsActive"
                        class="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option [ngValue]="true">✅ เปิดใช้งาน (Active)</option>
                  <option [ngValue]="false">⛔ ระงับการใช้งาน (Inactive)</option>
                </select>
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">
                {{ isEditing() ? 'รหัสผ่านใหม่ (เว้นว่างไว้ถ้าไม่ต้องการเปลี่ยน)' : 'รหัสผ่าน (Password) *' }}
              </label>
              <input type="password" [(ngModel)]="formPassword" name="formPassword"
                     [required]="!isEditing()"
                     placeholder="อย่างน้อย 6 ตัวอักษร"
                     class="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div class="flex justify-end gap-2 pt-4 border-t border-slate-100">
              <button (click)="closeModal()" type="button"
                      class="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg">
                ยกเลิก
              </button>
              <button type="submit" [disabled]="modalLoading()"
                      class="px-5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm disabled:opacity-50 flex items-center gap-1.5">
                <span *ngIf="modalLoading()" class="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent"></span>
                <span>{{ isEditing() ? 'บันทึกการแก้ไข' : 'สร้างผู้ใช้' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- ================= DELETE / DEACTIVATE CONFIRM MODAL ================= -->
      <div *ngIf="showDeleteModal()" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
        <div class="bg-white rounded-2xl shadow-xl border border-slate-100 w-full max-w-sm p-6 text-center">
          <div class="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3 text-xl">
            ⚠️
          </div>
          <h3 class="text-sm font-bold text-slate-900">ยืนยันการลบหรือระงับผู้ใช้งาน</h3>
          <p class="text-xs text-slate-500 mt-2">
            คุณต้องการจัดการบัญชีของ <span class="font-semibold text-slate-800">"{{ selectedUser?.fullName }}"</span> ใช่หรือไม่?
          </p>
          <p class="text-[11px] text-amber-600 bg-amber-50 p-2 rounded-lg mt-3">
            * หากผู้ใช้นี้เคยมีประวัติการเบิกอุปกรณ์ ระบบจะทำการ "ระงับการใช้งาน" แทนการลบถาวร เพื่อรักษาความสมบูรณ์ของประวัติ
          </p>

          <div class="flex justify-center gap-2 mt-6">
            <button (click)="showDeleteModal.set(false)" type="button"
                    class="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg">
              ยกเลิก
            </button>
            <button (click)="confirmDelete()" [disabled]="modalLoading()" type="button"
                    class="px-4 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-sm disabled:opacity-50">
              {{ modalLoading() ? 'กำลังดำเนินการ...' : 'ยืนยันดำเนินการ' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class UserListComponent implements OnInit {
  userService = inject(UserService);
  authService = inject(AuthService);

  users = signal<User[]>([]);
  loading = signal(false);
  currentUserId = '';

  // Filters
  searchQuery = '';
  selectedRole = '';
  selectedStatus = '';

  // Computed stats
  totalCount = signal(0);
  adminCount = signal(0);
  userCount = signal(0);
  inactiveCount = signal(0);

  // Modal states
  showModal = signal(false);
  isEditing = signal(false);
  modalLoading = signal(false);
  modalError = signal<string | null>(null);

  showDeleteModal = signal(false);
  selectedUser: User | null = null;

  // Form inputs
  editUserId = '';
  formFullName = '';
  formEmployeeId = '';
  formDepartment = '';
  formEmail = '';
  formRole: Role = 'USER';
  formIsActive = true;
  formPassword = '';

  private searchTimeout: any;

  ngOnInit(): void {
    this.currentUserId = this.authService.currentUser()?.id || '';
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading.set(true);
    this.userService.getUsers({
      search: this.searchQuery,
      role: this.selectedRole,
      status: this.selectedStatus
    }).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.users.set(res.items);
        this.updateStats(res.items);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  updateStats(items: User[]): void {
    this.totalCount.set(items.length);
    this.adminCount.set(items.filter(u => u.role === 'ADMIN').length);
    this.userCount.set(items.filter(u => u.role === 'USER').length);
    this.inactiveCount.set(items.filter(u => u.isActive === false).length);
  }

  onSearchChange(): void {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.loadUsers();
    }, 300);
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.selectedRole = '';
    this.selectedStatus = '';
    this.loadUsers();
  }

  openCreateModal(): void {
    this.isEditing.set(false);
    this.modalError.set(null);
    this.editUserId = '';
    this.formFullName = '';
    this.formEmployeeId = `EMP-${Date.now().toString().slice(-4)}`;
    this.formDepartment = '';
    this.formEmail = '';
    this.formRole = 'USER';
    this.formIsActive = true;
    this.formPassword = '';
    this.showModal.set(true);
  }

  openEditModal(u: User): void {
    this.isEditing.set(true);
    this.modalError.set(null);
    this.editUserId = u.id;
    this.formFullName = u.fullName;
    this.formEmployeeId = u.employeeId;
    this.formDepartment = u.department || '';
    this.formEmail = u.email;
    this.formRole = u.role;
    this.formIsActive = u.isActive !== false;
    this.formPassword = '';
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  saveUser(): void {
    if (!this.formFullName.trim() || !this.formEmail.trim() || !this.formEmployeeId.trim()) {
      this.modalError.set('กรุณากรอกชื่อ-นามสกุล, รหัสพนักงาน และอีเมล');
      return;
    }

    if (!this.isEditing() && (!this.formPassword || this.formPassword.length < 6)) {
      this.modalError.set('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
      return;
    }

    this.modalLoading.set(true);
    this.modalError.set(null);

    if (this.isEditing()) {
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

      this.userService.updateUser(this.editUserId, updatePayload).subscribe({
        next: () => {
          this.modalLoading.set(false);
          this.closeModal();
          this.loadUsers();
        },
        error: (err) => {
          this.modalLoading.set(false);
          this.modalError.set(err.error?.message || 'ไม่สามารถแก้ไขข้อมูลได้');
        }
      });
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

      this.userService.createUser(createPayload).subscribe({
        next: () => {
          this.modalLoading.set(false);
          this.closeModal();
          this.loadUsers();
        },
        error: (err) => {
          this.modalLoading.set(false);
          this.modalError.set(err.error?.message || 'ไม่สามารถสร้างผู้ใช้งานได้');
        }
      });
    }
  }

  openDeleteModal(u: User): void {
    this.selectedUser = u;
    this.showDeleteModal.set(true);
  }

  confirmDelete(): void {
    if (!this.selectedUser) return;
    this.modalLoading.set(true);

    this.userService.deleteUser(this.selectedUser.id).subscribe({
      next: () => {
        this.modalLoading.set(false);
        this.showDeleteModal.set(false);
        this.selectedUser = null;
        this.loadUsers();
      },
      error: (err) => {
        this.modalLoading.set(false);
        alert(err.error?.message || 'ไม่สามารถลบหรือระงับผู้ใช้งานได้');
      }
    });
  }
}
