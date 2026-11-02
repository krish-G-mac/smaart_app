import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Shield,
  Smartphone,
  Monitor,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Info,
  ChevronDown,
  Wrench,
  Users,
  Activity,
  Bell,
  CheckCircle2,
  Package,
  DollarSign,
  FileText,
  AlertTriangle,
  Clock,
  Trash2,
  CheckCheck,
  ExternalLink,
  LogOut,
  Sun,
  Moon,
  FolderDown,
} from 'lucide-react';
import { NotificationType } from '../types';

export const Header: React.FC = () => {
  const {
    currentUser,
    setCurrentUser,
    logout,
    users,
    viewMode,
    setViewMode,
    toastMessage,
    resetToDefaults,
    jobCards,
    notifications,
    unreadNotificationCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearNotifications,
    setSelectedJobCardId,
    theme,
    isDarkMode,
    setTheme,
    toggleTheme,
    setIsSetupModalOpen,
  } = useApp();

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationFilter, setNotificationFilter] = useState<'ALL' | 'UNREAD'>('ALL');
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const userMenuRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    if (notificationsOpen || userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [notificationsOpen, userMenuOpen]);

  // Format relative time helper
  const getRelativeTime = (timestamp: string) => {
    try {
      const now = new Date().getTime();
      const time = new Date(timestamp).getTime();
      const diffSec = Math.floor((now - time) / 1000);

      if (diffSec < 60) return 'Just now';
      if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
      if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
      return `${Math.floor(diffSec / 86400)}d ago`;
    } catch {
      return 'Recently';
    }
  };

  // Helper for notification type icon and color
  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'JOB_ASSIGNMENT':
        return (
          <div className="p-2 rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
            <Wrench className="w-4 h-4" />
          </div>
        );
      case 'QUOTE_APPROVAL':
        return (
          <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        );
      case 'PO_RECEIVED':
        return (
          <div className="p-2 rounded-xl bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300">
            <Package className="w-4 h-4" />
          </div>
        );
      case 'PAYMENT_RECEIVED':
        return (
          <div className="p-2 rounded-xl bg-teal-100 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300">
            <DollarSign className="w-4 h-4" />
          </div>
        );
      case 'INVOICE_ISSUED':
        return (
          <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
            <FileText className="w-4 h-4" />
          </div>
        );
      case 'STOCK_ALERT':
        return (
          <div className="p-2 rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
            <AlertTriangle className="w-4 h-4" />
          </div>
        );
      default:
        return (
          <div className="p-2 rounded-xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            <Bell className="w-4 h-4" />
          </div>
        );
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (notificationFilter === 'UNREAD') return !n.read;
    return true;
  });

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition">
      {/* Toast Notification Alert */}
      {toastMessage && (
        <div
          className={`px-4 py-2 text-xs font-semibold flex items-center justify-center gap-2 text-white shadow-md transition-all ${
            toastMessage.type === 'error'
              ? 'bg-rose-600'
              : toastMessage.type === 'info'
              ? 'bg-blue-600'
              : 'bg-emerald-600'
          }`}
        >
          {toastMessage.type === 'error' && <AlertCircle className="w-4 h-4" />}
          {toastMessage.type === 'info' && <Info className="w-4 h-4" />}
          {toastMessage.type === 'success' && <CheckCircle className="w-4 h-4" />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand & Title */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-tr from-blue-700 to-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-500/20 text-white font-black text-lg tracking-wider">
            S
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-slate-900 dark:text-white tracking-tight text-base sm:text-lg">
                SMAART
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                ERP & Field Suite
              </span>
            </div>
            <p className="hidden sm:block text-[11px] text-slate-500 dark:text-slate-400">
              Sales & Service Operations • Inventory • State Machine
            </p>
          </div>
        </div>

        {/* Center: Dual Mode Switcher (Web Portal vs Mobile App) */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-bold">
          <button
            onClick={() => setViewMode('WEB_DASHBOARD')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition ${
              viewMode === 'WEB_DASHBOARD'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Back-Office Web</span>
            <span className="md:hidden">Web</span>
          </button>
          <button
            onClick={() => setViewMode('MOBILE_APP')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition ${
              viewMode === 'MOBILE_APP'
                ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 font-bold shadow-xs ring-1 ring-emerald-500/30'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
            title="Switch to Authentic Android Smartphone App View"
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-500" />
            <span className="hidden md:inline">Android App</span>
            <span className="md:hidden">Android</span>
            <span className="hidden sm:inline px-1 py-0.2 rounded-xs bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[9px] font-black uppercase">
              App
            </span>
          </button>
        </div>

        {/* Right: Setup Modal, Theme Toggle, Notifications Bell, Role Switcher & Reset */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* DOWNLOAD FULL SETUP & REALTIME LIVE SYNC BUTTON */}
          <button
            onClick={() => setIsSetupModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-xs transition active:scale-95"
            title="Download Full Project Setup, Android APK Build & Real-time Live Sync"
          >
            <FolderDown className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Setup & APK</span>
          </button>

          {/* THEME TOGGLE: WHITE THEME / DARK THEME */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-2xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setTheme('light')}
              className={`flex items-center gap-1 px-2 py-1 rounded-xl text-xs font-bold transition ${
                !isDarkMode
                  ? 'bg-white text-amber-600 shadow-xs'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
              title="Switch to White / Light Theme"
              aria-label="White Theme"
            >
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden lg:inline text-[11px]">White</span>
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`flex items-center gap-1 px-2 py-1 rounded-xl text-xs font-bold transition ${
                isDarkMode
                  ? 'bg-slate-700 text-blue-300 shadow-xs'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
              title="Switch to Dark Theme"
              aria-label="Dark Theme"
            >
              <Moon className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden lg:inline text-[11px]">Dark</span>
            </button>
          </div>

          {/* NOTIFICATION BELL & DROPDOWN */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className={`relative p-2 rounded-xl transition ${
                notificationsOpen
                  ? 'bg-blue-50 text-blue-600 dark:bg-slate-800 dark:text-blue-400'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title="Notifications & Workflow Alerts"
              aria-label="View notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadNotificationCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white shadow-xs animate-pulse">
                  {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                </span>
              )}
            </button>

            {/* NOTIFICATION DROPDOWN MENU */}
            {notificationsOpen && (
              <div className="fixed sm:absolute inset-x-3 sm:inset-x-auto sm:right-0 top-18 sm:top-full mt-2 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[80vh] sm:max-h-[500px] animate-in fade-in slide-in-from-top-2 duration-150">
                {/* Header */}
                <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/80">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900 dark:text-white">
                      Notifications & Alerts
                    </span>
                    {unreadNotificationCount > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-[10px] font-bold">
                        {unreadNotificationCount} new
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {unreadNotificationCount > 0 && (
                      <button
                        onClick={markAllNotificationsAsRead}
                        className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                        title="Mark all as read"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        Mark Read
                      </button>
                    )}
                    {notifications.length > 0 && (
                      <button
                        onClick={clearNotifications}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Clear all notifications"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center px-3.5 py-2 border-b border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 text-xs gap-2">
                  <button
                    onClick={() => setNotificationFilter('ALL')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                      notificationFilter === 'ALL'
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    All ({notifications.length})
                  </button>
                  <button
                    onClick={() => setNotificationFilter('UNREAD')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                      notificationFilter === 'UNREAD'
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    Unread ({unreadNotificationCount})
                  </button>
                </div>

                {/* Notifications List */}
                <div className="overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 flex-1">
                  {filteredNotifications.length === 0 ? (
                    <div className="p-8 text-center text-slate-400">
                      <Bell className="w-7 h-7 mx-auto mb-2 opacity-30" />
                      <p className="text-xs font-semibold">No notifications</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {notificationFilter === 'UNREAD' ? 'You have read all updates.' : 'No alerts recorded yet.'}
                      </p>
                    </div>
                  ) : (
                    filteredNotifications.map(notif => (
                      <div
                        key={notif.id}
                        onClick={() => {
                          markNotificationAsRead(notif.id);
                          if (notif.jobCardId) {
                            setSelectedJobCardId(notif.jobCardId);
                            // If in mobile mode and clicking a job card, can stay in mobile or web
                          }
                        }}
                        className={`p-3.5 flex items-start gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition relative ${
                          !notif.read ? 'bg-blue-50/40 dark:bg-blue-950/20' : ''
                        }`}
                      >
                        {/* Type Icon */}
                        {getNotificationIcon(notif.type)}

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1 mb-0.5">
                            <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                              {notif.title}
                            </span>
                            <span className="text-[10px] text-slate-400 whitespace-nowrap flex items-center gap-0.5">
                              <Clock className="w-2.5 h-2.5" />
                              {getRelativeTime(notif.timestamp)}
                            </span>
                          </div>

                          <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug line-clamp-2">
                            {notif.message}
                          </p>

                          {notif.jobCardId && (
                            <div className="mt-1.5 flex items-center gap-1 text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400">
                              <span>Trace Ticket</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </div>
                          )}
                        </div>

                        {/* Unread blue dot */}
                        {!notif.read && (
                          <div className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-1"></div>
                        )}
                      </div>
                    ))
                  )}
                </div>

                {/* Footer */}
                <div className="p-2.5 bg-slate-50 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800 text-[10px] text-slate-400 text-center">
                  Live workflow alerts for dispatches, quotes, invoices, and warehouse stock
                </div>
              </div>
            )}
          </div>

          {/* Active User / Role Picker */}
          <div className="relative" ref={userMenuRef}>
            <div
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/80 transition active:scale-95"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-6 h-6 rounded-full object-cover ring-1 ring-blue-500/40"
              />
              <div className="hidden lg:block text-left">
                <div className="font-bold text-slate-800 dark:text-slate-200 leading-tight">
                  {currentUser.name}
                </div>
                <div className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold uppercase">
                  {currentUser.role}
                </div>
              </div>
              <ChevronDown className={`w-3 h-3 text-slate-400 ml-1 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
            </div>

            {/* Role Switcher Menu */}
            {userMenuOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-60 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1">
                  Switch Active Role / User
                </div>
                {users.map(u => (
                  <div
                    key={u.id}
                    onClick={() => {
                      setCurrentUser(u);
                      setUserMenuOpen(false);
                    }}
                    className={`p-2 rounded-xl flex items-center justify-between cursor-pointer transition ${
                      currentUser.id === u.id
                        ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <img src={u.avatar} alt={u.name} className="w-7 h-7 rounded-full object-cover" />
                      <div>
                        <div className="text-xs">{u.name}</div>
                        <div className="text-[10px] text-slate-400">{u.role}</div>
                      </div>
                    </div>
                    {currentUser.id === u.id && <CheckCircle className="w-3.5 h-3.5 text-blue-600" />}
                  </div>
                ))}

                <div className="pt-1.5 mt-1 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      logout();
                    }}
                    className="w-full p-2 text-left text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl flex items-center gap-2 transition"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Reset Demo Data Button */}
          <button
            onClick={() => {
              if (confirm('Reset all demo state to original default database values?')) {
                resetToDefaults();
              }
            }}
            title="Reset to Initial Blueprint Data"
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Direct Sign Out Button */}
          <button
            onClick={logout}
            title="Sign Out of SMAART"
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
