'use client';

import DataPageShell from '@/components/data-page/data-page-shell';
import { generateVolumeBudgetSE, generateVolumeBudgetDM, generateVolumeBudgetMapped } from '@/data/mock-data';

export default function VolumeBudgetPage() {
  return (
    <DataPageShell
      pageId="volume-budget"
      title="Volume Budget"
      subtitle="SE Targets, DM Details & Mapped Output"
      columnDefs={[]} // Will be overridden by tabs
      generateData={generateVolumeBudgetSE}
      uploadExpectedColumns={['Store Code', 'Store Name', 'Sales executive EMP ID', 'Sales executive Name', 'Primary Group']}
      tabs={[
        {
          key: 'se-targets',
          label: 'SE Targets',
          columnDefs: [
            { field: 'Store Code', headerName: 'Store Code', width: 110, pinned: 'left' },
            { field: 'Store Name', headerName: 'Store Name', width: 180 },
            { field: 'Sales executive EMP ID', headerName: 'SE EMP ID', width: 120 },
            { field: 'Sales executive Name', headerName: 'SE Name', width: 160 },
            { field: 'Primary Group', headerName: 'Primary Group', width: 220 },
            { field: 'Air Conditioners', headerName: 'AC', width: 80, cellDataType: 'number' },
            { field: 'Washing Machines', headerName: 'WM', width: 80, cellDataType: 'number' },
            { field: 'Refrigerators', headerName: 'Ref', width: 80, cellDataType: 'number' },
            { field: 'iPhones', headerName: 'iPhone', width: 80, cellDataType: 'number' },
            { field: 'Smart Phones (OS Based)', headerName: 'SmartPh', width: 100, cellDataType: 'number' },
            { field: 'Macbook', headerName: 'Mac', width: 80, cellDataType: 'number' },
            { field: 'Windows PC', headerName: 'WinPC', width: 80, cellDataType: 'number' },
            { field: 'TV LCD', headerName: 'TV', width: 80, cellDataType: 'number' },
          ],
          generateData: generateVolumeBudgetSE,
          defaultNewRow: { 'Store Code': '', 'Store Name': '', 'Sales executive EMP ID': '', 'Sales executive Name': '', 'Primary Group': '',
            'Air Conditioners': 0, 'Washing Machines': 0, 'Refrigerators': 0, 'iPhones': 0, 'Smart Phones (OS Based)': 0, 'Macbook': 0, 'Windows PC': 0, 'TV LCD': 0 },
        },
        {
          key: 'dm-details',
          label: 'DM Details',
          columnDefs: [
            { field: 'Store Code', headerName: 'Store Code', width: 120 },
            { field: 'Store Name', headerName: 'Store Name', width: 200 },
            { field: 'Group', headerName: 'Group', width: 250 },
            { field: 'DM EMP ID', headerName: 'DM EMP ID', width: 130 },
            { field: 'DM Name', headerName: 'DM Name', width: 180 },
          ],
          generateData: generateVolumeBudgetDM,
          defaultNewRow: { 'Store Code': '', 'Store Name': '', Group: '', 'DM EMP ID': '', 'DM Name': '' },
        },
        {
          key: 'mapped-output',
          label: 'Mapped Output',
          columnDefs: [
            { field: 'Store Code', headerName: 'Store Code', width: 110, pinned: 'left' },
            { field: 'Store Name', headerName: 'Store Name', width: 180 },
            { field: 'Sales executive EMP ID', headerName: 'SE EMP ID', width: 110 },
            { field: 'Sales executive Name', headerName: 'SE Name', width: 160 },
            { field: 'Primary Group', headerName: 'Primary Group', width: 220 },
            { field: 'DM EMP ID', headerName: 'DM EMP ID', width: 110 },
            { field: 'DM Name', headerName: 'DM Name', width: 150 },
            { field: 'SM Employee ID', headerName: 'SM EMP ID', width: 110 },
            { field: 'SM Employee Name', headerName: 'SM Name', width: 150 },
            { field: 'Primary Flag', headerName: 'Primary', width: 90 },
            { field: 'GroupDesc', headerName: 'Group', width: 220 },
            { field: 'Category', headerName: 'Category', width: 150 },
            { field: 'Brand', headerName: 'Brand', width: 120 },
            { field: 'Target Qty', headerName: 'Target Qty', width: 100, cellDataType: 'number' },
            { field: 'Error Msg', headerName: 'Error', width: 200 },
          ],
          generateData: generateVolumeBudgetMapped,
          defaultNewRow: {
            'Store Code': '', 'Store Name': '', 'Sales executive EMP ID': '', 'Sales executive Name': '',
            'Primary Group': '', 'DM EMP ID': '', 'DM Name': '', 'SM Employee ID': '', 'SM Employee Name': '',
            'Primary Flag': 'N', GroupDesc: '', Category: '', Brand: 'All', 'Target Qty': 0, 'Error Msg': '',
          },
        },
      ]}
    />
  );
}

