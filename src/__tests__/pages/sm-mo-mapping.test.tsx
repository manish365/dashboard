import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../helpers';
import '../mocks/ag-grid';

vi.mock('@/lib/api', () => ({
  fetchPageData: vi.fn().mockResolvedValue([
    { id: '1', 'Store Key': 'A476', 'Store Name': 'Madanapalle', 'SM1 EC': 12345, 'SM1 Name': 'Amit Kumar' },
  ]),
  savePageData: vi.fn().mockResolvedValue({ success: true, savedAt: new Date().toISOString(), rowCount: 1 }),
}));

import SMMOMappingPage from '@/app/data/sm-mo-mapping/page';

describe('SM MO Mapping Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the page title', () => {
    renderWithProviders(<SMMOMappingPage />);
    expect(screen.getByText('SM MO Mapping')).toBeInTheDocument();
  });

  it('renders SM and MO tabs', () => {
    renderWithProviders(<SMMOMappingPage />);
    expect(screen.getByText('SM')).toBeInTheDocument();
    expect(screen.getByText('MO')).toBeInTheDocument();
  });

  it('can switch to MO tab', async () => {
    renderWithProviders(<SMMOMappingPage />);
    const moTab = screen.getByText('MO');
    fireEvent.click(moTab);
    await waitFor(() => {
      expect(screen.getByTestId('ag-grid-mock')).toBeInTheDocument();
    });
  });

  it('renders the grid component', async () => {
    renderWithProviders(<SMMOMappingPage />);
    await waitFor(() => {
      expect(screen.getByTestId('ag-grid-mock')).toBeInTheDocument();
    });
  });
});
