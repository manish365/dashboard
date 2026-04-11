'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/stores/app-store';
import { MONTHS, getYears, UPLOAD_TEMPLATES, DATA_PAGE_LABELS, DataPageId } from '@/data/mock-data';
import { canUpload, canClone } from '@/lib/roles';
import FileUploadZone from '@/components/upload/file-upload-zone';
import CloneDialog from '@/components/clone/clone-dialog';
import { Calendar, Upload, Copy, BarChart3, Star, Target, FileSpreadsheet, Users, ShoppingCart, MapPin, ChevronRight, X } from 'lucide-react';
import Link from 'next/link';

const DATA_PAGES: { id: DataPageId; icon: React.ElementType; href: string }[] = [
  { id: 'csat', icon: Star, href: '/data/csat' },
  { id: 'volume-budget', icon: Target, href: '/data/volume-budget' },
  { id: 'main-template', icon: FileSpreadsheet, href: '/data/main-template' },
  { id: 'sm-mo-mapping', icon: MapPin, href: '/data/sm-mo-mapping' },
  { id: 'vas-sku', icon: ShoppingCart, href: '/data/vas-sku' },
  { id: 'employee-master', icon: Users, href: '/data/employee-master' },
];

export default function DashboardPage() {
  const { state, dispatch } = useAppStore();
  const [showCloneDialog, setShowCloneDialog] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null);
  const years = getYears();

  const handleFileLoaded = (data: any[], fileName: string) => {
    dispatch({
      type: 'ADD_UPLOADED_FILE',
      payload: {
        id: `file-${Date.now()}`,
        templateName: activeTemplate || 'Unknown',
        fileName,
        uploadedAt: new Date().toISOString(),
        rowCount: data.length,
        status: 'loaded',
        validationMessages: [],
        data,
      },
    });
    setActiveTemplate(null);
  };

  const summaryCards = [
    { icon: Star, label: 'CSAT Data', value: '580+', desc: 'Store scores' },
    { icon: Target, label: 'Volume Budget', value: '6.8K+', desc: 'SE targets' },
    { icon: FileSpreadsheet, label: 'Main Template', value: '3.1K+', desc: 'Incentive rules' },
    { icon: Users, label: 'Employees', value: '50+', desc: 'Store staff' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="theme-text text-2xl font-bold">Dashboard</h1>
          <p className="theme-text-muted text-sm">Manage incentive data for Croma stores</p>
        </div>
        <div className="theme-input-wrap flex items-center gap-2 rounded-lg border border-white/10 px-3 py-1.5">
          <Calendar className="theme-text-subtle h-4 w-4" />
          <select
            value={state.selectedMonth}
            onChange={(e) => dispatch({ type: 'SET_MONTH', payload: Number(e.target.value) })}
            className="theme-text bg-transparent text-sm outline-none"
          >
            {MONTHS.map((m) => (
              <option key={m.value} value={m.value} className="theme-dropdown-bg">{m.label}</option>
            ))}
          </select>
          <select
            value={state.selectedYear}
            onChange={(e) => dispatch({ type: 'SET_YEAR', payload: Number(e.target.value) })}
            className="theme-text bg-transparent text-sm outline-none"
          >
            {years.map((y) => (
              <option key={y} value={y} className="theme-dropdown-bg">{y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card) => (
          <div key={card.label} className="theme-card-bg group rounded-xl border p-5 transition-all hover:border-[var(--neon-green)]/20">
            <div className="flex items-center justify-between">
              <div className="theme-neon-bg-subtle rounded-lg p-2.5">
                <card.icon className="theme-text-neon h-5 w-5" />
              </div>
              <BarChart3 className="theme-text-subtle h-4 w-4 transition-colors group-hover:opacity-80" />
            </div>
            <div className="mt-4">
              <p className="theme-text text-2xl font-bold">{card.value}</p>
              <p className="theme-text-muted text-xs">{card.label}</p>
              <p className="theme-text-subtle text-[10px] mt-0.5">{card.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Action buttons */}
      {state.user && (canUpload(state.user.role) || canClone(state.user.role)) && (
        <div className="flex flex-wrap gap-3">
          {canUpload(state.user.role) && (
            <button
              onClick={() => setShowUploadDialog(true)}
              className="theme-btn-neon flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-all active:scale-[0.98]"
            >
              <Upload className="h-4 w-4" />
              Upload Template
            </button>
          )}
          {canClone(state.user.role) && (
            <button
              onClick={() => setShowCloneDialog(true)}
              className="theme-btn-outline flex items-center gap-2 rounded-xl border px-5 py-3 text-sm font-medium transition-all hover:bg-slate-500/5 active:scale-[0.98]"
            >
              <Copy className="h-4 w-4" />
              Clone Previous Month
            </button>
          )}
        </div>
      )}

      {/* Data Pages quick links */}
      <div>
        <h2 className="theme-text mb-3 text-lg font-semibold">Data Tables</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {DATA_PAGES.map((page) => (
            <Link
              key={page.id}
              href={page.href}
              className="theme-card-bg group flex items-center justify-between rounded-xl border p-4 transition-all hover:border-[var(--neon-green)]/30"
            >
              <div className="flex items-center gap-3">
                <page.icon className="theme-text-subtle h-5 w-5 transition-colors" />
                <p className="theme-text text-sm font-medium">{DATA_PAGE_LABELS[page.id]}</p>
              </div>
              <ChevronRight className="theme-text-subtle h-4 w-4 transition-all group-hover:translate-x-0.5" />
            </Link>
          ))}
        </div>
      </div>

      {/* Upload Dialog */}
      {showUploadDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="theme-card-bg w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="theme-text text-lg font-semibold">Upload Templates</h2>
                <p className="theme-text-muted text-xs">Select a template type and upload the Excel file</p>
              </div>
              <button
                onClick={() => { setShowUploadDialog(false); setActiveTemplate(null); }}
                className="theme-text-subtle rounded-lg p-1.5 hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {!activeTemplate ? (
              <div className="grid grid-cols-2 gap-3">
                {UPLOAD_TEMPLATES.map((template) => (
                  <button
                    key={template.name}
                    onClick={() => setActiveTemplate(template.name)}
                    className="theme-toolbar-bg flex items-center gap-3 rounded-xl border border-white/10 p-4 text-left transition-all hover:border-[var(--neon-green)]/30"
                  >
                    <FileSpreadsheet className="theme-text-neon h-5 w-5" />
                    <div>
                      <p className="theme-text text-sm font-medium">{template.label}</p>
                      <p className="theme-text-subtle text-[10px]">{template.expectedColumns.length} columns expected</p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div>
                <button
                  onClick={() => setActiveTemplate(null)}
                  className="theme-text-link mb-3 flex items-center gap-1 text-xs hover:opacity-80"
                >
                  ← Back to templates
                </button>
                <FileUploadZone
                  templateName={UPLOAD_TEMPLATES.find((t) => t.name === activeTemplate)?.label || activeTemplate}
                  expectedColumns={UPLOAD_TEMPLATES.find((t) => t.name === activeTemplate)?.expectedColumns}
                  onFileLoaded={handleFileLoaded}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {showCloneDialog && (
        <CloneDialog
          currentMonth={state.selectedMonth}
          currentYear={state.selectedYear}
          onClone={() => {}}
          onClose={() => setShowCloneDialog(false)}
        />
      )}

      {state.uploadedFiles.length > 0 && (
        <div>
          <h2 className="theme-text mb-3 text-lg font-semibold">Recent Uploads</h2>
          <div className="space-y-2">
            {state.uploadedFiles.map((file) => (
              <div key={file.id} className="theme-card-bg flex items-center justify-between rounded-xl border border-white/10 p-3">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="theme-text-neon h-4 w-4" />
                  <div>
                    <p className="theme-text text-sm">{file.fileName}</p>
                    <p className="theme-text-subtle text-xs">
                      {file.templateName} • {file.rowCount} rows • {new Date(file.uploadedAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => dispatch({ type: 'REMOVE_UPLOADED_FILE', payload: file.id })}
                  className="theme-text-subtle rounded-lg p-1.5 hover:bg-white/10"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
