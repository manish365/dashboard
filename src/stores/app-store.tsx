'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { UserInfo, UserRole, MOCK_USER } from '@/lib/roles';
import { v4 as uuidv4 } from 'uuid';

// ─── Types ────────────────────────────────────────────────────
export type ApprovalStatus = 'Draft' | 'Submitted' | 'Approved' | 'Rejected';

export type TableName =
  | 'csat'
  | 'volume-budget'
  | 'main-template'
  | 'sm-mo-mapping'
  | 'vas-sku'
  | 'employee-master';

export interface DatasetMeta {
  id: string;
  tableName: TableName;
  month: number;
  year: number;
  status: ApprovalStatus;
  submittedBy?: string;
  submittedAt?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  rowCount: number;
}

export interface UploadedFile {
  id: string;
  templateName: string;
  fileName: string;
  uploadedAt: string;
  rowCount: number;
  status: 'preview' | 'loaded' | 'error';
  validationMessages: string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[];
}

export interface AppState {
  user: UserInfo | null;
  isAuthenticated: boolean;
  selectedMonth: number;
  selectedYear: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  datasets: Record<string, any[]>;
  datasetMeta: Record<string, DatasetMeta>;
  uploadedFiles: UploadedFile[];
  sidebarOpen: boolean;
}

// ─── Actions ──────────────────────────────────────────────────
type Action =
  | { type: 'SET_USER'; payload: UserInfo | null }
  | { type: 'SET_AUTHENTICATED'; payload: boolean }
  | { type: 'SET_MONTH'; payload: number }
  | { type: 'SET_YEAR'; payload: number }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | { type: 'SET_DATASET'; payload: { key: string; data: any[] } }
  | { type: 'SET_DATASET_META'; payload: { key: string; meta: DatasetMeta } }
  | { type: 'ADD_UPLOADED_FILE'; payload: UploadedFile }
  | { type: 'REMOVE_UPLOADED_FILE'; payload: string }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_ROLE'; payload: UserRole }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | { type: 'CLONE_DATA'; payload: { fromKey: string; toKey: string } };

export const initialState: AppState = {
  user: null,
  isAuthenticated: false,
  selectedMonth: new Date().getMonth() + 1,
  selectedYear: new Date().getFullYear(),
  datasets: {},
  datasetMeta: {},
  uploadedFiles: [],
  sidebarOpen: true,
};

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_AUTHENTICATED':
      return { ...state, isAuthenticated: action.payload };
    case 'SET_MONTH':
      return { ...state, selectedMonth: action.payload };
    case 'SET_YEAR':
      return { ...state, selectedYear: action.payload };
    case 'SET_DATASET':
      return {
        ...state,
        datasets: { ...state.datasets, [action.payload.key]: action.payload.data },
      };
    case 'SET_DATASET_META':
      return {
        ...state,
        datasetMeta: { ...state.datasetMeta, [action.payload.key]: action.payload.meta },
      };
    case 'ADD_UPLOADED_FILE':
      return { ...state, uploadedFiles: [...state.uploadedFiles, action.payload] };
    case 'REMOVE_UPLOADED_FILE':
      return {
        ...state,
        uploadedFiles: state.uploadedFiles.filter((f) => f.id !== action.payload),
      };
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarOpen: !state.sidebarOpen };
    case 'SET_ROLE':
      return {
        ...state,
        user: state.user ? { ...state.user, role: action.payload } : null,
      };
    case 'CLONE_DATA': {
      const sourceData = state.datasets[action.payload.fromKey] || [];
      return {
        ...state,
        datasets: { ...state.datasets, [action.payload.toKey]: [...sourceData] },
        datasetMeta: {
          ...state.datasetMeta,
          [action.payload.toKey]: {
            id: uuidv4(),
            tableName: action.payload.toKey.split('_').slice(0, -2).join('_') as TableName,
            month: state.selectedMonth,
            year: state.selectedYear,
            status: 'Draft',
            rowCount: sourceData.length,
          },
        },
      };
    }
    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────
interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
}

export function useAppStore() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppStore must be used within AppProvider');
  }
  return context;
}
