import type { ComponentType, ServiceItemType, ServiceTicketStatus, ServiceType } from "./types";

export const ticketStatusOptions: Array<{ value: ServiceTicketStatus; label: string }> = [
  { value: "CREATED", label: "Moi tao" },
  { value: "ASSIGNED", label: "Da gan" },
  { value: "IN_PROGRESS", label: "Dang xu ly" },
  { value: "RECEIVED", label: "Da tiep nhan" },
  { value: "CHECKING", label: "Dang kiem tra" },
  { value: "DIAGNOSING", label: "Dang chan doan" },
  { value: "QUOTED", label: "Da bao gia" },
  { value: "WAITING_CUSTOMER_APPROVAL", label: "Cho khach duyet" },
  { value: "WAITING_PARTS", label: "Cho linh kien" },
  { value: "REPAIRING", label: "Dang sua" },
  { value: "QC_CHECK", label: "Kiem tra QC" },
  { value: "COMPLETED", label: "Hoan thanh" },
  { value: "RETURNED", label: "Da tra xe" },
  { value: "CANCELLED", label: "Da huy" }
];

export const serviceTypeOptions: Array<{ value: ServiceType; label: string }> = [
  { value: "WARRANTY", label: "Bao hanh" },
  { value: "PAID_REPAIR", label: "Sua tinh phi" },
  { value: "MAINTENANCE", label: "Bao duong" }
];

export const componentTypeOptions: Array<{ value: ComponentType; label: string }> = [
  { value: "FRAME", label: "Khung xe" },
  { value: "BATTERY", label: "Pin" },
  { value: "MOTOR", label: "Dong co" },
  { value: "CHARGER", label: "Bo sac" },
  { value: "CONTROLLER", label: "Bo dieu khien" },
  { value: "DISPLAY", label: "Man hinh" },
  { value: "BRAKE", label: "Phanh" },
  { value: "LIGHT", label: "Den" },
  { value: "TIRE", label: "Lop" },
  { value: "ACCESSORY", label: "Phu kien" }
];

export const serviceItemTypeOptions: Array<{ value: ServiceItemType; label: string }> = [
  { value: "PART", label: "Linh kien" },
  { value: "LABOR", label: "Cong sua" },
  { value: "OTHER", label: "Khac" }
];

export const technicianOptions = [
  { value: "tech.leminh", label: "Le Minh" },
  { value: "tech.hoangphuc", label: "Hoang Phuc" },
  { value: "tech.dangkhoa", label: "Dang Khoa" }
];

export function getStatusLabel(value: ServiceTicketStatus) {
  return ticketStatusOptions.find((item) => item.value === value)?.label ?? value;
}

export function getItemTypeLabel(value: ServiceItemType) {
  return serviceItemTypeOptions.find((item) => item.value === value)?.label ?? value;
}

export function getServiceTypeLabel(value: ServiceType) {
  return serviceTypeOptions.find((item) => item.value === value)?.label ?? value;
}

export function getComponentTypeLabel(value?: ComponentType) {
  return value ? componentTypeOptions.find((item) => item.value === value)?.label ?? value : "";
}
