import React from 'react';
import { useApp } from '../context/AppContext';
import {
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Package,
  DollarSign,
  Activity,
  Layers,
  Award,
} from 'lucide-react';

export const AnalyticsDashboard: React.FC = () => {
  const { jobCards, quotations, invoices, payments, items } = useApp();

  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);

  const salesJobs = jobCards.filter(j => j.type === 'SALES');
  const serviceJobs = jobCards.filter(j => j.type === 'SERVICE');

  const closedJobs = jobCards.filter(j => j.status === 'CLOSED');
  const inProgressJobs = jobCards.filter(j => j.status !== 'CLOSED' && j.status !== 'CANCELLED');

  const outOfStockItems = items.filter(i => i.stockQuantity === 0);
  const lowStockItems = items.filter(i => i.stockQuantity > 0 && i.stockQuantity <= i.reorderLevel);

  // Status breakdown
  const statusCounts: Record<string, number> = {};
  jobCards.forEach(j => {
    statusCounts[j.status] = (statusCounts[j.status] || 0) + 1;
  });

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Revenue Realized</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            ₹{totalRevenue.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Invoiced Volume: ₹{totalInvoiced.toLocaleString('en-IN')}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Active Pipeline</span>
            <Activity className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400">
            {inProgressJobs.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {salesJobs.length} Sales • {serviceJobs.length} Field Service
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Turnaround SLA Fulfillment</span>
            <Clock className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-400">
            94.2%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Avg 2.4 days to customer quotation</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Warehouse Stock Health</span>
            <Package className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600">
            {outOfStockItems.length > 0 ? `${outOfStockItems.length} OOS` : 'Optimal'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {lowStockItems.length} SKUs below reorder threshold
          </div>
        </div>
      </div>

      {/* Workflow Stage Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-500" />
              Job Cards by State Machine Stage
            </h3>
            <span className="text-[11px] font-semibold text-slate-400">{jobCards.length} total tickets</span>
          </div>

          <div className="space-y-2.5">
            {Object.entries(statusCounts).map(([status, count]) => {
              const pct = Math.round((count / jobCards.length) * 100);
              return (
                <div key={status} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-700 dark:text-slate-300">{status}</span>
                    <span className="text-slate-500">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        status === 'CLOSED'
                          ? 'bg-slate-400'
                          : status === 'PAID'
                          ? 'bg-emerald-500'
                          : status === 'PURCHASE_PENDING'
                          ? 'bg-orange-500'
                          : status === 'QUOTATION_DRAFTED'
                          ? 'bg-purple-500'
                          : 'bg-blue-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sales vs Service Performance */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <Award className="w-4 h-4 text-purple-500" />
            Workflow Stream Comparison
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-800 dark:text-purple-300">Sales Flow</span>
                <span className="text-xs font-mono font-bold">{salesJobs.length} Cards</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Direct stock verification branch with automatic supplier purchase orders on stock out.
              </p>
              <div className="pt-2 text-xs font-semibold text-purple-900 dark:text-purple-200">
                Completed: {salesJobs.filter(j => j.status === 'CLOSED').length}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-800 dark:text-blue-300">Service Flow</span>
                <span className="text-xs font-mono font-bold">{serviceJobs.length} Cards</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Engineer mobile inspection, parts vs labor toggle, on-site diagnostics & signature capture.
              </p>
              <div className="pt-2 text-xs font-semibold text-blue-900 dark:text-blue-200">
                Completed: {serviceJobs.filter(j => j.status === 'CLOSED').length}
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs space-y-1">
            <div className="font-bold text-slate-700 dark:text-slate-300">Lead Time vs Turnaround Observation:</div>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Procurement lead times currently average 5.6 days for precision optical lasers and hydraulic valves.
              Orders with catalog items in stock transition to Quotation within 15 minutes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
