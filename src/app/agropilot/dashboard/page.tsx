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
    { id: '1', type: 'yield', crop: 'Rice', result: '4.2 tons/ha', date: '2024-01-15' },
    { id: '2', type: 'disease', crop: 'Wheat', result: 'Wheat Rust detected', date: '2024-01-14' },
    { id: '3', type: 'fertilizer', crop: 'Maize', result: 'NPK 20-20-20 @ 250kg/ha', date: '2024-01-13' },
  ],
};

const TYPE_COLORS: Record<string, string> = {
  yield: 'var(--neon-green)', disease: '#f87171', fertilizer: '#fbbf24',
};

export default function AgroPilotDashboard() {
  const { user, isAuthenticated } = useAgroAuthStore();
  const [stats, setStats] = useState(DEMO_STATS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) return;
    setLoading(true);
    agropilotApi.get('/api/dashboard/stats')
      .then((r) => setStats(r.data))
      .catch(() => {}) // fallback to demo data
      .finally(() => setLoading(false));
  }, []);

  const summaryCards = [
    { label: 'Predictions', value: stats.total_predictions, icon: TrendingUp, color: 'var(--neon-green)' },
    { label: 'Chats', value: stats.total_chats, icon: MessageSquare, color: '#60a5fa' },
    { label: 'Accuracy', value: `${Math.round(stats.accuracy_rate * 100)}%`, icon: Leaf, color: '#fbbf24' },
    { label: 'Crops', value: stats.crops_analyzed.length, icon: Bug, color: '#c084fc' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="rounded-xl p-2.5" style={{ background: 'rgba(0, 233, 191, 0.1)' }}>
          <Sprout className="h-6 w-6" style={{ color: 'var(--neon-green)' }} />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-color)' }}>
            AgroPilot {user ? `— ${user.name.split(' ')[0]}` : ''}
          </h1>
          <p className="text-sm" style={{ color: 'var(--old-price)' }}>AI-powered farming intelligence</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {summaryCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-xl border p-5 transition-all"
            style={{ background: 'var(--croma-wall)', borderColor: 'var(--border-color)' }}>
            <div className="rounded-lg p-2.5 w-fit mb-3" style={{ background: `${color}15` }}>
              <Icon className="h-5 w-5" style={{ color }} />
            </div>
            <p className="text-2xl font-bold" style={{ color: 'var(--text-color)' }}>{value}</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--old-price)' }}>{label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Yield Chart */}
        <div className="rounded-xl border p-6" style={{ background: 'var(--croma-wall)', borderColor: 'var(--border-color)' }}>
          <h2 className="font-semibold mb-4" style={{ color: 'var(--text-color)' }}>Yield Trend (tons/ha)</h2>
          <div className="flex items-end gap-2 h-32">
            {CHART_DATA.map(({ month, yield: y }) => (
              <div key={month} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full rounded-t-sm transition-all"
                  style={{ height: `${(y / 5) * 100}%`, background: 'var(--neon-green)', opacity: 0.8 }} />
                <span className="text-[10px]" style={{ color: 'var(--circle)' }}>{month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-xl border p-6" style={{ background: 'var(--croma-wall)', borderColor: 'var(--border-color)' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold" style={{ color: 'var(--text-color)' }}>Recent Activity</h2>
            <Link href="/agropilot/analysis" className="flex items-center gap-1 text-xs hover:opacity-80"
              style={{ color: 'var(--neon-green)' }}>
              New analysis <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {stats.recent_predictions.slice(0, 5).map((item: any) => (
              <div key={item.id} className="flex items-center gap-3 rounded-lg p-2 hover:bg-white/5">
                <div className="h-2 w-2 rounded-full flex-shrink-0"
                  style={{ background: TYPE_COLORS[item.type] || 'var(--circle)' }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--text-color)' }}>{item.crop}</p>
                  <p className="text-xs truncate" style={{ color: 'var(--old-price)' }}>{item.result}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] px-2 py-0.5 rounded-full capitalize"
                    style={{ background: `${TYPE_COLORS[item.type] || 'var(--circle)'}20`, color: TYPE_COLORS[item.type] || 'var(--circle)' }}>
                    {item.type}
                  </span>
                  <p className="text-[10px] mt-1" style={{ color: 'var(--circle)' }}>{item.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { href: '/agropilot/analysis?tab=disease', title: 'Detect Disease', desc: 'Upload crop photo for AI diagnosis', icon: Bug, color: '#f87171' },
          { href: '/agropilot/analysis?tab=yield', title: 'Predict Yield', desc: 'Enter soil data for yield forecast', icon: TrendingUp, color: 'var(--neon-green)' },
          { href: '/agropilot/chat', title: 'Ask AgroPilot', desc: 'Chat with your AI farming advisor', icon: MessageSquare, color: '#60a5fa' },
        ].map(({ href, title, desc, icon: Icon, color }) => (
          <Link key={href} href={href}>
            <div className="rounded-xl border p-5 transition-all hover:border-opacity-50 cursor-pointer"
              style={{ background: 'var(--croma-wall)', borderColor: 'var(--border-color)' }}>
              <div className="rounded-lg p-2.5 w-fit mb-3" style={{ background: `${color}15` }}>
                <Icon className="h-5 w-5" style={{ color }} />
              </div>
              <h3 className="font-semibold text-sm" style={{ color: 'var(--text-color)' }}>{title}</h3>
              <p className="text-xs mt-1" style={{ color: 'var(--old-price)' }}>{desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
