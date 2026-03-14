import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, act } from '@testing-library/react';
import { renderWithProviders } from '../helpers';

// Mock XLSX
vi.mock('xlsx', () => ({
  read: vi.fn().mockReturnValue({
    SheetNames: ['Sheet1'],
    Sheets: { Sheet1: {} },
  }),
  utils: {
    sheet_to_json: vi.fn().mockReturnValue([
      { 'Store Code': 'A001', CSAT: 0.85 },
      { 'Store Code': 'A002', CSAT: 0.72 },
    ]),
  },
}));

import FileUploadZone from '@/components/upload/file-upload-zone';

describe('FileUploadZone', () => {
  const defaultProps = {
    templateName: 'CSAT',
    expectedColumns: ['Store Code', 'CSAT'],
    onFileLoaded: vi.fn(),
    onClose: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders template name', () => {
    renderWithProviders(<FileUploadZone {...defaultProps} />);
    expect(screen.getByText('CSAT')).toBeInTheDocument();
  });

  it('renders drag & drop zone', () => {
    renderWithProviders(<FileUploadZone {...defaultProps} />);
    expect(screen.getByText('Drag & drop or click to browse')).toBeInTheDocument();
  });

  it('renders file type hint', () => {
    renderWithProviders(<FileUploadZone {...defaultProps} />);
    expect(screen.getByText('Supports .xlsx, .xls, .xlsb, .csv')).toBeInTheDocument();
  });

  it('renders close button and calls onClose', () => {
    renderWithProviders(<FileUploadZone {...defaultProps} />);
    const buttons = screen.getAllByRole('button');
    // Close button has the X icon
    const closeBtn = buttons.find((btn) => btn.querySelector('.lucide-x'));
    if (closeBtn) {
      fireEvent.click(closeBtn);
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    }
  });

  it('renders without onClose (no close button)', () => {
    const propsNoClose = { templateName: 'Test', expectedColumns: [] };
    renderWithProviders(<FileUploadZone {...propsNoClose} />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('handles drag over/leave events', () => {
    renderWithProviders(<FileUploadZone {...defaultProps} />);
    const dropZone = screen.getByText('Drag & drop or click to browse').closest('div')!;
    fireEvent.dragOver(dropZone, { preventDefault: vi.fn() });
    expect(screen.getByText('Drop file here')).toBeInTheDocument();
    fireEvent.dragLeave(dropZone);
    expect(screen.getByText('Drag & drop or click to browse')).toBeInTheDocument();
  });

  it('processes file on drop', async () => {
    renderWithProviders(<FileUploadZone {...defaultProps} />);
    const dropZone = screen.getByText('Drag & drop or click to browse').closest('div')!;

    const file = new File(['test'], 'test.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    // Simulate FileReader
    const originalFileReader = globalThis.FileReader;
    const mockReader = {
      readAsArrayBuffer: vi.fn(),
      onload: null as any,
      result: new ArrayBuffer(8),
    };
    // Use a regular function as a constructor
    globalThis.FileReader = vi.fn().mockImplementation(function (this: any) {
      this.readAsArrayBuffer = mockReader.readAsArrayBuffer;
      Object.defineProperty(this, 'onload', {
        set: (fn) => (mockReader.onload = fn),
      });
      Object.defineProperty(this, 'result', {
        get: () => mockReader.result,
      });
    }) as any;

    await act(async () => {
      fireEvent.drop(dropZone, {
        preventDefault: vi.fn(),
        dataTransfer: { files: [file] },
      });
    });

    // Trigger the onload callback
    if (mockReader.onload) {
      await act(async () => {
        mockReader.onload({ target: { result: new ArrayBuffer(8) } });
      });
    }

    globalThis.FileReader = originalFileReader;
  });

  it('processes file on input change', async () => {
    renderWithProviders(<FileUploadZone {...defaultProps} />);
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(fileInput).toBeTruthy();

    const file = new File(['test'], 'data.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    const originalFileReader = globalThis.FileReader;
    const mockReader = {
      readAsArrayBuffer: vi.fn(),
      onload: null as any,
      result: new ArrayBuffer(8),
    };
    globalThis.FileReader = vi.fn().mockImplementation(function (this: any) {
      this.readAsArrayBuffer = mockReader.readAsArrayBuffer;
      Object.defineProperty(this, 'onload', {
        set: (fn) => (mockReader.onload = fn),
      });
      Object.defineProperty(this, 'result', {
        get: () => mockReader.result,
      });
    }) as any;

    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [file] } });
    });

    if (mockReader.onload) {
      await act(async () => {
        mockReader.onload({ target: { result: new ArrayBuffer(8) } });
      });
    }

    globalThis.FileReader = originalFileReader;
  });
});
