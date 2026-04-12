'use client';

import DataPageShell from '@/components/data-page/data-page-shell';
import AutocompleteCellEditor from '@/components/data-grid/autocomplete-cell-editor';
import { generateMainTemplate } from '@/data/mock-data';
import { GROUPS, BRANDS, CLASSES, JOB_ROLES, INCENTIVE_TYPES } from '@/data/reference-data';

export default function MainTemplatePage() {
  const allCategories = GROUPS.flatMap((g) => g.categories);
  const groupNames = GROUPS.map((g) => g.name);

  return (
    <DataPageShell
      pageId="main-template"
      title="Main Template"
      subtitle="Incentive Buckets — Transformed Data"
      columnDefs={[
        {
          field: 'IncentiveType',
          headerName: 'Incentive Type',
          width: 150,
          cellEditor: AutocompleteCellEditor,
          cellEditorParams: { options: INCENTIVE_TYPES },
        },
        {
          field: 'GroupName',
          headerName: 'Group',
          width: 180,
          cellEditor: AutocompleteCellEditor,
          cellEditorParams: { options: groupNames },
          pinned: 'left',
        },
        {
          field: 'CategoryDescription_IncentiveBucket',
          headerName: 'Category / Bucket',
          width: 250,
          cellEditor: AutocompleteCellEditor,
          cellEditorParams: { options: allCategories },
        },
        {
          field: 'Inclusion_CategoryName',
          headerName: 'Incl. Category',
          width: 140,
          cellEditor: AutocompleteCellEditor,
          cellEditorParams: { options: ['ALL', ...allCategories] },
        },
        {
          field: 'Exclusion_CategoryName',
          headerName: 'Excl. Category',
          width: 140,
          cellEditor: AutocompleteCellEditor,
          cellEditorParams: { options: ['NA', ...allCategories] },
        },
        {
          field: 'Inclusion_ClassName',
          headerName: 'Incl. Class',
          width: 220,
          cellEditor: AutocompleteCellEditor,
          cellEditorParams: { options: CLASSES },
        },
        {
          field: 'Exclusion_ClassName',
          headerName: 'Excl. Class',
          width: 140,
          cellEditor: AutocompleteCellEditor,
          cellEditorParams: { options: ['NA', ...CLASSES] },
        },
        {
          field: 'Inclusion_BrandName',
          headerName: 'Incl. Brand',
          width: 120,
          cellEditor: AutocompleteCellEditor,
          cellEditorParams: { options: ['ALL', ...BRANDS] },
        },
        {
          field: 'Exclusion_BrandName',
          headerName: 'Excl. Brand',
          width: 120,
          cellEditor: AutocompleteCellEditor,
          cellEditorParams: { options: ['NA', ...BRANDS] },
        },
        {
          field: 'JobRole',
          headerName: 'Role',
          width: 120,
          cellEditor: AutocompleteCellEditor,
          cellEditorParams: { options: JOB_ROLES },
        },
        { field: 'AchieveAmountPerQuantity', headerName: 'Amount/Qty', width: 120, cellDataType: 'number' },
      ]}
      generateData={generateMainTemplate}
      defaultNewRow={{
        IncentiveType: '',
        GroupName: '',
        CategoryDescription_IncentiveBucket: '',
        Inclusion_CategoryName: 'ALL',
        Exclusion_CategoryName: 'NA',
        Inclusion_ClassName: '',
        Exclusion_ClassName: 'NA',
        Inclusion_BrandName: 'ALL',
        Exclusion_BrandName: 'NA',
        JobRole: 'Sales Executive',
        AchieveAmountPerQuantity: 0,
      }}
      uploadExpectedColumns={['IncentiveType', 'GroupName', 'CategoryDescription_IncentiveBucket', 'JobRole', 'AchieveAmountPerQuantity']}
    />
  );
}
