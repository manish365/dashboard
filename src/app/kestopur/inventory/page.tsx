'use client';
import { useState, useEffect } from 'react';
import { Package, Plus, AlertTriangle } from 'lucide-react';
import { kpFetch } from '@/lib/kestopur/api';
import { KpPageHeader, KpCard, KpTable, KpBadge, KpSearch, KpSelect, KpSkeleton, KpBtn, KpStatCard } from '@/components/kestopur/ui';

interface InventoryItem { productId: string; variantId?: string; warehouseId: string; availableQuantity: number; reservedQuantity?: number; minimumStockLevel?: number; inventoryStatus?: string; }
interface Warehouse { warehouseId: string; warehouseName: string; }

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [warehouseFilter, setWarehouseFilter] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const params = new URLSearchParams({ ...(warehouseFilter && { warehouseId: warehouseFilter }), ...(lowStockOnly && { lowStock: 'true' }) });
    const [inv, wh] = await Promise.all([kpFetch(`/wp-admin/inventory?${params}`), kpFetch('/wp-admin/warehouses')]);
    setItems(Array.isArray(inv.data) ? inv.data : []);
    setWarehouses(Array.isArray(wh.data) ? wh.data : []);
    setLoading(false);
  };
  useEffect(() => { fetchData(); }, [warehouseFilter, lowStockOnly]);

  const whName = (id: string) => warehouses.find(w => w.warehouseId === id)?.warehouseName || id;
  const lowStockCount = items.filter(i => i.availableQuantity <= (i.minimumStockLevel || 10)).length;

  const filtered = items.filter(i =>
    i.productId?.toLowerCase().includes(search.toLowerCase()) ||
    i.warehouseId?.toLowerCase().includes(search.toLowerCase())
  );

  const cols = [
    { key: 'product', label: 'Product ID', render: (i: InventoryItem) => <span className="text-sm font-mono theme-text">{i.productId?.slice(0, 12)}...</span> },
    { key: 'variant', label: 'Variant', render: (i: InventoryItem) => <span className="text-sm font-mono theme-text-subtle">{i.variantId ? `${i.variantId.slice(0, 8)}...` : '—'}</span> },
    { key: 'warehouse', label: 'Warehouse', render: (i: InventoryItem) => <span className="text-sm theme-text-muted">{whName(i.warehouseId)}</span> },
    { key: 'available', label: 'Available', render: (i: InventoryItem) => <span className="text-sm font-semibold" style={{ color: i.availableQuantity <= (i.minimumStockLevel || 10) ? '#fbbf24' : 'var(--text-color)' }}>{i.availableQuantity}</span> },
    { key: 'reserved', label: 'Reserved', render: (i: InventoryItem) => <span className="text-sm theme-text-subtle">{i.reservedQuantity || 0}</span> },
    { key: 'min', label: 'Min Level', render: (i: InventoryItem) => <span className="text-sm theme-text-subtle">{i.minimumStockLevel || 10}</span> },
    { key: 'status', label: 'Status', render: (i: InventoryItem) => <KpBadge label={i.availableQuantity <= (i.minimumStockLevel || 10) ? 'Low Stock' : 'In Stock'} variant={i.availableQuantity <= (i.minimumStockLevel || 10) ? 'warning' : 'active'} /> },
  ];

  return (
    <div className="space-y-6">
      <KpPageHeader title="Inventory" subtitle="Monitor and manage stock levels across warehouses" action={<KpBtn><Plus className="h-4 w-4" /> Stock Operation</KpBtn>} />
      <div className="grid grid-cols-3 gap-4">
        <KpStatCard label="Total SKUs" value={items.length} icon={Package} color="#60a5fa" />
        <KpStatCard label="Low Stock" value={lowStockCount} icon={AlertTriangle} color="#fbbf24" />
        <KpStatCard label="Active Warehouses" value={warehouses.length} icon={Package} color="#34d399" />
      </div>
      <div className="flex flex-wrap gap-3">
        <KpSearch value={search} onChange={setSearch} placeholder="Search by product or warehouse..." className="flex-1 max-w-sm" />
        <KpSelect value={warehouseFilter} onChange={setWarehouseFilter}>
          <option value="" className="theme-option">All Warehouses</option>
          {warehouses.map(w => <option key={w.warehouseId} value={w.warehouseId} className="theme-option">{w.warehouseName}</option>)}
        </KpSelect>
        <label className="flex items-center gap-2 rounded-xl px-3 py-2 border cursor-pointer hover:bg-white/5 text-sm theme-btn-cancel">
          <input type="checkbox" checked={lowStockOnly} onChange={e => setLowStockOnly(e.target.checked)} className="rounded" />
          <AlertTriangle className="h-3.5 w-3.5" style={{ color: '#fbbf24' }} /> Low Stock Only
        </label>
      </div>
      <KpCard>{loading ? <KpSkeleton /> : <KpTable cols={cols} rows={filtered} rowKey={(i, idx) => `${i.productId}-${idx}`} emptyMsg="No inventory records found." />}</KpCard>
    </div>
  );
}
