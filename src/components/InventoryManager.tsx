import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { InventoryItem } from '../types';
import {
  Package,
  Search,
  Plus,
  AlertTriangle,
  ArrowUpDown,
  Edit2,
  Clock,
  CheckCircle2,
  ShoppingCart,
  Check,
} from 'lucide-react';

export const InventoryManager: React.FC = () => {
  const { items, updateInventoryStock, createPurchaseOrder } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Edit stock modal
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [newStockVal, setNewStockVal] = useState(0);

  // Quick PO modal
  const [poItem, setPoItem] = useState<InventoryItem | null>(null);
  const [poQty, setPoQty] = useState(5);
  const [poSupplier, setPoSupplier] = useState('');

  const filteredItems = items.filter(item => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = categoryFilter === 'ALL' || item.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const lowStockCount = items.filter(i => i.stockQuantity <= i.reorderLevel).length;

  return (
    <div className="space-y-4">
      {/* Top Bar with KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total SKUs in Catalog</span>
          <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">{items.length}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Low or Out-of-Stock SKUs</span>
          <div className="text-xl font-bold text-amber-600 mt-1 flex items-center gap-2">
            {lowStockCount}
            {lowStockCount > 0 && <span className="text-xs font-normal text-amber-500">(Action needed)</span>}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Inventory Valuation</span>
          <div className="text-xl font-bold text-emerald-600 mt-1">
            ₹
            {items
              .reduce((sum, item) => sum + item.unitPrice * item.stockQuantity, 0)
              .toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search spare parts by name, SKU or keyword..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 font-medium"
          >
            <option value="ALL">All Categories</option>
            <option value="SPARE_PART">Spare Parts</option>
            <option value="EQUIPMENT">Equipment & Systems</option>
            <option value="CONSUMABLE">Consumables & Seals</option>
            <option value="ACCESSORY">Accessories</option>
          </select>
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="p-3.5">SKU & Item Name</th>
              <th className="p-3.5">Category</th>
              <th className="p-3.5 text-center">In Stock</th>
              <th className="p-3.5 text-center">Reorder Level</th>
              <th className="p-3.5 text-center">Lead Time</th>
              <th className="p-3.5 text-right">Unit Price (₹)</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {filteredItems.map(item => {
              const isOut = item.stockQuantity === 0;
              const isLow = !isOut && item.stockQuantity <= item.reorderLevel;

              return (
                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition">
                  <td className="p-3.5">
                    <div className="font-bold text-slate-900 dark:text-white">{item.name}</div>
                    <div className="text-[11px] text-slate-400 font-mono">SKU: {item.sku}</div>
                    <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{item.description}</div>
                  </td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                      {item.category}
                    </span>
                  </td>
                  <td className="p-3.5 text-center">
                    <span
                      className={`px-2.5 py-1 rounded-full font-bold text-xs inline-flex items-center gap-1 ${
                        isOut
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                          : isLow
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                      }`}
                    >
                      {item.stockQuantity}
                      {isOut && <span className="text-[10px] uppercase font-black">(OOS)</span>}
                      {isLow && <span className="text-[10px] uppercase font-bold">(Low)</span>}
                    </span>
                  </td>
                  <td className="p-3.5 text-center font-mono text-slate-500">{item.reorderLevel} units</td>
                  <td className="p-3.5 text-center text-slate-500 flex items-center justify-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {item.leadTimeDays} days
                  </td>
                  <td className="p-3.5 text-right font-bold text-slate-900 dark:text-white">
                    ₹{item.unitPrice.toLocaleString('en-IN')}
                  </td>
                  <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                    <button
                      onClick={() => {
                        setEditingItem(item);
                        setNewStockVal(item.stockQuantity);
                      }}
                      className="px-2.5 py-1 text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition"
                    >
                      Adjust Stock
                    </button>
                    <button
                      onClick={() => {
                        setPoItem(item);
                        setPoQty(Math.max(5, item.reorderLevel * 2));
                        setPoSupplier('Global OEM Spares Ltd');
                      }}
                      className="px-2.5 py-1 text-[11px] font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950/60 dark:text-blue-300 rounded-lg transition"
                    >
                      Raise PO
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Adjust Stock Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-60 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 w-full max-w-sm border border-slate-200 dark:border-slate-800 shadow-xl space-y-3">
            <h3 className="font-bold text-sm">Adjust Warehouse Stock</h3>
            <p className="text-xs text-slate-500">
              {editingItem.name} ({editingItem.sku})
            </p>

            <div>
              <label className="text-[10px] font-semibold text-slate-500 block mb-1">New Physical Quantity</label>
              <input
                type="number"
                min={0}
                value={newStockVal}
                onChange={e => setNewStockVal(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2 font-bold text-sm"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setEditingItem(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  updateInventoryStock(editingItem.id, newStockVal);
                  setEditingItem(null);
                }}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold"
              >
                Save Quantity
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Raise PO Modal */}
      {poItem && (
        <div className="fixed inset-0 z-60 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 w-full max-w-md border border-slate-200 dark:border-slate-800 shadow-xl space-y-3 text-xs">
            <h3 className="font-bold text-sm">Raise Manual Purchase Order</h3>
            <p className="text-slate-500">Replenish stock for: {poItem.name}</p>

            <div>
              <label className="text-[10px] font-semibold text-slate-500 block mb-1">Quantity to Order</label>
              <input
                type="number"
                min={1}
                value={poQty}
                onChange={e => setPoQty(parseInt(e.target.value) || 1)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2 font-bold"
              />
            </div>

            <div>
              <label className="text-[10px] font-semibold text-slate-500 block mb-1">Supplier Name</label>
              <input
                type="text"
                value={poSupplier}
                onChange={e => setPoSupplier(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2 font-semibold"
              />
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-[11px] text-slate-500">
              Estimated Delivery: in {poItem.leadTimeDays} days (Lead time)
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setPoItem(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  createPurchaseOrder({
                    itemId: poItem.id,
                    quantity: poQty,
                    supplierName: poSupplier || 'Approved OEM Supplier',
                    unitPrice: Math.round(poItem.unitPrice * 0.75),
                  });
                  setPoItem(null);
                }}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold"
              >
                Create Purchase Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
