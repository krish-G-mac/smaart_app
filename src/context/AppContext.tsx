import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  AttendanceRecord,
  CompanyHoliday,
  Customer,
  InspectionReport,
  InventoryItem,
  Invoice,
  JobCard,
  JobCardTransition,
  JobRequirement,
  JobStatus,
  JobType,
  LeaveRequest,
  LeaveType,
  NotificationAlert,
  Payment,
  PaymentMode,
  PurchaseOrder,
  Quotation,
  StockInwardLog,
  User,
  UserRole,
} from '../types';
import {
  INITIAL_ATTENDANCE,
  INITIAL_CUSTOMERS,
  INITIAL_HOLIDAYS,
  INITIAL_INVOICES,
  INITIAL_ITEMS,
  INITIAL_JOB_CARDS,
  INITIAL_LEAVES,
  INITIAL_NOTIFICATIONS,
  INITIAL_PAYMENTS,
  INITIAL_PURCHASE_ORDERS,
  INITIAL_QUOTATIONS,
  INITIAL_REQUIREMENTS,
  INITIAL_STOCK_INWARD_LOGS,
  INITIAL_TRANSITIONS,
  INITIAL_USERS,
} from '../mockData';
import confetti from 'canvas-confetti';

interface AppContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  isAuthenticated: boolean;
  login: (email: string, password?: string) => boolean;
  logout: () => void;
  loginAsUser: (user: User) => void;

  users: User[];
  addUser: (userData: Omit<User, 'id'>) => boolean;
  updateUserStatus: (userId: string, isActive: boolean) => void;
  deleteUser: (userId: string) => boolean;

  customers: Customer[];
  items: InventoryItem[];
  jobCards: JobCard[];
  requirements: JobRequirement[];
  transitions: JobCardTransition[];
  purchaseOrders: PurchaseOrder[];
  quotations: Quotation[];
  invoices: Invoice[];
  payments: Payment[];
  notifications: NotificationAlert[];
  unreadNotificationCount: number;

  // Attendance & Leaves
  attendance: AttendanceRecord[];
  leaves: LeaveRequest[];
  holidays: CompanyHoliday[];
  punchAttendance: (data: { locationType: 'OFFICE' | 'FIELD' | 'REMOTE'; distanceFromOfficeMeters: number; notes?: string }) => AttendanceRecord;
  submitLeaveRequest: (data: { leaveType: LeaveType; startDate: string; endDate: string; daysCount: number; reason: string }) => LeaveRequest;
  reviewLeaveRequest: (leaveId: string, status: 'APPROVED' | 'REJECTED', reviewNotes?: string) => void;

  // Stock Inward
  stockInwardLogs: StockInwardLog[];
  addNewItem: (itemData: Omit<InventoryItem, 'id'>) => InventoryItem;
  addStockInward: (data: { itemId: string; quantityAdded: number; supplierInvoiceNo: string; vendorName: string; unitCost: number; notes?: string }) => void;

  viewMode: 'WEB_DASHBOARD' | 'MOBILE_APP';
  setViewMode: (mode: 'WEB_DASHBOARD' | 'MOBILE_APP') => void;
  selectedJobCardId: string | null;
  setSelectedJobCardId: (id: string | null) => void;
  toastMessage: { text: string; type: 'success' | 'error' | 'info' } | null;
  showToast: (text: string, type?: 'success' | 'error' | 'info') => void;

  // Theme Management (Light / Dark)
  theme: 'light' | 'dark' | 'system';
  isDarkMode: boolean;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  toggleTheme: () => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  clearNotifications: () => void;
  addNotification: (data: Omit<NotificationAlert, 'id' | 'timestamp' | 'read'>) => void;

  // Actions
  createJobCard: (data: {
    customerId: string;
    type: JobType;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    notes?: string;
    assignedEngineerId?: string;
    initialRequirements?: { itemId?: string; customItemName?: string; quantity: number; isServiceCharge: boolean; rate: number }[];
  }) => string;

  assignEngineer: (jobCardId: string, engineerId: string, reason?: string) => void;

  submitInspectionReport: (jobCardId: string, report: InspectionReport, requirementsList: { itemId?: string; customItemName?: string; quantity: number; isServiceCharge: boolean; rate: number }[]) => void;

  performStockCheckAndAdvance: (jobCardId: string) => { canProceed: boolean; outOfStockItemNames: string[] };

  createPurchaseOrder: (data: {
    jobCardId?: string;
    itemId: string;
    quantity: number;
    supplierName: string;
    unitPrice: number;
  }) => void;

  receivePurchaseOrder: (poId: string) => void;

  createOrUpdateQuotation: (jobCardId: string, discount?: number, notes?: string) => Quotation;

  approveQuotation: (quotationId: string) => void;

  generateInvoice: (quotationId: string) => Invoice;

  markAsDelivered: (jobCardId: string, deliveryNotes?: string) => void;

  recordPayment: (invoiceId: string, amount: number, paymentMode: PaymentMode, transactionReference: string, notes?: string) => void;

  closeJobCard: (jobCardId: string, reason?: string) => void;

  cancelJobCard: (jobCardId: string, reason: string) => void;

  updateInventoryStock: (itemId: string, newStock: number) => void;

  resetToDefaults: () => void;

  // Real-time synchronization & Database Export/Import
  exportDatabaseJSON: () => string;
  importDatabaseJSON: (jsonStr: string) => boolean;
  isRealtimeActive: boolean;
  lastRealtimeSyncTime: string | null;
  sendRealtimeBroadcastPing: () => void;
  isSetupModalOpen: boolean;
  setIsSetupModalOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'smaart_erp_state_v1';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load state from localStorage or initial mock data
  const loadState = <T,>(key: string, defaultVal: T): T => {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}_${key}`);
      return stored ? JSON.parse(stored) : defaultVal;
    } catch {
      return defaultVal;
    }
  };

  const [users, setUsers] = useState<User[]>(() => loadState('users', INITIAL_USERS));
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => loadState('is_auth', true));
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_current_user`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const found = INITIAL_USERS.find(u => u.id === parsed.id);
        if (found) return found;
      } catch {}
    }
    return INITIAL_USERS[0]; // Admin by default
  });

  const [customers, setCustomers] = useState<Customer[]>(() => loadState('customers', INITIAL_CUSTOMERS));
  const [items, setItems] = useState<InventoryItem[]>(() => loadState('items', INITIAL_ITEMS));
  const [jobCards, setJobCards] = useState<JobCard[]>(() => loadState('job_cards', INITIAL_JOB_CARDS));
  const [requirements, setRequirements] = useState<JobRequirement[]>(() => loadState('requirements', INITIAL_REQUIREMENTS));
  const [transitions, setTransitions] = useState<JobCardTransition[]>(() => loadState('transitions', INITIAL_TRANSITIONS));
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(() => loadState('pos', INITIAL_PURCHASE_ORDERS));
  const [quotations, setQuotations] = useState<Quotation[]>(() => loadState('quotations', INITIAL_QUOTATIONS));
  const [invoices, setInvoices] = useState<Invoice[]>(() => loadState('invoices', INITIAL_INVOICES));
  const [payments, setPayments] = useState<Payment[]>(() => loadState('payments', INITIAL_PAYMENTS));
  const [notifications, setNotifications] = useState<NotificationAlert[]>(() => loadState('notifications', INITIAL_NOTIFICATIONS));

  // Attendance, Leaves & Holidays
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => loadState('attendance', INITIAL_ATTENDANCE));
  const [leaves, setLeaves] = useState<LeaveRequest[]>(() => loadState('leaves', INITIAL_LEAVES));
  const [holidays] = useState<CompanyHoliday[]>(INITIAL_HOLIDAYS);

  // Stock Inward
  const [stockInwardLogs, setStockInwardLogs] = useState<StockInwardLog[]>(() => loadState('stock_inward_logs', INITIAL_STOCK_INWARD_LOGS));

  const [viewMode, setViewMode] = useState<'WEB_DASHBOARD' | 'MOBILE_APP'>('WEB_DASHBOARD');
  const [selectedJobCardId, setSelectedJobCardId] = useState<string | null>('jc-2');
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);

  // Theme state: default to 'light' (white theme) as requested, with instant toggling
  const [theme, setThemeState] = useState<'light' | 'dark' | 'system'>(() => {
    const saved = localStorage.getItem('smaart_theme_preference');
    if (saved === 'light' || saved === 'dark' || saved === 'system') return saved;
    return 'light';
  });

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('smaart_theme_preference');
    if (saved === 'dark') return true;
    if (saved === 'light') return false;
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  const setTheme = (newTheme: 'light' | 'dark' | 'system') => {
    setThemeState(newTheme);
    localStorage.setItem('smaart_theme_preference', newTheme);
  };

  const toggleTheme = () => {
    const next = isDarkMode ? 'light' : 'dark';
    setTheme(next);
  };

  // Sync theme with document.documentElement (.dark class and data-theme attribute)
  useEffect(() => {
    const root = document.documentElement;
    const computeDark = () => {
      if (theme === 'dark') return true;
      if (theme === 'light') return false;
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    };

    const dark = computeDark();
    setIsDarkMode(dark);
    if (dark) {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
      root.style.colorScheme = 'light';
    }

    if (theme === 'system') {
      const media = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = (e: MediaQueryListEvent) => {
        setIsDarkMode(e.matches);
        if (e.matches) {
          root.classList.add('dark');
          root.setAttribute('data-theme', 'dark');
          root.style.colorScheme = 'dark';
        } else {
          root.classList.remove('dark');
          root.setAttribute('data-theme', 'light');
          root.style.colorScheme = 'light';
        }
      };
      media.addEventListener('change', listener);
      return () => media.removeEventListener('change', listener);
    }
  }, [theme]);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_users`, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_is_auth`, JSON.stringify(isAuthenticated));
  }, [isAuthenticated]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_current_user`, JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_attendance`, JSON.stringify(attendance));
  }, [attendance]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_leaves`, JSON.stringify(leaves));
  }, [leaves]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_stock_inward_logs`, JSON.stringify(stockInwardLogs));
  }, [stockInwardLogs]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_customers`, JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_items`, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_job_cards`, JSON.stringify(jobCards));
  }, [jobCards]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_requirements`, JSON.stringify(requirements));
  }, [requirements]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_transitions`, JSON.stringify(transitions));
  }, [transitions]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_pos`, JSON.stringify(purchaseOrders));
  }, [purchaseOrders]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_quotations`, JSON.stringify(quotations));
  }, [quotations]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_invoices`, JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_payments`, JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_notifications`, JSON.stringify(notifications));
  }, [notifications]);

  const unreadNotificationCount = notifications.filter(n => !n.read).length;

  const addNotification = (data: Omit<NotificationAlert, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: NotificationAlert = {
      ...data,
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      read: false,
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    showToast('All notifications marked as read', 'info');
  };

  const clearNotifications = () => {
    setNotifications([]);
    showToast('Notifications cleared', 'info');
  };

  // Authentication
  const login = (email: string, password?: string): boolean => {
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      showToast('No user account found with that email address', 'error');
      return false;
    }
    if (!user.isActive) {
      showToast('This user account has been deactivated. Please contact an Administrator.', 'error');
      return false;
    }
    if (password && user.password && user.password !== password) {
      showToast('Invalid password', 'error');
      return false;
    }
    setCurrentUser(user);
    setIsAuthenticated(true);
    showToast(`Welcome back, ${user.name}! (${user.role})`, 'success');
    return true;
  };

  const logout = () => {
    setIsAuthenticated(false);
    showToast('You have been logged out successfully', 'info');
  };

  const loginAsUser = (user: User) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    showToast(`Logged in as ${user.name} (${user.role})`, 'success');
  };

  // User Management (Admin Only)
  const addUser = (userData: Omit<User, 'id'>): boolean => {
    if (currentUser.role !== 'ADMIN') {
      showToast('Access denied: Only Administrators can add users', 'error');
      return false;
    }
    const exists = users.some(u => u.email.toLowerCase() === userData.email.toLowerCase());
    if (exists) {
      showToast('A user with this email already exists', 'error');
      return false;
    }
    const newUser: User = {
      ...userData,
      id: `user-${Date.now()}`,
      isActive: userData.isActive !== undefined ? userData.isActive : true,
      avatar: userData.avatar || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80`,
    };
    setUsers(prev => [...prev, newUser]);
    showToast(`User ${newUser.name} (${newUser.role}) added successfully!`, 'success');
    addNotification({
      title: 'New User Registered',
      message: `${newUser.name} was added as ${newUser.role} by Administrator ${currentUser.name}.`,
      type: 'STATUS_CHANGE',
    });
    return true;
  };

  const updateUserStatus = (userId: string, isActive: boolean) => {
    if (currentUser.role !== 'ADMIN') {
      showToast('Access denied: Only Administrators can modify user status', 'error');
      return;
    }
    if (userId === currentUser.id && !isActive) {
      showToast('You cannot deactivate your own administrative account', 'error');
      return;
    }
    setUsers(prev => prev.map(u => (u.id === userId ? { ...u, isActive } : u)));
    showToast(`User status updated to ${isActive ? 'Active' : 'Inactive'}`, 'info');
  };

  const deleteUser = (userId: string): boolean => {
    if (currentUser.role !== 'ADMIN') {
      showToast('Access denied: Only Administrators can delete users', 'error');
      return false;
    }
    if (userId === currentUser.id) {
      showToast('You cannot delete your own administrative account', 'error');
      return false;
    }
    setUsers(prev => prev.filter(u => u.id !== userId));
    showToast('User deleted successfully', 'info');
    return true;
  };

  // Attendance & Leaves
  const punchAttendance = (data: {
    locationType: 'OFFICE' | 'FIELD' | 'REMOTE';
    distanceFromOfficeMeters: number;
    notes?: string;
  }): AttendanceRecord => {
    const today = new Date().toISOString().split('T')[0];
    const nowTime = new Date().toTimeString().split(' ')[0];

    // Office circumstance rule: office location geofence radius is 100 meters
    const isWithinOfficeCircumstance = data.locationType === 'OFFICE' && data.distanceFromOfficeMeters <= 100;
    let status: 'PRESENT' | 'LATE' | 'HALF_DAY' | 'ON_DUTY_FIELD' = 'PRESENT';
    if (data.locationType === 'FIELD') {
      status = 'ON_DUTY_FIELD';
    } else if (!isWithinOfficeCircumstance) {
      status = 'LATE';
    }

    const newRecord: AttendanceRecord = {
      id: `att-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      date: today,
      punchInTime: nowTime,
      locationType: data.locationType,
      distanceFromOfficeMeters: data.distanceFromOfficeMeters,
      geofenceVerified: isWithinOfficeCircumstance,
      status,
      notes: data.notes,
    };

    setAttendance(prev => [newRecord, ...prev]);
    showToast(
      isWithinOfficeCircumstance
        ? `Attendance punched: Verified within office geofence (${data.distanceFromOfficeMeters}m)`
        : `Attendance punched: Logged for ${data.locationType} (${data.distanceFromOfficeMeters}m from office)`,
      isWithinOfficeCircumstance ? 'success' : 'info'
    );
    return newRecord;
  };

  const submitLeaveRequest = (data: {
    leaveType: LeaveType;
    startDate: string;
    endDate: string;
    daysCount: number;
    reason: string;
  }): LeaveRequest => {
    const newLeave: LeaveRequest = {
      id: `leave-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      leaveType: data.leaveType,
      startDate: data.startDate,
      endDate: data.endDate,
      daysCount: data.daysCount,
      reason: data.reason,
      status: 'PENDING',
      appliedAt: new Date().toISOString(),
    };

    setLeaves(prev => [newLeave, ...prev]);
    showToast('Leave request submitted to Coordinator / HR for review', 'success');

    addNotification({
      title: 'New Holiday / Leave Request',
      message: `${currentUser.name} applied for ${data.daysCount} days of ${data.leaveType} leave (${data.startDate} to ${data.endDate}).`,
      type: 'STATUS_CHANGE',
    });

    return newLeave;
  };

  const reviewLeaveRequest = (leaveId: string, status: 'APPROVED' | 'REJECTED', reviewNotes?: string) => {
    const leave = leaves.find(l => l.id === leaveId);
    if (!leave) return;

    setLeaves(prev =>
      prev.map(l =>
        l.id === leaveId
          ? {
              ...l,
              status,
              reviewedByUserId: currentUser.id,
              reviewedByName: currentUser.name,
              reviewedAt: new Date().toISOString(),
              reviewNotes,
            }
          : l
      )
    );

    showToast(`Leave request ${status.toLowerCase()} successfully`, status === 'APPROVED' ? 'success' : 'info');

    addNotification({
      title: `Leave Request ${status}`,
      message: `Your ${leave.leaveType} leave application was ${status.toLowerCase()} by ${currentUser.name}.`,
      type: 'STATUS_CHANGE',
    });
  };

  // Stock Inward (Admin & Sales)
  const addNewItem = (itemData: Omit<InventoryItem, 'id'>): InventoryItem => {
    const newItem: InventoryItem = {
      ...itemData,
      id: `item-${Date.now()}`,
    };
    setItems(prev => [newItem, ...prev]);

    // Record initial stock log if initial stock > 0
    if (newItem.stockQuantity > 0) {
      const newLog: StockInwardLog = {
        id: `inw-${Date.now()}`,
        itemId: newItem.id,
        itemName: newItem.name,
        sku: newItem.sku,
        quantityAdded: newItem.stockQuantity,
        previousStock: 0,
        newStock: newItem.stockQuantity,
        supplierInvoiceNo: 'INITIAL-CATALOG-STOCK',
        vendorName: 'Direct Catalog Addition',
        unitCost: Math.round(newItem.unitPrice * 0.75),
        addedByUserId: currentUser.id,
        addedByName: currentUser.name,
        createdAt: new Date().toISOString(),
        notes: 'Initial inventory creation',
      };
      setStockInwardLogs(prev => [newLog, ...prev]);
    }

    showToast(`New item ${newItem.name} (${newItem.sku}) added to catalog!`, 'success');
    return newItem;
  };

  const addStockInward = (data: {
    itemId: string;
    quantityAdded: number;
    supplierInvoiceNo: string;
    vendorName: string;
    unitCost: number;
    notes?: string;
  }) => {
    const targetItem = items.find(i => i.id === data.itemId);
    if (!targetItem) {
      showToast('Item not found', 'error');
      return;
    }

    const previousStock = targetItem.stockQuantity;
    const newStock = previousStock + data.quantityAdded;

    // Update item stock
    setItems(prev =>
      prev.map(i =>
        i.id === data.itemId ? { ...i, stockQuantity: newStock } : i
      )
    );

    // Record inward log
    const newLog: StockInwardLog = {
      id: `inw-${Date.now()}`,
      itemId: targetItem.id,
      itemName: targetItem.name,
      sku: targetItem.sku,
      quantityAdded: data.quantityAdded,
      previousStock,
      newStock,
      supplierInvoiceNo: data.supplierInvoiceNo,
      vendorName: data.vendorName,
      unitCost: data.unitCost,
      addedByUserId: currentUser.id,
      addedByName: currentUser.name,
      createdAt: new Date().toISOString(),
      notes: data.notes,
    };
    setStockInwardLogs(prev => [newLog, ...prev]);

    // Check if any Job Cards were in PURCHASE_PENDING waiting for this item
    const waitingJobs = jobCards.filter(j => j.status === 'PURCHASE_PENDING');
    waitingJobs.forEach(job => {
      const jobReqs = requirements.filter(r => r.jobCardId === job.id && r.itemId === data.itemId);
      if (jobReqs.length > 0) {
        // Run stock check
        const allJobReqs = requirements.filter(r => r.jobCardId === job.id && !r.isServiceCharge && r.itemId);
        const stillShort = allJobReqs.some(r => {
          const itm = r.itemId === data.itemId ? { ...targetItem, stockQuantity: newStock } : items.find(i => i.id === r.itemId);
          return !itm || itm.stockQuantity < r.quantity;
        });

        if (!stillShort) {
          setJobCards(prev =>
            prev.map(j =>
              j.id === job.id
                ? { ...j, status: 'QUOTATION_DRAFTED', updatedAt: new Date().toISOString() }
                : j
            )
          );
          addTransition(
            job.id,
            'PURCHASE_PENDING',
            'QUOTATION_DRAFTED',
            `Stock inward of ${data.quantityAdded}x ${targetItem.name} fulfilled requirements. Advance to quote draft.`
          );
          createOrUpdateQuotation(job.id);
        }
      }
    });

    addNotification({
      title: 'Warehouse Stock Inward Logged',
      message: `+${data.quantityAdded}x ${targetItem.name} received (Invoice: ${data.supplierInvoiceNo}). Stock now ${newStock}.`,
      type: 'PO_RECEIVED',
    });

    showToast(`Stock inward recorded: +${data.quantityAdded} ${targetItem.name}. New stock: ${newStock}.`, 'success');
  };

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const addTransition = (jobCardId: string, fromStatus: JobStatus | null, toStatus: JobStatus, reason?: string) => {
    const newTransition: JobCardTransition = {
      id: `tr-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      jobCardId,
      fromStatus,
      toStatus,
      changedByUserId: currentUser.id,
      changedByName: currentUser.name,
      reason: reason || `Status changed from ${fromStatus || 'INIT'} to ${toStatus}`,
      createdAt: new Date().toISOString(),
    };
    setTransitions(prev => [newTransition, ...prev]);
  };

  // 1. Create Job Card
  const createJobCard = (data: {
    customerId: string;
    type: JobType;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    notes?: string;
    assignedEngineerId?: string;
    initialRequirements?: { itemId?: string; customItemName?: string; quantity: number; isServiceCharge: boolean; rate: number }[];
  }): string => {
    const nextIndex = jobCards.length + 1;
    const jobNumber = `JC-2026-${String(nextIndex).padStart(4, '0')}`;
    const newId = `jc-${Date.now()}`;
    const now = new Date().toISOString();

    let initialStatus: JobStatus = 'REQUESTED';
    if (data.type === 'SERVICE' && data.assignedEngineerId) {
      initialStatus = 'ENGINEER_ASSIGNED';
    }

    const cust = customers.find(c => c.id === data.customerId);

    const newJob: JobCard = {
      id: newId,
      jobNumber,
      customerId: data.customerId,
      type: data.type,
      status: initialStatus,
      assignedEngineerId: data.assignedEngineerId,
      notes: data.notes,
      createdByUserId: currentUser.id,
      createdAt: now,
      updatedAt: now,
      priority: data.priority,
      siteCoordinates: cust?.coordinates ? {
        ...cust.coordinates,
        address: cust.shippingAddress || cust.billingAddress,
      } : undefined,
    };

    setJobCards(prev => [newJob, ...prev]);
    addTransition(newId, null, initialStatus, `Created ${data.type} Job Card ${jobNumber}`);

    // Add initial requirements if any
    if (data.initialRequirements && data.initialRequirements.length > 0) {
      const reqs: JobRequirement[] = data.initialRequirements.map((r, idx) => ({
        id: `req-${Date.now()}-${idx}`,
        jobCardId: newId,
        itemId: r.itemId,
        customItemName: r.customItemName,
        quantity: r.quantity,
        isServiceCharge: r.isServiceCharge,
        rate: r.rate,
        createdAt: now,
      }));
      setRequirements(prev => [...reqs, ...prev]);
    }

    showToast(`Job Card ${jobNumber} created successfully!`, 'success');
    setSelectedJobCardId(newId);
    return newId;
  };

  // 2. Assign Engineer (Service flow)
  const assignEngineer = (jobCardId: string, engineerId: string, reason?: string) => {
    const targetJob = jobCards.find(j => j.id === jobCardId);
    if (!targetJob) return;
    const engineer = users.find(u => u.id === engineerId);

    setJobCards(prev =>
      prev.map(j =>
        j.id === jobCardId
          ? {
              ...j,
              assignedEngineerId: engineerId,
              status: 'ENGINEER_ASSIGNED',
              updatedAt: new Date().toISOString(),
            }
          : j
      )
    );

    addTransition(
      jobCardId,
      targetJob.status,
      'ENGINEER_ASSIGNED',
      reason || `Assigned to Field Engineer ${engineer?.name || 'Engineer'}`
    );

    addNotification({
      title: 'New Job Assignment',
      message: `Field Engineer ${engineer?.name || 'Engineer'} was assigned to Service Ticket ${targetJob.jobNumber}.`,
      type: 'JOB_ASSIGNMENT',
      jobCardId,
    });

    showToast(`Engineer ${engineer?.name} assigned to ${targetJob.jobNumber}!`, 'success');
  };

  // 3. Mobile Inspection & Material Requirement Logging
  const submitInspectionReport = (
    jobCardId: string,
    report: InspectionReport,
    requirementsList: { itemId?: string; customItemName?: string; quantity: number; isServiceCharge: boolean; rate: number }[]
  ) => {
    const targetJob = jobCards.find(j => j.id === jobCardId);
    if (!targetJob) return;

    const now = new Date().toISOString();
    const updatedReport: InspectionReport = {
      ...report,
      submittedAt: now,
    };

    // Replace / set requirements for this job card
    const otherReqs = requirements.filter(r => r.jobCardId !== jobCardId);
    const newReqs: JobRequirement[] = requirementsList.map((r, idx) => ({
      id: `req-${Date.now()}-${idx}`,
      jobCardId,
      itemId: r.itemId,
      customItemName: r.customItemName,
      quantity: r.quantity,
      isServiceCharge: r.isServiceCharge,
      rate: r.rate,
      createdAt: now,
    }));
    setRequirements([...otherReqs, ...newReqs]);

    const hasParts = requirementsList.some(r => !r.isServiceCharge && r.itemId);

    // If Service Only: advance directly to QUOTATION_DRAFTED
    // If Parts Needed: advance to REQUIREMENTS_LOGGED (then stock check pending)
    let nextStatus: JobStatus = 'REQUIREMENTS_LOGGED';
    if (report.serviceOnly || !hasParts) {
      nextStatus = 'QUOTATION_DRAFTED';
    }

    setJobCards(prev =>
      prev.map(j =>
        j.id === jobCardId
          ? {
              ...j,
              inspectionReport: updatedReport,
              status: nextStatus,
              updatedAt: now,
            }
          : j
      )
    );

    addTransition(
      jobCardId,
      targetJob.status,
      nextStatus,
      report.serviceOnly
        ? 'Inspection complete: Service/Labor only (No spare parts needed).'
        : `Inspection report submitted with ${requirementsList.length} items/charges.`
    );

    // Automatically build quotation draft if service only
    if (nextStatus === 'QUOTATION_DRAFTED') {
      createOrUpdateQuotation(jobCardId);
    }

    showToast(`Inspection findings submitted for ${targetJob.jobNumber}!`, 'success');
  };

  // 4. Perform Stock Check & Auto-branch
  const performStockCheckAndAdvance = (jobCardId: string): { canProceed: boolean; outOfStockItemNames: string[] } => {
    const targetJob = jobCards.find(j => j.id === jobCardId);
    if (!targetJob) return { canProceed: false, outOfStockItemNames: [] };

    const jobReqs = requirements.filter(r => r.jobCardId === jobCardId && !r.isServiceCharge && r.itemId);
    const outOfStockItems: { item: InventoryItem; needed: number; available: number }[] = [];

    jobReqs.forEach(req => {
      const item = items.find(i => i.id === req.itemId);
      if (item && item.stockQuantity < req.quantity) {
        outOfStockItems.push({ item, needed: req.quantity, available: item.stockQuantity });
      }
    });

    const outNames = outOfStockItems.map(o => `${o.item.name} (Need ${o.needed}, Have ${o.available})`);

    if (outOfStockItems.length > 0) {
      // Out of Stock branch -> PURCHASE_PENDING
      // Automatically create a draft Purchase Order for each missing item
      outOfStockItems.forEach(o => {
        const orderQty = Math.max(o.needed - o.available, o.item.reorderLevel);
        createPurchaseOrder({
          jobCardId,
          itemId: o.item.id,
          quantity: orderQty,
          supplierName: 'Preferred OEM Industrial Supplies',
          unitPrice: Math.round(o.item.unitPrice * 0.78),
        });
      });

      setJobCards(prev =>
        prev.map(j =>
          j.id === jobCardId
            ? {
                ...j,
                status: 'PURCHASE_PENDING',
                updatedAt: new Date().toISOString(),
              }
            : j
        )
      );

      addTransition(
        jobCardId,
        targetJob.status,
        'PURCHASE_PENDING',
        `Stock check failed: ${outNames.join(', ')}. Purchase orders automatically generated with supplier lead time.`
      );

      showToast(`Stock shortage detected. Job moved to PURCHASE_PENDING with new POs!`, 'info');
      return { canProceed: false, outOfStockItemNames: outNames };
    } else {
      // All in Stock! Reserve/lock items and advance to QUOTATION_DRAFTED
      setJobCards(prev =>
        prev.map(j =>
          j.id === jobCardId
            ? {
                ...j,
                status: 'QUOTATION_DRAFTED',
                updatedAt: new Date().toISOString(),
              }
            : j
        )
      );

      addTransition(
        jobCardId,
        targetJob.status,
        'QUOTATION_DRAFTED',
        `Stock check passed: All ${jobReqs.length} required items are in stock and reserved.`
      );

      createOrUpdateQuotation(jobCardId);
      showToast(`Stock verified! Quotation has been drafted.`, 'success');
      return { canProceed: true, outOfStockItemNames: [] };
    }
  };

  // 5. Create Purchase Order
  const createPurchaseOrder = (data: {
    jobCardId?: string;
    itemId: string;
    quantity: number;
    supplierName: string;
    unitPrice: number;
  }) => {
    const item = items.find(i => i.id === data.itemId);
    const leadTime = item ? item.leadTimeDays : 7;
    const now = new Date();
    const deliveryDate = new Date(now.getTime() + leadTime * 24 * 60 * 60 * 1000);

    const poNumber = `PO-2026-${String(purchaseOrders.length + 10).padStart(4, '0')}`;
    const newPO: PurchaseOrder = {
      id: `po-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      poNumber,
      jobCardId: data.jobCardId,
      itemId: data.itemId,
      quantity: data.quantity,
      supplierName: data.supplierName,
      status: 'ORDERED',
      expectedDurationDays: leadTime,
      expectedDeliveryDate: deliveryDate.toISOString().split('T')[0],
      unitPrice: data.unitPrice,
      createdAt: now.toISOString(),
    };

    setPurchaseOrders(prev => [newPO, ...prev]);
  };

  // 6. Receive Goods for Purchase Order (Stock Updated -> Advance Job Card to QUOTATION_DRAFTED)
  const receivePurchaseOrder = (poId: string) => {
    const targetPO = purchaseOrders.find(p => p.id === poId);
    if (!targetPO || targetPO.status === 'RECEIVED') return;

    const now = new Date().toISOString();

    // 1. Mark PO as received
    setPurchaseOrders(prev =>
      prev.map(p =>
        p.id === poId
          ? {
              ...p,
              status: 'RECEIVED',
              receivedDate: now.split('T')[0],
            }
          : p
      )
    );

    // 2. Increment inventory stock
    setItems(prev =>
      prev.map(i =>
        i.id === targetPO.itemId
          ? {
              ...i,
              stockQuantity: i.stockQuantity + targetPO.quantity,
            }
          : i
      )
    );

    // 3. If linked to a job card in PURCHASE_PENDING, check if all POs are now received or stock is sufficient
    if (targetPO.jobCardId) {
      const targetJob = jobCards.find(j => j.id === targetPO.jobCardId);
      if (targetJob && targetJob.status === 'PURCHASE_PENDING') {
        // Transition job card to QUOTATION_DRAFTED
        setJobCards(prev =>
          prev.map(j =>
            j.id === targetPO.jobCardId
              ? {
                  ...j,
                  status: 'QUOTATION_DRAFTED',
                  updatedAt: now,
                }
              : j
          )
        );

        addTransition(
          targetPO.jobCardId,
          'PURCHASE_PENDING',
          'QUOTATION_DRAFTED',
          `PO ${targetPO.poNumber} received. Warehouse inventory incremented (+${targetPO.quantity}). Job ready for quotation.`
        );

        createOrUpdateQuotation(targetPO.jobCardId);
      }
    }

    addNotification({
      title: 'Warehouse Goods Received',
      message: `Purchase Order ${targetPO.poNumber} arrived. +${targetPO.quantity} units restocked in inventory.`,
      type: 'PO_RECEIVED',
      jobCardId: targetPO.jobCardId,
    });

    showToast(`PO ${targetPO.poNumber} received! Stock quantity increased by ${targetPO.quantity}.`, 'success');
  };

  // 7. Create or update Quotation
  const createOrUpdateQuotation = (jobCardId: string, discount: number = 0, notes?: string): Quotation => {
    const jobReqs = requirements.filter(r => r.jobCardId === jobCardId);
    let subtotal = 0;
    jobReqs.forEach(r => {
      subtotal += r.rate * r.quantity;
    });

    const tax = Math.round(subtotal * 0.18); // 18% GST / VAT
    const total = Math.max(0, subtotal + tax - discount);

    const existingQuote = quotations.find(q => q.jobCardId === jobCardId);
    if (existingQuote) {
      const updated: Quotation = {
        ...existingQuote,
        subtotal,
        tax,
        discount,
        total,
        notes: notes !== undefined ? notes : existingQuote.notes,
      };
      setQuotations(prev => prev.map(q => (q.id === existingQuote.id ? updated : q)));
      return updated;
    } else {
      const quoteNumber = `QT-2026-${String(quotations.length + 101).padStart(4, '0')}`;
      const newQuote: Quotation = {
        id: `quote-${Date.now()}`,
        quotationNumber: quoteNumber,
        jobCardId,
        subtotal,
        tax,
        discount,
        total,
        isApproved: false,
        notes: notes || 'Standard 30-day price validity. Includes technical calibration and standard warranty.',
        createdAt: new Date().toISOString(),
      };
      setQuotations(prev => [newQuote, ...prev]);
      return newQuote;
    }
  };

  // 8. Approve Quotation
  const approveQuotation = (quotationId: string) => {
    const quote = quotations.find(q => q.id === quotationId);
    if (!quote) return;

    const now = new Date().toISOString();

    setQuotations(prev =>
      prev.map(q =>
        q.id === quotationId
          ? {
              ...q,
              isApproved: true,
              approvedAt: now,
            }
          : q
      )
    );

    const targetJob = jobCards.find(j => j.id === quote.jobCardId);
    if (targetJob) {
      setJobCards(prev =>
        prev.map(j =>
          j.id === quote.jobCardId
            ? {
                ...j,
                status: 'QUOTATION_APPROVED',
                updatedAt: now,
              }
            : j
        )
      );

      addTransition(
        quote.jobCardId,
        targetJob.status,
        'QUOTATION_APPROVED',
        `Quotation ${quote.quotationNumber} approved by customer. Ready for invoicing.`
      );
    }

    addNotification({
      title: 'Customer Quote Approved',
      message: `Customer approved Quotation ${quote.quotationNumber} for ₹${quote.total.toLocaleString('en-IN')}${targetJob ? ` (${targetJob.jobNumber})` : ''}. Ready for invoicing.`,
      type: 'QUOTE_APPROVAL',
      jobCardId: quote.jobCardId,
    });

    showToast(`Quotation ${quote.quotationNumber} approved!`, 'success');
  };

  // 9. Generate Invoice
  const generateInvoice = (quotationId: string): Invoice => {
    const quote = quotations.find(q => q.id === quotationId);
    if (!quote) throw new Error('Quotation not found');

    const targetJob = jobCards.find(j => j.id === quote.jobCardId);
    const now = new Date();
    const dueDate = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000);

    const invoiceNumber = `INV-2026-${String(invoices.length + 100).padStart(4, '0')}`;
    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber,
      quotationId,
      jobCardId: quote.jobCardId,
      totalAmount: quote.total,
      status: 'UNPAID',
      issuedDate: now.toISOString().split('T')[0],
      dueDate: dueDate.toISOString().split('T')[0],
      createdAt: now.toISOString(),
    };

    setInvoices(prev => [newInvoice, ...prev]);

    if (targetJob) {
      setJobCards(prev =>
        prev.map(j =>
          j.id === quote.jobCardId
            ? {
                ...j,
                status: 'INVOICED',
                updatedAt: now.toISOString(),
              }
            : j
        )
      );

      addTransition(
        quote.jobCardId,
        targetJob.status,
        'INVOICED',
        `Tax Invoice ${invoiceNumber} issued for ₹${quote.total.toLocaleString('en-IN')}. Awaiting dispatch & delivery.`
      );
    }

    addNotification({
      title: 'Tax Invoice Issued',
      message: `Tax Invoice ${invoiceNumber} issued for ₹${quote.total.toLocaleString('en-IN')}${targetJob ? ` (${targetJob.jobNumber})` : ''}.`,
      type: 'INVOICE_ISSUED',
      jobCardId: quote.jobCardId,
    });

    showToast(`Invoice ${invoiceNumber} issued!`, 'success');
    return newInvoice;
  };

  // 10. Mark as Delivered / Fulfilled
  const markAsDelivered = (jobCardId: string, deliveryNotes?: string) => {
    const targetJob = jobCards.find(j => j.id === jobCardId);
    if (!targetJob) return;

    // Deduct inventory items reserved for this job card
    const jobReqs = requirements.filter(r => r.jobCardId === jobCardId && !r.isServiceCharge && r.itemId);
    setItems(prev =>
      prev.map(i => {
        const req = jobReqs.find(r => r.itemId === i.id);
        if (req) {
          return {
            ...i,
            stockQuantity: Math.max(0, i.stockQuantity - req.quantity),
          };
        }
        return i;
      })
    );

    const now = new Date().toISOString();
    setJobCards(prev =>
      prev.map(j =>
        j.id === jobCardId
          ? {
              ...j,
              status: 'DELIVERED',
              updatedAt: now,
            }
          : j
      )
    );

    addTransition(
      jobCardId,
      targetJob.status,
      'DELIVERED',
      deliveryNotes || 'Physical delivery/service execution verified and customer acknowledgement signed.'
    );

    showToast(`Job ${targetJob.jobNumber} marked as DELIVERED! Inventory deducted.`, 'success');
  };

  // 11. Record Payment
  const recordPayment = (
    invoiceId: string,
    amount: number,
    paymentMode: PaymentMode,
    transactionReference: string,
    notes?: string
  ) => {
    const targetInvoice = invoices.find(inv => inv.id === invoiceId);
    if (!targetInvoice) return;

    const newPayment: Payment = {
      id: `pay-${Date.now()}`,
      invoiceId,
      jobCardId: targetInvoice.jobCardId,
      amount,
      paymentMode,
      transactionReference,
      paidAt: new Date().toISOString(),
      notes,
    };

    const newPayments = [newPayment, ...payments];
    setPayments(newPayments);

    // Calculate total paid for this invoice
    const allInvoicePayments = newPayments.filter(p => p.invoiceId === invoiceId);
    const totalPaid = allInvoicePayments.reduce((sum, p) => sum + p.amount, 0);

    const isFullyPaid = totalPaid >= targetInvoice.totalAmount;
    const paymentStatus: 'UNPAID' | 'PARTIALLY_PAID' | 'PAID' = isFullyPaid
      ? 'PAID'
      : totalPaid > 0
      ? 'PARTIALLY_PAID'
      : 'UNPAID';

    setInvoices(prev =>
      prev.map(inv =>
        inv.id === invoiceId
          ? {
              ...inv,
              status: paymentStatus,
            }
          : inv
      )
    );

    const targetJob = jobCards.find(j => j.id === targetInvoice.jobCardId);
    if (isFullyPaid && targetJob) {
      setJobCards(prev =>
        prev.map(j =>
          j.id === targetJob.id
            ? {
                ...j,
                status: 'PAID',
                updatedAt: new Date().toISOString(),
              }
            : j
        )
      );

      addTransition(
        targetJob.id,
        targetJob.status,
        'PAID',
        `Full payment of ₹${targetInvoice.totalAmount.toLocaleString('en-IN')} reconciled via ${paymentMode}.`
      );

      addNotification({
        title: 'Invoice Paid in Full',
        message: `Invoice ${targetInvoice.invoiceNumber} paid in full (₹${amount.toLocaleString('en-IN')} via ${paymentMode}).`,
        type: 'PAYMENT_RECEIVED',
        jobCardId: targetInvoice.jobCardId,
      });

      showToast(`Payment of ₹${amount.toLocaleString('en-IN')} received! Invoice is PAID in full.`, 'success');
    } else {
      addNotification({
        title: 'Partial Payment Received',
        message: `Partial payment of ₹${amount.toLocaleString('en-IN')} received via ${paymentMode} for ${targetInvoice.invoiceNumber}.`,
        type: 'PAYMENT_RECEIVED',
        jobCardId: targetInvoice.jobCardId,
      });

      showToast(`Partial payment of ₹${amount.toLocaleString('en-IN')} recorded.`, 'info');
    }
  };

  // 12. Close / Archive Job Card
  const closeJobCard = (jobCardId: string, reason?: string) => {
    const targetJob = jobCards.find(j => j.id === jobCardId);
    if (!targetJob) return;

    setJobCards(prev =>
      prev.map(j =>
        j.id === jobCardId
          ? {
              ...j,
              status: 'CLOSED',
              updatedAt: new Date().toISOString(),
            }
          : j
      )
    );

    addTransition(
      jobCardId,
      targetJob.status,
      'CLOSED',
      reason || 'Job completed, customer sign-off verified, invoice settled in full.'
    );

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {}

    showToast(`Job ${targetJob.jobNumber} is officially CLOSED & ARCHIVED!`, 'success');
  };

  // 13. Cancel Job Card
  const cancelJobCard = (jobCardId: string, reason: string) => {
    const targetJob = jobCards.find(j => j.id === jobCardId);
    if (!targetJob) return;

    setJobCards(prev =>
      prev.map(j =>
        j.id === jobCardId
          ? {
              ...j,
              status: 'CANCELLED',
              updatedAt: new Date().toISOString(),
            }
          : j
      )
    );

    addTransition(jobCardId, targetJob.status, 'CANCELLED', `Cancelled: ${reason}`);
    showToast(`Job ${targetJob.jobNumber} cancelled.`, 'info');
  };

  const updateInventoryStock = (itemId: string, newStock: number) => {
    setItems(prev =>
      prev.map(i =>
        i.id === itemId
          ? {
              ...i,
              stockQuantity: Math.max(0, newStock),
            }
          : i
      )
    );
    showToast('Inventory stock updated successfully!', 'success');
  };

  const resetToDefaults = () => {
    localStorage.clear();
    setUsers(INITIAL_USERS);
    setIsAuthenticated(true);
    setCurrentUser(INITIAL_USERS[0]);
    setCustomers(INITIAL_CUSTOMERS);
    setItems(INITIAL_ITEMS);
    setJobCards(INITIAL_JOB_CARDS);
    setRequirements(INITIAL_REQUIREMENTS);
    setTransitions(INITIAL_TRANSITIONS);
    setPurchaseOrders(INITIAL_PURCHASE_ORDERS);
    setQuotations(INITIAL_QUOTATIONS);
    setInvoices(INITIAL_INVOICES);
    setPayments(INITIAL_PAYMENTS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setAttendance(INITIAL_ATTENDANCE);
    setLeaves(INITIAL_LEAVES);
    setStockInwardLogs(INITIAL_STOCK_INWARD_LOGS);
    setSelectedJobCardId('jc-2');
    showToast('System reset to demo initial data!', 'info');
  };

  // Real-time synchronization state & BroadcastChannel
  const [isRealtimeActive] = useState<boolean>(true);
  const [lastRealtimeSyncTime, setLastRealtimeSyncTime] = useState<string | null>(() => new Date().toLocaleTimeString());

  // Listen for cross-tab or cross-instance events via BroadcastChannel
  useEffect(() => {
    let channel: BroadcastChannel | null = null;
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        channel = new BroadcastChannel('smaart_realtime_hub');
        channel.onmessage = (event) => {
          if (event.data?.type === 'REALTIME_PING') {
            setLastRealtimeSyncTime(new Date().toLocaleTimeString());
            showToast(`Real-time ping received from: ${event.data.sender || 'Remote Device'}`, 'info');
          } else if (event.data?.type === 'STATE_REFRESH') {
            setLastRealtimeSyncTime(new Date().toLocaleTimeString());
            setJobCards(loadState('job_cards', INITIAL_JOB_CARDS));
            setAttendance(loadState('attendance', INITIAL_ATTENDANCE));
            setNotifications(loadState('notifications', INITIAL_NOTIFICATIONS));
            setQuotations(loadState('quotations', INITIAL_QUOTATIONS));
            setInvoices(loadState('invoices', INITIAL_INVOICES));
            setItems(loadState('items', INITIAL_ITEMS));
          }
        };
      }
    } catch {}

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key && e.key.startsWith(STORAGE_KEY)) {
        setLastRealtimeSyncTime(new Date().toLocaleTimeString());
        if (e.key === `${STORAGE_KEY}_job_cards`) {
          setJobCards(loadState('job_cards', INITIAL_JOB_CARDS));
        } else if (e.key === `${STORAGE_KEY}_attendance`) {
          setAttendance(loadState('attendance', INITIAL_ATTENDANCE));
        } else if (e.key === `${STORAGE_KEY}_notifications`) {
          setNotifications(loadState('notifications', INITIAL_NOTIFICATIONS));
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      if (channel) channel.close();
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const sendRealtimeBroadcastPing = () => {
    const time = new Date().toLocaleTimeString();
    setLastRealtimeSyncTime(time);
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const channel = new BroadcastChannel('smaart_realtime_hub');
        channel.postMessage({
          type: 'REALTIME_PING',
          sender: `${currentUser.name} (${currentUser.role})`,
          timestamp: time,
        });
        channel.close();
      }
    } catch {}
    showToast(`Real-time broadcast dispatched across all connected tabs & devices!`, 'success');
  };

  const exportDatabaseJSON = (): string => {
    const payload = {
      app: 'SMAART Operations Suite',
      version: '2.5.0',
      exportedAt: new Date().toISOString(),
      exportedBy: {
        id: currentUser.id,
        name: currentUser.name,
        role: currentUser.role,
        email: currentUser.email,
      },
      database: {
        users,
        customers,
        items,
        jobCards,
        requirements,
        transitions,
        purchaseOrders,
        quotations,
        invoices,
        payments,
        notifications,
        attendance,
        leaves,
        holidays,
        stockInwardLogs,
      },
    };
    return JSON.stringify(payload, null, 2);
  };

  const importDatabaseJSON = (jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      const db = data.database || data;
      if (db.users) setUsers(db.users);
      if (db.customers) setCustomers(db.customers);
      if (db.items) setItems(db.items);
      if (db.jobCards) setJobCards(db.jobCards);
      if (db.requirements) setRequirements(db.requirements);
      if (db.transitions) setTransitions(db.transitions);
      if (db.purchaseOrders) setPurchaseOrders(db.purchaseOrders);
      if (db.quotations) setQuotations(db.quotations);
      if (db.invoices) setInvoices(db.invoices);
      if (db.payments) setPayments(db.payments);
      if (db.notifications) setNotifications(db.notifications);
      if (db.attendance) setAttendance(db.attendance);
      if (db.leaves) setLeaves(db.leaves);
      if (db.stockInwardLogs) setStockInwardLogs(db.stockInwardLogs);

      showToast('Database successfully imported & restored!', 'success');
      return true;
    } catch {
      showToast('Failed to import database JSON. Invalid format.', 'error');
      return false;
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        isAuthenticated,
        login,
        logout,
        loginAsUser,
        users,
        addUser,
        updateUserStatus,
        deleteUser,
        customers,
        items,
        jobCards,
        requirements,
        transitions,
        purchaseOrders,
        quotations,
        invoices,
        payments,
        notifications,
        unreadNotificationCount,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        clearNotifications,
        addNotification,
        attendance,
        leaves,
        holidays,
        punchAttendance,
        submitLeaveRequest,
        reviewLeaveRequest,
        stockInwardLogs,
        addNewItem,
        addStockInward,
        viewMode,
        setViewMode,
        selectedJobCardId,
        setSelectedJobCardId,
        toastMessage,
        showToast,
        theme,
        isDarkMode,
        setTheme,
        toggleTheme,
        createJobCard,
        assignEngineer,
        submitInspectionReport,
        performStockCheckAndAdvance,
        createPurchaseOrder,
        receivePurchaseOrder,
        createOrUpdateQuotation,
        approveQuotation,
        generateInvoice,
        markAsDelivered,
        recordPayment,
        closeJobCard,
        cancelJobCard,
        updateInventoryStock,
        resetToDefaults,
        exportDatabaseJSON,
        importDatabaseJSON,
        isRealtimeActive,
        lastRealtimeSyncTime,
        sendRealtimeBroadcastPing,
        isSetupModalOpen,
        setIsSetupModalOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
