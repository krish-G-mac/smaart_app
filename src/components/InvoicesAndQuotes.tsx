import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  FileText,
  DollarSign,
  Printer,
  CheckCircle2,
  Clock,
  ExternalLink,
  CreditCard,
  Building,
  Check,
} from 'lucide-react';
import { PaymentMode } from '../types';

interface InvoicesAndQuotesProps {
  onOpenPrintDoc: (type: 'QUOTATION' | 'INVOICE', id: string) => void;
}

export const InvoicesAndQuotes: React.FC<InvoicesAndQuotesProps> = ({ onOpenPrintDoc }) => {
  const {
    quotations,
    invoices,
    payments,
    jobCards,
    customers,
    approveQuotation,
    generateInvoice,
    recordPayment,
    setSelectedJobCardId,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'QUOTES' | 'INVOICES' | 'PAYMENTS'>('QUOTES');

  // Quick Payment state
  const [quickPayInvoiceId, setQuickPayInvoiceId] = useState<string | null>(null);
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMode, setPayMode] = useState<PaymentMode>('UPI');
  const [payRef, setPayRef] = useState('');

  const targetInvoice = invoices.find(i => i.id === quickPayInvoiceId);

  return (
    <div className="space-y-4">
      {/* Navigation Sub-Tabs */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-semibold">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveSubTab('QUOTES')}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-2 ${
              activeSubTab === 'QUOTES'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Quotations ({quotations.length})
          </button>
          <button
            onClick={() => setActiveSubTab('INVOICES')}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-2 ${
              activeSubTab === 'INVOICES'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            Tax Invoices ({invoices.length})
          </button>
          <button
            onClick={() => setActiveSubTab('PAYMENTS')}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-2 ${
              activeSubTab === 'PAYMENTS'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            Payment Ledger ({payments.length})
          </button>
        </div>
      </div>

      {/* QUOTATIONS VIEW */}
      {activeSubTab === 'QUOTES' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-3.5">Quote #</th>
                <th className="p-3.5">Job Card</th>
                <th className="p-3.5">Customer</th>
                <th className="p-3.5 text-right">Subtotal</th>
                <th className="p-3.5 text-right">GST (18%)</th>
                <th className="p-3.5 text-right">Total Quote</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {quotations.map(quote => {
                const job = jobCards.find(j => j.id === quote.jobCardId);
                const cust = job ? customers.find(c => c.id === job.customerId) : null;
                const hasInvoice = invoices.some(inv => inv.quotationId === quote.id);

                return (
                  <tr key={quote.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition">
                    <td className="p-3.5 font-mono font-bold text-blue-600 dark:text-blue-400">
                      {quote.quotationNumber}
                    </td>
                    <td className="p-3.5">
                      {job && (
                        <button
                          onClick={() => setSelectedJobCardId(job.id)}
                          className="font-mono text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1"
                        >
                          {job.jobNumber}
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      )}
                    </td>
                    <td className="p-3.5 font-semibold text-slate-900 dark:text-white">
                      {cust?.companyName || cust?.name || 'Customer'}
                    </td>
                    <td className="p-3.5 text-right font-medium">₹{quote.subtotal.toLocaleString('en-IN')}</td>
                    <td className="p-3.5 text-right font-medium text-slate-500">
                      ₹{quote.tax.toLocaleString('en-IN')}
                    </td>
                    <td className="p-3.5 text-right font-bold text-slate-900 dark:text-white">
                      ₹{quote.total.toLocaleString('en-IN')}
                    </td>
                    <td className="p-3.5 text-center">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          quote.isApproved
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                        }`}
                      >
                        {quote.isApproved ? 'Approved' : 'Pending Approval'}
                      </span>
                    </td>
                    <td className="p-3.5 text-right space-x-2">
                      <button
                        onClick={() => onOpenPrintDoc('QUOTATION', quote.id)}
                        className="px-2.5 py-1 text-slate-600 hover:text-slate-900 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg font-semibold inline-flex items-center gap-1"
                      >
                        <Printer className="w-3.5 h-3.5 text-purple-600" /> View
                      </button>
                      {!quote.isApproved ? (
                        <button
                          onClick={() => approveQuotation(quote.id)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold inline-flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" /> Approve
                        </button>
                      ) : !hasInvoice ? (
                        <button
                          onClick={() => generateInvoice(quote.id)}
                          className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold inline-flex items-center gap-1"
                        >
                          Generate Invoice
                        </button>
                      ) : (
                        <span className="text-blue-600 font-semibold text-[11px]">Invoiced</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* INVOICES VIEW */}
      {activeSubTab === 'INVOICES' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-3.5">Invoice #</th>
                <th className="p-3.5">Job Card</th>
                <th className="p-3.5">Customer</th>
                <th className="p-3.5">Issued / Due Date</th>
                <th className="p-3.5 text-right">Invoice Amount</th>
                <th className="p-3.5 text-right">Paid So Far</th>
                <th className="p-3.5 text-center">Payment Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {invoices.map(inv => {
                const job = jobCards.find(j => j.id === inv.jobCardId);
                const cust = job ? customers.find(c => c.id === job.customerId) : null;
                const invPayments = payments.filter(p => p.invoiceId === inv.id);
                const totalPaid = invPayments.reduce((s, p) => s + p.amount, 0);
                const balance = Math.max(0, inv.totalAmount - totalPaid);

                return (
                  <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition">
                    <td className="p-3.5 font-mono font-bold text-blue-600 dark:text-blue-400">
                      {inv.invoiceNumber}
                    </td>
                    <td className="p-3.5">
                      {job && (
                        <button
                          onClick={() => setSelectedJobCardId(job.id)}
                          className="font-mono text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1"
                        >
                          {job.jobNumber}
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      )}
                    </td>
                    <td className="p-3.5 font-semibold text-slate-900 dark:text-white">
                      {cust?.companyName || cust?.name || 'Customer'}
                    </td>
                    <td className="p-3.5">
                      <div>{inv.issuedDate}</div>
                      <div className="text-[10px] text-slate-400">Due: {inv.dueDate}</div>
                    </td>
                    <td className="p-3.5 text-right font-bold text-slate-900 dark:text-white">
                      ₹{inv.totalAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="p-3.5 text-right font-medium text-emerald-600">
                      ₹{totalPaid.toLocaleString('en-IN')}
                    </td>
                    <td className="p-3.5 text-center">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          inv.status === 'PAID'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : inv.status === 'PARTIALLY_PAID'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right space-x-2">
                      <button
                        onClick={() => onOpenPrintDoc('INVOICE', inv.id)}
                        className="px-2.5 py-1 text-slate-600 hover:text-slate-900 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg font-semibold inline-flex items-center gap-1"
                      >
                        <Printer className="w-3.5 h-3.5 text-blue-600" /> Print
                      </button>
                      {balance > 0 && (
                        <button
                          onClick={() => {
                            setQuickPayInvoiceId(inv.id);
                            setPayAmount(balance);
                          }}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold inline-flex items-center gap-1"
                        >
                          <DollarSign className="w-3.5 h-3.5" /> Settle
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* PAYMENTS LEDGER VIEW */}
      {activeSubTab === 'PAYMENTS' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-3.5">Payment Date</th>
                <th className="p-3.5">Invoice Ref</th>
                <th className="p-3.5">Payment Mode</th>
                <th className="p-3.5">Txn Reference #</th>
                <th className="p-3.5">Notes</th>
                <th className="p-3.5 text-right">Amount Received</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {payments.map(pay => {
                const inv = invoices.find(i => i.id === pay.invoiceId);
                return (
                  <tr key={pay.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition">
                    <td className="p-3.5 font-medium">{new Date(pay.paidAt).toLocaleDateString()}</td>
                    <td className="p-3.5 font-mono text-blue-600 font-semibold">{inv?.invoiceNumber}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-bold text-[10px]">
                        {pay.paymentMode}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-slate-600 dark:text-slate-300">
                      {pay.transactionReference}
                    </td>
                    <td className="p-3.5 text-slate-500">{pay.notes || '-'}</td>
                    <td className="p-3.5 text-right font-black text-emerald-600 text-sm">
                      ₹{pay.amount.toLocaleString('en-IN')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Quick Settle Modal */}
      {targetInvoice && (
        <div className="fixed inset-0 z-60 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 w-full max-w-sm border border-slate-200 dark:border-slate-800 shadow-xl space-y-3 text-xs">
            <h3 className="font-bold text-sm">Record Payment for {targetInvoice.invoiceNumber}</h3>

            <div>
              <label className="text-[10px] font-semibold text-slate-500 block mb-1">Amount (₹)</label>
              <input
                type="number"
                value={payAmount}
                onChange={e => setPayAmount(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2 font-bold"
              />
            </div>

            <div>
              <label className="text-[10px] font-semibold text-slate-500 block mb-1">Payment Mode</label>
              <select
                value={payMode}
                onChange={e => setPayMode(e.target.value as PaymentMode)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2 font-semibold"
              >
                <option value="UPI">UPI</option>
                <option value="BANK_TRANSFER">Bank Transfer (NEFT/RTGS)</option>
                <option value="CASH">Cash</option>
                <option value="CHEQUE">Cheque</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-semibold text-slate-500 block mb-1">Reference #</label>
              <input
                type="text"
                value={payRef}
                onChange={e => setPayRef(e.target.value)}
                placeholder="e.g. TXN-789021"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setQuickPayInvoiceId(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  recordPayment(
                    targetInvoice.id,
                    payAmount,
                    payMode,
                    payRef || `TXN-${Date.now().toString().slice(-6)}`
                  );
                  setQuickPayInvoiceId(null);
                }}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold"
              >
                Save Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
