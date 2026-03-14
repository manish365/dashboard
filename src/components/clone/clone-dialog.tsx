'use client';

import React, { useState } from 'react';
import { MONTHS, getYears } from '@/data/mock-data';
import { X, Copy, AlertCircle } from 'lucide-react';

interface CloneDialogProps {
  currentMonth: number;
  currentYear: number;
  onClone: (fromMonth: number, fromYear: number) => void;
  onClose: () => void;
}

export default function CloneDialog({ currentMonth, currentYear, onClone, onClose }: CloneDialogProps) {
  const [sourceMonth, setSourceMonth] = useState(currentMonth === 1 ? 12 : currentMonth - 1);
  const [sourceYear, setSourceYear] = useState(currentMonth === 1 ? currentYear - 1 : currentYear);
  const years = getYears();

  const handleClone = () => {
    onClone(sourceMonth, sourceYear);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/15">
              <Copy className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Clone Data</h2>
              <p className="text-xs text-slate-400">Copy data from a previous month</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-500 hover:bg-white/10 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Source selection */}
        <div className="mb-4 space-y-3">
          <label className="text-xs font-medium text-slate-400">Clone from:</label>
          <div className="grid grid-cols-2 gap-3">
            <select
              value={sourceMonth}
              onChange={(e) => setSourceMonth(Number(e.target.value))}
              className="rounded-lg border border-white/10 bg-slate-800 px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500/50"
            >
              {MONTHS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
            <select
              value={sourceYear}
              onChange={(e) => setSourceYear(Number(e.target.value))}
              className="rounded-lg border border-white/10 bg-slate-800 px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500/50"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Target info */}
        <div className="mb-5 rounded-lg bg-blue-500/10 border border-blue-500/15 p-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 h-4 w-4 text-blue-400" />
            <div className="text-xs text-blue-300">
              <p className="font-medium">
                Data will be cloned into: {MONTHS.find((m) => m.value === currentMonth)?.label} {currentYear}
              </p>
              <p className="mt-0.5 text-blue-400/70">This will overwrite any existing data for the target month.</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-300 transition-all hover:bg-white/10"
          >
            Cancel
          </button>
          <button
            onClick={handleClone}
            className="flex-1 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm shadow-blue-500/25 transition-all hover:bg-blue-500 active:scale-[0.98]"
          >
            Clone Data
          </button>
        </div>
      </div>
    </div>
  );
}
