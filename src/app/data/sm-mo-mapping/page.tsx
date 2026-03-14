'use client';

import DataPageShell from '@/components/data-page/data-page-shell';
import { generateSMMOMapping_SM, generateSMMOMapping_MO } from '@/data/mock-data';

export default function SMMOMappingPage() {
  return (
    <DataPageShell
      pageId="sm-mo-mapping"
      title="SM MO Mapping"
      subtitle="Store Manager & MO Mapping"
      columnDefs={[]}
      generateData={generateSMMOMapping_SM}
      uploadExpectedColumns={['Store Key', 'Store Name', 'SM1 EC', 'SM1 Name']}
      tabs={[
        {
          key: 'sm',
          label: 'SM',
          columnDefs: [
            { field: 'Store Key', headerName: 'Store Key', width: 120 },
            { field: 'Store Name', headerName: 'Store Name', width: 250 },
            { field: 'SM1 EC', headerName: 'SM1 EC', width: 120, cellDataType: 'number' },
            { field: 'SM1 Name', headerName: 'SM1 Name', width: 200 },
          ],
          generateData: generateSMMOMapping_SM,
          defaultNewRow: { 'Store Key': '', 'Store Name': '', 'SM1 EC': '', 'SM1 Name': '' },
        },
        {
          key: 'mo',
          label: 'MO',
          columnDefs: [
            { field: 'Store Key', headerName: 'Store Key', width: 120 },
            { field: 'Store Name', headerName: 'Store Name', width: 250 },
            { field: 'MO EC', headerName: 'MO EC', width: 120, cellDataType: 'number' },
            { field: 'MO Name', headerName: 'MO Name', width: 200 },
          ],
          generateData: generateSMMOMapping_MO,
          defaultNewRow: { 'Store Key': '', 'Store Name': '', 'MO EC': '', 'MO Name': '' },
        },
      ]}
    />
  );
}
