import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../helpers';
import '../mocks/ag-grid';

vi.mock('@/lib/api', () => ({
  fetchPageData: vi.fn().mockResolvedValue([
    { id: '1', SKU: 190123, Service_Classification: 'InWarranty', Categ: 'TV', Year: '1 Year', Brand: 'OSG EW Desc' },
  ]),
  savePageData: vi.fn().mockResolvedValue({ success: true, savedAt: new Date().toISOString(), rowCount: 1 }),
}));

import VASSKUPage from '@/app/(incentive)/vas-sku/page';

describe('VAS SKU Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the page title', () => {
    renderWithProviders(<VASSKUPage />);
    expect(screen.getByText('VAS SKU')).toBeInTheDocument();
  });

  it('has no sub-tabs', () => {
    renderWithProviders(<VASSKUPage />);
    expect(screen.queryByText('SM')).not.toBeInTheDocument();
    expect(screen.queryByText('MO')).not.toBeInTheDocument();
  });

  it('renders the grid', async () => {
    renderWithProviders(<VASSKUPage />);
    await waitFor(() => {
      expect(screen.getByTestId('ag-grid-mock')).toBeInTheDocument();
    });
  });

  it('displays expected column headers', async () => {
    renderWithProviders(<VASSKUPage />);
    await waitFor(() => {
      const columnsEl = screen.getByTestId('ag-grid-columns');
      expect(columnsEl.textContent).toContain('SKU');
      expect(columnsEl.textContent).toContain('Classification');
      expect(columnsEl.textContent).toContain('Category');
    });
  });
});
