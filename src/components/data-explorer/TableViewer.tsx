'use client';

import React, { useState, useEffect } from 'react';
import { Table, Table2, ChevronLeft, ChevronRight, Loader2, ArrowUpDown } from 'lucide-react';

interface Column {
  name: string;
  type: string;
}

interface TableViewerProps {
  tableName: string;
  filters?: any[];
  onDataFetched?: (data: any[], sql: string) => void;
}


export const TableViewer: React.FC<TableViewerProps> = ({ tableName, filters = [], onDataFetched }) => {
  const [data, setData] = useState<any[]>([]);
  const [sql, setSql] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [limit] = useState(25);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const isAdvanced = filters.length > 0;
      let response;
      
      if (isAdvanced) {
        response = await fetch(`http://localhost:8000/api/query/execute`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            table: tableName,
            filters: filters,
            limit: limit,
            offset: page * limit
          })
        });
      } else {
        response = await fetch(`http://localhost:8000/api/tables/${tableName}/data?limit=${limit}&offset=${page * limit}`);
      }

      if (!response.ok) throw new Error('Failed to fetch data');
      const result = await response.json();
      setData(result.data);
      setSql(result.sql);
      if (onDataFetched) onDataFetched(result.data, result.sql);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    if (tableName) {
      setPage(0);
      fetchData();
    }
  }, [tableName, JSON.stringify(filters)]);


  useEffect(() => {
    if (tableName) {
      fetchData();
    }
  }, [page]);

  if (loading && data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center bg-[#191919] rounded-xl border border-white/5">
        <Loader2 className="h-8 w-8 animate-spin text-[#00E9BF]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-red-950/20 border border-red-900/50 p-6 text-red-500">
        <div className="font-bold flex items-center gap-2 uppercase tracking-tight text-sm">
          <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
          Query Execution Failed
        </div>
        <div className="mt-4 text-xs font-mono bg-black/40 p-4 rounded-xl border border-red-900/20 leading-relaxed">{error}</div>
      </div>
    );
  }

  if (!tableName) {
    return (
      <div className="flex h-64 flex-col items-center justify-center text-white/20 bg-[#191919]/50 rounded-2xl border border-white/5 border-dashed">
        <Table2 className="mb-4 h-12 w-12 opacity-10" />
        <p className="font-black uppercase tracking-[0.2em] text-[10px]">Select a table to start exploring</p>
      </div>
    );
  }

  const columns = data.length > 0 ? Object.keys(data[0]) : [];

  return (
    <div className="flex flex-col h-full bg-[#191919] rounded-2xl shadow-2xl shadow-black/20 border border-white/5 overflow-hidden">
      <div className="flex items-center justify-between p-5 border-b border-white/5 bg-black/10">
        <div className="flex items-center gap-3">
          <Table className="h-5 w-5 text-[#00E9BF]" />
          <h2 className="text-lg font-black text-white tracking-tight uppercase italic">{tableName}</h2>
          <span className="px-2 py-0.5 rounded-md bg-[#00E9BF]/10 text-[#00E9BF] text-[10px] font-black uppercase tracking-widest border border-[#00E9BF]/20">
            READ-ONLY
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0 || loading}
            className="p-2 rounded-xl bg-[#121212] text-white/40 hover:text-white hover:bg-white/5 disabled:opacity-10 border border-white/5 transition-all active:scale-95"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Page {page + 1}</span>
          <button 
            onClick={() => setPage(p => p + 1)}
            disabled={loading || data.length < limit}
            className="p-2 rounded-xl bg-[#121212] text-white/40 hover:text-white hover:bg-white/5 disabled:opacity-10 border border-white/5 transition-all active:scale-95"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-[#121212] border-b border-white/5 z-10">
            <tr>
              {columns.map(col => (
                <th key={col} className="px-4 py-4 text-[10px] font-black text-white/30 uppercase tracking-widest group cursor-pointer hover:bg-white/2 transition-colors">
                  <div className="flex items-center gap-2">
                    {col}
                    <ArrowUpDown className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-[#00E9BF]" />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {data.map((row, idx) => (
              <tr key={idx} className="hover:bg-white/2 transition-colors group">
                {columns.map(col => (
                  <td key={col} className="px-4 py-3.5 text-xs text-white/70 whitespace-nowrap font-medium">
                    {row[col] !== null ? String(row[col]) : <span className="text-white/20 italic">null</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {data.length === 0 && !loading && (
          <div className="flex flex-col h-64 items-center justify-center text-white/20 gap-4">
            <div className="flex flex-col items-center gap-2 opacity-10">
              <Table2 className="h-12 w-12" />
              <div className="font-black uppercase tracking-[0.2em] text-[10px]">No data found matching your filters</div>
            </div>
          </div>
        )}
      </div>

      {sql && (
        <div className="p-4 bg-black/40 text-white/30 text-[10px] font-mono border-t border-white/5 break-all select-all hover:text-[#00E9BF] transition-colors">
          <span className="text-white/20 uppercase mr-3 font-black tracking-widest">Query:</span>
          {sql}
        </div>
      )}
    </div>

  );
};
