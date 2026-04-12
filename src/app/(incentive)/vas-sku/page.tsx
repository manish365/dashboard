'use client';

import DataPageShell from '@/components/data-page/data-page-shell';
import { generateVASSKU } from '@/data/mock-data';

export default function VASSKUPage() {
  return (
    <DataPageShell
      pageId="vas-sku"
      title="VAS SKU"
      subtitle="Value Added Services — SKU Incentive List"
      columnDefs={[
        { field: 'SKU', headerName: 'SKU', width: 110 },
        { field: 'Service_Classification', headerName: 'Classification', width: 150 },
        { field: 'Service_Product_Classification', headerName: 'Product Type', width: 170 },
        { field: 'Eligible_For_Incentive_Payout', headerName: 'Eligible', width: 100 },
        { field: 'Special Addition', headerName: 'Special', width: 90 },
        { field: 'Categ', headerName: 'Category', width: 140 },
        { field: 'Year', headerName: 'Year', width: 90 },
        { field: 'Brand', headerName: 'Brand / Description', width: 280 },
      ]}
      generateData={generateVASSKU}
      defaultNewRow={{
        SKU: '', Service_Classification: '', Service_Product_Classification: '',
        Eligible_For_Incentive_Payout: 'Y', 'Special Addition': 'N',
        Categ: '', Year: '1 Year', Brand: '',
      }}
      uploadExpectedColumns={['SKU', 'Service_Classification', 'Service_Product_Classification', 'Categ']}
    />
  );
}
