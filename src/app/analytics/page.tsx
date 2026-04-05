'use client';

import React, { useState } from 'react';
import PowerBIEmbed from '@/components/analytics/power-bi-embed';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Users, 
  ShoppingCart, 
  Star,
  ChevronDown
} from 'lucide-react';

const DASHBOARDS = [
  { id: 'sales-trends', name: 'Monthly Sales Trends', icon: TrendingUp, url: 'https://playground.powerbi.com/sampleReportEmbed' },
  { id: 'csat-analysis', name: 'CSAT & NPS Analysis', icon: Star, url: 'https://playground.powerbi.com/sampleReportEmbed' },
  { id: 'employee-perf', name: 'Employee Performance', icon: Users, url: 'https://playground.powerbi.com/sampleReportEmbed' },
  { id: 'vas-attachment', name: 'VAS & SKU Attachment', icon: ShoppingCart, url: 'https://playground.powerbi.com/sampleReportEmbed' },
];

export default function AnalyticsPage() {
  const [selectedDashboard, setSelectedDashboard] = useState(DASHBOARDS[0]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <div className="flex flex-col gap-6 p-2">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight mb-1" style={{ color: 'var(--text-color)' }}>
            Analytics & Insights
          </h1>
          <p className="text-sm" style={{ color: 'var(--old-price)' }}>
            Real-time business intelligence and predictive analysis powered by A&I Team.
          </p>
        </div>

        {/* Dashboard Selector */}
        <div className="relative">
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition-all hover:opacity-80 active:scale-95 min-w-[240px] justify-between"
            style={{ background: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--text-color)' }}
          >
            <div className="flex items-center gap-2">
              <selectedDashboard.icon className="h-4 w-4" style={{ color: 'var(--neon-green)' }} />
              {selectedDashboard.name}
            </div>
            <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 top-full z-50 mt-2 w-full origin-top-right overflow-hidden rounded-xl border shadow-2xl animate-in zoom-in-95 duration-200"
              style={{ background: 'var(--navbar-carousel-color)', borderColor: 'var(--header-border)' }}>
              <div className="p-1">
                {DASHBOARDS.map((db) => (
                  <button
                    key={db.id}
                    onClick={() => {
                      setSelectedDashboard(db);
                      setIsDropdownOpen(false);
                    }}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-all hover:bg-white/5 ${
                      selectedDashboard.id === db.id ? 'text-[var(--neon-green)]' : ''
                    }`}
                    style={{ 
                      color: selectedDashboard.id === db.id ? 'var(--neon-green)' : 'var(--text-color)',
                      background: selectedDashboard.id === db.id ? 'rgba(0, 233, 191, 0.08)' : undefined
                    }}
                  >
                    <db.icon className="h-4 w-4" />
                    {db.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* KPI Overlays (Visual Only) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: '₹4.2Cr', change: '+12.5%', color: 'text-emerald-400', icon: TrendingUp },
          { label: 'Avg CSAT Score', value: '4.8', change: '+0.2', color: 'text-indigo-400', icon: Star },
          { label: 'Active Users', value: '1,240', change: '+8%', color: 'text-sky-400', icon: Users },
          { label: 'VAS Attach Rate', value: '32%', change: '+4.5%', color: 'text-amber-400', icon: BarChart3 },
        ].map((kpi, i) => (
          <div key={i} className="rounded-xl border p-4 backdrop-blur-sm group transition-all"
            style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--circle)' }}>{kpi.label}</p>
              <kpi.icon className="h-4 w-4 opacity-70" style={{ color: 'var(--neon-green)' }} />
            </div>
            <div className="flex items-baseline gap-2">
              <h3 className="text-xl font-bold" style={{ color: 'var(--text-color)' }}>{kpi.value}</h3>
              <span className={`text-[10px] font-bold ${kpi.change.startsWith('+') ? 'text-emerald-400' : 'text-red-400'}`}>
                {kpi.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Embed Component */}
      <PowerBIEmbed 
        key={selectedDashboard.id}
        reportUrl={selectedDashboard.url} 
        title={selectedDashboard.name} 
      />
    </div>
  );
}
