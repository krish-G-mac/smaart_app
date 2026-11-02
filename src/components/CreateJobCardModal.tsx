import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { JobType } from '../types';
import { X, Plus, Trash2, Building, User, FileText, CheckCircle2 } from 'lucide-react';

interface CreateJobCardModalProps {
  onClose: () => void;
}

export const CreateJobCardModal: React.FC<CreateJobCardModalProps> = ({ onClose }) => {
  const { customers, users, items, createJobCard } = useApp();

  const [jobType, setJobType] = useState<JobType>('SERVICE');
  const [customerId, setCustomerId] = useState(customers[0]?.id || '');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('MEDIUM');
  const [assignedEngineerId, setAssignedEngineerId] = useState('');
  const [notes, setNotes] = useState('');

  // Initial requirements for sales or service
  const [reqItems, setReqItems] = useState<{ itemId: string; quantity: number }[]>([]);

  const handleAddItem = (itemId: string) => {
    if (!itemId) return;
    const exists = reqItems.find(r => r.itemId === itemId);
    if (exists) {
      setReqItems(prev => prev.map(r => (r.itemId === itemId ? { ...r, quantity: r.quantity + 1 } : r)));
    } else {
      setReqItems(prev => [...prev, { itemId, quantity: 1 }]);
    }
  };

  const handleRemoveItem = (itemId: string) => {
    setReqItems(prev => prev.filter(r => r.itemId !== itemId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) return;

    const initialRequirements = reqItems.map(r => {
      const itm = items.find(i => i.id === r.itemId);
      return {
        itemId: r.itemId,
        quantity: r.quantity,
        isServiceCharge: false,
        rate: itm ? itm.unitPrice : 0,
      };
    });

    createJobCard({
      customerId,
      type: jobType,
      priority,
      notes,
      assignedEngineerId: jobType === 'SERVICE' ? assignedEngineerId || undefined : undefined,
      initialRequirements,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/80">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Create New Job Card</h3>
            <p className="text-xs text-slate-500">Initiate workflow ticket according to SMAART state machine</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Job Type Selector */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Job Type Workflow
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setJobType('SERVICE')}
                className={`p-3.5 rounded-2xl border text-left transition flex items-start gap-3 ${
                  jobType === 'SERVICE'
                    ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100 ring-2 ring-blue-500/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-600">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-xs">SERVICE Job Card</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    Field engineer dispatch, mobile diagnosis, parts logging, labor quote
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setJobType('SALES')}
                className={`p-3.5 rounded-2xl border text-left transition flex items-start gap-3 ${
                  jobType === 'SALES'
                    ? 'border-purple-600 bg-purple-50/70 dark:bg-purple-950/40 text-purple-900 dark:text-purple-100 ring-2 ring-purple-500/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-900/50 text-purple-600">
                  <Building className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-xs">SALES Job Card</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    Direct product purchase, warehouse stock check, PO lead-time if out of stock
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Customer & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                Client / Account
              </label>
              <select
                value={customerId}
                onChange={e => setCustomerId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 font-medium"
              >
                {customers.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.companyName || c.name} ({c.name})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                Priority SLA
              </label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as any)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 font-medium"
              >
                <option value="LOW">Low (Standard SLA)</option>
                <option value="MEDIUM">Medium (Normal SLA 3-5 days)</option>
                <option value="HIGH">High (Urgent 24-48 hrs)</option>
                <option value="CRITICAL">Critical (Emergency 4-8 hrs)</option>
              </select>
            </div>
          </div>

          {/* If Service: Field Engineer Assignment */}
          {jobType === 'SERVICE' && (
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                Assign Field Service Engineer (Optional now or coordinator can dispatch later)
              </label>
              <select
                value={assignedEngineerId}
                onChange={e => setAssignedEngineerId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 font-medium"
              >
                <option value="">-- Leave Unassigned (Dispatch Pending) --</option>
                {users
                  .filter(u => u.role === 'ENGINEER')
                  .map(eng => (
                    <option key={eng.id} value={eng.id}>
                      {eng.name} — {eng.specialty}
                    </option>
                  ))}
              </select>
            </div>
          )}

          {/* If Sales or Initial Items: Pick items */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
              {jobType === 'SALES' ? 'Requested Sales Items' : 'Pre-known Parts (Optional)'}
            </label>
            <div className="flex gap-2 mb-2">
              <select
                id="addItemSelect"
                className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2 text-xs"
              >
                <option value="">Select item from inventory catalog...</option>
                {items.map(item => (
                  <option key={item.id} value={item.id}>
                    {item.name} (Stock: {item.stockQuantity}) - ₹{item.unitPrice.toLocaleString('en-IN')}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => {
                  const sel = document.getElementById('addItemSelect') as HTMLSelectElement;
                  if (sel.value) {
                    handleAddItem(sel.value);
                    sel.value = '';
                  }
                }}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>

            {reqItems.length > 0 && (
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-2 space-y-1 bg-slate-50 dark:bg-slate-800/40">
                {reqItems.map(r => {
                  const item = items.find(i => i.id === r.itemId);
                  return (
                    <div key={r.itemId} className="flex items-center justify-between p-1.5 bg-white dark:bg-slate-900 rounded-lg">
                      <span className="font-semibold truncate max-w-[300px]">{item?.name}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-500 font-mono">Qty: {r.quantity}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(r.itemId)}
                          className="text-red-500 hover:bg-red-50 p-1 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Scope / Notes */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
              Job Notes / Problem Description
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Provide scope, client remarks, machine symptoms, or site constraints..."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Footer Submit */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md shadow-blue-500/20"
            >
              Create Job Card
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
