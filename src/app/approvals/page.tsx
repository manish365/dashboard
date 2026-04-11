'use client';

import React, { useMemo, useState } from 'react';
import { useAppStore, ApprovalStatus } from '@/stores/app-store';
import EditableDataGrid from '@/components/data-grid/editable-data-grid';
import { DATA_PAGE_LABELS, MONTHS } from '@/data/mock-data';
import { canApprove } from '@/lib/roles';
import { ColDef } from 'ag-grid-community';
import { CheckCircle, XCircle, Clock, Eye, X, Send, FileCheck, AlertTriangle } from 'lucide-react';

export default function ApprovalsPage() {
  const { state, dispatch } = useAppStore();
  const [viewingDataset, setViewingDataset] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState<{ key: string; action: 'approve' | 'reject' } | null>(null);

  const datasets = useMemo(() => {
    return Object.entries(state.datasetMeta)
      .filter(([_, meta]) => meta.status !== 'Draft')
      .sort((a, b) => {
        const dateA = a[1].submittedAt ? new Date(a[1].submittedAt).getTime() : 0;
        const dateB = b[1].submittedAt ? new Date(b[1].submittedAt).getTime() : 0;
        return dateB - dateA;
      });
  }, [state.datasetMeta]);

  const handleApprove = (key: string) => {
    const meta = state.datasetMeta[key];
    if (meta) dispatch({ type: 'SET_DATASET_META', payload: { key, meta: { ...meta, status: 'Approved', reviewedBy: state.user?.name || 'Unknown', reviewedAt: new Date().toISOString() } } });
    setShowConfirmDialog(null);
  };

  const handleReject = (key: string) => {
    const meta = state.datasetMeta[key];
    if (meta) dispatch({ type: 'SET_DATASET_META', payload: { key, meta: { ...meta, status: 'Rejected', reviewedBy: state.user?.name || 'Unknown', reviewedAt: new Date().toISOString() } } });
    setShowConfirmDialog(null);
  };

  // Dynamic status colors — must stay as style
  const statusStyles: Record<ApprovalStatus, { icon: React.ElementType; color: string }> = {
    Draft:     { icon: Clock,        color: 'var(--old-price)' },
    Submitted: { icon: Send,         color: '#f59e0b' },
    Approved:  { icon: CheckCircle,  color: 'var(--neon-green)' },
    Rejected:  { icon: XCircle,      color: '#ef4444' },
  };

  const getColumnDefs = (dataKey: string): ColDef[] => {
    const data = state.datasets[dataKey] || [];
    if (data.length === 0) return [];
    return Object.keys(data[0]).filter((k) => k !== 'id').map((k) => ({ field: k, headerName: k, width: 150 }));
  };

  const isApprover = state.user ? canApprove(state.user.role) : false;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="theme-text text-2xl font-bold">Approvals</h1>
        <p className="theme-text-muted text-sm">Review and approve submitted datasets</p>
      </div>

      {/* Stats — color is dynamic, stays as style */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          { label: 'Pending Review', count: datasets.filter(([_, m]) => m.status === 'Submitted').length, icon: Clock,        color: '#f59e0b' },
          { label: 'Approved',       count: datasets.filter(([_, m]) => m.status === 'Approved').length,  icon: FileCheck,    color: 'var(--neon-green)' },
          { label: 'Rejected',       count: datasets.filter(([_, m]) => m.status === 'Rejected').length,  icon: AlertTriangle,color: '#ef4444' },
        ].map((stat) => (
          <div key={stat.label} className="theme-card-bg flex items-center gap-4 rounded-xl border border-white/10 p-4">
            <div className="rounded-lg p-2.5" style={{ background: `${stat.color}15` }}>
              <stat.icon className="h-5 w-5" style={{ color: stat.color }} />
            </div>
            <div>
              <p className="theme-text text-2xl font-bold">{stat.count}</p>
              <p className="theme-text-muted text-xs">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {datasets.length === 0 ? (
        <div className="theme-card-bg flex flex-col items-center justify-center rounded-xl border border-white/10 py-16">
          <Clock className="theme-text-subtle h-12 w-12 mb-4" />
          <p className="theme-text-muted text-lg font-medium">No submissions yet</p>
          <p className="theme-text-subtle text-sm">Data managers can submit datasets from individual data pages</p>
        </div>
      ) : (
        <div className="space-y-3">
          {datasets.map(([key, meta]) => {
            const StatusIcon = statusStyles[meta.status].icon;
            const pageLabel = DATA_PAGE_LABELS[meta.tableName as keyof typeof DATA_PAGE_LABELS] || meta.tableName;
            const color = statusStyles[meta.status].color;
            return (
              <div key={key} className="theme-card-bg rounded-xl border border-white/10 p-4 transition-all hover:border-white/15">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-4">
                    <div className="rounded-lg p-2 border" style={{ borderColor: `${color}30`, background: `${color}10` }}>
                      <StatusIcon className="h-4 w-4" style={{ color }} />
                    </div>
                    <div>
                      <p className="theme-text text-sm font-semibold">{pageLabel}</p>
                      <p className="theme-text-muted text-xs">
                        {MONTHS.find((m) => m.value === meta.month)?.label} {meta.year} • {meta.rowCount} rows
                        {meta.submittedBy && ` • by ${meta.submittedBy}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full border px-2.5 py-0.5 text-xs font-medium"
                      style={{ borderColor: `${color}30`, color, background: `${color}10` }}>
                      {meta.status}
                    </span>
                    <button onClick={() => setViewingDataset(key)}
                      className="theme-text-muted flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium transition-all hover:bg-white/5">
                      <Eye className="h-3.5 w-3.5" /> View
                    </button>
                    {isApprover && meta.status === 'Submitted' && (
                      <>
                        <button onClick={() => setShowConfirmDialog({ key, action: 'approve' })}
                          className="theme-btn-neon flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all hover:opacity-90">
                          <CheckCircle className="h-3.5 w-3.5" /> Approve
                        </button>
                        <button onClick={() => setShowConfirmDialog({ key, action: 'reject' })}
                          className="flex items-center gap-1.5 rounded-lg bg-red-600/80 px-3 py-1.5 text-xs font-medium text-white transition-all hover:bg-red-500">
                          <XCircle className="h-3.5 w-3.5" /> Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* View dataset modal */}
      {viewingDataset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="theme-card-bg w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="theme-text text-lg font-semibold">Dataset Preview</h2>
              <button onClick={() => setViewingDataset(null)} className="theme-text-subtle rounded-lg p-1.5 hover:bg-white/10">
                <X className="h-5 w-5" />
              </button>
            </div>
            <EditableDataGrid rowData={state.datasets[viewingDataset] || []} columnDefs={getColumnDefs(viewingDataset)}
              editable={false} showAddRow={false} showDeleteRow={false} showBulkEdit={false} title="Preview" />
          </div>
        </div>
      )}

      {/* Confirm dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="theme-card-bg w-full max-w-sm rounded-2xl border border-white/10 p-6 shadow-2xl">
            <div className="mb-5 text-center">
              {showConfirmDialog.action === 'approve'
                ? <CheckCircle className="theme-text-neon mx-auto mb-3 h-12 w-12" />
                : <XCircle className="mx-auto mb-3 h-12 w-12 text-red-400" />}
              <h3 className="theme-text text-lg font-semibold">
                {showConfirmDialog.action === 'approve' ? 'Approve Dataset?' : 'Reject Dataset?'}
              </h3>
              <p className="theme-text-muted mt-1 text-sm">
                {showConfirmDialog.action === 'approve' ? 'This will mark the dataset as approved.' : 'This will mark the dataset as rejected.'}
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirmDialog(null)}
                className="theme-text-muted flex-1 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium hover:bg-white/5">
                Cancel
              </button>
              <button
                onClick={() => showConfirmDialog.action === 'approve' ? handleApprove(showConfirmDialog.key) : handleReject(showConfirmDialog.key)}
                className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-medium ${showConfirmDialog.action === 'approve' ? 'theme-btn-neon' : 'bg-red-600 text-white hover:bg-red-500'}`}>
                {showConfirmDialog.action === 'approve' ? 'Approve' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
