'use client';

import React from 'react';
import EditableDataGrid from '@/components/data-grid/editable-data-grid';
import { EMPLOYEES, STORES } from '@/data/reference-data';

export default function EmployeesPage() {
  const columnDefs = [
    { field: 'id', headerName: 'Emp ID', width: 120 },
    { field: 'name', headerName: 'Employee Name', width: 200 },
    { field: 'role', headerName: 'Designation', width: 180 },
    { field: 'storeName', headerName: 'Assigned Store', width: 250 },
  ];

  const rowData = EMPLOYEES.map((e) => {
    const store = STORES.find((s) => s.code === e.store);
    return {
      ...e,
      storeName: store ? `${store.name} (${store.code})` : e.store,
    };
  });

  return (
    <div className="flex h-full flex-col p-6">
      <div className="mb-6 flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-white">Employee Directory</h1>
        <p className="text-sm text-slate-400">Store personnel and their assignments</p>
      </div>
      <div className="flex-1 overflow-hidden">
        <EditableDataGrid
          rowData={rowData}
          columnDefs={columnDefs}
          onDataChange={() => {}}
          editable={false}
          showAddRow={false}
          showDeleteRow={false}
          title="Reference Personnel"
        />
      </div>
    </div>
  );
}
