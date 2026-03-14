/**
 * Test helper: wraps components in the AppProvider so useAppStore works.
 * Also pre-sets a MOCK_USER so the app thinks a user is logged in.
 */
import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { AppProvider } from '@/stores/app-store';

function AllProviders({ children }: { children: React.ReactNode }) {
  return <AppProvider>{children}</AppProvider>;
}

export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { wrapper: AllProviders, ...options });
}
