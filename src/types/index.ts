export type UserRole = 'ADMIN' | 'SALES' | 'SERVICE_COORDINATOR' | 'ENGINEER';

export type JobType = 'SALES' | 'SERVICE';

export type JobStatus =
  | 'REQUESTED'
  | 'ENGINEER_ASSIGNED'
  | 'REQUIREMENTS_LOGGED'
  | 'STOCK_CHECK_PENDING'
  | 'PURCHASE_PENDING'
  | 'QUOTATION_DRAFTED'
  | 'QUOTATION_APPROVED'
  | 'INVOICED'
  | 'DELIVERED'
  | 'PAID'
  | 'CLOSED'
  | 'CANCELLED';

export type POStatus = 'PENDING' | 'ORDERED' | 'RECEIVED' | 'CANCELLED';

export type PaymentStatus = 'UNPAID' | 'PARTIALLY_PAID' | 'PAID';

export type PaymentMode = 'CASH' | 'UPI' | 'BANK_TRANSFER' | 'CHEQUE';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  phone?: string;
  isActive: boolean;
  avatar?: string;
  specialty?: string;
}

export interface SiteCoordinates {
  lat: number;
  lng: number;
  address?: string;
  locationName?: string;
  landmark?: string;
}

export interface Customer {
  id: string;
  name: string;
  companyName?: string;
  email: string;
  phone: string;
  billingAddress: string;
  shippingAddress: string;
  coordinates?: SiteCoordinates;
}

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  description: string;
  unitPrice: number;
  stockQuantity: number;
  reorderLevel: number;
  leadTimeDays: number;
  category: 'SPARE_PART' | 'EQUIPMENT' | 'CONSUMABLE' | 'ACCESSORY';
}

export interface JobRequirement {
  id: string;
  jobCardId: string;
  itemId?: string;
  customItemName?: string;
  quantity: number;
  isServiceCharge: boolean;
  rate: number;
  createdAt: string;
  itemDetails?: InventoryItem;
}

export interface JobCardTransition {
  id: string;
  jobCardId: string;
  fromStatus: JobStatus | null;
  toStatus: JobStatus;
  changedByUserId: string;
  changedByName: string;
  reason?: string;
  createdAt: string;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  jobCardId?: string;
  itemId: string;
  quantity: number;
  supplierName: string;
  status: POStatus;
  expectedDurationDays: number;
  expectedDeliveryDate: string;
  receivedDate?: string;
  unitPrice: number;
  createdAt: string;
}

export interface Quotation {
  id: string;
  quotationNumber: string;
  jobCardId: string;
  subtotal: number;
  tax: number; // 18% standard
  discount: number;
  total: number;
  isApproved: boolean;
  approvedAt?: string;
  notes?: string;
  createdAt: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  quotationId: string;
  jobCardId: string;
  totalAmount: number;
  status: PaymentStatus;
  issuedDate: string;
  dueDate: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  invoiceId: string;
  jobCardId: string;
  amount: number;
  paymentMode: PaymentMode;
  transactionReference: string;
  paidAt: string;
  notes?: string;
}

export interface InspectionReport {
  equipmentModel?: string;
  serialNumber?: string;
  findings: string;
  inspectionPhotos?: string[];
  customerSignature?: string; // base64 canvas data
  serviceOnly: boolean;
  technicianNotes?: string;
  submittedAt?: string;
}

export interface JobCard {
  id: string;
  jobNumber: string; // e.g. JC-2026-0001
  customerId: string;
  type: JobType;
  status: JobStatus;
  assignedEngineerId?: string;
  notes?: string;
  createdByUserId: string;
  createdAt: string;
  updatedAt: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  estimatedCompletionDate?: string;
  inspectionReport?: InspectionReport;
  siteCoordinates?: SiteCoordinates;
}

export type NotificationType =
  | 'JOB_ASSIGNMENT'
  | 'QUOTE_APPROVAL'
  | 'PO_RECEIVED'
  | 'PAYMENT_RECEIVED'
  | 'INVOICE_ISSUED'
  | 'STOCK_ALERT'
  | 'STATUS_CHANGE';

export interface NotificationAlert {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: NotificationType;
  jobCardId?: string;
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  date: string; // YYYY-MM-DD
  punchInTime: string; // HH:mm:ss
  punchOutTime?: string; // HH:mm:ss
  locationType: 'OFFICE' | 'FIELD' | 'REMOTE';
  distanceFromOfficeMeters: number; // Office Geofence: < 100 meters
  geofenceVerified: boolean;
  status: 'PRESENT' | 'LATE' | 'HALF_DAY' | 'ON_DUTY_FIELD';
  notes?: string;
  photoUrl?: string;
}

export type LeaveType = 'CASUAL' | 'SICK' | 'EARNED' | 'COMP_OFF';
export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface LeaveRequest {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  daysCount: number;
  reason: string;
  status: LeaveStatus;
  appliedAt: string;
  reviewedByUserId?: string;
  reviewedByName?: string;
  reviewedAt?: string;
  reviewNotes?: string;
}

export interface CompanyHoliday {
  id: string;
  name: string;
  date: string;
  day: string;
  type: 'NATIONAL' | 'FESTIVAL' | 'MANDATORY';
}

export interface StockInwardLog {
  id: string;
  itemId: string;
  itemName: string;
  sku: string;
  quantityAdded: number;
  previousStock: number;
  newStock: number;
  supplierInvoiceNo: string;
  vendorName: string;
  unitCost: number;
  addedByUserId: string;
  addedByName: string;
  createdAt: string;
  notes?: string;
}
