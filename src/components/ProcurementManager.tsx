import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Clock,
  CheckCircle2,
  Package,
  Truck,
  Building,
  Calendar,
  AlertCircle,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

export const ProcurementManager: React.FC = () => {
  const { purchaseOrders, items, jobCards, receivePurchaseOrder, setSelectedJobCardId } = useApp();
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const filteredPOs = purchaseOrders.filter(po => {
    if (filterStatus === 'ALL') return true;
    return po.status === filterStatus;
  });

  const pendingCount = purchaseOrders.filter(p => p.status === 'ORDERED' || p.status === 'PENDING').length;

  return (
    <div className="space-y-4">
      {/* Top Summary Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Active Purchase Orders
          </span>
          <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">{purchaseOrders.length}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            In Transit / Pending Arrival
          </span>
          <div className="text-xl font-bold text-orange-600 mt-1 flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            {pendingCount}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Goods Received & Restocked
          </span>
          <div className="text-xl font-bold text-emerald-600 mt-1 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            {purchaseOrders.filter(p => p.status === 'RECEIVED').length}
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs">
        <div className="flex items-center gap-1">
          {['ALL', 'ORDERED', 'PENDING', 'RECEIVED'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-xl font-semibold transition ${
                filterStatus === status
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
        <span className="text-slate-400 text-[11px]">{filteredPOs.length} PO records</span>
      </div>

      {/* Purchase Orders Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="p-3.5">PO Number</th>
              <th className="p-3.5">Part / SKU</th>
              <th className="p-3.5">Supplier Name</th>
              <th className="p-3.5 text-center">Ordered Qty</th>
              <th className="p-3.5 text-center">Lead Time / ETA</th>
              <th className="p-3.5">Linked Job Card</th>
              <th className="p-3.5 text-center">Status</th>
              <th className="p-3.5 text-right">Warehouse Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {filteredPOs.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-slate-400 italic">
                  No Purchase Orders found for this filter.
                </td>
              </tr>
            ) : (
              filteredPOs.map(po => {
                const item = items.find(i => i.id === po.itemId);
                const linkedJob = po.jobCardId ? jobCards.find(j => j.id === po.jobCardId) : null;
                const isReceived = po.status === 'RECEIVED';

                return (
                  <tr key={po.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition">
                    <td className="p-3.5 font-mono font-bold text-blue-600 dark:text-blue-400">
                      {po.poNumber}
                    </td>
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900 dark:text-white">{item?.name || 'Item'}</div>
                      <div className="text-[10px] text-slate-400 font-mono">SKU: {item?.sku}</div>
                    </td>
                    <td className="p-3.5 font-medium text-slate-700 dark:text-slate-300">
                      {po.supplierName}
                    </td>
                    <td className="p-3.5 text-center font-bold text-sm">{po.quantity}</td>
                    <td className="p-3.5 text-center">
                      <div className="font-semibold">{po.expectedDeliveryDate}</div>
                      <div className="text-[10px] text-slate-400">{po.expectedDurationDays} days duration</div>
                    </td>
                    <td className="p-3.5">
                      {linkedJob ? (
                        <button
                          onClick={() => setSelectedJobCardId(linkedJob.id)}
                          className="flex items-center gap-1 font-mono text-indigo-600 hover:underline font-semibold"
                        >
                          {linkedJob.jobNumber}
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      ) : (
                        <span className="text-slate-400">General Restock</span>
                      )}
                    </td>
                    <td className="p-3.5 text-center">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          isReceived
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                        }`}
                      >
                        {po.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      {!isReceived ? (
                        <button
                          onClick={() => receivePurchaseOrder(po.id)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition inline-flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Receive Goods & Increment Stock
                        </button>
                      ) : (
                        <span className="text-emerald-600 text-xs font-semibold flex items-center justify-end gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Stocked ({po.receivedDate})
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
