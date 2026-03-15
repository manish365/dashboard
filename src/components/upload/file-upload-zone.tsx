'use client';

import React, { useCallback, useState, useRef } from 'react';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle, X, Eye } from 'lucide-react';
import * as XLSX from 'xlsx';

interface FileUploadZoneProps {
  templateName: string;
  expectedColumns?: string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onFileLoaded?: (data: any[], fileName: string, validationMessages: string[]) => void;
  onClose?: () => void;
}

export default function FileUploadZone({
  templateName,
  expectedColumns = [],
  onFileLoaded,
  onClose,
}: FileUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [previewColumns, setPreviewColumns] = useState<string[]>([]);
  const [validationMessages, setValidationMessages] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    (file: File) => {
      setIsProcessing(true);
      setFileName(file.name);
      const messages: string[] = [];

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

          if (jsonData.length === 0) {
            messages.push('⚠ File is empty or has no data rows');
            setValidationMessages(messages);
            setIsProcessing(false);
            return;
          }

          const fileColumns = Object.keys(jsonData[0]);
          setPreviewColumns(fileColumns);

          // Validate expected columns
          if (expectedColumns.length > 0) {
            const missingCols = expectedColumns.filter(
              (c) => !fileColumns.some((fc) => fc.toLowerCase() === c.toLowerCase())
            );
            if (missingCols.length > 0) {
              messages.push(`⚠ Missing columns: ${missingCols.join(', ')}`);
            }

            const extraCols = fileColumns.filter(
              (fc) => !expectedColumns.some((c) => c.toLowerCase() === fc.toLowerCase())
            );
            if (extraCols.length > 0) {
              messages.push(`ℹ Extra columns found: ${extraCols.join(', ')}`);
            }
          }

          messages.push(`✓ Found ${jsonData.length} rows and ${fileColumns.length} columns`);
          messages.push(`✓ Sheet: ${sheetName}`);

          // Add id to each row
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const processedData = jsonData.map((row: any, idx: number) => ({
            id: `upload-${idx}`,
            ...row,
          }));

          setPreviewData(processedData.slice(0, 10));
          setValidationMessages(messages);
          setIsProcessing(false);

          // Store full data for later loading
          (window as any).__uploadedData = processedData;
          (window as any).__uploadedMessages = messages;
        } catch (err) {
          messages.push(`✗ Error reading file: ${(err as Error).message}`);
          setValidationMessages(messages);
          setIsProcessing(false);
        }
      };

      reader.readAsArrayBuffer(file);
    },
    [expectedColumns]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleLoadData = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = (window as any).__uploadedData || [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const msgs = (window as any).__uploadedMessages || [];
    if (onFileLoaded) {
      onFileLoaded(data, fileName, msgs);
    }
  };

  return (
    <div className="rounded-xl border p-4 shadow-sm"
      style={{ background: 'var(--toolbar-bg)', borderColor: 'var(--border-color)' }}>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="h-4 w-4 text-blue-500" />
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-color)' }}>{templateName}</h3>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-slate-500 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {!fileName ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center gap-3 rounded-lg border-2 border-dashed p-8 transition-all ${
            isDragging
              ? 'border-blue-500 bg-blue-500/10 upload-zone-active'
              : 'border-slate-300 bg-slate-500/5 dark:border-white/10 dark:bg-white/[0.02] hover:border-blue-400 hover:bg-blue-500/5'
          }`}
        >
          <Upload className={`h-8 w-8 ${isDragging ? 'text-blue-500' : 'text-slate-400'}`} />
          <div className="text-center">
            <p className="text-sm font-medium" style={{ color: 'var(--text-color)' }}>
              {isDragging ? 'Drop file here' : 'Drag & drop or click to browse'}
            </p>
            <p className="mt-1 text-xs opacity-60" style={{ color: 'var(--text-color)' }}>Supports .xlsx, .xls, .xlsb, .csv</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.xlsb,.csv"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      ) : (
        <div className="space-y-3">
          {/* File info */}
          <div className="flex items-center justify-between rounded-lg px-3 py-2 border"
               style={{ background: 'var(--input-bg)', borderColor: 'var(--border-color)' }}>
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4 text-emerald-500" />
              <span className="text-sm font-medium" style={{ color: 'var(--text-color)' }}>{fileName}</span>
            </div>
            <button
              onClick={() => {
                setFileName('');
                setPreviewData([]);
                setPreviewColumns([]);
                setValidationMessages([]);
              }}
              className="text-xs text-slate-400 hover:text-white"
            >
              Change file
            </button>
          </div>

          {/* Validation messages */}
          {validationMessages.length > 0 && (
            <div className="space-y-1">
              {validationMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-2 rounded-md px-3 py-1.5 text-xs ${
                    msg.startsWith('✗')
                      ? 'bg-red-500/10 text-red-400'
                      : msg.startsWith('⚠')
                      ? 'bg-amber-500/10 text-amber-400'
                      : msg.startsWith('ℹ')
                      ? 'bg-blue-500/10 text-blue-400'
                      : 'bg-green-500/10 text-green-400'
                  }`}
                >
                  {msg.startsWith('✗') ? (
                    <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
                  ) : (
                    <CheckCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
                  )}
                  <span>{msg}</span>
                </div>
              ))}
            </div>
          )}

          {/* Preview table */}
          {previewData.length > 0 && (
            <div>
              <div className="mb-2 flex items-center gap-2">
                <Eye className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-xs text-slate-400">
                  Preview (first {previewData.length} rows)
                </span>
              </div>
              <div className="overflow-x-auto rounded-lg border" style={{ borderColor: 'var(--border-color)' }}>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b" style={{ background: 'var(--navbar-carousel-color)', borderColor: 'var(--border-color)' }}>
                      {previewColumns.map((col) => (
                        <th
                          key={col}
                          className="whitespace-nowrap px-3 py-2 text-left font-bold uppercase tracking-wider opacity-70"
                          style={{ color: 'var(--text-color)' }}
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.map((row, idx) => (
                      <tr
                        key={idx}
                        className="border-b hover:bg-blue-500/5"
                        style={{ borderColor: 'var(--border-color)' }}
                      >
                        {previewColumns.map((col) => (
                          <td key={col} className="whitespace-nowrap px-3 py-1.5 font-medium" style={{ color: 'var(--text-color)' }}>
                            {String(row[col] ?? '')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Load button */}
          {previewData.length > 0 && (
            <button
              onClick={handleLoadData}
              className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm shadow-blue-500/25 transition-all hover:bg-blue-500 active:scale-[0.98]"
            >
              Load into Grid
            </button>
          )}
        </div>
      )}

      {isProcessing && (
        <div className="mt-3 flex items-center justify-center gap-2 text-sm text-slate-400">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          Processing file...
        </div>
      )}
    </div>
  );
}
