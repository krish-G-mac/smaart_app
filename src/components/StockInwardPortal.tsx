import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  PackagePlus,
  Package,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  Clock,
  Building,
  FileText,
  DollarSign,
  Search,
  Plus,
  History,
} from 'lucide-react';
import { InventoryItem } from '../types';

export const StockInwardPortal: React.FC = () => {
  const {
    currentUser,
    items,
    stockInwardLogs,
    addNewItem,
    addStockInward,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'INWARD' | 'NEW_ITEM' | 'LOGS'>('INWARD');

  // Form State: Restock Existing Item
  const [selectedItemId, setSelectedItemId] = useState<string>(items[0]?.id || '');
  const [quantityAdded, setQuantityAdded] = useState<number>(5);
  const [supplierInvoiceNo, setSupplierInvoiceNo] = useState<string>('SUP-INV-' + Math.floor(10000 + Math.random() * 90000));
  const [vendorName, setVendorName] = useState<string>('Industrial Components OEM Ltd');
  const [unitCost, setUnitCost] = useState<number>(0);
  const [inwardNotes, setInwardNotes] = useState<string>('');

  // Form State: Add Brand New Catalog Item
  const [newSku, setNewSku] = useState('');
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<'SPARE_PART' | 'EQUIPMENT' | 'CONSUMABLE' | 'ACCESSORY'>('SPARE_PART');
  const [newDesc, setNewDesc] = useState('');
  const [newPrice, setNewPrice] = useState<number>(5000);
  const [newStock, setNewStock] = useState<number>(10);
  const [newReorderLevel, setNewReorderLevel] = useState<number>(5);
  const [newLeadTime, setNewLeadTime] = useState<number>(7);

  // RBAC GUARD: Only ADMIN and SALES can access
  const isAuthorized = currentUser.role === 'ADMIN' || currentUser.role === 'SALES';

  if (!isAuthorized) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 sm:p-12 text-center max-w-2xl mx-auto space-y-4 shadow-sm">
        <div className="w-16 h-16 bg-rose-100 dark:bg-rose-950/60 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Restricted Stock Addition Portal
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          Warehouse stock addition and inventory catalog registration are strictly permitted for{' '}
          <span className="font-bold text-slate-800 dark:text-slate-200">ADMIN</span> and{' '}
          <span className="font-bold text-slate-800 dark:text-slate-200">SALES</span> personnel.
          You are currently signed in as{' '}
          <span className="font-bold text-blue-600">
            {currentUser.name} ({currentUser.role})
          </span>
          .
        </p>
        <p className="text-xs text-slate-400">
          Switch to an Admin or Sales account to add stock or register catalog SKUs.
        </p>
      </div>
    );
  }

  const selectedItem = items.find(i => i.id === selectedItemId);

  const handleInwardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemId || quantityAdded <= 0) {
      showToast('Please select an item and enter quantity', 'error');
      return;
    }

    addStockInward({
      itemId: selectedItemId,
      quantityAdded,
      supplierInvoiceNo: supplierInvoiceNo.trim() || 'SUP-DIRECT-' + Date.now().toString().slice(-4),
      vendorName: vendorName.trim() || 'Direct OEM Vendor',
      unitCost: unitCost > 0 ? unitCost : Math.round((selectedItem?.unitPrice || 1000) * 0.75),
      notes: inwardNotes.trim() || undefined,
    });

    setQuantityAdded(5);
    setInwardNotes('');
    setSupplierInvoiceNo('SUP-INV-' + Math.floor(10000 + Math.random() * 90000));
  };

  const handleCreateNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSku.trim() || !newName.trim()) {
      showToast('SKU and Item Name are required', 'error');
      return;
    }

    addNewItem({
      sku: newSku.trim().toUpperCase(),
      name: newName.trim(),
      description: newDesc.trim() || 'OEM certified industrial component',
      unitPrice: newPrice,
      stockQuantity: newStock,
      reorderLevel: newReorderLevel,
      leadTimeDays: newLeadTime,
      category: newCategory,
    });

    setNewSku('');
    setNewName('');
    setNewDesc('');
    setNewPrice(5000);
    setNewStock(10);
    setActiveTab('INWARD');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-semibold">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveTab('INWARD')}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-2 ${
              activeTab === 'INWARD'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <PackagePlus className="w-3.5 h-3.5" />
            Stock Inward & Restock
          </button>

          <button
            onClick={() => setActiveTab('NEW_ITEM')}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-2 ${
              activeTab === 'NEW_ITEM'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            Register Brand-New SKU
          </button>

          <button
            onClick={() => setActiveTab('LOGS')}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-2 ${
              activeTab === 'LOGS'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            Inward Audit Ledger ({stockInwardLogs.length})
          </button>
        </div>

        <span className="text-[11px] text-slate-400 px-3">
          Authorized for: <strong className="text-blue-600">ADMIN</strong> & <strong className="text-purple-600">SALES</strong>
        </span>
      </div>

      {/* TAB 1: STOCK INWARD FORM */}
      {activeTab === 'INWARD' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Inward Form */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Log Warehouse Stock Inward
              </h3>
              <p className="text-[11px] text-slate-400">
                Receiving vendor shipments, physical restocks, or procurement batch deliveries
              </p>
            </div>

            <form onSubmit={handleInwardSubmit} className="space-y-4 text-xs">
              {/* Item Selector */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Select Item / Part to Restock *
                </label>
                <select
                  value={selectedItemId}
                  onChange={e => {
                    setSelectedItemId(e.target.value);
                    const itm = items.find(i => i.id === e.target.value);
                    if (itm) {
                      setUnitCost(Math.round(itm.unitPrice * 0.75));
                    }
                  }}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3 font-semibold text-sm"
                >
                  {items.map(i => (
                    <option key={i.id} value={i.id}>
                      {i.name} (SKU: {i.sku}) • Current Stock: {i.stockQuantity}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantity & Unit Cost */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Quantity to Add (Units) *
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={quantityAdded}
                    onChange={e => setQuantityAdded(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 font-bold text-sm"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Purchase Unit Cost (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={unitCost}
                    onChange={e => setUnitCost(parseFloat(e.target.value) || 0)}
                    placeholder="e.g. 8500"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 font-bold text-sm"
                  />
                </div>
              </div>

              {/* Vendor & Invoice Reference */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Supplier / Vendor Invoice # *
                  </label>
                  <input
                    type="text"
                    required
                    value={supplierInvoiceNo}
                    onChange={e => setSupplierInvoiceNo(e.target.value)}
                    placeholder="e.g. INV-BOSCH-8921"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Supplier / Vendor Name
                  </label>
                  <input
                    type="text"
                    value={vendorName}
                    onChange={e => setVendorName(e.target.value)}
                    placeholder="e.g. Rexroth Hydraulics India"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 font-semibold"
                  />
                </div>
              </div>

              {/* Inward Notes */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Receiving Inspection Remarks / Batch ID
                </label>
                <input
                  type="text"
                  value={inwardNotes}
                  onChange={e => setInwardNotes(e.target.value)}
                  placeholder="e.g. Batch #441 verified, QC seal checked, bin location A-12"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5"
                />
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition"
              >
                <PackagePlus className="w-4 h-4" />
                Confirm Stock Inward & Increment Inventory
              </button>
            </form>
          </div>

          {/* Item Real-Time Stock Preview Card */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Selected Item Overview
            </h4>

            {selectedItem ? (
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 font-mono">SKU: {selectedItem.sku}</span>
                  <div className="font-bold text-sm text-slate-900 dark:text-white mt-0.5">
                    {selectedItem.name}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">{selectedItem.description}</p>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl space-y-2 border border-slate-200 dark:border-slate-700">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Current Warehouse Stock:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{selectedItem.stockQuantity} units</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Quantity to Add:</span>
                    <span className="font-bold text-emerald-600">+{quantityAdded} units</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-slate-200 dark:border-slate-700 font-bold">
                    <span>New Warehouse Stock:</span>
                    <span className="text-blue-600 text-sm">
                      {selectedItem.stockQuantity + (quantityAdded || 0)} units
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-blue-50/60 dark:bg-blue-950/20 rounded-2xl border border-blue-200 dark:border-blue-900/40 text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
                  <div className="font-bold text-blue-900 dark:text-blue-300">Automated Pipeline Check:</div>
                  <p className="leading-relaxed">
                    If any Job Card is currently blocked in <strong className="font-semibold text-orange-600">PURCHASE_PENDING</strong> waiting for this item, this inward transaction will automatically advance the card to <strong className="font-semibold text-purple-600">QUOTATION_DRAFTED</strong>!
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400">Select an item above to preview stock metrics.</p>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: REGISTER BRAND NEW ITEM */}
      {activeTab === 'NEW_ITEM' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs max-w-2xl mx-auto space-y-4">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Register New SKU in Inventory Catalog
            </h3>
            <p className="text-[11px] text-slate-400">
              Define product parameters, selling price, lead times, and initial stock
            </p>
          </div>

          <form onSubmit={handleCreateNewItem} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  SKU Code *
                </label>
                <input
                  type="text"
                  required
                  value={newSku}
                  onChange={e => setNewSku(e.target.value)}
                  placeholder="e.g. SEN-PRS-950"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Category *
                </label>
                <select
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value as any)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 font-semibold"
                >
                  <option value="SPARE_PART">Spare Part</option>
                  <option value="EQUIPMENT">Equipment & Systems</option>
                  <option value="CONSUMABLE">Consumable & Seals</option>
                  <option value="ACCESSORY">Accessories & Cables</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Item / Part Name *
              </label>
              <input
                type="text"
                required
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="e.g. Ultra-High Precision Digital Flowmeter 0-100 L/min"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 font-bold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Technical Description
              </label>
              <textarea
                rows={2}
                value={newDesc}
                onChange={e => setNewDesc(e.target.value)}
                placeholder="Specifications, voltage rating, operating temperature range..."
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Selling Rate (₹) *
                </label>
                <input
                  type="number"
                  min={1}
                  required
                  value={newPrice}
                  onChange={e => setNewPrice(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2 font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Initial Stock
                </label>
                <input
                  type="number"
                  min={0}
                  value={newStock}
                  onChange={e => setNewStock(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2 font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Reorder Level
                </label>
                <input
                  type="number"
                  min={1}
                  value={newReorderLevel}
                  onChange={e => setNewReorderLevel(parseInt(e.target.value) || 5)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Lead Time (Days)
                </label>
                <input
                  type="number"
                  min={1}
                  value={newLeadTime}
                  onChange={e => setNewLeadTime(parseInt(e.target.value) || 7)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 flex items-center justify-center gap-1.5 transition"
            >
              <Plus className="w-4 h-4" />
              Save Item to Catalog
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: INWARD AUDIT LEDGER */}
      {activeTab === 'LOGS' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs space-y-2 p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Historical Stock Inward Logs
              </h3>
              <p className="text-[11px] text-slate-400">Audit trail of verified warehouse receipts</p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 font-bold">
              {stockInwardLogs.length} Inward Transactions
            </span>
          </div>

          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-3">Receipt Date</th>
                <th className="p-3">Part / SKU</th>
                <th className="p-3 text-center">Qty Added</th>
                <th className="p-3 text-center">Previous &rarr; New</th>
                <th className="p-3">Vendor / Invoice</th>
                <th className="p-3">Received By</th>
                <th className="p-3 text-right">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {stockInwardLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/60">
                  <td className="p-3 text-slate-500 font-mono text-[11px]">
                    {new Date(log.createdAt).toLocaleDateString()} {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="p-3">
                    <div className="font-bold text-slate-900 dark:text-white">{log.itemName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">SKU: {log.sku}</div>
                  </td>
                  <td className="p-3 text-center font-bold text-emerald-600 text-sm">
                    +{log.quantityAdded}
                  </td>
                  <td className="p-3 text-center font-mono text-slate-500 text-[11px]">
                    {log.previousStock} &rarr; <strong className="text-blue-600">{log.newStock}</strong>
                  </td>
                  <td className="p-3">
                    <div className="font-semibold">{log.vendorName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{log.supplierInvoiceNo}</div>
                  </td>
                  <td className="p-3 font-medium text-slate-700 dark:text-slate-300">
                    {log.addedByName}
                  </td>
                  <td className="p-3 text-right text-slate-500 text-[11px]">
                    {log.notes || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
