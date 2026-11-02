import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Download,
  Upload,
  Radio,
  Smartphone,
  Server,
  Cloud,
  Terminal,
  Check,
  Copy,
  ExternalLink,
  X,
  FileCode,
  ShieldCheck,
  Wifi,
  Database,
  Layers,
  Sparkles,
  RefreshCw,
  FolderDown,
  PlayCircle,
  HelpCircle,
} from 'lucide-react';

interface DownloadSetupModalProps {
  onClose: () => void;
  defaultTab?: 'REALTIME' | 'DOWNLOAD_SETUP' | 'ANDROID_APP' | 'CLOUD_DEPLOY';
}

export const DownloadSetupModal: React.FC<DownloadSetupModalProps> = ({
  onClose,
  defaultTab = 'REALTIME',
}) => {
  const {
    exportDatabaseJSON,
    importDatabaseJSON,
    isRealtimeActive,
    lastRealtimeSyncTime,
    sendRealtimeBroadcastPing,
    jobCards,
    users,
    customers,
    items,
    attendance,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'REALTIME' | 'DOWNLOAD_SETUP' | 'ANDROID_APP' | 'CLOUD_DEPLOY'>(defaultTab);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [importJsonText, setImportJsonText] = useState('');
  const [showImportArea, setShowImportArea] = useState(false);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCodeId(id);
    showToast('Copied to clipboard!', 'info');
    setTimeout(() => {
      setCopiedCodeId(null);
    }, 2000);
  };

  const handleDownloadJSON = () => {
    try {
      const jsonStr = exportDatabaseJSON();
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const filename = `smaart-operations-backup-${new Date().toISOString().slice(0, 10)}.json`;
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast(`Database backup downloaded: ${filename}`, 'success');
    } catch {
      showToast('Failed to export database backup', 'error');
    }
  };

  const handleImportJSON = () => {
    if (!importJsonText.trim()) {
      showToast('Please paste a valid JSON backup text first', 'error');
      return;
    }
    const success = importDatabaseJSON(importJsonText);
    if (success) {
      setShowImportArea(false);
      setImportJsonText('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="w-full max-w-4xl max-h-[92vh] bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden">
        {/* Header Ribbon */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20">
              <Radio className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base sm:text-lg tracking-tight">Real-time Hub & Full Setup Center</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-400 text-slate-950 uppercase">
                  Production Ready
                </span>
              </div>
              <p className="text-xs text-blue-100/90 mt-0.5">
                Multi-device live sync, full project download, and Android APK deployment guide
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition active:scale-95"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 py-2.5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 overflow-x-auto scrollbar-none text-xs font-bold">
          <button
            onClick={() => setActiveTab('REALTIME')}
            className={`px-3.5 py-2 rounded-xl transition flex items-center gap-2 shrink-0 ${
              activeTab === 'REALTIME'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>1. Real-time Live Sync</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </button>

          <button
            onClick={() => setActiveTab('DOWNLOAD_SETUP')}
            className={`px-3.5 py-2 rounded-xl transition flex items-center gap-2 shrink-0 ${
              activeTab === 'DOWNLOAD_SETUP'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <FolderDown className="w-4 h-4" />
            <span>2. Download Full Setup</span>
          </button>

          <button
            onClick={() => setActiveTab('ANDROID_APP')}
            className={`px-3.5 py-2 rounded-xl transition flex items-center gap-2 shrink-0 ${
              activeTab === 'ANDROID_APP'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <Smartphone className="w-4 h-4 text-emerald-300" />
            <span>3. Android Mobile App (APK / PWA)</span>
          </button>

          <button
            onClick={() => setActiveTab('CLOUD_DEPLOY')}
            className={`px-3.5 py-2 rounded-xl transition flex items-center gap-2 shrink-0 ${
              activeTab === 'CLOUD_DEPLOY'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <Cloud className="w-4 h-4" />
            <span>4. Production & Docker</span>
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* ========================================================================= */}
          {/* TAB 1: REALTIME & LIVE SYNC */}
          {/* ========================================================================= */}
          {activeTab === 'REALTIME' && (
            <div className="space-y-6">
              {/* Live Status Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300">
                    <Radio className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase">
                      Live Broadcast Channel
                    </div>
                    <div className="text-sm font-black text-emerald-950 dark:text-white mt-0.5">
                      {isRealtimeActive ? 'ONLINE & ACTIVE' : 'STANDBY'}
                    </div>
                    <div className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-1">
                      Multi-tab & cross-window instant sync
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300">
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-blue-800 dark:text-blue-300 uppercase">
                      Local Persistence Engine
                    </div>
                    <div className="text-sm font-black text-blue-950 dark:text-white mt-0.5">
                      Active Storage (v2.5)
                    </div>
                    <div className="text-[11px] text-blue-700 dark:text-blue-400 mt-1">
                      {jobCards.length} tickets • {attendance.length} punch logs
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300">
                    <Wifi className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-purple-800 dark:text-purple-300 uppercase">
                      Last Heartbeat Ping
                    </div>
                    <div className="text-sm font-black text-purple-950 dark:text-white mt-0.5">
                      {lastRealtimeSyncTime || 'Active Now'}
                    </div>
                    <div className="text-[11px] text-purple-700 dark:text-purple-400 mt-1">
                      Sub-second event propagation
                    </div>
                  </div>
                </div>
              </div>

              {/* Real-time interactive ping tester */}
              <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Test Multi-Device Real-time Broadcast</span>
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl">
                    Open this app in a second browser tab, split-window, or your mobile phone. Click the button below to dispatch a real-time signal across all connected sessions simultaneously!
                  </p>
                </div>

                <button
                  onClick={sendRealtimeBroadcastPing}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-2 transition active:scale-95 shrink-0"
                >
                  <Radio className="w-4 h-4 animate-spin" />
                  <span>Dispatch Real-time Ping</span>
                </button>
              </div>

              {/* How real-time works in this system */}
              <div className="space-y-3">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-500" />
                  <span>How Real-time Operations Function in SMAART Suite</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                    <span className="font-bold text-blue-600 dark:text-blue-400 text-[13px] flex items-center gap-1.5">
                      <Smartphone className="w-4 h-4" /> 1. Field Engineer on Mobile
                    </span>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                      Technicians submit inspection reports, capture photo dockets, and record customer digital signatures on site. Even without cellular service, data buffers in the offline queue (WatermelonDB / IndexedDB) and broadcasts the second network is restored.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 text-[13px] flex items-center gap-1.5">
                      <Server className="w-4 h-4" /> 2. Dispatch Desk & Sales Head
                    </span>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                      As soon as inspection is submitted, the ticket instantly transitions to <strong>INSPECTION_SUBMITTED</strong> on the office desktop. Quotations and invoices auto-calculate parts and labor without needing manual email attachments or phone calls.
                    </p>
                  </div>
                </div>
              </div>

              {/* Code Snippet for Cloud Realtime Listener (Firestore / WebSocket) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <FileCode className="w-4 h-4 text-blue-500" />
                    <span>Firebase Firestore Live Snapshot Listener (Production Code)</span>
                  </span>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        `import { onSnapshot, collection, query, orderBy } from 'firebase/firestore';\nimport { db } from './firebaseConfig';\n\n// Real-time listener for job card workflow\nexport const subscribeToJobCards = (onUpdate) => {\n  const q = query(collection(db, 'jobCards'), orderBy('updatedAt', 'desc'));\n  return onSnapshot(q, (snapshot) => {\n    const jobs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));\n    onUpdate(jobs);\n  });\n};`,
                        'code-firestore'
                      )
                    }
                    className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {copiedCodeId === 'code-firestore' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCodeId === 'code-firestore' ? 'Copied!' : 'Copy Code'}</span>
                  </button>
                </div>

                <pre className="p-3.5 bg-slate-950 text-slate-200 rounded-xl font-mono text-[11px] overflow-x-auto border border-slate-800">
{`import { onSnapshot, collection, query, orderBy } from 'firebase/firestore';
import { db } from './firebaseConfig';

// Real-time listener for job card workflow
export const subscribeToJobCards = (onUpdate) => {
  const q = query(collection(db, 'jobCards'), orderBy('updatedAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const jobs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    onUpdate(jobs);
  });
};`}
                </pre>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: DOWNLOAD FULL SETUP (SOURCE & DATA) */}
          {/* ========================================================================= */}
          {activeTab === 'DOWNLOAD_SETUP' && (
            <div className="space-y-6">
              {/* One-Click Backup Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800/80 dark:to-blue-950/40 border border-blue-200 dark:border-blue-900/60 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-black tracking-wider uppercase text-blue-600 dark:text-blue-400">
                    Instant State & Database Backup
                  </span>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    Download Complete Database & Workflow Snapshot (.json)
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-lg">
                    Includes all {jobCards.length} Job Cards, {users.length} Users, {customers.length} Customers, {items.length} Inventory parts, quotation pricing, and punch attendance history.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDownloadJSON}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-2 transition active:scale-95 shrink-0"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Backup (.json)</span>
                  </button>

                  <button
                    onClick={() => setShowImportArea(!showImportArea)}
                    className="px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                    title="Import or Restore Backup"
                  >
                    <Upload className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Expandable Import Area */}
              {showImportArea && (
                <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 space-y-3 animate-in fade-in">
                  <h5 className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Upload className="w-4 h-4 text-blue-500" />
                    <span>Restore / Import Database JSON</span>
                  </h5>
                  <textarea
                    rows={4}
                    value={importJsonText}
                    onChange={e => setImportJsonText(e.target.value)}
                    placeholder="Paste your JSON backup payload here to restore all data..."
                    className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-mono text-xs focus:ring-2 focus:ring-blue-500 outline-hidden"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setShowImportArea(false)}
                      className="px-3 py-1.5 rounded-xl text-xs font-medium text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleImportJSON}
                      className="px-4 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs"
                    >
                      Restore Database
                    </button>
                  </div>
                </div>
              )}

              {/* Local Machine Development Setup Commands */}
              <div className="space-y-3">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-blue-500" />
                  <span>How to Run Locally on Your Computer (Full Setup)</span>
                </h4>

                <div className="space-y-3 text-xs">
                  {/* Step 1 */}
                  <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        Step 1: Clone or Extract Repository & Install Dependencies
                      </span>
                      <button
                        onClick={() => copyToClipboard('git clone <YOUR_REPO_URL> smaart-ops\ncd smaart-ops\nnpm install', 'cli-step-1')}
                        className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                      >
                        {copiedCodeId === 'cli-step-1' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>Copy</span>
                      </button>
                    </div>
                    <pre className="p-2.5 bg-slate-950 text-emerald-400 rounded-lg font-mono text-[11px] overflow-x-auto">
{`# 1. Clone repository
git clone <YOUR_REPO_URL> smaart-ops
cd smaart-ops

# 2. Install all dependencies (React 19, Tailwind CSS, Lucide, Maps)
npm install`}
                    </pre>
                  </div>

                  {/* Step 2 */}
                  <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        Step 2: Configure Environment Variables (.env)
                      </span>
                      <button
                        onClick={() => copyToClipboard('cp .env.example .env', 'cli-step-2')}
                        className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                      >
                        {copiedCodeId === 'cli-step-2' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>Copy</span>
                      </button>
                    </div>
                    <pre className="p-2.5 bg-slate-950 text-sky-300 rounded-lg font-mono text-[11px] overflow-x-auto">
{`# Copy example environment configuration
cp .env.example .env

# Included environment keys:
# VITE_GOOGLE_MAPS_API_KEY (Demo key pre-configured)
# GEMINI_API_KEY (Server-side Gemini 2.5)
# PORT=3000`}
                    </pre>
                  </div>

                  {/* Step 3 */}
                  <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        Step 3: Launch Local Dev Server (Port 3000)
                      </span>
                      <button
                        onClick={() => copyToClipboard('npm run dev', 'cli-step-3')}
                        className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                      >
                        {copiedCodeId === 'cli-step-3' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>Copy</span>
                      </button>
                    </div>
                    <pre className="p-2.5 bg-slate-950 text-amber-300 rounded-lg font-mono text-[11px] overflow-x-auto">
{`npm run dev

# Ready on http://localhost:3000/
# Open in browser or scan network IP on your Android smartphone!`}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: ANDROID MOBILE APP (APK & PWA) */}
          {/* ========================================================================= */}
          {activeTab === 'ANDROID_APP' && (
            <div className="space-y-6">
              {/* Android Highlights Banner */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-slate-800 border border-emerald-200 dark:border-emerald-800 flex items-start gap-3">
                <div className="p-2.5 rounded-2xl bg-emerald-600 text-white shrink-0 shadow-md">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-black text-sm text-emerald-950 dark:text-white">
                    Deploy as an Authentic Android Smartphone App
                  </h4>
                  <p className="text-xs text-emerald-800 dark:text-emerald-300 mt-1 leading-relaxed">
                    SMAART Operations Suite is tailored with an Android smartphone layout (punch-hole camera, Android status bar, 3-button & gesture navigation, and offline GPS tracking). You can run it on Android via <strong>Capacitor Native APK</strong> or <strong>Android PWA Home Screen</strong>.
                  </p>
                </div>
              </div>

              {/* Method A: Native APK via Capacitor */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-emerald-500" />
                    <span>Method A: Compile Native Android APK (Capacitor)</span>
                  </h4>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        `npm install @capacitor/core @capacitor/cli @capacitor/android\nnpx cap init "SMAART FieldOps" "com.smaart.fieldops" --web-dir dist\nnpm run build\nnpx cap add android\nnpx cap sync\nnpx cap open android`,
                        'apk-commands'
                      )
                    }
                    className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    {copiedCodeId === 'apk-commands' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copy All Commands</span>
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 text-slate-200 font-mono text-[11px] space-y-2 border border-slate-800 overflow-x-auto">
                  <div className="text-slate-400"># 1. Install Capacitor Native Runtime</div>
                  <div className="text-emerald-400">npm install @capacitor/core @capacitor/cli @capacitor/android</div>

                  <div className="text-slate-400 mt-2"># 2. Initialize Android App Profile</div>
                  <div className="text-emerald-400">npx cap init "SMAART FieldOps" "com.smaart.fieldops" --web-dir dist</div>

                  <div className="text-slate-400 mt-2"># 3. Build Web Assets</div>
                  <div className="text-emerald-400">npm run build</div>

                  <div className="text-slate-400 mt-2"># 4. Create Native Android Studio Project</div>
                  <div className="text-emerald-400">npx cap add android</div>
                  <div className="text-emerald-400">npx cap sync</div>

                  <div className="text-slate-400 mt-2"># 5. Build Debug APK directly from terminal (No Android Studio required)</div>
                  <div className="text-emerald-400">cd android && ./gradlew assembleDebug</div>
                  <div className="text-slate-400 mt-1"># Your APK will be generated at:</div>
                  <div className="text-amber-400 font-bold">android/app/build/outputs/apk/debug/app-debug.apk</div>

                  <div className="text-slate-400 mt-2"># Or open in Android Studio GUI:</div>
                  <div className="text-emerald-400">npx cap open android</div>
                </div>

                <div className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5">
                  <div className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span>How to Install the APK on Your Android Device:</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    1. Copy the generated <code className="text-emerald-600 dark:text-emerald-400 font-bold">app-debug.apk</code> to your phone via USB, Google Drive, or WhatsApp.<br />
                    2. Tap the APK file on your Android phone and select <strong>Install</strong>.<br />
                    3. If prompted, allow "Install from unknown sources" in Android settings.
                  </p>
                </div>
              </div>

              {/* Method B: Android PWA (Instant One-Tap Install) */}
              <div className="space-y-3">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-blue-500" />
                  <span>Method B: Instant Install on Android Phone (No Coding / Instant PWA)</span>
                </h4>

                <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row items-center gap-5">
                  {/* QR Code */}
                  <div className="flex flex-col items-center bg-white p-3 rounded-2xl border border-slate-200 shadow-xs shrink-0">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(
                        typeof window !== 'undefined' ? window.location.href : 'https://ais-dev-vcyiqpq4bkzkftpomw37p7-994120543785.asia-east1.run.app'
                      )}`}
                      alt="Scan to open on Android Phone"
                      className="w-32 h-32 object-contain"
                    />
                    <span className="text-[10px] font-bold text-slate-500 mt-1">Scan with Phone Camera</span>
                  </div>

                  {/* Step by step */}
                  <div className="flex-1 space-y-3 text-xs">
                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0">
                        1
                      </span>
                      <div>
                        <strong className="text-slate-900 dark:text-white">Scan the QR code or open link in Chrome on Android:</strong>
                        <div className="mt-1 flex items-center gap-2">
                          <input
                            type="text"
                            readOnly
                            value={typeof window !== 'undefined' ? window.location.href : ''}
                            className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-2.5 py-1 rounded-lg text-[11px] font-mono text-slate-600 dark:text-slate-300 w-full max-w-xs truncate"
                          />
                          <button
                            onClick={() =>
                              copyToClipboard(
                                typeof window !== 'undefined' ? window.location.href : '',
                                'pwa-url'
                              )
                            }
                            className="px-2.5 py-1 bg-blue-600 text-white text-[11px] font-bold rounded-lg hover:bg-blue-500 shrink-0"
                          >
                            {copiedCodeId === 'pwa-url' ? 'Copied!' : 'Copy Link'}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0">
                        2
                      </span>
                      <div>
                        <strong className="text-slate-900 dark:text-white">Tap Chrome 3-dots menu (⋮):</strong>
                        <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                          Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-purple-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0">
                        3
                      </span>
                      <div>
                        <strong className="text-slate-900 dark:text-white">Full-screen Native App Experience:</strong>
                        <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                          It installs as an app on your Android home screen with offline sync, GPS, signature pad, and live push updates!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: PRODUCTION & DOCKER DEPLOYMENT */}
          {/* ========================================================================= */}
          {activeTab === 'CLOUD_DEPLOY' && (
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <Cloud className="w-4 h-4 text-purple-500" />
                    <span>Production Dockerfile</span>
                  </h4>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        `FROM node:20-alpine AS builder\nWORKDIR /app\nCOPY package*.json ./\nRUN npm install\nCOPY . .\nRUN npm run build\n\nFROM node:20-alpine\nWORKDIR /app\nCOPY --from=builder /app/dist ./dist\nCOPY package*.json ./\nRUN npm install --omit=dev\nEXPOSE 3000\nCMD ["npm", "run", "dev"]`,
                        'dockerfile-code'
                      )
                    }
                    className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
                  >
                    {copiedCodeId === 'dockerfile-code' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copy Dockerfile</span>
                  </button>
                </div>

                <pre className="p-4 bg-slate-950 text-slate-200 rounded-xl font-mono text-[11px] overflow-x-auto border border-slate-800">
{`FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY package*.json ./
RUN npm install --omit=dev
EXPOSE 3000
CMD ["npm", "run", "dev"]`}
                </pre>
              </div>

              {/* Cloud Run Deployment command */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                <span className="font-bold text-slate-900 dark:text-white">Deploy to Google Cloud Run (Single Command):</span>
                <pre className="p-2.5 bg-slate-950 text-sky-400 rounded-lg font-mono text-[11px] overflow-x-auto">
{`gcloud run deploy smaart-operations \\
  --source . \\
  --region asia-east1 \\
  --allow-unauthenticated \\
  --port 3000`}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>SMAART Suite v2.5.0 • Google Cloud & Android Native Ready</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadJSON}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON Backup</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
