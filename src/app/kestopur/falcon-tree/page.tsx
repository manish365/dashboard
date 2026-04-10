'use client';
import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutGrid, Layers, Target, Zap, Activity, ChevronRight, ArrowLeft, ArrowRight, RefreshCcw, MousePointer2, Network } from 'lucide-react';

const DATA = {
  verticals: [
    { id: 'v1', name: 'E-Commerce', kpis: ['k1', 'k2'], functions: ['f1', 'f2'] },
    { id: 'v2', name: 'Supply Chain', kpis: ['k3'], functions: ['f3'] },
  ],
  functions: [
    { id: 'f1', name: 'Digital Marketing', kpis: ['k4', 'k5'], subFunctions: ['sf1', 'sf2'], parentId: 'v1' },
    { id: 'f2', name: 'Customer Experience', kpis: ['k6'], subFunctions: ['sf3'], parentId: 'v1' },
    { id: 'f3', name: 'Logistics', kpis: ['k7'], subFunctions: ['sf4'], parentId: 'v2' },
  ],
  subFunctions: [
    { id: 'sf1', name: 'Social Media Ad', kpis: ['k8'], tasks: ['t1', 't2'], parentId: 'f1' },
    { id: 'sf2', name: 'SEO Optimization', kpis: ['k9'], tasks: ['t3'], parentId: 'f1' },
    { id: 'sf3', name: 'User Retention', kpis: ['k10'], tasks: ['t4'], parentId: 'f2' },
    { id: 'sf4', name: 'Warehousing', kpis: ['k7'], tasks: [], parentId: 'f3' },
  ],
  tasks: [
    { id: 't1', name: 'FB Campaign', kpis: ['k8'], parentId: 'sf1' },
    { id: 't2', name: 'Instagram Audit', kpis: ['k8'], parentId: 'sf1' },
    { id: 't3', name: 'Backlink Building', kpis: ['k9'], parentId: 'sf2' },
    { id: 't4', name: 'User Survey', kpis: ['k10'], parentId: 'sf3' },
  ],
  kpis: {
    k1: { id: 'k1', name: 'Total Revenue', value: '₹4.2M', target: '₹5.0M', trend: '+12%' },
    k2: { id: 'k2', name: 'Conversion Rate', value: '3.2%', target: '4.0%', trend: '-2%' },
    k3: { id: 'k3', name: 'Service Level', value: '98%', target: '95%', trend: '+5%' },
    k4: { id: 'k4', name: 'Ad Efficiency', value: '4.5x', target: '4.0x', trend: '+8%' },
    k5: { id: 'k5', name: 'Organic Traffic', value: '1.2M', target: '1.5M', trend: '+15%' },
    k6: { id: 'k6', name: 'NPS Score', value: '72', target: '80', trend: '+2%' },
    k7: { id: 'k7', name: 'Delivery Time', value: '2.8d', target: '2.0d', trend: '-10%' },
    k8: { id: 'k8', name: 'Lead Cost', value: '₹12.5', target: '₹10.0', trend: '+4%' },
    k9: { id: 'k9', name: 'SERP Rank', value: '#4.2', target: '#3.0', trend: '+0.5' },
    k10: { id: 'k10', name: 'Churn Rate', value: '1.2%', target: '1.0%', trend: '-0.5%' },
  } as Record<string, any>,
};

const findParents = (kpiId: string) => {
  const p: any[] = [];
  DATA.verticals.forEach(v => { if (v.kpis.includes(kpiId)) p.push({ ...v, type: 'vertical' }); });
  DATA.functions.forEach(f => { if (f.kpis.includes(kpiId)) p.push({ ...f, type: 'function' }); });
  DATA.subFunctions.forEach(sf => { if (sf.kpis.includes(kpiId)) p.push({ ...sf, type: 'sub-function' }); });
  DATA.tasks.forEach(t => { if (t.kpis.includes(kpiId)) p.push({ ...t, type: 'task' }); });
  return p;
};

function Node({ node, focus, isKpi, onClick }: { node: any; focus: boolean; isKpi?: boolean; onClick: () => void }) {
  return (
    <motion.div layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -3 }} onClick={onClick}
      className="rounded-2xl border cursor-pointer transition-all p-5"
      style={{
        background: focus ? 'var(--neon-green)' : 'var(--foot-color)',
        borderColor: focus ? 'var(--neon-green)' : 'var(--border-color)',
        minWidth: focus ? '16rem' : '12rem', maxWidth: focus ? '18rem' : '14rem',
      }}>
      <div className="flex items-center justify-between mb-3">
        <div className="rounded-lg p-1.5" style={{ background: focus ? 'rgba(0,0,0,0.15)' : 'rgba(0,233,191,0.1)' }}>
          <Activity className="h-4 w-4" style={{ color: focus ? '#000' : 'var(--neon-green)' }} />
        </div>
        <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: focus ? 'rgba(0,0,0,0.5)' : 'var(--circle)' }}>
          {isKpi ? 'KPI' : node.type || 'node'}
        </span>
      </div>
      <h3 className="font-bold text-sm mb-2" style={{ color: focus ? '#000' : 'var(--text-color)' }}>{node.name}</h3>
      {focus && isKpi && (
        <div className="pt-2 border-t border-black/10">
          <p className="text-xl font-black" style={{ color: '#000' }}>{node.value}</p>
          <p className="text-xs mt-0.5" style={{ color: 'rgba(0,0,0,0.6)' }}>Target: {node.target} · {node.trend}</p>
        </div>
      )}
      {focus && !isKpi && (node as any).kpis?.length > 0 && (
        <div className="pt-2 border-t border-black/10 space-y-1.5">
          {(node as any).kpis.slice(0, 2).map((kid: string) => DATA.kpis[kid] && (
            <div key={kid} className="rounded-lg p-2" style={{ background: 'rgba(0,0,0,0.1)' }}>
              <p className="text-[10px]" style={{ color: 'rgba(0,0,0,0.6)' }}>{DATA.kpis[kid].name}</p>
              <p className="text-sm font-black" style={{ color: '#000' }}>{DATA.kpis[kid].value}</p>
            </div>
          ))}
        </div>
      )}
      {!focus && <div className="flex items-center gap-1 text-xs font-semibold mt-2" style={{ color: 'var(--neon-green)' }}>Explore <ChevronRight className="h-3.5 w-3.5" /></div>}
    </motion.div>
  );
}

export default function FalconTreePage() {
  const [current, setCurrent] = useState<any>({ node: DATA.verticals[0], type: 'vertical' });
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const upd = () => { if (ref.current) setSize({ w: ref.current.offsetWidth, h: ref.current.offsetHeight }); };
    upd(); window.addEventListener('resize', upd); return () => window.removeEventListener('resize', upd);
  }, []);

  const layers = useMemo(() => {
    let parents: any[] = [], children: any[] = [];
    if (current.type === 'kpi') { parents = findParents(current.node.id); }
    else if (current.type === 'vertical') { children = current.node.functions.map((id: string) => ({ ...DATA.functions.find(x => x.id === id), type: 'function' })).filter((x: any) => x.id); }
    else if (current.type === 'function') { parents = [DATA.verticals.find(x => x.id === current.node.parentId)].filter(Boolean).map(x => ({ ...x, type: 'vertical' })); children = (current.node.subFunctions || []).map((id: string) => ({ ...DATA.subFunctions.find(x => x.id === id), type: 'sub-function' })).filter((x: any) => x.id); }
    else if (current.type === 'sub-function') { parents = [DATA.functions.find(x => x.id === current.node.parentId)].filter(Boolean).map(x => ({ ...x, type: 'function' })); children = (current.node.tasks || []).map((id: string) => ({ ...DATA.tasks.find(x => x.id === id), type: 'task' })).filter((x: any) => x.id); }
    else if (current.type === 'task') { parents = [DATA.subFunctions.find(x => x.id === current.node.parentId)].filter(Boolean).map(x => ({ ...x, type: 'sub-function' })); }
    return { parents, focus: current.node, focusType: current.type, children };
  }, [current]);

  const click = (node: any, type?: string) => {
    if (!node) return;
    const t = type || (node.functions ? 'vertical' : node.subFunctions ? 'function' : node.tasks !== undefined ? 'sub-function' : 'task');
    setCurrent({ node, type: t });
  };

  const cy = size.h / 2;

  return (
    <div className="flex flex-col rounded-xl border overflow-hidden" style={{ height: 'calc(100vh - 8rem)', background: 'var(--croma-wall)', borderColor: 'var(--border-color)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0" style={{ borderColor: 'var(--border-color)' }}>
        <div className="flex items-center gap-3">
          <div className="rounded-xl p-2.5" style={{ background: 'rgba(0,233,191,0.1)' }}>
            <Network className="h-5 w-5" style={{ color: 'var(--neon-green)' }} />
          </div>
          <div>
            <h1 className="text-lg font-black" style={{ color: 'var(--text-color)' }}>Falcon <span style={{ color: 'var(--neon-green)' }}>Ecosystem</span></h1>
            <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--circle)' }}>Multi-Parent Dependency Map</p>
          </div>
        </div>
        <button onClick={() => setCurrent({ node: DATA.verticals[0], type: 'vertical' })}
          className="flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold border hover:bg-white/5 transition-colors"
          style={{ borderColor: 'var(--border-color)', color: 'var(--old-price)' }}>
          <RefreshCcw className="h-3.5 w-3.5" /> Reset
        </button>
      </div>

      {/* Canvas */}
      <div ref={ref} className="flex-1 relative flex items-center justify-between px-12 overflow-hidden">
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {layers.parents.map((p, i) => {
            const total = layers.parents.length;
            const sy = total > 1 ? (size.h / (total + 1)) * (i + 1) : cy;
            const mx = (size.w * 0.22 + size.w * 0.36) / 2;
            return <motion.path key={p.id} initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} d={`M ${size.w * 0.22} ${sy} C ${mx} ${sy} ${mx} ${cy} ${size.w * 0.36} ${cy}`} stroke="var(--neon-green)" strokeWidth={1.5} strokeOpacity={0.25} fill="none" />;
          })}
          {layers.children.map((c, i) => {
            const total = layers.children.length;
            const ey = (size.h / (total + 1)) * (i + 1);
            const mx = (size.w * 0.64 + size.w * 0.78) / 2;
            return <motion.path key={c.id} initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} d={`M ${size.w * 0.64} ${cy} C ${mx} ${cy} ${mx} ${ey} ${size.w * 0.78} ${ey}`} stroke="var(--neon-green)" strokeWidth={1.5} strokeOpacity={0.25} fill="none" />;
          })}
        </svg>

        {/* Parents col */}
        <div className="w-1/4 h-full flex flex-col items-center justify-center gap-4 overflow-y-auto py-8">
          <AnimatePresence mode="popLayout">
            {layers.parents.length > 0 ? layers.parents.map(p => (
              <Node key={p.id} node={p} focus={false} onClick={() => click(p)} />
            )) : (
              <div className="rounded-2xl border-2 border-dashed p-8 text-center opacity-20" style={{ borderColor: 'var(--border-color)' }}>
                <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: 'var(--circle)' }}>Root Domain</p>
              </div>
            )}
          </AnimatePresence>
          {layers.parents.length > 0 && <p className="text-[9px] font-black uppercase tracking-widest flex items-center gap-1 opacity-40" style={{ color: 'var(--neon-green)' }}><ArrowLeft className="h-3 w-3" /> Source</p>}
        </div>

        {/* Focus col */}
        <div className="w-1/3 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <Node key={layers.focus.id} node={layers.focus} focus isKpi={current.type === 'kpi'} onClick={() => {}} />
          </AnimatePresence>
        </div>

        {/* Children col */}
        <div className="w-1/4 h-full flex flex-col items-center justify-center gap-4 overflow-y-auto py-8">
          <AnimatePresence mode="popLayout">
            {layers.children.length > 0 ? layers.children.map(c => (
              <Node key={c.id} node={c} focus={false} onClick={() => click(c)} />
            )) : (
              <div className="rounded-2xl border-2 border-dashed p-8 text-center opacity-20" style={{ borderColor: 'var(--border-color)' }}>
                <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: 'var(--circle)' }}>{current.type === 'kpi' ? 'Terminal' : 'End of Stream'}</p>
              </div>
            )}
          </AnimatePresence>
          {layers.children.length > 0 && <p className="text-[9px] font-black uppercase tracking-widest flex items-center gap-1 opacity-40" style={{ color: 'var(--neon-green)' }}>Impact <ArrowRight className="h-3 w-3" /></p>}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-6 py-3 border-t flex-shrink-0" style={{ borderColor: 'var(--border-color)' }}>
        <p className="text-[10px] font-bold flex items-center gap-2" style={{ color: 'var(--circle)' }}>
          <MousePointer2 className="h-3.5 w-3.5" /> Click any node to drill into context
        </p>
        <button className="rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-widest" style={{ background: 'var(--neon-green)', color: 'var(--text-color-black)' }}>
          Analyze Shared Impact
        </button>
      </div>
    </div>
  );
}
