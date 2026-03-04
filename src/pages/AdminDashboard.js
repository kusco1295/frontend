import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { adminAPI } from '../services/adminAPI';
import '../styles/AdminDashboard.css';

const AdminDashboard = () => {
  const { admin, updateAdmin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [adminData, setAdminData] = useState(admin || null);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);
        const response = await adminAPI.getMe();
        const userData = response.data.data.admin;
        setAdminData(userData);
        updateAdmin(userData);
      } catch (error) {
        console.error('Error fetching admin data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [updateAdmin]);

  if (loading) {
    return <div className="page-container"><p>Loading...</p></div>;
  }

  return (
    <div className="page-container">
      <div className="welcome-card">
        <h2>Welcome, {adminData?.name}!</h2>
        <p className="admin-email">Email: {adminData?.email}</p>
        <p className="admin-role">Role: {adminData?.role}</p>
      </div>

      <div className="dashboard-stats">
        <h3>Dashboard Statistics</h3>
        <div className="stats-grid">
          <div className="stat-card">
            <h4>Total Users</h4>
            <p className="stat-number">0</p>
          </div>
          <div className="stat-card">
            <h4>Total Orders</h4>
            <p className="stat-number">0</p>
          </div>
          <div className="stat-card">
            <h4>Revenue</h4>
            <p className="stat-number">$0</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
