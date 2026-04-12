'use client';

import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { ICellEditorParams } from 'ag-grid-community';

interface AutocompleteCellEditorProps extends ICellEditorParams { options: string[]; }

const AutocompleteCellEditor = forwardRef((props: AutocompleteCellEditorProps, ref) => {
  const [value, setValue] = useState(props.value || '');
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredOptions = props.options.filter(opt => opt.toLowerCase().includes(value.toLowerCase()));

  useImperativeHandle(ref, () => ({
    getValue: () => value,
    isPopup: () => true,
    afterGuiAttached: () => { inputRef.current?.focus(); setIsOpen(true); },
  }));

  return (
    <div className="theme-dropdown-bg min-w-[200px] overflow-hidden rounded-lg border theme-border shadow-2xl">
      <input ref={inputRef}
        className="theme-input theme-border-header w-full border-b px-3 py-1.5 text-sm outline-none focus:theme-border-brand"
        value={value}
        onChange={(e) => { setValue(e.target.value); setIsOpen(true); }}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === 'Tab') && filteredOptions.length > 0 && isOpen) {
            setValue(filteredOptions[0]); setIsOpen(false); props.stopEditing();
          }
        }}
        onBlur={() => { setTimeout(() => { if (!isOpen) props.stopEditing(); }, 200); }}
      />
      {isOpen && filteredOptions.length > 0 && (
        <div className="max-h-[200px] overflow-auto">
          {filteredOptions.map(opt => (
            <div key={opt}
              className="theme-text cursor-pointer px-3 py-2 text-sm transition-colors hover:bg-white/10"
              onClick={() => { setValue(opt); setIsOpen(false); props.stopEditing(); }}>
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

AutocompleteCellEditor.displayName = 'AutocompleteCellEditor';
export default AutocompleteCellEditor;
