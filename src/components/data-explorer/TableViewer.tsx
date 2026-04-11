'use client';

import React, { useState, useEffect } from 'react';
import { Table, Table2, ChevronLeft, ChevronRight, Loader2, ArrowUpDown } from 'lucide-react';

interface TableViewerProps {
  tableName: string;
  tables?: string[];
  filters?: any[];
  onDataFetched?: (data: any[], sql: string) => void;
}

export const TableViewer: React.FC<TableViewerProps> = ({ tableName, tables = [], filters = [], onDataFetched }) => {
  const [data, setData] = useState<any[]>([]);
  const [sql, setSql] = useState('');
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [limit] = useState(25);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true); setError(null);
    try {
      const isAdvanced = filters.length > 0 || tables.length > 1;
      const res = isAdvanced
        ? await fetch('http://localhost:8000/api/query/execute', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ table: tableName, tables: tables.length > 1 ? tables : [tableName], filters, limit, offset: page * limit })
          })
        : await fetch(`http://localhost:8000/api/tables/${tableName}/data?limit=${limit}&offset=${page * limit}`);
      if (!res.ok) throw new Error('Failed to fetch data');
      const result = await res.json();
      setData(result.data); setSql(result.sql);
      if (onDataFetched) onDataFetched(result.data, result.sql);
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  };

  useEffect(() => { if (tableName) { setPage(0); fetchData(); } }, [tableName, JSON.stringify(tables), JSON.stringify(filters)]);
  useEffect(() => { if (tableName) fetchData(); }, [page]);

  if (loading && data.length === 0) return (
    <div className="de-card-bg de-border flex h-64 items-center justify-center rounded-xl border">
      <Loader2 className="de-neon h-8 w-8 animate-spin" />
    </div>
  );

  if (error) return (
    <div className="rounded-xl bg-red-950/20 border border-red-900/50 p-6 text-red-500">
      <div className="font-bold flex items-center gap-2 uppercase tracking-tight text-sm">
        <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
        Query Execution Failed
      </div>
      <div className="mt-4 text-xs font-mono bg-black/40 p-4 rounded-xl border border-red-900/20 leading-relaxed">{error}</div>
    </div>
  );

  if (!tableName) return (
    <div className="de-card-bg de-border de-text-muted flex h-64 flex-col items-center justify-center rounded-2xl border-2 border-dashed">
      <Table2 className="mb-4 h-12 w-12 opacity-10" />
      <p className="font-black uppercase tracking-[0.2em] text-[10px]">Select a table to start exploring</p>
    </div>
  );

  const columns = data.length > 0 ? Object.keys(data[0]) : [];

  return (
    <div className="de-card-bg de-border flex flex-col h-full rounded-xl shadow-2xl border overflow-hidden">
      {/* Header */}
      <div className="de-toolbar-bg de-border flex items-center justify-between p-3.5 border-b shrink-0">
        <div className="flex items-center gap-3">
          <Table className="de-neon h-5 w-5" />
          <div className="flex flex-col">
            <h2 className="de-text text-sm font-black tracking-tight uppercase italic leading-none mb-1">
              {tables.length > 1 ? tables.join(' + ') : tableName}
            </h2>
            <div className="flex items-center gap-2">
              <span className="de-neon bg-[#00e9bf]/10 border border-[#00e9bf]/20 px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest">
                {tables.length > 1 ? 'MULTI-TABLE JOIN' : 'READ-ONLY'}
              </span>
              {filters.length > 0 && (
                <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-1.5 py-0.5 rounded-md border border-emerald-500/20">
                  {filters.length} FILTERS ACTIVE
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="de-input-bg de-border flex items-center gap-1.5 p-1 rounded-xl border">
          <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0 || loading} className="de-text-muted p-1.5 rounded-lg hover:bg-white/5 disabled:opacity-10 transition-all active:scale-95">
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <div className="de-text-muted px-2 text-[10px] font-black uppercase tracking-widest min-w-[60px] text-center">Page {page + 1}</div>
          <button onClick={() => setPage(p => p + 1)} disabled={loading || data.length < limit} className="de-text-muted p-1.5 rounded-lg hover:bg-white/5 disabled:opacity-10 transition-all active:scale-95">
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse">
          <thead className="de-input-bg de-border sticky top-0 border-b z-10">
            <tr>
              {columns.map(col => {
                const parts = col.split('_');
                const displayName = parts.length > 1 && tables.includes(parts[0])
                  ? <><span className="de-text-muted opacity-40">{parts[0]}.</span>{parts.slice(1).join('_')}</>
                  : col;
                return (
                  <th key={col} className="de-text-muted px-4 py-3 text-[10px] font-black uppercase tracking-widest group cursor-pointer hover:bg-white/2 transition-colors">
                    <div className="flex items-center gap-2">
                      {displayName}
                      <ArrowUpDown className="de-neon h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={idx} className="de-border de-row border-b transition-colors">
                {columns.map(col => (
                  <td key={col} className="de-text px-4 py-2 text-xs whitespace-nowrap font-medium">
                    {row[col] !== null ? String(row[col]) : <span className="de-text-muted italic opacity-40">null</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {data.length === 0 && !loading && (
          <div className="de-text-muted flex flex-col h-64 items-center justify-center gap-4 opacity-20">
            <Table2 className="h-12 w-12" />
            <div className="font-black uppercase tracking-[0.2em] text-[10px]">No data found matching your filters</div>
          </div>
        )}
      </div>

      {/* SQL Footer */}
      {sql && (
        <div className="de-toolbar-bg de-border de-text-muted de-hover-neon p-4 text-[10px] font-mono border-t break-all select-all transition-colors">
          <span className="uppercase mr-3 font-black tracking-widest">Query:</span>{sql}
        </div>
      )}
    </div>
  );
};
