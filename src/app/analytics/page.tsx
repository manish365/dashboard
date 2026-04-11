'use client';

import React, { useState } from 'react';
import PowerBIEmbed from '@/components/analytics/power-bi-embed';
import { BarChart3, TrendingUp, Users, ShoppingCart, Star, ChevronDown } from 'lucide-react';

const DASHBOARDS = [
  { id: 'sales-trends',   name: 'Monthly Sales Trends',  icon: TrendingUp,   url: 'https://playground.powerbi.com/sampleReportEmbed' },
  { id: 'csat-analysis',  name: 'CSAT & NPS Analysis',   icon: Star,         url: 'https://playground.powerbi.com/sampleReportEmbed' },
  { id: 'employee-perf',  name: 'Employee Performance',  icon: Users,        url: 'https://playground.powerbi.com/sampleReportEmbed' },
  { id: 'vas-attachment', name: 'VAS & SKU Attachment',  icon: ShoppingCart, url: 'https://playground.powerbi.com/sampleReportEmbed' },
];

export default function AnalyticsPage() {
  const [selectedDashboard, setSelectedDashboard] = useState(DASHBOARDS[0]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <div className="flex flex-col gap-6 p-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="theme-text text-2xl font-extrabold tracking-tight mb-1">Analytics & Insights</h1>
          <p className="theme-text-muted text-sm">Real-time business intelligence powered by A&I Team.</p>
        </div>
        <div className="relative">
          <button onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="theme-input theme-border flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition-all hover:opacity-80 min-w-[240px] justify-between">
            <div className="flex items-center gap-2">
              <selectedDashboard.icon className="theme-text-neon h-4 w-4" />
              {selectedDashboard.name}
            </div>
            <ChevronDown className={`h-4 w-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          {isDropdownOpen && (
            <div className="theme-dropdown-bg absolute right-0 top-full z-50 mt-2 w-full rounded-xl border shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="p-1">
                {DASHBOARDS.map((db) => (
                  <button key={db.id} onClick={() => { setSelectedDashboard(db); setIsDropdownOpen(false); }}
                    className={`w-full flex items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-all hover:bg-white/5 ${selectedDashboard.id === db.id ? 'theme-text-neon theme-neon-bg-subtle' : 'theme-text'}`}>
                    <db.icon className="h-4 w-4" />{db.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue',   value: '₹4.2Cr', change: '+12.5%', icon: TrendingUp },
          { label: 'Avg CSAT Score',  value: '4.8',    change: '+0.2',   icon: Star },
          { label: 'Active Users',    value: '1,240',  change: '+8%',    icon: Users },
          { label: 'VAS Attach Rate', value: '32%',    change: '+4.5%',  icon: BarChart3 },
        ].map((kpi, i) => (
          <div key={i} className="theme-card-bg rounded-xl border p-4 transition-all">
            <div className="flex items-center justify-between mb-2">
              <p className="theme-text-subtle text-[10px] font-semibold uppercase tracking-wider">{kpi.label}</p>
              <kpi.icon className="theme-text-neon h-4 w-4 opacity-70" />
            </div>
            <div className="flex items-baseline gap-2">
              <h3 className="theme-text text-xl font-bold">{kpi.value}</h3>
              <span className={`text-[10px] font-bold ${kpi.change.startsWith('+') ? 'text-emerald-400' : 'text-red-400'}`}>{kpi.change}</span>
            </div>
          </div>
        ))}
      </div>

      <PowerBIEmbed key={selectedDashboard.id} reportUrl={selectedDashboard.url} title={selectedDashboard.name} />
    </div>
  );
}
