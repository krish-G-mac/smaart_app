import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Ticket,
  MapPin,
  User,
  LayoutGrid,
  Package,
  PackagePlus,
  Truck,
  FileText,
  Users,
  BarChart3,
  X,
  ChevronUp,
  Sparkles,
} from 'lucide-react';

export type MainNavTab = 'TICKETS' | 'MAP' | 'PROFILE' | 'ERP_MORE';
export type ErpModule =
  | 'INVENTORY'
  | 'STOCK_INWARD'
  | 'PROCUREMENT'
  | 'FINANCE'
  | 'ATTENDANCE_OVERVIEW'
  | 'USERS'
  | 'ANALYTICS';

interface BottomInteractivePanelProps {
  activeTab: MainNavTab;
  onSelectTab: (tab: MainNavTab) => void;
  activeErpModule: ErpModule;
  onSelectErpModule: (mod: ErpModule) => void;
}

export const BottomInteractivePanel: React.FC<BottomInteractivePanelProps> = ({
  activeTab,
  onSelectTab,
  activeErpModule,
  onSelectErpModule,
}) => {
  const { jobCards, currentUser, attendance } = useApp();
  const [erpDrawerOpen, setErpDrawerOpen] = useState(false);

  // Active tickets count
  const activeTicketsCount = jobCards.filter(
    j => j.status !== 'CLOSED' && j.status !== 'CANCELLED'
  ).length;

  // Is user clocked in today?
  const todayStr = new Date().toISOString().split('T')[0];
  const userTodayPunch = attendance.find(a => a.userId === currentUser.id && a.date === todayStr);
  const isClockedIn = !!(userTodayPunch?.punchInTime && !userTodayPunch?.punchOutTime);

  const isAdmin = currentUser.role === 'ADMIN';
  const isSalesOrAdmin = currentUser.role === 'ADMIN' || currentUser.role === 'SALES';

  const handleSelectTab = (tab: MainNavTab) => {
    if (tab === 'ERP_MORE') {
      setErpDrawerOpen(true);
    } else {
      setErpDrawerOpen(false);
      onSelectTab(tab);
    }
  };

  const handleChooseErpModule = (mod: ErpModule) => {
    onSelectErpModule(mod);
    onSelectTab('ERP_MORE');
    setErpDrawerOpen(false);
  };

  return (
    <>
      {/* 1. ERP QUICK ACTION DRAWER (Sliding up when user taps ERP Suite) */}
      {erpDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col justify-end">
          <div
            className="fixed inset-0"
            onClick={() => setErpDrawerOpen(false)}
            aria-label="Close drawer"
          />
          <div className="relative bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 rounded-t-3xl p-5 shadow-2xl max-w-lg mx-auto w-full space-y-4 animate-in slide-in-from-bottom-5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-300">
                  <LayoutGrid className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 dark:text-white text-sm">
                    SMAART ERP Operations
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Inventory, procurement, finance & analytics
                  </p>
                </div>
              </div>
              <button
                onClick={() => setErpDrawerOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => handleChooseErpModule('INVENTORY')}
                className={`p-3 rounded-2xl border text-left transition flex items-center gap-3 ${
                  activeTab === 'ERP_MORE' && activeErpModule === 'INVENTORY'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40'
                }`}
              >
                <div className="p-2 rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-300">
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold">Inventory Hub</p>
                  <p className="text-[10px] text-slate-400">Stock & SKUs</p>
                </div>
              </button>

              <button
                onClick={() => handleChooseErpModule('STOCK_INWARD')}
                className={`p-3 rounded-2xl border text-left transition flex items-center gap-3 ${
                  activeTab === 'ERP_MORE' && activeErpModule === 'STOCK_INWARD'
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/40 text-purple-900 dark:text-purple-100'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40'
                }`}
              >
                <div className="p-2 rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-300">
                  <PackagePlus className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold">Stock Adding</p>
                  <p className="text-[10px] text-slate-400">Inward invoices</p>
                </div>
              </button>

              <button
                onClick={() => handleChooseErpModule('PROCUREMENT')}
                className={`p-3 rounded-2xl border text-left transition flex items-center gap-3 ${
                  activeTab === 'ERP_MORE' && activeErpModule === 'PROCUREMENT'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40'
                }`}
              >
                <div className="p-2 rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-300">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold">Procurement</p>
                  <p className="text-[10px] text-slate-400">Purchase Orders</p>
                </div>
              </button>

              <button
                onClick={() => handleChooseErpModule('FINANCE')}
                className={`p-3 rounded-2xl border text-left transition flex items-center gap-3 ${
                  activeTab === 'ERP_MORE' && activeErpModule === 'FINANCE'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40'
                }`}
              >
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold">Billing & Quotes</p>
                  <p className="text-[10px] text-slate-400">Invoices & GST</p>
                </div>
              </button>

              {isAdmin && (
                <button
                  onClick={() => handleChooseErpModule('USERS')}
                  className={`p-3 rounded-2xl border text-left transition flex items-center gap-3 ${
                    activeTab === 'ERP_MORE' && activeErpModule === 'USERS'
                      ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-100'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40'
                  }`}
                >
                  <div className="p-2 rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-300">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold">User Management</p>
                    <p className="text-[10px] text-slate-400">Admin Only</p>
                  </div>
                </button>
              )}

              <button
                onClick={() => handleChooseErpModule('ANALYTICS')}
                className={`p-3 rounded-2xl border text-left transition flex items-center gap-3 ${
                  activeTab === 'ERP_MORE' && activeErpModule === 'ANALYTICS'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40'
                }`}
              >
                <div className="p-2 rounded-xl bg-cyan-100 text-cyan-600 dark:bg-cyan-950 dark:text-cyan-300">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold">Analytics & KPIs</p>
                  <p className="text-[10px] text-slate-400">Revenue & Trends</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. PERSISTENT INTERACTIVE PANEL IN DOWN */}
      <nav
        aria-label="Bottom Navigation"
        className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200/80 dark:border-slate-800/80 shadow-2xl transition-all select-none"
      >
        <div className="max-w-md md:max-w-xl mx-auto px-2 sm:px-4 h-16 flex items-center justify-around">
          {/* TAB 1: TICKET */}
          <button
            onClick={() => handleSelectTab('TICKETS')}
            className={`flex-1 py-1.5 px-2 rounded-2xl flex flex-col items-center justify-center transition-all relative ${
              activeTab === 'TICKETS'
                ? 'text-blue-600 dark:text-blue-400 font-black scale-105'
                : 'text-slate-500 dark:text-slate-400 font-bold hover:text-slate-800 dark:hover:text-slate-200 active:scale-95'
            }`}
          >
            <div className="relative">
              <Ticket className="w-5 h-5 sm:w-6 sm:h-6" />
              {activeTicketsCount > 0 && (
                <span className="absolute -top-1 -right-2.5 px-1.5 py-0.2 rounded-full bg-blue-600 text-white text-[9px] font-black shadow-xs">
                  {activeTicketsCount}
                </span>
              )}
            </div>
            <span className="text-[11px] sm:text-xs mt-1">1. Ticket</span>
            {activeTab === 'TICKETS' && (
              <span className="w-6 h-1 rounded-full bg-blue-600 dark:bg-blue-400 mt-0.5" />
            )}
          </button>

          {/* TAB 2: SITE MAP */}
          <button
            onClick={() => handleSelectTab('MAP')}
            className={`flex-1 py-1.5 px-2 rounded-2xl flex flex-col items-center justify-center transition-all relative ${
              activeTab === 'MAP'
                ? 'text-blue-600 dark:text-blue-400 font-black scale-105'
                : 'text-slate-500 dark:text-slate-400 font-bold hover:text-slate-800 dark:hover:text-slate-200 active:scale-95'
            }`}
          >
            <div className="relative">
              <MapPin className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="absolute -top-0.5 -right-1 w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            </div>
            <span className="text-[11px] sm:text-xs mt-1">2. Site Map</span>
            {activeTab === 'MAP' && (
              <span className="w-6 h-1 rounded-full bg-blue-600 dark:bg-blue-400 mt-0.5" />
            )}
          </button>

          {/* TAB 3: PROFILE */}
          <button
            onClick={() => handleSelectTab('PROFILE')}
            className={`flex-1 py-1.5 px-2 rounded-2xl flex flex-col items-center justify-center transition-all relative ${
              activeTab === 'PROFILE'
                ? 'text-blue-600 dark:text-blue-400 font-black scale-105'
                : 'text-slate-500 dark:text-slate-400 font-bold hover:text-slate-800 dark:hover:text-slate-200 active:scale-95'
            }`}
          >
            <div className="relative">
              <User className="w-5 h-5 sm:w-6 sm:h-6" />
              {/* Green indicator if clocked in */}
              <span
                className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-white dark:border-slate-900 ${
                  isClockedIn ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300 dark:bg-slate-600'
                }`}
                title={isClockedIn ? 'Clocked In' : 'Off-Duty'}
              />
            </div>
            <span className="text-[11px] sm:text-xs mt-1">3. Profile</span>
            {activeTab === 'PROFILE' && (
              <span className="w-6 h-1 rounded-full bg-blue-600 dark:bg-blue-400 mt-0.5" />
            )}
          </button>

          {/* TAB 4: ERP MORE (Quick Drawer Trigger) */}
          <button
            onClick={() => handleSelectTab('ERP_MORE')}
            className={`flex-1 py-1.5 px-2 rounded-2xl flex flex-col items-center justify-center transition-all relative ${
              activeTab === 'ERP_MORE'
                ? 'text-blue-600 dark:text-blue-400 font-black scale-105'
                : 'text-slate-500 dark:text-slate-400 font-bold hover:text-slate-800 dark:hover:text-slate-200 active:scale-95'
            }`}
          >
            <div className="relative">
              <LayoutGrid className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <span className="text-[11px] sm:text-xs mt-1">ERP Suite</span>
            {activeTab === 'ERP_MORE' && (
              <span className="w-6 h-1 rounded-full bg-blue-600 dark:bg-blue-400 mt-0.5" />
            )}
          </button>
        </div>
      </nav>
    </>
  );
};
