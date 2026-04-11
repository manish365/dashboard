'use client';

import React, { useState } from 'react';
import { Sparkles, ArrowRight, Loader2, Database } from 'lucide-react';

interface SearchBarProps {
  onSearch: (config: any) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<any>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try {
      const result = await (await fetch(`http://localhost:8000/api/search/parse?q=${encodeURIComponent(query)}`)).json();
      setPreview(result); onSearch(result);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSearch} className="relative group">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          {loading
            ? <Loader2 className="de-neon h-4 w-4 animate-spin" />
            : <Sparkles className="de-neon h-4 w-4 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500" />
          }
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder='Try "orders price > 100" or "customers city Delhi"'
          className="de-card-bg de-border de-text w-full pl-11 pr-28 py-2.5 border rounded-xl focus:outline-none focus:ring-4 focus:ring-[#00e9bf]/5 focus:border-[#00e9bf] transition-all shadow-xl text-sm font-medium tracking-tight placeholder:opacity-40"
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="de-bg-neon de-text-page absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-2 px-5 py-1.5 rounded-lg font-black uppercase tracking-widest text-[10px] hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 shadow-lg"
        >
          {loading ? 'Thinking...' : 'Explore'}
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </form>

      {preview?.table && (
        <div className="de-card-bg de-border mt-5 flex items-center gap-4 animate-in fade-in slide-in-from-top-3 duration-500 p-3 rounded-2xl border backdrop-blur-sm">
          <span className="de-text-muted text-[10px] font-black uppercase tracking-[0.2em] pl-2">Intent Parsed:</span>
          <div className="flex flex-wrap gap-2.5">
            <div className="de-neon flex items-center gap-2 px-3 py-1.5 bg-[#00e9bf]/10 rounded-xl text-[10px] font-black border border-[#00e9bf]/20 uppercase tracking-widest">
              <Database className="h-3 w-3" />
              Table: {preview.table}
            </div>
            {preview.filters?.map((f: any, i: number) => (
              <div key={i} className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-xl text-[10px] font-black border border-emerald-500/20 uppercase tracking-widest">
                Condition: {f.column} {f.operator} {Array.isArray(f.value) ? f.value.join(' to ') : f.value}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
