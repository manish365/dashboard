'use client';

import React from 'react';

interface VisualChartProps {
  title: string; subtitle?: string; dataJson: string; height?: number; color?: string;
}

export default function VisualChart({
  title = 'Monthly Sales', subtitle = 'Revenue over time',
  dataJson = '[{"label":"Jan","value":40},{"label":"Feb","value":65},{"label":"Mar","value":35},{"label":"Apr","value":85},{"label":"May","value":55}]',
  height = 200, color = 'var(--neon-green)',
}: VisualChartProps) {
  let parsedData: any[] = [];
  try { parsedData = JSON.parse(dataJson); if (!Array.isArray(parsedData)) parsedData = []; } catch { parsedData = []; }

  const maxValue = parsedData.length > 0 ? Math.max(...parsedData.map((d: any) => d.value ?? 0)) : 100;

  const getBgClass = (c: string) => {
    const map: Record<string, string> = {
      'var(--neon-green)': 'theme-neon-bg',
      '#60a5fa': 'theme-tag-info',
      '#fbbf24': 'theme-tag-warning',
      '#f87171': 'theme-tag-danger',
      '#a78bfa': 'theme-tag-purple',
      '#34d399': 'theme-tag-success',
      '#818cf8': 'theme-tag-accent',
    };
    return map[c] || 'theme-neon-bg';
  };

  return (
    <div className="dg-card p-5 flex flex-col">
      <div className="mb-6">
        <h3 className="theme-text text-sm font-bold">{title}</h3>
        {subtitle && <p className="theme-text text-[10px] opacity-60">{subtitle}</p>}
      </div>
      {/* height is dynamic (prop) — must stay as style */}
      <div className="flex items-end gap-3 w-full" style={{ height: `${height}px` }}>
        {parsedData.map((item: any, i: number) => {
          const pct = maxValue > 0 ? ((item.value || 0) / maxValue) * 100 : 0;
          const bgCls = getBgClass(color);
          return (
            <div key={i} className="group relative flex flex-1 flex-col items-center justify-end h-full">
              <div className="absolute -top-8 hidden rounded theme-dropdown-bg border px-2 py-1 text-[10px] theme-text shadow-lg group-hover:block z-10 whitespace-nowrap">
                {item.label}: {item.value}
              </div>
              {/* height % is dynamic — color and other styles use classes */}
              <div className={`w-full rounded-t-sm transition-all duration-500 ease-out hover:opacity-80 opacity-90 ${bgCls} ${pct > 0 ? 'min-h-[4px]' : 'min-h-0'}`}
                style={{ height: `${pct}%` }} />
              <span className="theme-text mt-2 text-[10px] font-medium opacity-60">{item.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
