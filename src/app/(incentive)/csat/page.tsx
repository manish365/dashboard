'use client';

import DataPageShell from '@/components/data-page/data-page-shell';
import { generateCSAT } from '@/data/mock-data';

export default function CSATPage() {
  return (
    <DataPageShell
      pageId="csat"
      title="CSAT"
      subtitle="Customer Satisfaction Scores"
      columnDefs={[
        { field: 'Store Code', headerName: 'Store Code', width: 140 },
        { field: 'CSAT', headerName: 'CSAT Score', width: 160, cellDataType: 'number',
          valueFormatter: (p: any) => p.value != null ? (p.value * 100).toFixed(2) + '%' : '' },
      ]}
      generateData={generateCSAT}
      defaultNewRow={{ 'Store Code': '', CSAT: 0 }}
      uploadExpectedColumns={['Store Code', 'CSAT']}
    />
  );
}
