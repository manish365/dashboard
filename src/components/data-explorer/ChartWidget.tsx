'use client';

import React from 'react';
import { 
  BarChart, Bar, LineChart, Line, AreaChart, Area, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { Maximize2, MoreHorizontal } from 'lucide-react';

interface ChartWidgetProps {
  title: string;
  type: 'bar' | 'line' | 'area';
  data: any[];
  xAxis: string;
  yAxis: string;
}

export const ChartWidget: React.FC<ChartWidgetProps> = ({ title, type, data, xAxis, yAxis }) => {
  const renderChart = () => {
    switch (type) {
      case 'line':
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
            <XAxis dataKey={xAxis} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#666', fontWeight: 'bold' }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#666', fontWeight: 'bold' }} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#121212', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.5)' }}
              itemStyle={{ color: '#ffffff', fontWeight: 'bold' }}
            />
            <Legend verticalAlign="top" height={36}/>
            <Line type="monotone" dataKey={yAxis} stroke="#00E9BF" strokeWidth={4} dot={{ r: 4, fill: '#00E9BF', strokeWidth: 2, stroke: '#121212' }} activeDot={{ r: 8, strokeWidth: 0 }} />
          </LineChart>
        );
      case 'area':
        return (
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorY" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00E9BF" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#00E9BF" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
            <XAxis dataKey={xAxis} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#666', fontWeight: 'bold' }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#666', fontWeight: 'bold' }} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#121212', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.5)' }}
            />
            <Area type="monotone" dataKey={yAxis} stroke="#00E9BF" fillOpacity={1} fill="url(#colorY)" strokeWidth={3} />
          </AreaChart>
        );
      default:
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
            <XAxis dataKey={xAxis} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#666', fontWeight: 'bold' }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#666', fontWeight: 'bold' }} />
            <Tooltip 
              cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
              contentStyle={{ backgroundColor: '#121212', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.5)' }}
            />
            <Bar dataKey={yAxis} fill="#00E9BF" radius={[6, 6, 0, 0]} barSize={32} />
          </BarChart>
        );
    }
  };

  return (
    <div className="bg-[#191919] rounded-[2rem] border border-white/5 p-8 flex flex-col h-[450px] shadow-2xl shadow-black/20 hover:border-white/10 transition-all group">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">{title}</h3>
          <div className="text-[10px] text-white/30 font-bold mt-1 uppercase">Metric: {yAxis} • Dimension: {xAxis}</div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-white/5 rounded-xl text-white/20 hover:text-white transition-all opacity-0 group-hover:opacity-100">
            <Maximize2 className="h-4 w-4" />
          </button>
          <button className="p-2 hover:bg-white/5 rounded-xl text-white/20 hover:text-white transition-all">
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
