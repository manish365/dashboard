// Auth endpoints
const ENDPOINT_INIT = `/wp-admin`;

export const LOGIN_USER = `${ENDPOINT_INIT}/login`;
export const LOGOUT_USER = `${ENDPOINT_INIT}/logout`;
export const REFRESH_TOKEN = `${ENDPOINT_INIT}/refresh-token`;
export const VALIDATE_SESSION = `${ENDPOINT_INIT}/validate-session`;
export const USER_PROFILE = `${ENDPOINT_INIT}/profile`;
export const ROLES_LIST = `${ENDPOINT_INIT}/roles`;
export const PERMISSION_CATEGORIES_LIST_with_PERMISSION = `${ENDPOINT_INIT}/permission-categories-with-permissions`;
export const ASSIGN_ROLE_PERMISSIONS = `${ENDPOINT_INIT}/roles`;

export const REGISTER_USER = `${ENDPOINT_INIT}/register`;

export const USERS_LIST = `${ENDPOINT_INIT}/users`;
export const USER_CREATE = `${ENDPOINT_INIT}/users`;
export const USER_UPDATE = `${ENDPOINT_INIT}/users`;
export const USER_DELETE = `${ENDPOINT_INIT}/users`;
export const USER_DETAIL = `${ENDPOINT_INIT}/users`;

export const ROLE_CREATE = `${ENDPOINT_INIT}/roles`;
export const ROLE_UPDATE = `${ENDPOINT_INIT}/roles`;
export const ROLE_DELETE = `${ENDPOINT_INIT}/roles`;
export const ROLE_DETAIL = `${ENDPOINT_INIT}/roles`;

export const PERMISSIONS_LIST = `${ENDPOINT_INIT}/permissions`;
export const PERMISSION_CATEGORIES_LIST = `${ENDPOINT_INIT}/permission-categories`;
export const ASSIGN_USER_ROLES = `${ENDPOINT_INIT}/users`;
export const AUDIT_LOGS = `${ENDPOINT_INIT}/audit-logs`;

export const FORGOT_PASSWORD = `${ENDPOINT_INIT}/forgot-password`;
export const RESET_PASSWORD = `${ENDPOINT_INIT}/reset-password`;
export const ADMIN_RESET_USER_PASSWORD = (id: string | number) => `${ENDPOINT_INIT}/users/${id}/reset-password`;

export const EMAIL_TEMPLATES = `${ENDPOINT_INIT}/email-templates`;
export const EMAIL_TEMPLATE_DETAIL = (id: string | number) => `${ENDPOINT_INIT}/email-templates/${id}`;
