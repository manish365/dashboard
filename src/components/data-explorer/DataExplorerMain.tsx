'use client';

import React, { useState, useEffect } from 'react';
import { TableViewer } from './TableViewer';
import { FilterPanel, FilterItem } from './FilterPanel';
import { SqlEditor } from './SqlEditor';
import { ChartWidget } from './ChartWidget';
import {
  Database, Search, RefreshCw,
  SlidersHorizontal, Terminal, Save,
  Layout as DashboardIcon, Sparkles, PlusCircle,
  ChevronLeft, ChevronRight, Trash2, History,
  LayoutDashboard, Table as TableIcon
} from 'lucide-react';
import { SearchBar } from './SearchBar';

interface DataExplorerMainProps {
  initialConfig?: any;
}

export const DataExplorerMain: React.FC<DataExplorerMainProps> = ({ initialConfig }) => {
  const [view, setView] = useState<'explore' | 'sql' | 'dashboards'>('explore');
  const [tables, setTables] = useState<string[]>([]);
  const [savedQueries, setSavedQueries] = useState<any[]>([]);
  const [dashboards, setDashboards] = useState<any[]>([]);
  const [selectedTables, setSelectedTables] = useState<string[]>([]);
  const [activeSql, setActiveSql] = useState<string>('SELECT * FROM users LIMIT 10;');
  const [multiSchema, setMultiSchema] = useState<Record<string, any>>({});
  const [filters, setFilters] = useState<FilterItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [sqlLoading, setSqlLoading] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [sqlResult, setSqlResult] = useState<any[] | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTables = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/tables');
      const data = await res.json();
      setTables(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };
  const fetchSavedQueries = async () => {
    try { setSavedQueries(await (await fetch('http://localhost:8000/api/saved-queries')).json()); } catch (e) { console.error(e); }
  };
  const fetchDashboards = async () => {
    try { setDashboards(await (await fetch('http://localhost:8000/api/dashboards')).json()); } catch (e) { console.error(e); }
  };
  const fetchSchema = async (tableNames: string[]) => {
    try {
      const s: Record<string, any> = { ...multiSchema };
      for (const t of tableNames) {
        if (!s[t]) s[t] = await (await fetch(`http://localhost:8000/api/tables/${t}/schema`)).json();
      }
      setMultiSchema(s);
    } catch (e) { console.error(e); }
  };
  const executeRawSql = async (sql: string) => {
    setSqlLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/query/execute', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table: selectedTables[0] || 'query_result', tables: selectedTables, sql })
      });
      const result = await res.json();
      setSqlResult(result.data); setActiveSql(sql);
    } catch (e) { console.error(e); } finally { setSqlLoading(false); }
  };
  const deleteSavedQuery = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try { await fetch(`http://localhost:8000/api/saved-queries/${id}`, { method: 'DELETE' }); fetchSavedQueries(); } catch (e) { console.error(e); }
  };
  const refreshSchema = async () => {
    setRefreshing(true);
    try { await fetch('http://localhost:8000/api/refresh-schema', { method: 'POST' }); await fetchTables(); } catch (e) { console.error(e); } finally { setRefreshing(false); }
  };
  const handleLoadQuery = (q: any) => {
    if (q.sql) { setActiveSql(q.sql); setView('sql'); executeRawSql(q.sql); }
    else if (q.tables || q.table) { setSelectedTables(q.tables || [q.table]); setFilters(q.filters || []); setView('explore'); }
  };

  useEffect(() => { fetchTables(); fetchSavedQueries(); fetchDashboards(); }, []);
  useEffect(() => {
    if (selectedTables.length > 0) fetchSchema(selectedTables);
    else { setFilters([]); setMultiSchema({}); }
  }, [selectedTables]);
  useEffect(() => {
    if (initialConfig && (initialConfig.tables || initialConfig.table)) {
      setSelectedTables(initialConfig.tables || [initialConfig.table]);
      if (initialConfig.filters) setFilters(initialConfig.filters);
    }
  }, [initialConfig]);

  const filteredTables = (Array.isArray(tables) ? tables : []).filter(t =>
    t.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="de-page-bg flex h-[calc(100vh-48px)] gap-6 p-6 relative overflow-hidden">

      {/* Sidebar Toggle */}
      <button
        onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        className="de-card-bg de-border de-text-muted de-hover-neon absolute left-[20px] top-[40px] z-50 p-2 border rounded-full transition-all shadow-xl"
      >
        {isSidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>

      {/* Sidebar */}
      <div className={`de-card-bg de-border flex flex-col rounded-2xl shadow-2xl border overflow-hidden shrink-0 transition-all duration-500 ease-in-out ${isSidebarCollapsed ? 'w-0 opacity-0 -translate-x-full pointer-events-none' : 'w-72'}`}>
        <div className="de-border p-5 border-b">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Database className="de-neon h-4 w-4" />
              <h3 className="de-text font-bold text-sm tracking-tight uppercase">Data Hub</h3>
            </div>
            <button onClick={refreshSchema} disabled={refreshing} className="p-1.5 hover:bg-white/5 rounded-lg transition-colors">
              <RefreshCw className={`de-text-muted h-3.5 w-3.5 ${(loading || refreshing) ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <div className="relative">
            <Search className="de-text-muted absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" />
            <input
              type="text"
              placeholder="Filter resources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="de-input w-full pl-9 pr-4 py-2.5 border rounded-xl text-xs focus:ring-1 focus:ring-[#00e9bf] transition-all font-medium"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto px-2 py-4 space-y-6">
          {/* Tables */}
          <div>
            <div className="de-text-muted px-3 mb-2 text-[10px] font-black uppercase tracking-widest">Tables ({filteredTables.length})</div>
            {filteredTables.length > 0 ? (
              <div className="space-y-1">
                {filteredTables.map(table => {
                  const isSelected = selectedTables.includes(table);
                  return (
                    <button
                      key={table}
                      onClick={() => {
                        setSelectedTables(isSelected ? selectedTables.filter(t => t !== table) : [...selectedTables, table].slice(-3));
                        setView('explore');
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${isSelected ? 'de-bg-neon de-text-page shadow-lg' : 'de-text-muted hover:bg-white/5'}`}
                    >
                      <TableIcon className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate uppercase tracking-wider">{table}</span>
                      {isSelected && selectedTables.length > 1 && (
                        <div className="ml-auto flex items-center justify-center h-4 w-4 rounded-full bg-black/20 text-[8px] font-black shrink-0">
                          {selectedTables.indexOf(table) + 1}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="de-text-muted px-3 py-4 italic text-[10px] text-center uppercase tracking-widest opacity-40">No matches</div>
            )}
          </div>

          {/* Saved Queries */}
          <div>
            <div className="px-3 mb-2 flex items-center justify-between">
              <div className="de-text-muted text-[10px] font-black uppercase tracking-widest">Saved Queries</div>
              <History className="de-text-muted h-3 w-3 opacity-30" />
            </div>
            {savedQueries.length > 0 ? (
              <div className="space-y-1">
                {savedQueries.map(q => (
                  <div key={q.id} className="group relative">
                    <button onClick={() => handleLoadQuery(q)} className="de-text-muted de-hover-text w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[10px] font-bold hover:bg-white/5 transition-all text-left">
                      <div className="h-1.5 w-1.5 rounded-full bg-blue-500/50 shrink-0" />
                      <span className="truncate uppercase tracking-wider">{q.name}</span>
                    </button>
                    <button onClick={(e) => deleteSavedQuery(q.id, e)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-transparent group-hover:text-red-500/50 hover:text-red-500 transition-all rounded-lg">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="de-text-muted px-3 py-4 italic text-[10px] text-center uppercase tracking-widest opacity-40">None yet</div>
            )}
          </div>

          {/* Recent Boards */}
          <div>
            <div className="de-text-muted px-3 mb-2 text-[10px] font-black uppercase tracking-widest">Recent Boards</div>
            <div className="space-y-1">
              {dashboards.map(db => (
                <button key={db.id} onClick={() => setView('dashboards')} className="de-text-muted de-hover-text w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[10px] font-bold hover:bg-white/5 transition-all">
                  <LayoutDashboard className="h-3.5 w-3.5 opacity-30 shrink-0" />
                  <span className="truncate uppercase tracking-wider">{db.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 gap-6 overflow-auto">

        {/* View Switcher */}
        <div className="de-card-bg de-border flex items-center gap-1 p-1.5 rounded-2xl border shadow-2xl self-start shrink-0">
          {([
            { v: 'explore', label: 'Visual Explorer', Icon: Sparkles },
            { v: 'sql', label: 'SQL Workbench', Icon: Terminal },
            { v: 'dashboards', label: 'Dashboards', Icon: DashboardIcon },
          ] as const).map(({ v, label, Icon }) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`flex items-center gap-2.5 px-5 py-2 rounded-xl text-xs font-bold transition-all ${view === v ? 'de-bg-neon de-text-page shadow-lg' : 'de-text-muted hover:bg-white/5'}`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Explore View */}
        {view === 'explore' && (
          <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500 flex-1">
            <div className="shrink-0">
              <SearchBar onSearch={(intent) => {
                if (intent.tables || intent.table) {
                  setSelectedTables(intent.tables || [intent.table]);
                  setFilters(intent.filters || []);
                }
              }} />
            </div>

            {selectedTables.length > 0 ? (
              <div className="flex flex-col gap-6 flex-1 min-h-0">
                <div className="shrink-0 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <SlidersHorizontal className="de-neon h-5 w-5" />
                      <h3 className="de-text text-lg font-black tracking-tight uppercase italic">
                        Refinement Layers
                        {selectedTables.length > 1 && (
                          <span className="de-neon ml-2 text-[10px] bg-[#00e9bf]/10 px-2 py-0.5 rounded-full">Multi-Table Mode</span>
                        )}
                      </h3>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setSelectedTables([])} className="de-card-bg de-border de-text-muted de-hover-text flex items-center gap-2 px-4 py-2 border rounded-xl text-[10px] font-black transition-all">
                        Clear All
                      </button>
                      <button
                        onClick={async () => {
                          const name = prompt('Enter a name for this view:');
                          if (!name) return;
                          await fetch('http://localhost:8000/api/saved-queries', {
                            method: 'POST', headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ name, tables: selectedTables, filters })
                          });
                          fetchSavedQueries();
                        }}
                        className="de-card-bg de-neon de-hover-bg-neon flex items-center gap-2 px-4 py-2 border border-[#00e9bf]/20 rounded-xl text-[10px] font-black transition-all"
                      >
                        <Save className="h-3.5 w-3.5" />
                        Save Insight
                      </button>
                    </div>
                  </div>
                  <FilterPanel
                    columns={Object.values(multiSchema).flatMap((s: any) =>
                      s.columns.map((c: any) => `${s.table_name || 'table'}.${c.name}`)
                    )}
                    filters={filters}
                    onChange={setFilters}
                  />
                </div>
                <div className="flex-1 min-h-0">
                  <TableViewer tableName={selectedTables[0]} tables={selectedTables} filters={filters} />
                </div>
              </div>
            ) : (
              <div className="de-card-bg de-border flex-1 flex flex-col items-center justify-center p-20 rounded-[2rem] border-2 border-dashed">
                <Database className="de-text-muted h-16 w-16 opacity-20 mb-6" />
                <h3 className="de-text text-xl font-black tracking-tight">Intelligence Engine Active</h3>
                <p className="de-text-muted text-sm mb-8 font-medium max-w-md text-center">Use the AI search bar above or select a table from the sidebar to begin deep exploration.</p>
              </div>
            )}
          </div>
        )}

        {/* SQL View */}
        {view === 'sql' && (
          <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <SqlEditor
              initialValue={activeSql}
              onExecute={executeRawSql}
              onSave={async (sql, name) => {
                await fetch('http://localhost:8000/api/saved-queries', {
                  method: 'POST', headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ name, sql, table: selectedTables[0] })
                });
                fetchSavedQueries();
              }}
              loading={sqlLoading}
            />
            {sqlResult && (
              <div className="de-card-bg de-border rounded-2xl border overflow-hidden shadow-2xl">
                <div className="de-toolbar-bg de-border p-4 border-b flex items-center justify-between">
                  <h4 className="de-text text-xs font-black uppercase tracking-widest">Query Result</h4>
                  <div className="de-text-muted text-[10px] font-bold uppercase">{sqlResult.length} Rows</div>
                </div>
                <div className="max-h-[400px] overflow-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="de-input-bg de-border sticky top-0 border-b z-10">
                      <tr>
                        {Object.keys(sqlResult[0] ?? {}).map(col => (
                          <th key={col} className="de-text-muted px-4 py-3 text-[10px] font-black uppercase tracking-widest">{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sqlResult.map((row, idx) => (
                        <tr key={idx} className="de-border de-row border-b transition-colors">
                          {Object.values(row).map((val: any, i) => (
                            <td key={i} className="de-text px-4 py-3 text-xs whitespace-nowrap font-medium">
                              {val !== null ? String(val) : <span className="de-text-muted italic opacity-40">null</span>}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Dashboards View */}
        {view === 'dashboards' && (
          <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-12">
            {dashboards.length === 0 ? (
              <div className="de-card-bg de-border flex flex-col items-center justify-center p-20 rounded-[2rem] border-2 border-dashed">
                <DashboardIcon className="de-text-muted h-16 w-16 opacity-20 mb-6" />
                <h3 className="de-text text-xl font-black tracking-tight">Intelligence Hub</h3>
                <p className="de-text-muted text-sm mb-8 font-medium">No dashboards configured. Start by pinning your first insight.</p>
                <button
                  onClick={async () => {
                    await fetch('http://localhost:8000/api/dashboards', {
                      method: 'POST', headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ name: 'System Performance', widgets: [] })
                    });
                    fetchDashboards();
                  }}
                  className="de-bg-neon de-text-page px-8 py-3 rounded-2xl font-black hover:opacity-90 transition-all shadow-xl active:scale-95"
                >
                  Bootstrap Dashboard
                </button>
              </div>
            ) : (
              dashboards.map(db => (
                <div key={db.id} className="space-y-8">
                  <div className="flex items-center justify-between px-2">
                    <h2 className="de-text text-4xl font-black tracking-tighter uppercase italic">{db.name}</h2>
                    <button className="de-card-bg de-border de-text-muted flex items-center gap-2 px-5 py-2.5 border rounded-xl text-xs font-bold hover:bg-white/5 transition-all">
                      <PlusCircle className="h-4 w-4" />
                      Add Widget
                    </button>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <ChartWidget title="Active Users Trend" type="area" data={[
                      { name: 'Mon', val: 400 }, { name: 'Tue', val: 300 }, { name: 'Wed', val: 600 },
                      { name: 'Thu', val: 800 }, { name: 'Fri', val: 500 }, { name: 'Sat', val: 900 }, { name: 'Sun', val: 1000 },
                    ]} xAxis="name" yAxis="val" />
                    <ChartWidget title="Order Volume by Category" type="bar" data={[
                      { name: 'Electronics', val: 2400 }, { name: 'Home', val: 1398 },
                      { name: 'Fashion', val: 9800 }, { name: 'Beauty', val: 3908 },
                    ]} xAxis="name" yAxis="val" />
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
