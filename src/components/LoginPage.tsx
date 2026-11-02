import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  UserCheck,
  ShieldAlert,
  Wrench,
  Users,
  Building,
  KeyRound,
  CheckCircle2,
  Sun,
  Moon,
} from 'lucide-react';
import { User } from '../types';

export const LoginPage: React.FC = () => {
  const { users, login, loginAsUser, showToast, theme, isDarkMode, setTheme, toggleTheme } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      showToast('Please enter your company email address', 'error');
      return;
    }
    login(email.trim(), password.trim() || undefined);
  };

  return (
    <div className="min-h-screen bg-slate-100/80 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans transition-colors duration-200">
      {/* Top right theme switcher on Login Page */}
      <div className="absolute top-4 right-4 z-20 flex items-center bg-white dark:bg-slate-900 p-1 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md">
        <button
          onClick={() => setTheme('light')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
            !isDarkMode
              ? 'bg-amber-100 text-amber-800 shadow-xs'
              : 'text-slate-400 hover:text-slate-800 dark:hover:text-white'
          }`}
          title="White / Light Theme"
        >
          <Sun className="w-3.5 h-3.5 text-amber-500" />
          <span>White</span>
        </button>
        <button
          onClick={() => setTheme('dark')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
            isDarkMode
              ? 'bg-slate-800 text-blue-300 shadow-xs'
              : 'text-slate-400 hover:text-slate-800 dark:hover:text-white'
          }`}
          title="Dark Theme"
        >
          <Moon className="w-3.5 h-3.5 text-blue-400" />
          <span>Dark</span>
        </button>
      </div>

      {/* Background Decorative Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-500/10 dark:bg-blue-600/15 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-500/10 dark:bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Main Login Card */}
      <div className="w-full max-w-xl bg-white/95 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-tr from-blue-700 to-indigo-600 rounded-2xl shadow-lg shadow-blue-500/20 text-white font-black text-2xl tracking-wider mb-1">
            S
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            SMAART Operations Suite
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            Enterprise Sales & Field Service ERP • State Machine • RBAC Access Portal
          </p>
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Company Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="e.g. arun.sharma@smaart.io"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Password
              </label>
              <span className="text-[11px] text-blue-600 dark:text-blue-400">Default: password123</span>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-12 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-[11px] text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 font-semibold"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition"
          >
            <span>Sign In to Workplace</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* 1-Click Role-Based Quick Demo Logins */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 text-center">
            Or 1-Click Demo Sign In by Role
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {users.map(u => (
              <div
                key={u.id}
                onClick={() => loginAsUser(u)}
                className="p-3 bg-slate-50 dark:bg-slate-800/50 hover:bg-blue-50/50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 hover:border-blue-500/80 rounded-2xl cursor-pointer transition flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={u.avatar}
                    alt={u.name}
                    className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-300 dark:ring-slate-700 group-hover:ring-blue-500 transition"
                  />
                  <div className="truncate text-left">
                    <div className="text-xs font-bold text-slate-900 dark:text-white truncate">{u.name}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <span
                        className={`inline-block w-1.5 h-1.5 rounded-full ${
                          u.role === 'ADMIN'
                            ? 'bg-rose-500'
                            : u.role === 'SALES'
                            ? 'bg-purple-500'
                            : u.role === 'SERVICE_COORDINATOR'
                            ? 'bg-blue-500'
                            : 'bg-emerald-500'
                        }`}
                      ></span>
                      <span className="font-semibold">{u.role}</span>
                    </div>
                  </div>
                </div>

                <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition-transform shrink-0">
                  Login &rarr;
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Security & System Information */}
        <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
            <span>Strict RBAC: Admin only user provisioning & Sales/Admin stock inward</span>
          </div>
          <span className="text-slate-400 dark:text-slate-500">v2.4 Production</span>
        </div>
      </div>
    </div>
  );
};
