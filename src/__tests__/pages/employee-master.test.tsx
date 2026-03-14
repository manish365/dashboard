import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../helpers';
import '../mocks/ag-grid';

vi.mock('@/lib/api', () => ({
  fetchPageData: vi.fn().mockResolvedValue([
    { id: '1', EmpId: 12345, EmpName: 'Rahul Sharma', 'Store Code': 'A476', 'Store Name': 'Madanapalle', Designation: 'Sales Executive', 'Joining Date': '2022-01-15' },
  ]),
  savePageData: vi.fn().mockResolvedValue({ success: true, savedAt: new Date().toISOString(), rowCount: 1 }),
}));

import EmployeeMasterPage from '@/app/data/employee-master/page';

describe('Employee Master Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the page title', () => {
    renderWithProviders(<EmployeeMasterPage />);
    expect(screen.getByText('Employee Master')).toBeInTheDocument();
  });

  it('has no sub-tabs', () => {
    renderWithProviders(<EmployeeMasterPage />);
    expect(screen.queryByRole('tab')).not.toBeInTheDocument();
  });

  it('renders the grid', async () => {
    renderWithProviders(<EmployeeMasterPage />);
    await waitFor(() => {
      expect(screen.getByTestId('ag-grid-mock')).toBeInTheDocument();
    });
  });

  it('displays expected column headers', async () => {
    renderWithProviders(<EmployeeMasterPage />);
    await waitFor(() => {
      const columnsEl = screen.getByTestId('ag-grid-columns');
      expect(columnsEl.textContent).toContain('Emp ID');
      expect(columnsEl.textContent).toContain('Employee Name');
      expect(columnsEl.textContent).toContain('Designation');
    });
  });
});
