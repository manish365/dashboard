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
    <div className="min-w-[200px] rounded-lg border border-white/10 bg-[#1e293b] p-1 shadow-2xl">
      <input
        ref={inputRef}
        className="w-full rounded-md bg-white/5 border border-white/10 px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setIsOpen(true);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === 'Tab') {
            if (filteredOptions.length > 0 && isOpen) {
              setValue(filteredOptions[0]);
              setIsOpen(false);
            }
          }
        }}
      />
      {isOpen && filteredOptions.length > 0 && (
        <div className="mt-1 max-h-[200px] overflow-auto rounded-md border border-white/5 bg-[#0f172a]">
          {filteredOptions.map((opt) => (
            <div
              key={opt}
              className="cursor-pointer px-3 py-2 text-sm text-slate-300 hover:bg-blue-600 hover:text-white"
              onClick={() => {
                setValue(opt);
                setIsOpen(false);
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
