'use client';

import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Play, Save, Loader2, AlertCircle, Terminal } from 'lucide-react';

interface SqlEditorProps {
  initialValue?: string;
  onExecute: (sql: string) => void;
  onSave: (sql: string, name: string) => void;
  loading?: boolean;
}

export const SqlEditor: React.FC<SqlEditorProps> = ({
  initialValue = 'SELECT * FROM users LIMIT 10;',
  onExecute, onSave, loading = false
}) => {
  const [sql, setSql] = useState(initialValue);
  const [queryName, setQueryName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  const handleSave = () => {
    if (!queryName.trim()) return;
    onSave(sql, queryName);
    setShowSaveDialog(false);
    setQueryName('');
  };

  return (
    <div className="de-card-bg de-border flex flex-col h-[500px] rounded-2xl shadow-2xl overflow-hidden border">
      {/* Toolbar */}
      <div className="de-toolbar-bg de-border flex items-center justify-between px-6 py-4 border-b backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-2.5 py-1 theme-tag-accent border rounded-md">
            <Terminal className="h-3.5 w-3.5 theme-text-accent" />
            <span className="text-[10px] font-bold theme-text-accent uppercase tracking-widest">SQL Workbench</span>
          </div>
          <div className="de-border h-4 w-px border-l" />
          <div className="flex gap-1.5 opacity-50">
            <div className="w-2 h-2 rounded-full theme-tag-danger border" />
            <div className="w-2 h-2 rounded-full theme-tag-warning border" />
            <div className="w-2 h-2 rounded-full theme-tag-success border" />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setShowSaveDialog(true)} className="de-text-muted de-hover-text flex items-center gap-2.5 px-4 py-2 text-xs font-bold hover:bg-white/5 rounded-xl transition-all">
            <Save className="h-4 w-4" />
            Save Snippet
          </button>
          <button onClick={() => onExecute(sql)} disabled={loading || !sql.trim()} className="theme-btn-accent flex items-center gap-2.5 px-6 py-2 rounded-xl font-bold active:scale-95 transition-all disabled:opacity-50">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4 fill-current" />}
            Run Query
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 relative">
        <Editor
          height="100%"
          defaultLanguage="sql"
          theme="vs-dark"
          value={sql}
          onChange={(v) => setSql(v || '')}
          options={{
            minimap: { enabled: false }, fontSize: 14,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            lineHeight: 1.6, padding: { top: 20, bottom: 20 },
            scrollBeyondLastLine: false, automaticLayout: true,
            suggestOnTriggerCharacters: true, renderLineHighlight: 'all',
            cursorSmoothCaretAnimation: 'on', smoothScrolling: true,
            scrollbar: { vertical: 'hidden', horizontal: 'hidden' }
          }}
        />
      </div>

      {/* Footer */}
      <div className="de-toolbar-bg de-border de-text-muted flex items-center justify-between px-6 py-3 border-t">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-3.5 w-3.5 theme-text-warning" />
          <span className="text-[10px] font-medium tracking-tight uppercase">READ-ONLY SESSION • AUTO-ENFORCED LIMIT 10,000</span>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-mono">
          <span>LINES: {sql.split('\n').length}</span>
          <span>CHARS: {sql.length}</span>
        </div>
      </div>

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="de-card-bg de-border rounded-2xl shadow-2xl p-6 w-full max-w-sm border">
            <h3 className="de-text font-bold mb-4 flex items-center gap-2">
              <Save className="h-5 w-5 text-indigo-400" />
              Save Query Snippet
            </h3>
            <div className="space-y-4">
              <div>
                <label className="de-text-muted text-[10px] font-bold uppercase tracking-widest mb-1.5 block">Query Name</label>
                <input
                  type="text" autoFocus value={queryName}
                  onChange={(e) => setQueryName(e.target.value)}
                  placeholder="e.g. Monthly Revenue Report"
                  className="de-input w-full rounded-xl px-4 py-2.5 border focus:ring-1 focus:ring-var(--neon-green) transition-all"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowSaveDialog(false)} className="de-input-bg de-text-muted flex-1 px-4 py-2 rounded-xl font-bold hover:bg-white/5 transition-all">Cancel</button>
                <button onClick={handleSave} disabled={!queryName.trim()} className="theme-btn-accent flex-1 px-4 py-2 rounded-xl font-bold disabled:opacity-50 transition-all">Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
