import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { FlowchartVisualizer } from './components/FlowchartVisualizer';
import { JobCardList } from './components/JobCardList';
import { JobCardDetailModal } from './components/JobCardDetailModal';
import { CreateJobCardModal } from './components/CreateJobCardModal';
import { EngineerMobileView } from './components/EngineerMobileView';
import { InventoryManager } from './components/InventoryManager';
import { ProcurementManager } from './components/ProcurementManager';
import { InvoicesAndQuotes } from './components/InvoicesAndQuotes';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { PrintDocumentModal } from './components/PrintDocumentModal';
import { LoginPage } from './components/LoginPage';
import { UserManagementPortal } from './components/UserManagementPortal';
import { AttendancePortal } from './components/AttendancePortal';
import { StockInwardPortal } from './components/StockInwardPortal';
import { SiteMapPortalView } from './components/SiteMapPortalView';
import { ProfileSection } from './components/ProfileSection';
import { DownloadSetupModal } from './components/DownloadSetupModal';
import {
  BottomInteractivePanel,
  MainNavTab,
  ErpModule,
} from './components/BottomInteractivePanel';
import {
  Ticket,
  MapPin,
  User,
  LayoutGrid,
  Package,
  PackagePlus,
  Truck,
  FileText,
  UserCheck,
  Users,
  BarChart3,
  Plus,
  ArrowLeft,
  Sliders,
  Clock,
  Calendar,
} from 'lucide-react';

function DashboardContent() {
  const {
    viewMode,
    isAuthenticated,
    currentUser,
    selectedJobCardId,
    setSelectedJobCardId,
    jobCards,
    attendance,
    isSetupModalOpen,
    setIsSetupModalOpen,
  } = useApp();

  const [gmpQuotaExceeded, setGmpQuotaExceeded] = useState(false);

  React.useEffect(() => {
    const handleQuota = () => setGmpQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', handleQuota);
    return () => window.removeEventListener('gmp-quota-exceeded', handleQuota);
  }, []);

  // Primary interactive panel navigation state (1. Ticket | 2. Site Map | 3. Profile | ERP Suite)
  const [activeBottomTab, setActiveBottomTab] = useState<MainNavTab>('TICKETS');
  const [activeErpModule, setActiveErpModule] = useState<ErpModule>('INVENTORY');

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [detailModalJobId, setDetailModalJobId] = useState<string | null>(null);

  // Print document modal state
  const [printDoc, setPrintDoc] = useState<{ type: 'QUOTATION' | 'INVOICE'; id: string } | null>(null);

  const handleOpenPrintDoc = (type: 'QUOTATION' | 'INVOICE', id: string) => {
    setPrintDoc({ type, id });
  };

  // If user is not logged in, render dedicated Login Page
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const isAdmin = currentUser.role === 'ADMIN';
  const isSalesOrAdmin = currentUser.role === 'ADMIN' || currentUser.role === 'SALES';

  // Check if clocked in for quick badge
  const todayStr = new Date().toISOString().split('T')[0];
  const userTodayPunch = attendance.find(a => a.userId === currentUser.id && a.date === todayStr);
  const isClockedIn = !!(userTodayPunch?.punchInTime && !userTodayPunch?.punchOutTime);

  return (
    <div className="min-h-screen bg-slate-100/70 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors relative overflow-x-hidden">
      {gmpQuotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2 text-xs text-center sticky top-0 z-50 shadow-sm flex items-center justify-center gap-2">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>
          </span>
          <button
            onClick={() => setGmpQuotaExceeded(false)}
            className="text-amber-800 hover:text-amber-950 text-xs font-bold underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Clean Top Header (Responsive for both phone browsers and desktop) */}
      <Header />

      {/* Main Content Area - padded bottom for fixed interactive bottom panel */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-4 pb-28 sm:pb-32 space-y-4 sm:space-y-6">
        {viewMode === 'MOBILE_APP' ? (
          /* FIELD SERVICE MOBILE APP VIEW */
          <div className="py-1">
            <EngineerMobileView />
          </div>
        ) : (
          /* BACK-OFFICE / PHONE SUITABLE WEB PORTAL VIEW */
          <div className="space-y-4 sm:space-y-6">
            {/* Top Quick Segment Switcher (Syncs with the 3 Interactive Down Tabs) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 dark:border-slate-800 pb-3">
              {/* Primary 3 Interactive Tabs + ERP pill */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                {/* 1. TICKET */}
                <button
                  onClick={() => setActiveBottomTab('TICKETS')}
                  className={`px-3.5 py-2 rounded-2xl text-xs font-black transition flex items-center gap-2 shrink-0 ${
                    activeBottomTab === 'TICKETS'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 ring-2 ring-blue-500/20'
                      : 'text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <Ticket className="w-4 h-4" />
                  <span>1. Ticket</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    activeBottomTab === 'TICKETS' ? 'bg-blue-700 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}>
                    {jobCards.length}
                  </span>
                </button>

                {/* 2. SITE MAP */}
                <button
                  onClick={() => setActiveBottomTab('MAP')}
                  className={`px-3.5 py-2 rounded-2xl text-xs font-black transition flex items-center gap-2 shrink-0 ${
                    activeBottomTab === 'MAP'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 ring-2 ring-blue-500/20'
                      : 'text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  <span>2. Site Map</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                </button>

                {/* 3. PROFILE */}
                <button
                  onClick={() => setActiveBottomTab('PROFILE')}
                  className={`px-3.5 py-2 rounded-2xl text-xs font-black transition flex items-center gap-2 shrink-0 ${
                    activeBottomTab === 'PROFILE'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 ring-2 ring-blue-500/20'
                      : 'text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span>3. Profile</span>
                  {isClockedIn && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500" title="Clocked In" />
                  )}
                </button>

                {/* ERP SUITE EXTENSION */}
                <button
                  onClick={() => setActiveBottomTab('ERP_MORE')}
                  className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                    activeBottomTab === 'ERP_MORE'
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md'
                      : 'text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">ERP Operations</span>
                  <span className="sm:hidden">ERP</span>
                </button>
              </div>

              {/* Action Button: Create Job Card (always visible & prominent) */}
              <button
                onClick={() => setCreateModalOpen(true)}
                className="w-full sm:w-auto px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-black shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 transition active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>New Job Card</span>
              </button>
            </div>

            {/* TAB 1 CONTENT: TICKETS / JOB CARDS HUB */}
            {activeBottomTab === 'TICKETS' && (
              <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-200">
                {/* Visual Workflow Flowchart (collapsible) */}
                <FlowchartVisualizer isExpandedDefault={false} />

                {/* Tickets Kanban & List */}
                <JobCardList
                  onOpenCreateModal={() => setCreateModalOpen(true)}
                  onOpenDetailModal={id => setDetailModalJobId(id)}
                />
              </div>
            )}

            {/* TAB 2 CONTENT: INTERACTIVE SITE MAP */}
            {activeBottomTab === 'MAP' && (
              <div className="animate-in fade-in duration-200">
                <SiteMapPortalView onOpenDetailModal={id => setDetailModalJobId(id)} />
              </div>
            )}

            {/* TAB 3 CONTENT: PROFILE SECTION (Punch Attendance, User Settings, Working Days & Leaves) */}
            {activeBottomTab === 'PROFILE' && (
              <div className="animate-in fade-in duration-200">
                <ProfileSection />
              </div>
            )}

            {/* TAB 4 CONTENT: ERP MORE MODULES */}
            {activeBottomTab === 'ERP_MORE' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                {/* Sub-navigation bar inside ERP Suite */}
                <div className="flex items-center justify-between gap-2 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-x-auto text-xs font-bold scrollbar-none">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setActiveErpModule('INVENTORY')}
                      className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 shrink-0 ${
                        activeErpModule === 'INVENTORY'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <Package className="w-3.5 h-3.5" />
                      Inventory
                    </button>

                    <button
                      onClick={() => setActiveErpModule('STOCK_INWARD')}
                      className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 shrink-0 ${
                        activeErpModule === 'STOCK_INWARD'
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <PackagePlus className="w-3.5 h-3.5" />
                      Stock Adding
                    </button>

                    <button
                      onClick={() => setActiveErpModule('PROCUREMENT')}
                      className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 shrink-0 ${
                        activeErpModule === 'PROCUREMENT'
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <Truck className="w-3.5 h-3.5" />
                      Procurement
                    </button>

                    <button
                      onClick={() => setActiveErpModule('FINANCE')}
                      className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 shrink-0 ${
                        activeErpModule === 'FINANCE'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      Billing
                    </button>

                    <button
                      onClick={() => setActiveErpModule('ATTENDANCE_OVERVIEW')}
                      className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 shrink-0 ${
                        activeErpModule === 'ATTENDANCE_OVERVIEW'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      Staff Attendance
                    </button>

                    {isAdmin && (
                      <button
                        onClick={() => setActiveErpModule('USERS')}
                        className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 shrink-0 ${
                          activeErpModule === 'USERS'
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <Users className="w-3.5 h-3.5" />
                        Users
                      </button>
                    )}

                    <button
                      onClick={() => setActiveErpModule('ANALYTICS')}
                      className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 shrink-0 ${
                        activeErpModule === 'ANALYTICS'
                          ? 'bg-cyan-600 text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <BarChart3 className="w-3.5 h-3.5" />
                      Analytics
                    </button>
                  </div>

                  <button
                    onClick={() => setActiveBottomTab('TICKETS')}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-bold shrink-0 ml-2"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Back to Tickets
                  </button>
                </div>

                {/* Sub-module render */}
                {activeErpModule === 'INVENTORY' && <InventoryManager />}
                {activeErpModule === 'STOCK_INWARD' && <StockInwardPortal />}
                {activeErpModule === 'PROCUREMENT' && <ProcurementManager />}
                {activeErpModule === 'FINANCE' && (
                  <InvoicesAndQuotes onOpenPrintDoc={handleOpenPrintDoc} />
                )}
                {activeErpModule === 'ATTENDANCE_OVERVIEW' && <AttendancePortal />}
                {activeErpModule === 'USERS' && <UserManagementPortal />}
                {activeErpModule === 'ANALYTICS' && <AnalyticsDashboard />}
              </div>
            )}
          </div>
        )}
      </main>

      {/* FIXED PERSISTENT INTERACTIVE PANEL IN DOWN */}
      {viewMode === 'WEB_DASHBOARD' && (
        <BottomInteractivePanel
          activeTab={activeBottomTab}
          onSelectTab={setActiveBottomTab}
          activeErpModule={activeErpModule}
          onSelectErpModule={setActiveErpModule}
        />
      )}

      {/* GLOBAL MODALS */}
      {createModalOpen && (
        <CreateJobCardModal onClose={() => setCreateModalOpen(false)} />
      )}

      {detailModalJobId && (
        <JobCardDetailModal
          jobCardId={detailModalJobId}
          onClose={() => setDetailModalJobId(null)}
          onOpenPrintDoc={handleOpenPrintDoc}
        />
      )}

      {printDoc && (
        <PrintDocumentModal
          type={printDoc.type}
          docId={printDoc.id}
          onClose={() => setPrintDoc(null)}
        />
      )}

      {isSetupModalOpen && (
        <DownloadSetupModal onClose={() => setIsSetupModalOpen(false)} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <DashboardContent />
    </AppProvider>
  );
}
