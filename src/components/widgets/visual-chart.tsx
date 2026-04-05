'use client';

import React from 'react';

interface VisualChartProps {
  title: string;
  subtitle?: string;
  dataJson: string; // expects a JSON string of Array<{label: string, value: number}>
  height?: number;
  color?: string;
}

export default function VisualChart({
  title = 'Monthly Sales',
  subtitle = 'Revenue over time',
  dataJson = '[{"label":"Jan","value":40},{"label":"Feb","value":65},{"label":"Mar","value":35},{"label":"Apr","value":85},{"label":"May","value":55}]',
  height = 200,
  color = 'var(--neon-green)',
}: VisualChartProps) {
  
  let parsedData = [];
  try {
    parsedData = JSON.parse(dataJson);
    if (!Array.isArray(parsedData)) parsedData = [];
  } catch (e) {
    parsedData = [];
  }

  const maxValue = parsedData.length > 0 ? Math.max(...parsedData.map((d: any) => d.value ?? 0)) : 100;

  return (
    <div className="flex flex-col rounded-2xl border p-5" style={{ background: 'var(--croma-wall)', borderColor: 'var(--border-color)' }}>
      <div className="mb-6">
        <h3 className="text-sm font-bold" style={{ color: 'var(--text-color)' }}>{title}</h3>
        {subtitle && <p className="text-[10px] opacity-60" style={{ color: 'var(--text-color)' }}>{subtitle}</p>}
      </div>
      
      <div className="flex items-end gap-3 w-full" style={{ height: `${height}px` }}>
        {parsedData.map((item: any, i: number) => {
          const percentage = maxValue > 0 ? ((item.value || 0) / maxValue) * 100 : 0;
          return (
            <div key={i} className="group relative flex flex-1 flex-col items-center justify-end h-full">
              {/* Tooltip */}
              <div className="absolute -top-8 hidden rounded bg-slate-800 px-2 py-1 text-[10px] text-white shadow-lg group-hover:block z-10 whitespace-nowrap">
                {item.label}: {item.value}
              </div>
              
              {/* Bar */}
              <div 
                className="w-full rounded-t-sm transition-all duration-500 ease-out hover:opacity-80"
                style={{ 
                  height: `${percentage}%`,
                  background: color,
                  opacity: 0.9,
                  minHeight: percentage > 0 ? '4px' : '0'
                }}
              />
              
              {/* Label */}
              <span className="mt-2 text-[10px] font-medium opacity-60" style={{ color: 'var(--text-color)' }}>
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
