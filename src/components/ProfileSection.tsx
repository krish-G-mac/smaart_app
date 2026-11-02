import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  User,
  Clock,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  MapPin,
  Shield,
  Smartphone,
  Sun,
  Moon,
  Laptop,
  Bell,
  LogOut,
  RotateCcw,
  Send,
  CalendarDays,
  Palmtree,
  Sliders,
  Check,
  ChevronRight,
  TrendingUp,
  Award,
  Layers,
  Sparkles,
} from 'lucide-react';
import { LeaveType, UserRole } from '../types';

export const ProfileSection: React.FC = () => {
  const {
    currentUser,
    setCurrentUser,
    users,
    attendance,
    leaves,
    holidays,
    punchAttendance,
    submitLeaveRequest,
    reviewLeaveRequest,
    showToast,
    theme,
    setTheme,
    toggleTheme,
    isDarkMode,
    viewMode,
    setViewMode,
    logout,
    resetToDefaults,
  } = useApp();

  // Active sub-tab inside Profile: 'PUNCH' | 'LEAVES' | 'SETTINGS'
  const [profileSubTab, setProfileSubTab] = useState<'PUNCH' | 'LEAVES' | 'SETTINGS'>('PUNCH');

  // Real-time Clock
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Office Circumstance Geofence Simulator Preset
  const [locationPreset, setLocationPreset] = useState<{
    label: string;
    locationType: 'OFFICE' | 'FIELD' | 'REMOTE';
    distanceMeters: number;
    description: string;
  }>({
    label: 'Office HQ Desk (15m)',
    locationType: 'OFFICE',
    distanceMeters: 15,
    description: 'Inside verified office radius (< 100m)',
  });

  const [punchNote, setPunchNote] = useState('');

  // Today's record for current user
  const todayStr = new Date().toISOString().split('T')[0];
  const userTodayPunch = attendance.find(a => a.userId === currentUser.id && a.date === todayStr);

  // Live shift timer calculation
  const [shiftDuration, setShiftDuration] = useState<string>('');
  useEffect(() => {
    if (!userTodayPunch?.punchInTime) {
      setShiftDuration('');
      return;
    }

    const updateDuration = () => {
      try {
        const [hours, minutes, seconds] = userTodayPunch.punchInTime.split(':').map(Number);
        const punchInDate = new Date();
        punchInDate.setHours(hours, minutes, seconds || 0, 0);

        const now = new Date();
        let diffMs = now.getTime() - punchInDate.getTime();
        if (diffMs < 0) diffMs = 0;

        const totalSec = Math.floor(diffMs / 1000);
        const h = Math.floor(totalSec / 3600);
        const m = Math.floor((totalSec % 3600) / 60);
        const s = totalSec % 60;
        setShiftDuration(`${h}h ${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`);
      } catch {
        setShiftDuration('Active');
      }
    };

    updateDuration();
    const interval = setInterval(updateDuration, 1000);
    return () => clearInterval(interval);
  }, [userTodayPunch?.punchInTime]);

  const handlePunch = () => {
    punchAttendance({
      locationType: locationPreset.locationType,
      distanceFromOfficeMeters: locationPreset.distanceMeters,
      notes: punchNote || undefined,
    });
    setPunchNote('');
  };

  // Leave Form States
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveType, setLeaveType] = useState<LeaveType>('CASUAL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [leaveReason, setLeaveReason] = useState('');

  const calculatedDays = React.useMemo(() => {
    if (!startDate || !endDate) return 1;
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) return 1;
    const diff = Math.abs(end.getTime() - start.getTime());
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1);
  }, [startDate, endDate]);

  const handleLeaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate || !leaveReason.trim()) {
      showToast('Please fill all leave application details', 'error');
      return;
    }
    submitLeaveRequest({
      leaveType,
      startDate,
      endDate,
      daysCount: calculatedDays,
      reason: leaveReason.trim(),
    });
    setStartDate('');
    setEndDate('');
    setLeaveReason('');
    setShowLeaveModal(false);
  };

  // Current Month working days metrics
  const currentMonthName = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
  const totalWorkingDaysInMonth = 26; // Standard 26 workdays
  const userMonthAttendance = attendance.filter(
    a => a.userId === currentUser.id && a.date.startsWith(todayStr.slice(0, 7))
  );
  const daysPresent = userMonthAttendance.length > 0 ? userMonthAttendance.length : 19;
  const daysLeavesTaken = 2;
  const companyHolidaysCount = holidays.length;
  const attendancePercentage = Math.round((daysPresent / totalWorkingDaysInMonth) * 100);

  // Leave balances
  const leaveBalances = [
    { type: 'Casual Leave (CL)', available: 6, total: 12, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900' },
    { type: 'Sick Leave (SL)', available: 8, total: 10, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900' },
    { type: 'Earned Leave (EL)', available: 14, total: 18, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-900' },
    { type: 'Comp-Off (CO)', available: 1, total: 2, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900' },
  ];

  // User notifications preference state
  const [prefJobAlerts, setPrefJobAlerts] = useState(true);
  const [prefQuoteAlerts, setPrefQuoteAlerts] = useState(true);
  const [prefShiftReminders, setPrefShiftReminders] = useState(true);
  const [prefHapticSounds, setPrefHapticSounds] = useState(true);

  return (
    <div className="space-y-4 pb-2">
      {/* 1. TOP PROFILE HERO CARD */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden transition">
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 w-44 h-44 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 dark:from-blue-500/20 dark:to-purple-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            {/* Avatar */}
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-2xl shadow-md shadow-blue-500/20">
                {currentUser.name.charAt(0)}
              </div>
              {/* Online/Punch indicator */}
              <span
                className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 ${
                  userTodayPunch?.punchInTime && !userTodayPunch?.punchOutTime
                    ? 'bg-emerald-500 animate-pulse'
                    : 'bg-slate-400'
                }`}
                title={userTodayPunch?.punchInTime ? 'Active Shift' : 'Off-Duty'}
              />
            </div>

            {/* User Meta */}
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-900 dark:text-white leading-tight">
                  {currentUser.name}
                </h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  {currentUser.role.replace('_', ' ')}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{currentUser.email}</p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 flex items-center gap-1">
                <span>📱 {currentUser.phone || '+91 98450 12345'}</span>
                <span>•</span>
                <span>📍 SMAART Tech Depot</span>
              </p>
            </div>
          </div>

          {/* Quick Shift Status Pill */}
          <div className="flex items-center gap-2 self-start sm:self-center">
            {userTodayPunch?.punchInTime ? (
              <div className="px-3.5 py-2 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <div className="text-left">
                  <p className="text-[10px] font-bold uppercase tracking-wider">Clocked In</p>
                  <p className="text-xs font-black">{userTodayPunch.punchInTime} {userTodayPunch.punchOutTime ? `→ ${userTodayPunch.punchOutTime}` : ''}</p>
                </div>
              </div>
            ) : (
              <div className="px-3.5 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                <div className="text-left">
                  <p className="text-[10px] font-bold uppercase tracking-wider">Shift Status</p>
                  <p className="text-xs font-bold">Not Clocked In Today</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 2. THREE PROFILE SECTIONS SUB-NAV (Punch Attendance | Working Days & Leaves | User Settings) */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl mt-5 border border-slate-200 dark:border-slate-700/60 text-xs font-bold">
          <button
            onClick={() => setProfileSubTab('PUNCH')}
            className={`py-2.5 px-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
              profileSubTab === 'PUNCH'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Clock className="w-4 h-4 shrink-0" />
            <span className="truncate">Punch Attendance</span>
          </button>

          <button
            onClick={() => setProfileSubTab('LEAVES')}
            className={`py-2.5 px-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
              profileSubTab === 'LEAVES'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Calendar className="w-4 h-4 shrink-0" />
            <span className="truncate">Working Days & Leaves</span>
          </button>

          <button
            onClick={() => setProfileSubTab('SETTINGS')}
            className={`py-2.5 px-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
              profileSubTab === 'SETTINGS'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Sliders className="w-4 h-4 shrink-0" />
            <span className="truncate">User Settings</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: PUNCH ATTENDANCE                                               */}
      {/* ========================================================================= */}
      {profileSubTab === 'PUNCH' && (
        <div className="space-y-4">
          {/* Big Live Digital Clock & Shift Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-5 shadow-lg border border-slate-700 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-slate-300 text-xs font-semibold">
                  <Calendar className="w-3.5 h-3.5 text-blue-400" />
                  <span>
                    {new Date().toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                {/* Digital Clock Display */}
                <div className="text-3xl sm:text-4xl font-mono font-black text-white tracking-wider mt-1 flex items-baseline gap-2">
                  <span>{currentTime}</span>
                  <span className="text-xs font-sans text-blue-400 font-bold uppercase tracking-widest px-2 py-0.5 rounded-md bg-blue-950/80 border border-blue-800">
                    IST Live
                  </span>
                </div>
              </div>

              {/* Current Shift Duration badge */}
              {userTodayPunch?.punchInTime && !userTodayPunch?.punchOutTime && (
                <div className="bg-emerald-950/80 border border-emerald-700/80 px-4 py-2.5 rounded-2xl flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                  <div>
                    <span className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider block">
                      Active Shift Running
                    </span>
                    <span className="text-sm font-mono font-black text-emerald-100">
                      {shiftDuration || '00:00:00'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Today's Punch Timeline Strip */}
            <div className="mt-5 pt-4 border-t border-slate-700/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Punch In</span>
                <span className="font-mono font-bold text-slate-100 text-sm">
                  {userTodayPunch?.punchInTime || '--:--'}
                </span>
              </div>
              <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Punch Out</span>
                <span className="font-mono font-bold text-slate-100 text-sm">
                  {userTodayPunch?.punchOutTime || '--:--'}
                </span>
              </div>
              <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Geofence Status</span>
                <span className="font-bold text-emerald-400 text-xs flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  {userTodayPunch ? 'Verified Inside' : 'Ready'}
                </span>
              </div>
              <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Status</span>
                <span className="font-bold text-blue-400 text-xs">
                  {userTodayPunch?.status || 'PENDING'}
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Attendance Action Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              Office Circumstance & Geofence Verification
            </h3>

            {/* Circumstance selector */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {[
                {
                  label: 'Inside Office HQ Desk (15m)',
                  locationType: 'OFFICE' as const,
                  distanceMeters: 15,
                  desc: 'Within 100m Geofence',
                  verified: true,
                },
                {
                  label: 'Client Field Site (5.4 km)',
                  locationType: 'FIELD' as const,
                  distanceMeters: 5400,
                  desc: 'Field Service Dispatch',
                  verified: true,
                },
                {
                  label: 'Work From Home / Remote',
                  locationType: 'REMOTE' as const,
                  distanceMeters: 12000,
                  desc: 'Remote Approval Required',
                  verified: false,
                },
              ].map((opt, i) => {
                const isSelected =
                  locationPreset.locationType === opt.locationType &&
                  locationPreset.distanceMeters === opt.distanceMeters;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() =>
                      setLocationPreset({
                        label: opt.label,
                        locationType: opt.locationType,
                        distanceMeters: opt.distanceMeters,
                        description: opt.desc,
                      })
                    }
                    className={`p-3 rounded-2xl text-left border transition relative ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs">{opt.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-blue-600" />}
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">{opt.desc}</p>
                    {opt.verified ? (
                      <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                        <CheckCircle2 className="w-2.5 h-2.5" /> Geofence Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[9px] font-bold text-amber-600 dark:text-amber-400 mt-1">
                        <AlertTriangle className="w-2.5 h-2.5" /> Remote Geotag
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Note input */}
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                Punch Note (Optional)
              </label>
              <input
                type="text"
                value={punchNote}
                onChange={e => setPunchNote(e.target.value)}
                placeholder="e.g. Arrived at Whitefield depot desk / Client site inspection"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Primary Tap Punch Button */}
            <button
              onClick={handlePunch}
              className={`w-full py-4 px-6 rounded-2xl font-black text-sm tracking-wide text-white shadow-lg transition active:scale-[0.98] flex items-center justify-center gap-3 ${
                userTodayPunch?.punchInTime && !userTodayPunch?.punchOutTime
                  ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30'
                  : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
              }`}
            >
              <Clock className="w-5 h-5" />
              <span>
                {userTodayPunch?.punchInTime && !userTodayPunch?.punchOutTime
                  ? 'Clock Out / Punch Out (End Shift)'
                  : userTodayPunch?.punchOutTime
                  ? 'Shift Completed • Re-Punch Out'
                  : 'Clock In / Punch In (Start Shift)'}
              </span>
            </button>
          </div>

          {/* Recent Attendance History */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center justify-between">
              <span>Recent Attendance Logs</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                This Month ({userMonthAttendance.length} records)
              </span>
            </h3>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {attendance
                .filter(a => a.userId === currentUser.id)
                .slice(0, 5)
                .map(record => (
                  <div key={record.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-200">{record.date}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        In: <span className="font-mono font-semibold">{record.punchInTime}</span>
                        {record.punchOutTime && (
                          <span> • Out: <span className="font-mono font-semibold">{record.punchOutTime}</span></span>
                        )}
                        {record.notes && <span> ({record.notes})</span>}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                        {record.status}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {record.locationType}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: WORKING DAYS & LEAVE SUMMARY                                   */}
      {/* ========================================================================= */}
      {profileSubTab === 'LEAVES' && (
        <div className="space-y-4">
          {/* Monthly Working Days Progress Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 tracking-wider">
                  Working Days Summary
                </span>
                <h3 className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                  {currentMonthName} Working Days
                </h3>
              </div>
              <button
                onClick={() => setShowLeaveModal(true)}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition"
              >
                <Palmtree className="w-3.5 h-3.5" />
                <span>Apply Leave</span>
              </button>
            </div>

            {/* Grid of Key Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200/70 dark:border-slate-700/60">
                <span className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase block">
                  Total Working Days
                </span>
                <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">
                  {totalWorkingDaysInMonth}
                </span>
                <span className="text-[10px] text-slate-400">Standard working days</span>
              </div>

              <div className="bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-2xl border border-emerald-200/70 dark:border-emerald-900/60">
                <span className="text-emerald-700 dark:text-emerald-400 text-[10px] font-bold uppercase block">
                  Days Present
                </span>
                <span className="text-2xl font-black text-emerald-700 dark:text-emerald-300 mt-1 block">
                  {daysPresent}
                </span>
                <span className="text-[10px] text-emerald-600/80 dark:text-emerald-400">
                  Punch verified
                </span>
              </div>

              <div className="bg-amber-50 dark:bg-amber-950/40 p-3 rounded-2xl border border-amber-200/70 dark:border-amber-900/60">
                <span className="text-amber-700 dark:text-amber-400 text-[10px] font-bold uppercase block">
                  Leaves Taken
                </span>
                <span className="text-2xl font-black text-amber-700 dark:text-amber-300 mt-1 block">
                  {daysLeavesTaken}
                </span>
                <span className="text-[10px] text-amber-600/80 dark:text-amber-400">
                  Approved leaves
                </span>
              </div>

              <div className="bg-purple-50 dark:bg-purple-950/40 p-3 rounded-2xl border border-purple-200/70 dark:border-purple-900/60">
                <span className="text-purple-700 dark:text-purple-400 text-[10px] font-bold uppercase block">
                  Paid Holidays
                </span>
                <span className="text-2xl font-black text-purple-700 dark:text-purple-300 mt-1 block">
                  {companyHolidaysCount}
                </span>
                <span className="text-[10px] text-purple-600/80 dark:text-purple-400">
                  Official holidays
                </span>
              </div>
            </div>

            {/* Visual Attendance Ratio Bar */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                <span className="text-slate-600 dark:text-slate-400">Attendance Compliance Rate</span>
                <span className="text-blue-600 dark:text-blue-400 font-black">{attendancePercentage}%</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, attendancePercentage)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Leave Balances Grid */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center justify-between">
              <span>Annual Leave Balances</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">Cycle: Jan - Dec 2026</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {leaveBalances.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-2xl border ${item.bg} flex flex-col justify-between`}
                >
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 leading-tight">
                    {item.type}
                  </span>
                  <div className="mt-2">
                    <span className={`text-2xl font-black ${item.color}`}>
                      {item.available}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                      {' '}/ {item.total} days
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Leave History List */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center justify-between">
              <span>My Leave Requests & History</span>
              <span className="text-xs text-slate-400">{leaves.length} records</span>
            </h3>

            <div className="space-y-2">
              {leaves.map(req => {
                const isUser = req.userId === currentUser.id;
                return (
                  <div
                    key={req.id}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-slate-100">
                          {req.leaveType} Leave ({req.daysCount} {req.daysCount === 1 ? 'day' : 'days'})
                        </span>
                        {isUser && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold">
                            You
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {req.startDate} to {req.endDate} • &quot;{req.reason}&quot;
                      </p>
                      {req.reviewNotes && (
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 italic mt-0.5">
                          Note: {req.reviewNotes}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-center">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                          req.status === 'APPROVED'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : req.status === 'REJECTED'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                        }`}
                      >
                        {req.status}
                      </span>

                      {/* Coordinator / Admin Review Action if pending */}
                      {(currentUser.role === 'ADMIN' || currentUser.role === 'SERVICE_COORDINATOR') &&
                        req.status === 'PENDING' && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => reviewLeaveRequest(req.id, 'APPROVED', 'Approved by supervisor')}
                              className="p-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500"
                              title="Approve Leave"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => reviewLeaveRequest(req.id, 'REJECTED', 'Duty coverage required')}
                              className="p-1 rounded-lg bg-rose-600 text-white hover:bg-rose-500"
                              title="Reject Leave"
                            >
                              <XCircle className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Company Upcoming Holidays List */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-purple-600" />
              Company Holidays & Gazette Calendar
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {holidays.map(holiday => (
                <div
                  key={holiday.id}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/50 flex items-center justify-between text-xs"
                >
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-200">{holiday.name}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {holiday.date} • {holiday.day}
                    </p>
                  </div>
                  <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300">
                    {holiday.type}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 3: USER SETTINGS                                                  */}
      {/* ========================================================================= */}
      {profileSubTab === 'SETTINGS' && (
        <div className="space-y-4">
          {/* Theme Settings (White / Dark / System) */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Sun className="w-4 h-4 text-amber-500" />
              Appearance & Theme Mode
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Customize the interface look for bright daytime office use or low-light field inspections.
            </p>

            <div className="grid grid-cols-3 gap-2.5 pt-1">
              {/* White Theme */}
              <button
                onClick={() => setTheme('light')}
                className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 ${
                  !isDarkMode
                    ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100 ring-2 ring-blue-500/20'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-white border border-slate-300 flex items-center justify-center shadow-xs">
                  <Sun className="w-4 h-4 text-amber-500" />
                </div>
                <span className="text-xs font-bold">White Theme</span>
                <span className="text-[10px] text-slate-400">Crisp & Clean</span>
              </button>

              {/* Dark Theme */}
              <button
                onClick={() => setTheme('dark')}
                className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 ${
                  isDarkMode
                    ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100 ring-2 ring-blue-500/20'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center shadow-xs">
                  <Moon className="w-4 h-4 text-blue-400" />
                </div>
                <span className="text-xs font-bold">Dark Theme</span>
                <span className="text-[10px] text-slate-400">OLED Sleek</span>
              </button>

              {/* System */}
              <button
                onClick={() => setTheme('system')}
                className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 ${
                  theme === 'system'
                    ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100 ring-2 ring-blue-500/20'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center shadow-xs">
                  <Laptop className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                </div>
                <span className="text-xs font-bold">System Default</span>
                <span className="text-[10px] text-slate-400">Auto match OS</span>
              </button>
            </div>
          </div>

          {/* Quick Demo Switch Role (Admin, Sales, Service Coordinator, Engineer) */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-600" />
              Active Role Switcher (Live Demo Access)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Instantly toggle between organizational roles to test role-based permissions and workflows.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {users.map(u => {
                const isSelected = u.id === currentUser.id;
                return (
                  <button
                    key={u.id}
                    onClick={() => {
                      setCurrentUser(u);
                      showToast(`Switched user to ${u.name} (${u.role})`, 'info');
                    }}
                    className={`p-3 rounded-2xl border text-left transition flex items-center justify-between ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/40 dark:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-xs text-slate-900 dark:text-slate-100">{u.name}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">{u.role}</p>
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-blue-600" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Bell className="w-4 h-4 text-indigo-500" />
              Notifications & Sound Feedback
            </h3>

            <div className="space-y-2.5 text-xs">
              <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 cursor-pointer">
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">
                    Job Assignment Alerts
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    Real-time bell notification on engineer assignment
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={prefJobAlerts}
                  onChange={e => setPrefJobAlerts(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 cursor-pointer">
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">
                    Quotation & PO Approvals
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    Alerts on client approval & stock readiness
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={prefQuoteAlerts}
                  onChange={e => setPrefQuoteAlerts(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 cursor-pointer">
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">
                    Shift & Geofence Reminder
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    Prompt to punch out when leaving office circumstance
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={prefShiftReminders}
                  onChange={e => setPrefShiftReminders(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
              </label>
            </div>
          </div>

          {/* Account Actions (Reset & Logout) */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
            <h3 className="text-sm font-black text-slate-900 dark:text-white">Account & Data Actions</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                onClick={resetToDefaults}
                className="py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition"
              >
                <RotateCcw className="w-4 h-4 text-amber-500" />
                <span>Reset Demo State</span>
              </button>

              <button
                onClick={logout}
                className="py-3 px-4 rounded-2xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center justify-center gap-2 transition"
              >
                <LogOut className="w-4 h-4 text-rose-600" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* APPLY LEAVE MODAL / DRAWER                                                */}
      {/* ========================================================================= */}
      {showLeaveModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-black text-slate-900 dark:text-white text-base flex items-center gap-2">
                <Palmtree className="w-5 h-5 text-blue-600" />
                Apply for Leave
              </h3>
              <button
                onClick={() => setShowLeaveModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleLeaveSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Leave Type
                </label>
                <select
                  value={leaveType}
                  onChange={e => setLeaveType(e.target.value as LeaveType)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="CASUAL">Casual Leave (CL - 6 days avail)</option>
                  <option value="SICK">Sick / Medical Leave (SL - 8 days avail)</option>
                  <option value="EARNED">Earned / Privilege Leave (EL - 14 days avail)</option>
                  <option value="COMP_OFF">Compensatory Off (CO - 1 day avail)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    From Date
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    To Date
                  </label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950/40 p-2.5 rounded-xl border border-blue-200 dark:border-blue-900 text-blue-900 dark:text-blue-200 font-bold text-[11px] flex items-center justify-between">
                <span>Requested Duration:</span>
                <span className="text-sm font-black">{calculatedDays} {calculatedDays === 1 ? 'Working Day' : 'Working Days'}</span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Reason for Leave
                </label>
                <textarea
                  required
                  rows={3}
                  value={leaveReason}
                  onChange={e => setLeaveReason(e.target.value)}
                  placeholder="e.g. Family medical emergency / Personal travel..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLeaveModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-md shadow-blue-500/20"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
