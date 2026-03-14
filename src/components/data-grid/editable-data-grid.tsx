'use client';

import React, { useCallback, useMemo, useRef, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, ModuleRegistry, ColDef, GridApi, CellValueChangedEvent } from 'ag-grid-community';
import {
  Search,
  Plus,
  Trash2,
  Download,
  FileSpreadsheet,
  Edit3,
  RotateCcw,
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
}: EditableDataGridProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const gridRef = useRef<AgGridReact<any>>(null);
  const [searchText, setSearchText] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [bulkEditField, setBulkEditField] = useState('');
  const [bulkEditValue, setBulkEditValue] = useState('');
  const [showBulkEditPanel, setShowBulkEditPanel] = useState(false);

  const defaultColDef = useMemo<ColDef>(
    () => ({
      sortable: true,
      filter: true,
      resizable: true,
      editable: editable,
      flex: 1,
      minWidth: 120,
    }),
    [editable]
  );

  const enhancedColumnDefs = useMemo(() => {
    const cols: ColDef[] = [];
    if (showDeleteRow && editable) {
      cols.push({
        headerCheckboxSelection: true,
        checkboxSelection: true,
        width: 50,
        maxWidth: 50,
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
      if (onDataChange && gridRef.current?.api) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const allData: any[] = [];
        gridRef.current.api.forEachNode((node) => {
          if (node.data) allData.push(node.data);
        });
        onDataChange(allData);
      }
    },
    [onDataChange]
  );

  const onSelectionChanged = useCallback(() => {
    if (gridRef.current?.api) {
      const selected = gridRef.current.api.getSelectedRows();
      setSelectedRows(selected);
    }
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
    <div className="flex flex-col gap-3">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search across all columns..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none transition-colors focus:border-blue-500/50 focus:bg-white/[0.07]"
          />
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1.5">
          {showAddRow && editable && (
            <button
              onClick={handleAddRow}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white shadow-sm shadow-blue-500/25 transition-all hover:bg-blue-500 active:scale-95"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Row
            </button>
          )}

          {showDeleteRow && editable && selectedRows.length > 0 && (
            <button
              onClick={handleDeleteRows}
              className="flex items-center gap-1.5 rounded-lg bg-red-600/80 px-3 py-2 text-xs font-medium text-white transition-all hover:bg-red-500 active:scale-95"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete ({selectedRows.length})
            </button>
          )}

          {showBulkEdit && editable && selectedRows.length > 0 && (
            <button
              onClick={() => setShowBulkEditPanel(!showBulkEditPanel)}
              className="flex items-center gap-1.5 rounded-lg bg-amber-600/80 px-3 py-2 text-xs font-medium text-white transition-all hover:bg-amber-500 active:scale-95"
            >
              <Edit3 className="h-3.5 w-3.5" />
              Bulk Edit ({selectedRows.length})
            </button>
          )}

          {showExport && (
            <>
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-slate-300 transition-all hover:bg-white/10 active:scale-95"
              >
                <Download className="h-3.5 w-3.5" />
                CSV
              </button>
              <button
                onClick={handleExportExcel}
                className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-slate-300 transition-all hover:bg-white/10 active:scale-95"
              >
                <FileSpreadsheet className="h-3.5 w-3.5" />
                Excel
              </button>
            </>
          )}
        </div>
      </div>

      {/* Bulk edit panel */}
      {showBulkEditPanel && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
          <select
            value={bulkEditField}
            onChange={(e) => setBulkEditField(e.target.value)}
            className="rounded-lg border border-white/10 bg-slate-800 px-3 py-1.5 text-sm text-white outline-none"
          >
            <option value="">Select field...</option>
            {editableFields.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="New value"
            value={bulkEditValue}
            onChange={(e) => setBulkEditValue(e.target.value)}
            className="rounded-lg border border-white/10 bg-slate-800 px-3 py-1.5 text-sm text-white outline-none focus:border-blue-500/50"
          />
          <button
            onClick={handleBulkEdit}
            disabled={!bulkEditField}
            className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-medium text-white transition-all hover:bg-amber-500 disabled:opacity-40"
          >
            Apply
          </button>
          <button
            onClick={() => setShowBulkEditPanel(false)}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-400 transition-all hover:bg-white/10"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Grid */}
      <div className="ag-theme-alpine-dark rounded-xl border border-white/10 overflow-hidden" style={{ height: 520 }}>
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
          onSelectionChanged={onSelectionChanged}
          animateRows={true}
          getRowId={(params) => params.data.id}
          domLayout="normal"
        />
      </div>
    </div>
  );
}
