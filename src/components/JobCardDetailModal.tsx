import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { JobCard, JobStatus, PaymentMode } from '../types';
import {
  X,
  FileText,
  User,
  Building,
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Package,
  DollarSign,
  Printer,
  ShieldCheck,
  ChevronRight,
  Send,
  Plus,
  RefreshCw,
  Eye,
  Check,
} from 'lucide-react';

interface JobCardDetailModalProps {
  jobCardId: string;
  onClose: () => void;
  onOpenPrintDoc: (type: 'QUOTATION' | 'INVOICE', id: string) => void;
}

export const JobCardDetailModal: React.FC<JobCardDetailModalProps> = ({
  jobCardId,
  onClose,
  onOpenPrintDoc,
}) => {
  const {
    jobCards,
    customers,
    users,
    items,
    requirements,
    transitions,
    purchaseOrders,
    quotations,
    invoices,
    payments,
    currentUser,
    assignEngineer,
    performStockCheckAndAdvance,
    approveQuotation,
    generateInvoice,
    markAsDelivered,
    recordPayment,
    closeJobCard,
    cancelJobCard,
    setViewMode,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'REQUIREMENTS' | 'FINANCIALS' | 'AUDIT'>('OVERVIEW');
  const [selectedEngineerId, setSelectedEngineerId] = useState('');
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  // Payment form state
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('UPI');
  const [transactionRef, setTransactionRef] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');

  const job = jobCards.find(j => j.id === jobCardId);
  if (!job) return null;

  const customer = customers.find(c => c.id === job.customerId);
  const engineer = users.find(u => u.id === job.assignedEngineerId);
  const creator = users.find(u => u.id === job.createdByUserId);

  const jobReqs = requirements.filter(r => r.jobCardId === job.id);
  const jobTransitions = transitions.filter(t => t.jobCardId === job.id);
  const jobPOs = purchaseOrders.filter(p => p.jobCardId === job.id);
  const quote = quotations.find(q => q.jobCardId === job.id);
  const invoice = invoices.find(inv => inv.jobCardId === job.id);
  const jobPayments = payments.filter(p => p.jobCardId === job.id);

  const totalPaid = jobPayments.reduce((sum, p) => sum + p.amount, 0);
  const invoiceBalance = invoice ? Math.max(0, invoice.totalAmount - totalPaid) : 0;

  // Lifecycle progression list
  const steps: { status: JobStatus; label: string }[] =
    job.type === 'SALES'
      ? [
          { status: 'REQUESTED', label: 'Requested' },
          { status: 'PURCHASE_PENDING', label: 'Procurement (if OOS)' },
          { status: 'QUOTATION_DRAFTED', label: 'Quote Ready' },
          { status: 'QUOTATION_APPROVED', label: 'Approved' },
          { status: 'INVOICED', label: 'Invoiced' },
          { status: 'DELIVERED', label: 'Delivered' },
          { status: 'PAID', label: 'Settled' },
          { status: 'CLOSED', label: 'Closed' },
        ]
      : [
          { status: 'REQUESTED', label: 'Requested' },
          { status: 'ENGINEER_ASSIGNED', label: 'Assigned' },
          { status: 'REQUIREMENTS_LOGGED', label: 'Inspection Done' },
          { status: 'QUOTATION_DRAFTED', label: 'Quote Ready' },
          { status: 'QUOTATION_APPROVED', label: 'Approved' },
          { status: 'INVOICED', label: 'Invoiced' },
          { status: 'DELIVERED', label: 'Executed' },
          { status: 'PAID', label: 'Settled' },
          { status: 'CLOSED', label: 'Closed' },
        ];

  const getStatusColor = (status: JobStatus) => {
    switch (status) {
      case 'REQUESTED':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'ENGINEER_ASSIGNED':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'REQUIREMENTS_LOGGED':
        return 'bg-cyan-100 text-cyan-800 border-cyan-300';
      case 'PURCHASE_PENDING':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'QUOTATION_DRAFTED':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'QUOTATION_APPROVED':
        return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case 'INVOICED':
        return 'bg-sky-100 text-sky-800 border-sky-300';
      case 'DELIVERED':
        return 'bg-teal-100 text-teal-800 border-teal-300';
      case 'PAID':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'CLOSED':
        return 'bg-slate-200 text-slate-800 border-slate-400';
      case 'CANCELLED':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 bg-slate-50 dark:bg-slate-900/80">
          <div className="flex items-center gap-3">
            <span className="font-mono text-lg font-black text-blue-600 dark:text-blue-400">
              {job.jobNumber}
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold border uppercase tracking-wider ${
                job.type === 'SALES' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
            >
              {job.type} Job Card
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(job.status)}`}>
              {job.status}
            </span>
            <span
              className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                job.priority === 'CRITICAL'
                  ? 'bg-red-100 text-red-700'
                  : job.priority === 'HIGH'
                  ? 'bg-orange-100 text-orange-700'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              {job.priority} Priority
            </span>
          </div>

          <div className="flex items-center gap-2">
            {quote && (
              <button
                onClick={() => onOpenPrintDoc('QUOTATION', quote.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl hover:bg-slate-100 transition"
              >
                <Printer className="w-3.5 h-3.5 text-indigo-500" />
                Quote Doc
              </button>
            )}
            {invoice && (
              <button
                onClick={() => onOpenPrintDoc('INVOICE', invoice.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl hover:bg-slate-100 transition"
              >
                <Printer className="w-3.5 h-3.5 text-blue-500" />
                Tax Invoice
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Dynamic Action Ribbon Based on State Machine */}
        <div className="bg-blue-50/70 dark:bg-blue-950/30 px-6 py-3 border-b border-blue-100 dark:border-blue-900/50 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-blue-900 dark:text-blue-200">
            <span className="font-bold">Next Action Required: </span>
            {job.status === 'REQUESTED' && job.type === 'SERVICE' && 'Assign a field engineer for on-site diagnostic inspection.'}
            {job.status === 'REQUESTED' && job.type === 'SALES' && 'Check warehouse stock availability to generate quotation or purchase orders.'}
            {job.status === 'ENGINEER_ASSIGNED' && 'Field inspection pending. Open mobile engineer companion to log findings.'}
            {job.status === 'REQUIREMENTS_LOGGED' && 'Inspection logged. Verify spare parts stock in warehouse.'}
            {job.status === 'PURCHASE_PENDING' && 'Parts out of stock. Purchase orders in progress. Receive goods when delivered.'}
            {job.status === 'QUOTATION_DRAFTED' && 'Formal quote prepared. Seek customer approval or apply negotiated discount.'}
            {job.status === 'QUOTATION_APPROVED' && 'Quote approved! Generate official GST Tax Invoice.'}
            {job.status === 'INVOICED' && 'Invoice issued. Fulfill parts / complete execution and mark as Delivered.'}
            {job.status === 'DELIVERED' && 'Goods/Service delivered. Collect and record customer payment.'}
            {job.status === 'PAID' && 'Dues cleared! Formally close and archive this Job Card.'}
            {job.status === 'CLOSED' && 'Job card is fully completed and archived.'}
          </div>

          <div className="flex items-center gap-2">
            {/* Guarded Transition Buttons */}
            {job.status === 'REQUESTED' && job.type === 'SERVICE' && (
              <button
                onClick={() => setAssignModalOpen(true)}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5"
              >
                <User className="w-3.5 h-3.5" />
                Assign Engineer
              </button>
            )}

            {job.status === 'REQUESTED' && job.type === 'SALES' && (
              <button
                onClick={() => performStockCheckAndAdvance(job.id)}
                className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5"
              >
                <Package className="w-3.5 h-3.5" />
                Check Stock & Branch
              </button>
            )}

            {job.status === 'ENGINEER_ASSIGNED' && (
              <button
                onClick={() => {
                  setViewMode('MOBILE_APP');
                  onClose();
                }}
                className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5"
              >
                Open Mobile Inspection
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {job.status === 'REQUIREMENTS_LOGGED' && (
              <button
                onClick={() => performStockCheckAndAdvance(job.id)}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5"
              >
                <Package className="w-3.5 h-3.5" />
                Run Warehouse Stock Check
              </button>
            )}

            {job.status === 'QUOTATION_DRAFTED' && quote && (
              <button
                onClick={() => approveQuotation(quote.id)}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                Approve Quotation
              </button>
            )}

            {job.status === 'QUOTATION_APPROVED' && quote && (
              <button
                onClick={() => generateInvoice(quote.id)}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5" />
                Issue Tax Invoice
              </button>
            )}

            {job.status === 'INVOICED' && (
              <button
                onClick={() => markAsDelivered(job.id, 'Goods delivered and work order acknowledged.')}
                className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                Mark Delivered & Deduct Stock
              </button>
            )}

            {job.status === 'DELIVERED' && invoice && (
              <button
                onClick={() => {
                  setPaymentAmount(invoiceBalance > 0 ? invoiceBalance : invoice.totalAmount);
                  setPaymentModalOpen(true);
                }}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5"
              >
                <DollarSign className="w-3.5 h-3.5" />
                Record Payment
              </button>
            )}

            {job.status === 'PAID' && (
              <button
                onClick={() => closeJobCard(job.id)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5"
              >
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                Archive & Close Job
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center px-6 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold gap-6">
          <button
            onClick={() => setActiveTab('OVERVIEW')}
            className={`py-3.5 border-b-2 transition ${
              activeTab === 'OVERVIEW'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Overview & Inspection
          </button>
          <button
            onClick={() => setActiveTab('REQUIREMENTS')}
            className={`py-3.5 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'REQUIREMENTS'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <span>Material & Labor</span>
            <span className="px-1.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-[10px]">
              {jobReqs.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('FINANCIALS')}
            className={`py-3.5 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'FINANCIALS'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <span>Quote & Invoicing</span>
            {invoice && (
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  invoice.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                }`}
              >
                {invoice.status}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('AUDIT')}
            className={`py-3.5 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'AUDIT'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <span>Audit Trail</span>
            <span className="px-1.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-[10px]">
              {jobTransitions.length}
            </span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'OVERVIEW' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Customer Details */}
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-blue-500" /> Customer Information
                </h4>
                {customer ? (
                  <div className="space-y-2 text-xs">
                    <div className="font-bold text-sm text-slate-900 dark:text-white">
                      {customer.companyName || customer.name}
                    </div>
                    <div className="text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      Contact: {customer.name}
                    </div>
                    <div className="text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      {customer.phone}
                    </div>
                    <div className="text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      {customer.email}
                    </div>
                    <div className="text-slate-600 dark:text-slate-300 flex items-start gap-1.5 pt-1">
                      <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                      <span>{customer.shippingAddress}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">Customer record not found</p>
                )}
              </div>

              {/* Service & Assignment Details */}
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-blue-500" /> Operations Assignment
                </h4>
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Assigned Field Engineer:</span>
                    {engineer ? (
                      <div className="flex items-center gap-2 mt-1">
                        <img src={engineer.avatar} alt={engineer.name} className="w-6 h-6 rounded-full object-cover" />
                        <div>
                          <div className="font-bold">{engineer.name}</div>
                          <div className="text-[10px] text-slate-500">{engineer.specialty}</div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-amber-600 font-semibold mt-0.5 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> Unassigned
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                    <span className="text-slate-400 block text-[10px]">Created By:</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {creator?.name || 'Operations Desk'} ({creator?.role})
                    </span>
                  </div>

                  <div className="pt-1">
                    <span className="text-slate-400 block text-[10px]">Target Completion:</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {job.estimatedCompletionDate || 'Within 7 business days'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Problem Statement / Notes */}
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-blue-500" /> Job Notes & Scope
                </h4>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                  {job.notes || 'No preliminary notes recorded for this ticket.'}
                </p>
                <div className="text-[11px] text-slate-400">
                  Registered: {new Date(job.createdAt).toLocaleString()}
                </div>
              </div>

              {/* Mobile Inspection Findings Box if present */}
              {job.inspectionReport && (
                <div className="md:col-span-3 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      Field Mobile Inspection Report
                      {job.inspectionReport.serviceOnly && (
                        <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px]">
                          Service Only
                        </span>
                      )}
                    </h4>
                    <span className="text-[11px] text-slate-400">
                      Logged at {new Date(job.inspectionReport.submittedAt || '').toLocaleString()}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 text-[10px] block">Equipment / Model:</span>
                      <span className="font-semibold">{job.inspectionReport.equipmentModel || 'Not Specified'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Serial Number:</span>
                      <span className="font-mono font-semibold">{job.inspectionReport.serialNumber || 'N/A'}</span>
                    </div>
                    <div className="md:col-span-2">
                      <span className="text-slate-400 text-[10px] block">Diagnosis & Findings:</span>
                      <p className="mt-1 p-2.5 bg-slate-50 dark:bg-slate-900 rounded-lg text-slate-700 dark:text-slate-300">
                        {job.inspectionReport.findings}
                      </p>
                    </div>
                  </div>

                  {/* Customer Signature preview */}
                  {job.inspectionReport.customerSignature && (
                    <div className="pt-2">
                      <span className="text-slate-400 text-[10px] block mb-1">Customer Digital Sign-Off:</span>
                      <img
                        src={job.inspectionReport.customerSignature}
                        alt="Customer Signature"
                        className="h-16 border border-slate-200 dark:border-slate-700 rounded-lg bg-white p-1"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'REQUIREMENTS' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Logged Spare Parts & Labor Charges
                  </h4>
                  <p className="text-xs text-slate-500">
                    Verified against warehouse inventory. Out-of-stock items trigger purchase orders automatically.
                  </p>
                </div>
              </div>

              {jobReqs.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-6">
                  <Package className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    No Requirements Logged Yet
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Assign an engineer or perform mobile diagnosis to log required parts and service charges.
                  </p>
                </div>
              ) : (
                <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-bold border-b border-slate-200 dark:border-slate-700">
                      <tr>
                        <th className="p-3">Type</th>
                        <th className="p-3">Description / Part</th>
                        <th className="p-3 text-center">Qty Needed</th>
                        <th className="p-3 text-center">Warehouse Stock</th>
                        <th className="p-3 text-right">Unit Rate (₹)</th>
                        <th className="p-3 text-right">Total (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {jobReqs.map(req => {
                        const item = req.itemId ? items.find(i => i.id === req.itemId) : null;
                        const isPart = !req.isServiceCharge;
                        const stockAvailable = item ? item.stockQuantity : null;
                        const isShort = isPart && item && item.stockQuantity < req.quantity;

                        return (
                          <tr key={req.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition">
                            <td className="p-3">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  req.isServiceCharge
                                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                                    : 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300'
                                }`}
                              >
                                {req.isServiceCharge ? 'Labor' : 'Hardware'}
                              </span>
                            </td>
                            <td className="p-3 font-semibold text-slate-900 dark:text-white">
                              {item ? item.name : req.customItemName}
                              {item && <span className="block text-[10px] text-slate-400 font-mono">SKU: {item.sku}</span>}
                            </td>
                            <td className="p-3 text-center font-bold">{req.quantity}</td>
                            <td className="p-3 text-center">
                              {stockAvailable !== null ? (
                                <span
                                  className={`px-2 py-0.5 rounded font-bold ${
                                    isShort
                                      ? 'bg-red-100 text-red-700'
                                      : 'bg-emerald-100 text-emerald-700'
                                  }`}
                                >
                                  {stockAvailable} in stock {isShort && '(Shortage!)'}
                                </span>
                              ) : (
                                <span className="text-slate-400">N/A (Labor)</span>
                              )}
                            </td>
                            <td className="p-3 text-right font-medium">₹{req.rate.toLocaleString('en-IN')}</td>
                            <td className="p-3 text-right font-bold text-slate-900 dark:text-white">
                              ₹{(req.rate * req.quantity).toLocaleString('en-IN')}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Purchase Orders linked to this job */}
              {jobPOs.length > 0 && (
                <div className="mt-4 p-4 bg-orange-50/70 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-bold text-orange-900 dark:text-orange-200 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-orange-600" /> Linked Purchase Orders in Transit
                    </h5>
                    <span className="text-[10px] font-semibold text-orange-700">{jobPOs.length} POs Active</span>
                  </div>
                  <div className="space-y-1.5">
                    {jobPOs.map(po => {
                      const item = items.find(i => i.id === po.itemId);
                      return (
                        <div
                          key={po.id}
                          className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-900 rounded-xl text-xs border border-orange-100 dark:border-slate-800"
                        >
                          <div>
                            <span className="font-mono font-bold text-blue-600">{po.poNumber}</span>
                            <span className="text-slate-600 dark:text-slate-300 ml-2">
                              {item?.name} (Qty: {po.quantity})
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] text-slate-500">
                              ETA: {po.expectedDeliveryDate} ({po.expectedDurationDays}d lead)
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                po.status === 'RECEIVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {po.status}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'FINANCIALS' && (
            <div className="space-y-6">
              {/* Quotation & Invoice overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Quotation Box */}
                <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-purple-500" /> Formal Sales / Service Quotation
                    </h4>
                    {quote && (
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          quote.isApproved ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {quote.isApproved ? 'Approved by Client' : 'Pending Approval'}
                      </span>
                    )}
                  </div>

                  {quote ? (
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                        <span className="text-slate-500">Quote Number:</span>
                        <span className="font-mono font-bold text-blue-600">{quote.quotationNumber}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                        <span className="text-slate-500">Subtotal:</span>
                        <span>₹{quote.subtotal.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                        <span className="text-slate-500">GST / Tax (18%):</span>
                        <span>₹{quote.tax.toLocaleString('en-IN')}</span>
                      </div>
                      {quote.discount > 0 && (
                        <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700 text-emerald-600 font-semibold">
                          <span>Discount Applied:</span>
                          <span>- ₹{quote.discount.toLocaleString('en-IN')}</span>
                        </div>
                      )}
                      <div className="flex justify-between py-2 text-sm font-bold text-slate-900 dark:text-white">
                        <span>Total Quotation:</span>
                        <span>₹{quote.total.toLocaleString('en-IN')}</span>
                      </div>

                      <div className="pt-2 flex gap-2">
                        <button
                          onClick={() => onOpenPrintDoc('QUOTATION', quote.id)}
                          className="flex-1 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded-xl font-bold flex items-center justify-center gap-1.5"
                        >
                          <Printer className="w-3.5 h-3.5 text-purple-600" />
                          View Document
                        </button>
                        {!quote.isApproved && (
                          <button
                            onClick={() => approveQuotation(quote.id)}
                            className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center justify-center gap-1.5"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Approve
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-slate-400 text-xs">
                      Quotation not drafted yet. Verify stock and complete requirements logging.
                    </div>
                  )}
                </div>

                {/* Invoice Box */}
                <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <DollarSign className="w-4 h-4 text-emerald-500" /> Official Tax Invoice
                    </h4>
                    {invoice && (
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          invoice.status === 'PAID'
                            ? 'bg-emerald-100 text-emerald-700'
                            : invoice.status === 'PARTIALLY_PAID'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {invoice.status}
                      </span>
                    )}
                  </div>

                  {invoice ? (
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                        <span className="text-slate-500">Invoice Number:</span>
                        <span className="font-mono font-bold text-blue-600">{invoice.invoiceNumber}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                        <span className="text-slate-500">Issued Date:</span>
                        <span>{invoice.issuedDate}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                        <span className="text-slate-500">Due Date:</span>
                        <span>{invoice.dueDate}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700 font-bold">
                        <span>Invoice Amount:</span>
                        <span>₹{invoice.totalAmount.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700 text-emerald-600 font-semibold">
                        <span>Total Paid:</span>
                        <span>₹{totalPaid.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between py-2 text-sm font-bold text-rose-600">
                        <span>Balance Due:</span>
                        <span>₹{invoiceBalance.toLocaleString('en-IN')}</span>
                      </div>

                      <div className="pt-2 flex gap-2">
                        <button
                          onClick={() => onOpenPrintDoc('INVOICE', invoice.id)}
                          className="flex-1 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded-xl font-bold flex items-center justify-center gap-1.5"
                        >
                          <Printer className="w-3.5 h-3.5 text-blue-600" />
                          View Tax Invoice
                        </button>
                        {invoiceBalance > 0 && (
                          <button
                            onClick={() => {
                              setPaymentAmount(invoiceBalance);
                              setPaymentModalOpen(true);
                            }}
                            className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center justify-center gap-1.5"
                          >
                            <DollarSign className="w-3.5 h-3.5" />
                            Collect Payment
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-slate-400 text-xs">
                      Invoice will be generated once customer approves quotation.
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Transactions Table */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Payment History & Receipts ({jobPayments.length})
                </h4>

                {jobPayments.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No payments recorded against this job yet.</p>
                ) : (
                  <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 text-[10px] uppercase font-bold">
                        <tr>
                          <th className="p-3">Date</th>
                          <th className="p-3">Mode</th>
                          <th className="p-3">Reference #</th>
                          <th className="p-3">Notes</th>
                          <th className="p-3 text-right">Amount (₹)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                        {jobPayments.map(pay => (
                          <tr key={pay.id}>
                            <td className="p-3">{new Date(pay.paidAt).toLocaleDateString()}</td>
                            <td className="p-3 font-bold text-blue-600">{pay.paymentMode}</td>
                            <td className="p-3 font-mono text-[11px]">{pay.transactionReference}</td>
                            <td className="p-3 text-slate-500">{pay.notes || '-'}</td>
                            <td className="p-3 text-right font-bold text-emerald-600">
                              ₹{pay.amount.toLocaleString('en-IN')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'AUDIT' && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Complete Job Card Transition Log (Audit Trail)
              </h4>
              <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                {jobTransitions.map(t => (
                  <div key={t.id} className="relative text-xs">
                    <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-white dark:ring-slate-900"></div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {t.toStatus}
                      </span>
                      {t.fromStatus && (
                        <span className="text-[11px] text-slate-400">
                          (from {t.fromStatus})
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400">• {new Date(t.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 mt-0.5">{t.reason}</p>
                    <div className="text-[10px] text-slate-400 mt-0.5">Changed by: {t.changedByName}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Engineer Assignment Modal */}
      {assignModalOpen && (
        <div className="fixed inset-0 z-60 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 w-full max-w-md border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <h3 className="font-bold text-sm">Assign Field Engineer</h3>
            <p className="text-xs text-slate-500">
              Select a certified service technician for {job.jobNumber}
            </p>

            <div className="space-y-2">
              {users
                .filter(u => u.role === 'ENGINEER')
                .map(eng => (
                  <div
                    key={eng.id}
                    onClick={() => setSelectedEngineerId(eng.id)}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                      selectedEngineerId === eng.id
                        ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/40'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <img src={eng.avatar} alt={eng.name} className="w-8 h-8 rounded-full object-cover" />
                      <div>
                        <div className="text-xs font-bold">{eng.name}</div>
                        <div className="text-[10px] text-slate-500">{eng.specialty}</div>
                      </div>
                    </div>
                    {selectedEngineerId === eng.id && <Check className="w-4 h-4 text-blue-600" />}
                  </div>
                ))}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setAssignModalOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                disabled={!selectedEngineerId}
                onClick={() => {
                  assignEngineer(job.id, selectedEngineerId);
                  setAssignModalOpen(false);
                }}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold disabled:opacity-50"
              >
                Confirm Assignment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {paymentModalOpen && invoice && (
        <div className="fixed inset-0 z-60 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 w-full max-w-md border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <h3 className="font-bold text-sm">Record Customer Payment</h3>
            <p className="text-xs text-slate-500">
              Invoice #{invoice.invoiceNumber} • Balance Due: ₹{invoiceBalance.toLocaleString('en-IN')}
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-1">Payment Amount (₹)</label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={e => setPaymentAmount(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-1">Payment Method</label>
                <select
                  value={paymentMode}
                  onChange={e => setPaymentMode(e.target.value as PaymentMode)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs font-semibold"
                >
                  <option value="UPI">UPI (Google Pay / PhonePe / Paytm)</option>
                  <option value="BANK_TRANSFER">Bank Wire Transfer (NEFT / RTGS / IMPS)</option>
                  <option value="CASH">Cash Payment</option>
                  <option value="CHEQUE">Company Cheque / DD</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                  Transaction / Cheque Reference #
                </label>
                <input
                  type="text"
                  value={transactionRef}
                  onChange={e => setTransactionRef(e.target.value)}
                  placeholder="e.g. UPI-TXN-902183 or CHQ-001293"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-1">Receipt Notes</label>
                <input
                  type="text"
                  value={paymentNotes}
                  onChange={e => setPaymentNotes(e.target.value)}
                  placeholder="Optional internal remarks"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setPaymentModalOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                disabled={paymentAmount <= 0}
                onClick={() => {
                  recordPayment(
                    invoice.id,
                    paymentAmount,
                    paymentMode,
                    transactionRef || `TXN-${Date.now().toString().slice(-6)}`,
                    paymentNotes
                  );
                  setPaymentModalOpen(false);
                }}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold disabled:opacity-50"
              >
                Record Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
