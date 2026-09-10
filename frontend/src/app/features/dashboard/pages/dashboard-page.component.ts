import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgApexchartsModule } from 'ng-apexcharts';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexStroke,
  ApexYAxis,
  ApexLegend,
  ApexPlotOptions,
  ApexNonAxisChartSeries,
  ApexResponsive,
  ApexTooltip
} from 'ng-apexcharts';
import { DashboardService } from '../services/dashboard.service';
import { DashboardStats, MonthlyTrend, CategoryStat, TrendFilterOptions } from '../models/dashboard.model';
import { StatCardComponent } from '../components/stat-card.component';

export interface BarChartOptions {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  plotOptions: ApexPlotOptions;
  dataLabels: ApexDataLabels;
  stroke: ApexStroke;
  legend: ApexLegend;
  colors: string[];
  tooltip?: ApexTooltip;
}

export interface DonutChartOptions {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  labels: string[];
  responsive: ApexResponsive[];
  legend: ApexLegend;
  colors: string[];
}

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule, FormsModule, NgApexchartsModule, StatCardComponent],
  template: `
    <div class="space-y-6">
      <!-- Page Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-slate-900 tracking-tight">แดชบอร์ดภาพรวมผู้บริหาร (Executive Dashboard)</h1>
          <p class="text-xs text-slate-500 mt-1">สรุปสถิติแบบเรียลไทม์ผ่าน PostgreSQL SQL Aggregation โดยตรง</p>
        </div>
        <div class="flex items-center gap-2">
          <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            PostgreSQL DB Aggregated
          </span>
          <button (click)="loadDashboardData()" class="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg shadow-xs transition">
            🔄 รีเฟรชข้อมูล
          </button>
        </div>
      </div>

      <!-- 4 Core Summary Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <app-stat-card
          title="อุปกรณ์ทั้งหมดในระบบ"
          [value]="stats()?.totalEquipment ?? 0"
          [subtitle]="(stats()?.totalFixedAssets ?? 0) + ' สินทรัพย์ถาวร · ' + (stats()?.totalConsumables ?? 0) + ' ของสิ้นเปลือง'"
          type="default">
          <svg card-icon class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </app-stat-card>

        <app-stat-card
          title="กำลังถูกยืมใช้งาน"
          [value]="stats()?.checkedOut ?? 0"
          subtitle="พนักงานกำลังถือครองใช้งาน"
          type="blue">
          <svg card-icon class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </app-stat-card>

        <app-stat-card
          title="คำขอที่รอการอนุมัติ"
          [value]="stats()?.pendingRequests ?? 0"
          subtitle="รอเจ้าหน้าที่ IT ตรวจสอบ 1 ขั้นตอน"
          type="amber">
          <svg card-icon class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </app-stat-card>

        <app-stat-card
          title="ของสิ้นเปลืองใกล้หมด"
          [value]="stats()?.lowStock ?? 0"
          subtitle="สินค้าคงเหลือ &le; 5 ชิ้น"
          type="rose">
          <svg card-icon class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </app-stat-card>
      </div>

      <!-- Charts Section (ApexCharts) -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Monthly Checkout Trends -->
        <div class="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <!-- Header with Title & Mode Switcher -->
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h2 class="text-base font-semibold text-slate-900 flex items-center gap-2">
                  <span>{{ trendTitle() }}</span>
                </h2>
                <p class="text-xs text-slate-400 mt-0.5">
                  {{ trendSubtitle() }}
                </p>
              </div>

              <!-- Mode Switcher Buttons -->
              <div class="inline-flex rounded-lg bg-slate-100 p-1 border border-slate-200 text-xs font-medium self-start sm:self-auto shrink-0">
                <button type="button" (click)="setMode('year')"
                        [class]="trendMode() === 'year' ? 'bg-white text-blue-600 font-bold shadow-2xs rounded-md px-3 py-1 transition' : 'text-slate-600 hover:text-slate-900 px-3 py-1 transition'">
                  📅 ภาพรวมทั้งปี
                </button>
                <button type="button" (click)="setMode('month')"
                        [class]="trendMode() === 'month' ? 'bg-white text-blue-600 font-bold shadow-2xs rounded-md px-3 py-1 transition' : 'text-slate-600 hover:text-slate-900 px-3 py-1 transition'">
                  📆 เลือกดูรายเดือน
                </button>
                <button type="button" (click)="setMode('range')"
                        [class]="trendMode() === 'range' ? 'bg-white text-blue-600 font-bold shadow-2xs rounded-md px-3 py-1 transition' : 'text-slate-600 hover:text-slate-900 px-3 py-1 transition'">
                  ⏱️ กำหนดช่วงวัน
                </button>
              </div>
            </div>

            <!-- Sub Filter Controls depending on active mode -->
            <div class="mt-3 py-2 px-3 bg-slate-50/80 rounded-lg border border-slate-200 flex flex-wrap items-center justify-between gap-2.5 text-xs">
              <!-- Mode: Year -->
              <div *ngIf="trendMode() === 'year'" class="flex items-center gap-2">
                <span class="text-slate-500 font-medium">เลือกปี:</span>
                <select [ngModel]="selectedYear()" (ngModelChange)="onYearChange($event)"
                        class="px-2.5 py-1 bg-white rounded border border-slate-300 font-semibold text-slate-700 focus:ring-1 focus:ring-blue-500">
                  <option *ngFor="let y of yearsList" [value]="y">{{ y }}</option>
                </select>
                <span class="text-[11px] text-slate-400">แสดงผลรวมทั้ง 12 เดือนของปี</span>
              </div>

              <!-- Mode: Month -->
              <div *ngIf="trendMode() === 'month'" class="flex flex-wrap items-center gap-2">
                <span class="text-slate-500 font-medium">เลือกเดือน:</span>
                <select [ngModel]="selectedMonth()" (ngModelChange)="onMonthChange($event)"
                        class="px-2.5 py-1 bg-white rounded border border-slate-300 font-semibold text-slate-700 focus:ring-1 focus:ring-blue-500">
                  <option *ngFor="let m of monthsList" [value]="m.value">{{ m.label }}</option>
                </select>
                <select [ngModel]="selectedYear()" (ngModelChange)="onYearChange($event)"
                        class="px-2 py-1 bg-white rounded border border-slate-300 font-semibold text-slate-700 focus:ring-1 focus:ring-blue-500">
                  <option *ngFor="let y of yearsList" [value]="y">{{ y }}</option>
                </select>
                <div class="flex items-center gap-1.5 ml-1">
                  <button type="button" (click)="onMonthChange(8)"
                          [class]="selectedMonth() === 8 ? 'px-2 py-0.5 rounded bg-blue-600 text-white text-[11px] font-medium' : 'px-2 py-0.5 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 text-[11px] border border-blue-200 font-medium'">
                    สิงหาคม
                  </button>
                  <button type="button" (click)="onMonthChange(9)"
                          [class]="selectedMonth() === 9 ? 'px-2 py-0.5 rounded bg-blue-600 text-white text-[11px] font-medium' : 'px-2 py-0.5 rounded bg-slate-200 text-slate-700 hover:bg-slate-300 text-[11px] font-medium'">
                    กันยายน (ปัจจุบัน)
                  </button>
                </div>
              </div>

              <!-- Mode: Range -->
              <div *ngIf="trendMode() === 'range'" class="flex flex-wrap items-center gap-2">
                <span class="text-slate-500 font-medium">จาก:</span>
                <input type="date" [ngModel]="startDate()" (ngModelChange)="onStartDateChange($event)"
                       class="px-2 py-1 bg-white rounded border border-slate-300 text-slate-700 text-xs focus:ring-1 focus:ring-blue-500" />
                <span class="text-slate-400">ถึง:</span>
                <input type="date" [ngModel]="endDate()" (ngModelChange)="onEndDateChange($event)"
                       class="px-2 py-1 bg-white rounded border border-slate-300 text-slate-700 text-xs focus:ring-1 focus:ring-blue-500" />
                <div class="flex items-center gap-1 ml-1">
                  <button type="button" (click)="setQuickRange('aug_sep')" class="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-[11px] border border-indigo-200 font-medium">
                    15 ส.ค. - วันนี้
                  </button>
                  <button type="button" (click)="setQuickRange('last7')" class="px-2 py-0.5 rounded bg-slate-100 text-slate-700 hover:bg-slate-200 text-[11px] font-medium">
                    7 วันล่าสุด
                  </button>
                  <button type="button" (click)="setQuickRange('last30')" class="px-2 py-0.5 rounded bg-slate-100 text-slate-700 hover:bg-slate-200 text-[11px] font-medium">
                    30 วัน
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Loading State -->
          <div *ngIf="isLoadingTrends()" class="h-80 flex flex-col items-center justify-center text-slate-400 my-4">
            <svg class="animate-spin w-8 h-8 text-blue-500 mb-2" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
            </svg>
            <p class="text-xs">กำลังคำนวณและประมวลผลสถิติ...</p>
          </div>

          <!-- Chart Display -->
          <div *ngIf="!isLoadingTrends() && barChartOptions" class="w-full mt-4">
            <apx-chart
              [series]="barChartOptions.series"
              [chart]="barChartOptions.chart"
              [xaxis]="barChartOptions.xaxis"
              [yaxis]="barChartOptions.yaxis"
              [plotOptions]="barChartOptions.plotOptions"
              [dataLabels]="barChartOptions.dataLabels"
              [stroke]="barChartOptions.stroke"
              [colors]="barChartOptions.colors"
              [legend]="barChartOptions.legend"
              [tooltip]="barChartOptions.tooltip">
            </apx-chart>
          </div>

          <div *ngIf="!isLoadingTrends() && !barChartOptions" class="h-80 flex flex-col items-center justify-center text-slate-400 my-4">
            <p class="text-xs text-rose-500 font-medium">ไม่พบข้อมูลคำขอในช่วงเวลาที่เลือก</p>
          </div>
        </div>

        <!-- Equipment by Category Donut Chart -->
        <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col">
          <div class="mb-4">
            <h2 class="text-base font-semibold text-slate-900">สัดส่วนอุปกรณ์ตามหมวดหมู่</h2>
            <p class="text-xs text-slate-400">กระจายตามหมวดหมู่ที่ Admin จัดการ</p>
          </div>

          <!-- Loading State -->
          <div *ngIf="isLoadingCategories()" class="flex-1 min-h-[280px] flex flex-col items-center justify-center text-slate-400">
            <svg class="animate-spin w-8 h-8 text-blue-500 mb-2" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
            </svg>
            <p class="text-xs">กำลังโหลดสัดส่วนหมวดหมู่...</p>
          </div>

          <!-- Donut Display -->
          <div *ngIf="!isLoadingCategories() && donutChartOptions" class="flex-1 flex items-center justify-center">
            <apx-chart
              [series]="donutChartOptions.series"
              [chart]="donutChartOptions.chart"
              [labels]="donutChartOptions.labels"
              [colors]="donutChartOptions.colors"
              [legend]="donutChartOptions.legend"
              [responsive]="donutChartOptions.responsive">
            </apx-chart>
          </div>

          <!-- Empty State -->
          <div *ngIf="!isLoadingCategories() && !donutChartOptions" class="flex-1 min-h-[280px] flex flex-col items-center justify-center text-slate-400">
            <svg class="w-12 h-12 text-slate-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
            </svg>
            <p class="text-xs text-slate-500 font-medium">ยังไม่มีข้อมูลอุปกรณ์ในหมวดหมู่</p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DashboardPageComponent implements OnInit {
  private dashboardService = inject(DashboardService);

  currentYear = new Date().getFullYear();
  stats = signal<DashboardStats | null>(null);
  isLoadingTrends = signal<boolean>(true);
  isLoadingCategories = signal<boolean>(true);

  // Trend Filter States
  trendMode = signal<'year' | 'month' | 'range'>('year');
  selectedYear = signal<number>(new Date().getFullYear());
  selectedMonth = signal<number>(8); // Default to August (month 8) where we have mock data, or current month
  startDate = signal<string>('2026-08-15');
  endDate = signal<string>(new Date().toISOString().slice(0, 10));

  monthsList = [
    { value: 1, label: 'มกราคม (Jan)' },
    { value: 2, label: 'กุมภาพันธ์ (Feb)' },
    { value: 3, label: 'มีนาคม (Mar)' },
    { value: 4, label: 'เมษายน (Apr)' },
    { value: 5, label: 'พฤษภาคม (May)' },
    { value: 6, label: 'มิถุนายน (Jun)' },
    { value: 7, label: 'กรกฎาคม (Jul)' },
    { value: 8, label: 'สิงหาคม (Aug)' },
    { value: 9, label: 'กันยายน (Sep)' },
    { value: 10, label: 'ตุลาคม (Oct)' },
    { value: 11, label: 'พฤศจิกายน (Nov)' },
    { value: 12, label: 'ธันวาคม (Dec)' }
  ];

  yearsList = [2025, 2026, 2027];

  trendTitle = computed(() => {
    const mode = this.trendMode();
    if (mode === 'year') {
      return `แนวโน้มการเบิก-จ่ายอุปกรณ์รายเดือน (ปี ${this.selectedYear()})`;
    } else if (mode === 'month') {
      const m = this.monthsList.find((item) => item.value === Number(this.selectedMonth()));
      return `สถิติการเบิก-จ่ายรายวัน (${m?.label || ''} ${this.selectedYear()})`;
    } else {
      return `สถิติการเบิก-จ่ายตามช่วงวัน (${this.startDate()} ถึง ${this.endDate()})`;
    }
  });

  trendSubtitle = computed(() => {
    const mode = this.trendMode();
    if (mode === 'year') {
      return 'คำนวณและจัดกลุ่มตาม 12 เดือนบน PostgreSQL โดยตรง (DB Aggregation)';
    } else if (mode === 'month') {
      return 'แจกแจงสถิติแยกรายวัน (Day 1 - สิ้นเดือน) ช่วยวิเคราะห์ความถี่การใช้งาน';
    } else {
      return 'แสดงแนวโน้มแบบละเอียดตามช่วงวันที่ผู้บริหารกำหนดเอง';
    }
  });

  barChartOptions: BarChartOptions | null = null;
  donutChartOptions: DonutChartOptions | null = null;

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.dashboardService.getStats().subscribe({
      next: (data) => this.stats.set(data),
      error: (err) => console.error('Failed to load stats', err)
    });

    this.loadTrendData();

    this.isLoadingCategories.set(true);
    this.dashboardService.getEquipmentByCategory().subscribe({
      next: (catStats: CategoryStat[]) => {
        this.setupDonutChart(catStats);
        this.isLoadingCategories.set(false);
      },
      error: (err) => {
        console.error('Failed to load category stats', err);
        this.isLoadingCategories.set(false);
      }
    });
  }

  setMode(mode: 'year' | 'month' | 'range'): void {
    this.trendMode.set(mode);
    this.loadTrendData();
  }

  onMonthChange(m: any): void {
    this.selectedMonth.set(Number(m));
    this.loadTrendData();
  }

  onYearChange(y: any): void {
    this.selectedYear.set(Number(y));
    this.loadTrendData();
  }

  onStartDateChange(d: string): void {
    this.startDate.set(d);
    if (this.startDate() && this.endDate()) {
      this.loadTrendData();
    }
  }

  onEndDateChange(d: string): void {
    this.endDate.set(d);
    if (this.startDate() && this.endDate()) {
      this.loadTrendData();
    }
  }

  setQuickRange(type: 'aug_sep' | 'last7' | 'last30'): void {
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);
    if (type === 'aug_sep') {
      this.startDate.set('2026-08-15');
      this.endDate.set(todayStr);
    } else if (type === 'last7') {
      const d = new Date(today);
      d.setDate(d.getDate() - 7);
      this.startDate.set(d.toISOString().slice(0, 10));
      this.endDate.set(todayStr);
    } else if (type === 'last30') {
      const d = new Date(today);
      d.setDate(d.getDate() - 30);
      this.startDate.set(d.toISOString().slice(0, 10));
      this.endDate.set(todayStr);
    }
    this.loadTrendData();
  }

  loadTrendData(): void {
    this.isLoadingTrends.set(true);
    const mode = this.trendMode();
    const options: TrendFilterOptions = {
      mode,
      year: this.selectedYear(),
      month: this.selectedMonth(),
      startDate: this.startDate(),
      endDate: this.endDate()
    };

    this.dashboardService.getMonthlyTrends(options).subscribe({
      next: (trends: MonthlyTrend[]) => {
        this.setupBarChart(trends);
        this.isLoadingTrends.set(false);
      },
      error: (err) => {
        console.error('Failed to load trends', err);
        this.isLoadingTrends.set(false);
      }
    });
  }

  private setupBarChart(trends: MonthlyTrend[]): void {
    if (!trends || trends.length === 0) {
      this.barChartOptions = null;
      return;
    }

    const categories = trends.map((t) => t.label || t.month || '');
    const approvedData = trends.map((t) => t.approved);
    const returnedData = trends.map((t) => t.returned);
    const rejectedData = trends.map((t) => t.rejected);

    const isDense = categories.length > 15;

    this.barChartOptions = {
      series: [
        { name: 'อนุมัติ/ยืมสำเร็จ', data: approvedData },
        { name: 'ส่งคืนแล้ว', data: returnedData },
        { name: 'ปฏิเสธ', data: rejectedData }
      ],
      chart: {
        type: 'bar',
        height: 340,
        fontFamily: 'Inter, Prompt, sans-serif',
        toolbar: { show: false }
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: isDense ? '70%' : '50%',
          borderRadius: isDense ? 2 : 4
        }
      },
      dataLabels: { enabled: false },
      stroke: { show: true, width: isDense ? 1 : 2, colors: ['transparent'] },
      xaxis: {
        categories,
        labels: {
          rotate: isDense ? -45 : 0,
          rotateAlways: isDense,
          style: {
            fontSize: isDense ? '10px' : '11px'
          }
        },
        tickAmount: isDense ? Math.min(categories.length, 31) : undefined
      },
      yaxis: {
        title: { text: 'จำนวนคำขอ' }
      },
      colors: ['#2563eb', '#10b981', '#ef4444'],
      legend: { position: 'top' },
      tooltip: {
        shared: true,
        intersect: false,
        theme: 'light',
        y: {
          formatter: (val: number) => `${val} รายการ`
        }
      }
    };
  }

  private setupDonutChart(catStats: CategoryStat[]): void {
    if (!catStats || catStats.length === 0) {
      this.donutChartOptions = null;
      return;
    }

    // Filter categories that have items, or show all if all 0
    const activeCats = catStats.filter((c) => c.count > 0);
    const targetCats = activeCats.length > 0 ? activeCats : catStats;

    const labels = targetCats.map((c) => c.category_name);
    const series = targetCats.map((c) => c.count);

    if (series.every((val) => val === 0)) {
      this.donutChartOptions = null;
      return;
    }

    this.donutChartOptions = {
      series,
      chart: {
        type: 'donut',
        height: 320,
        fontFamily: 'Inter, Prompt, sans-serif'
      },
      labels,
      colors: ['#2563eb', '#06b6d4', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899'],
      legend: { position: 'bottom' },
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: { width: 200 },
            legend: { position: 'bottom' }
          }
        }
      ]
    };
  }
}
