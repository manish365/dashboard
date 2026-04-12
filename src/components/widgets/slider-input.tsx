'use client';

import React, { useState } from 'react';

interface SliderInputProps {
  label: string; min: number; max: number; step: number; defaultValue: number;
}

export default function SliderInput({
  label = 'Adjust Value', min = 0, max = 100, step = 1, defaultValue = 50,
}: SliderInputProps) {
  const [value, setValue] = useState(defaultValue);

  return (
    <div className="theme-card-bg flex flex-col gap-3 rounded-2xl border p-5">
      <div className="flex items-center justify-between">
        <label className="theme-text text-sm font-bold">{label}</label>
        <span className="theme-tag-info px-2.5 py-1 text-xs font-bold">{value}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => setValue(parseInt(e.target.value))}
        className="h-2 w-full appearance-none rounded-full theme-footer-bg accent-[var(--neon-green)] outline-none" />
      <div className="theme-text flex justify-between text-xs font-medium opacity-50">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}
