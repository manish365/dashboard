import api from "./api";
import { 
  LOGIN_USER, 
  USER_PROFILE, 
  VALIDATE_SESSION, 
  LOGOUT_USER, 
  REFRESH_TOKEN, 
  FORGOT_PASSWORD, 
  RESET_PASSWORD, 
  EMAIL_TEMPLATES, 
  EMAIL_TEMPLATE_DETAIL 
} from "@/config/endpoints";

export const loginUser = (userData: any) => {
  return api(LOGIN_USER, { method: "POST", body: JSON.stringify(userData) });
};

export const getProfile = () => {
  return api(USER_PROFILE, { method: "GET" });
};

export const validateToken = () => {
  return api(VALIDATE_SESSION, { method: "GET" });
}

export const logoutUser = () => {
  return api(LOGOUT_USER, { method: "POST" });
}

export const refreshToken = () => {
  return api(REFRESH_TOKEN, { method: "POST" });
}

// Password recovery
export const forgotPassword = (email: string) => {
  return api(FORGOT_PASSWORD, { method: "POST", body: JSON.stringify({ email }) });
}

export const resetPassword = (token: string, password: string) => {
  return api(RESET_PASSWORD, { method: "POST", body: JSON.stringify({ token, password }) });
}

// Email Templates
export const getEmailTemplates = () => {
  return api(EMAIL_TEMPLATES, { method: "GET" });
}

export const getEmailTemplate = (id: string | number) => {
  return api(EMAIL_TEMPLATE_DETAIL(id), { method: "GET" });
}

export const createEmailTemplate = (data: any) => {
  return api(EMAIL_TEMPLATES, { method: "POST", body: JSON.stringify(data) });
}

export const updateEmailTemplate = (id: string | number, data: any) => {
  return api(EMAIL_TEMPLATE_DETAIL(id), { method: "PUT", body: JSON.stringify(data) });
}

export const deleteEmailTemplate = (id: string | number) => {
  return api(EMAIL_TEMPLATE_DETAIL(id), { method: "DELETE" });
}
