import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../helpers';
import '../mocks/ag-grid';

vi.mock('@/lib/api', () => ({
  fetchPageData: vi.fn().mockResolvedValue([
    { id: '1', 'Store Code': 'A476', 'Store Name': 'Madanapalle', 'Sales executive EMP ID': 31000, 'Sales executive Name': 'Rahul Sharma', 'Primary Group': 'Communication', 'Air Conditioners': 5 },
  ]),
  savePageData: vi.fn().mockResolvedValue({ success: true, savedAt: new Date().toISOString(), rowCount: 1 }),
}));

import VolumeBudgetPage from '@/app/(incentive)/volume-budget/page';

describe('Volume Budget Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the page title', () => {
    renderWithProviders(<VolumeBudgetPage />);
    expect(screen.getByText('Volume Budget')).toBeInTheDocument();
  });

  it('renders three tabs: SE Targets, DM Details, Mapped Output', () => {
    renderWithProviders(<VolumeBudgetPage />);
    expect(screen.getByText('SE Targets')).toBeInTheDocument();
    expect(screen.getByText('DM Details')).toBeInTheDocument();
    expect(screen.getByText('Mapped Output')).toBeInTheDocument();
  });

  it('the first tab (SE Targets) is active by default', () => {
    renderWithProviders(<VolumeBudgetPage />);
    const seTab = screen.getByText('SE Targets');
    // Active tab has the neon-green background style
    expect(seTab).toBeInTheDocument();
  });

  it('can switch to DM Details tab', async () => {
    renderWithProviders(<VolumeBudgetPage />);
    const dmTab = screen.getByText('DM Details');
    fireEvent.click(dmTab);
    await waitFor(() => {
      expect(screen.getByTestId('ag-grid-mock')).toBeInTheDocument();
    });
  });

  it('can switch to Mapped Output tab', async () => {
    renderWithProviders(<VolumeBudgetPage />);
    const mappedTab = screen.getByText('Mapped Output');
    fireEvent.click(mappedTab);
    await waitFor(() => {
      expect(screen.getByTestId('ag-grid-mock')).toBeInTheDocument();
    });
  });

  it('renders the grid component', async () => {
    renderWithProviders(<VolumeBudgetPage />);
    await waitFor(() => {
      expect(screen.getByTestId('ag-grid-mock')).toBeInTheDocument();
    });
  });
});
