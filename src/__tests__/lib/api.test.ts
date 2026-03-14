import { describe, it, expect, vi } from 'vitest';
import { fetchPageData, savePageData } from '@/lib/api';

describe('Mock API - fetchPageData', () => {
  it('should return an array of data', async () => {
    const data = await fetchPageData('csat', 3, 2026);
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
  });

  it('should return data with expected fields for CSAT', async () => {
    const data = await fetchPageData('csat', 3, 2026);
    const row = data[0];
    expect(row).toHaveProperty('Store Code');
    expect(row).toHaveProperty('CSAT');
    expect(row).toHaveProperty('id');
  });

  it('should return data for tabbed page (volume-budget SE targets)', async () => {
    const data = await fetchPageData('volume-budget', 3, 2026, 'se-targets');
    expect(data.length).toBeGreaterThan(0);
    expect(data[0]).toHaveProperty('Air Conditioners');
  });

  it('should return data for volume-budget DM details tab', async () => {
    const data = await fetchPageData('volume-budget', 3, 2026, 'dm-details');
    expect(data.length).toBeGreaterThan(0);
    expect(data[0]).toHaveProperty('DM EMP ID');
  });

  it('should return data for volume-budget mapped-output tab', async () => {
    const data = await fetchPageData('volume-budget', 3, 2026, 'mapped-output');
    expect(data.length).toBeGreaterThan(0);
    expect(data[0]).toHaveProperty('SM Employee ID');
  });

  it('should cache data for same key on subsequent calls', async () => {
    const first = await fetchPageData('vas-sku', 1, 2025);
    const second = await fetchPageData('vas-sku', 1, 2025);
    expect(first).toBe(second); // same reference
  });

  it('should throw for unknown pageId', async () => {
    await expect(fetchPageData('nonexistent', 1, 2025)).rejects.toThrow('No data generator');
  });
});

describe('Mock API - savePageData', () => {
  it('should return success response', async () => {
    const mockData = [{ id: '1', name: 'test' }];
    const result = await savePageData('csat', 3, 2026, mockData);
    expect(result.success).toBe(true);
    expect(result.rowCount).toBe(1);
    expect(result.savedAt).toBeTruthy();
  });

  it('should persist data in cache (subsequent fetch returns saved data)', async () => {
    const mockData = [{ id: 'save-test', 'Store Code': 'X999', CSAT: 0.99 }];
    await savePageData('csat', 12, 2099, mockData);
    const fetched = await fetchPageData('csat', 12, 2099);
    expect(fetched).toEqual(mockData);
  });

  it('should handle tabbed save', async () => {
    const mockData = [{ id: 't1', 'Store Code': 'T1' }];
    const result = await savePageData('volume-budget', 6, 2026, mockData, 'se-targets');
    expect(result.success).toBe(true);
    expect(result.rowCount).toBe(1);
  });
});
