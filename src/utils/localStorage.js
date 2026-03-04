// LocalStorage utility functions
export const setAuthToken = (token) => {
  localStorage.setItem('token', token);
};

export const getAuthToken = () => {
  return localStorage.getItem('token');
};

export const removeAuthToken = () => {
  localStorage.removeItem('token');
};

export const setAdminData = (admin) => {
  localStorage.setItem('admin', JSON.stringify(admin));
};

export const getAdminData = () => {
  const admin = localStorage.getItem('admin');
  return admin ? JSON.parse(admin) : null;
};

export const removeAdminData = () => {
  localStorage.removeItem('admin');
};

export const clearAuthStorage = () => {
  removeAuthToken();
  removeAdminData();
};
