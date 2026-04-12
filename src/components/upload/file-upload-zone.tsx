'use client';

import React, { useCallback, useState, useRef } from 'react';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle, X, Eye } from 'lucide-react';
import * as XLSX from 'xlsx';

interface FileUploadZoneProps {
  templateName: string;
  expectedColumns?: string[];
  onFileLoaded?: (data: any[], fileName: string, validationMessages: string[]) => void;
  onClose?: () => void;
}

export default function FileUploadZone({ templateName, expectedColumns = [], onFileLoaded, onClose }: FileUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState('');
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [previewColumns, setPreviewColumns] = useState<string[]>([]);
  const [validationMessages, setValidationMessages] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback((file: File) => {
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
        const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (jsonData.length === 0) {
          messages.push('⚠ File is empty or has no data rows');
          setValidationMessages(messages); setIsProcessing(false); return;
        }

        const fileColumns = Object.keys(jsonData[0]);
        setPreviewColumns(fileColumns);

        if (expectedColumns.length > 0) {
          const missingCols = expectedColumns.filter((c) => !fileColumns.some((fc) => fc.toLowerCase() === c.toLowerCase()));
          if (missingCols.length > 0) messages.push(`⚠ Missing columns: ${missingCols.join(', ')}`);
          const extraCols = fileColumns.filter((fc) => !expectedColumns.some((c) => c.toLowerCase() === fc.toLowerCase()));
          if (extraCols.length > 0) messages.push(`ℹ Extra columns found: ${extraCols.join(', ')}`);
        }

        messages.push(`✓ Found ${jsonData.length} rows and ${fileColumns.length} columns`);
        messages.push(`✓ Sheet: ${sheetName}`);

        const processedData = jsonData.map((row: any, idx: number) => ({ id: `upload-${idx}`, ...row }));
        setPreviewData(processedData.slice(0, 10));
        setValidationMessages(messages);
        setIsProcessing(false);
        (window as any).__uploadedData = processedData;
        (window as any).__uploadedMessages = messages;
      } catch (err) {
        messages.push(`✗ Error reading file: ${(err as Error).message}`);
        setValidationMessages(messages); setIsProcessing(false);
      }
    };
    reader.readAsArrayBuffer(file);
  }, [expectedColumns]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleLoadData = () => {
    const data = (window as any).__uploadedData || [];
    const msgs = (window as any).__uploadedMessages || [];
    if (onFileLoaded) onFileLoaded(data, fileName, msgs);
  };

  return (
    <div className="theme-toolbar-bg theme-border rounded-xl border p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="theme-text-info h-4 w-4" />
          <h3 className="theme-text text-sm font-semibold">{templateName}</h3>
        </div>
        {onClose && (
          <button onClick={onClose} className="theme-text-muted hover:theme-text">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {!fileName ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center gap-3 rounded-lg border-2 border-dashed p-8 transition-all ${
            isDragging ? 'theme-border-brand theme-tag-brand' : 'theme-border theme-footer-bg hover:theme-border-brand hover:theme-tag-brand/20'
          }`}
        >
          <Upload className={`h-8 w-8 ${isDragging ? 'theme-text-brand' : 'theme-text-subtle'}`} />
          <div className="text-center">
            <p className="theme-text text-sm font-medium">{isDragging ? 'Drop file here' : 'Drag & drop or click to browse'}</p>
            <p className="theme-text mt-1 text-xs opacity-60">Supports .xlsx, .xls, .xlsb, .csv</p>
          </div>
          <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.xlsb,.csv" onChange={handleFileSelect} className="hidden" />
        </div>
      ) : (
        <div className="space-y-3">
          <div className="theme-input-bg theme-border flex items-center justify-between rounded-lg border px-3 py-2">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="theme-text-success h-4 w-4" />
              <span className="theme-text text-sm font-medium">{fileName}</span>
            </div>
            <button onClick={() => { setFileName(''); setPreviewData([]); setPreviewColumns([]); setValidationMessages([]); }} className="theme-text-muted text-xs hover:theme-text">
              Change file
            </button>
          </div>

          {validationMessages.length > 0 && (
            <div className="space-y-1">
              {validationMessages.map((msg, i) => (
                <div key={i} className={`flex items-start gap-2 rounded-md px-3 py-1.5 text-xs border theme-border ${
                  msg.startsWith('✗') ? 'theme-tag-danger theme-text-danger'
                  : msg.startsWith('⚠') ? 'theme-tag-warning theme-text-warning'
                  : msg.startsWith('ℹ') ? 'theme-tag-info theme-text-info'
                  : 'theme-tag-success theme-text-success'
                }`}>
                  {msg.startsWith('✗') ? <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" /> : <CheckCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />}
                  <span>{msg}</span>
                </div>
              ))}
            </div>
          )}

          {previewData.length > 0 && (
            <div>
              <div className="mb-2 flex items-center gap-2">
                <Eye className="h-3.5 w-3.5 theme-text-subtle" />
                <span className="text-xs theme-text-subtle">Preview (first {previewData.length} rows)</span>
              </div>
              <div className="theme-border overflow-x-auto rounded-lg border">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="theme-dropdown-bg theme-border border-b">
                      {previewColumns.map((col) => (
                        <th key={col} className="theme-text whitespace-nowrap px-3 py-2 text-left font-bold uppercase tracking-wider opacity-70">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.map((row, idx) => (
                      <tr key={idx} className="theme-border border-b hover:bg-white/5">
                        {previewColumns.map((col) => (
                          <td key={col} className="theme-text whitespace-nowrap px-3 py-1.5 font-medium">{String(row[col] ?? '')}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {previewData.length > 0 && (
            <button onClick={handleLoadData} className="w-full rounded-lg theme-btn-accent px-4 py-2 text-sm font-medium transition-all hover:opacity-90 active:scale-[0.98]">
              Load into Grid
            </button>
          )}
        </div>
      )}

      {isProcessing && (
        <div className="mt-3 flex items-center justify-center gap-2 text-sm theme-text-subtle">
          <div className="h-4 w-4 animate-spin rounded-full border-2 theme-border-brand border-t-transparent" />
          Processing file...
        </div>
      )}
    </div>
  );
}
