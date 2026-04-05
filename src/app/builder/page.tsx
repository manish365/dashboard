'use client';

import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
  Plus, 
  Save, 
  Eye, 
  Code, 
  ChevronLeft, 
  Settings2, 
  Trash2, 
  GripVertical,
  Layout as LayoutIcon,
  Play
} from 'lucide-react';
import { PageSchema, ComponentInstance, ComponentMetadata } from '@/lib/builder/types';
import { getAllMetadata } from '@/lib/builder/registry';
import { generateReactCode } from '@/lib/builder/code-generator';
import DynamicRenderer from '@/components/renderer/dynamic-renderer';
import { useToast } from '@/providers/toast-context';

export default function PageBuilder() {
  const { showToast } = useToast();
  const [schema, setSchema] = useState<PageSchema>({
    id: uuidv4(),
    pageName: 'New Dashboard',
    slug: 'new-dashboard',
    layout: 'grid',
    columns: 12,
    components: []
  });

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [viewMode, setViewMode] = useState<'canvas' | 'json' | 'code'>('canvas');
  const allWidgets = getAllMetadata();

  const addComponent = (metadata: ComponentMetadata) => {
    const newComponent: ComponentInstance = {
      id: uuidv4(),
      type: metadata.type,
      props: { ...metadata.defaultProps },
      layout: { w: metadata.type === 'KpiCard' ? 3 : metadata.type === 'DataTable' ? 12 : 6 }
    };
    setSchema(prev => ({
      ...prev,
      components: [...prev.components, newComponent]
    }));
    setSelectedId(newComponent.id);
    showToast(`${metadata.name} added to canvas`, 'success');
  };

  const removeComponent = (id: string) => {
    setSchema(prev => ({
      ...prev,
      components: prev.components.filter(c => c.id !== id)
    }));
    if (selectedId === id) setSelectedId(null);
  };

  const updateComponentProps = (id: string, newProps: any) => {
    setSchema(prev => ({
      ...prev,
      components: prev.components.map(c => c.id === id ? { ...c, props: { ...c.props, ...newProps } } : c)
    }));
  };

  const updateComponentLayout = (id: string, newLayout: any) => {
    setSchema(prev => ({
      ...prev,
      components: prev.components.map(c => c.id === id ? { ...c, layout: { ...c.layout, ...newLayout } } : c)
    }));
  };

  const selectedComponent = schema.components.find(c => c.id === selectedId);
  const selectedMetadata = selectedComponent ? allWidgets.find(w => w.type === selectedComponent.type) : null;

  return (
    <div className="flex h-[calc(100vh-6rem)] flex-col gap-4">
      {/* Top Toolbar */}
      <div className="flex items-center justify-between rounded-2xl border px-6 py-3" style={{ background: 'var(--navbar-carousel-color)', borderColor: 'var(--header-border)' }}>
        <div className="flex items-center gap-4">
          <ChevronLeft className="h-5 w-5 cursor-pointer opacity-60 hover:opacity-100" />
          <div>
            <input 
              type="text" 
              value={schema.pageName}
              onChange={(e) => setSchema(prev => ({ ...prev, pageName: e.target.value }))}
              className="bg-transparent text-lg font-bold outline-none"
              style={{ color: 'var(--text-color)' }}
            />
            <p className="text-[10px] uppercase tracking-widest opacity-40" style={{ color: 'var(--text-color)' }}>
              /{schema.slug}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-black/20 rounded-xl p-1 border border-white/5 mr-2">
            <button 
              onClick={() => setViewMode('canvas')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${viewMode === 'canvas' ? 'bg-white/10' : 'opacity-50 hover:opacity-100'}`}
              style={{ color: 'var(--text-color)' }}
            >
              Canvas
            </button>
            <button 
              onClick={() => setViewMode('json')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${viewMode === 'json' ? 'bg-white/10' : 'opacity-50 hover:opacity-100'}`}
              style={{ color: 'var(--text-color)' }}
            >
              <Code className="h-3.5 w-3.5" /> JSON
            </button>
            <button 
              onClick={() => setViewMode('code')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${viewMode === 'code' ? 'bg-blue-600 text-white' : 'opacity-50 hover:opacity-100'}`}
              style={{ color: viewMode === 'code' ? 'white' : 'var(--text-color)' }}
            >
              <LayoutIcon className="h-3.5 w-3.5" /> React Code
            </button>
          </div>
          <button 
            onClick={() => setPreviewMode(!previewMode)}
            className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-bold transition-all ${previewMode ? 'bg-amber-600 text-white border-amber-500' : 'hover:bg-white/5'}`}
            style={{ color: previewMode ? 'white' : 'var(--text-color)', borderColor: previewMode ? 'transparent' : 'var(--border-color)' }}
          >
            {previewMode ? <Settings2 className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {previewMode ? 'Edit Mode' : 'Preview'}
          </button>
          <button 
            onClick={() => showToast('Page schema saved successfully!', 'success')}
            className="flex items-center gap-2 rounded-xl bg-[var(--neon-green)] px-6 py-2 text-xs font-bold text-black shadow-lg shadow-[var(--neon-green)]/20 hover:opacity-90 active:scale-95"
          >
            <Save className="h-4 w-4" /> Save Page
          </button>
        </div>
      </div>

      <div className="flex flex-1 gap-4 overflow-hidden">
        {/* Left Panel: Widgets Palette */}
        <div className={`w-72 flex-col gap-4 rounded-2xl border p-4 overflow-y-auto ${previewMode ? 'hidden' : 'flex'}`}
             style={{ background: 'var(--navbar-carousel-color)', borderColor: 'var(--header-border)' }}>
          <h3 className="text-xs font-bold uppercase tracking-widest opacity-60" style={{ color: 'var(--text-color)' }}>Components</h3>
          <div className="grid grid-cols-1 gap-2">
            {allWidgets.map(widget => (
              <button
                key={widget.type}
                onClick={() => addComponent(widget)}
                className="flex items-center gap-3 rounded-xl border p-3 text-left transition-all hover:border-[var(--neon-green)]/30 hover:bg-white/5"
                style={{ background: 'var(--foot-color)', borderColor: 'var(--border-color)' }}
              >
                <div className="rounded-lg bg-blue-500/10 p-2 text-blue-500">
                  <Plus className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-bold" style={{ color: 'var(--text-color)' }}>{widget.name}</p>
                  <p className="text-[10px] opacity-60" style={{ color: 'var(--text-color)' }}>{widget.category}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Center: Canvas */}
        <div className={`flex-1 overflow-y-auto rounded-2xl border p-8 transition-all ${previewMode || viewMode !== 'canvas' ? 'w-full' : ''}`}
             style={{ background: 'var(--croma-wall)', borderColor: 'var(--header-border)' }}>
          {viewMode === 'json' && (
            <pre className="h-full rounded-xl bg-black/40 p-6 text-[11px] text-blue-400 overflow-auto select-all">
              {JSON.stringify(schema, null, 2)}
            </pre>
          )}

          {viewMode === 'code' && (
            <div className="h-full relative group">
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(generateReactCode(schema));
                  showToast('React code copied to clipboard!', 'success');
                }}
                className="absolute top-4 right-4 rounded-lg bg-blue-600 hover:bg-blue-500 px-4 py-2 text-xs font-bold text-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
              >
                Copy Code
              </button>
              <pre className="h-full rounded-xl bg-[#0d1117] p-6 text-[12px] text-emerald-400 overflow-auto whitespace-pre-wrap select-all border border-white/5 font-mono leading-relaxed">
                {generateReactCode(schema)}
              </pre>
            </div>
          )}

          {viewMode === 'canvas' && (
            <div className={`relative min-h-full ${previewMode ? '' : 'p-4 rounded-xl border-2 border-dashed border-white/5 bg-white/[0.01]'}`}>
              {/* Interaction Overlay (In Edit Mode) */}
              {!previewMode && schema.components.map(comp => (
                 <div 
                   key={comp.id}
                   onClick={(e) => { e.stopPropagation(); setSelectedId(comp.id); }}
                   className={`group relative mb-4 transition-all ${selectedId === comp.id ? 'ring-2 ring-blue-500 rounded-xl' : ''}`}
                 >
                    <div className="pointer-events-none opacity-40 grayscale-[0.5] group-hover:grayscale-0 group-hover:opacity-100 transition-all">
                      <DynamicRenderer schema={{ ...schema, components: [comp] }} />
                    </div>
                    {/* Floating Controls */}
                    {selectedId === comp.id && (
                      <div className="absolute -right-2 -top-2 flex gap-1 z-10">
                        <button 
                          onClick={(e) => { e.stopPropagation(); removeComponent(comp.id); }}
                          className="rounded-lg bg-red-600 p-1.5 text-white shadow-lg hover:bg-red-500"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                 </div>
              ))}

              {/* Real Renderer (In Preview Mode) */}
              {previewMode && <DynamicRenderer schema={schema} />}

              {schema.components.length === 0 && (
                <div className="flex h-64 flex-col items-center justify-center gap-3">
                  <LayoutIcon className="h-10 w-10 opacity-20" />
                  <p className="text-sm opacity-40">Drag or click components to build your page</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Panel: Prop Editor */}
        <div className={`w-80 flex-col gap-6 rounded-2xl border p-6 overflow-y-auto ${previewMode || viewMode !== 'canvas' || !selectedId ? 'hidden' : 'flex'}`}
             style={{ background: 'var(--navbar-carousel-color)', borderColor: 'var(--header-border)' }}>
          {selectedComponent && selectedMetadata ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: 'var(--border-color)' }}>
                <div>
                  <h3 className="text-sm font-bold" style={{ color: 'var(--text-color)' }}>{selectedMetadata.name}</h3>
                  <p className="text-[10px] opacity-50" style={{ color: 'var(--text-color)' }}>Settings</p>
                </div>
                <LayoutIcon className="h-4 w-4 opacity-40" />
              </div>

              {/* Layout Settings */}
              <div className="space-y-3">
                 <p className="text-[10px] font-bold uppercase tracking-widest opacity-40" style={{ color: 'var(--text-color)' }}>Layout</p>
                 <div className="space-y-2">
                   <label className="text-xs opacity-70" style={{ color: 'var(--text-color)' }}>Width (Grid Columns)</label>
                   <input 
                     type="range" min="1" max="12" 
                     value={selectedComponent.layout?.w || 12}
                     onChange={(e) => updateComponentLayout(selectedComponent.id, { w: parseInt(e.target.value) })}
                     className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                   />
                   <div className="flex justify-between text-[10px] opacity-40">
                     <span>1/12</span>
                     <span>{selectedComponent.layout?.w || 12}/12</span>
                   </div>
                 </div>
              </div>

              {/* Prop Editors */}
              <div className="space-y-4">
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-40" style={{ color: 'var(--text-color)' }}>Properties</p>
                {selectedMetadata.props.map(prop => (
                  <div key={prop.name} className="space-y-1.5">
                    <label className="text-xs font-semibold opacity-70" style={{ color: 'var(--text-color)' }}>{prop.label}</label>
                    {prop.type === 'string' && (
                      <input 
                        type="text"
                        value={selectedComponent.props[prop.name] ?? prop.defaultValue}
                        onChange={(e) => updateComponentProps(selectedComponent.id, { [prop.name]: e.target.value })}
                        className="w-full rounded-xl border px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-blue-500/50"
                        style={{ background: 'var(--input-bg)', borderColor: 'var(--border-color)', color: 'var(--text-color)' }}
                      />
                    )}
                    {prop.type === 'number' && (
                      <input 
                        type="number"
                        value={selectedComponent.props[prop.name] ?? prop.defaultValue}
                        onChange={(e) => updateComponentProps(selectedComponent.id, { [prop.name]: parseFloat(e.target.value) })}
                        className="w-full rounded-xl border px-3 py-2 text-xs outline-none"
                        style={{ background: 'var(--input-bg)', borderColor: 'var(--border-color)', color: 'var(--text-color)' }}
                      />
                    )}
                    {prop.type === 'select' && (
                      <select
                        value={selectedComponent.props[prop.name] ?? prop.defaultValue}
                        onChange={(e) => updateComponentProps(selectedComponent.id, { [prop.name]: e.target.value })}
                        className="w-full rounded-xl border px-3 py-2 text-xs outline-none"
                        style={{ background: 'var(--input-bg)', borderColor: 'var(--border-color)', color: 'var(--text-color)' }}
                      >
                         {prop.options?.map(opt => (
                           <option key={opt.value} value={opt.value} style={{ background: 'var(--navbar-carousel-color)' }}>{opt.label}</option>
                         ))}
                      </select>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center opacity-40">
              <Settings2 className="h-8 w-8" />
              <p className="text-xs">Select a component on the canvas to edit its properties</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
