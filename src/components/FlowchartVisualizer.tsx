import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { JobCard, JobStatus } from '../types';
import {
  CheckCircle2,
  Clock,
  ArrowDown,
  ArrowRight,
  ShieldCheck,
  Smartphone,
  Package,
  FileText,
  DollarSign,
  Truck,
  AlertTriangle,
  Info,
  Maximize2,
  Minimize2,
} from 'lucide-react';

interface FlowNode {
  id: string;
  label: string;
  role: string;
  description: string;
  branch?: 'sales' | 'service' | 'common';
  mappedStatuses: JobStatus[];
}

export const FlowchartVisualizer: React.FC<{ isExpandedDefault?: boolean }> = ({ isExpandedDefault = false }) => {
  const { jobCards, selectedJobCardId, setSelectedJobCardId } = useApp();
  const [isExpanded, setIsExpanded] = useState(isExpandedDefault);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  const selectedJob = jobCards.find(j => j.id === selectedJobCardId);

  // Helper to determine if a node is currently active for selected job
  const isNodeActive = (statuses: JobStatus[], branch?: 'sales' | 'service' | 'common') => {
    if (!selectedJob) return false;
    if (branch === 'sales' && selectedJob.type !== 'SALES') return false;
    if (branch === 'service' && selectedJob.type !== 'SERVICE') return false;
    return statuses.includes(selectedJob.status);
  };

  // Helper to determine if node was passed in timeline
  const isNodeCompleted = (statuses: JobStatus[]) => {
    if (!selectedJob) return false;
    const order: JobStatus[] = [
      'REQUESTED',
      'ENGINEER_ASSIGNED',
      'REQUIREMENTS_LOGGED',
      'STOCK_CHECK_PENDING',
      'PURCHASE_PENDING',
      'QUOTATION_DRAFTED',
      'QUOTATION_APPROVED',
      'INVOICED',
      'DELIVERED',
      'PAID',
      'CLOSED',
    ];
    const currentIndex = order.indexOf(selectedJob.status);
    const nodeMaxIndex = Math.max(...statuses.map(s => order.indexOf(s)));
    return currentIndex > nodeMaxIndex && currentIndex !== -1 && nodeMaxIndex !== -1;
  };

  const renderNode = (
    id: string,
    title: string,
    subtitle: string,
    icon: React.ReactNode,
    mappedStatuses: JobStatus[],
    branch?: 'sales' | 'service' | 'common',
    decisionLabel?: string
  ) => {
    const active = isNodeActive(mappedStatuses, branch);
    const completed = isNodeCompleted(mappedStatuses);

    let borderClass = 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200';
    let ringClass = '';

    if (active) {
      borderClass = 'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-100 shadow-md shadow-emerald-500/10 font-semibold';
      ringClass = 'ring-4 ring-emerald-500/20 ring-offset-1 animate-pulse';
    } else if (completed) {
      borderClass = 'border-blue-400 bg-blue-50/50 dark:bg-blue-950/20 text-slate-800 dark:text-slate-200';
    }

    return (
      <div
        className={`relative flex flex-col p-3 rounded-xl border text-xs transition-all duration-200 cursor-pointer ${borderClass} ${ringClass}`}
        onClick={() => setActiveTooltip(activeTooltip === id ? null : id)}
      >
        {decisionLabel && (
          <span className="absolute -top-2.5 left-3 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
            {decisionLabel}
          </span>
        )}

        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-1.5 font-bold">
            <span className="p-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {icon}
            </span>
            <span className="truncate">{title}</span>
          </div>
          {active && (
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          )}
          {completed && !active && (
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
          )}
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">{subtitle}</p>

        {activeTooltip === id && (
          <div className="absolute z-20 left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 p-3 bg-slate-900 text-white rounded-lg shadow-xl text-xs pointer-events-auto">
            <div className="font-bold border-b border-slate-700 pb-1 mb-1">{title}</div>
            <p className="text-[11px] text-slate-300 leading-normal">{subtitle}</p>
            <div className="mt-2 text-[10px] text-slate-400">
              Mapped Status: {mappedStatuses.join(', ')}
            </div>
            <div className="mt-1 flex justify-end">
              <span className="text-[10px] text-blue-400">Click node to close</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 transition-all shadow-sm">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-600 text-white rounded-lg shadow-sm">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              SMAART Architectural Flowchart & Live State Machine
              <span className="text-[11px] font-normal px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
                Interactive Guardrails
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Tracing logic: SALES stock checks & PO lead-time vs. SERVICE mobile inspection & engineer material logging
            </p>
          </div>
        </div>

        {/* Selected Job Card Picker */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-medium">Tracing Job:</span>
            <select
              value={selectedJobCardId || ''}
              onChange={e => setSelectedJobCardId(e.target.value || null)}
              className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {jobCards.map(j => (
                <option key={j.id} value={j.id}>
                  {j.jobNumber} ({j.type} - {j.status})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition"
            title={isExpanded ? 'Collapse Flowchart' : 'Expand Flowchart'}
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Selected Job Current Status Alert Banner */}
      {selectedJob && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 p-2.5 bg-slate-100 dark:bg-slate-800/80 rounded-xl text-xs border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700 dark:text-slate-300">Active Card:</span>
            <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{selectedJob.jobNumber}</span>
            <span
              className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                selectedJob.type === 'SALES'
                  ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300'
                  : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
              }`}
            >
              {selectedJob.type}
            </span>
            <span className="text-slate-400">•</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">Status: {selectedJob.status}</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
              Current Stage
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400 inline-block"></span>
              Completed
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-600 inline-block"></span>
              Pending
            </span>
          </div>
        </div>
      )}

      {/* Flowchart Layout */}
      <div className={`overflow-x-auto ${isExpanded ? 'max-h-none' : 'max-h-[380px]'} pr-2 transition-all`}>
        <div className="min-w-[780px] flex flex-col items-center gap-3 py-2">
          {/* 1. Auth & Entry */}
          <div className="w-72">
            {renderNode(
              'auth',
              'Authentication & RBAC',
              'Roles: Admin, Sales, Service Coordinator, Engineer',
              <ShieldCheck className="w-4 h-4 text-indigo-500" />,
              ['REQUESTED'],
              'common'
            )}
          </div>

          <ArrowDown className="w-4 h-4 text-slate-400 shrink-0" />

          {/* 2. Create Job Card */}
          <div className="w-72">
            {renderNode(
              'create_job',
              'Create Job Card',
              'Sales Rep or Coordinator initializes ticket with priority & customer',
              <FileText className="w-4 h-4 text-blue-500" />,
              ['REQUESTED'],
              'common'
            )}
          </div>

          <ArrowDown className="w-4 h-4 text-slate-400 shrink-0" />

          {/* Branch Fork: Sales vs Service */}
          <div className="w-full grid grid-cols-2 gap-6 relative">
            {/* Horizontal branch line */}
            <div className="absolute top-0 left-1/4 right-1/4 h-0.5 bg-slate-300 dark:bg-slate-700"></div>

            {/* LEFT: SALES BRANCH */}
            <div className="flex flex-col items-center gap-3 pt-2">
              <div className="w-full">
                {renderNode(
                  'sales_stock_check',
                  'Sales: Stock Check',
                  'System checks warehouse levels for requested items',
                  <Package className="w-4 h-4 text-purple-500" />,
                  ['REQUESTED', 'STOCK_CHECK_PENDING'],
                  'sales',
                  'Type: SALES'
                )}
              </div>

              {/* Sub-branch in sales: In Stock vs Out of Stock */}
              <div className="w-full grid grid-cols-2 gap-3 pt-1">
                <div>
                  {renderNode(
                    'sales_in_stock',
                    'In Stock Confirmed',
                    'Immediate reservation & quote generation',
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />,
                    ['QUOTATION_DRAFTED'],
                    'sales',
                    'In Stock'
                  )}
                </div>
                <div>
                  {renderNode(
                    'sales_out_of_stock',
                    'Create PO & Lead Time',
                    'Auto-trigger Purchase Order with supplier lead days',
                    <Clock className="w-3.5 h-3.5 text-amber-500" />,
                    ['PURCHASE_PENDING'],
                    'sales',
                    'Out of Stock'
                  )}
                </div>
              </div>

              <div className="w-full">
                {renderNode(
                  'sales_po_receive',
                  'Stock Updated (Goods Received)',
                  'PO marked as received -> Warehouse inventory auto-incremented',
                  <Package className="w-4 h-4 text-emerald-600" />,
                  ['QUOTATION_DRAFTED'],
                  'sales'
                )}
              </div>
            </div>

            {/* RIGHT: SERVICE BRANCH */}
            <div className="flex flex-col items-center gap-3 pt-2">
              <div className="w-full">
                {renderNode(
                  'service_assign_eng',
                  'Assign Field Engineer',
                  'Coordinator schedules qualified engineer to visit customer',
                  <ShieldCheck className="w-4 h-4 text-blue-500" />,
                  ['ENGINEER_ASSIGNED'],
                  'service',
                  'Type: SERVICE'
                )}
              </div>

              <div className="w-full">
                {renderNode(
                  'service_mobile_inspect',
                  'Mobile App Inspection',
                  'Engineer checks equipment, photos & diagnostics on site',
                  <Smartphone className="w-4 h-4 text-cyan-500" />,
                  ['ENGINEER_ASSIGNED', 'REQUIREMENTS_LOGGED'],
                  'service'
                )}
              </div>

              {/* Sub-branch in service: Parts Needed vs Service Only */}
              <div className="w-full grid grid-cols-2 gap-3 pt-1">
                <div>
                  {renderNode(
                    'service_parts_req',
                    'Log Material Req. & Stock Check',
                    'Catalog items picked + custom non-catalog parts',
                    <Package className="w-3.5 h-3.5 text-amber-500" />,
                    ['REQUIREMENTS_LOGGED', 'STOCK_CHECK_PENDING', 'PURCHASE_PENDING'],
                    'service',
                    'Parts Needed'
                  )}
                </div>
                <div>
                  {renderNode(
                    'service_labor_only',
                    'Service Only (Labor)',
                    'Standard labor checklist with no spare parts',
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />,
                    ['QUOTATION_DRAFTED'],
                    'service',
                    'Service Only'
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Merge line */}
          <div className="w-1/2 h-0.5 bg-slate-300 dark:bg-slate-700 my-1"></div>
          <ArrowDown className="w-4 h-4 text-slate-400 shrink-0" />

          {/* 3. COMMON DOWNSTREAM PIPELINE */}
          <div className="w-full max-w-xl grid grid-cols-3 gap-3">
            <div>
              {renderNode(
                'quote_create',
                'Create Quotation',
                'Compiled items + 18% GST + discount',
                <FileText className="w-4 h-4 text-indigo-500" />,
                ['QUOTATION_DRAFTED'],
                'common'
              )}
            </div>

            <div>
              {renderNode(
                'quote_approve',
                'Customer Approval',
                'Customer signs quotation or digital confirmation',
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
                ['QUOTATION_APPROVED'],
                'common'
              )}
            </div>

            <div>
              {renderNode(
                'issue_invoice',
                'Issue Tax Invoice',
                'Formal GST Invoice generated with due date',
                <FileText className="w-4 h-4 text-blue-600" />,
                ['INVOICED'],
                'common'
              )}
            </div>
          </div>

          <ArrowDown className="w-4 h-4 text-slate-400 shrink-0" />

          {/* 4. Delivery -> Payment -> Completed */}
          <div className="w-full max-w-xl grid grid-cols-3 gap-3">
            <div>
              {renderNode(
                'delivery',
                'Delivery / Execution',
                'Stock deducted, work signed off on site',
                <Truck className="w-4 h-4 text-amber-500" />,
                ['DELIVERED'],
                'common'
              )}
            </div>

            <div>
              {renderNode(
                'payment',
                'Record Payment',
                'Settle dues via UPI, Bank, Cash, or Cheque',
                <DollarSign className="w-4 h-4 text-emerald-600" />,
                ['PAID'],
                'common'
              )}
            </div>

            <div>
              {renderNode(
                'closed',
                'Job Completed & Closed',
                'Fully reconciled, audited and archived',
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />,
                ['CLOSED'],
                'common'
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
