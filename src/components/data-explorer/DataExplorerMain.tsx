'use client';

import React, { useState, useEffect } from 'react';
import { TableViewer } from './TableViewer';
import { FilterPanel, FilterItem } from './FilterPanel';
import { SqlEditor } from './SqlEditor';
import { ChartWidget } from './ChartWidget';
import { 
  Database, Search, RefreshCw, LayoutGrid, List, 
  SlidersHorizontal, Terminal, Save, 
  Layout as DashboardIcon, Sparkles, PlusCircle
} from 'lucide-react';

interface DataExplorerMainProps {
  initialConfig?: any;
}

export const DataExplorerMain: React.FC<DataExplorerMainProps> = ({ initialConfig }) => {
  const [view, setView] = useState<'explore' | 'sql' | 'dashboards'>('explore');
  const [tables, setTables] = useState<string[]>([]);
  const [savedQueries, setSavedQueries] = useState<any[]>([]);
  const [dashboards, setDashboards] = useState<any[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [activeSql, setActiveSql] = useState<string>('SELECT * FROM users LIMIT 10;');
  const [schema, setSchema] = useState<any>(null);
  const [filters, setFilters] = useState<FilterItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [sqlLoading, setSqlLoading] = useState(false);
  const [sqlResult, setSqlResult] = useState<any[] | null>(null);

  const fetchTables = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/tables');
      const data = await response.json();
      if (Array.isArray(data)) {
        setTables(data);
      } else {
        console.error('API did not return an array of tables', data);
        setTables([]);
      }
    } catch (err) {
      console.error('Failed to fetch tables', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedQueries = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/saved-queries');
      const data = await response.json();
      setSavedQueries(data);
    } catch (err) {
      console.error('Failed to fetch saved queries', err);
    }
  };

  const fetchDashboards = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/dashboards');
      const data = await response.json();
      setDashboards(data);
    } catch (err) {
      console.error('Failed to fetch dashboards', err);
    }
  };

  const fetchSchema = async (tableName: string) => {
    try {
      const response = await fetch(`http://localhost:8000/api/tables/${tableName}/schema`);
      const data = await response.json();
      setSchema(data);
    } catch (err) {
      console.error('Failed to fetch schema', err);
    }
  };

  const executeRawSql = async (sql: string) => {
    setSqlLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/query/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table: selectedTable || 'query_result', sql: sql })
      });
      const result = await response.json();
      setSqlResult(result.data);
      setActiveSql(sql);
    } catch (err) {
      console.error('Failed to execute SQL', err);
    } finally {
      setSqlLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
    fetchSavedQueries();
    fetchDashboards();
  }, []);

  useEffect(() => {
    if (selectedTable) {
      setFilters([]);
      fetchSchema(selectedTable);
    }
  }, [selectedTable]);

  useEffect(() => {
    if (initialConfig && initialConfig.table) {
      setSelectedTable(initialConfig.table);
      if (initialConfig.filters) {
        setFilters(initialConfig.filters);
      }
    }
  }, [initialConfig]);

  const safeTables = Array.isArray(tables) ? tables : [];
  const filteredTables = safeTables.filter(t => t.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="flex h-[calc(100vh-140px)] gap-6 p-6 bg-[#121212]">
      {/* Tables Sidebar */}
      <div className="w-72 flex flex-col bg-[#191919] rounded-2xl shadow-2xl shadow-black/50 border border-white/5 overflow-hidden shrink-0">
        <div className="p-5 border-b border-white/5 bg-white/2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-[#00E9BF]" />
              <h3 className="font-bold text-white text-sm tracking-tight uppercase">Data Source</h3>
            </div>
            <button 
              onClick={fetchTables}
              className="p-1.5 hover:bg-white/5 rounded-lg transition-colors"
            >
              <RefreshCw className={`h-3.5 w-3.5 text-white/40 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
            <input 
              type="text" 
              placeholder="Search tables..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-[#121212] border border-white/10 rounded-xl text-xs text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-[#00E9BF] transition-all font-medium"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto px-2 py-4">
          <div className="px-3 mb-2">
             <div className="text-[10px] font-black text-white/30 uppercase tracking-widest">Tables ({filteredTables.length})</div>
          </div>
          {filteredTables.length > 0 ? (
            <div className="space-y-1">
              {filteredTables.map(table => (
                <button
                  key={table}
                  onClick={() => {
                    setSelectedTable(table);
                    setView('explore');
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    selectedTable === table 
                      ? 'bg-[#00E9BF] text-[#121212] shadow-lg shadow-[#00E9BF]/20' 
                      : 'text-white/50 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <List className={`h-4 w-4 ${selectedTable === table ? 'text-[#121212]' : 'text-white/20'}`} />
                  <span className="truncate uppercase tracking-wider">{table}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-white/20 italic text-[10px] p-6 text-center uppercase tracking-widest leading-relaxed">
              No tables indexed
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 gap-6 overflow-auto">
        {/* View Switcher */}
        <div className="flex items-center gap-1 bg-[#191919] p-1.5 rounded-2xl border border-white/5 shadow-2xl shadow-black/20 self-start shrink-0">
          <button 
            onClick={() => setView('explore')}
            className={`flex items-center gap-2.5 px-5 py-2 rounded-xl text-xs font-bold transition-all ${
              view === 'explore' ? 'bg-[#00E9BF] text-[#121212] shadow-lg shadow-[#00E9BF]/20' : 'text-white/40 hover:bg-white/5'
            }`}
          >
            <Sparkles className="h-4 w-4" />
            Visual Explorer
          </button>
          <button 
            onClick={() => setView('sql')}
            className={`flex items-center gap-2.5 px-5 py-2 rounded-xl text-xs font-bold transition-all ${
              view === 'sql' ? 'bg-[#00E9BF] text-[#121212] shadow-lg shadow-[#00E9BF]/20' : 'text-white/40 hover:bg-white/5'
            }`}
          >
            <Terminal className="h-4 w-4" />
            SQL Workbench
          </button>
          <button 
            onClick={() => setView('dashboards')}
            className={`flex items-center gap-2.5 px-5 py-2 rounded-xl text-xs font-bold transition-all ${
              view === 'dashboards' ? 'bg-[#00E9BF] text-[#121212] shadow-lg shadow-[#00E9BF]/20' : 'text-white/40 hover:bg-white/5'
            }`}
          >
            <DashboardIcon className="h-4 w-4" />
            Dashboards
          </button>
        </div>

        {view === 'explore' ? (
          <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {selectedTable && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2.5 mb-2">
                  <SlidersHorizontal className="h-5 w-5 text-[#00E9BF]" />
                  <h3 className="text-lg font-black text-white tracking-tight uppercase italic">Query Layers</h3>
                </div>
                <FilterPanel 
                  columns={schema?.columns?.map((c: any) => c.name) || []}
                  filters={filters}
                  onChange={setFilters}
                />
              </div>
            )}
            <TableViewer tableName={selectedTable} filters={filters} />
          </div>
        ) : view === 'sql' ? (
          <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <SqlEditor 
              initialValue={activeSql}
              onExecute={executeRawSql}
              onSave={async (sql, name) => {
                await fetch('http://localhost:8000/api/saved-queries', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ name, sql, table: selectedTable })
                });
                fetchSavedQueries();
              }}
              loading={sqlLoading}
            />
            {sqlResult && (
               <div className="bg-[#191919] rounded-2xl border border-white/5 overflow-hidden shadow-2xl shadow-black/20">
                 <div className="p-4 bg-black/20 border-b border-white/5 flex items-center justify-between">
                   <h4 className="text-xs font-black text-white uppercase tracking-widest">Query Result</h4>
                   <div className="text-[10px] text-white/40 font-bold uppercase">{sqlResult.length} Rows</div>
                 </div>
                  <div className="max-h-[400px] overflow-auto">
                    <table className="w-full text-left border-collapse">
                      <thead className="sticky top-0 bg-[#121212] border-b border-white/5 z-10">
                        <tr>
                          {sqlResult.length > 0 && Object.keys(sqlResult[0]).map(col => (
                            <th key={col} className="px-4 py-3 text-[10px] font-black text-white/30 uppercase tracking-widest">{col}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {sqlResult.map((row, idx) => (
                          <tr key={idx} className="hover:bg-white/2 transition-colors">
                            {Object.values(row).map((val: any, i) => (
                              <td key={i} className="px-4 py-3 text-xs text-white/70 whitespace-nowrap font-medium">
                                {val !== null ? String(val) : <span className="text-white/20 italic">null</span>}
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
        ) : (
          <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-12">
            {dashboards.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-20 bg-[#191919] rounded-[2rem] border-2 border-dashed border-white/5">
                <DashboardIcon className="h-16 w-16 text-white/5 mb-6" />
                <h3 className="text-xl font-black text-white tracking-tight">Intelligence Hub</h3>
                <div className="text-white/40 text-sm mb-8 font-medium">No dashboards configured. Start by pinning your first insight.</div>
                <button 
                  onClick={async () => {
                    await fetch('http://localhost:8000/api/dashboards', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ name: 'System Performance', widgets: [] })
                    });
                    fetchDashboards();
                  }}
                  className="bg-[#00E9BF] text-[#121212] px-8 py-3 rounded-2xl font-black hover:bg-white transition-all shadow-xl shadow-[#00E9BF]/20 active:scale-95"
                >
                  Bootstrap Dashboard
                </button>
              </div>
            ) : (
              dashboards.map(db => (
                <div key={db.id} className="space-y-8">
                  <div className="flex items-center justify-between px-2">
                    <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic">{db.name}</h2>
                    <div className="flex gap-3">
                       <button className="flex items-center gap-2 px-5 py-2.5 bg-[#191919] border border-white/5 rounded-xl text-xs font-bold text-white/60 hover:bg-white/5 transition-all shadow-sm">
                         <PlusCircle className="h-4 w-4" />
                         Add Widget
                       </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                     {/* Demo Widgets */}
                     <ChartWidget 
                        title="Active Users Trend" 
                        type="area" 
                        data={[
                          { name: 'Mon', val: 400 },
                          { name: 'Tue', val: 300 },
                          { name: 'Wed', val: 600 },
                          { name: 'Thu', val: 800 },
                          { name: 'Fri', val: 500 },
                          { name: 'Sat', val: 900 },
                          { name: 'Sun', val: 1000 },
                        ]} 
                        xAxis="name" 
                        yAxis="val" 
                      />
                      <ChartWidget 
                        title="Order Volume by Category" 
                        type="bar" 
                        data={[
                          { name: 'Electronics', val: 2400 },
                          { name: 'Home', val: 1398 },
                          { name: 'Fashion', val: 9800 },
                          { name: 'Beauty', val: 3908 },
                        ]} 
                        xAxis="name" 
                        yAxis="val" 
                      />
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
