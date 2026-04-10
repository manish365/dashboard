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
  { label: 'Equals', value: 'equals' },
  { label: 'Contains', value: 'contains' },
  { label: 'Greater Than', value: '>' },
  { label: 'Less Than', value: '<' },
  { label: 'Is Null', value: 'is_null' }
];

export const FilterPanel: React.FC<FilterPanelProps> = ({ columns, filters, onChange }) => {
  const addFilter = () => {
    onChange([...filters, { column: columns[0] || '', operator: 'equals', value: '' }]);
  };

  const removeFilter = (index: number) => {
    onChange(filters.filter((_, i) => i !== index));
  };

  const updateFilter = (index: number, updates: Partial<FilterItem>) => {
    const newFilters = [...filters];
    newFilters[index] = { ...newFilters[index], ...updates };
    onChange(newFilters);
  };

  return (
    <div className="bg-[#191919] border border-white/5 rounded-2xl p-6 shadow-2xl shadow-black/20">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2.5">
          <Filter className="h-4 w-4 text-[#00E9BF]" />
          <h4 className="text-xs font-black text-white uppercase tracking-widest">Filter Layers</h4>
        </div>
        <button 
          onClick={addFilter}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#00E9BF] hover:text-[#121212] hover:bg-[#00E9BF] bg-[#00E9BF]/5 px-4 py-2 rounded-xl border border-[#00E9BF]/20 transition-all active:scale-95"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Filter
        </button>
      </div>

      <div className="space-y-3">
        {filters.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 bg-[#121212]/50 rounded-xl border border-dashed border-white/5">
            <div className="text-[10px] text-white/20 uppercase font-black tracking-widest italic">No filters active • Scanning all records</div>
          </div>
        ) : (
          filters.map((filter, idx) => (
            <div key={idx} className="flex items-center gap-3 bg-[#121212] p-3 rounded-xl border border-white/5 shadow-sm animate-in fade-in slide-in-from-left-2 duration-300">
              <select 
                value={filter.column}
                onChange={(e) => updateFilter(idx, { column: e.target.value })}
                className="flex-1 min-w-[140px] text-xs h-10 border border-white/10 rounded-xl bg-[#191919] px-4 text-white focus:outline-none focus:ring-1 focus:ring-[#00E9BF] transition-all font-bold"
              >
                {columns.map(col => (
                  <option key={col} value={col}>{col.toUpperCase()}</option>
                ))}
              </select>

              <select 
                value={filter.operator}
                onChange={(e) => updateFilter(idx, { operator: e.target.value })}
                className="w-32 text-xs h-10 border border-white/10 rounded-xl bg-[#191919] px-4 text-white focus:outline-none focus:ring-1 focus:ring-[#00E9BF] transition-all font-bold"
              >
                {OPERATORS.map(op => (
                  <option key={op.value} value={op.value}>{op.label.toUpperCase()}</option>
                ))}
              </select>

              {filter.operator !== 'is_null' && (
                <input 
                  type="text"
                  value={filter.value}
                  onChange={(e) => updateFilter(idx, { value: e.target.value })}
                  placeholder="Enter value..."
                  className="flex-1 min-w-[120px] text-xs h-10 border border-white/10 rounded-xl bg-[#121212] px-4 text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-[#00E9BF] transition-all font-medium"
                />
              )}

              <button 
                onClick={() => removeFilter(idx)}
                className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-xl text-white/20 transition-all active:scale-90"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
