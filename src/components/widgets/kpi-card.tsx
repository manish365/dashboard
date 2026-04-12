'use client';

import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  trend?: number; // percentage
  trendLabel?: string;
  color?: 'blue' | 'emerald' | 'amber' | 'red' | 'purple';
}

export default function KpiCard({
  title = 'Total Revenue',
  value = '$0.00',
  trend = 0,
  trendLabel = 'vs last month',
  color = 'blue',
}: KpiCardProps) {
  const colorMap = {
    blue: 'theme-text-info theme-tag-info',
    emerald: 'theme-text-success theme-tag-success',
    amber: 'theme-text-warning theme-tag-warning',
    red: 'theme-text-danger theme-tag-danger',
    purple: 'theme-text-purple theme-tag-purple',
  };

  const TrendIcon = trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus;

  return (
    <div 
      className="theme-card-bg group rounded-2xl border p-5 transition-all hover:translate-y-[-2px] hover:shadow-xl"
    >
      <div className="flex items-center justify-between">
        <div className={`rounded-lg p-2.5 ${colorMap[color]}`}>
          <TrendIcon className="h-5 w-5" />
        </div>
        {trend !== 0 && (
          <span className={`text-xs font-bold ${trend > 0 ? 'theme-text-success' : 'theme-text-danger'}`}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="theme-text text-2xl font-bold">{value}</p>
        <p className="theme-text text-xs font-semibold opacity-60">{title}</p>
        <p className="theme-text-muted mt-1 text-[10px]">{trendLabel}</p>
      </div>
    </div>
  );
}
