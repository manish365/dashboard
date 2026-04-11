'use client';
import { useState, useEffect } from 'react';
import { TrendingUp, Bug, Leaf, MessageSquare, ArrowRight, Sprout } from 'lucide-react';
import Link from 'next/link';
import agropilotApi from '@/lib/agropilot/api';
import { useAgroAuthStore } from '@/stores/agropilot';

const CHART_DATA = [
  { month: 'Sep', yield: 3.8 }, { month: 'Oct', yield: 4.1 },
  { month: 'Nov', yield: 3.5 }, { month: 'Dec', yield: 4.6 },
  { month: 'Jan', yield: 4.2 }, { month: 'Feb', yield: 4.8 },
];

const DEMO_STATS = {
  total_predictions: 47, total_chats: 23, accuracy_rate: 0.89,
  crops_analyzed: ['Rice', 'Wheat', 'Maize', 'Soybean', 'Tomato'],
  recent_predictions: [
    { id: '1', type: 'yield',       crop: 'Rice',  result: '4.2 tons/ha',           date: '2024-01-15' },
    { id: '2', type: 'disease',     crop: 'Wheat', result: 'Wheat Rust detected',    date: '2024-01-14' },
    { id: '3', type: 'fertilizer',  crop: 'Maize', result: 'NPK 20-20-20 @ 250kg/ha', date: '2024-01-13' },
  ],
};

// Dynamic per-type colors — cannot be CSS classes
const TYPE_COLORS: Record<string, string> = {
  yield: 'var(--neon-green)', disease: '#f87171', fertilizer: '#fbbf24',
};

export default function AgroPilotDashboard() {
  const { user, isAuthenticated } = useAgroAuthStore();
  const [stats, setStats] = useState(DEMO_STATS);

  useEffect(() => {
    if (!isAuthenticated()) return;
    agropilotApi.get('/api/dashboard/stats').then((r) => setStats(r.data)).catch(() => {});
  }, []);

  const summaryCards = [
    { label: 'Predictions', value: stats.total_predictions,                    icon: TrendingUp,   color: 'var(--neon-green)' },
    { label: 'Chats',       value: stats.total_chats,                          icon: MessageSquare,color: '#60a5fa' },
    { label: 'Accuracy',    value: `${Math.round(stats.accuracy_rate * 100)}%`,icon: Leaf,         color: '#fbbf24' },
    { label: 'Crops',       value: stats.crops_analyzed.length,                icon: Bug,          color: '#c084fc' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="theme-neon-bg-subtle rounded-xl p-2.5">
          <Sprout className="theme-text-neon h-6 w-6" />
        </div>
        <div>
          <h1 className="theme-text text-2xl font-bold">AgroPilot {user ? `— ${user.name.split(' ')[0]}` : ''}</h1>
          <p className="theme-text-muted text-sm">AI-powered farming intelligence</p>
        </div>
      </div>

      {/* Stats — color is dynamic prop, stays as style */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {summaryCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="theme-card-bg rounded-xl border p-5 transition-all">
            <div className="rounded-lg p-2.5 w-fit mb-3" style={{ background: `${color}15` }}>
              <Icon className="h-5 w-5" style={{ color }} />
            </div>
            <p className="theme-text text-2xl font-bold">{value}</p>
            <p className="theme-text-muted text-xs mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Yield Chart — bar height is dynamic, stays as style */}
        <div className="theme-card-bg rounded-xl border p-6">
          <h2 className="theme-text font-semibold mb-4">Yield Trend (tons/ha)</h2>
          <div className="flex items-end gap-2 h-32">
            {CHART_DATA.map(({ month, yield: y }) => (
              <div key={month} className="flex-1 flex flex-col items-center gap-1">
                <div className="theme-neon-bg w-full rounded-t-sm transition-all opacity-80"
                  style={{ height: `${(y / 5) * 100}%` }} />
                <span className="theme-text-subtle text-[10px]">{month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity — TYPE_COLORS is dynamic, stays as style */}
        <div className="theme-card-bg rounded-xl border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="theme-text font-semibold">Recent Activity</h2>
            <Link href="/agropilot/analysis" className="theme-text-neon flex items-center gap-1 text-xs hover:opacity-80">
              New analysis <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {stats.recent_predictions.slice(0, 5).map((item: any) => (
              <div key={item.id} className="flex items-center gap-3 rounded-lg p-2 hover:bg-white/5">
                <div className="h-2 w-2 rounded-full flex-shrink-0" style={{ background: TYPE_COLORS[item.type] || 'var(--circle)' }} />
                <div className="flex-1 min-w-0">
                  <p className="theme-text text-sm font-medium truncate">{item.crop}</p>
                  <p className="theme-text-muted text-xs truncate">{item.result}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] px-2 py-0.5 rounded-full capitalize"
                    style={{ background: `${TYPE_COLORS[item.type] || 'var(--circle)'}20`, color: TYPE_COLORS[item.type] || 'var(--circle)' }}>
                    {item.type}
                  </span>
                  <p className="theme-text-subtle text-[10px] mt-1">{item.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions — color is dynamic prop, stays as style */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { href: '/agropilot/analysis?tab=disease', title: 'Detect Disease',  desc: 'Upload crop photo for AI diagnosis',    icon: Bug,          color: '#f87171' },
          { href: '/agropilot/analysis?tab=yield',   title: 'Predict Yield',   desc: 'Enter soil data for yield forecast',   icon: TrendingUp,   color: 'var(--neon-green)' },
          { href: '/agropilot/chat',                 title: 'Ask AgroPilot',   desc: 'Chat with your AI farming advisor',    icon: MessageSquare,color: '#60a5fa' },
        ].map(({ href, title, desc, icon: Icon, color }) => (
          <Link key={href} href={href}>
            <div className="theme-card-bg rounded-xl border p-5 transition-all hover:border-opacity-50 cursor-pointer">
              <div className="rounded-lg p-2.5 w-fit mb-3" style={{ background: `${color}15` }}>
                <Icon className="h-5 w-5" style={{ color }} />
              </div>
              <h3 className="theme-text font-semibold text-sm">{title}</h3>
              <p className="theme-text-muted text-xs mt-1">{desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
