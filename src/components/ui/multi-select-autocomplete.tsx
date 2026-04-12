'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, Check, ChevronDown, Search } from 'lucide-react';

interface MultiSelectAutocompleteProps {
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  label?: string;
}

export default function MultiSelectAutocomplete({
  options,
  selected,
  onChange,
  placeholder = 'Select options...',
  label,
}: MultiSelectAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredOptions = options.filter(
    (opt) =>
      opt.toLowerCase().includes(query.toLowerCase()) && !selected.includes(opt)
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (opt: string) => {
    if (selected.includes(opt)) {
      onChange(selected.filter((s) => s !== opt));
    } else {
      onChange([...selected, opt]);
    }
    setQuery('');
  };

  const removeOption = (opt: string) => {
    onChange(selected.filter((s) => s !== opt));
  };

  return (
    <div className="flex flex-col gap-1.5" ref={containerRef}>
      {label && <label className="theme-text text-xs font-semibold opacity-70">{label}</label>}
      <div className="relative">
        <div
          className="flex min-h-[42px] flex-wrap gap-1.5 rounded-xl border p-2 transition-all focus-within:ring-2 focus-within:ring-[var(--hyperlink)]/20 theme-input-bg theme-border"
        >
          {selected.map((opt) => (
            <span
              key={opt}
              className="flex items-center gap-1 rounded-md theme-tag-info px-2 py-0.5 text-xs font-medium theme-text-info border theme-border"
            >
              {opt}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeOption(opt);
                }}
                className="rounded-full hover:bg-white/10"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          <input
            type="text"
            className="theme-text flex-1 bg-transparent text-sm outline-none placeholder:theme-text-subtle"
            placeholder={selected.length === 0 ? placeholder : ''}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
          />
          <ChevronDown className={`theme-text-muted h-4 w-4 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>

        {isOpen && (
          <div
            className="absolute left-0 right-0 top-full z-50 mt-1 max-h-[250px] overflow-auto rounded-xl border p-1 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200 theme-dropdown-bg"
          >
            {filteredOptions.length === 0 ? (
              <div className="theme-text-muted px-3 py-4 text-center text-sm">
                No options found
              </div>
            ) : (
              filteredOptions.map((opt) => (
                <div
                  key={opt}
                  className="flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors hover:bg-white/5 theme-text"
                  onClick={() => toggleOption(opt)}
                >
                  {opt}
                  {selected.includes(opt) && <Check className="h-4 w-4 theme-text-brand" />}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
