import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { JobCard, JobStatus, JobType } from '../types';
import {
  Search,
  Filter,
  Plus,
  LayoutGrid,
  List as ListIcon,
  Clock,
  User,
  Building,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Layers,
} from 'lucide-react';

interface JobCardListProps {
  onOpenCreateModal: () => void;
  onOpenDetailModal: (id: string) => void;
}

export const JobCardList: React.FC<JobCardListProps> = ({
  onOpenCreateModal,
  onOpenDetailModal,
}) => {
  const { jobCards, customers, users, selectedJobCardId, setSelectedJobCardId } = useApp();

  const [viewFormat, setViewFormat] = useState<'KANBAN' | 'LIST'>('KANBAN');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | JobType>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filteredJobs = jobCards.filter(job => {
    const cust = customers.find(c => c.id === job.customerId);
    const matchesSearch =
      job.jobNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cust?.companyName && cust.companyName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (cust?.name && cust.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (job.notes && job.notes.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = typeFilter === 'ALL' || job.type === typeFilter;
    const matchesStatus = statusFilter === 'ALL' || job.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  const kanbanColumns: { id: string; label: string; statuses: JobStatus[]; color: string }[] = [
    {
      id: 'requested',
      label: 'New / Dispatch',
      statuses: ['REQUESTED', 'ENGINEER_ASSIGNED'],
      color: 'border-blue-400',
    },
    {
      id: 'diagnosing',
      label: 'Inspection & Stock',
      statuses: ['REQUIREMENTS_LOGGED', 'STOCK_CHECK_PENDING', 'PURCHASE_PENDING'],
      color: 'border-amber-400',
    },
    {
      id: 'commercial',
      label: 'Quote & Invoicing',
      statuses: ['QUOTATION_DRAFTED', 'QUOTATION_APPROVED', 'INVOICED'],
      color: 'border-purple-400',
    },
    {
      id: 'execution',
      label: 'Delivery & Payment',
      statuses: ['DELIVERED', 'PAID'],
      color: 'border-emerald-400',
    },
    {
      id: 'completed',
      label: 'Closed / Archived',
      statuses: ['CLOSED', 'CANCELLED'],
      color: 'border-slate-400',
    },
  ];

  const getStatusBadge = (status: JobStatus) => {
    switch (status) {
      case 'REQUESTED':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300';
      case 'ENGINEER_ASSIGNED':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300';
      case 'REQUIREMENTS_LOGGED':
        return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-300';
      case 'PURCHASE_PENDING':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300';
      case 'QUOTATION_DRAFTED':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300';
      case 'QUOTATION_APPROVED':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300';
      case 'INVOICED':
        return 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300';
      case 'DELIVERED':
        return 'bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300';
      case 'PAID':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300';
      case 'CLOSED':
        return 'bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-300';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Filter and Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by job #, customer, or scope..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Type Filter */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
            {(['ALL', 'SERVICE', 'SALES'] as const).map(type => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`px-3 py-1 rounded-lg transition ${
                  typeFilter === type
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Status Dropdown */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 font-medium"
          >
            <option value="ALL">All Stages</option>
            <option value="REQUESTED">REQUESTED</option>
            <option value="ENGINEER_ASSIGNED">ENGINEER_ASSIGNED</option>
            <option value="REQUIREMENTS_LOGGED">REQUIREMENTS_LOGGED</option>
            <option value="PURCHASE_PENDING">PURCHASE_PENDING</option>
            <option value="QUOTATION_DRAFTED">QUOTATION_DRAFTED</option>
            <option value="QUOTATION_APPROVED">QUOTATION_APPROVED</option>
            <option value="INVOICED">INVOICED</option>
            <option value="DELIVERED">DELIVERED</option>
            <option value="PAID">PAID</option>
            <option value="CLOSED">CLOSED</option>
          </select>
        </div>

        {/* View Mode & New Job Button */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setViewFormat('KANBAN')}
              className={`p-1.5 rounded-lg transition ${
                viewFormat === 'KANBAN'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Kanban Board View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewFormat('LIST')}
              className={`p-1.5 rounded-lg transition ${
                viewFormat === 'LIST'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="List Table View"
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={onOpenCreateModal}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition"
          >
            <Plus className="w-4 h-4" />
            Create Job Card
          </button>
        </div>
      </div>

      {/* KANBAN BOARD VIEW */}
      {viewFormat === 'KANBAN' && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3.5 overflow-x-auto pb-4">
          {kanbanColumns.map(col => {
            const colJobs = filteredJobs.filter(j => col.statuses.includes(j.status));

            return (
              <div
                key={col.id}
                className="bg-slate-50 dark:bg-slate-900/40 rounded-2xl p-3 border border-slate-200 dark:border-slate-800 flex flex-col min-w-[240px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    <h3 className="font-bold text-xs text-slate-800 dark:text-slate-200">{col.label}</h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-600 dark:text-slate-400">
                    {colJobs.length}
                  </span>
                </div>

                {/* Job Cards in Column */}
                <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[640px] pr-1">
                  {colJobs.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-xs italic">No tickets here</div>
                  ) : (
                    colJobs.map(job => {
                      const cust = customers.find(c => c.id === job.customerId);
                      const eng = users.find(u => u.id === job.assignedEngineerId);
                      const isSelected = job.id === selectedJobCardId;

                      return (
                        <div
                          key={job.id}
                          onClick={() => {
                            setSelectedJobCardId(job.id);
                          }}
                          onDoubleClick={() => onOpenDetailModal(job.id)}
                          className={`bg-white dark:bg-slate-800/90 p-3 rounded-xl border transition cursor-pointer shadow-xs hover:border-blue-500 ${
                            isSelected
                              ? 'border-blue-600 ring-2 ring-blue-500/20 shadow-md'
                              : 'border-slate-200 dark:border-slate-700/80'
                          }`}
                        >
                          {/* Top Tag Row */}
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                              {job.jobNumber}
                            </span>
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                                job.type === 'SALES'
                                  ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300'
                                  : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                              }`}
                            >
                              {job.type}
                            </span>
                          </div>

                          {/* Customer Title */}
                          <h4 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1 mb-1">
                            {cust?.companyName || cust?.name || 'Customer'}
                          </h4>

                          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mb-2 leading-relaxed">
                            {job.notes || 'Routine task processing.'}
                          </p>

                          {/* Status Pill */}
                          <div className="mb-2">
                            <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${getStatusBadge(job.status)}`}>
                              {job.status}
                            </span>
                          </div>

                          {/* Footer with Engineer & Action */}
                          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700 text-[10px] text-slate-400">
                            {job.type === 'SERVICE' ? (
                              eng ? (
                                <span className="flex items-center gap-1 font-medium text-slate-600 dark:text-slate-300">
                                  <User className="w-3 h-3 text-slate-400" />
                                  {eng.name.split(' ')[0]}
                                </span>
                              ) : (
                                <span className="text-amber-500 font-semibold">Unassigned</span>
                              )
                            ) : (
                              <span className="text-purple-600 font-medium">Sales Fulfilled</span>
                            )}

                            <button
                              onClick={e => {
                                e.stopPropagation();
                                onOpenDetailModal(job.id);
                              }}
                              className="text-blue-600 hover:underline font-bold flex items-center gap-0.5"
                            >
                              Details
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TABLE LIST VIEW */}
      {viewFormat === 'LIST' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-3.5">Job Number</th>
                <th className="p-3.5">Type</th>
                <th className="p-3.5">Customer & Site</th>
                <th className="p-3.5">Priority</th>
                <th className="p-3.5">Assigned To</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5">Created Date</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400 italic">
                    No matching job cards found.
                  </td>
                </tr>
              ) : (
                filteredJobs.map(job => {
                  const cust = customers.find(c => c.id === job.customerId);
                  const eng = users.find(u => u.id === job.assignedEngineerId);
                  const isSelected = job.id === selectedJobCardId;

                  return (
                    <tr
                      key={job.id}
                      onClick={() => setSelectedJobCardId(job.id)}
                      className={`hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition ${
                        isSelected ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''
                      }`}
                    >
                      <td className="p-3.5 font-mono font-bold text-blue-600 dark:text-blue-400">
                        {job.jobNumber}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            job.type === 'SALES'
                              ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300'
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                          }`}
                        >
                          {job.type}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {cust?.companyName || cust?.name}
                        </div>
                        <div className="text-[10px] text-slate-400 line-clamp-1">{cust?.shippingAddress}</div>
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                            job.priority === 'CRITICAL'
                              ? 'bg-red-100 text-red-700'
                              : job.priority === 'HIGH'
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {job.priority}
                        </span>
                      </td>
                      <td className="p-3.5">
                        {eng ? (
                          <div className="font-semibold text-slate-800 dark:text-slate-200">{eng.name}</div>
                        ) : job.type === 'SERVICE' ? (
                          <span className="text-amber-600 text-[11px] font-semibold">Unassigned</span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">N/A (Sales)</span>
                        )}
                      </td>
                      <td className="p-3.5 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${getStatusBadge(job.status)}`}>
                          {job.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-500 text-[11px]">
                        {new Date(job.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            onOpenDetailModal(job.id);
                          }}
                          className="px-3 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950/60 dark:text-blue-300 rounded-lg font-bold text-[11px] transition"
                        >
                          Open Details
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
