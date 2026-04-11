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
    <div className="theme-panel flex items-start gap-4 rounded-2xl border p-5">
      <div className="theme-footer-bg rounded-xl border p-3">
        <Icon className="h-6 w-6 text-blue-500" />
      </div>
      <div>
        <h4 className="theme-text text-sm font-bold">{label}</h4>
        <p className="theme-text mt-1 text-xs leading-relaxed opacity-60">{description}</p>
      </div>
    </div>
  );
}
