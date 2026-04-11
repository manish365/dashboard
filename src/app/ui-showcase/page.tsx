'use client';

import React, { useState } from 'react';
import { useToast } from '@/providers/toast-context';
import Modal from '@/components/ui/modal';
import MultiSelectAutocomplete from '@/components/ui/multi-select-autocomplete';
import { Bell, Layout, MessageSquare, CheckCircle2, AlertCircle, Info, Send, Plus } from 'lucide-react';

export default function UIShowcasePage() {
  const { showToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<string[]>(['Group A']);
  const [textValue, setTextValue] = useState('');
  const [switchOn, setSwitchOn] = useState(false);
  const [dateValue, setDateValue] = useState('');

  const demoOptions = ['Group A', 'Group B', 'Group C', 'Category 1', 'Category 2', 'Brand X', 'Brand Y', 'Class Primary', 'Class Secondary'];

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-20">
      <div>
        <h1 className="theme-text text-3xl font-extrabold">UI Component Showcase</h1>
        <p className="theme-text-muted mt-2 text-sm">A premium collection of theme-aware, accessible UI components for the weboffice Dashboard.</p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="theme-panel space-y-6 rounded-2xl border p-6">
          <div className="theme-border flex items-center gap-2 border-b pb-4">
            <Bell className="h-5 w-5 text-blue-500" />
            <h2 className="theme-text text-lg font-bold">Feedback & Notifications</h2>
          </div>
          <div className="space-y-3">
            <p className="theme-text text-xs font-medium opacity-60">Toast Notifications</p>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => showToast('Operation successful!', 'success')} className="flex items-center gap-2 rounded-lg bg-emerald-500/10 px-4 py-2 text-xs font-bold text-emerald-500 border border-emerald-500/20 transition-all hover:bg-emerald-500/20">
                <CheckCircle2 className="h-3.5 w-3.5" /> Success Toast
              </button>
              <button onClick={() => showToast('Something went wrong.', 'error')} className="flex items-center gap-2 rounded-lg bg-red-500/10 px-4 py-2 text-xs font-bold text-red-500 border border-red-500/20 transition-all hover:bg-red-500/20">
                <AlertCircle className="h-3.5 w-3.5" /> Error Toast
              </button>
              <button onClick={() => showToast('New update available.', 'info')} className="flex items-center gap-2 rounded-lg bg-blue-500/10 px-4 py-2 text-xs font-bold text-blue-500 border border-blue-500/20 transition-all hover:bg-blue-500/20">
                <Info className="h-3.5 w-3.5" /> Info Toast
              </button>
            </div>
          </div>
          <div className="space-y-3 pt-4">
            <p className="theme-text text-xs font-medium opacity-60">Modals & Dialogs</p>
            <button onClick={() => setIsModalOpen(true)} className="theme-btn-neon flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold transition-all hover:opacity-90 active:scale-95">
              <Layout className="h-4 w-4" /> Open Sample Modal
            </button>
          </div>
        </div>

        <div className="theme-panel space-y-6 rounded-2xl border p-6">
          <div className="theme-border flex items-center gap-2 border-b pb-4">
            <MessageSquare className="h-5 w-5 text-purple-500" />
            <h2 className="theme-text text-lg font-bold">Advanced Form Fields</h2>
          </div>
          <div className="space-y-4">
            <MultiSelectAutocomplete label="Multi-select Autocomplete (with Chips)" options={demoOptions} selected={selectedOptions} onChange={setSelectedOptions} placeholder="Search groups, categories..." />
            <div className="space-y-1.5">
              <label className="theme-text text-xs font-semibold opacity-70">Text Input with Theme Support</label>
              <input type="text" value={textValue} onChange={(e) => setTextValue(e.target.value)} placeholder="Type something..."
                className="theme-input theme-border w-full rounded-xl border px-4 py-2 text-sm outline-none transition-all focus:ring-2 focus:ring-blue-500/20" />
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="theme-text text-sm font-bold">Premium Switch Component</p>
                <p className="theme-text-muted text-[10px]">Enable advanced data filtering</p>
              </div>
              <button onClick={() => setSwitchOn(!switchOn)}
                className={`relative h-6 w-11 rounded-full transition-colors duration-200 focus:outline-none ${switchOn ? 'bg-[var(--neon-green)]' : 'bg-slate-700'}`}>
                <span className={`absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform duration-200 ${switchOn ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
            <div className="space-y-1.5">
              <label className="theme-text text-xs font-semibold opacity-70">Date Picker</label>
              <input type="date" value={dateValue} onChange={(e) => setDateValue(e.target.value)}
                className="theme-input theme-border w-full rounded-xl border px-4 py-2 text-sm outline-none" />
            </div>
          </div>
        </div>
      </div>

      <div className="theme-panel theme-border-header rounded-2xl border p-8 text-center">
        <h3 className="theme-text text-xl font-bold">Ready for Enterprise Integration</h3>
        <p className="theme-text mx-auto mt-2 max-w-xl text-sm opacity-70">All components shown here are built with performance in mind and are ready to be used in production-level incentive calculations.</p>
        <div className="mt-6 flex justify-center gap-3">
          <button className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-500 active:scale-95">
            <Send className="h-4 w-4" /> Deploy Changes
          </button>
          <button className="theme-text theme-border flex items-center gap-2 rounded-xl border px-6 py-2.5 text-sm font-bold transition-all hover:bg-white/5 active:scale-95">
            <Plus className="h-4 w-4" /> Add Component
          </button>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Enterprise Data Analysis">
        <div className="space-y-4">
          <p className="theme-text text-sm opacity-80">This modal demonstrates the premium backdrop blur and theme-aware surface colors.</p>
          <div className="dg-input border-none !h-auto p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="theme-text text-xs font-bold uppercase tracking-wider opacity-50">Monthly Growth</span>
              <span className="text-xs font-bold text-[var(--neon-green)]">+12.4%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-800">
              {/* width is dynamic value — stays as style */}
              <div className="dg-progress-fill h-2 rounded-full" style={{ width: '70%', boxShadow: '0 0 10px rgba(0, 233, 191, 0.5)' }} />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <button onClick={() => setIsModalOpen(false)} className="theme-text-muted rounded-lg px-4 py-2 text-sm font-medium">Cancel</button>
            <button onClick={() => { setIsModalOpen(false); showToast('Report generated successfully!', 'success'); }}
              className="theme-btn-neon rounded-lg px-4 py-2 text-sm font-bold">
              Generate Report
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
