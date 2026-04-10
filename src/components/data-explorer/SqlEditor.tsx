'use client';

import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Play, Save, Loader2, AlertCircle, Database, Terminal } from 'lucide-react';

interface SqlEditorProps {
  initialValue?: string;
  onExecute: (sql: string) => void;
  onSave: (sql: string, name: string) => void;
  loading?: boolean;
}

export const SqlEditor: React.FC<SqlEditorProps> = ({ 
  initialValue = "SELECT * FROM users LIMIT 10;", 
  onExecute, 
  onSave,
  loading = false
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
    <div className="flex flex-col h-[500px] bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-800 ring-1 ring-white/5">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-4 bg-slate-800/40 border-b border-slate-700/50 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-2.5 py-1 bg-indigo-500/10 rounded-md border border-indigo-500/20">
            <Terminal className="h-3.5 w-3.5 text-indigo-400" />
            <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">SQL Workbench</span>
          </div>
          <div className="h-4 w-px bg-slate-700" />
          <div className="flex gap-1.5 px-1">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/40" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/40" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/40" />
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowSaveDialog(true)}
            className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-700 rounded-xl transition-all border border-transparent hover:border-slate-600"
          >
            <Save className="h-4 w-4 text-slate-400" />
            Save Snippet
          </button>
          <button 
            onClick={() => onExecute(sql)}
            disabled={loading || !sql.trim()}
            className="flex items-center gap-2.5 bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-indigo-500 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 shadow-lg shadow-indigo-600/20"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4 fill-current" />}
            Run Query
          </button>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 relative group">
        <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-700" />
        <Editor
          height="100%"
          defaultLanguage="sql"
          theme="vs-dark"
          value={sql}
          onChange={(value: string | undefined) => setSql(value || '')}

          options={{
            minimap: { enabled: false },
            fontSize: 14,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            lineHeight: 1.6,
            padding: { top: 20, bottom: 20 },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            suggestOnTriggerCharacters: true,
            renderLineHighlight: 'all',
            cursorSmoothCaretAnimation: "on",
            smoothScrolling: true,
            scrollbar: {
              vertical: 'hidden',
              horizontal: 'hidden'
            }
          }}
        />
      </div>

      {/* Footer Info */}
      <div className="px-6 py-3 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-3.5 w-3.5 text-amber-500/80" />
          <span className="text-[10px] text-slate-500 font-medium tracking-tight uppercase">
            READ-ONLY SESSION • AUTO-ENFORCED LIMIT 10,000
          </span>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-mono text-slate-600">
          <span>LINES: {sql.split('\n').length}</span>
          <span>CHARS: {sql.length}</span>
        </div>
      </div>

      {/* Save Dialog Overlay */}
      {showSaveDialog && (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 w-full max-w-sm">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <Save className="h-5 w-5 text-indigo-400" />
              Save Query Snippet
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Query Name</label>
                <input 
                  type="text" 
                  autoFocus
                  value={queryName}
                  onChange={(e) => setQueryName(e.target.value)}
                  placeholder="e.g. Monthly Revenue Report"
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => setShowSaveDialog(false)}
                  className="flex-1 px-4 py-2 bg-slate-800 text-slate-400 rounded-xl font-bold hover:bg-slate-700 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSave}
                  disabled={!queryName.trim()}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-500 disabled:opacity-50 transition-all shadow-lg shadow-indigo-600/20"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
