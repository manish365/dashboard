import { describe, it, expect } from 'vitest';
import { reducer, initialState, AppState } from '@/stores/app-store';
import { UserRole, MOCK_USER } from '@/lib/roles';

describe('AppStore reducer', () => {
  it('has correct initial state', () => {
    // initialState is exported from the store
    expect(initialState.user).toBeNull();
    expect(initialState.isAuthenticated).toBe(false);
    expect(initialState.sidebarOpen).toBe(true);
    expect(initialState.datasets).toEqual({});
    expect(initialState.datasetMeta).toEqual({});
    expect(initialState.uploadedFiles).toEqual([]);
  });

  it('SET_USER sets user', () => {
    const newState = reducer(initialState, { type: 'SET_USER', payload: MOCK_USER });
    expect(newState.user).toEqual(MOCK_USER);
  });

  it('SET_USER with null clears user', () => {
    const stateWithUser = { ...initialState, user: MOCK_USER };
    const newState = reducer(stateWithUser, { type: 'SET_USER', payload: null });
    expect(newState.user).toBeNull();
  });

  it('SET_AUTHENTICATED sets isAuthenticated', () => {
    const newState = reducer(initialState, { type: 'SET_AUTHENTICATED', payload: true });
    expect(newState.isAuthenticated).toBe(true);
  });

  it('SET_MONTH sets selectedMonth', () => {
    const newState = reducer(initialState, { type: 'SET_MONTH', payload: 6 });
    expect(newState.selectedMonth).toBe(6);
  });

  it('SET_YEAR sets selectedYear', () => {
    const newState = reducer(initialState, { type: 'SET_YEAR', payload: 2025 });
    expect(newState.selectedYear).toBe(2025);
  });

  it('SET_DATASET stores dataset', () => {
    const data = [{ id: '1', name: 'test' }];
    const newState = reducer(initialState, { type: 'SET_DATASET', payload: { key: 'test_1_2026', data } });
    expect(newState.datasets['test_1_2026']).toEqual(data);
  });

  it('SET_DATASET_META stores metadata', () => {
    const meta = {
      id: '123',
      tableName: 'csat' as const,
      month: 3,
      year: 2026,
      status: 'Draft' as const,
      rowCount: 10,
    };
    const newState = reducer(initialState, { type: 'SET_DATASET_META', payload: { key: 'csat_3_2026', meta } });
    expect(newState.datasetMeta['csat_3_2026']).toEqual(meta);
  });

  it('ADD_UPLOADED_FILE adds file', () => {
    const file = {
      id: 'f1',
      templateName: 'csat',
      fileName: 'test.xlsx',
      uploadedAt: new Date().toISOString(),
      rowCount: 5,
      status: 'preview' as const,
      validationMessages: [],
      data: [],
    };
    const newState = reducer(initialState, { type: 'ADD_UPLOADED_FILE', payload: file });
    expect(newState.uploadedFiles.length).toBe(1);
    expect(newState.uploadedFiles[0].id).toBe('f1');
  });

  it('REMOVE_UPLOADED_FILE removes by id', () => {
    const file = {
      id: 'f2',
      templateName: 'csat',
      fileName: 'test.xlsx',
      uploadedAt: new Date().toISOString(),
      rowCount: 5,
      status: 'loaded' as const,
      validationMessages: [],
      data: [],
    };
    const stateWithFile = { ...initialState, uploadedFiles: [file] };
    const newState = reducer(stateWithFile, { type: 'REMOVE_UPLOADED_FILE', payload: 'f2' });
    expect(newState.uploadedFiles.length).toBe(0);
  });

  it('TOGGLE_SIDEBAR toggles sidebarOpen', () => {
    expect(initialState.sidebarOpen).toBe(true);
    const newState = reducer(initialState, { type: 'TOGGLE_SIDEBAR' });
    expect(newState.sidebarOpen).toBe(false);
    const newState2 = reducer(newState, { type: 'TOGGLE_SIDEBAR' });
    expect(newState2.sidebarOpen).toBe(true);
  });

  it('SET_ROLE changes user role', () => {
    const stateWithUser = { ...initialState, user: { ...MOCK_USER, role: UserRole.DATA_MANAGER } };
    const newState = reducer(stateWithUser, { type: 'SET_ROLE', payload: UserRole.APPROVER });
    expect(newState.user?.role).toBe(UserRole.APPROVER);
  });

  it('SET_ROLE with no user does nothing', () => {
    const newState = reducer(initialState, { type: 'SET_ROLE', payload: UserRole.APPROVER });
    expect(newState.user).toBeNull();
  });

  it('CLONE_DATA clones from one key to another', () => {
    const data = [{ id: '1', name: 'original' }];
    const stateWithData: AppState = { ...initialState, datasets: { 'src_1_2025': data } };
    const newState = reducer(stateWithData, { type: 'CLONE_DATA', payload: { fromKey: 'src_1_2025', toKey: 'dst_2_2026' } });
    expect(newState.datasets['dst_2_2026']).toEqual(data);
    expect(newState.datasetMeta['dst_2_2026']).toBeDefined();
    expect(newState.datasetMeta['dst_2_2026'].status).toBe('Draft');
  });

  it('CLONE_DATA with empty source creates empty dataset', () => {
    const newState = reducer(initialState, { type: 'CLONE_DATA', payload: { fromKey: 'nonexist', toKey: 'dst_3_2026' } });
    expect(newState.datasets['dst_3_2026']).toEqual([]);
  });

  it('unknown action returns same state', () => {
    // @ts-expect-error testing unknown action
    const newState = reducer(initialState, { type: 'UNKNOWN_ACTION', payload: null });
    expect(newState).toEqual(initialState);
  });
});
