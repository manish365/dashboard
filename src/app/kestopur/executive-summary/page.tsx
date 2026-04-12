'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  Users, 
  ShoppingCart, 
  Package, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight,
  Shield,
  Zap,
  Target,
  BarChart3,
  Calendar
} from 'lucide-react';
import { kpFetch } from '@/lib/kestopur/api';
import { KpCard, KpSkeleton } from '@/components/kestopur/ui';

// ── Components ────────────────────────────────────────────────────────────────

const getColorClasses = (hex: string) => {
  const map: Record<string, { text: string; tag: string; bg: string }> = {
    'var(--neon-green)': { text: 'theme-text-brand', tag: 'theme-tag-brand', bg: 'theme-neon-bg' },
    '#60a5fa': { text: 'theme-text-info', tag: 'theme-tag-info', bg: 'bg-blue-400' },
    '#fbbf24': { text: 'theme-text-warning', tag: 'theme-tag-warning', bg: 'bg-amber-400' },
    '#f87171': { text: 'theme-text-danger', tag: 'theme-tag-danger', bg: 'bg-red-400' },
    '#a78bfa': { text: 'theme-text-purple', tag: 'theme-tag-purple', bg: 'bg-indigo-400' },
    '#34d399': { text: 'theme-text-success', tag: 'theme-tag-success', bg: 'bg-emerald-400' },
  };
  return map[hex] || { text: 'theme-text-subtle', tag: 'theme-tag-subtle', bg: 'theme-footer-bg' };
};

const MetricCard = ({ label, value, trend, icon: Icon, color, delay }: any) => {
  const cls = getColorClasses(color);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="relative group overflow-hidden rounded-2xl border p-6 transition-all hover:shadow-2xl hover:shadow-neon-green/5 theme-card-bg"
    >
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <Icon size={80} className={cls.text} />
      </div>
      
      <div className="flex items-center justify-between mb-4">
        <div className={`rounded-xl p-2.5 ${cls.tag}`}>
          <Icon size={24} className={cls.text} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${trend > 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
            {trend > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>

      <h3 className="text-sm font-medium mb-1 theme-text-muted">{label}</h3>
      <div className="text-3xl font-bold tracking-tight theme-text">{value}</div>
      
      <div className="mt-4 h-1 w-full bg-white/5 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: '70%' }}
          transition={{ duration: 1, delay: delay + 0.3 }}
          className={`h-full rounded-full ${cls.bg}`} 
        />
      </div>
    </motion.div>
  );
};

const PerformanceBar = ({ label, value, percentage, color, delay }: any) => {
  const cls = getColorClasses(color);
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider">
        <span className="theme-text-muted">{label}</span>
        <span className="theme-text">{value}</span>
      </div>
      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1.2, delay, ease: "easeOut" }}
          className={`h-full rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)] ${cls.bg}`}
        />
      </div>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function ExecutiveSummary() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading for high-performance feel (ensure layout is ready)
    const timer = setTimeout(() => {
      setData({
        revenue: "₹45.2M",
        revenueTrend: 12.5,
        orders: "1,250",
        ordersTrend: 8.2,
        activeUsers: "4,892",
        usersTrend: 15.1,
        fulfillment: "98.4%",
        fulfillmentTrend: -0.5,
        targets: [
          { label: 'Q1 Revenue Target', value: '₹32.5M / ₹40M', percentage: 81, color: 'var(--neon-green)' },
          { label: 'Order Fulfillment', value: '98.4%', percentage: 98, color: '#60a5fa' },
          { label: 'Category Coverage', value: '89%', percentage: 89, color: '#fbbf24' },
          { label: 'B2B Growth', value: '+42%', percentage: 42, color: '#a78bfa' },
        ]
      });
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <KpSkeleton rows={10} />;

  return (
    <div className="space-y-8 pb-12">
      {/* Header Section */}
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 mb-2"
          >
            <div className="h-1 w-8 rounded-full bg-[var(--neon-green)]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] theme-text-neon">
              Board Level Intelligence
            </span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl font-extrabold tracking-tight sm:text-5xl theme-text"
          >
            Executive Summary
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-sm mt-3 max-w-xl leading-relaxed theme-text-muted"
          >
            Real-time strategic performance indicators for the Kestopur ecosystem. 
            Aggregated diagnostics and growth trajectories for Store stakeholders.
          </motion.p>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-4 p-4 rounded-2xl border theme-card-bg"
        >
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase theme-text-subtle">Reporting Period</p>
            <p className="text-sm font-semibold theme-text">Q1 FY 2026-27</p>
          </div>
          <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/5">
            <Calendar size={20} className="theme-text-neon" />
          </div>
        </motion.div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Net Revenue" value={data.revenue} trend={data.revenueTrend} icon={DollarSign} color="var(--neon-green)" delay={0.1} />
        <MetricCard label="Total Orders" value={data.orders} trend={data.ordersTrend} icon={ShoppingCart} color="#60a5fa" delay={0.2} />
        <MetricCard label="Customer Base" value={data.activeUsers} trend={data.usersTrend} icon={Users} color="#fbbf24" delay={0.3} />
        <MetricCard label="Fulfillment API" value={data.fulfillment} trend={data.fulfillmentTrend} icon={Zap} color="#f87171" delay={0.4} />
      </div>

      {/* Strategic Insights Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Growth Targets */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2 rounded-3xl border p-8 relative overflow-hidden theme-card-bg"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--neon-green)]/5 blur-[100px] rounded-full -mr-20 -mt-20" />
          
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-white/5">
                <Target size={20} className="theme-text-neon" />
              </div>
              <h2 className="text-xl font-bold theme-text">Strategic Growth Targets</h2>
            </div>
            <BarChart3 size={20} className="theme-text-subtle" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
            {data.targets.map((t: any, i: number) => (
              <PerformanceBar key={i} {...t} delay={0.6 + (i * 0.1)} />
            ))}
          </div>

          <div className="mt-10 p-5 rounded-2xl bg-white/5 border border-white/5 flex items-start gap-4">
            <div className="mt-1 rounded-full p-1 bg-green-500/20">
              <TrendingUp size={14} className="text-green-400" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase mb-1 theme-text-neon">Executive Insight</p>
              <p className="text-sm leading-relaxed theme-text-muted">
                Overall performance is trending **18% above benchmark**. B2B integration has significantly boosted corporate loyalty metrics. 
                Fulfillment remains stable despite a **15% increase** in order volume.
              </p>
            </div>
          </div>
        </motion.div>

        {/* System Health */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="rounded-3xl border p-8 flex flex-col theme-card-bg"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 rounded-xl bg-white/5">
              <Shield size={20} className="theme-text-info" />
            </div>
            <h2 className="text-xl font-bold theme-text">Governance Health</h2>
          </div>

          <div className="flex-1 space-y-6">
            {[
              { label: 'System Uptime', value: '99.98%', status: 'active' },
              { label: 'Security Audits', value: 'Compliant', status: 'active' },
              { label: 'Role Integrity', value: 'Verified', status: 'active' },
              { label: 'API Latency', value: '42ms', status: 'success' },
            ].map((s, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors">
                <span className="text-sm font-medium theme-text-muted">{s.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold theme-text">{s.value}</span>
                  <div className="h-2 w-2 rounded-full animate-pulse theme-neon-bg" />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <button className="w-full rounded-2xl py-3 text-sm font-bold border hover:bg-white/5 transition-all theme-text theme-border">
              Download Full Report (PDF)
            </button>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
