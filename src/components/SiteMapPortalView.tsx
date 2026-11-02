import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { EngineerJobSitesMap, DEFAULT_ENGINEER_COORDS } from './EngineerJobSitesMap';
import {
  MapPin,
  Navigation,
  ExternalLink,
  Phone,
  Building,
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Filter,
  Layers,
  ChevronRight,
  Maximize2,
  Calendar,
} from 'lucide-react';
import { JobCard } from '../types';

interface SiteMapPortalViewProps {
  onOpenDetailModal: (id: string) => void;
}

export const SiteMapPortalView: React.FC<SiteMapPortalViewProps> = ({ onOpenDetailModal }) => {
  const { jobCards, customers, selectedJobCardId, setSelectedJobCardId } = useApp();
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'CRITICAL' | 'SERVICE'>('ALL');
  const [selectedJobId, setSelectedJobId] = useState<string | null>(
    selectedJobCardId || (jobCards.length > 0 ? jobCards[0].id : null)
  );

  const filteredJobs = React.useMemo(() => {
    return jobCards.filter(j => {
      if (activeFilter === 'CRITICAL') return j.priority === 'CRITICAL' || j.priority === 'HIGH';
      if (activeFilter === 'SERVICE') return j.type === 'SERVICE';
      return true;
    });
  }, [jobCards, activeFilter]);

  const selectedJob = jobCards.find(j => j.id === selectedJobId);
  const selectedCustomer = selectedJob ? customers.find(c => c.id === selectedJob.customerId) : null;

  const handleSelectJob = (id: string) => {
    setSelectedJobId(id);
    setSelectedJobCardId(id);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner & Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950/80 dark:text-blue-300">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                Live Site Map & Field Dispatch Radar
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                GPS pinned client job sites, technician routes & geofencing
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-bold self-start sm:self-auto">
          <button
            onClick={() => setActiveFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl transition ${
              activeFilter === 'ALL'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            All Sites ({jobCards.length})
          </button>
          <button
            onClick={() => setActiveFilter('CRITICAL')}
            className={`px-3 py-1.5 rounded-xl transition ${
              activeFilter === 'CRITICAL'
                ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Critical
          </button>
          <button
            onClick={() => setActiveFilter('SERVICE')}
            className={`px-3 py-1.5 rounded-xl transition ${
              activeFilter === 'SERVICE'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Service Repairs
          </button>
        </div>
      </div>

      {/* Main Map + Side Info Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Interactive Google Map Container */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden min-h-[380px] sm:min-h-[460px] flex flex-col">
          <div className="flex-1 min-h-[360px] relative">
            <EngineerJobSitesMap
              jobs={filteredJobs}
              customers={customers}
              selectedJobId={selectedJobId}
              onSelectJob={handleSelectJob}
              onOpenInspection={id => onOpenDetailModal(id)}
              currentEngineerLocation={DEFAULT_ENGINEER_COORDS}
              isCompact={false}
            />
          </div>
          {/* Quick status bar beneath map */}
          <div className="p-3 bg-slate-50 dark:bg-slate-900/90 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
              Depot: Whitefield Tech Zone II (HQ)
            </span>
            <span className="text-[11px] font-medium">Touch pins or list to inspect</span>
          </div>
        </div>

        {/* Selected Site Details / Active Pin Card */}
        <div className="space-y-3">
          {selectedJob && selectedCustomer ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300">
                  {selectedJob.jobNumber}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    selectedJob.priority === 'CRITICAL'
                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300'
                      : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  {selectedJob.priority} Priority
                </span>
              </div>

              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white leading-tight">
                  {selectedCustomer.companyName || selectedCustomer.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Contact: {selectedCustomer.name}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 space-y-2 text-xs">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span className="text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed">
                    {selectedJob.siteCoordinates?.address ||
                      selectedCustomer.shippingAddress ||
                      'Plot 45, Industrial Suburb, Bengaluru'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-[11px]">
                  <Phone className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span>{selectedCustomer.phone}</span>
                </div>
              </div>

              {selectedJob.notes && (
                <div className="text-xs text-slate-600 dark:text-slate-400 bg-amber-50/60 dark:bg-amber-950/30 p-3 rounded-2xl border border-amber-200/60 dark:border-amber-900/40">
                  <span className="font-bold text-amber-800 dark:text-amber-300 block mb-0.5">
                    Job Notes:
                  </span>
                  &quot;{selectedJob.notes}&quot;
                </div>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => onOpenDetailModal(selectedJob.id)}
                  className="py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center justify-center gap-1.5 transition"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Inspect Ticket</span>
                </button>

                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${
                    selectedJob.siteCoordinates?.lat || 12.9716
                  },${selectedJob.siteCoordinates?.lng || 77.5946}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition"
                >
                  <Navigation className="w-3.5 h-3.5 text-blue-500" />
                  <span>Navigate GPS</span>
                </a>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm text-center text-slate-400 text-xs">
              <MapPin className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
              <p className="font-bold">Select a pin on the map to view site details</p>
            </div>
          )}

          {/* Site list quick scroll */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2 max-h-[260px] overflow-y-auto">
            <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Assigned Sites ({filteredJobs.length})
            </h4>
            <div className="space-y-1.5">
              {filteredJobs.map(job => {
                const cust = customers.find(c => c.id === job.customerId);
                const isSelected = job.id === selectedJobId;
                return (
                  <button
                    key={job.id}
                    onClick={() => handleSelectJob(job.id)}
                    className={`w-full p-2.5 rounded-2xl text-left border text-xs transition flex items-center justify-between ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100'
                        : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div>
                      <p className="font-bold">{job.jobNumber}</p>
                      <p className="text-[11px] text-slate-400 truncate max-w-[170px]">
                        {cust?.companyName || cust?.name}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
