'use client';

import React from 'react';
import { Plus, X, Filter } from 'lucide-react';

export interface FilterItem {
  column: string;
  operator: string;
  value: any;
}

interface FilterPanelProps {
  columns: string[];
  filters: FilterItem[];
  onChange: (filters: FilterItem[]) => void;
}

const OPERATORS = [
  { value: 'equals' }, { value: 'contains' },
  { value: '>' }, { value: '<' }, { value: 'is_null' }
];

export const FilterPanel: React.FC<FilterPanelProps> = ({ columns, filters, onChange }) => {
  const add = () => onChange([...filters, { column: columns[0] || '', operator: 'equals', value: '' }]);
  const remove = (i: number) => onChange(filters.filter((_, idx) => idx !== i));
  const update = (i: number, u: Partial<FilterItem>) => {
    const f = [...filters]; f[i] = { ...f[i], ...u }; onChange(f);
  };

  return (
    <div className="de-card-bg de-border rounded-2xl border p-4 shadow-2xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="de-neon h-3.5 w-3.5" />
          <h4 className="de-text text-[10px] font-black uppercase tracking-widest">Filter Layers</h4>
        </div>
        <button onClick={add} className="de-neon de-hover-bg-neon flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest bg-[#00e9bf]/5 px-3 py-1.5 rounded-lg border border-[#00e9bf]/20 transition-all active:scale-95">
          <Plus className="h-3 w-3" />
          Add Layer
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
        {filters.length === 0 ? (
          <div className="de-input-bg de-border md:col-span-2 lg:col-span-3 flex items-center justify-center py-4 rounded-xl border border-dashed">
            <div className="de-text-muted text-[9px] uppercase font-black tracking-widest italic opacity-40">No filters active • Scanning all records</div>
          </div>
        ) : (
          filters.map((filter, idx) => (
            <div key={idx} className="de-input-bg de-border flex items-center gap-1.5 p-2 rounded-xl border shadow-sm animate-in fade-in slide-in-from-left-2 duration-300">
              <select value={filter.column} onChange={(e) => update(idx, { column: e.target.value })}
                className="de-select flex-1 min-w-0 text-[10px] h-8 border rounded-lg px-2 focus:outline-none focus:ring-1 focus:ring-[#00e9bf] transition-all font-bold appearance-none cursor-pointer">
                {columns.map(col => {
                  const parts = col.split('.');
                  return <option key={col} value={col}>{parts.length > 1 ? `${parts[0].toUpperCase()} • ${parts[1].toUpperCase()}` : col.toUpperCase()}</option>;
                })}
              </select>
              <select value={filter.operator} onChange={(e) => update(idx, { operator: e.target.value })}
                className="de-select w-20 text-[10px] h-8 border rounded-lg px-2 focus:outline-none focus:ring-1 focus:ring-[#00e9bf] transition-all font-bold appearance-none cursor-pointer text-center">
                {OPERATORS.map(op => <option key={op.value} value={op.value}>{op.value.toUpperCase()}</option>)}
              </select>
              {filter.operator !== 'is_null' && (
                <input type="text" value={filter.value} onChange={(e) => update(idx, { value: e.target.value })} placeholder="..."
                  className="de-input flex-1 min-w-0 text-[10px] h-8 border rounded-lg px-2 focus:ring-1 focus:ring-[#00e9bf] transition-all font-medium" />
              )}
              <button onClick={() => remove(idx)} className="de-text-muted p-1.5 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-all active:scale-90">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
