'use client';

import React from 'react';
import EditableDataGrid from '@/components/data-grid/editable-data-grid';
import { STORES } from '@/data/reference-data';

export default function StoresPage() {
  const columnDefs = [
    { field: 'code', headerName: 'Store Code', width: 120 },
    { field: 'name', headerName: 'Store Name', width: 250 },
    { field: 'city', headerName: 'City', width: 150 },
    { field: 'region', headerName: 'Region', width: 150 },
  ];

  const rowData = STORES.map((s, idx) => ({ id: `store-${idx}`, ...s }));

  return (
    <div className="flex h-full flex-col p-6">
      <div className="mb-6 flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-white">Stores</h1>
        <p className="text-sm text-slate-400">Master list of Croma store locations</p>
      </div>
      <div className="flex-1 overflow-hidden">
        <EditableDataGrid
          rowData={rowData}
          columnDefs={columnDefs}
          onDataChange={() => {}}
          editable={false}
          showAddRow={false}
          showDeleteRow={false}
          title="Store Master"
        />
      </div>
    </div>
  );
}
