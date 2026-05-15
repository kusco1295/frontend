import React, { useState, useEffect } from 'react';
import { MdCheckCircle, MdAttachFile, MdDownload, MdDelete, MdClose, MdBusiness } from 'react-icons/md';
import { approvalAPI } from '../services/adminAPI';
import { useAuth } from '../hooks/useAuth';
import '../styles/Approvals.css';

const ApprovalsPage = () => {
  const { admin } = useAuth();
  const isAdmin = admin?.role === 'admin' || admin?.role === 'superadmin';

  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');

  const [selectedApproval, setSelectedApproval] = useState(null);
  const [confirming, setConfirming]           = useState(null); // 'Approved' or 'Rejected'

  const fetchApprovals = async () => {
    try {
      setLoading(true);
      const res = await approvalAPI.getAll();
      setApprovals(res.data.data.approvals);
    } catch {
      setError('Failed to load approvals.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  const handleStatusUpdate = async (id, status) => {
    try {
      await approvalAPI.updateStatus(id, status, admin.name);
      setConfirming(null);
      setSelectedApproval(null);
      fetchApprovals();
    } catch { /* silent */ }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Approved': return 'status-approved';
      case 'Rejected': return 'status-rejected';
      default: return 'status-pending';
    }
  };

  const toCapital = (value) =>
    String(value || '')
      .trim()
      .replace(/\s+/g, ' ')
      .toUpperCase();

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  const formatTime = (d) =>
    new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  const BASE_URL = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';

  return (
    <div className="page-container">
      <div className="approvals-header">
        <div>
          <h2 className="page-title">Approvals</h2>
          <p className="page-subtitle">Manage and track approval requests</p>
        </div>
      </div>

      {loading && <p className="loading-text">Loading approvals...</p>}
      {error && <p className="error-text">{error}</p>}

      {!loading && !error && approvals.length === 0 && (
        <div className="empty-state"><p>No approval requests found.</p></div>
      )}

      <div className="approvals-grid">
        {approvals.map((app) => (
          <div key={app._id} className="approval-card" onClick={() => { setSelectedApproval(app); setConfirming(null); }}>
            <div className="approval-card-header">
              <span className={`approval-type-badge type-${app.type.toLowerCase().replace(/\s+/g, '-')}`}>
                {app.type}
              </span>
              <span className={`approval-status-badge ${getStatusClass(app.status)}`}>
                {app.status}
              </span>
            </div>
            
            <h3 className="approval-title">{app.title}</h3>
            
            <p className="approval-card-desc">
              {app.type === 'for approval material request' && app.materialData?.description 
                ? app.materialData.description 
                : app.description}
            </p>
            
            <div className="approval-meta">
              <div className="meta-item">
                <span className="meta-label">Requested by</span>
                <span className="meta-value">{app.requestedBy} ({app.department})</span>
              </div>
              {app.customer && (
                <div className="meta-item">
                  <span className="meta-label">Customer</span>
                  <span className="meta-value">{app.customer.company || app.customer.name}</span>
                </div>
              )}
            </div>

            <div className="approval-card-footer">
              Submitted: {formatDate(app.createdAt)}
            </div>
          </div>
        ))}
      </div>

      {/* Approval Detail Modal (Styled like Store Dept Detail) */}
      {selectedApproval && (
        <div className="modal-overlay" onClick={() => setSelectedApproval(null)}>
          <div className="modal material-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Approval Request Details</h3>
              <button className="modal-close-btn" onClick={() => setSelectedApproval(null)}><MdClose /></button>
            </div>
            
            <div className="material-detail-body">
              <div className="material-detail-summary">
                <div>
                  <p className="material-detail-label">Request Title</p>
                  <h4>{selectedApproval.title}</h4>
                </div>
                <div className={`approval-status-badge ${getStatusClass(selectedApproval.status)}`} style={{ alignSelf: 'center', fontSize: '1rem', padding: '0.5rem 1rem' }}>
                  {selectedApproval.status}
                </div>
              </div>

              <div className="material-detail-grid">
                {selectedApproval.type === 'for approval material request' && selectedApproval.materialData ? (
                  <>
                    <div className="material-detail-item">
                      <span>Material Name</span>
                      <strong>{selectedApproval.materialData.name}</strong>
                    </div>
                    <div className="material-detail-item">
                      <span>Type</span>
                      <strong>{selectedApproval.materialData.materialType}</strong>
                    </div>
                    <div className="material-detail-item">
                      <span>Quantity</span>
                      <strong>{selectedApproval.materialData.quantity}</strong>
                    </div>
                    <div className="material-detail-item">
                      <span>Requested By</span>
                      <strong>{selectedApproval.requestedBy}</strong>
                    </div>
                    <div className="material-detail-item material-detail-item--full">
                      <span>Material Description</span>
                      <strong>{selectedApproval.materialData.description || '—'}</strong>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="material-detail-item">
                      <span>Type</span>
                      <strong>{selectedApproval.type}</strong>
                    </div>
                    <div className="material-detail-item">
                      <span>Requested By</span>
                      <strong>{selectedApproval.requestedBy}</strong>
                    </div>
                    <div className="material-detail-item">
                      <span>Department</span>
                      <strong>{selectedApproval.department}</strong>
                    </div>
                  </>
                )}
                
                <div className="material-detail-item">
                  <span>Date</span>
                  <strong>{formatDate(selectedApproval.createdAt)} {formatTime(selectedApproval.createdAt)}</strong>
                </div>
                
                {selectedApproval.customer && (
                  <div className="material-detail-item material-detail-item--full">
                    <span>Customer</span>
                    <strong>{selectedApproval.customer.company || selectedApproval.customer.name}</strong>
                  </div>
                )}

                {selectedApproval.type !== 'for approval material request' && (
                  <div className="material-detail-item material-detail-item--full">
                    <span>Description</span>
                    <strong style={{ whiteSpace: 'pre-wrap', fontWeight: 'normal', fontSize: '0.9rem', color: '#475569' }}>
                      {selectedApproval.description || 'No description provided.'}
                    </strong>
                  </div>
                )}

                {selectedApproval.attachment && (
                  <div className="material-detail-item material-detail-item--full">
                    <span>Attachment</span>
                    <a 
                      href={`${BASE_URL}/uploads/${selectedApproval.attachment}`} 
                      target="_blank" 
                      rel="noreferrer"
                      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#4f46e5', textDecoration: 'none', fontWeight: '700', marginTop: '0.5rem' }}
                    >
                      <MdAttachFile /> View Attachment
                    </a>
                  </div>
                )}
              </div>

              {/* Admin Actions */}
              {isAdmin && selectedApproval.status === 'Pending' && (
                <div className="modal-actions" style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #eef2f7' }}>
                  {!confirming ? (
                    <>
                      <button 
                        className="btn-approve-material" 
                        onClick={() => setConfirming('Approved')}
                      >
                        <MdCheckCircle /> Approve
                      </button>
                      <button 
                        className="btn-reject" 
                        style={{ padding: '10px 18px', borderRadius: '10px', fontWeight: '700', fontSize: '14px' }}
                        onClick={() => setConfirming('Rejected')}
                      >
                        Reject & Delete
                      </button>
                      <button 
                        className="btn-cancel" 
                        onClick={() => setSelectedApproval(null)}
                      >
                        Close
                      </button>
                    </>
                  ) : (
                    <div style={{ width: '100%', textAlign: 'center', background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                      <p style={{ margin: '0 0 1rem', fontWeight: '700', color: '#1e293b' }}>
                        {confirming === 'Approved' 
                          ? 'Are you sure you want to approve this request?' 
                          : 'Are you sure you want to reject and DELETE this request?'}
                      </p>
                      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                        <button 
                          className={confirming === 'Approved' ? 'btn-approve-material' : 'btn-reject'}
                          style={confirming === 'Rejected' ? { padding: '10px 18px', borderRadius: '10px', fontWeight: '700', fontSize: '14px' } : {}}
                          onClick={() => handleStatusUpdate(selectedApproval._id, confirming)}
                        >
                          Yes, {confirming === 'Approved' ? 'Approve' : 'Reject'}
                        </button>
                        <button 
                          className="btn-cancel" 
                          onClick={() => setConfirming(null)}
                        >
                          No, Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApprovalsPage;
