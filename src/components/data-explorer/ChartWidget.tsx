'use client';

import React from 'react';
import { BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Maximize2, MoreHorizontal } from 'lucide-react';

interface ChartWidgetProps {
  title: string;
  type: 'bar' | 'line' | 'area';
  data: any[];
  xAxis: string;
  yAxis: string;
}

// CSS variables work fine in recharts style objects — they read at render time
const tooltipStyle = {
  backgroundColor: 'var(--store-wall)',
  borderRadius: '16px',
  border: '1px solid var(--border-color)',
  color: 'var(--text-color)',
};
const tickStyle = { fontSize: 10, fill: 'var(--old-price)', fontWeight: 'bold' as const };
const gridColor = 'var(--border-color)';

export const ChartWidget: React.FC<ChartWidgetProps> = ({ title, type, data, xAxis, yAxis }) => {
  const renderChart = () => {
    switch (type) {
      case 'line': return (
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
          <XAxis dataKey={xAxis} axisLine={false} tickLine={false} tick={tickStyle} />
          <YAxis axisLine={false} tickLine={false} tick={tickStyle} />
          <Tooltip contentStyle={tooltipStyle} itemStyle={{ color: 'var(--text-color)', fontWeight: 'bold' }} />
          <Legend verticalAlign="top" height={36} />
          <Line type="monotone" dataKey={yAxis} stroke="var(--neon-green)" strokeWidth={4} dot={{ r: 4, fill: 'var(--neon-green)', strokeWidth: 2, stroke: 'var(--text-color-black)' }} activeDot={{ r: 8, strokeWidth: 0 }} />
        </LineChart>
      );
      case 'area': return (
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorY" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--neon-green)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="var(--neon-green)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
          <XAxis dataKey={xAxis} axisLine={false} tickLine={false} tick={tickStyle} />
          <YAxis axisLine={false} tickLine={false} tick={tickStyle} />
          <Tooltip contentStyle={tooltipStyle} />
          <Area type="monotone" dataKey={yAxis} stroke="var(--neon-green)" fillOpacity={1} fill="url(#colorY)" strokeWidth={3} />
        </AreaChart>
      );
      default: return (
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
          <XAxis dataKey={xAxis} axisLine={false} tickLine={false} tick={tickStyle} />
          <YAxis axisLine={false} tickLine={false} tick={tickStyle} />
          <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={tooltipStyle} />
          <Bar dataKey={yAxis} fill="var(--neon-green)" radius={[6, 6, 0, 0]} barSize={32} />
        </BarChart>
      );
    }
  };

  return (
    <div className="de-card-bg de-border rounded-[2rem] border p-8 flex flex-col h-[450px] shadow-2xl transition-all group">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="de-text text-xs font-black uppercase tracking-[0.2em]">{title}</h3>
          <div className="de-text-muted text-[10px] font-bold mt-1 uppercase">Metric: {yAxis} • Dimension: {xAxis}</div>
        </div>
        <div className="flex items-center gap-2">
          <button className="de-text-muted de-hover-text p-2 hover:bg-white/5 rounded-xl transition-all opacity-0 group-hover:opacity-100">
            <Maximize2 className="h-4 w-4" />
          </button>
          <button className="de-text-muted de-hover-text p-2 hover:bg-white/5 rounded-xl transition-all">
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
};
