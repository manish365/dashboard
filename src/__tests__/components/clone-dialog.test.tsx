import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../helpers';

import CloneDialog from '@/components/clone/clone-dialog';

describe('CloneDialog', () => {
  const defaultProps = {
    currentMonth: 3,
    currentYear: 2026,
    onClone: vi.fn(),
    onClose: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the dialog with title', () => {
    renderWithProviders(<CloneDialog {...defaultProps} />);
    // Use getAllByText and find the header one, or just check it exists
    expect(screen.getAllByText('Clone Data')[0]).toBeInTheDocument();
    expect(screen.getByText('Copy data from a previous month')).toBeInTheDocument();
  });

  it('renders source month and year selectors', () => {
    renderWithProviders(<CloneDialog {...defaultProps} />);
    // Default source: previous month (February when current is March)
    expect(screen.getByDisplayValue('February')).toBeInTheDocument();
  });

  it('renders target info display', () => {
    renderWithProviders(<CloneDialog {...defaultProps} />);
    expect(screen.getByText(/Data will be cloned into:/)).toBeInTheDocument();
    expect(screen.getByText(/March 2026/)).toBeInTheDocument();
  });

  it('calls onClose when Cancel clicked', () => {
    renderWithProviders(<CloneDialog {...defaultProps} />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when X button clicked', () => {
    renderWithProviders(<CloneDialog {...defaultProps} />);
    // X button is the one with an SVG icon in the header
    const xButtons = screen.getAllByRole('button');
    const closeBtn = xButtons.find((btn) => btn.querySelector('.lucide-x'));
    if (closeBtn) fireEvent.click(closeBtn);
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('calls onClone with selected month/year when Clone Data clicked', () => {
    renderWithProviders(<CloneDialog {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: 'Clone Data' }));
    expect(defaultProps.onClone).toHaveBeenCalledWith(2, 2026); // Feb 2026
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('allows changing source month', () => {
    renderWithProviders(<CloneDialog {...defaultProps} />);
    const monthSelect = screen.getByDisplayValue('February');
    fireEvent.change(monthSelect, { target: { value: '6' } });
    fireEvent.click(screen.getByRole('button', { name: 'Clone Data' }));
    expect(defaultProps.onClone).toHaveBeenCalledWith(6, 2026);
  });

  it('handles January current month (wraps to Dec of prev year)', () => {
    const janProps = { ...defaultProps, currentMonth: 1, currentYear: 2026 };
    renderWithProviders(<CloneDialog {...janProps} />);
    expect(screen.getByDisplayValue('December')).toBeInTheDocument();
  });
});
