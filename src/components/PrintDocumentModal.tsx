import React from 'react';
import { useApp } from '../context/AppContext';
import { Printer, X, Download, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface PrintDocumentModalProps {
  type: 'QUOTATION' | 'INVOICE';
  docId: string;
  onClose: () => void;
}

export const PrintDocumentModal: React.FC<PrintDocumentModalProps> = ({ type, docId, onClose }) => {
  const { quotations, invoices, jobCards, customers, items, requirements, payments } = useApp();

  let targetJobId = '';
  let docNumber = '';
  let docDate = '';
  let dueDate = '';
  let subtotal = 0;
  let tax = 0;
  let discount = 0;
  let total = 0;
  let isApprovedOrPaid = false;
  let notes = '';

  if (type === 'QUOTATION') {
    const q = quotations.find(item => item.id === docId);
    if (!q) return null;
    targetJobId = q.jobCardId;
    docNumber = q.quotationNumber;
    docDate = new Date(q.createdAt).toLocaleDateString('en-IN');
    subtotal = q.subtotal;
    tax = q.tax;
    discount = q.discount;
    total = q.total;
    isApprovedOrPaid = q.isApproved;
    notes = q.notes || 'Valid for 30 days from issuance date.';
  } else {
    const inv = invoices.find(item => item.id === docId);
    if (!inv) return null;
    targetJobId = inv.jobCardId;
    docNumber = inv.invoiceNumber;
    docDate = inv.issuedDate;
    dueDate = inv.dueDate;
    total = inv.totalAmount;
    isApprovedOrPaid = inv.status === 'PAID';

    // Find linked quote for line breakdown
    const q = quotations.find(item => item.id === inv.quotationId);
    if (q) {
      subtotal = q.subtotal;
      tax = q.tax;
      discount = q.discount;
      notes = q.notes || 'Goods once sold will not be taken back without authorization.';
    } else {
      subtotal = Math.round(total / 1.18);
      tax = total - subtotal;
    }
  }

  const job = jobCards.find(j => j.id === targetJobId);
  const customer = job ? customers.find(c => c.id === job.customerId) : null;
  const lineItems = job ? requirements.filter(r => r.jobCardId === job.id) : [];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-70 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh]">
        {/* Modal Top Control Bar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/80 print:hidden">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-slate-800 dark:text-slate-200">
              {type === 'QUOTATION' ? 'Commercial Quotation Document' : 'Official Tax Invoice'}
            </span>
            <span className="font-mono text-xs text-blue-600 dark:text-blue-400 font-bold">
              #{docNumber}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE PAPER DOCUMENT */}
        <div className="p-8 sm:p-12 overflow-y-auto bg-white text-slate-900 font-sans print:p-0 print:m-0">
          {/* Document Header */}
          <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 bg-blue-700 text-white rounded-xl flex items-center justify-center font-black text-lg">
                  S
                </div>
                <div>
                  <h1 className="text-xl font-black tracking-tight text-slate-900">SMAART</h1>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Industrial Systems & Field Engineering
                  </p>
                </div>
              </div>

              <div className="text-xs text-slate-500 mt-3 space-y-0.5 leading-relaxed">
                <div>Plot 104, Tech Park Zone II, Whitefield</div>
                <div>Bengaluru, Karnataka 560066, India</div>
                <div>GSTIN: 29AABCS8891M1Z2 | support@smaart.io</div>
              </div>
            </div>

            <div className="text-right">
              <h2 className="text-2xl font-black tracking-tight text-slate-900">
                {type === 'QUOTATION' ? 'PROFORMA QUOTATION' : 'TAX INVOICE'}
              </h2>
              <div className="mt-2 space-y-1 text-xs">
                <div>
                  <span className="text-slate-400">{type === 'QUOTATION' ? 'Quote Ref:' : 'Invoice No:'} </span>
                  <span className="font-mono font-bold text-slate-900">{docNumber}</span>
                </div>
                <div>
                  <span className="text-slate-400">Date: </span>
                  <span className="font-semibold">{docDate}</span>
                </div>
                {dueDate && (
                  <div>
                    <span className="text-slate-400">Due Date: </span>
                    <span className="font-semibold text-rose-600">{dueDate}</span>
                  </div>
                )}
                {job && (
                  <div>
                    <span className="text-slate-400">Job Card: </span>
                    <span className="font-mono font-semibold">{job.jobNumber}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Customer Billing & Shipping Info */}
          <div className="grid grid-cols-2 gap-8 mb-6 text-xs">
            <div>
              <h3 className="font-bold uppercase tracking-wider text-slate-400 text-[10px] mb-2">Billed To</h3>
              <div className="font-bold text-sm text-slate-900">{customer?.companyName || customer?.name}</div>
              <div className="text-slate-600 mt-1 font-medium">{customer?.name}</div>
              <div className="text-slate-500 mt-1 leading-relaxed">{customer?.billingAddress}</div>
              <div className="text-slate-500 mt-1">
                Phone: {customer?.phone} | Email: {customer?.email}
              </div>
            </div>

            <div>
              <h3 className="font-bold uppercase tracking-wider text-slate-400 text-[10px] mb-2">Site / Shipping</h3>
              <div className="text-slate-600 leading-relaxed font-medium">
                {customer?.shippingAddress || customer?.billingAddress}
              </div>
              <div className="mt-3 p-2 bg-slate-50 rounded-lg border border-slate-200">
                <span className="font-semibold text-[11px] block">Job Scope:</span>
                <span className="text-slate-600 text-[11px] line-clamp-2">
                  {job?.notes || 'Comprehensive sales/service fulfillment order.'}
                </span>
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="border border-slate-300 rounded-xl overflow-hidden mb-6">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-700 uppercase text-[10px] font-bold border-b border-slate-300">
                <tr>
                  <th className="p-3 w-10 text-center">#</th>
                  <th className="p-3">Description / Part Details</th>
                  <th className="p-3 text-center">Type</th>
                  <th className="p-3 text-center">Qty</th>
                  <th className="p-3 text-right">Unit Rate (₹)</th>
                  <th className="p-3 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {lineItems.map((item, idx) => {
                  const invItem = item.itemId ? items.find(i => i.id === item.itemId) : null;
                  const title = invItem ? invItem.name : item.customItemName;

                  return (
                    <tr key={item.id}>
                      <td className="p-3 text-center text-slate-400">{idx + 1}</td>
                      <td className="p-3">
                        <div className="font-bold text-slate-900">{title}</div>
                        {invItem && <div className="text-[10px] font-mono text-slate-400">SKU: {invItem.sku}</div>}
                      </td>
                      <td className="p-3 text-center">
                        <span className="text-[10px] font-semibold text-slate-600">
                          {item.isServiceCharge ? 'Labor' : 'Goods'}
                        </span>
                      </td>
                      <td className="p-3 text-center font-bold">{item.quantity}</td>
                      <td className="p-3 text-right">₹{item.rate.toLocaleString('en-IN')}</td>
                      <td className="p-3 text-right font-bold">
                        ₹{(item.rate * item.quantity).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Financial Summary & Bank Information */}
          <div className="grid grid-cols-2 gap-8 mb-8 text-xs">
            <div>
              <h4 className="font-bold text-[11px] uppercase text-slate-400 mb-2">Remittance Instructions</h4>
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-[11px]">
                <div><span className="font-semibold text-slate-600">Bank:</span> HDFC Bank Ltd</div>
                <div><span className="font-semibold text-slate-600">A/C Name:</span> SMAART Operations Suite Pvt Ltd</div>
                <div><span className="font-semibold text-slate-600">A/C Number:</span> 50200088991201</div>
                <div><span className="font-semibold text-slate-600">IFSC Code:</span> HDFC0001042</div>
                <div><span className="font-semibold text-slate-600">UPI VPA:</span> smaartops@hdfcbank</div>
              </div>

              <div className="mt-3 text-[11px] text-slate-500 italic">
                Terms: {notes}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Subtotal</span>
                <span className="font-medium">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">IGST / GST (18%)</span>
                <span className="font-medium">₹{tax.toLocaleString('en-IN')}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between py-1 border-b border-slate-200 text-emerald-600">
                  <span>Authorized Discount</span>
                  <span>- ₹{discount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between py-2 text-base font-black border-b-2 border-slate-900 text-slate-900">
                <span>Grand Total (INR)</span>
                <span>₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Signatures & Footer */}
          <div className="grid grid-cols-2 gap-12 pt-8 border-t border-slate-200 text-xs">
            <div>
              <div className="text-slate-400 text-[10px] uppercase font-bold mb-10">Client Acceptance Sign-Off</div>
              <div className="border-t border-dashed border-slate-400 pt-1 text-slate-500">
                Authorized Signatory & Date
              </div>
            </div>

            <div className="text-right">
              <div className="text-slate-400 text-[10px] uppercase font-bold mb-10">For SMAART Systems Ltd</div>
              <div className="border-t border-dashed border-slate-400 pt-1 text-slate-500">
                Authorized Digital Signature
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
