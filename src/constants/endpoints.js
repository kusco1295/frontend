// API Endpoints
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const ADMIN_ENDPOINTS = {
  SIGNUP: '/admin/signup',
  LOGIN: '/admin/login',
  GET_ME: '/admin/me',
};

export const ROUTES = {
  HOME: '/',
  ADMIN_LOGIN: '/admin',
  ADMIN_SIGNUP: '/admin/signup',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_DEPARTMENT: '/admin/department',
  ADMIN_CUSTOMER: '/admin/customers',
  ADMIN_TASKS: '/admin/tasks',
  ADMIN_CREATE_TASK: '/admin/create-task',
  ADMIN_EDIT_TASK: '/admin/edit-task',
  ADMIN_ADD_MEMBER: '/admin/add-member',
  INQUIRY: '/inquiry',
  ADMIN_QUOTATION: '/admin/quotation',
  ADMIN_PROFORMA: '/admin/proforma-invoice',
  ADMIN_MESSAGES: '/admin/messages',
  ADMIN_TEAMS: '/admin/teams',
  ADMIN_APPROVALS: '/admin/approvals',
  PRODUCTS: '/products',
};
