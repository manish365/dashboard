'use client';

import React from 'react';
import { HelpCircle } from 'lucide-react';

interface InfoTileProps {
  label: string;
  description: string;
  icon?: React.ElementType;
}

export default function InfoTile({
  label = 'New Feature',
  description = 'You can now dynamically generate pages using the UI builder.',
  icon: Icon = HelpCircle,
}: InfoTileProps) {
  return (
    <div 
      className="flex items-start gap-4 rounded-2xl border p-5"
      style={{ background: 'var(--navbar-carousel-color)', borderColor: 'var(--header-border)' }}
    >
      <div className="rounded-xl border p-3" style={{ background: 'var(--foot-color)', borderColor: 'var(--border-color)' }}>
        <Icon className="h-6 w-6 text-blue-500" />
      </div>
      <div>
        <h4 className="text-sm font-bold" style={{ color: 'var(--text-color)' }}>{label}</h4>
        <p className="mt-1 text-xs leading-relaxed opacity-60" style={{ color: 'var(--text-color)' }}>
          {description}
        </p>
      </div>
    </div>
  );
}
