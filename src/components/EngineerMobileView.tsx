import React, { useRef, useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { JobCard, JobRequirement, InspectionReport } from '../types';
import {
  Smartphone,
  Wifi,
  WifiOff,
  CheckCircle,
  AlertCircle,
  Camera,
  PenTool,
  Search,
  Plus,
  Trash2,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Wrench,
  ChevronRight,
  ArrowLeft,
  RefreshCw,
  Sliders,
  Check,
  ShieldAlert,
  Map as MapIcon,
  Navigation,
  ExternalLink,
  Compass,
  Maximize2,
  X,
  Laptop,
  Tablet,
  LayoutGrid,
  Layers,
  Sparkles,
  Zap,
  Activity,
  Battery,
  Signal,
  CheckCircle2,
  FileText,
  SlidersHorizontal,
  ChevronLeft,
  Sun,
  Moon,
  Ticket,
  User,
  UserCheck,
  Palmtree,
  MoreVertical,
  Square,
  Circle,
  FolderDown,
  Radio,
} from 'lucide-react';
import { EngineerJobSitesMap, DEFAULT_ENGINEER_COORDS } from './EngineerJobSitesMap';
import { ProfileSection } from './ProfileSection';
import { DownloadSetupModal } from './DownloadSetupModal';

export type FieldUILayoutMode = 'PHONE' | 'SPLIT' | 'RADAR' | 'TABLET';

export const EngineerMobileView: React.FC = () => {
  const {
    currentUser,
    setCurrentUser,
    users,
    jobCards,
    customers,
    items,
    requirements,
    submitInspectionReport,
    attendance,
    punchAttendance,
    showToast,
    theme,
    isDarkMode,
    setTheme,
    toggleTheme,
  } = useApp();

  // Layout mode state (persisted)
  const [layoutMode, setLayoutMode] = useState<FieldUILayoutMode>(() => {
    return (localStorage.getItem('smaart_field_layout') as FieldUILayoutMode) || 'SPLIT';
  });

  const handleSelectLayout = (mode: FieldUILayoutMode) => {
    setLayoutMode(mode);
    localStorage.setItem('smaart_field_layout', mode);
  };

  const [isOffline, setIsOffline] = useState(false);
  const [offlineQueue, setOfflineQueue] = useState<any[]>([]);
  const [selectedMobileJobId, setSelectedMobileJobId] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState<'LIST' | 'MAP'>('LIST');
  const [mobileBottomTab, setMobileBottomTab] = useState<'TICKETS' | 'MAP' | 'PROFILE'>('TICKETS');
  const [selectedMapJobId, setSelectedMapJobId] = useState<string | null>(null);
  const [showFullscreenMapModal, setShowFullscreenMapModal] = useState(false);
  const [radarSidebarOpen, setRadarSidebarOpen] = useState(true);

  // Android Shell Specific States
  const [androidNavStyle, setAndroidNavStyle] = useState<'GESTURE' | 'BUTTONS'>('BUTTONS');
  const [androidMenuOpen, setAndroidMenuOpen] = useState(false);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [showRecentsDrawer, setShowRecentsDrawer] = useState(false);
  const [androidTime, setAndroidTime] = useState(() =>
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setAndroidTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  // Today's punch status for mobile active indicator
  const todayStr = new Date().toISOString().split('T')[0];
  const userTodayPunch = attendance.find(a => a.userId === currentUser.id && a.date === todayStr);
  const isClockedIn = !!(userTodayPunch?.punchInTime && !userTodayPunch?.punchOutTime);

  // Inspection form state
  const [equipmentModel, setEquipmentModel] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [findings, setFindings] = useState('');
  const [technicianNotes, setTechnicianNotes] = useState('');
  const [isServiceOnly, setIsServiceOnly] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);

  // Parts list
  const [catalogSearch, setCatalogSearch] = useState('');
  const [selectedParts, setSelectedParts] = useState<
    { itemId?: string; customItemName?: string; quantity: number; isServiceCharge: boolean; rate: number }[]
  >([]);

  // Standard labor tasks
  const standardLaborOptions = [
    { name: 'Standard Field Inspection & Diagnostic Labor', rate: 2500 },
    { name: 'Precision Optical / Laser Beam Calibration', rate: 8500 },
    { name: 'Complete Hydraulic Spool Valve Overhaul & Seal Fitting', rate: 6500 },
    { name: 'Emergency Breakdown Emergency Service', rate: 4500 },
    { name: 'Chamber Cleaning & Chemical Flush', rate: 3000 },
  ];

  // Quick diagnostic symptom presets
  const diagnosticPresets = [
    { label: 'Bearing Vibration', text: 'Excessive high-frequency vibration detected at drive end. Bearing wear suspected.' },
    { label: 'Hydraulic Leak', text: 'Hydraulic pressure drop observed at spool valve manifold. Seal degradation present.' },
    { label: 'Optical Misalignment', text: 'Laser beam focus deviated by 1.8mm. Demands precision prism recalibration.' },
    { label: 'Thermal Overheating', text: 'Main stator winding temperature exceeded 85°C. Cooling fan failure identified.' },
    { label: 'Routine Calibration', text: 'Annual preventative maintenance inspection completed. Sensors aligned within ±0.2% tolerance.' },
  ];

  // Signature Canvas
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  // Pre-load current engineer or first available engineer
  const engineers = users.filter(u => u.role === 'ENGINEER');
  const activeEngineer = currentUser.role === 'ENGINEER' ? currentUser : engineers[0] || currentUser;

  // Filter jobs assigned to active engineer
  const myAssignedJobs = jobCards.filter(j => j.assignedEngineerId === activeEngineer.id);

  const selectedJob = jobCards.find(j => j.id === selectedMobileJobId);
  const customer = selectedJob ? customers.find(c => c.id === selectedJob.customerId) : null;

  // Initialize form when selecting a job
  useEffect(() => {
    if (selectedJob) {
      if (selectedJob.inspectionReport) {
        setEquipmentModel(selectedJob.inspectionReport.equipmentModel || '');
        setSerialNumber(selectedJob.inspectionReport.serialNumber || '');
        setFindings(selectedJob.inspectionReport.findings || '');
        setTechnicianNotes(selectedJob.inspectionReport.technicianNotes || '');
        setIsServiceOnly(selectedJob.inspectionReport.serviceOnly || false);
        setPhotos(selectedJob.inspectionReport.inspectionPhotos || []);
      } else {
        setEquipmentModel('');
        setSerialNumber('');
        setFindings('');
        setTechnicianNotes('');
        setIsServiceOnly(false);
        setPhotos([]);
      }

      // Load existing requirements
      const existingReqs = requirements
        .filter(r => r.jobCardId === selectedJob.id)
        .map(r => ({
          itemId: r.itemId,
          customItemName: r.customItemName,
          quantity: r.quantity,
          isServiceCharge: r.isServiceCharge,
          rate: r.rate,
        }));

      if (existingReqs.length > 0) {
        setSelectedParts(existingReqs);
      } else {
        setSelectedParts([
          {
            customItemName: 'Standard Diagnostic & On-Site Labor',
            quantity: 1,
            isServiceCharge: true,
            rate: 2500,
          },
        ]);
      }
    }
  }, [selectedMobileJobId, selectedJob, requirements]);

  // Canvas drawing handlers with responsive scaling
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasSignature(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#1e293b';
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  // Add catalog part
  const addCatalogItem = (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    const existingIndex = selectedParts.findIndex(p => p.itemId === itemId);
    if (existingIndex >= 0) {
      setSelectedParts(prev =>
        prev.map((p, idx) => (idx === existingIndex ? { ...p, quantity: p.quantity + 1 } : p))
      );
    } else {
      setSelectedParts(prev => [
        ...prev,
        {
          itemId: item.id,
          quantity: 1,
          isServiceCharge: false,
          rate: item.unitPrice,
        },
      ]);
    }
    setCatalogSearch('');
  };

  // Add custom non-catalog part
  const addNonCatalogPart = () => {
    const name = prompt('Enter non-catalog part name:');
    if (!name) return;
    const rateStr = prompt('Estimated cost per unit (INR):', '5000');
    const rate = rateStr ? parseFloat(rateStr) : 5000;

    setSelectedParts(prev => [
      ...prev,
      {
        customItemName: `[Non-Catalog] ${name}`,
        quantity: 1,
        isServiceCharge: false,
        rate: isNaN(rate) ? 5000 : rate,
      },
    ]);
  };

  // Add labor task
  const addLaborTask = (labor: { name: string; rate: number }) => {
    const exists = selectedParts.find(p => p.customItemName === labor.name);
    if (exists) return;
    setSelectedParts(prev => [
      ...prev,
      {
        customItemName: labor.name,
        quantity: 1,
        isServiceCharge: true,
        rate: labor.rate,
      },
    ]);
  };

  // Simulated photo capture
  const handleAddSamplePhoto = (sampleUrl: string) => {
    setPhotos(prev => [...prev, sampleUrl]);
  };

  // Submit report
  const handleSubmitReport = () => {
    if (!selectedJob) return;

    if (!findings.trim()) {
      showToast('Please describe inspection findings first', 'error');
      return;
    }

    let signatureData: string | undefined = undefined;
    if (canvasRef.current && hasSignature) {
      signatureData = canvasRef.current.toDataURL('image/png');
    }

    const report: InspectionReport = {
      equipmentModel: equipmentModel || 'Industrial Machine',
      serialNumber: serialNumber || 'N/A',
      findings,
      serviceOnly: isServiceOnly,
      inspectionPhotos: photos,
      customerSignature: signatureData,
      technicianNotes,
      submittedAt: new Date().toISOString(),
    };

    if (isOffline) {
      setOfflineQueue(prev => [
        ...prev,
        {
          jobCardId: selectedJob.id,
          report,
          requirements: selectedParts,
          queuedAt: new Date().toLocaleTimeString(),
        },
      ]);
      showToast('Saved locally in offline cache. Will auto-sync when online.', 'info');
      setSelectedMobileJobId(null);
    } else {
      submitInspectionReport(selectedJob.id, report, selectedParts);
      setSelectedMobileJobId(null);
    }
  };

  const handleSyncOfflineQueue = () => {
    if (offlineQueue.length === 0) {
      showToast('No pending offline submissions.', 'info');
      return;
    }
    offlineQueue.forEach(q => {
      submitInspectionReport(q.jobCardId, q.report, q.requirements);
    });
    setOfflineQueue([]);
    showToast(`Synced ${offlineQueue.length} inspection reports to central database!`, 'success');
  };

  // =========================================================================
  // REUSABLE INSPECTION WORKBENCH COMPONENT
  // =========================================================================
  const renderInspectionWorkbench = (isCompact: boolean = false) => {
    if (!selectedJob) return null;
    const coords = selectedJob.siteCoordinates || customer?.coordinates || DEFAULT_ENGINEER_COORDS;

    return (
      <div className="space-y-4">
        {/* Top Header & Customer Card */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-blue-600 dark:text-blue-400">
                  {selectedJob.jobNumber}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                  {selectedJob.status}
                </span>
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-1">
                {customer?.companyName || customer?.name}
              </h3>
              <p className="text-xs text-slate-500">{customer?.name}</p>
            </div>

            <div className="flex items-center gap-2">
              {customer?.phone && (
                <a
                  href={`tel:${customer.phone}`}
                  className="p-2 bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 rounded-xl hover:bg-emerald-200 transition"
                  title="Call Customer"
                >
                  <Phone className="w-4 h-4" />
                </a>
              )}
              <button
                onClick={() => setSelectedMobileJobId(null)}
                className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
                title="Close Ticket Workbench"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Site Geolocation Badge & Navigation */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-semibold flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                <span>{coords.locationName || 'Site Location'}</span>
              </span>
              <span className="font-mono text-[11px] text-blue-600 dark:text-blue-400 font-semibold">
                {coords.lat.toFixed(4)}°N, {coords.lng.toFixed(4)}°E
              </span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              {coords.address || customer?.shippingAddress}
            </div>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 underline"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Launch Turn-by-Turn GPS</span>
              <ExternalLink className="w-3 h-3 opacity-75" />
            </a>
          </div>
        </div>

        {/* Step 1: On-Site Inspection Findings */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Wrench className="w-3.5 h-3.5 text-blue-500" />
              <span>1. Technical Inspection Findings</span>
            </h4>
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Step 1 of 3</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="text-[11px] font-semibold text-slate-500">Equipment Model</label>
              <input
                type="text"
                value={equipmentModel}
                onChange={e => setEquipmentModel(e.target.value)}
                placeholder="e.g. CentriMax V4 / HydroValve 800"
                className="w-full mt-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-500">Machine Serial Number</label>
              <input
                type="text"
                value={serialNumber}
                onChange={e => setSerialNumber(e.target.value)}
                placeholder="e.g. SN-88219-X"
                className="w-full mt-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Quick symptom presets */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-semibold text-slate-500">Quick Diagnostic Presets</label>
              <span className="text-[10px] text-blue-500 font-medium">Click to populate</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {diagnosticPresets.map((preset, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setFindings(preset.text)}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-500">Diagnostic Observations / Root Cause</label>
            <textarea
              value={findings}
              onChange={e => setFindings(e.target.value)}
              rows={3}
              placeholder="Describe symptoms, worn components, test pressure readings, or necessary repair procedure..."
              className="w-full mt-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Photo Evidence */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-semibold text-slate-500">Inspection Photo Evidence</label>
              <span className="text-[10px] text-blue-500 font-bold">{photos.length} captured</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {photos.map((url, idx) => (
                <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-300 shadow-xs">
                  <img src={url} alt="Defect" className="w-full h-full object-cover" />
                  <button
                    onClick={() => setPhotos(photos.filter((_, i) => i !== idx))}
                    className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1 hover:bg-red-600 transition"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={() =>
                  handleAddSamplePhoto(
                    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=300&auto=format&fit=crop&q=80'
                  )
                }
                className="w-16 h-16 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center text-slate-400 hover:text-blue-500 hover:border-blue-400 transition"
              >
                <Camera className="w-5 h-5 mb-0.5" />
                <span className="text-[9px] font-bold">+ Photo</span>
              </button>
            </div>
          </div>
        </div>

        {/* Step 2: Parts Needed vs Service Only */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">2. Requirement Mode</h4>
              <p className="text-[10px] text-slate-500">Specify whether hardware parts replacement is required</p>
            </div>

            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold">
              <button
                type="button"
                onClick={() => setIsServiceOnly(false)}
                className={`px-3 py-1 rounded-lg transition ${
                  !isServiceOnly ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Parts Needed
              </button>
              <button
                type="button"
                onClick={() => setIsServiceOnly(true)}
                className={`px-3 py-1 rounded-lg transition ${
                  isServiceOnly ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Service Only
              </button>
            </div>
          </div>

          {!isServiceOnly ? (
            <div className="space-y-3 pt-1">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={catalogSearch}
                  onChange={e => setCatalogSearch(e.target.value)}
                  placeholder="Search catalog by SKU or item name..."
                  className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              {catalogSearch && (
                <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-1.5 max-h-48 overflow-y-auto space-y-1">
                  {items
                    .filter(
                      i =>
                        i.name.toLowerCase().includes(catalogSearch.toLowerCase()) ||
                        i.sku.toLowerCase().includes(catalogSearch.toLowerCase())
                    )
                    .map(item => (
                      <div
                        key={item.id}
                        onClick={() => addCatalogItem(item.id)}
                        className="p-2 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-lg cursor-pointer text-xs flex items-center justify-between"
                      >
                        <div>
                          <div className="font-semibold text-slate-800 dark:text-slate-100">{item.name}</div>
                          <div className="text-[10px] text-slate-400">
                            SKU: {item.sku} • In Stock: {item.stockQuantity}
                          </div>
                        </div>
                        <span className="font-bold text-blue-600 dark:text-blue-400">
                          ₹{item.unitPrice.toLocaleString('en-IN')}
                        </span>
                      </div>
                    ))}
                </div>
              )}

              <button
                type="button"
                onClick={addNonCatalogPart}
                className="w-full py-2 px-3 border border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center justify-center gap-1.5 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition"
              >
                <Plus className="w-4 h-4 text-blue-500" />
                Flag Custom / Non-Catalog Part
              </button>
            </div>
          ) : (
            <div className="space-y-2 pt-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Standard Labor & Calibration Checklist
              </p>
              {standardLaborOptions.map((opt, i) => {
                const isAdded = selectedParts.some(p => p.customItemName === opt.name);
                return (
                  <div
                    key={i}
                    onClick={() => (isAdded ? null : addLaborTask(opt))}
                    className={`p-2.5 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition ${
                      isAdded
                        ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-400 font-medium'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-xs">{opt.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        ₹{opt.rate.toLocaleString('en-IN')}
                      </span>
                      {isAdded && <Check className="w-4 h-4 text-blue-600" />}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Requirements Table */}
          {selectedParts.length > 0 && (
            <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Logged Requirements ({selectedParts.length})
              </div>
              <div className="space-y-2 max-h-52 overflow-y-auto">
                {selectedParts.map((part, idx) => {
                  const catalogItem = part.itemId ? items.find(i => i.id === part.itemId) : null;
                  const title = catalogItem ? catalogItem.name : part.customItemName;

                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs"
                    >
                      <div className="truncate max-w-[220px]">
                        <div className="font-semibold truncate">{title}</div>
                        <div className="text-[10px] text-slate-400">
                          {part.isServiceCharge ? 'Service / Labor' : 'Hardware Part'} • ₹{part.rate.toLocaleString('en-IN')} each
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-xs">
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedParts(prev =>
                                prev
                                  .map((p, i) => (i === idx ? { ...p, quantity: Math.max(1, p.quantity - 1) } : p))
                                  .filter(p => p.quantity > 0)
                              )
                            }
                            className="px-2 py-1 hover:bg-slate-100 dark:hover:bg-slate-800"
                          >
                            -
                          </button>
                          <span className="px-2 font-bold">{part.quantity}</span>
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedParts(prev =>
                                prev.map((p, i) => (i === idx ? { ...p, quantity: p.quantity + 1 } : p))
                              )
                            }
                            className="px-2 py-1 hover:bg-slate-100 dark:hover:bg-slate-800"
                          >
                            +
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedParts(prev => prev.filter((_, i) => i !== idx))}
                          className="text-red-500 p-1.5 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Step 3: Digital Customer Sign-Off Canvas */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <PenTool className="w-3.5 h-3.5 text-blue-500" />
              <span>3. Customer Digital Sign-Off</span>
            </h4>
            {hasSignature && (
              <button
                type="button"
                onClick={clearSignature}
                className="text-[10px] text-red-500 hover:underline font-semibold"
              >
                Clear Signature
              </button>
            )}
          </div>

          <p className="text-[11px] text-slate-500">
            Customer authorizes technician diagnosis and acknowledges material requirement estimate.
          </p>

          <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl bg-white overflow-hidden relative touch-none">
            <canvas
              ref={canvasRef}
              width={420}
              height={110}
              className="cursor-crosshair w-full block bg-white"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
            {!hasSignature && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-slate-300 text-xs font-mono">
                ✍️ Touch or mouse to sign customer sign-off here
              </div>
            )}
          </div>
        </div>

        {/* Submit Report Button */}
        <button
          type="button"
          onClick={handleSubmitReport}
          className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition"
        >
          <CheckCircle className="w-4 h-4" />
          <span>{isOffline ? 'Save to Offline Storage (Sync Later)' : 'Submit Inspection & Log Requirements'}</span>
        </button>
      </div>
    );
  };

  // =========================================================================
  // REUSABLE DISPATCH TICKETS LIST
  // =========================================================================
  const renderDispatchTickets = () => {
    return (
      <div className="space-y-3">
        {/* Attendance Widget */}
        {(() => {
          const todayStr = new Date().toISOString().split('T')[0];
          const punch = attendance.find(a => a.userId === activeEngineer.id && a.date === todayStr);

          return (
            <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800 dark:text-slate-200">
                  <MapPin className="w-3.5 h-3.5 text-blue-500" />
                  <span>Office Perimeter Attendance Geofence</span>
                </div>
                <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                  100m Geofence Active
                </span>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                {punch ? (
                  <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs">
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    <span>Punched In at {punch.punchInTime} ({punch.status})</span>
                  </div>
                ) : (
                  <div className="text-slate-500 text-xs">Not punched in yet today.</div>
                )}

                <button
                  onClick={() =>
                    punchAttendance({
                      locationType: 'OFFICE',
                      distanceFromOfficeMeters: 35,
                      notes: 'Field Engineer punch via mobile geofence',
                    })
                  }
                  disabled={Boolean(punch?.punchOutTime)}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs transition flex items-center gap-1 ${
                    !punch
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : !punch.punchOutTime
                      ? 'bg-amber-600 hover:bg-amber-700 text-white'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>{!punch ? 'Punch In' : !punch.punchOutTime ? 'Punch Out' : 'Completed'}</span>
                </button>
              </div>
            </div>
          );
        })()}

        {/* Tickets List */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Assigned Dispatches ({myAssignedJobs.length})
            </h3>
            <span className="text-[11px] text-slate-400 font-medium">Bengaluru Field Region</span>
          </div>

          {myAssignedJobs.length === 0 ? (
            <div className="text-center py-10 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
              <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
              <p className="text-xs font-semibold">No Pending Dispatches</p>
              <p className="text-[11px] text-slate-500 mt-1">All assigned tickets have been cleared.</p>
            </div>
          ) : (
            myAssignedJobs.map(job => {
              const cust = customers.find(c => c.id === job.customerId);
              const isSelected = selectedMobileJobId === job.id;
              const isReadyForInspection = job.status === 'ENGINEER_ASSIGNED';
              const coords = job.siteCoordinates || cust?.coordinates;

              return (
                <div
                  key={job.id}
                  onClick={() => setSelectedMobileJobId(job.id)}
                  className={`p-3.5 rounded-2xl border transition cursor-pointer group ${
                    isSelected
                      ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-500 shadow-md ring-1 ring-blue-500'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-400 shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                      {job.jobNumber}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        job.status === 'ENGINEER_ASSIGNED'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                          : job.status === 'REQUIREMENTS_LOGGED'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                          : job.status === 'DELIVERED'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {job.status}
                    </span>
                  </div>

                  <h4 className="font-bold text-xs text-slate-900 dark:text-white mb-1 line-clamp-1">
                    {cust?.companyName || cust?.name || 'Customer'}
                  </h4>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mb-2">
                    {job.notes}
                  </p>

                  {coords && (
                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1.5 border-t border-slate-100 dark:border-slate-800/80">
                      <div className="flex items-center gap-1 truncate max-w-[200px]">
                        <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                        <span className="truncate">{coords.locationName || coords.address || cust?.shippingAddress}</span>
                      </div>
                      <span className="font-mono text-[10px] text-blue-600 dark:text-blue-400 font-semibold shrink-0">
                        {coords.lat.toFixed(3)}°, {coords.lng.toFixed(3)}°
                      </span>
                    </div>
                  )}

                  <div className="mt-2.5 flex items-center justify-between pt-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400">
                      Priority: {job.priority || 'MEDIUM'}
                    </span>
                    <div className="flex items-center gap-1 text-xs font-bold text-blue-600 group-hover:translate-x-0.5 transition">
                      <span>{isReadyForInspection ? 'Inspect Site' : 'View Docket'}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center py-2 px-2 w-full">
      {/* ========================================================================= */}
      {/* TOP CONTROLS & ALTERNATIVE UI SELECTOR */}
      {/* ========================================================================= */}
      <div className="w-full max-w-6xl mb-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-3 shadow-md flex flex-wrap items-center justify-between gap-3">
        {/* Left: Active Engineer & Layout Mode Label */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <img
              src={activeEngineer.avatar}
              alt={activeEngineer.name}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-blue-500/40"
            />
            <div>
              <div className="text-xs font-bold leading-tight flex items-center gap-1.5">
                <span>{activeEngineer.name}</span>
                <span className="px-1.5 py-0.2 bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-[10px] font-semibold rounded-md">
                  FSE
                </span>
              </div>
              <p className="text-[10px] text-slate-500">{activeEngineer.specialty || 'Senior Field Specialist'}</p>
            </div>
          </div>

          <select
            value={activeEngineer.id}
            onChange={e => {
              const u = users.find(user => user.id === e.target.value);
              if (u) setCurrentUser(u);
            }}
            className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 font-medium text-slate-700 dark:text-slate-300 outline-none"
          >
            {engineers.map(e => (
              <option key={e.id} value={e.id}>
                {e.name} ({e.specialty?.split(' ')[0]})
              </option>
            ))}
          </select>
        </div>

        {/* Interactive Primary Navigation: 1. Ticket | 2. Site Map | 3. Profile */}
        <div className="flex items-center bg-blue-50 dark:bg-blue-950/60 p-1 rounded-2xl border border-blue-200 dark:border-blue-800 text-xs font-bold order-last sm:order-none">
          <button
            type="button"
            onClick={() => {
              setSelectedMobileJobId(null);
              setMobileBottomTab('TICKETS');
            }}
            className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
              mobileBottomTab === 'TICKETS'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-blue-900 dark:text-blue-200 hover:bg-blue-100 dark:hover:bg-blue-900/60'
            }`}
          >
            <Ticket className="w-3.5 h-3.5" />
            <span>1. Ticket</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-500/20 text-current font-bold">
              {myAssignedJobs.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedMobileJobId(null);
              setMobileBottomTab('MAP');
            }}
            className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
              mobileBottomTab === 'MAP'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-blue-900 dark:text-blue-200 hover:bg-blue-100 dark:hover:bg-blue-900/60'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>2. Site Map</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedMobileJobId(null);
              setMobileBottomTab('PROFILE');
            }}
            className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
              mobileBottomTab === 'PROFILE'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-blue-900 dark:text-blue-200 hover:bg-blue-100 dark:hover:bg-blue-900/60'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>3. Profile</span>
            {isClockedIn && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />}
          </button>
        </div>

        {/* Center: UI Layout Modes Switcher */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800/90 p-1 rounded-2xl border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => handleSelectLayout('PHONE')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              layoutMode === 'PHONE'
                ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs ring-1 ring-emerald-500/30'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="Authentic Android Smartphone App Shell (Material You / Pixel / Galaxy)"
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-500" />
            <span className="font-extrabold">Android App</span>
          </button>

          <button
            onClick={() => handleSelectLayout('SPLIT')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              layoutMode === 'SPLIT'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="Split-Screen Console: Geospatial Dispatch Radar + Work Order Docket"
          >
            <Laptop className="w-3.5 h-3.5" />
            <span>Split Console</span>
            <span className="hidden md:inline px-1 py-0.2 bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 text-[9px] rounded-sm uppercase">
              Recommended
            </span>
          </button>

          <button
            onClick={() => handleSelectLayout('RADAR')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              layoutMode === 'RADAR'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="Full-Canvas Map Radar with Floating Dispatch HUD"
          >
            <MapIcon className="w-3.5 h-3.5 text-blue-500" />
            <span>Map Radar</span>
          </button>

          <button
            onClick={() => handleSelectLayout('TABLET')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              layoutMode === 'TABLET'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="Rugged Industrial Field Tablet Mode"
          >
            <Tablet className="w-3.5 h-3.5 text-amber-500" />
            <span>Rugged Tablet</span>
          </button>
        </div>

        {/* Right: Theme Switcher, Setup/Realtime, Offline status & Fullscreen Map button */}
        <div className="flex items-center gap-2">
          {/* Download Setup & Realtime Button */}
          <button
            onClick={() => setShowSetupModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-xs transition active:scale-95"
            title="Download Full Setup & Real-time Guide"
          >
            <FolderDown className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Setup & Realtime</span>
          </button>

          {/* Theme switcher pill in Mobile View header */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-2xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setTheme('light')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold transition ${
                !isDarkMode
                  ? 'bg-white text-amber-600 shadow-xs'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
              title="Switch to White Theme"
            >
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-[11px]">White</span>
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold transition ${
                isDarkMode
                  ? 'bg-slate-700 text-blue-300 shadow-xs'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
              title="Switch to Dark Theme"
            >
              <Moon className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-[11px]">Dark</span>
            </button>
          </div>

          <button
            onClick={() => setShowFullscreenMapModal(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 dark:bg-slate-800 text-white hover:bg-slate-800 border border-slate-700 shadow-xs transition"
            title="Open Fullscreen Geospatial Modal"
          >
            <Maximize2 className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden md:inline">Expand Map</span>
          </button>

          <button
            onClick={() => setIsOffline(!isOffline)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition ${
              isOffline
                ? 'bg-amber-100 border-amber-300 text-amber-800 dark:bg-amber-950/60 dark:text-amber-200'
                : 'bg-emerald-100 border-emerald-300 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200'
            }`}
          >
            {isOffline ? (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-600" /> Offline Mode
              </>
            ) : (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-600" /> Online
              </>
            )}
          </button>

          {offlineQueue.length > 0 && (
            <button
              onClick={handleSyncOfflineQueue}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs bg-blue-600 text-white font-medium hover:bg-blue-700 shadow-sm animate-pulse"
              title="Sync pending queue"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{offlineQueue.length}</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* UI MODE 1: PHONE MOCKUP VIEW */}
      {/* ========================================================================= */}
      {layoutMode === 'PHONE' && (
        <div className="w-full max-w-[412px] h-[835px] bg-slate-950 rounded-[44px] p-2.5 shadow-2xl border-[6px] border-slate-700 dark:border-slate-800 relative flex flex-col overflow-hidden animate-fadeIn select-none ring-2 ring-black/40">
          {/* Android Side Hardware Buttons */}
          <div className="absolute -right-[7px] top-24 w-[3.5px] h-10 bg-slate-600 rounded-r-xs shadow-xs" title="Android Power Key" />
          <div className="absolute -right-[7px] top-38 w-[3.5px] h-20 bg-slate-600 rounded-r-xs shadow-xs" title="Android Volume Up/Down" />

          {/* Android Top Speaker Grill */}
          <div className="absolute top-1 left-1/2 -translate-x-1/2 w-14 h-1 bg-slate-800 rounded-full z-40" />

          {/* Android Punch-Hole Front Camera Lens */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-black rounded-full z-40 ring-1 ring-slate-800/80 flex items-center justify-center shadow-inner pointer-events-none">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-950/80 border border-slate-900" />
          </div>

          {/* Android Screen Container */}
          <div className="w-full h-full bg-slate-50 dark:bg-slate-950 rounded-[34px] overflow-hidden flex flex-col relative text-slate-800 dark:text-slate-100 shadow-inner">
            {/* Android System Status Bar */}
            <div className="pt-2 px-4 pb-1.5 flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400 select-none bg-slate-100/70 dark:bg-slate-900/70 backdrop-blur-xs border-b border-slate-200/40 dark:border-slate-800/40">
              {/* Left: Android Time + Notification Icons */}
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-200 tracking-tight">
                  {androidTime}
                </span>
                <span className="text-[10px] text-emerald-500">●</span>
                <span className="text-[10px] text-blue-500" title="Work order active">🔧</span>
              </div>

              {/* Right: Android Status Icons (5G, WiFi, Battery %) */}
              <div className="flex items-center gap-1.5 text-[10px]">
                <span className="font-mono font-bold text-[9px] px-1 py-0.2 rounded-xs bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  5G
                </span>

                {isOffline ? (
                  <WifiOff className="w-3.5 h-3.5 text-amber-500" />
                ) : (
                  <Wifi className="w-3.5 h-3.5 text-emerald-500" />
                )}

                <div className="flex items-center gap-0.5 ml-1 font-mono font-bold text-[10px] text-slate-700 dark:text-slate-300">
                  <span>88%</span>
                  <div className="w-4 h-2.5 border border-current rounded-xs p-0.5 flex items-center relative">
                    <div className="w-3 h-full bg-emerald-500 rounded-2xs" />
                    <div className="w-0.5 h-1 bg-current absolute -right-[2px] top-0.5 rounded-r-xs" />
                  </div>
                </div>
              </div>
            </div>

            {/* Android App Bar / Material You Header */}
            <div className="px-3.5 py-2 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  🤖
                </div>
                <div>
                  <div className="text-xs font-black text-slate-900 dark:text-white leading-tight flex items-center gap-1.5">
                    <span>FieldOps Android</span>
                    <span className="px-1 py-0.2 rounded-xs bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[9px] font-bold">
                      v2.5
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>{activeEngineer.name.split(' ')[0]} • RTK GPS Active</span>
                  </div>
                </div>
              </div>

              {/* Android Action Icons: Theme Switcher & 3-Dot Overflow Menu */}
              <div className="flex items-center gap-1 relative">
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  title={isDarkMode ? 'Switch to Sunlight White' : 'Switch to Night Dark'}
                >
                  {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
                </button>

                <button
                  type="button"
                  onClick={() => setAndroidMenuOpen(!androidMenuOpen)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  title="Android App Menu"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {/* Android 3-Dot Dropdown Menu */}
                {androidMenuOpen && (
                  <div className="absolute top-8 right-0 z-50 w-52 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl p-1.5 text-xs animate-in fade-in zoom-in-95">
                    <button
                      onClick={() => {
                        setAndroidNavStyle(prev => (prev === 'GESTURE' ? 'BUTTONS' : 'GESTURE'));
                        setAndroidMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-between text-slate-700 dark:text-slate-200 font-medium"
                    >
                      <span>Nav Bar: {androidNavStyle === 'GESTURE' ? 'Gesture Pill' : '3-Button (◀ ● ■)'}</span>
                      <SlidersHorizontal className="w-3.5 h-3.5 text-blue-500" />
                    </button>

                    <button
                      onClick={() => {
                        setShowSetupModal(true);
                        setAndroidMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-between text-slate-700 dark:text-slate-200 font-medium"
                    >
                      <span>Download Setup & Realtime</span>
                      <FolderDown className="w-3.5 h-3.5 text-emerald-500" />
                    </button>

                    <button
                      onClick={() => {
                        setMobileBottomTab('PROFILE');
                        setAndroidMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-between text-slate-700 dark:text-slate-200 font-medium"
                    >
                      <span>Punch In/Out Attendance</span>
                      <UserCheck className="w-3.5 h-3.5 text-purple-500" />
                    </button>

                    <div className="my-1 border-t border-slate-200 dark:border-slate-700" />

                    <div className="px-3 py-1 text-[10px] text-slate-400 font-mono">
                      Android OS 15 • SMAART Suite
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Offline Banner inside app */}
            {isOffline && (
              <div className="bg-amber-500 text-slate-900 px-4 py-1 text-[11px] font-bold flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <WifiOff className="w-3 h-3" /> Offline (WatermelonDB)
                </span>
                <span>{offlineQueue.length} Pending</span>
              </div>
            )}

            {/* Content inside phone */}
            <div className="flex-1 flex flex-col overflow-y-auto p-3.5 space-y-4">
              {selectedJob ? (
                <div>
                  <button
                    onClick={() => setSelectedMobileJobId(null)}
                    className="flex items-center gap-1 text-xs font-semibold text-blue-600 mb-3 hover:underline"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to Tickets
                  </button>
                  {renderInspectionWorkbench(true)}
                </div>
              ) : mobileBottomTab === 'TICKETS' ? (
                renderDispatchTickets()
              ) : mobileBottomTab === 'MAP' ? (
                <div className="flex-1 min-h-[460px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col">
                  <div className="p-2.5 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-rose-500" />
                      Assigned Sites ({myAssignedJobs.length})
                    </span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">GPS Active</span>
                  </div>
                  <div className="flex-1 min-h-[400px] relative">
                    <EngineerJobSitesMap
                      jobs={myAssignedJobs}
                      customers={customers}
                      selectedJobId={selectedMapJobId}
                      onSelectJob={setSelectedMapJobId}
                      onOpenInspection={id => {
                        setSelectedMobileJobId(id);
                        setMobileBottomTab('TICKETS');
                      }}
                      isCompact={true}
                    />
                  </div>
                </div>
              ) : (
                /* Profile Section in mobile phone: Punch Attendance, User Settings, Working Days & Leaves */
                <div className="flex-1">
                  <ProfileSection />
                </div>
              )}
            </div>

            {/* INTERACTIVE PANEL IN DOWN: 1. Ticket, 2. Site Map, 3. Profile */}
            <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-3 py-2 flex items-center justify-around z-20 shrink-0 shadow-lg">
              {/* TAB 1: TICKET */}
              <button
                type="button"
                onClick={() => {
                  setSelectedMobileJobId(null);
                  setMobileBottomTab('TICKETS');
                }}
                className={`flex-1 py-1 flex flex-col items-center justify-center transition-all ${
                  mobileBottomTab === 'TICKETS'
                    ? 'text-blue-600 dark:text-blue-400 font-black scale-105'
                    : 'text-slate-400 dark:text-slate-500 font-bold hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                <div className="relative">
                  <Ticket className="w-5 h-5" />
                  {myAssignedJobs.length > 0 && (
                    <span className="absolute -top-1 -right-2 px-1 py-0.2 rounded-full bg-blue-600 text-white text-[8px] font-black">
                      {myAssignedJobs.length}
                    </span>
                  )}
                </div>
                <span className="text-[10px] mt-0.5">1. Ticket</span>
                {mobileBottomTab === 'TICKETS' && (
                  <span className="w-4 h-0.5 rounded-full bg-blue-600 dark:bg-blue-400 mt-0.5" />
                )}
              </button>

              {/* TAB 2: SITE MAP */}
              <button
                type="button"
                onClick={() => {
                  setSelectedMobileJobId(null);
                  setMobileBottomTab('MAP');
                }}
                className={`flex-1 py-1 flex flex-col items-center justify-center transition-all ${
                  mobileBottomTab === 'MAP'
                    ? 'text-blue-600 dark:text-blue-400 font-black scale-105'
                    : 'text-slate-400 dark:text-slate-500 font-bold hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                <div className="relative">
                  <MapPin className="w-5 h-5" />
                  <span className="absolute -top-0.5 -right-1 w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                </div>
                <span className="text-[10px] mt-0.5">2. Site Map</span>
                {mobileBottomTab === 'MAP' && (
                  <span className="w-4 h-0.5 rounded-full bg-blue-600 dark:bg-blue-400 mt-0.5" />
                )}
              </button>

              {/* TAB 3: PROFILE */}
              <button
                type="button"
                onClick={() => {
                  setSelectedMobileJobId(null);
                  setMobileBottomTab('PROFILE');
                }}
                className={`flex-1 py-1 flex flex-col items-center justify-center transition-all ${
                  mobileBottomTab === 'PROFILE'
                    ? 'text-blue-600 dark:text-blue-400 font-black scale-105'
                    : 'text-slate-400 dark:text-slate-500 font-bold hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                <div className="relative">
                  <User className="w-5 h-5" />
                  {isClockedIn && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  )}
                </div>
                <span className="text-[10px] mt-0.5">3. Profile</span>
                {mobileBottomTab === 'PROFILE' && (
                  <span className="w-4 h-0.5 rounded-full bg-blue-600 dark:bg-blue-400 mt-0.5" />
                )}
              </button>
            </div>

            {/* Android Recents Task Drawer (Multitasking Overview) */}
            {showRecentsDrawer && (
              <div className="absolute inset-x-0 bottom-12 top-14 z-40 bg-slate-900/90 backdrop-blur-md p-4 flex flex-col animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between pb-2 border-b border-slate-700 text-white text-xs mb-3">
                  <div className="flex items-center gap-1.5 font-bold">
                    <Square className="w-3.5 h-3.5 text-blue-400" />
                    <span>Android Running Tasks</span>
                  </div>
                  <button
                    onClick={() => setShowRecentsDrawer(false)}
                    className="p-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex-1 space-y-3 overflow-y-auto pr-1">
                  {/* Task Card 1: Tickets Queue */}
                  <div
                    onClick={() => {
                      setMobileBottomTab('TICKETS');
                      setShowRecentsDrawer(false);
                    }}
                    className="p-3 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-2xl cursor-pointer transition shadow-md"
                  >
                    <div className="flex items-center justify-between text-xs text-blue-400 font-bold mb-1">
                      <span className="flex items-center gap-1.5">
                        <Ticket className="w-3.5 h-3.5" /> Tickets Docket
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">Active</span>
                    </div>
                    <div className="text-xs text-white font-semibold">
                      {myAssignedJobs.length} Assigned Field Tickets
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">Tap to switch to Dispatch Queue</div>
                  </div>

                  {/* Task Card 2: Geospatial Map */}
                  <div
                    onClick={() => {
                      setMobileBottomTab('MAP');
                      setShowRecentsDrawer(false);
                    }}
                    className="p-3 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-2xl cursor-pointer transition shadow-md"
                  >
                    <div className="flex items-center justify-between text-xs text-emerald-400 font-bold mb-1">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" /> GPS Site Radar
                      </span>
                      <span className="text-[10px] text-emerald-400 font-mono">Live</span>
                    </div>
                    <div className="text-xs text-white font-semibold">Field Operations Geospatial Overview</div>
                    <div className="text-[10px] text-slate-400 mt-1">Interactive client pins & navigation</div>
                  </div>

                  {/* Task Card 3: Attendance & Settings */}
                  <div
                    onClick={() => {
                      setMobileBottomTab('PROFILE');
                      setShowRecentsDrawer(false);
                    }}
                    className="p-3 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-2xl cursor-pointer transition shadow-md"
                  >
                    <div className="flex items-center justify-between text-xs text-purple-400 font-bold mb-1">
                      <span className="flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5" /> Staff Attendance & Leaves
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">Ready</span>
                    </div>
                    <div className="text-xs text-white font-semibold">
                      Status: {isClockedIn ? 'Clocked In' : 'Not Clocked In'}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">Punch In/Out, leave balance & holiday calendar</div>
                  </div>
                </div>

                <div className="pt-2 flex justify-center">
                  <button
                    onClick={() => setShowRecentsDrawer(false)}
                    className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
                  >
                    Dismiss Recents
                  </button>
                </div>
              </div>
            )}

            {/* Interactive Android System Navigation Bar (Gesture Pill OR 3-Button Nav) */}
            <div className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800/80 shrink-0">
              {androidNavStyle === 'GESTURE' ? (
                /* Android Modern Gesture Navigation Bar */
                <div
                  className="py-2.5 flex items-center justify-center cursor-pointer group"
                  onClick={() => {
                    if (selectedMobileJobId) setSelectedMobileJobId(null);
                    else setMobileBottomTab('TICKETS');
                  }}
                  title="Swipe / Tap Home gesture"
                >
                  <div className="w-24 h-1 bg-slate-400 dark:bg-slate-600 group-hover:bg-blue-500 rounded-full transition-all" />
                </div>
              ) : (
                /* Android Classic 3-Button Navigation Bar (◀  ●  ■) */
                <div className="py-1 px-8 flex items-center justify-between text-slate-400 dark:text-slate-500">
                  {/* Back button ◀ */}
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedMobileJobId) {
                        setSelectedMobileJobId(null);
                        showToast('Returned to Tickets list', 'info');
                      } else if (mobileBottomTab !== 'TICKETS') {
                        setMobileBottomTab('TICKETS');
                      } else {
                        showToast('Already on Tickets root', 'info');
                      }
                    }}
                    className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-90 transition text-slate-600 dark:text-slate-400 font-bold"
                    title="Android Back"
                  >
                    <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
                  </button>

                  {/* Home button ● */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedMobileJobId(null);
                      setMobileBottomTab('TICKETS');
                      showToast('Home: All Tickets', 'info');
                    }}
                    className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-90 transition text-slate-600 dark:text-slate-400"
                    title="Android Home"
                  >
                    <Circle className="w-4 h-4 fill-current stroke-none" />
                  </button>

                  {/* Recents button ■ */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowRecentsDrawer(!showRecentsDrawer);
                    }}
                    className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-90 transition text-slate-600 dark:text-slate-400"
                    title="Android Recents / Tasks"
                  >
                    <Square className="w-4 h-4 fill-current stroke-none" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Non-Phone Shell Profile View */}
      {layoutMode !== 'PHONE' && mobileBottomTab === 'PROFILE' && (
        <div className="w-full max-w-5xl animate-fadeIn">
          <ProfileSection />
        </div>
      )}

      {/* Non-Phone Shell Full Site Map View */}
      {layoutMode !== 'PHONE' && mobileBottomTab === 'MAP' && (
        <div className="w-full max-w-6xl h-[720px] rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl relative animate-fadeIn">
          <div className="p-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <span className="font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-rose-500" />
              Field Operations Geospatial Site Map ({myAssignedJobs.length} Assigned Sites)
            </span>
            <button
              onClick={() => setMobileBottomTab('TICKETS')}
              className="text-xs font-bold text-blue-600 hover:underline"
            >
              Back to Tickets List
            </button>
          </div>
          <div className="flex-1 h-[660px] relative">
            <EngineerJobSitesMap
              jobs={myAssignedJobs}
              customers={customers}
              selectedJobId={selectedMobileJobId || selectedMapJobId}
              onSelectJob={id => {
                setSelectedMapJobId(id);
                setSelectedMobileJobId(id);
              }}
              onOpenInspection={id => {
                setSelectedMobileJobId(id);
                setMobileBottomTab('TICKETS');
              }}
              isCompact={false}
            />
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* UI MODE 2: SPLIT CONSOLE (DUAL-PANE COMMAND DASHBOARD) */}
      {/* ========================================================================= */}
      {layoutMode === 'SPLIT' && mobileBottomTab === 'TICKETS' && (
        <div className="w-full max-w-6xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[760px] animate-fadeIn">
          {/* Left Column (6/12): Interactive Google Maps Radar & Site Overview */}
          <div className="lg:col-span-6 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800 flex flex-col min-h-[460px] lg:min-h-full">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Compass className="w-4 h-4 text-blue-500" />
                  <span>Geospatial Dispatch Radar</span>
                </h3>
                <p className="text-[11px] text-slate-500">Live assigned site coordinates & route telemetry</p>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
                  {myAssignedJobs.length} Sites
                </span>
              </div>
            </div>

            {/* Google Map */}
            <div className="flex-1 w-full min-h-[440px] relative">
              <EngineerJobSitesMap
                jobs={myAssignedJobs}
                customers={customers}
                selectedJobId={selectedMobileJobId || selectedMapJobId}
                onSelectJob={id => {
                  setSelectedMapJobId(id);
                  setSelectedMobileJobId(id);
                }}
                onOpenInspection={id => setSelectedMobileJobId(id)}
                isCompact={false}
              />
            </div>
          </div>

          {/* Right Column (6/12): Work Order Docket or Active Inspection Form */}
          <div className="lg:col-span-6 flex flex-col p-5 overflow-y-auto max-h-[820px] bg-slate-50/50 dark:bg-slate-950/30">
            {selectedJob ? (
              <div>
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200 dark:border-slate-800">
                  <button
                    onClick={() => setSelectedMobileJobId(null)}
                    className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 transition"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Return to Dispatch Queue</span>
                  </button>
                  <span className="text-xs text-slate-400 font-mono">Work Order Inspection Mode</span>
                </div>
                {renderInspectionWorkbench(false)}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">Active Field Work Orders</h3>
                    <p className="text-[11px] text-slate-500">Select any ticket from the list or map pin to inspect</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 font-bold text-xs">
                    {myAssignedJobs.filter(j => j.status === 'ENGINEER_ASSIGNED').length} Pending Inspections
                  </span>
                </div>
                {renderDispatchTickets()}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* UI MODE 3: MAP RADAR (FULL-CANVAS GEOSPATIAL COMMAND CENTER) */}
      {/* ========================================================================= */}
      {layoutMode === 'RADAR' && mobileBottomTab === 'TICKETS' && (
        <div className="w-full max-w-6xl h-[780px] relative rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl flex animate-fadeIn">
          {/* Main Full-Size Map */}
          <div className="absolute inset-0 z-0">
            <EngineerJobSitesMap
              jobs={myAssignedJobs}
              customers={customers}
              selectedJobId={selectedMobileJobId || selectedMapJobId}
              onSelectJob={id => {
                setSelectedMapJobId(id);
                setSelectedMobileJobId(id);
              }}
              onOpenInspection={id => setSelectedMobileJobId(id)}
              isCompact={false}
            />
          </div>

          {/* Floating Left Dispatch HUD */}
          <div className="absolute top-4 left-4 z-20 w-80 max-h-[720px] flex flex-col pointer-events-auto">
            <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col max-h-[720px]">
              <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold text-xs">Radar Dispatch HUD</span>
                </div>
                <button
                  onClick={() => setRadarSidebarOpen(!radarSidebarOpen)}
                  className="text-xs text-slate-400 hover:text-white underline font-semibold"
                >
                  {radarSidebarOpen ? 'Hide' : 'Show'}
                </button>
              </div>

              {radarSidebarOpen && (
                <div className="p-3 overflow-y-auto space-y-2.5 max-h-[640px]">
                  <div className="text-[11px] font-semibold text-slate-500">
                    Showing {myAssignedJobs.length} Assigned Sites
                  </div>
                  {myAssignedJobs.map(job => {
                    const cust = customers.find(c => c.id === job.customerId);
                    const isSelected = selectedMobileJobId === job.id;
                    const coords = job.siteCoordinates || cust?.coordinates;

                    return (
                      <div
                        key={job.id}
                        onClick={() => setSelectedMobileJobId(job.id)}
                        className={`p-2.5 rounded-xl border text-xs cursor-pointer transition ${
                          isSelected
                            ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 shadow-sm'
                            : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-blue-400'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-mono font-bold text-blue-600">{job.jobNumber}</span>
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700">
                            {job.status}
                          </span>
                        </div>
                        <div className="font-semibold text-slate-800 dark:text-slate-100 truncate">
                          {cust?.companyName || cust?.name}
                        </div>
                        {coords && (
                          <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-1 truncate">
                            <MapPin className="w-3 h-3 text-red-500 shrink-0" />
                            <span className="truncate">{coords.locationName || coords.address}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Slide-Over Inspection Drawer on Right */}
          {selectedJob && (
            <div className="absolute top-0 right-0 bottom-0 w-full sm:w-[480px] z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-l border-slate-200 dark:border-slate-800 shadow-2xl p-5 overflow-y-auto flex flex-col pointer-events-auto animate-in slide-in-from-right duration-200">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200 dark:border-slate-800">
                <span className="text-xs font-bold text-blue-600">Inspection & Requirement Docket</span>
                <button
                  onClick={() => setSelectedMobileJobId(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {renderInspectionWorkbench(false)}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* UI MODE 4: RUGGED INDUSTRIAL FIELD TABLET */}
      {/* ========================================================================= */}
      {/* ========================================================================= */}
      {/* UI MODE 4: RUGGED INDUSTRIAL FIELD TABLET */}
      {/* ========================================================================= */}
      {layoutMode === 'TABLET' && mobileBottomTab === 'TICKETS' && (
        <div className="w-full max-w-6xl bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 rounded-3xl border-4 border-slate-300 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col animate-fadeIn">
          {/* Rugged Tablet Header Ribbon */}
          <div className="px-5 py-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 font-mono font-bold text-[11px] border border-amber-500/30 flex items-center gap-1.5">
                <Tablet className="w-3.5 h-3.5" />
                <span>TOUGHPAD FIELD OS v4.2</span>
              </div>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Technician: {activeEngineer.name}
              </span>
            </div>

            {/* Industrial Sunlight White / Night Dark Mode Switcher */}
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-slate-200 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-300 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                    !isDarkMode
                      ? 'bg-amber-400 text-slate-950 shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Sunlight High-Visibility White Mode"
                >
                  <Sun className="w-3.5 h-3.5" />
                  <span>Sunlight White</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                    isDarkMode
                      ? 'bg-slate-700 text-blue-300 shadow-xs'
                      : 'text-slate-400 hover:text-slate-700 dark:hover:text-white'
                  }`}
                  title="Night Shift Dark Mode"
                >
                  <Moon className="w-3.5 h-3.5" />
                  <span>Night Dark</span>
                </button>
              </div>

              <div className="flex items-center gap-4 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <Signal className="w-3.5 h-3.5" /> GPS RTK ±3m
                </span>
                <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                  <Battery className="w-3.5 h-3.5" /> 94%
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          </div>

          {/* Tablet Main Workspace */}
          <div className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left 4 cols: Work Orders & Geofence Status */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white dark:bg-slate-900/90 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                    <span>Industrial Work Order Queue</span>
                  </h3>
                  <span className="font-mono text-xs text-amber-600 dark:text-amber-400 font-bold">
                    {myAssignedJobs.length} Assigned
                  </span>
                </div>

                <div className="space-y-2 max-h-[620px] overflow-y-auto pr-1">
                  {myAssignedJobs.map(job => {
                    const cust = customers.find(c => c.id === job.customerId);
                    const isSelected = selectedMobileJobId === job.id;
                    const coords = job.siteCoordinates || cust?.coordinates;

                    return (
                      <div
                        key={job.id}
                        onClick={() => setSelectedMobileJobId(job.id)}
                        className={`p-3 rounded-xl border transition cursor-pointer ${
                          isSelected
                            ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 shadow-md ring-1 ring-blue-500'
                            : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/80 hover:border-slate-400 dark:hover:border-slate-500'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-mono font-bold text-xs text-blue-600 dark:text-blue-400">{job.jobNumber}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                            {job.status}
                          </span>
                        </div>
                        <div className="font-bold text-xs text-slate-900 dark:text-white">{cust?.companyName || cust?.name}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">{job.notes}</div>
                        {coords && (
                          <div className="mt-2 pt-1 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                            <span className="truncate">{coords.locationName || coords.address}</span>
                            <span className="text-amber-600 dark:text-amber-400 font-mono font-semibold">Priority: {job.priority || 'MED'}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right 7 cols: Diagnostic Form or Mini-Map Preview */}
            <div className="lg:col-span-7">
              {selectedJob ? (
                <div className="bg-white dark:bg-slate-900/90 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xl max-h-[720px] overflow-y-auto">
                  {renderInspectionWorkbench(false)}
                </div>
              ) : (
                <div className="bg-white dark:bg-slate-900/90 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center min-h-[500px] text-center">
                  <div className="p-4 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-500/40 text-blue-600 dark:text-blue-400 mb-3">
                    <Wrench className="w-8 h-8" />
                  </div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">No Work Order Selected</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1 mb-4">
                    Select a ticket from the left queue to open the industrial diagnostic checklist, photo capture, and customer sign-off canvas.
                  </p>
                  <div className="h-60 w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
                    <EngineerJobSitesMap
                      jobs={myAssignedJobs}
                      customers={customers}
                      selectedJobId={null}
                      onSelectJob={id => setSelectedMobileJobId(id)}
                      onOpenInspection={id => setSelectedMobileJobId(id)}
                      isCompact={true}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* EXPANDED FULLSCREEN MAP MODAL */}
      {/* ========================================================================= */}
      {showFullscreenMapModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
          <div className="w-full max-w-5xl h-[85vh] bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
            <div className="px-5 py-3.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-white">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
                  <MapIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Field Operations Geospatial Overview</h3>
                  <p className="text-xs text-slate-400">
                    Live assigned job site coordinates for {activeEngineer.name} ({myAssignedJobs.length} active sites)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowFullscreenMapModal(false)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                  title="Close Map View"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 w-full relative">
              <EngineerJobSitesMap
                jobs={myAssignedJobs}
                customers={customers}
                selectedJobId={selectedMapJobId}
                onSelectJob={setSelectedMapJobId}
                onOpenInspection={id => {
                  setShowFullscreenMapModal(false);
                  setSelectedMobileJobId(id);
                }}
                isCompact={false}
              />
            </div>
          </div>
        </div>
      )}

      {/* DOWNLOAD FULL SETUP & REALTIME MODAL */}
      {showSetupModal && (
        <DownloadSetupModal onClose={() => setShowSetupModal(false)} />
      )}
    </div>
  );
};
