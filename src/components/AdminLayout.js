import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  MdDashboard, MdBusiness, MdPeople, MdAssignment,
  MdMessage, MdGroups, MdLogout, MdMenu, MdClose,
  MdExpandMore, MdExpandLess,
  MdCalendarToday, MdDesignServices, MdShoppingCart,
  MdPointOfSale, MdAccountBalance, MdFactory, MdBuild,
  MdCheckCircle,
} from 'react-icons/md';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '../constants/endpoints';
import '../styles/Dashboard.css';

const DEPARTMENTS = [
  { label: 'Planning Dept',      icon: <MdCalendarToday /> },
  { label: 'Design Dept',        icon: <MdDesignServices /> },
  { label: 'Purchase Dept',      icon: <MdShoppingCart /> },
  { label: 'Sales Dept',         icon: <MdPointOfSale /> },
  { label: 'Sales Coordinator',  icon: <MdPeople /> },
  { label: 'Account Dept',       icon: <MdAccountBalance /> },
  { label: 'Production Dept',    icon: <MdFactory /> },
  { label: 'Service Dept',       icon: <MdBuild /> },
  { label: 'Store Dept',         icon: <MdBusiness /> },
];

const navItems = [
  { label: 'Dashboard',    icon: <MdDashboard />, path: ROUTES.ADMIN_DASHBOARD, end: true },
  { label: 'Customer',     icon: <MdPeople />,    path: ROUTES.ADMIN_CUSTOMER },
  { label: 'Manage Tasks', icon: <MdAssignment />, path: ROUTES.ADMIN_TASKS },
  { label: 'Approvals',    icon: <MdCheckCircle />, path: ROUTES.ADMIN_APPROVALS },
  { label: 'Messages',     icon: <MdMessage />,   path: ROUTES.ADMIN_MESSAGES },
  { label: 'Teams',        icon: <MdGroups />,    path: ROUTES.ADMIN_TEAMS },
];

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen]         = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [workOpen, setWorkOpen]               = useState(false);
  const { logout, admin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate(ROUTES.ADMIN_LOGIN);
  };

  return (
    <div className="admin-layout">
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`admin-sidebar ${sidebarOpen ? 'sidebar-open' : ''} ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <div className="sidebar-brand">
          <span className="brand-text">KUSCO Admin</span>
          <button className="sidebar-close-btn" onClick={() => setSidebarOpen(false)}>
            <MdClose />
          </button>
        </div>

        <nav className="sidebar-nav">
          {/* Dashboard */}
          <NavLink
            to={ROUTES.ADMIN_DASHBOARD}
            end
            className={({ isActive }) => `sidebar-link${isActive ? ' sidebar-link--active' : ''}`}
            onClick={() => setSidebarOpen(false)}
          >
            <span className="sidebar-icon"><MdDashboard /></span>
            <span className="sidebar-label">Dashboard</span>
          </NavLink>

          {/* Work — accordion */}
          <button
            className="sidebar-link sidebar-link--btn"
            onClick={() => setWorkOpen((o) => !o)}
          >
            <span className="sidebar-icon"><MdAssignment /></span>
            <span className="sidebar-label">Inquiry</span>
            <span className="sidebar-expand-icon">
              {workOpen ? <MdExpandLess /> : <MdExpandMore />}
            </span>
          </button>

          {workOpen && (
            <div className="sidebar-submenu">
              {DEPARTMENTS.map((dept) => (
                <button
                  key={dept.label}
                  className="sidebar-sublink"
                  onClick={() => {
                    navigate(`${ROUTES.ADMIN_DEPARTMENT}/${encodeURIComponent(dept.label)}`);
                    setSidebarOpen(false);
                  }}
                >
                  <span className="sidebar-sublink-icon">{dept.icon}</span>
                  {dept.label}
                </button>
              ))}
            </div>
          )}

          {/* Rest of nav items */}
          {navItems.slice(1).map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) => `sidebar-link${isActive ? ' sidebar-link--active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span className="sidebar-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-profile">
          <div className="sidebar-avatar">
            {admin?.name?.charAt(0)?.toUpperCase() || 'A'}
          </div>
          <div className="sidebar-profile-info">
            <span className="sidebar-profile-name">{admin?.name}</span>
            <span className="sidebar-profile-role">{admin?.role}</span>
          </div>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <button className="topbar-menu-btn" onClick={() => setSidebarOpen(true)}>
            <MdMenu />
          </button>
          <button className="topbar-toggle-btn" onClick={() => setSidebarCollapsed((c) => !c)}>
            <MdMenu />
          </button>
          <span className="topbar-title">Admin Panel</span>
          <button className="topbar-logout-btn" onClick={handleLogout}>
            <MdLogout />
            <span>Logout</span>
          </button>
        </header>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
