import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="isOpen" 
         class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto"
         (click)="onBackdropClick($event)">
      <div [ngClass]="maxWidthClass"
           class="bg-white rounded-2xl w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-8"
           (click)="$event.stopPropagation()">
        <!-- Header -->
        <div class="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <h3 class="text-sm font-bold tracking-wide">{{ title }}</h3>
          <button type="button" (click)="close.emit()" class="text-slate-400 hover:text-white transition">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Body -->
        <div class="p-6">
          <ng-content></ng-content>
        </div>

        <!-- Footer (Optional) -->
        <div *ngIf="showFooter" class="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
          <ng-content select="[modal-footer]"></ng-content>
        </div>
      </div>
    </div>
  `
})
export class ModalComponent {
  @Input() isOpen = false;
  @Input() title = '';
  @Input() maxWidth: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' = 'md';
  @Input() showFooter = false;
  @Input() closeOnBackdrop = true;
  @Output() close = new EventEmitter<void>();

  get maxWidthClass(): string {
    switch (this.maxWidth) {
      case 'sm': return 'max-w-sm';
      case 'md': return 'max-w-md';
      case 'lg': return 'max-w-lg';
      case 'xl': return 'max-w-xl';
      case '2xl': return 'max-w-2xl';
      case '4xl': return 'max-w-4xl';
      default: return 'max-w-lg';
    }
  }

  onBackdropClick(event: MouseEvent) {
    if (this.closeOnBackdrop) {
      this.close.emit();
    }
  }
}
