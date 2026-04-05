'use client';

import React from 'react';

interface DataTableProps {
  title: string;
  columns: { key: string; label: string }[];
  data: any[];
}

export default function DataTable({
  title = 'Recent Activity',
  columns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Name' },
    { key: 'status', label: 'Status' },
  ],
  data = [
    { id: '1', name: 'Dashboard A', status: 'Published' },
    { id: '2', name: 'Dashboard B', status: 'Draft' },
  ],
}: DataTableProps) {
  return (
    <div className="rounded-2xl border overflow-hidden" style={{ borderColor: 'var(--border-color)' }}>
      <div className="px-5 py-4 border-b" style={{ background: 'var(--navbar-carousel-color)', borderColor: 'var(--border-color)' }}>
        <h3 className="text-sm font-bold" style={{ color: 'var(--text-color)' }}>{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead style={{ background: 'var(--toolbar-bg)' }}>
            <tr>
              {columns.map((col) => (
                <th key={col.key} className="px-5 py-3 font-bold uppercase tracking-wider opacity-70" style={{ color: 'var(--text-color)' }}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody style={{ background: 'var(--croma-wall)' }}>
            {data.map((row, i) => (
              <tr key={i} className="border-t hover:bg-slate-500/5 transition-colors" style={{ borderColor: 'var(--border-color)' }}>
                {columns.map((col) => (
                  <td key={col.key} className="px-5 py-3 font-medium" style={{ color: 'var(--text-color)' }}>
                    {row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
