import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-xs font-medium text-slate-500">{{ title }}</p>
          <h3 [ngClass]="valueColorClass" class="text-2xl font-bold mt-1">{{ value }}</h3>
          <p class="text-[11px] text-slate-400 mt-0.5">{{ subtitle }}</p>
        </div>
        <div [ngClass]="iconBgClass" class="w-11 h-11 rounded-xl flex items-center justify-center">
          <ng-content select="[card-icon]"></ng-content>
        </div>
      </div>
    </div>
  `
})
export class StatCardComponent {
  @Input() title = '';
  @Input() value: number | string = 0;
  @Input() subtitle = '';
  @Input() type: 'default' | 'blue' | 'amber' | 'rose' | 'emerald' = 'default';

  get valueColorClass(): string {
    switch (this.type) {
      case 'blue': return 'text-blue-600';
      case 'amber': return 'text-amber-600';
      case 'rose': return 'text-rose-600';
      case 'emerald': return 'text-emerald-600';
      default: return 'text-slate-900';
    }
  }

  get iconBgClass(): string {
    switch (this.type) {
      case 'blue': return 'bg-blue-50 text-blue-600';
      case 'amber': return 'bg-amber-50 text-amber-600';
      case 'rose': return 'bg-rose-50 text-rose-600';
      case 'emerald': return 'bg-emerald-50 text-emerald-600';
      default: return 'bg-slate-100 text-slate-600';
    }
  }
}
