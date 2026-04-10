'use client';

import React, { useState } from 'react';
import { Search, Sparkles, ArrowRight, Loader2 } from 'lucide-react';

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
      const response = await fetch(`http://localhost:8000/api/search/parse?q=${encodeURIComponent(query)}`);
      const result = await response.json();
      setPreview(result);
      onSearch(result);
    } catch (err) {
      console.error('Failed to parse search', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSearch} className="relative group">
        <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
          {loading ? (
            <Loader2 className="h-6 w-6 text-[#00E9BF] animate-spin" />
          ) : (
            <Sparkles className="h-6 w-6 text-[#00E9BF] group-hover:scale-110 group-hover:rotate-12 transition-all duration-500" />
          )}
        </div>
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder='Try "orders price > 100" or "customers city Delhi"'
          className="w-full pl-14 pr-32 py-5 bg-[#191919] border-2 border-white/5 rounded-[2rem] text-white placeholder-white/20 focus:outline-none focus:ring-8 focus:ring-[#00E9BF]/5 focus:border-[#00E9BF] transition-all shadow-2xl shadow-black/20 text-xl font-medium tracking-tight"
        />
        <button 
          type="submit"
          disabled={loading || !query.trim()}
          className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2.5 bg-[#00E9BF] text-[#121212] px-7 py-3 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-white active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 shadow-xl shadow-[#00E9BF]/20"
        >
          {loading ? 'Synthesizing...' : 'Explore'}
          <ArrowRight className="h-4 w-4" />
        </button>
      </form>

      {preview && preview.table && (
        <div className="mt-5 flex items-center gap-4 animate-in fade-in slide-in-from-top-3 duration-500 bg-[#191919]/40 p-3 rounded-2xl border border-white/5 backdrop-blur-sm">
          <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] pl-2">Intent Parsed:</span>
          <div className="flex flex-wrap gap-2.5">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#00E9BF]/10 text-[#00E9BF] rounded-xl text-[10px] font-black border border-[#00E9BF]/20 uppercase tracking-widest">
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
