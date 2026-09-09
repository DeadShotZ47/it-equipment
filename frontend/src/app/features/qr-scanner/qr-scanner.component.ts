import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { RequestService } from '../../core/services/request.service';

@Component({
  selector: 'app-qr-scanner',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-2xl mx-auto space-y-6">
      <!-- Title -->
      <div class="text-center">
        <h1 class="text-2xl font-bold text-slate-900 tracking-tight">สแกน QR Code รับ-คืนอุปกรณ์ (Check-In / Out)</h1>
        <p class="text-xs text-slate-500 mt-1">สแกน QR Code ประจำอุปกรณ์เพื่อยืนยันการรับของ หรือบันทึกส่งคืนเข้าคลังทันที</p>
      </div>

      <!-- Scanner Card -->
      <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm overflow-hidden">
        <!-- Interactive Camera Scanner Viewport -->
        <div id="reader" class="rounded-xl overflow-hidden border border-slate-100 bg-slate-50 mb-4 min-h-[280px]"></div>

        <!-- Manual Code Input Fallback -->
        <div class="pt-4 border-t border-slate-200">
          <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">หรือกรอกรหัสอุปกรณ์ด้วยตนเอง (Manual Input)</label>
          <div class="flex gap-2">
            <input type="text" [(ngModel)]="manualCode" placeholder="เช่น EQ-MBP16-001 หรือ C02DF123GJK4"
                   (keyup.enter)="processCode(manualCode)"
                   class="flex-1 px-3.5 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono" />
            <button (click)="processCode(manualCode)" [disabled]="!manualCode || processing()"
                    class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition disabled:opacity-50">
              {{ processing() ? 'กำลังตรวจสอบ...' : 'ตรวจสอบรหัส' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Scan Result Card -->
      <div *ngIf="scanResult()" class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm animate-in fade-in zoom-in-95 duration-150">
        <div class="flex items-start gap-4">
          <div class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-xl font-bold"
               [ngClass]="scanResult().success ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-rose-50 text-rose-600 border border-rose-200'">
            {{ scanResult().success ? '✓' : '✕' }}
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <h3 class="text-sm font-bold text-slate-900">{{ scanResult().message }}</h3>
              <span class="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                {{ getActionLabel(scanResult().action) }}
              </span>
            </div>

            <!-- Equipment details -->
            <div *ngIf="scanResult().equipment" class="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-150 text-xs space-y-1">
              <p class="font-bold text-slate-800">{{ scanResult().equipment.name }}</p>
              <p class="text-slate-500">หมวดหมู่: <span class="text-slate-700 font-medium">{{ scanResult().equipment.category?.name || '-' }}</span></p>
              <p *ngIf="scanResult().equipment.serialNumber" class="text-slate-500">
                หมายเลขซีเรียล: <span class="font-mono text-slate-700 font-medium">{{ scanResult().equipment.serialNumber }}</span>
              </p>
              <p class="text-slate-500">
                ประเภท: <span class="font-medium" [ngClass]="scanResult().equipment.isConsumable ? 'text-purple-600' : 'text-blue-600'">
                  {{ scanResult().equipment.isConsumable ? 'ของสิ้นเปลือง' : 'สินทรัพย์ถาวร' }}
                </span>
              </p>
              <p class="text-slate-500">สถานที่จัดเก็บ: <span class="text-slate-700">{{ scanResult().equipment.location || 'คลังอุปกรณ์' }}</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class QrScannerComponent implements OnInit, OnDestroy {
  requestService = inject(RequestService);

  scanner: Html5QrcodeScanner | null = null;
  manualCode = '';
  processing = signal(false);
  scanResult = signal<any | null>(null);

  ngOnInit(): void {
    setTimeout(() => {
      this.initScanner();
    }, 200);
  }

  ngOnDestroy(): void {
    if (this.scanner) {
      try {
        this.scanner.clear();
      } catch (e) {}
    }
  }

  private initScanner(): void {
    try {
      this.scanner = new Html5QrcodeScanner(
        'reader',
        {
          fps: 10,
          qrbox: { width: 220, height: 220 },
          aspectRatio: 1.0
        },
        /* verbose= */ false
      );

      this.scanner.render(
        (decodedText: string) => {
          let code = decodedText;
          try {
            const parsed = JSON.parse(decodedText);
            if (parsed.code) code = parsed.code;
            else if (parsed.id) code = parsed.id;
          } catch (e) {}

          this.processCode(code);
        },
        () => {}
      );
    } catch (e) {
      console.warn('Camera scanner initialization failed:', e);
    }
  }

  getActionLabel(action: string): string {
    switch (action) {
      case 'CONFIRM_RECEIVE': return 'ยืนยันการรับอุปกรณ์';
      case 'CONFIRM_RETURN': return 'ยืนยันการส่งคืนสำเร็จ';
      case 'EQUIPMENT_INFO': return 'ข้อมูลอุปกรณ์';
      case 'ALREADY_PROCESSED': return 'ดำเนินการเสร็จสิ้นแล้ว';
      default: return action;
    }
  }

  processCode(code: string): void {
    if (!code || this.processing()) return;
    this.processing.set(true);

    this.requestService.confirmQrScan(code.trim()).subscribe({
      next: (res) => {
        this.processing.set(false);
        this.scanResult.set(res);
        this.manualCode = '';
      },
      error: (err) => {
        this.processing.set(false);
        this.scanResult.set({
          success: false,
          action: 'ERROR',
          message: err.error?.message || 'ไม่สามารถประมวลผล QR Code ได้'
        });
      }
    });
  }
}
