import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../helpers';
import '../mocks/ag-grid';

// Mock the API layer
vi.mock('@/lib/api', () => ({
  fetchPageData: vi.fn().mockResolvedValue([
    { id: '1', 'Store Code': 'A001', CSAT: 0.85 },
    { id: '2', 'Store Code': 'A002', CSAT: 0.72 },
  ]),
  savePageData: vi.fn().mockResolvedValue({ success: true, savedAt: new Date().toISOString(), rowCount: 2 }),
}));

// Must import after mocks
import CSATPage from '@/app/data/csat/page';

describe('CSAT Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the page title', async () => {
    renderWithProviders(<CSATPage />);
    expect(screen.getByText('CSAT')).toBeInTheDocument();
  });

  it('renders the grid component', async () => {
    renderWithProviders(<CSATPage />);
    await waitFor(() => {
      expect(screen.getByTestId('ag-grid-mock')).toBeInTheDocument();
    });
  });

  it('displays the correct column headers', async () => {
    renderWithProviders(<CSATPage />);
    await waitFor(() => {
      const columnsEl = screen.getByTestId('ag-grid-columns');
      expect(columnsEl.textContent).toContain('Store Code');
      expect(columnsEl.textContent).toContain('CSAT Score');
    });
  });
});
