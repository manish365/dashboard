'use client';

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useAppStore, ApprovalStatus, TableName } from '@/stores/app-store';
import EditableDataGrid from '@/components/data-grid/editable-data-grid';
import FileUploadZone from '@/components/upload/file-upload-zone';
import CloneDialog from '@/components/clone/clone-dialog';
import { MONTHS, getYears } from '@/data/mock-data';
import { canEdit, canSubmit, canUpload, canClone } from '@/lib/roles';
import { fetchPageData, savePageData } from '@/lib/api';
import { ColDef } from 'ag-grid-community';
import { v4 as uuidv4 } from 'uuid';
import {
  Send, CheckCircle, Clock, FileX2, Calendar,
  Upload, Copy, X, Save, Loader2, ChevronRight, BarChart3, Database
} from 'lucide-react';
import { useToast } from '@/providers/toast-context';

interface DataPageShellProps {
  pageId: string;
  title: string;
  subtitle?: string;
  columnDefs: ColDef[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  generateData: () => any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  defaultNewRow?: Record<string, any>;
  uploadExpectedColumns?: string[];
  tabs?: { key: string; label: string; columnDefs: ColDef[]; generateData: () => any[]; defaultNewRow?: Record<string, any> }[];
}

export default function DataPageShell({
  pageId,
  title,
  subtitle,
  columnDefs,
  generateData,
  defaultNewRow = {},
  uploadExpectedColumns = [],
  tabs,
}: DataPageShellProps) {
  const { state, dispatch } = useAppStore();
  const [showUpload, setShowUpload] = useState(false);
  const [showCloneDialog, setShowCloneDialog] = useState(false);
  const [activeTab, setActiveTab] = useState(tabs ? tabs[0].key : '');
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingToAI, setIsSendingToAI] = useState(false);
  const { showToast } = useToast();
  const years = getYears();

  const currentTab = tabs?.find((t) => t.key === activeTab);
  const effectiveColDefs = currentTab ? currentTab.columnDefs : columnDefs;
  const effectiveGenerator = currentTab ? currentTab.generateData : generateData;
  const effectiveDefaultNewRow = currentTab?.defaultNewRow || defaultNewRow;
  const dataKey = tabs
    ? `${pageId}_${activeTab}_${state.selectedMonth}_${state.selectedYear}`
    : `${pageId}_${state.selectedMonth}_${state.selectedYear}`;

  // Fetch data from mock API if not loaded
  useEffect(() => {
    if (!state.datasets[dataKey]) {
      setIsLoading(true);
      const tabKey = tabs ? activeTab : undefined;
      fetchPageData(pageId, state.selectedMonth, state.selectedYear, tabKey)
        .then((data) => {
          dispatch({ type: 'SET_DATASET', payload: { key: dataKey, data } });
        })
        .finally(() => setIsLoading(false));
    }
  }, [dataKey, pageId, activeTab, state.selectedMonth, state.selectedYear]);

  // Reset dirty state on tab/period change
  useEffect(() => {
    setIsDirty(false);
  }, [dataKey]);

  const currentData = state.datasets[dataKey] || [];
  const currentMeta = state.datasetMeta[dataKey];
  const status: ApprovalStatus = currentMeta?.status || 'Draft';
  const isEditable = state.user ? canEdit(state.user.role) && status === 'Draft' : false;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleDataChange = useCallback((data: any[]) => {
    console.log('🔄 [DataPageShell] handleDataChange triggered. Row count:', data.length, 'DataKey:', dataKey);
    dispatch({ type: 'SET_DATASET', payload: { key: dataKey, data: [...data] } }); // Ensure new reference
    setIsDirty(true);
  }, [dataKey, dispatch]);

  const handleSave = useCallback(async () => {
    if (!isDirty || isSaving) return;
    setIsSaving(true);
    try {
      const tabKey = tabs ? activeTab : undefined;
      await savePageData(pageId, state.selectedMonth, state.selectedYear, currentData, tabKey);
      setIsDirty(false);
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setIsSaving(false);
    }
  }, [isDirty, isSaving, pageId, activeTab, state.selectedMonth, state.selectedYear, currentData, tabs]);

  const handleSubmitForApproval = () => {
    dispatch({
      type: 'SET_DATASET_META',
      payload: {
        key: dataKey,
        meta: {
          id: uuidv4(),
          tableName: pageId as TableName,
          month: state.selectedMonth,
          year: state.selectedYear,
          status: 'Submitted',
          submittedBy: state.user?.name || 'Unknown',
          submittedAt: new Date().toISOString(),
          rowCount: currentData.length,
        },
      },
    });
  };
  
  const handleSendToAI = async () => {
    setIsSendingToAI(true);
    // Simulate API call to A&I pipeline
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsSendingToAI(false);
    showToast(`${title} data successfully pushed to A&I analytics pipeline.`, 'success');
  };

  const handleClone = (fromMonth: number, fromYear: number) => {
    const fromKey = tabs
      ? `${pageId}_${activeTab}_${fromMonth}_${fromYear}`
      : `${pageId}_${fromMonth}_${fromYear}`;
    const toKey = dataKey;
    if (!state.datasets[fromKey]) {
      dispatch({ type: 'SET_DATASET', payload: { key: fromKey, data: effectiveGenerator() } });
    }
    dispatch({ type: 'CLONE_DATA', payload: { fromKey, toKey } });
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleFileLoaded = (data: any[]) => {
    dispatch({ type: 'SET_DATASET', payload: { key: dataKey, data } });
    setShowUpload(false);
  };

  const statusConfig: Record<ApprovalStatus, { icon: React.ElementType; color: string; label: string }> = {
    Draft: { icon: FileX2, color: 'theme-tag-subtle', label: 'Draft' },
    Submitted: { icon: Clock, color: 'theme-tag-warning', label: 'Submitted' },
    Approved: { icon: CheckCircle, color: 'theme-tag-success', label: 'Approved' },
    Rejected: { icon: FileX2, color: 'theme-tag-danger', label: 'Rejected' },
  };

  const StatusIcon = statusConfig[status].icon;
  const monthLabel = MONTHS.find((m) => m.value === state.selectedMonth)?.label || '';
  const shortMonth = monthLabel.slice(0, 3);

  return (
    <div className="space-y-2">
      {/* ─── Compact Header Bar ─────────────────────────────────── */}
      <div className="theme-header-bar flex flex-wrap items-center justify-between gap-2 rounded-xl border px-4 py-1.5">
        {/* Left: Title · Period · Rows */}
        <div className="flex items-center gap-2 min-w-0">
          <h1 className="theme-text text-base font-bold truncate">{title}</h1>
          <ChevronRight className="theme-text-subtle h-3.5 w-3.5 shrink-0" />
          <div className="flex items-center gap-2 shrink-0">
            {/* Month / Year picker */}
            <div className="theme-period-picker flex items-center gap-1 rounded-md border px-2 py-1">
              <Calendar className="theme-text-subtle h-3 w-3" />
              <select
                value={state.selectedMonth}
                onChange={(e) => dispatch({ type: 'SET_MONTH', payload: Number(e.target.value) })}
                className="theme-text bg-transparent text-xs outline-none cursor-pointer"
              >
                {MONTHS.map((m) => (
                  <option key={m.value} value={m.value} className="theme-dropdown-bg">{m.label}</option>
                ))}
              </select>
              <select
                value={state.selectedYear}
                onChange={(e) => dispatch({ type: 'SET_YEAR', payload: Number(e.target.value) })}
                className="theme-text bg-transparent text-xs outline-none cursor-pointer"
              >
                {years.map((y) => (
                  <option key={y} value={y} className="theme-dropdown-bg">{y}</option>
                ))}
              </select>
            </div>

            <span className="theme-neon-pill text-[10px] px-2 py-0.5 rounded-full font-medium">
              {isLoading ? '…' : `${currentData.length} rows`}
            </span>
          </div>
        </div>

        {/* Right: Status + Actions */}
        <div className="flex items-center gap-1.5">
          {/* Status badge */}
          <div className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${statusConfig[status].color}`}>
            <StatusIcon className="h-3 w-3" />
            {statusConfig[status].label}
          </div>

          {/* Save button — appears when dirty */}
          {isDirty && (
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="theme-btn-save flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all hover:opacity-90 active:scale-95 disabled:opacity-60"
            >
              {isSaving ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Save className="h-3 w-3" />
              )}
              {isSaving ? 'Saving…' : 'Save'}
            </button>
          )}

          {state.user && canUpload(state.user.role) && (
            <button onClick={() => setShowUpload(!showUpload)}
              className="theme-btn-neon flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-medium transition-all hover:opacity-80 active:scale-95">
              <Upload className="h-3 w-3" />
              Upload
            </button>
          )}
          {state.user && canClone(state.user.role) && (
            <button onClick={() => setShowCloneDialog(true)}
              className="theme-btn-outline flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-medium transition-all hover:bg-white/10 active:scale-95">
              <Copy className="h-3 w-3" />
              Clone
            </button>
          )}
          {state.user && canSubmit(state.user.role) && status === 'Draft' && (
            <button onClick={handleSubmitForApproval}
              className="theme-btn-neon flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-medium transition-all hover:opacity-80 active:scale-95">
              <Send className="h-3 w-3" />
              Submit
            </button>
          )}

          {status === 'Approved' && (
            <button 
              onClick={handleSendToAI}
              disabled={isSendingToAI}
              className="theme-btn-accent flex items-center gap-1.5 rounded-lg px-3 py-1 text-[11px] font-semibold transition-all hover:opacity-90 active:scale-95 disabled:opacity-60 mr-1"
            >
              {isSendingToAI ? (
                <Loader2 className="h-3 w-3 animate-spin theme-text-on-neon" />
              ) : (
                <BarChart3 className="h-3.5 w-3.5 theme-text-on-neon" />
              )}
              {isSendingToAI ? 'Sending...' : 'Send to A&I'}
            </button>
          )}
        </div>
      </div>

      {/* Upload zone (collapsible) */}
      {showUpload && (
        <div className="theme-toolbar-bg theme-border rounded-xl border animate-in slide-in-from-top-2 duration-300">
          <FileUploadZone
            templateName={title}
            expectedColumns={uploadExpectedColumns}
            onFileLoaded={(data) => handleFileLoaded(data)}
            onClose={() => setShowUpload(false)}
          />
        </div>
      )}

      {/* Grid Area with Unified Toolbar */}
      <div className="flex-1 min-h-0 flex flex-col group">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="theme-text-neon h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="flex-1 min-h-0">
            <EditableDataGrid
              rowData={currentData}
              columnDefs={effectiveColDefs}
              onDataChange={handleDataChange}
              editable={isEditable}
              title={title}
              defaultNewRow={effectiveDefaultNewRow}
              leftContent={
                tabs && (
                  <div className="theme-toolbar-bg theme-border flex gap-1 rounded-md p-0.5 border">
                    {tabs.map((tab) => (
                      <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`rounded px-3 py-1 text-[10px] font-semibold transition-all ${
                          activeTab === tab.key
                            ? 'theme-neon-bg theme-text-on-neon shadow-lg shadow-neon-green/20'
                            : 'theme-text-muted hover:text-[var(--neon-green)] hover:bg-white/5'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                )
              }
            />
          </div>
        )}
      </div>

      {/* Clone dialog */}
      {showCloneDialog && (
        <CloneDialog
          currentMonth={state.selectedMonth}
          currentYear={state.selectedYear}
          onClone={handleClone}
          onClose={() => setShowCloneDialog(false)}
        />
      )}
    </div>
  );
}
