import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  ApexResponsive
} from 'ng-apexcharts';
import { DashboardService } from '../services/dashboard.service';
import { DashboardStats, MonthlyTrend, CategoryStat } from '../models/dashboard.model';
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
  imports: [CommonModule, NgApexchartsModule, StatCardComponent],
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
        <div class="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h2 class="text-base font-semibold text-slate-900">แนวโน้มการเบิก-จ่ายอุปกรณ์รายเดือน</h2>
              <p class="text-xs text-slate-400">คำนวณและจัดกลุ่มตามเดือนบน PostgreSQL โดยตรง (DB Aggregation)</p>
            </div>
            <span class="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">ปี 2026</span>
          </div>

          <div *ngIf="barChartOptions" class="w-full">
            <apx-chart
              [series]="barChartOptions.series"
              [chart]="barChartOptions.chart"
              [xaxis]="barChartOptions.xaxis"
              [yaxis]="barChartOptions.yaxis"
              [plotOptions]="barChartOptions.plotOptions"
              [dataLabels]="barChartOptions.dataLabels"
              [stroke]="barChartOptions.stroke"
              [colors]="barChartOptions.colors"
              [legend]="barChartOptions.legend">
            </apx-chart>
          </div>
        </div>

        <!-- Equipment by Category Donut Chart -->
        <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col">
          <div class="mb-4">
            <h2 class="text-base font-semibold text-slate-900">สัดส่วนอุปกรณ์ตามหมวดหมู่</h2>
            <p class="text-xs text-slate-400">กระจายตามหมวดหมู่ที่ Admin จัดการ</p>
          </div>

          <div *ngIf="donutChartOptions" class="flex-1 flex items-center justify-center">
            <apx-chart
              [series]="donutChartOptions.series"
              [chart]="donutChartOptions.chart"
              [labels]="donutChartOptions.labels"
              [colors]="donutChartOptions.colors"
              [legend]="donutChartOptions.legend"
              [responsive]="donutChartOptions.responsive">
            </apx-chart>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DashboardPageComponent implements OnInit {
  private dashboardService = inject(DashboardService);

  stats = signal<DashboardStats | null>(null);
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

    this.dashboardService.getMonthlyTrends(2026).subscribe({
      next: (trends: MonthlyTrend[]) => {
        this.setupBarChart(trends);
      },
      error: (err) => console.error('Failed to load trends', err)
    });

    this.dashboardService.getEquipmentByCategory().subscribe({
      next: (catStats: CategoryStat[]) => {
        this.setupDonutChart(catStats);
      },
      error: (err) => console.error('Failed to load category stats', err)
    });
  }

  private setupBarChart(trends: MonthlyTrend[]): void {
    const thaiMonths = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    const approvedData = trends.map((t) => t.approved);
    const returnedData = trends.map((t) => t.returned);
    const rejectedData = trends.map((t) => t.rejected);

    this.barChartOptions = {
      series: [
        { name: 'อนุมัติ/ยืมสำเร็จ', data: approvedData },
        { name: 'ส่งคืนแล้ว', data: returnedData },
        { name: 'ปฏิเสธ', data: rejectedData }
      ],
      chart: {
        type: 'bar',
        height: 320,
        fontFamily: 'Inter, Prompt, sans-serif',
        toolbar: { show: false }
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '55%',
          borderRadius: 4
        }
      },
      dataLabels: { enabled: false },
      stroke: { show: true, width: 2, colors: ['transparent'] },
      xaxis: { categories: thaiMonths },
      yaxis: {
        title: { text: 'จำนวนคำขอ' }
      },
      colors: ['#2563eb', '#10b981', '#ef4444'],
      legend: { position: 'top' }
    };
  }

  private setupDonutChart(catStats: CategoryStat[]): void {
    const labels = catStats.map((c) => c.category_name);
    const series = catStats.map((c) => c.count);

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
