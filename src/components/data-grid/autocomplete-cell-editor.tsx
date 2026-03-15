'use client';

import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { ICellEditorParams } from 'ag-grid-community';

interface AutocompleteCellEditorProps extends ICellEditorParams {
  options: string[];
}

const AutocompleteCellEditor = forwardRef((props: AutocompleteCellEditorProps, ref) => {
  const [value, setValue] = useState(props.value || '');
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredOptions = props.options.filter((opt) =>
    opt.toLowerCase().includes(value.toLowerCase())
  );

  useImperativeHandle(ref, () => ({
    getValue: () => value,
    isPopup: () => true,
    afterGuiAttached: () => {
      inputRef.current?.focus();
      setIsOpen(true);
    },
  }));

  return (
    <div className="min-w-[200px] overflow-hidden rounded-lg border shadow-2xl"
      style={{ background: 'var(--navbar-carousel-color)', borderColor: 'var(--header-border)' }}>
      <input
        ref={inputRef}
        className="w-full border-b px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-blue-500/50"
        style={{
          background: 'var(--input-bg)',
          borderColor: 'var(--header-border)',
          color: 'var(--text-color)'
        }}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setIsOpen(true);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === 'Tab') {
            if (filteredOptions.length > 0 && isOpen) {
              const selected = filteredOptions[0];
              setValue(selected);
              setIsOpen(false);
              props.stopEditing();
            }
          }
        }}
        onBlur={() => {
          // Commit current value on blur
          setTimeout(() => {
            if (!isOpen) props.stopEditing();
          }, 200);
        }}
      />
      {isOpen && filteredOptions.length > 0 && (
        <div className="max-h-[200px] overflow-auto">
          {filteredOptions.map((opt) => (
            <div
              key={opt}
              className="cursor-pointer px-3 py-2 text-sm transition-colors hover:bg-blue-600/10"
              style={{ color: 'var(--text-color)' }}
              onClick={() => {
                setValue(opt);
                setIsOpen(false);
                props.stopEditing();
              }}
            >
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
