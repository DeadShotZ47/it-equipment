import { EquipmentStatus, RequestStatus, RequestType } from '../models/shared.model';

export function getEquipmentStatusLabel(status?: EquipmentStatus | string): string {
  switch (status) {
    case 'AVAILABLE': return 'พร้อมใช้งาน (Available)';
    case 'CHECKED_OUT': return 'กำลังถูกยืม (Checked Out)';
    case 'MAINTENANCE': return 'ส่งซ่อมบำรุง (Maintenance)';
    case 'RETIRED': return 'เลิกใช้งาน (Retired)';
    default: return status || '-';
  }
}

export function getRequestStatusLabel(status?: RequestStatus | string): string {
  switch (status) {
    case 'PENDING': return 'รออนุมัติ';
    case 'APPROVED': return 'อนุมัติแล้ว';
    case 'REJECTED': return 'ปฏิเสธ';
    case 'RETURNED': return 'ส่งคืนแล้ว';
    case 'CANCELLED': return 'ยกเลิกแล้ว';
    default: return status || '-';
  }
}

export function getRequestTypeLabel(type?: RequestType | string): string {
  switch (type) {
    case 'CHECKOUT': return 'ขอยืมสินทรัพย์ถาวร';
    case 'CONSUME': return 'ขอเบิกของสิ้นเปลือง';
    default: return type || '-';
  }
}
