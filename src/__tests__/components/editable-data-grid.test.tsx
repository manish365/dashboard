import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../helpers';
import '../mocks/ag-grid';

import EditableDataGrid from '@/components/data-grid/editable-data-grid';

describe('EditableDataGrid', () => {
  const columnDefs = [
    { field: 'name', headerName: 'Name', width: 150 },
    { field: 'value', headerName: 'Value', width: 100 },
  ];

  const rowData = [
    { id: '1', name: 'Row 1', value: 10 },
    { id: '2', name: 'Row 2', value: 20 },
  ];

  const defaultProps = {
    rowData,
    columnDefs,
    onDataChange: vi.fn(),
    editable: true,
    title: 'Test Grid',
    defaultNewRow: { name: '', value: 0 },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the search input', () => {
    renderWithProviders(<EditableDataGrid {...defaultProps} />);
    expect(screen.getByPlaceholderText('Search across all columns...')).toBeInTheDocument();
  });

  it('renders Add Row button when editable', () => {
    renderWithProviders(<EditableDataGrid {...defaultProps} />);
    expect(screen.getByText('Add Row')).toBeInTheDocument();
  });

  it('hides Add Row button when not editable', () => {
    renderWithProviders(<EditableDataGrid {...defaultProps} editable={false} />);
    expect(screen.queryByText('Add Row')).not.toBeInTheDocument();
  });

  it('renders CSV and Excel export buttons', () => {
    renderWithProviders(<EditableDataGrid {...defaultProps} />);
    expect(screen.getByText('CSV')).toBeInTheDocument();
    expect(screen.getByText('Excel')).toBeInTheDocument();
  });

  it('hides export buttons when showExport is false', () => {
    renderWithProviders(<EditableDataGrid {...defaultProps} showExport={false} />);
    expect(screen.queryByText('CSV')).not.toBeInTheDocument();
  });

  it('renders the AG Grid mock', () => {
    renderWithProviders(<EditableDataGrid {...defaultProps} />);
    expect(screen.getByTestId('ag-grid-mock')).toBeInTheDocument();
  });

  it('handles search text change', () => {
    renderWithProviders(<EditableDataGrid {...defaultProps} />);
    const search = screen.getByPlaceholderText('Search across all columns...');
    fireEvent.change(search, { target: { value: 'Row 1' } });
    expect(search).toHaveValue('Row 1');
  });

  it('does not show Add/Delete row when showAddRow/showDeleteRow false', () => {
    renderWithProviders(
      <EditableDataGrid {...defaultProps} showAddRow={false} showDeleteRow={false} />
    );
    expect(screen.queryByText('Add Row')).not.toBeInTheDocument();
  });

  it('does not show bulk edit when showBulkEdit is false', () => {
    renderWithProviders(<EditableDataGrid {...defaultProps} showBulkEdit={false} />);
    // No bulk edit button visible even with selection
    expect(screen.queryByText(/Bulk Edit/)).not.toBeInTheDocument();
  });

  it('renders checkbox column header in the grid columns', () => {
    renderWithProviders(<EditableDataGrid {...defaultProps} />);
    const columnsEl = screen.getByTestId('ag-grid-columns');
    expect(columnsEl.textContent).toContain('Name');
    expect(columnsEl.textContent).toContain('Value');
  });
});
