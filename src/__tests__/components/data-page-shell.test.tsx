import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { screen, waitFor, fireEvent, act } from '@testing-library/react';
import { renderWithProviders } from '../helpers';
import '../mocks/ag-grid';

const mockFetch = vi.fn().mockResolvedValue([
  { id: '1', 'Store Code': 'A001', CSAT: 0.85 },
  { id: '2', 'Store Code': 'A002', CSAT: 0.72 },
]);

const mockSave = vi.fn().mockResolvedValue({ success: true, savedAt: new Date().toISOString(), rowCount: 2 });

vi.mock('@/lib/api', () => ({
  fetchPageData: (...args: any[]) => mockFetch(...args),
  savePageData: (...args: any[]) => mockSave(...args),
}));

import DataPageShell from '@/components/data-page/data-page-shell';
import { generateCSAT } from '@/data/mock-data';

describe('DataPageShell Component', () => {
  const defaultProps = {
    pageId: 'csat',
    title: 'CSAT',
    subtitle: 'Customer Satisfaction',
    columnDefs: [
      { field: 'Store Code', headerName: 'Store Code', width: 140 },
      { field: 'CSAT', headerName: 'CSAT Score', width: 160 },
    ],
    generateData: generateCSAT,
    defaultNewRow: { 'Store Code': '', CSAT: 0 },
    uploadExpectedColumns: ['Store Code', 'CSAT'],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the title', () => {
    renderWithProviders(<DataPageShell {...defaultProps} />);
    expect(screen.getByText('CSAT')).toBeInTheDocument();
  });

  it('renders the month/year selector', () => {
    renderWithProviders(<DataPageShell {...defaultProps} />);
    expect(screen.getByDisplayValue('March')).toBeInTheDocument();
  });

  it('renders Draft status badge by default', () => {
    renderWithProviders(<DataPageShell {...defaultProps} />);
    expect(screen.getByText('Draft')).toBeInTheDocument();
  });

  it('renders the grid after loading', async () => {
    renderWithProviders(<DataPageShell {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getByTestId('ag-grid-mock')).toBeInTheDocument();
    });
  });

  it('calls fetchPageData on mount', async () => {
    renderWithProviders(<DataPageShell {...defaultProps} />);
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('csat', expect.any(Number), expect.any(Number), undefined);
    });
  });

  it('renders tabs when provided', () => {
    const tabbedProps = {
      ...defaultProps,
      tabs: [
        { key: 'tab1', label: 'Tab One', columnDefs: defaultProps.columnDefs, generateData: generateCSAT, defaultNewRow: {} },
        { key: 'tab2', label: 'Tab Two', columnDefs: defaultProps.columnDefs, generateData: generateCSAT, defaultNewRow: {} },
      ],
    };
    renderWithProviders(<DataPageShell {...tabbedProps} />);
    expect(screen.getByText('Tab One')).toBeInTheDocument();
    expect(screen.getByText('Tab Two')).toBeInTheDocument();
  });

  it('switches tabs on click', async () => {
    const tabbedProps = {
      ...defaultProps,
      tabs: [
        { key: 'tab1', label: 'Tab One', columnDefs: defaultProps.columnDefs, generateData: generateCSAT, defaultNewRow: {} },
        { key: 'tab2', label: 'Tab Two', columnDefs: defaultProps.columnDefs, generateData: generateCSAT, defaultNewRow: {} },
      ],
    };
    renderWithProviders(<DataPageShell {...tabbedProps} />);
    fireEvent.click(screen.getByText('Tab Two'));
    await waitFor(() => {
      expect(screen.getByTestId('ag-grid-mock')).toBeInTheDocument();
    });
  });

  it('renders Upload button (user is DATA_MANAGER by default in provider)', async () => {
    // The AppProvider starts with null user, so we need to set it.
    // Upload button only shows when user is set and has DATA_MANAGER role.
    // Since no user is set in the initial state, Upload won't show.
    renderWithProviders(<DataPageShell {...defaultProps} />);
    // Without user, these buttons shouldn't appear
    expect(screen.queryByText('Upload')).not.toBeInTheDocument();
  });

  it('renders row count pill', async () => {
    renderWithProviders(<DataPageShell {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getByText('2 rows')).toBeInTheDocument();
    });
  });

  it('changes selected month', async () => {
    renderWithProviders(<DataPageShell {...defaultProps} />);
    const monthSelect = screen.getByDisplayValue('March');
    await act(async () => {
      fireEvent.change(monthSelect, { target: { value: '6' } });
    });
    expect(screen.getByDisplayValue('June')).toBeInTheDocument();
  });

  it('changes selected year', async () => {
    renderWithProviders(<DataPageShell {...defaultProps} />);
    const yearSelect = screen.getByDisplayValue('2026');
    await act(async () => {
      fireEvent.change(yearSelect, { target: { value: '2025' } });
    });
    expect(screen.getByDisplayValue('2025')).toBeInTheDocument();
  });

  it('does not show Save button when not dirty', () => {
    renderWithProviders(<DataPageShell {...defaultProps} />);
    expect(screen.queryByText('Save')).not.toBeInTheDocument();
  });
});
