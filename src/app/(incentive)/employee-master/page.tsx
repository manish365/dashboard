'use client';

import DataPageShell from '@/components/data-page/data-page-shell';
import { generateEmployeeMaster } from '@/data/mock-data';

export default function EmployeeMasterPage() {
  return (
    <DataPageShell
      pageId="employee-master"
      title="Employee Master"
      subtitle="Store Employee Directory"
      columnDefs={[
        { field: 'EmpId', headerName: 'Emp ID', width: 110 },
        { field: 'EmpName', headerName: 'Employee Name', width: 200 },
        { field: 'Store Code', headerName: 'Store Code', width: 120 },
        { field: 'Store Name', headerName: 'Store Name', width: 200 },
        { field: 'Designation', headerName: 'Designation', width: 180 },
        { field: 'Joining Date', headerName: 'Joining Date', width: 130 },
      ]}
      generateData={generateEmployeeMaster}
      defaultNewRow={{
        EmpId: '', EmpName: '', 'Store Code': '', 'Store Name': '', Designation: '', 'Joining Date': '',
      }}
      uploadExpectedColumns={['EmpId', 'EmpName', 'Store Code', 'Designation']}
    />
  );
}
