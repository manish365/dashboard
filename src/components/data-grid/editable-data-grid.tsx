'use client';

import React, { useCallback, useMemo, useRef, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { useAppStore } from '@/stores/app-store';
import { AllCommunityModule, ModuleRegistry, ColDef, GridApi, CellValueChangedEvent } from 'ag-grid-community';
import {
  Search,
  Plus,
  Trash2,
  Download,
  FileSpreadsheet,
  Edit3,
  RotateCcw,
  Loader2,
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

ModuleRegistry.registerModules([AllCommunityModule]);

interface EditableDataGridProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rowData: any[];
  columnDefs: ColDef[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onDataChange?: (data: any[]) => void;
  editable?: boolean;
  title?: string;
  showAddRow?: boolean;
  showDeleteRow?: boolean;
  showExport?: boolean;
  showBulkEdit?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  defaultNewRow?: Record<string, any>;
  leftContent?: React.ReactNode;
}

export default function EditableDataGrid({
  rowData,
  columnDefs,
  onDataChange,
  editable = true,
  title,
  showAddRow = true,
  showDeleteRow = true,
  showExport = true,
  showBulkEdit = true,
  defaultNewRow = {},
  leftContent,
}: EditableDataGridProps) {
  const { state } = useAppStore();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const gridRef = useRef<AgGridReact<any>>(null);
  const [searchText, setSearchText] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [bulkEditField, setBulkEditField] = useState('');
  const [bulkEditValue, setBulkEditValue] = useState('');
  const [showBulkEditPanel, setShowBulkEditPanel] = useState(false);

  // Excel-like selection aggregates
  const [aggregates, setAggregates] = useState({ sum: 0, avg: 0, count: 0 });
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [lastApiCallTime, setLastApiCallTime] = useState<string | null>(null);

  const defaultColDef = useMemo<ColDef>(
    () => ({
      sortable: true,
      filter: true,
      resizable: true,
      editable: editable,
      flex: 1,
      minWidth: 120,
      // Enhanced styling for cell focus
      cellStyle: { borderRight: '1px solid rgba(255,255,255,0.05)' },
    }),
    [editable]
  );

  const enhancedColumnDefs = useMemo(() => {
    const cols: ColDef[] = [];
    if (showDeleteRow && editable) {
      cols.push({
        headerCheckboxSelection: true,
        checkboxSelection: true,
        width: 40,
        maxWidth: 40,
        sortable: false,
        filter: false,
        editable: false,
        resizable: false,
        pinned: 'left',
      });
    }
    cols.push(...columnDefs);
    return cols;
  }, [columnDefs, showDeleteRow, editable]);

  const onCellValueChanged = useCallback(
    (event: CellValueChangedEvent) => {
      if (!gridRef.current?.api) return;

      // 1. Capture the latest data immediately
      const allData: any[] = [];
      gridRef.current.api.forEachNode((node) => {
        if (node.data) allData.push({ ...node.data }); // Deep copy to avoid reference issues
      });

      // 2. Notify parent immediately
      if (onDataChange) {
        onDataChange(allData);
      }

      // 3. Debounce the "Remote API" sync
      if (debounceRef.current) clearTimeout(debounceRef.current);

      setIsUpdating(true);
      setSaveStatus('QUEUEING SYNC...');

      debounceRef.current = setTimeout(async () => {
        try {
          const timestamp = new Date().toLocaleTimeString();
          setLastApiCallTime(timestamp);
          setSaveStatus(`SYNCING TO API [${timestamp}]...`);

          console.group(`🌐 [MOCK API CALL] @ ${timestamp}`);
          console.log('Target Row:', event.data.id);
          console.log('Field:', event.column.getColId());
          console.log('Update:', `${event.oldValue} -> ${event.newValue}`);
          console.groupEnd();

          // Network simulation
          await new Promise((resolve) => setTimeout(resolve, 1000));

          setSaveStatus('DATABASE SYNCED SUCCESSFULLY!');
          setTimeout(() => setSaveStatus(null), 3000);
        } catch (error) {
          console.error('❌ MOCK API ERROR:', error);
          setSaveStatus('SYNC FAILED!');
        } finally {
          setIsUpdating(false);
          debounceRef.current = null;
        }
      }, 1000);
    },
    [onDataChange]
  );

  const onCellEditingStarted = useCallback((event: any) => {
    console.log('✏️ Editing Started:', event.column.getColId(), 'on row', event.data.id);
  }, []);

  const onCellEditingStopped = useCallback(() => {
    if (gridRef.current?.api) {
      console.log('💾 Cell Editing Stopped - Finalizing persistence');
      const allData: any[] = [];
      gridRef.current.api.forEachNode((node) => {
        if (node.data) allData.push({ ...node.data });
      });
      if (onDataChange) onDataChange(allData);
    }
  }, [onDataChange]);

  const onSelectionChanged = useCallback(() => {
    if (gridRef.current?.api) {
      const selected = gridRef.current.api.getSelectedRows();
      setSelectedRows(selected);

      // Calculate aggregates for numeric columns
      const numericFields = columnDefs
        .filter(c => c.cellDataType === 'number' || (c.field && !isNaN(Number(selected[0]?.[c.field]))))
        .map(c => c.field)
        .filter(Boolean) as string[];

      if (selected.length > 0 && numericFields.length > 0) {
        let totalSum = 0;
        let numericCount = 0;
        selected.forEach(row => {
          numericFields.forEach(field => {
            const val = Number(row[field]);
            if (!isNaN(val)) {
              totalSum += val;
              numericCount++;
            }
          });
        });
        setAggregates({
          sum: totalSum,
          avg: numericCount > 0 ? totalSum / numericCount : 0,
          count: selected.length
        });
      } else {
        setAggregates({ sum: 0, avg: 0, count: selected.length });
      }
    }
  }, [columnDefs]);

  const onCellFocused = useCallback((event: any) => {
    // Keep focus logic if we want to retain cell-level selection effects but remove activeCell state
  }, []);

  const handleAddRow = useCallback(() => {
    const newRow = { id: uuidv4(), ...defaultNewRow };
    if (gridRef.current?.api) {
      gridRef.current.api.applyTransaction({ add: [newRow], addIndex: 0 });
      if (onDataChange) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const allData: any[] = [];
        gridRef.current.api.forEachNode((node) => {
          if (node.data) allData.push(node.data);
        });
        onDataChange(allData);
      }
    }
  }, [defaultNewRow, onDataChange]);

  const handleDeleteRows = useCallback(() => {
    if (gridRef.current?.api && selectedRows.length > 0) {
      gridRef.current.api.applyTransaction({ remove: selectedRows });
      setSelectedRows([]);
      if (onDataChange) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const allData: any[] = [];
        gridRef.current.api.forEachNode((node) => {
          if (node.data) allData.push(node.data);
        });
        onDataChange(allData);
      }
    }
  }, [selectedRows, onDataChange]);

  const handleExportCSV = useCallback(() => {
    if (gridRef.current?.api) {
      gridRef.current.api.exportDataAsCsv({
        fileName: `${title || 'export'}_${new Date().toISOString().split('T')[0]}.csv`,
        columnKeys: columnDefs.map((c) => c.field).filter(Boolean) as string[],
      });
    }
  }, [title, columnDefs]);

  const handleExportExcel = useCallback(async () => {
    if (!gridRef.current?.api) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const allData: any[] = [];
    gridRef.current.api.forEachNode((node) => {
      if (node.data) {
        const row = { ...node.data };
        delete row.id;
        allData.push(row);
      }
    });

    const XLSX = await import('xlsx');
    const ws = XLSX.utils.json_to_sheet(allData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, title || 'Data');
    XLSX.writeFile(wb, `${title || 'export'}_${new Date().toISOString().split('T')[0]}.xlsx`);
  }, [title]);

  const handleBulkEdit = useCallback(() => {
    if (!gridRef.current?.api || !bulkEditField || selectedRows.length === 0) return;
    const updatedRows = selectedRows.map((row) => ({
      ...row,
      [bulkEditField]: isNaN(Number(bulkEditValue)) ? bulkEditValue : Number(bulkEditValue),
    }));
    gridRef.current.api.applyTransaction({ update: updatedRows });
    setShowBulkEditPanel(false);
    setBulkEditField('');
    setBulkEditValue('');
    if (onDataChange) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const allData: any[] = [];
      gridRef.current.api.forEachNode((node) => {
        if (node.data) allData.push(node.data);
      });
      onDataChange(allData);
    }
  }, [bulkEditField, bulkEditValue, selectedRows, onDataChange]);

  const editableFields = columnDefs.filter((c) => c.field && c.field !== 'id').map((c) => c.field!);

  return (
    <div className="flex flex-col gap-1.5 rounded-xl p-2 border"
      style={{ background: 'var(--toolbar-bg)', borderColor: 'var(--border-color)' }}>
      {/* 1. Header Toolbar */}
      <div className="flex flex-wrap items-center gap-2 px-1">
        {leftContent && (
          <div className="flex items-center gap-1.5 shrink-0">
            {leftContent}
          </div>
        )}

        {/* Search */}
        <div className="relative flex-1 min-w-[150px]">
          <Search className="absolute left-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Go to..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full rounded-md border py-1 pl-8 pr-3 text-[11px] outline-none transition-colors focus:border-blue-500/50"
            style={{
              background: 'var(--input-bg)',
              borderColor: 'var(--input-border)',
              color: 'var(--text-color)'
            }}
          />
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1">
          {showAddRow && editable && (
            <button
              onClick={handleAddRow}
              className="flex items-center gap-1 rounded-md bg-blue-600/90 px-2 py-1 text-[10px] font-medium text-white transition-all hover:bg-blue-500"
            >
              <Plus className="h-2.5 w-2.5" />
              Row
            </button>
          )}

          {selectedRows.length > 0 && (
            <div className="flex items-center gap-1 animate-in fade-in slide-in-from-right-2">
              {showDeleteRow && editable && (
                <button
                  onClick={handleDeleteRows}
                  className="flex items-center gap-1 rounded-md bg-red-600/80 px-2 py-1 text-[10px] font-medium text-white hover:bg-red-500"
                >
                  <Trash2 className="h-2.5 w-2.5" />
                  Del
                </button>
              )}
              { (isUpdating || saveStatus) && (
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border shadow-lg animate-in fade-in slide-in-from-top-4 duration-300
                  ${saveStatus?.includes('FAILED') ? 'bg-red-500/20 border-red-500/40 text-red-500' : 
                    saveStatus?.includes('SUCCESSFULLY') ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-500' : 'bg-blue-500/20 border-blue-500/40 text-blue-500'}`}>
                  {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <div className="h-2 w-2 rounded-full bg-current animate-pulse" />}
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold tracking-widest uppercase">{saveStatus}</span>
                    {lastApiCallTime && !isUpdating && <span className="text-[8px] opacity-70">Last Sync: {lastApiCallTime}</span>}
                  </div>
                </div>
              )}

          {showBulkEdit && editable && (
                <button
                  onClick={() => setShowBulkEditPanel(!showBulkEditPanel)}
                  className="flex items-center gap-1 rounded-md bg-amber-600/80 px-2 py-1 text-[10px] font-medium text-white hover:bg-amber-500"
                >
                  <Edit3 className="h-2.5 w-2.5" />
                  Bulk
                </button>
              )}
            </div>
          )}

          {showExport && (
            <div className="flex items-center gap-0.5 ml-1">
              <button
                onClick={handleExportCSV}
                className="rounded-md border p-1 hover:bg-white/10"
                style={{ background: 'var(--input-bg)', borderColor: 'var(--border-color)', color: 'var(--old-price)' }}
                title="CSV"
              >
                <Download className="h-3 w-3" />
              </button>
              <button
                onClick={handleExportExcel}
                className="rounded-md border p-1 hover:bg-white/10"
                style={{ background: 'var(--input-bg)', borderColor: 'var(--border-color)', color: 'var(--old-price)' }}
                title="Excel"
              >
                <FileSpreadsheet className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bulk edit panel (Conditional) */}
      {showBulkEditPanel && (
        <div className="mx-1 flex flex-wrap items-center gap-1.5 rounded-md border p-2"
          style={{ background: 'rgba(217, 119, 6, 0.05)', borderColor: 'rgba(217, 119, 6, 0.2)' }}>
          <select
            value={bulkEditField}
            onChange={(e) => setBulkEditField(e.target.value)}
            className="rounded border px-2 py-1 text-[10px] outline-none"
            style={{ background: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--text-color)' }}
          >
            <option value="" style={{ background: 'var(--croma-wall)' }}>Field...</option>
            {editableFields.map((f) => (
              <option key={f} value={f} style={{ background: 'var(--croma-wall)' }}>
                {f}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Value"
            value={bulkEditValue}
            onChange={(e) => setBulkEditValue(e.target.value)}
            className="rounded border px-2 py-1 text-[10px] outline-none focus:border-blue-500/50"
            style={{ background: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--text-color)' }}
          />
          <button
            onClick={handleBulkEdit}
            disabled={!bulkEditField}
            className="rounded bg-amber-600 px-2 py-1 text-[10px] font-medium text-white disabled:opacity-40"
          >
            Apply
          </button>
          <button
            onClick={() => setShowBulkEditPanel(false)}
            className="rounded px-2 py-1 text-[10px]"
            style={{ background: 'var(--input-bg)', color: 'var(--old-price)' }}
          >
            Cancel
          </button>
        </div>
      )}

      {/* 2. Grid */}
      <div className={`${state.theme === 'light' ? 'ag-theme-alpine' : 'ag-theme-alpine-dark'} rounded-md border overflow-hidden`}
        style={{ height: 480, borderColor: 'var(--border-color)' }}>
        <AgGridReact
          ref={gridRef}
          rowData={rowData}
          columnDefs={enhancedColumnDefs}
          defaultColDef={defaultColDef}
          quickFilterText={searchText}
          pagination={true}
          paginationPageSize={50}
          paginationPageSizeSelector={[25, 50, 100]}
          rowSelection="multiple"
          suppressRowClickSelection={true}
          onCellValueChanged={onCellValueChanged}
          onCellEditingStarted={onCellEditingStarted}
          onCellEditingStopped={onCellEditingStopped}
          onSelectionChanged={onSelectionChanged}
          onCellFocused={onCellFocused}
          animateRows={true}
          getRowId={(params) => params.data.id}
          domLayout="normal"
          headerHeight={32}
          rowHeight={28}
          className="excel-mode-grid"
        />
      </div>
    </div>
  );
}
