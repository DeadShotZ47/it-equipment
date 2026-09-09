import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-equipment-qr-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div class="bg-white rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
        <h3 class="text-base font-bold text-slate-900">QR Code ประจำอุปกรณ์</h3>
        <p class="text-xs text-slate-500 mt-1 mb-4">{{ equipmentName }}</p>

        <div class="bg-slate-50 p-4 rounded-xl border border-slate-200 inline-block mb-4 shadow-inner">
          <img *ngIf="qrDataUrl" [src]="qrDataUrl" alt="QR Code" class="w-48 h-48 mx-auto" />
        </div>

        <p class="text-xs font-mono font-semibold text-slate-700 bg-slate-100 py-1 px-3 rounded-md mb-5 inline-block">
          {{ qrCodeValue }}
        </p>

        <div class="flex gap-2 justify-center">
          <button (click)="close.emit()" class="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg">ปิด</button>
          <button (click)="printQr()" class="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm">
            🖨️ พิมพ์ป้ายบาร์โค้ด
          </button>
        </div>
      </div>
    </div>
  `
})
export class EquipmentQrModalComponent {
  @Input() isOpen = false;
  @Input() equipmentName = '';
  @Input() qrCodeValue = '';
  @Input() qrDataUrl = '';
  @Output() close = new EventEmitter<void>();

  printQr(): void {
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(`
        <html>
          <head><title>พิมพ์ QR Code - ${this.equipmentName}</title></head>
          <body style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh; font-family:sans-serif;">
            <h2 style="margin-bottom:4px;">${this.equipmentName}</h2>
            <p style="font-family:monospace; margin-bottom:16px;">${this.qrCodeValue}</p>
            <img src="${this.qrDataUrl}" style="width:280px; height:280px;" />
            <script>window.print();</script>
          </body>
        </html>
      `);
      win.document.close();
    }
  }
}
