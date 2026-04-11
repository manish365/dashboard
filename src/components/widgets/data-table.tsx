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
    <div className="theme-border rounded-2xl border overflow-hidden">
      <div className="theme-panel theme-border px-5 py-4 border-b">
        <h3 className="theme-text text-sm font-bold">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead className="theme-table-header">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className="theme-text px-5 py-3 font-bold uppercase tracking-wider opacity-70">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="theme-table-body">
            {data.map((row, i) => (
              <tr key={i} className="theme-border border-t hover:bg-slate-500/5 transition-colors">
                {columns.map((col) => (
                  <td key={col.key} className="theme-text px-5 py-3 font-medium">
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
