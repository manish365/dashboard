import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../helpers';
import '../mocks/ag-grid';

vi.mock('@/lib/api', () => ({
  fetchPageData: vi.fn().mockResolvedValue([
    { id: '1', IncentiveType: 'Group_Main', GroupName: 'Kitchen Appliances', AchieveAmountPerQuantity: 50 },
  ]),
  savePageData: vi.fn().mockResolvedValue({ success: true, savedAt: new Date().toISOString(), rowCount: 1 }),
}));

import MainTemplatePage from '@/app/(incentive)/main-template/page';

describe('Main Template Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the page title', () => {
    renderWithProviders(<MainTemplatePage />);
    expect(screen.getByText('Main Template')).toBeInTheDocument();
  });

  it('displays no sub-tabs (single sheet page)', () => {
    renderWithProviders(<MainTemplatePage />);
    // Single page shouldn't have tab buttons — just the grid
    expect(screen.queryByText('SE Targets')).not.toBeInTheDocument();
  });

  it('renders the grid', async () => {
    renderWithProviders(<MainTemplatePage />);
    await waitFor(() => {
      expect(screen.getByTestId('ag-grid-mock')).toBeInTheDocument();
    });
  });

  it('displays expected column headers', async () => {
    renderWithProviders(<MainTemplatePage />);
    await waitFor(() => {
      const columnsEl = screen.getByTestId('ag-grid-columns');
      expect(columnsEl.textContent).toContain('Incentive Type');
      expect(columnsEl.textContent).toContain('Group');
      expect(columnsEl.textContent).toContain('Amount/Qty');
    });
  });
});
