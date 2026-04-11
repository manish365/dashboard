import { describe, it, expect } from 'vitest';
import {
  UserRole,
  canEdit,
  canUpload,
  canSubmit,
  canApprove,
  canClone,
  canDelete,
  assignRole,
  ROLE_LABELS,
  ROLE_COLORS,
  MOCK_USER,
} from '@/lib/roles';

describe('Role permissions', () => {
  it('DATA_MANAGER can edit, upload, submit, clone, delete', () => {
    expect(canEdit(UserRole.DATA_MANAGER)).toBe(true);
    expect(canUpload(UserRole.DATA_MANAGER)).toBe(true);
    expect(canSubmit(UserRole.DATA_MANAGER)).toBe(true);
    expect(canClone(UserRole.DATA_MANAGER)).toBe(true);
    expect(canDelete(UserRole.DATA_MANAGER)).toBe(true);
  });

  it('DATA_MANAGER cannot approve', () => {
    expect(canApprove(UserRole.DATA_MANAGER)).toBe(false);
  });

  it('APPROVER can approve', () => {
    expect(canApprove(UserRole.APPROVER)).toBe(true);
  });

  it('APPROVER cannot edit, upload, submit, clone, delete', () => {
    expect(canEdit(UserRole.APPROVER)).toBe(false);
    expect(canUpload(UserRole.APPROVER)).toBe(false);
    expect(canSubmit(UserRole.APPROVER)).toBe(false);
    expect(canClone(UserRole.APPROVER)).toBe(false);
    expect(canDelete(UserRole.APPROVER)).toBe(false);
  });
});

describe('assignRole', () => {
  it('assigns APPROVER for emails containing "approver"', () => {
    expect(assignRole('approver@company.com')).toBe(UserRole.APPROVER);
  });

  it('assigns APPROVER for emails containing "manager"', () => {
    expect(assignRole('manager@company.com')).toBe(UserRole.APPROVER);
  });

  it('assigns DATA_MANAGER by default', () => {
    expect(assignRole('john.doe@company.com')).toBe(UserRole.DATA_MANAGER);
  });

  it('is case-insensitive', () => {
    expect(assignRole('APPROVER@test.com')).toBe(UserRole.APPROVER);
    expect(assignRole('Manager@test.com')).toBe(UserRole.APPROVER);
  });
});

describe('ROLE_LABELS and ROLE_COLORS', () => {
  it('has labels for all roles', () => {
    expect(ROLE_LABELS[UserRole.DATA_MANAGER]).toBe('Data Manager');
    expect(ROLE_LABELS[UserRole.APPROVER]).toBe('Approver');
  });

  it('has colors for all roles', () => {
    expect(ROLE_COLORS[UserRole.DATA_MANAGER]).toBeTruthy();
    expect(ROLE_COLORS[UserRole.APPROVER]).toBeTruthy();
  });
});

describe('MOCK_USER', () => {
  it('has correct default values', () => {
    expect(MOCK_USER.name).toBe('Demo User');
    expect(MOCK_USER.email).toBe('demo.user@store.com');
    expect(MOCK_USER.role).toBe(UserRole.DATA_MANAGER);
  });
});
