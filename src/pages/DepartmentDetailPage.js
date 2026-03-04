import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MdArrowBack, MdForward, MdAttachFile, MdClose, MdDownload, MdBusiness, MdEmail, MdLocationOn, MdPhone } from 'react-icons/md';
import { customerAPI } from '../services/adminAPI';
import { ROUTES } from '../constants/endpoints';
import '../styles/DepartmentDetail.css';

const DEPARTMENTS = [
  'Planning Dept', 'Design Dept', 'Purchase Dept', 'Sales Dept',
  'Sales Coordinator', 'Account Dept', 'Production Dept', 'Service Dept',
];

const DepartmentDetailPage = () => {
  const { dept }  = useParams();
  const navigate  = useNavigate();
  const deptName  = decodeURIComponent(dept);

  const [inquiries, setInquiries]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');

  // expanded cards
  const [expanded, setExpanded] = useState({});
  const toggleExpand = (id) => setExpanded((p) => ({ ...p, [id]: !p[id] }));

  // per-inquiry forward state
  const [forwardOpen, setForwardOpen]       = useState({});
  const [forwardDept, setForwardDept]       = useState({});
  const [forwardComment, setForwardComment] = useState({});
  const [forwardFiles, setForwardFiles]     = useState({});
  const [forwardLoading, setForwardLoading] = useState({});

  const load = async () => {
    try {
      const res = await customerAPI.getAll();
      const all = res.data.data.customers;
      setInquiries(
        all.filter((c) =>
          c.forwardedTo === deptName ||
          (c.department === deptName && !c.forwardedTo)
        )
      );
    } catch {
      setError('Failed to load inquiries.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [deptName]);

  const handleForward = async (id) => {
    const dept = forwardDept[id];
    if (!dept) return;
    if (!forwardComment[id]?.trim()) return;
    setForwardLoading((p) => ({ ...p, [id]: true }));
    try {
      await customerAPI.forwardInquiry(id, dept, forwardComment[id] || '', forwardFiles[id] || []);
      setForwardOpen((p) => ({ ...p, [id]: false }));
      setForwardDept((p) => ({ ...p, [id]: '' }));
      setForwardComment((p) => ({ ...p, [id]: '' }));
      setForwardFiles((p) => ({ ...p, [id]: [] }));
      await load();
    } catch { /* silent */ }
    finally { setForwardLoading((p) => ({ ...p, [id]: false })); }
  };

  // Strip the unique prefix (timestamp-random-) added by the upload middleware
  const getOriginalName = (filename) => filename.replace(/^\d+-\d+-/, '').replace(/_/g, ' ');

  const BASE_URL = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';

  const handleDownload = async (filename) => {
    try {
      const res = await fetch(`${BASE_URL}/uploads/${filename}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = getOriginalName(filename);
      a.click();
      URL.revokeObjectURL(url);
    } catch { /* silent */ }
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  const formatTime = (d) =>
    new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="page-container">
      <div className="dept-detail-header">
        <button className="btn-back" onClick={() => navigate(ROUTES.ADMIN_DEPARTMENT)}>
          <MdArrowBack /> Back
        </button>
        <div>
          <h2 className="page-title">{deptName}</h2>
          <p className="page-subtitle">
            {loading ? '...' : `${inquiries.length} inquiry${inquiries.length !== 1 ? 's' : ''}`}
          </p>
        </div>
      </div>



      {loading && <p className="dept-inq-loading">Loading inquiries...</p>}
      {error   && <p className="dept-inq-error">{error}</p>}

      {!loading && !error && inquiries.length === 0 && (
        <div className="empty-state"><p>No inquiries found for {deptName}.</p></div>
      )}

      {!loading && inquiries.length > 0 && (
        <div className="dept-inq-list">
          {inquiries.map((inq) => {
            const isForwarded = inq.forwardedTo === deptName;
            const isOpen = !!expanded[inq._id];
            return (
              <div key={inq._id} className="dept-inq-card">

                {/* Summary row — only visible when collapsed */}
                {!isOpen && (
                  <div className="inq-card-summary" onClick={() => toggleExpand(inq._id)}>
                    <div className="inq-card-summary-info">
                      <span className="inq-summary-company"><MdBusiness /> {inq.company || inq.name}</span>
                      <span className="inq-summary-detail"><MdPhone /> {inq.phone || '—'}</span>
                      <span className="inq-summary-detail"><MdEmail /> {inq.email || '—'}</span>
                      <span className="inq-summary-detail"><MdLocationOn /> {inq.address || '—'}</span>
                      {inq.inquiryNo && <span className="inq-summary-detail">{inq.inquiryNo}</span>}
                      <span className="inq-summary-detail">{formatDate(inq.createdAt)}</span>
                    </div>
                    <span className="inq-summary-chevron">▾</span>
                  </div>
                )}

                {isOpen && <>

                {isForwarded && (() => {
                  const latest = inq.forwardHistory?.slice(-1)[0];
                  return (
                    <div className="inq-forwarded-badge">
                      <div className="inq-forwarded-badge-title">
                        Forwarded by <strong>{latest?.forwardedBy || 'Unknown'}</strong>
                        {latest?.fromDept && <span className="inq-forwarded-from"> from {latest.fromDept}</span>}
                      </div>
                    </div>
                  );
                })()}

                {/* Inquiry No + Date */}
                <div className="inq-inquiry-no-bar">
                  {inq.inquiryNo && <>Inquiry No: <strong>{inq.inquiryNo}</strong>&ensp;·&ensp;</>}
                  Submitted: <strong>{formatDate(inq.createdAt)}</strong>
                </div>

                <div className="inq-card-collapse-row">
                  <button className="inq-card-collapse-btn" onClick={() => toggleExpand(inq._id)}>
                    ▴ Collapse
                  </button>
                </div>

                {/* Contact Details */}
                <div className="inq-card-section">
                  <div className="inq-card-section-title">Contact Details</div>
                  <div className="inq-card-grid">
                    <div className="inq-card-field">
                      <span className="inq-field-label">Company</span>
                      <span className="inq-field-value">{inq.company || '—'}</span>
                    </div>
                    <div className="inq-card-field">
                      <span className="inq-field-label">Name</span>
                      <span className="inq-field-value">{inq.name}</span>
                    </div>
                    <div className="inq-card-field">
                      <span className="inq-field-label">Phone</span>
                      <span className="inq-field-value">{inq.phone || '—'}</span>
                    </div>
                    <div className="inq-card-field">
                      <span className="inq-field-label">Email</span>
                      <span className="inq-field-value">{inq.email || '—'}</span>
                    </div>
                    <div className="inq-card-field inq-card-field--full">
                      <span className="inq-field-label">Address</span>
                      <span className="inq-field-value">{inq.address || '—'}</span>
                    </div>
                  </div>
                </div>

                {/* Equipment Details */}
                <div className="inq-card-section">
                  <div className="inq-card-section-title">Equipment Details</div>
                  <div className="inq-card-grid">
                    <div className="inq-card-field">
                      <span className="inq-field-label">Equipment Name</span>
                      <span className="inq-field-value">{inq.equipmentName || '—'}</span>
                    </div>
                    <div className="inq-card-field">
                      <span className="inq-field-label">Make</span>
                      <span className="inq-field-value">{inq.make || '—'}</span>
                    </div>
                    <div className="inq-card-field">
                      <span className="inq-field-label">Model No</span>
                      <span className="inq-field-value">{inq.modelNo || '—'}</span>
                    </div>
                    <div className="inq-card-field">
                      <span className="inq-field-label">Liquid</span>
                      <span className="inq-field-value">{inq.liquid || '—'}</span>
                    </div>
                    <div className="inq-card-field">
                      <span className="inq-field-label">Temperature</span>
                      <span className="inq-field-value">{inq.temperature || '—'}</span>
                    </div>
                    <div className="inq-card-field">
                      <span className="inq-field-label">Pressure</span>
                      <span className="inq-field-value">{inq.pressure || '—'}</span>
                    </div>
                    {inq.description && (
                      <div className="inq-card-field inq-card-field--full">
                        <span className="inq-field-label">Description</span>
                        <span className="inq-field-value">{inq.description}</span>
                      </div>
                    )}
                    {inq.attachments?.length > 0 && (
                      <div className="inq-card-field inq-card-field--full">
                        <span className="inq-field-label">Attachments</span>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {inq.attachments.map((file, ai) => (
                            <div key={ai} className="inq-comment-attachment">
                              <a
                                href={`${BASE_URL}/uploads/${file}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inq-attachment-name"
                              >
                                <MdAttachFile /> {getOriginalName(file)}
                              </a>
                              <button
                                className="inq-attachment-download"
                                onClick={() => handleDownload(file)}
                                title="Download"
                              >
                                <MdDownload />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Forward */}
                <div className="inq-card-section">
                  <div className="inq-card-section-title">Forward Inquiry</div>
                  {!forwardOpen[inq._id] ? (
                    <div className="inq-forward-btn-row">
                      <button
                        className="inq-forward-btn"
                        onClick={() => setForwardOpen((p) => ({ ...p, [inq._id]: true }))}
                      >
                        <MdForward /> Forward to Department
                      </button>
                      {deptName === 'Sales Coordinator' && (
                        <>
                          <button
                            className="inq-quotation-btn"
                            onClick={() => navigate(ROUTES.ADMIN_QUOTATION, { state: { inq } })}
                          >
                            Quotation
                          </button>
                          <button
                            className="inq-proforma-btn"
                            onClick={() => navigate(ROUTES.ADMIN_PROFORMA, { state: { inq } })}
                          >
                            Performa Invoice
                          </button>
                        </>
                      )}
                      {deptName === 'Design Dept' && (
                        <button className="inq-material-btn">
                          Material Selection
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="inq-forward-form">
                      <select
                        className="inq-forward-select"
                        value={forwardDept[inq._id] || ''}
                        onChange={(e) => setForwardDept((p) => ({ ...p, [inq._id]: e.target.value }))}
                      >
                        <option value="">— Select department —</option>
                        {DEPARTMENTS.filter((d) => d !== deptName).map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                      <div className="inq-forward-comment-wrap">
                        <input
                          type="text"
                          className="inq-forward-comment-input"
                          placeholder="Add a comment (required)"
                          value={forwardComment[inq._id] || ''}
                          onChange={(e) => setForwardComment((p) => ({ ...p, [inq._id]: e.target.value }))}
                        />
                        <label className="inq-forward-file-label" title="Attach files">
                          <MdAttachFile />
                          <input
                            type="file"
                            multiple
                            style={{ display: 'none' }}
                            onChange={(e) => {
                              const newFiles = Array.from(e.target.files);
                              setForwardFiles((p) => ({ ...p, [inq._id]: [...(p[inq._id] || []), ...newFiles] }));
                              e.target.value = '';
                            }}
                          />
                        </label>
                      </div>
                      {forwardFiles[inq._id]?.length > 0 && (
                        <div className="inq-forward-file-list">
                          {forwardFiles[inq._id].map((f, i) => (
                            <div key={i} className="inq-forward-file-item">
                              <span>{f.name}</span>
                              <button
                                type="button"
                                className="inq-forward-file-remove"
                                onClick={() => setForwardFiles((p) => ({
                                  ...p,
                                  [inq._id]: p[inq._id].filter((_, idx) => idx !== i)
                                }))}
                              >
                                <MdClose />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="inq-forward-actions">
                        <button
                          className="inq-btn-cancel"
                          onClick={() => setForwardOpen((p) => ({ ...p, [inq._id]: false }))}
                        >
                          Cancel
                        </button>
                        <button
                          className="inq-btn-forward"
                          onClick={() => handleForward(inq._id)}
                          disabled={forwardLoading[inq._id] || !forwardDept[inq._id] || !forwardComment[inq._id]?.trim()}
                        >
                          {forwardLoading[inq._id] ? 'Forwarding...' : 'Forward'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Comments */}
                <div className="inq-card-section">
                  <div className="inq-card-section-title">Comments</div>
                  {((inq.forwardHistory?.length > 0) || (inq.comments?.length > 0)) ? (
                    <div className="inq-comments-list">
                      {/* Forward history — latest first */}
                      {[...(inq.forwardHistory || [])].reverse().map((fh, i) => (
                        <div key={`fh-${i}`} className="inq-comment-item inq-comment-item--forward">
                          <div className="inq-comment-meta">
                            <span className="inq-comment-author">{fh.forwardedBy || 'Unknown'}</span>
                            <span className="inq-comment-dept">{fh.fromDept}</span>
                            <span className="inq-comment-time">{formatTime(fh.createdAt)}</span>
                          </div>
                          <p className="inq-comment-text">{fh.comment}</p>
                          {fh.attachments?.length > 0 && (
                            <div className="inq-comment-attachment-list">
                              {fh.attachments.map((file, ai) => (
                                <div key={ai} className="inq-comment-attachment">
                                  <a
                                    href={`${BASE_URL}/uploads/${file}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inq-attachment-name"
                                  >
                                    <MdAttachFile /> {getOriginalName(file)}
                                  </a>
                                  <button
                                    className="inq-attachment-download"
                                    onClick={() => handleDownload(file)}
                                    title="Download"
                                  >
                                    <MdDownload />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                      {/* Regular comments — latest first */}
                      {[...(inq.comments || [])].reverse().map((c, i) => (
                        <div key={`c-${i}`} className="inq-comment-item">
                          <div className="inq-comment-meta">
                            <span className="inq-comment-author">{c.authorName || 'Unknown'}</span>
                            {c.authorDept && <span className="inq-comment-dept">{c.authorDept}</span>}
                            <span className="inq-comment-time">{formatTime(c.createdAt)}</span>
                          </div>
                          <p className="inq-comment-text">{c.text}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="inq-no-comments">No comments yet.</p>
                  )}

                </div>

                <div className="inq-card-footer">
                  Submitted on {formatDate(inq.createdAt)}
                </div>

                </>}

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DepartmentDetailPage;
