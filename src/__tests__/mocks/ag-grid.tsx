/**
 * Mock for ag-grid-react and ag-grid-community so tests don't crash in jsdom.
 */
import React from 'react';
import { vi } from 'vitest';

// Mock ag-grid-react
vi.mock('ag-grid-react', () => ({
  AgGridReact: React.forwardRef(function MockAgGrid(props: any, ref: any) {
    return (
      <div data-testid="ag-grid-mock" data-row-count={props.rowData?.length || 0}>
        <span data-testid="ag-grid-columns">
          {props.columnDefs?.map((c: any) => c.headerName || c.field).join(',')}
        </span>
      </div>
    );
  }),
}));

// Mock ag-grid-community
vi.mock('ag-grid-community', () => ({
  AllCommunityModule: {},
  ModuleRegistry: {
    registerModules: vi.fn(),
  },
}));
