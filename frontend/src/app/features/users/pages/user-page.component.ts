import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService, CreateUserDto, UpdateUserDto } from '../services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../models/user.model';
import { UserFormModalComponent } from '../components/user-form-modal.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-user-page',
  standalone: true,
  imports: [CommonModule, FormsModule, UserFormModalComponent, ConfirmDialogComponent, EmptyStateComponent],
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
                <td colspan="7" class="py-8 text-slate-400">
                  <app-empty-state icon="👥" title="ไม่พบข้อมูลผู้ใช้งาน" description="ไม่มีข้อมูลผู้ใช้งานที่ตรงตามเงื่อนไขการค้นหา"></app-empty-state>
                </td>
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

      <!-- Add / Edit Modal -->
      <app-user-form-modal
        [isOpen]="showModal()"
        [isEditing]="isEditing()"
        [user]="selectedUser"
        [isSaving]="modalLoading()"
        [errorMessage]="modalError()"
        (save)="handleSaveUser($event)"
        (close)="showModal.set(false)">
      </app-user-form-modal>

      <!-- Delete / Deactivate Confirm Dialog -->
      <app-confirm-dialog
        [isOpen]="showDeleteModal()"
        title="ยืนยันการลบหรือระงับผู้ใช้งาน"
        [message]="'คุณต้องการจัดการบัญชีของ ' + selectedUser?.fullName + ' ใช่หรือไม่? (* หากมีประวัติการเบิก ระบบจะระงับแทนการลบถาวร)'"
        confirmText="ยืนยันดำเนินการ"
        type="danger"
        [isLoading]="modalLoading()"
        (confirm)="confirmDelete()"
        (cancel)="showDeleteModal.set(false)">
      </app-confirm-dialog>
    </div>
  `
})
export class UserPageComponent implements OnInit {
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
  selectedUser: User | null = null;
  modalLoading = signal(false);
  modalError = signal<string | null>(null);

  showDeleteModal = signal(false);

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
    this.selectedUser = null;
    this.modalError.set(null);
    this.showModal.set(true);
  }

  openEditModal(u: User): void {
    this.isEditing.set(true);
    this.selectedUser = u;
    this.modalError.set(null);
    this.showModal.set(true);
  }

  handleSaveUser(event: { isEditing: boolean; id?: string; payload: CreateUserDto | UpdateUserDto }): void {
    this.modalLoading.set(true);
    this.modalError.set(null);

    if (event.isEditing && event.id) {
      this.userService.updateUser(event.id, event.payload as UpdateUserDto).subscribe({
        next: () => {
          this.modalLoading.set(false);
          this.showModal.set(false);
          this.loadUsers();
        },
        error: (err) => {
          this.modalLoading.set(false);
          this.modalError.set(err.error?.message || 'ไม่สามารถแก้ไขข้อมูลได้');
        }
      });
    } else {
      this.userService.createUser(event.payload as CreateUserDto).subscribe({
        next: () => {
          this.modalLoading.set(false);
          this.showModal.set(false);
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
