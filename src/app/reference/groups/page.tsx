'use client';

import React from 'react';
import EditableDataGrid from '@/components/data-grid/editable-data-grid';
import { GROUPS } from '@/data/reference-data';

export default function GroupsPage() {
  const columnDefs = [
    { field: 'group', headerName: 'Group Name', width: 200, rowGroup: true, hide: true },
    { field: 'category', headerName: 'Category Name', width: 250 },
  ];

  const rowData: any[] = [];
  GROUPS.forEach((g, gIdx) => {
    g.categories.forEach((c, cIdx) => {
      rowData.push({ id: `item-${gIdx}-${cIdx}`, group: g.name, category: c });
    });
  });

  return (
    <div className="flex h-full flex-col p-6">
      <div className="mb-6 flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-white">Groups & Categories</h1>
        <p className="text-sm text-slate-400">Master hierarchy for product classification</p>
      </div>
      <div className="flex-1 overflow-hidden">
        <EditableDataGrid
          rowData={rowData}
          columnDefs={columnDefs}
          onDataChange={() => {}}
          editable={false}
          showAddRow={false}
          showDeleteRow={false}
          title="Categorization Hierarchy"
        />
      </div>
    </div>
  );
}
