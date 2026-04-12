'use client';
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3, ChevronRight, Layers, Target, Zap, ArrowLeft,
  LayoutGrid, Activity, Plus, Search, X, TrendingUp, MapPin,
  GitBranch, Share2, Filter,
} from 'lucide-react';

const MOCK_DATA = {
  verticals: [
    { id: 'v1', name: 'E-Commerce', kpis: ['k1', 'k2'], functions: ['f1', 'f2'] },
    { id: 'v2', name: 'Supply Chain', kpis: ['k3'], functions: ['f3'] },
  ],
  functions: [
    { id: 'f1', name: 'Digital Marketing', kpis: ['k4', 'k5'], subFunctions: ['sf1', 'sf2'] },
    { id: 'f2', name: 'Customer Experience', kpis: ['k6'], subFunctions: ['sf3'] },
    { id: 'f3', name: 'Logistics', kpis: ['k7'], subFunctions: ['sf4'] },
  ],
  subFunctions: [
    { id: 'sf1', name: 'Social Media Ad', kpis: ['k8'], tasks: ['t1', 't2'] },
    { id: 'sf2', name: 'SEO Optimization', kpis: ['k9'], tasks: ['t3'] },
    { id: 'sf3', name: 'User Retention', kpis: ['k10'], tasks: ['t4'] },
    { id: 'sf4', name: 'Last Mile Delivery', kpis: ['k7'], tasks: [] },
  ],
  tasks: [
    { id: 't1', name: 'FB Campaign Launch', kpis: ['k11'] },
    { id: 't2', name: 'Instagram Reels Audit', kpis: ['k12'] },
    { id: 't3', name: 'Backlink Building', kpis: ['k13'] },
    { id: 't4', name: 'Churn Analysis', kpis: ['k10'] },
  ],
  kpis: {
    k1: { id: 'k1', name: 'Total Revenue', value: '₹4.2M', target: '₹5.0M', trend: '+12%', color: '#60a5fa' },
    k2: { id: 'k2', name: 'Conversion Rate', value: '3.2%', target: '4.0%', trend: '-2%', color: '#f87171' },
    k3: { id: 'k3', name: 'Service Level', value: '98%', target: '95%', trend: '+5%', color: '#34d399' },
    k4: { id: 'k4', name: 'Ad Spend Efficiency', value: '4.5x', target: '4.0x', trend: '+8%', color: '#818cf8' },
    k5: { id: 'k5', name: 'Organic Traffic', value: '1.2M', target: '1.5M', trend: '+15%', color: '#f97316' },
    k6: { id: 'k6', name: 'NPS Score', value: '72', target: '80', trend: '+2', color: '#ec4899' },
    k7: { id: 'k7', name: 'Delivery Time', value: '2.8d', target: '2.0d', trend: '-10%', color: '#fbbf24' },
    k8: { id: 'k8', name: 'Lead Cost', value: '₹12.5', target: '₹10.0', trend: '+4%', color: '#22d3ee' },
    k9: { id: 'k9', name: 'SERP Rank', value: '#4.2', target: '#3.0', trend: '+0.5', color: '#a78bfa' },
    k10: { id: 'k10', name: 'Churn Rate', value: '1.2%', target: '1.0%', trend: '-0.5%', color: '#fb7185' },
    k11: { id: 'k11', name: 'CPC', value: '₹0.45', target: '₹0.50', trend: '-10%', color: '#2dd4bf' },
    k12: { id: 'k12', name: 'Impr. Share', value: '65%', target: '80%', trend: '+2%', color: '#c084fc' },
    k13: { id: 'k13', name: 'DA Score', value: '45', target: '50', trend: '+3', color: '#94a3b8' },
  } as Record<string, { id: string; name: string; value: string; target: string; trend: string; color: string }>,
};

type Level = { type: string; id: string; label: string };

function findKpiPaths(kpiId: string) {
  const paths: any[] = [];
  MOCK_DATA.verticals.forEach(v => { if (v.kpis.includes(kpiId)) paths.push({ type: 'vertical', ...v }); });
  MOCK_DATA.functions.forEach(f => { if (f.kpis.includes(kpiId)) paths.push({ type: 'function', ...f }); });
  MOCK_DATA.subFunctions.forEach(sf => { if (sf.kpis.includes(kpiId)) paths.push({ type: 'sub-function', ...sf }); });
  MOCK_DATA.tasks.forEach(t => { if (t.kpis.includes(kpiId)) paths.push({ type: 'task', ...t }); });
  return paths;
}

const getColorClasses = (hex: string) => {
  const map: Record<string, { text: string; tag: string }> = {
    '#60a5fa': { text: 'theme-text-info', tag: 'theme-tag-info' },
    '#34d399': { text: 'theme-text-success', tag: 'theme-tag-success' },
    '#fbbf24': { text: 'theme-text-warning', tag: 'theme-tag-warning' },
    '#f87171': { text: 'theme-text-danger', tag: 'theme-tag-danger' },
    '#818cf8': { text: 'theme-text-accent', tag: 'theme-tag-accent' },
    '#f97316': { text: 'theme-text-orange', tag: 'theme-tag-orange' },
    '#a78bfa': { text: 'theme-text-purple', tag: 'theme-tag-purple' },
    '#ec4899': { text: 'theme-text-pink', tag: 'theme-tag-pink' },
    '#2dd4bf': { text: 'theme-text-teal', tag: 'theme-tag-teal' },
    '#fb7185': { text: 'theme-text-rose', tag: 'theme-tag-rose' },
    '#c084fc': { text: 'theme-text-purple', tag: 'theme-tag-purple' },
    '#94a3b8': { text: 'theme-text-subtle', tag: 'theme-tag-subtle' },
    '#22d3ee': { text: 'theme-text-cyan', tag: 'theme-tag-cyan' },
  };
  return map[hex?.toLowerCase()] || { text: 'theme-text-subtle', tag: 'theme-tag-subtle' };
};

function NodeCard({ title, type, icon: Icon, onClick, color }: { title: string; type: string; icon: any; onClick: () => void; color: string }) {
  const cls = getColorClasses(color);
  return (
    <motion.div layoutId={title} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02, y: -3 }} onClick={onClick}
      className="rounded-2xl border cursor-pointer group transition-all hover:border-[var(--neon-green)]/30 theme-card-bg">
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div className={`rounded-xl p-2 ${cls.tag}`}>
            <Icon className={`h-5 w-5 ${cls.text}`} />
          </div>
          <span className="text-[10px] uppercase font-bold tracking-widest theme-text-subtle">{type}</span>
        </div>
        <h4 className="text-base font-bold mb-4 theme-text">{title}</h4>
        <div className="flex items-center gap-1 text-sm font-semibold theme-text-neon">
          Explore <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </motion.div>
  );
}

function KpiCard({ id, onSelect }: { id: string; onSelect: (k: any) => void }) {
  const kpi = MOCK_DATA.kpis[id];
  if (!kpi) return null;
  return (
    <motion.div layout initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
      onClick={() => onSelect(kpi)}
      className="rounded-xl border p-4 cursor-pointer transition-all hover:border-[var(--neon-green)]/40 theme-footer-bg theme-border">
      <div className="flex justify-between items-start mb-2">
        <p className="text-[10px] font-bold uppercase tracking-widest theme-text-subtle">Metric</p>
        <TrendingUp className={`h-3.5 w-3.5 ${getColorClasses(kpi.color).text}`} />
      </div>
      <h5 className="font-bold text-sm mb-3 theme-text">{kpi.name}</h5>
      <div className="flex items-end justify-between">
        <span className="text-xl font-black theme-text">{kpi.value}</span>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getColorClasses(kpi.color).tag}`}>{kpi.trend}</span>
      </div>
    </motion.div>
  );
}

export default function KpiTreePage() {
  const [history, setHistory] = useState<Level[]>([{ type: 'root', id: 'root', label: 'KPI Ecosystem' }]);
  const [search, setSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedKpi, setSelectedKpi] = useState<any>(null);

  const currentLevel = history[history.length - 1];

  const searchResults = useMemo(() => {
    if (!search) return { kpis: [], nodes: [] };
    const q = search.toLowerCase();
    return {
      kpis: Object.values(MOCK_DATA.kpis).filter(k => k.name.toLowerCase().includes(q)),
      nodes: [
        ...MOCK_DATA.verticals.map(v => ({ ...v, type: 'vertical' })),
        ...MOCK_DATA.functions.map(f => ({ ...f, type: 'function' })),
        ...MOCK_DATA.subFunctions.map(sf => ({ ...sf, type: 'sub-function' })),
        ...MOCK_DATA.tasks.map(t => ({ ...t, type: 'task' })),
      ].filter(n => n.name.toLowerCase().includes(q)),
    };
  }, [search]);

  const content = useMemo(() => {
    switch (currentLevel.type) {
      case 'root': return { nodes: MOCK_DATA.verticals.map(v => ({ ...v, type: 'vertical', icon: LayoutGrid, color: '#60a5fa' })), kpis: [] };
      case 'vertical': return { nodes: (MOCK_DATA.verticals.find(x => x.id === currentLevel.id)?.functions || []).map(fid => ({ ...MOCK_DATA.functions.find(x => x.id === fid)!, type: 'function', icon: Layers, color: '#818cf8' })), kpis: MOCK_DATA.verticals.find(x => x.id === currentLevel.id)?.kpis || [] };
      case 'function': return { nodes: (MOCK_DATA.functions.find(x => x.id === currentLevel.id)?.subFunctions || []).map(sid => ({ ...MOCK_DATA.subFunctions.find(x => x.id === sid)!, type: 'sub-function', icon: Zap, color: '#a78bfa' })), kpis: MOCK_DATA.functions.find(x => x.id === currentLevel.id)?.kpis || [] };
      case 'sub-function': return { nodes: (MOCK_DATA.subFunctions.find(x => x.id === currentLevel.id)?.tasks || []).map(tid => ({ ...MOCK_DATA.tasks.find(x => x.id === tid)!, type: 'task', icon: Target, color: '#f97316' })), kpis: MOCK_DATA.subFunctions.find(x => x.id === currentLevel.id)?.kpis || [] };
      case 'task': return { nodes: [], kpis: MOCK_DATA.tasks.find(x => x.id === currentLevel.id)?.kpis || [] };
      default: return { nodes: [], kpis: [] };
    }
  }, [currentLevel]);

  const pushLevel = (node: any) => { setHistory([...history, { type: node.type, id: node.id, label: node.name }]); setSearch(''); setSearchOpen(false); };
  const navigateTo = (node: any) => { setHistory([{ type: 'root', id: 'root', label: 'KPI Ecosystem' }, { type: node.type, id: node.id, label: node.name }]); setSearch(''); setSearchOpen(false); };

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          {history.length > 1 && (
            <button onClick={() => setHistory(h => h.slice(0, -1))}
              className="rounded-xl p-2.5 border hover:bg-white/5 transition-colors theme-text-subtle theme-border">
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}
          <div>
            <div className="flex items-center gap-3">
            <div className="rounded-xl p-2 theme-tag-info">
                <GitBranch className="h-6 w-6 theme-text-info" />
              </div>
              <h1 className="text-2xl font-bold theme-text">KPI Explorer</h1>
            </div>
            {/* Breadcrumbs */}
            <div className="flex items-center gap-1 mt-1 flex-wrap">
              {history.map((h, i) => (
                <span key={i} className="flex items-center gap-1">
                  <button onClick={() => setHistory(history.slice(0, i + 1))}
                    className={`text-xs hover:opacity-80 transition-opacity ${i === history.length - 1 ? 'theme-text' : 'theme-text-subtle'}`}>
                    {h.label}
                  </button>
                  {i < history.length - 1 && <ChevronRight className="h-3 w-3 theme-text-subtle" />}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none theme-text-subtle" />
          <input value={search} onChange={e => { setSearch(e.target.value); setSearchOpen(true); }}
            onFocus={() => setSearchOpen(true)}
            placeholder="Universal search..."
            className="w-full rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none border theme-select theme-border" />
          <AnimatePresence>
            {searchOpen && search && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                className="absolute top-full left-0 right-0 mt-2 rounded-xl border shadow-2xl p-4 z-50 max-h-80 overflow-y-auto theme-card-bg">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest theme-text-subtle">Results</span>
                  <button onClick={() => setSearchOpen(false)} className="theme-text-subtle"><X className="h-4 w-4" /></button>
                </div>
                {searchResults.kpis.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-bold mb-2 flex items-center gap-1 theme-text-info"><TrendingUp className="h-3 w-3" /> KPIs</p>
                    {searchResults.kpis.map(k => (
                      <button key={k.id} onClick={() => setSelectedKpi(k)}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/5 transition-colors flex justify-between items-center">
                        <span className="text-sm font-medium theme-text">{k.name}</span>
                        <span className="text-xs font-mono theme-text-subtle">{k.value}</span>
                      </button>
                    ))}
                  </div>
                )}
                {searchResults.nodes.length > 0 && (
                  <div>
                    <p className="text-xs font-bold mb-2 flex items-center gap-1 theme-text-purple"><Layers className="h-3 w-3" /> Org Units</p>
                    {searchResults.nodes.map((n: any) => (
                      <button key={n.id} onClick={() => navigateTo(n)}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/5 transition-colors flex justify-between items-center">
                        <span className="text-sm font-medium theme-text">{n.name}</span>
                        <span className="text-[10px] uppercase theme-text-subtle">{n.type}</span>
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Main content */}
      <div className="flex gap-6 flex-1 min-h-0">
        {/* Nodes grid */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {content.nodes.map((node: any) => (
                <NodeCard key={node.id} title={node.name} type={node.type} icon={node.icon} color={node.color} onClick={() => pushLevel(node)} />
              ))}
            </AnimatePresence>
            {/* Add node placeholder */}
            <div className="rounded-2xl border-2 border-dashed p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition-colors min-h-[140px] theme-text-subtle theme-border">
              <Plus className="h-8 w-8 mb-2 opacity-50" />
              <span className="text-xs font-bold uppercase tracking-widest opacity-50">Add {currentLevel.type === 'root' ? 'Vertical' : 'Node'}</span>
            </div>
          </div>
        </div>

        {/* KPI sidebar */}
        <div className="w-72 flex-shrink-0 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2 theme-text-subtle">
              <Activity className="h-4 w-4 theme-text-neon" /> Trackers
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full theme-btn-neon">{content.kpis.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-3">
            {content.kpis.length > 0 ? (
              <>
                {content.kpis.map(id => <KpiCard key={id} id={id} onSelect={setSelectedKpi} />)}
                <div className="rounded-xl border-2 border-dashed py-5 flex items-center justify-center cursor-pointer hover:bg-white/5 transition-colors theme-text-subtle theme-border">
                  <Plus className="h-4 w-4 mr-1 opacity-50" />
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-50">Link Metric</span>
                </div>
              </>
            ) : (
              <div className="rounded-xl border p-6 text-center theme-footer-bg theme-border">
                <p className="text-xs font-bold uppercase tracking-widest theme-text-subtle">No metrics linked</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* KPI Detail Drawer */}
      <AnimatePresence>
        {selectedKpi && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedKpi(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-md border-l shadow-2xl z-50 p-8 overflow-y-auto theme-card-bg">
              <div className="flex justify-between items-start mb-8">
                <div className={`rounded-xl p-3 ${getColorClasses(selectedKpi.color).tag}`}>
                  <TrendingUp className={`h-7 w-7 ${getColorClasses(selectedKpi.color).text}`} />
                </div>
                <button onClick={() => setSelectedKpi(null)} className="p-2 rounded-xl hover:bg-white/10 transition-colors theme-text-subtle">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mb-8">
                <span className={`text-[10px] font-bold uppercase tracking-widest block mb-2 ${getColorClasses(selectedKpi.color).text}`}>KPI Performance</span>
                <h2 className="text-3xl font-black mb-5 theme-text">{selectedKpi.name}</h2>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl p-4 theme-footer-bg">
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-1 theme-text-subtle">Current</p>
                    <p className="text-2xl font-black theme-text">{selectedKpi.value}</p>
                  </div>
                  <div className="rounded-xl p-4 theme-footer-bg">
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-1 theme-text-subtle">Trend</p>
                    <p className={`text-2xl font-black ${getColorClasses(selectedKpi.color).text}`}>{selectedKpi.trend}</p>
                  </div>
                </div>
              </div>

              <h3 className="text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2 theme-text-subtle">
                <GitBranch className="h-4 w-4" /> Org Paths
              </h3>
              <div className="space-y-3">
                {findKpiPaths(selectedKpi.id).map((path: any, i: number) => (
                  <button key={i} onClick={() => navigateTo(path)}
                    className="w-full p-4 rounded-xl border text-left hover:border-[var(--neon-green)]/40 transition-all flex items-center gap-3 group theme-footer-bg theme-border">
                    <MapPin className="h-4 w-4 flex-shrink-0 theme-text-subtle" />
                    <div className="flex-1">
                      <p className="text-[10px] font-bold uppercase tracking-widest theme-text-subtle">{path.type}</p>
                      <p className="font-semibold text-sm theme-text">{path.name}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform theme-text-subtle" />
                  </button>
                ))}
                {findKpiPaths(selectedKpi.id).length === 0 && (
                  <p className="text-sm text-center py-4 theme-text-subtle">No org paths found for this KPI.</p>
                )}
              </div>

              <button className="w-full mt-8 py-3 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 theme-btn-neon">
                <Share2 className="h-4 w-4" /> Share Metric
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
