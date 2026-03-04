import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/AdminLayout';
import { useAuth } from './hooks/useAuth';
import { ROUTES } from './constants/endpoints';

// Pages
import Home from './pages/Home';
import AdminLogin from './pages/AdminLogin';
import AdminSignup from './pages/AdminSignup';
import AdminDashboard from './pages/AdminDashboard';
import DepartmentPage from './pages/DepartmentPage';
import CustomerPage from './pages/CustomerPage';
import TasksManagerPage from './pages/TasksManagerPage';
import MessagesPage from './pages/MessagesPage';
import TeamsPage from './pages/TeamsPage';
import CreateTaskPage from './pages/CreateTaskPage';
import EditTaskPage from './pages/EditTaskPage';
import AddMemberPage from './pages/AddMemberPage';
import InquiryPage from './pages/InquiryPage';
import DepartmentDetailPage from './pages/DepartmentDetailPage';
import QuotationPage from './pages/QuotationPage';
import ProformaPage from './pages/ProformaPage';

// Inner component that uses useAuth
const AppRoutes = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Routes>
      {/* Home Route */}
      <Route path={ROUTES.HOME} element={<Home />} />
      <Route path={ROUTES.INQUIRY} element={<InquiryPage />} />

      {/* Admin Auth Routes */}
      <Route
        path={ROUTES.ADMIN_LOGIN}
        element={
          isAuthenticated ? (
            <Navigate to={ROUTES.ADMIN_DASHBOARD} replace />
          ) : (
            <AdminLogin />
          )
        }
      />
      <Route
        path={ROUTES.ADMIN_SIGNUP}
        element={
          isAuthenticated ? (
            <Navigate to={ROUTES.ADMIN_DASHBOARD} replace />
          ) : (
            <AdminSignup />
          )
        }
      />

      {/* Protected Admin Routes with Sidebar Layout (pathless) */}
      <Route
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path={ROUTES.ADMIN_DASHBOARD} element={<AdminDashboard />} />
        <Route path={ROUTES.ADMIN_DEPARTMENT} element={<DepartmentPage />} />
        <Route path={ROUTES.ADMIN_CUSTOMER} element={<CustomerPage />} />
        <Route path={ROUTES.ADMIN_TASKS} element={<TasksManagerPage />} />
        <Route path={ROUTES.ADMIN_MESSAGES} element={<MessagesPage />} />
        <Route path={ROUTES.ADMIN_TEAMS} element={<TeamsPage />} />
        <Route path={ROUTES.ADMIN_CREATE_TASK} element={<CreateTaskPage />} />
        <Route path={`${ROUTES.ADMIN_EDIT_TASK}/:id`} element={<EditTaskPage />} />
        <Route path={ROUTES.ADMIN_ADD_MEMBER} element={<AddMemberPage />} />
        <Route path={`${ROUTES.ADMIN_DEPARTMENT}/:dept`} element={<DepartmentDetailPage />} />
        <Route path={ROUTES.ADMIN_QUOTATION} element={<QuotationPage />} />
        <Route path={ROUTES.ADMIN_PROFORMA} element={<ProformaPage />} />
      </Route>
    </Routes>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}
