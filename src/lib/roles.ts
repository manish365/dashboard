export enum UserRole {
  DATA_MANAGER = 'DATA_MANAGER',
  APPROVER = 'APPROVER',
}

export interface UserInfo {
  name: string;
  email: string;
  role: UserRole;
}

export const ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.DATA_MANAGER]: 'Data Manager',
  [UserRole.APPROVER]: 'Approver',
};

export const ROLE_COLORS: Record<UserRole, string> = {
  [UserRole.DATA_MANAGER]: 'theme-tag-brand',
  [UserRole.APPROVER]: 'theme-tag-success',
};

export function canEdit(role: UserRole): boolean {
  return role === UserRole.DATA_MANAGER;
}

export function canUpload(role: UserRole): boolean {
  return role === UserRole.DATA_MANAGER;
}

export function canSubmit(role: UserRole): boolean {
  return role === UserRole.DATA_MANAGER;
}

export function canApprove(role: UserRole): boolean {
  return role === UserRole.APPROVER;
}

export function canClone(role: UserRole): boolean {
  return role === UserRole.DATA_MANAGER;
}

export function canDelete(role: UserRole): boolean {
  return role === UserRole.DATA_MANAGER;
}

export function assignRole(email: string): UserRole {
  if (email.toLowerCase().includes('approver') || email.toLowerCase().includes('manager')) {
    return UserRole.APPROVER;
  }
  return UserRole.DATA_MANAGER;
}

export const MOCK_USER: UserInfo = {
  name: 'Demo User',
  email: 'demo.user@store.com',
  role: UserRole.DATA_MANAGER,
};
