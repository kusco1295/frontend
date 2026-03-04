import React from 'react';
import '../styles/Department.css';

const DepartmentPage = () => {
  return (
    <div className="page-container">
      <h2 className="page-title">Department</h2>
      <p className="page-subtitle">Manage company departments here.</p>
      <div className="empty-state">
        <p>No departments found. Add your first department to get started.</p>
      </div>
    </div>
  );
};

export default DepartmentPage;
