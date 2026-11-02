import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Send,
  Building,
  Smartphone,
  ShieldCheck,
  Check,
  X,
  UserCheck,
  Palmtree,
  CalendarDays,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { LeaveType } from '../types';

export const AttendancePortal: React.FC = () => {
  const {
    currentUser,
    users,
    attendance,
    leaves,
    holidays,
    punchAttendance,
    submitLeaveRequest,
    reviewLeaveRequest,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'ATTENDANCE' | 'LEAVE_REQUESTS' | 'HOLIDAYS'>('ATTENDANCE');

  // Office Circumstance Geofence Simulator
  const [selectedLocationPreset, setSelectedLocationPreset] = useState<{
    label: string;
    locationType: 'OFFICE' | 'FIELD' | 'REMOTE';
    distanceMeters: number;
  }>({
    label: 'Inside Office HQ Desk (15 meters - Geofence Verified)',
    locationType: 'OFFICE',
    distanceMeters: 15,
  });

  const [attendanceNotes, setAttendanceNotes] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  // Leave Form
  const [leaveType, setLeaveType] = useState<LeaveType>('CASUAL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [leaveReason, setLeaveReason] = useState('');

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];
  const userTodayPunch = attendance.find(a => a.userId === currentUser.id && a.date === todayStr);

  const isWithinOffice = selectedLocationPreset.locationType === 'OFFICE' && selectedLocationPreset.distanceMeters <= 100;

  const handlePunch = () => {
    punchAttendance({
      locationType: selectedLocationPreset.locationType,
      distanceFromOfficeMeters: selectedLocationPreset.distanceMeters,
      notes: attendanceNotes || undefined,
    });
    setAttendanceNotes('');
  };

  const handleLeaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate || !leaveReason.trim()) {
      showToast('Please fill all required leave details', 'error');
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const daysCount = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);

    submitLeaveRequest({
      leaveType,
      startDate,
      endDate,
      daysCount,
      reason: leaveReason.trim(),
    });

    setStartDate('');
    setEndDate('');
    setLeaveReason('');
  };

  const isReviewer = currentUser.role === 'ADMIN' || currentUser.role === 'SERVICE_COORDINATOR';

  return (
    <div className="space-y-6">
      {/* Top Banner Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-semibold">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveTab('ATTENDANCE')}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-2 ${
              activeTab === 'ATTENDANCE'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            Office Geofence & Attendance
          </button>

          <button
            onClick={() => setActiveTab('LEAVE_REQUESTS')}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-2 ${
              activeTab === 'LEAVE_REQUESTS'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Palmtree className="w-3.5 h-3.5" />
            Leave & Holiday Requests ({leaves.filter(l => l.status === 'PENDING').length} pending)
          </button>

          <button
            onClick={() => setActiveTab('HOLIDAYS')}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-2 ${
              activeTab === 'HOLIDAYS'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            Official Holiday Calendar ({holidays.length})
          </button>
        </div>

        <div className="text-[11px] text-slate-500 flex items-center gap-1.5 px-3">
          <Building className="w-3.5 h-3.5 text-blue-500" />
          <span>HQ: Plot 104, Tech Park Zone II, Bengaluru (100m Perimeter)</span>
        </div>
      </div>

      {/* TAB 1: ATTENDANCE & OFFICE GEOFENCE */}
      {activeTab === 'ATTENDANCE' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Clock-In Panel */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">Daily Punch-In</h3>
                  <p className="text-[11px] text-slate-400">Office circumstance verification</p>
                </div>
                <span className="font-mono text-base font-black text-blue-600 dark:text-blue-400">
                  {currentTime}
                </span>
              </div>

              {/* Geofence Status Badge */}
              <div
                className={`p-3.5 rounded-2xl border flex items-start gap-3 transition ${
                  isWithinOffice
                    ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100'
                    : 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-100'
                }`}
              >
                <div
                  className={`p-2 rounded-xl shrink-0 ${
                    isWithinOffice ? 'bg-emerald-200 text-emerald-800' : 'bg-amber-200 text-amber-800'
                  }`}
                >
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <div className="font-bold">
                    {isWithinOffice ? 'Within Office Circumstance' : 'Outside Office Perimeter'}
                  </div>
                  <div className="text-[11px] opacity-80 mt-0.5 leading-snug">
                    {isWithinOffice
                      ? `Distance: ${selectedLocationPreset.distanceMeters}m from HQ (Authorized inside 100m geofence radius)`
                      : `Distance: ${selectedLocationPreset.distanceMeters}m from HQ. Marked as Field / Remote.`}
                  </div>
                </div>
              </div>

              {/* Geofence Circumstance Simulator Selector */}
              <div className="space-y-1.5 text-xs">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Simulate Device Geolocation
                </label>
                <select
                  value={selectedLocationPreset.label}
                  onChange={e => {
                    const presets = [
                      {
                        label: 'Inside Office HQ Desk (15 meters - Geofence Verified)',
                        locationType: 'OFFICE' as const,
                        distanceMeters: 15,
                      },
                      {
                        label: 'Office Campus Gate / Parking (45 meters - Geofence Verified)',
                        locationType: 'OFFICE' as const,
                        distanceMeters: 45,
                      },
                      {
                        label: 'Client Site Breakdown (3.8 km away - On Duty Field)',
                        locationType: 'FIELD' as const,
                        distanceMeters: 3800,
                      },
                      {
                        label: 'Remote / Work From Home (14.2 km away - Remote)',
                        locationType: 'REMOTE' as const,
                        distanceMeters: 14200,
                      },
                    ];
                    const found = presets.find(p => p.label === e.target.value);
                    if (found) setSelectedLocationPreset(found);
                  }}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 font-medium"
                >
                  <option value="Inside Office HQ Desk (15 meters - Geofence Verified)">
                    Inside Office HQ Desk (15m - Verified Geofence)
                  </option>
                  <option value="Office Campus Gate / Parking (45 meters - Geofence Verified)">
                    Office Campus Gate / Parking (45m - Verified Geofence)
                  </option>
                  <option value="Client Site Breakdown (3.8 km away - On Duty Field)">
                    Client Breakdown Site (3.8km - On Duty Field)
                  </option>
                  <option value="Remote / Work From Home (14.2 km away - Remote)">
                    Remote / Work From Home (14.2km)
                  </option>
                </select>
              </div>

              {/* Remarks input */}
              <div className="text-xs">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Optional Punch Notes / Work Order Ref
                </label>
                <input
                  type="text"
                  value={attendanceNotes}
                  onChange={e => setAttendanceNotes(e.target.value)}
                  placeholder="e.g. Dispatched to Chakan site or morning shift"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5"
                />
              </div>

              {/* Punch In CTA */}
              <button
                onClick={handlePunch}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition"
              >
                <CheckCircle2 className="w-4 h-4" />
                {userTodayPunch ? 'Punch Again (Update In/Out)' : 'Clock In / Punch Attendance'}
              </button>

              {userTodayPunch && (
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-[11px] text-slate-600 dark:text-slate-300 space-y-0.5">
                  <div className="font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Punched in today at {userTodayPunch.punchInTime}
                  </div>
                  <div>Status: {userTodayPunch.status} • Location: {userTodayPunch.locationType}</div>
                </div>
              )}
            </div>

            {/* Attendance Rules & Office Perimeter Map Illustration */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  Office Circumstance Policy & Geofence Architecture
                </h3>
                <span className="text-[11px] font-mono text-slate-400">Bangalore HQ Tech Park</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 rounded-2xl space-y-1">
                  <div className="font-bold text-blue-900 dark:text-blue-300">Office Circumstance</div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Staff must clock in within the 100m geofence perimeter around Plot 104 to receive automated PRESENT verification.
                  </p>
                </div>
                <div className="p-3 bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/40 rounded-2xl space-y-1">
                  <div className="font-bold text-purple-900 dark:text-purple-300">Field Service Engineers</div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Engineers outside office premises on customer breakdowns can punch via Mobile App with auto-tagged ON_DUTY_FIELD.
                  </p>
                </div>
                <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 rounded-2xl space-y-1">
                  <div className="font-bold text-emerald-900 dark:text-emerald-300">Leave Quota</div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    12 Casual Leaves, 10 Sick Leaves, and 18 Earned Leaves per year. Requests require Coordinator or Admin approval.
                  </p>
                </div>
              </div>

              {/* Today's Punch Summary */}
              <div className="pt-2">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Today's Staff Clock-In Log ({attendance.length} records)
                </h4>
                <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden max-h-56 overflow-y-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200 dark:border-slate-700">
                      <tr>
                        <th className="p-2.5">Staff</th>
                        <th className="p-2.5">Role</th>
                        <th className="p-2.5">Punch Time</th>
                        <th className="p-2.5">Location</th>
                        <th className="p-2.5 text-center">Circumstance</th>
                        <th className="p-2.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {attendance.map(a => (
                        <tr key={a.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/60">
                          <td className="p-2.5 font-bold text-slate-900 dark:text-white">{a.userName}</td>
                          <td className="p-2.5 text-slate-500 text-[11px]">{a.userRole}</td>
                          <td className="p-2.5 font-mono text-[11px]">{a.punchInTime}</td>
                          <td className="p-2.5 text-slate-600 dark:text-slate-300">
                            {a.locationType} ({a.distanceFromOfficeMeters}m)
                          </td>
                          <td className="p-2.5 text-center">
                            {a.geofenceVerified ? (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                In Office
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                                Field/Ext
                              </span>
                            )}
                          </td>
                          <td className="p-2.5 font-semibold text-[11px]">
                            <span
                              className={`px-2 py-0.5 rounded ${
                                a.status === 'PRESENT'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : 'bg-blue-50 text-blue-700'
                              }`}
                            >
                              {a.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LEAVE & HOLIDAY REQUESTS */}
      {activeTab === 'LEAVE_REQUESTS' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Submit Leave Request Form */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Apply for Leave / Absence</h3>
              <p className="text-[11px] text-slate-400">Formal request to Service Head & HR</p>
            </div>

            <form onSubmit={handleLeaveSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Leave Category
                </label>
                <select
                  value={leaveType}
                  onChange={e => setLeaveType(e.target.value as LeaveType)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 font-semibold text-blue-600"
                >
                  <option value="CASUAL">Casual Leave (Personal / Urgent)</option>
                  <option value="SICK">Medical / Sick Leave</option>
                  <option value="EARNED">Earned Privilege Vacation</option>
                  <option value="COMP_OFF">Compensatory Off (Weekend Dispatch)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Reason for Absence
                </label>
                <textarea
                  rows={3}
                  required
                  value={leaveReason}
                  onChange={e => setLeaveReason(e.target.value)}
                  placeholder="Provide background, emergency details, or hand-over notes..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 flex items-center justify-center gap-1.5 transition"
              >
                <Send className="w-3.5 h-3.5" />
                Submit Application
              </button>
            </form>
          </div>

          {/* Leave Requests Table & Admin Review */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Staff Leave Applications</h3>
                <p className="text-[11px] text-slate-400">
                  {isReviewer ? 'Review and approve/reject staff requests' : 'Your submitted applications status'}
                </p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 font-bold text-slate-600">
                {leaves.length} Applications Total
              </span>
            </div>

            <div className="space-y-3">
              {leaves.map(l => (
                <div
                  key={l.id}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2 text-xs"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                        {l.userName}
                        <span className="text-[10px] font-semibold text-slate-400">({l.userRole})</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold">
                          {l.leaveType}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Duration: {l.startDate} to {l.endDate} ({l.daysCount} days)
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        l.status === 'APPROVED'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : l.status === 'REJECTED'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                      }`}
                    >
                      {l.status}
                    </span>
                  </div>

                  <p className="p-2.5 bg-white dark:bg-slate-900 rounded-xl text-slate-700 dark:text-slate-300">
                    "{l.reason}"
                  </p>

                  {/* Review Actions if Admin or Coordinator */}
                  {l.status === 'PENDING' && isReviewer && (
                    <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
                      <button
                        onClick={() => {
                          const note = prompt('Rejection reason (optional):') || undefined;
                          reviewLeaveRequest(l.id, 'REJECTED', note);
                        }}
                        className="px-3 py-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl font-bold flex items-center gap-1"
                      >
                        <X className="w-3.5 h-3.5" /> Reject
                      </button>
                      <button
                        onClick={() => {
                          const note = prompt('Approval remarks (optional):', 'Approved as per company quota') || undefined;
                          reviewLeaveRequest(l.id, 'APPROVED', note);
                        }}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-1 shadow-sm"
                      >
                        <Check className="w-3.5 h-3.5" /> Approve Leave
                      </button>
                    </div>
                  )}

                  {l.reviewedByName && (
                    <div className="text-[10px] text-slate-400 pt-1">
                      Reviewed by {l.reviewedByName} at {new Date(l.reviewedAt || '').toLocaleDateString()}
                      {l.reviewNotes && ` — "${l.reviewNotes}"`}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: COMPANY HOLIDAY CALENDAR */}
      {activeTab === 'HOLIDAYS' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Company Holiday Calendar (2026 - 2027)</h3>
              <p className="text-xs text-slate-400">Standard paid public & festival holidays for SMAART offices</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 text-xs font-bold">
              All Branches
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {holidays.map(h => (
              <div
                key={h.id}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {h.type} HOLIDAY
                  </span>
                  <span className="text-xs font-mono font-bold text-blue-600">{h.day}</span>
                </div>
                <div className="font-bold text-sm text-slate-900 dark:text-white">{h.name}</div>
                <div className="text-xs text-slate-500 font-mono">{h.date}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
