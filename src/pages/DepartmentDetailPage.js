import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MdArrowBack, MdForward, MdAttachFile, MdClose, MdDownload, MdBusiness, MdEmail, MdLocationOn, MdPhone, MdPictureAsPdf, MdSearch, MdCheckCircle, MdPrint } from 'react-icons/md';
import { customerAPI, materialAPI, approvalAPI } from '../services/adminAPI';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '../constants/endpoints';
import '../styles/DepartmentDetail.css';

const DEPARTMENTS = [
  'Planning Dept', 'Design Dept', 'Purchase Dept', 'Sales Dept',
  'Sales Coordinator', 'Account Dept', 'Production Dept', 'Service Dept',
  'Store Dept',
];

const DepartmentDetailPage = () => {
  const { dept }  = useParams();
  const navigate  = useNavigate();
  const deptName  = decodeURIComponent(dept);
  const { admin } = useAuth();

  const [customers, setCustomers]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [activeSection, setActiveSection] = useState('inquiry');

  // expanded cards
  const [expanded, setExpanded] = useState({});
  const toggleExpand = (id) => setExpanded((p) => ({ ...p, [id]: !p[id] }));

  // per-inquiry forward state
  const [forwardOpen, setForwardOpen]       = useState({});
  const [forwardDept, setForwardDept]       = useState({});
  const [forwardComment, setForwardComment] = useState({});
  const [forwardFiles, setForwardFiles]     = useState({});
  const [forwardLoading, setForwardLoading] = useState({});
  const [materials, setMaterials] = useState([]);
  const [materialLoading, setMaterialLoading] = useState(false);
  const [materialError, setMaterialError] = useState('');
  const [materialDialog, setMaterialDialog] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [activeMaterialSuggestion, setActiveMaterialSuggestion] = useState('');
  const [materialSearchOpen, setMaterialSearchOpen] = useState(false);
  const [materialSearchForm, setMaterialSearchForm] = useState({ name: '', materialType: '' });
  const [materialSearchResult, setMaterialSearchResult] = useState(null);
  const [materialSearchError, setMaterialSearchError] = useState('');
  const [materialForm, setMaterialForm] = useState({ name: '', materialType: '', description: '', quantity: '' });
  const [materialSubmitting, setMaterialSubmitting] = useState(false);
  const [materialFormError, setMaterialFormError] = useState('');
  const [materialSuccess, setMaterialSuccess] = useState('');
  const [emailLoading, setEmailLoading] = useState({});
  const [emailStatus, setEmailStatus] = useState({}); // { [attachment]: { type: 'success'|'error', message: '' } }
  const [emailModal, setEmailModal] = useState({ show: false, doc: null, stage: 'confirm', message: '', subject: '', body: '', cc: '' });

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await customerAPI.getAll();
      setCustomers(res.data.data.customers || []);
    } catch {
      setError('Failed to load inquiries.');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMaterials = useCallback(async () => {
    if (deptName !== 'Store Dept') return;
    setMaterialLoading(true);
    setMaterialError('');
    try {
      const res = await materialAPI.getAll();
      setMaterials(res.data.data.materials || []);
    } catch {
      setMaterialError('Failed to load materials.');
    } finally {
      setMaterialLoading(false);
    }
  }, [deptName]);

  useEffect(() => {
    setActiveSection(deptName === 'Store Dept' ? 'material' : 'inquiry');
    setExpanded({});
    setForwardOpen({});
    setForwardDept({});
    setForwardComment({});
    setForwardFiles({});
    setForwardLoading({});
    load();
    loadMaterials();
  }, [deptName, load, loadMaterials]);

  // Auto-fill description for withdrawals
  useEffect(() => {
    if (materialDialog === 'withdraw' && materialForm.name && materialForm.materialType) {
      const match = materials.find(
        (mat) =>
          toCapital(mat.name) === toCapital(materialForm.name) &&
          toCapital(mat.materialType || mat.type) === toCapital(materialForm.materialType)
      );
      if (match && !materialForm.description) {
        setMaterialForm((prev) => ({ ...prev, description: match.description || '' }));
      }
    }
  }, [materialDialog, materialForm.name, materialForm.materialType, materials]);

  const openMaterialDialog = (mode) => {
    setMaterialDialog(mode);
    setMaterialForm({ name: '', materialType: '', description: '', quantity: '' });
    setMaterialFormError('');
    setMaterialSuccess('');
    setActiveMaterialSuggestion('');
  };

  const closeMaterialDialog = () => {
    setMaterialDialog('');
    setMaterialFormError('');
    setMaterialSuccess('');
    setActiveMaterialSuggestion('');
  };

  const closeMaterialSearch = () => {
    setMaterialSearchOpen(false);
    setMaterialSearchForm({ name: '', materialType: '' });
    setMaterialSearchResult(null);
    setMaterialSearchError('');
  };

  const openMaterialDetail = (material) => {
    setSelectedMaterial(material);
  };

  const closeMaterialDetail = () => {
    setSelectedMaterial(null);
  };

  const selectMaterialSuggestion = (field, value) => {
    setMaterialForm((prev) => ({ ...prev, [field]: value }));
    setActiveMaterialSuggestion('');
  };

  const getFilteredSuggestions = (options, value) => {
    const query = String(value || '').trim().toLowerCase();
    return options.filter((option) => option.toLowerCase().includes(query));
  };

  const handleMaterialChange = (e) => {
    setMaterialForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleMaterialSearchChange = (e) => {
    setMaterialSearchForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleMaterialSearch = (e) => {
    e.preventDefault();
    setMaterialSearchError('');

    const cleanName = materialSearchForm.name.trim() ? toCapital(materialSearchForm.name) : '';
    const cleanType = materialSearchForm.materialType.trim() ? toCapital(materialSearchForm.materialType) : '';

    if (!cleanName && !cleanType) {
      setMaterialSearchResult(null);
      setMaterialSearchError('Please enter a material name or type.');
      return;
    }

    const found = materials.filter((mat) => {
      const matName = toCapital(mat.name);
      const matType = toCapital(mat.materialType || mat.type);

      if (cleanName && cleanType) {
        return matName === cleanName && matType === cleanType;
      } else if (cleanName) {
        return matName === cleanName;
      } else {
        return matType === cleanType;
      }
    });

    if (found.length === 0) {
      setMaterialSearchResult(null);
      setMaterialSearchError('No matching material found.');
      return;
    }

    setMaterialSearchResult(found);
  };

  const handleMaterialSubmit = async (e) => {
    e.preventDefault();
    setMaterialFormError('');

    if (!materialForm.name.trim()) {
      setMaterialFormError('Material name is required.');
      return;
    }
    if (!materialForm.materialType.trim()) {
      setMaterialFormError('Type is required.');
      return;
    }
    if (!materialForm.quantity || Number(materialForm.quantity) <= 0) {
      setMaterialFormError('Quantity must be greater than 0.');
      return;
    }

    if (materialDialog === 'withdraw') {
      const match = materials.find(
        (mat) =>
          toCapital(mat.name) === toCapital(materialForm.name) &&
          toCapital(mat.materialType || mat.type) === toCapital(materialForm.materialType)
      );
      if (match && Number(materialForm.quantity) > match.quantity) {
        setMaterialFormError(`Insufficient stock. Only ${match.quantity} available.`);
        return;
      } else if (!match) {
        setMaterialFormError('Material not found in stock.');
        return;
      }
    }

    setMaterialSubmitting(true);
    try {
      const payload = {
        name: normalizeMaterialText(materialForm.name),
        materialType: normalizeMaterialText(materialForm.materialType),
        quantity: materialForm.quantity,
      };

      if (materialDialog === 'add') {
        payload.description = materialForm.description;
      }

      if (materialDialog === 'add') {
        await materialAPI.add(payload);
      } else if (materialDialog === 'withdraw') {
        await materialAPI.withdraw(payload);
      }

      await loadMaterials();
      closeMaterialDialog();
    } catch (err) {
      setMaterialFormError(err.response?.data?.message || 'Failed to save material.');
    } finally {
      setMaterialSubmitting(false);
    }
  };

  const handleMaterialApprove = async () => {
    setMaterialFormError('');
    setMaterialSuccess('');

    if (!materialForm.name.trim()) {
      setMaterialFormError('Material name is required.');
      return;
    }
    if (!materialForm.materialType.trim()) {
      setMaterialFormError('Type is required.');
      return;
    }
    if (!materialForm.quantity || Number(materialForm.quantity) <= 0) {
      setMaterialFormError('Quantity must be greater than 0.');
      return;
    }

    if (materialDialog === 'withdraw') {
      const match = materials.find(
        (mat) =>
          toCapital(mat.name) === toCapital(materialForm.name) &&
          toCapital(mat.materialType || mat.type) === toCapital(materialForm.materialType)
      );
      if (match && Number(materialForm.quantity) > match.quantity) {
        setMaterialFormError(`Insufficient stock. Only ${match.quantity} available.`);
        return;
      } else if (!match) {
        setMaterialFormError('Material not found in stock.');
        return;
      }
    }

    setMaterialSubmitting(true);
    try {
      console.log('Sending material approval request...', materialForm);
      const formData = new FormData();
      const actionType = materialDialog === 'add' ? 'Addition' : 'Withdrawal';
      formData.append('title', `Material ${actionType}: ${materialForm.name}`);
      formData.append('type', 'for approval material request');
      formData.append('description', materialForm.description || `Request for material ${actionType.toLowerCase()}.`);
      formData.append('requestedBy', admin?.name || admin?.username || 'Store Dept User');
      formData.append('department', deptName);
      formData.append('materialData', JSON.stringify({
        name: materialForm.name,
        materialType: materialForm.materialType,
        quantity: materialDialog === 'add' ? Number(materialForm.quantity) : -Number(materialForm.quantity),
        description: materialForm.description
      }));
      
      const res = await approvalAPI.create(formData);
      console.log('Approval response:', res.data);
      
      setMaterialSuccess('Approval request sent successfully!');
      
      // Reset form
      setMaterialForm({ name: '', materialType: '', description: '', quantity: '' });
      
      setTimeout(() => {
        closeMaterialDialog();
      }, 3000);
    } catch (err) {
      console.error('Error sending approval:', err);
      setMaterialFormError(err.response?.data?.message || 'Failed to send approval request.');
    } finally {
      setMaterialSubmitting(false);
    }
  };

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

  const toCapital = (value) =>
    String(value || '')
      .trim()
      .replace(/\s+/g, ' ')
      .toUpperCase();

  const normalizeMaterialText = (value) => toCapital(value);
  const getMaterialTypeLabel = (material) => toCapital(material?.materialType || material?.type);

  const inquiries = customers.filter((c) =>
    c.forwardedTo === deptName ||
    (c.department === deptName && !c.forwardedTo)
  );

  const sharedDocs = customers.flatMap((customer) =>
    (customer.documentShares || [])
      .filter((share) => share.toDept === deptName)
      .map((share) => ({ ...share, customer }))
  );

  const quotationDocs = sharedDocs.filter((doc) => doc.type === 'quotation');
  const proformaDocs = sharedDocs.filter((doc) => doc.type === 'proforma');
  const inquiryCount = inquiries.length;
  const quotationCount = quotationDocs.length;
  const proformaCount = proformaDocs.length;
  const materialCount = materials.length;
  const materialNameOptions = Array.from(
    new Map(
      materials
        .filter((mat) => !materialForm.materialType || (mat.materialType || '').trim().toLowerCase() === materialForm.materialType.trim().toLowerCase())
        .map((mat) => (mat.name || '').trim())
        .filter(Boolean)
        .map((name) => [name.toLowerCase(), name])
    ).values()
  ).sort((a, b) => a.localeCompare(b));
  const materialTypeOptions = Array.from(
    new Map(
      materials
        .filter((mat) => !materialForm.name || (mat.name || '').trim().toLowerCase() === materialForm.name.trim().toLowerCase())
        .map((mat) => (mat.materialType || '').trim())
        .filter(Boolean)
        .map((type) => [type.toLowerCase(), type])
    ).values()
  ).sort((a, b) => a.localeCompare(b));

  const handleSendEmail = (doc) => {
     if (!doc.customer?._id || !doc.attachment) return;
     const docLabel = doc.type === 'quotation' ? 'Quotation' : 'Proforma Invoice';
     setEmailModal({
       show: true,
       doc,
       stage: 'confirm',
       message: `Send ${docLabel} to ${doc.customer.email}?`,
        subject: `${docLabel} from KUSCO - ${doc.customer.inquiryNo || ''}`,
        body: `Dear ${doc.customer.name},\n\nPlease find attached the ${docLabel} for your inquiry.\n\nBest regards,\nKUSCO Team`,
        cc: ''
      });
   };
 
   const executeSendEmail = async () => {
        // Access state directly to avoid any closure issues
        const currentModal = emailModal;
        const { doc, subject, body, cc } = currentModal;
        
        if (!doc) {
          console.error('No document selected in email modal');
          return;
        }
     
        console.log('Attempting to send email with:', { 
          to: doc.customer?.email,
          cc: cc,
          subject: subject,
          messageLength: body?.length 
        });

        setEmailModal(prev => ({ ...prev, stage: 'sending', message: 'Sending email...' }));
       
       try {
         const response = await customerAPI.sendDocumentEmail(doc.customer._id, {
           filename: doc.attachment,
           type: doc.type,
           subject: subject,
           message: body,
           cc: cc
         });
        
        console.log('Email API Response:', response.data);

        setEmailModal(prev => ({ 
          ...prev, 
          stage: 'success', 
          message: 'Email sent successfully with PDF attachment!' 
        }));
      } catch (err) {
        console.error('Detailed Email Error:', err.response?.data || err.message);
        setEmailModal(prev => ({ 
          ...prev, 
          stage: 'error', 
          message: err.response?.data?.message || 'Failed to send email. Please try again.' 
        }));
      }
    };

  const renderDocumentList = (docs, emptyLabel) => {
    if (docs.length === 0) {
      return <div className="empty-state"><p>{emptyLabel}</p></div>;
    }

    return (
      <div className="dept-doc-list">
        {docs.map((doc, index) => (
          <div key={`${doc.attachment}-${index}`} className="dept-doc-card">
            <div className="dept-doc-card-head">
              <div>
                <div className="dept-doc-card-title">
                  <MdPictureAsPdf /> {getOriginalName(doc.attachment || 'document.pdf')}
                </div>
                <div className="dept-doc-card-subtitle">
                  {doc.customer?.company || doc.customer?.name || 'Unknown customer'}
                  {doc.customer?.inquiryNo ? ` • ${doc.customer.inquiryNo}` : ''}
                </div>
              </div>
              <div className="dept-doc-card-meta">
                <span>Shared by {doc.sharedBy || 'Unknown'}</span>
                {doc.createdAt && <span>{formatDate(doc.createdAt)}</span>}
              </div>
            </div>
            {doc.comment && <p className="dept-doc-comment">{doc.comment}</p>}
            
            <div className="dept-doc-actions">
              <a
                href={`${BASE_URL}/uploads/${doc.attachment}`}
                target="_blank"
                rel="noreferrer"
                className="dept-doc-link"
              >
                Open PDF
              </a>
              <button
                type="button"
                className="dept-doc-download"
                onClick={() => handleDownload(doc.attachment)}
              >
                <MdDownload /> Download
              </button>
              {deptName === 'Sales Dept' && doc.customer?.email && (
                <button
                  type="button"
                  className="dept-doc-link"
                  style={{ 
                    background: '#10b981', 
                    color: 'white', 
                    border: 'none', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '6px',
                  }}
                  onClick={() => handleSendEmail(doc)}
                >
                  <MdEmail /> Email
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="page-container">
      <div className="dept-detail-header">
        <button className="dept-detail-back-btn" onClick={() => navigate(ROUTES.ADMIN_DEPARTMENT)}>
          <MdArrowBack className="dept-detail-back-icon" />
          <span>Back</span>
        </button>
        <div className="dept-detail-title-wrap">
          <h2 className="page-title dept-detail-title">{deptName}</h2>
        </div>
      </div>

      <div className="dept-section-tabs" aria-label={`${deptName} sections`}>
        {deptName === 'Store Dept' ? (
          <button
            type="button"
            className={`dept-section-tab${activeSection === 'material' ? ' dept-section-tab--active' : ''}`}
            onClick={() => setActiveSection('material')}
          >
            <span>Material</span>
            <span className="dept-section-tab-count">{materialCount}</span>
          </button>
        ) : (
          <>
            <button
              type="button"
              className={`dept-section-tab${activeSection === 'inquiry' ? ' dept-section-tab--active' : ''}`}
              onClick={() => setActiveSection('inquiry')}
            >
              <span>Inquiry</span>
              <span className="dept-section-tab-count">{inquiryCount}</span>
            </button>
            {deptName !== 'Sales Coordinator' && (
              <button
                type="button"
                className={`dept-section-tab${activeSection === 'quotation' ? ' dept-section-tab--active' : ''}`}
                onClick={() => setActiveSection('quotation')}
              >
                <span>Quotation PDF</span>
                <span className="dept-section-tab-count">{quotationCount}</span>
              </button>
            )}
            {deptName !== 'Sales Coordinator' && (
              <button
                type="button"
                className={`dept-section-tab${activeSection === 'proforma' ? ' dept-section-tab--active' : ''}`}
                onClick={() => setActiveSection('proforma')}
              >
                <span>Performa PDF</span>
                <span className="dept-section-tab-count">{proformaCount}</span>
              </button>
            )}
          </>
        )}
      </div>

      {loading && <p className="dept-inq-loading">Loading inquiries...</p>}
      {error   && <p className="dept-inq-error">{error}</p>}

      {!loading && !error && activeSection === 'inquiry' && inquiries.length === 0 && (
        <div className="empty-state"><p>No inquiries found for {deptName}.</p></div>
      )}

      {!loading && !error && activeSection === 'quotation' && renderDocumentList(
        quotationDocs,
        `No quotation PDFs found for ${deptName}.`
      )}

      {!loading && !error && activeSection === 'proforma' && renderDocumentList(
        proformaDocs,
        `No proforma PDFs found for ${deptName}.`
      )}

      {!loading && !error && activeSection === 'material' && (
        <>
          <div className="material-action-row">
            <button type="button" className="inq-material-btn" onClick={() => openMaterialDialog('add')}>
              Add Material
            </button>
            <button type="button" className="inq-material-btn inq-material-btn--withdraw" onClick={() => openMaterialDialog('withdraw')}>
              Withdraw Material
            </button>
            <button type="button" className="inq-material-btn inq-material-btn--search" onClick={() => setMaterialSearchOpen((p) => !p)}>
              <MdSearch />
              Search Material
            </button>
          </div>

          {materialSearchOpen && (
            <div className="modal-overlay" onClick={closeMaterialSearch}>
              <div className="modal material-search-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h3>Search Material</h3>
                  <button className="modal-close-btn" onClick={closeMaterialSearch}>
                    <MdClose />
                  </button>
                </div>
                <form className="modal-form" onSubmit={handleMaterialSearch}>
                  <p className="material-search-help">Enter the material name, type, or both to find items in stock.</p>
                  <div className="material-search-fields">
                    <div className="form-group">
                      <label>Material Name</label>
                      <input
                        type="text"
                        name="name"
                        value={materialSearchForm.name}
                        onChange={handleMaterialSearchChange}
                        placeholder="Enter material name"
                        autoComplete="off"
                      />
                    </div>
                    <div className="form-group">
                      <label>Type</label>
                      <input
                        type="text"
                        name="materialType"
                        value={materialSearchForm.materialType}
                        onChange={handleMaterialSearchChange}
                        placeholder="Enter type"
                        autoComplete="off"
                      />
                    </div>
                  </div>
                  <div className="material-search-actions">
                    <button type="button" className="btn-cancel" onClick={closeMaterialSearch}>Clear</button>
                    <button type="submit" className="btn-submit">Search</button>
                  </div>

                  {materialSearchError && <p className="modal-error">{materialSearchError}</p>}

                  {materialSearchResult && (
                    <div className="material-search-results">
                      <p className="search-results-count">Found {materialSearchResult.length} matching items:</p>
                      <div className="material-stock-grid search-results-grid">
                        {materialSearchResult.map((mat) => (
                          <button
                            key={mat._id}
                            type="button"
                            className="material-stock-card"
                            onClick={() => openMaterialDetail(mat)}
                          >
                            <div className="material-stock-card-head">
                              <h3>{toCapital(mat.name)}</h3>
                              <strong>{mat.quantity}</strong>
                            </div>
                            {(mat.materialType || mat.type) && (
                              <p>Type: {getMaterialTypeLabel(mat)}</p>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </form>
              </div>
            </div>
          )}

          {materialLoading && <p className="dept-inq-loading">Loading materials...</p>}
          {materialError && <p className="dept-inq-error">{materialError}</p>}

          {!materialLoading && !materialError && (
            <div className="material-stock-grid">
              {materials.length > 0 ? materials.map((mat) => (
        <button
          key={mat._id}
          type="button"
          className="material-stock-card"
          onClick={() => openMaterialDetail(mat)}
        >
                <div className="material-stock-card-head">
                  <h3>{toCapital(mat.name)}</h3>
                  <strong>{mat.quantity}</strong>
                </div>
                  {(mat.materialType || mat.type) && <p>Type: {getMaterialTypeLabel(mat)}</p>}
                </button>
              )) : (
                <div className="empty-state"><p>No materials found.</p></div>
              )}
            </div>
          )}
        </>
      )}

      {materialDialog && (
        <div className="modal-overlay" onClick={closeMaterialDialog}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{materialDialog === 'add' ? 'Add Material' : 'Withdraw Material'}</h3>
              <button className="modal-close-btn" onClick={closeMaterialDialog}><MdClose /></button>
            </div>
            <form className="modal-form" onSubmit={handleMaterialSubmit}>
              {materialFormError && <p className="modal-error">{materialFormError}</p>}
              {materialSuccess && <p className="modal-success">{materialSuccess}</p>}
              <div className="form-group">
                <label>Material Name <span className="required">*</span></label>
                <div className="material-suggest-wrap">
                  <input
                    type="text"
                    name="name"
                    value={materialForm.name}
                    onChange={handleMaterialChange}
                    onFocus={() => setActiveMaterialSuggestion('name')}
                    onBlur={() => setTimeout(() => setActiveMaterialSuggestion((current) => (current === 'name' ? '' : current)), 120)}
                    placeholder="Enter material name"
                    autoComplete="off"
                  />
                  {activeMaterialSuggestion === 'name' && getFilteredSuggestions(materialNameOptions, materialForm.name).length > 0 && (
                    <div className="material-suggest-list" role="listbox" aria-label="Material name suggestions">
                      {getFilteredSuggestions(materialNameOptions, materialForm.name).map((name) => (
                        <button
                          key={name}
                          type="button"
                          className="material-suggest-item"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => selectMaterialSuggestion('name', toCapital(name))}
                        >
                          {toCapital(name)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="form-group">
                <label>Type <span className="required">*</span></label>
                <div className="material-suggest-wrap">
                  <input
                    type="text"
                    name="materialType"
                    value={materialForm.materialType}
                    onChange={handleMaterialChange}
                    onFocus={() => setActiveMaterialSuggestion('materialType')}
                    onBlur={() => setTimeout(() => setActiveMaterialSuggestion((current) => (current === 'materialType' ? '' : current)), 120)}
                    placeholder="Enter type"
                    autoComplete="off"
                  />
                  {activeMaterialSuggestion === 'materialType' && getFilteredSuggestions(materialTypeOptions, materialForm.materialType).length > 0 && (
                    <div className="material-suggest-list" role="listbox" aria-label="Material type suggestions">
                      {getFilteredSuggestions(materialTypeOptions, materialForm.materialType).map((type) => (
                        <button
                          key={type}
                          type="button"
                          className="material-suggest-item"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => selectMaterialSuggestion('materialType', toCapital(type))}
                        >
                          {toCapital(type)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <input
                  type="text"
                  name="description"
                  value={materialForm.description}
                  onChange={handleMaterialChange}
                  placeholder="Enter description"
                />
              </div>
              <div className="form-group">
                <label>Quantity <span className="required">*</span></label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  name="quantity"
                  value={materialForm.quantity}
                  onChange={handleMaterialChange}
                  placeholder="Enter quantity"
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={closeMaterialDialog}>Cancel</button>
                <button type="button" className="btn-approve-material" onClick={handleMaterialApprove} disabled={materialSubmitting}>
                  <MdCheckCircle /> Approve
                </button>
                <button type="button" className="btn-print-material">
                  <MdPrint /> Print
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedMaterial && (
        <div className="modal-overlay" onClick={closeMaterialDetail}>
          <div className="modal material-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Material Details</h3>
              <button className="modal-close-btn" onClick={closeMaterialDetail}><MdClose /></button>
            </div>
            <div className="material-detail-body">
              <div className="material-detail-summary">
                <div>
                  <p className="material-detail-label">Material Name</p>
                  <h4>{toCapital(selectedMaterial.name)}</h4>
                </div>
                <div className="material-detail-quantity">
                  <span>{selectedMaterial.quantity}</span>
                  <small>In Stock</small>
                </div>
              </div>

              <div className="material-detail-grid">
                <div className="material-detail-item">
                  <span>Type</span>
                  <strong>{(selectedMaterial.materialType || selectedMaterial.type) ? getMaterialTypeLabel(selectedMaterial) : '—'}</strong>
                </div>
                <div className="material-detail-item">
                  <span>Created</span>
                  <strong>{selectedMaterial.createdAt ? formatDate(selectedMaterial.createdAt) : '—'}</strong>
                </div>
                <div className="material-detail-item">
                  <span>Updated</span>
                  <strong>{selectedMaterial.updatedAt ? formatDate(selectedMaterial.updatedAt) : '—'}</strong>
                </div>
                <div className="material-detail-item material-detail-item--full">
                  <span>Description</span>
                  <strong>{selectedMaterial.description || 'No description provided.'}</strong>
                </div>
              </div>

              <div className="material-detail-history">
                <h4>Transaction History</h4>
                {selectedMaterial.transactions?.length > 0 ? (
                  <div className="material-detail-history-list">
                    {[...selectedMaterial.transactions].reverse().map((tx, index) => (
                      <div key={`${tx.createdAt || index}-${index}`} className="material-detail-history-item">
                        <div>
                          <strong>{tx.type === 'add' ? 'Added' : 'Withdrawn'}</strong>
                          <span>{tx.quantity}</span>
                        </div>
                        <small>{tx.createdAt ? formatTime(tx.createdAt) : 'Unknown time'}</small>
                        {tx.description && <p>{tx.description}</p>}
                        {tx.performedBy && <p className="material-detail-performed-by">By {tx.performedBy}</p>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="material-detail-empty">No transactions found.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {!loading && !error && activeSection === 'inquiry' && inquiries.length > 0 && (
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
                      {(deptName === 'Sales Coordinator' || deptName === 'Sales Dept') && (
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
                          <button
                            className="inq-material-btn"
                            onClick={() => window.location.href = `mailto:${inq.email}?subject=Inquiry Update&body=Dear ${inq.name},`}
                            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                          >
                            <MdEmail /> Email
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
      {emailModal.show && (
        <div className="modal-overlay" onClick={() => !['sending'].includes(emailModal.stage) && setEmailModal({ show: false, doc: null, stage: 'confirm', message: '', subject: '', body: '', cc: '' })}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px', width: '90%' }}>
            <div className="modal-header">
              <h3>Email Document</h3>
              {emailModal.stage !== 'sending' && (
                <button className="modal-close-btn" onClick={() => setEmailModal({ show: false, doc: null, stage: 'confirm', message: '' })}>
                  <MdClose />
                </button>
              )}
            </div>
            <div className="modal-form" style={{ padding: '20px' }}>
              {emailModal.stage === 'success' && (
                <div className="modal-success" style={{ marginBottom: '20px' }}>
                  <MdCheckCircle /> {emailModal.message}
                </div>
              )}
              {emailModal.stage === 'error' && (
                <div className="modal-error" style={{ marginBottom: '20px' }}>
                  <MdClose /> {emailModal.message}
                </div>
              )}
              
              {emailModal.stage === 'confirm' && (
                 <>
                   <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '16px' }}>
                     {emailModal.message}
                   </p>
                   <div className="form-group" style={{ marginBottom: '16px' }}>
                     <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                       CC (Optional)
                     </label>
                     <input
                       type="text"
                       value={emailModal.cc}
                       onChange={(e) => setEmailModal(prev => ({ ...prev, cc: e.target.value }))}
                       placeholder="e.g. manager@example.com, sales@example.com"
                       style={{ 
                         width: '100%', 
                         padding: '10px', 
                         borderRadius: '8px', 
                         border: '1px solid #d1d5db',
                         fontSize: '14px'
                       }}
                     />
                   </div>
                   <div className="form-group" style={{ marginBottom: '16px' }}>
                     <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                       Subject
                     </label>
                     <input
                       type="text"
                       value={emailModal.subject}
                       onChange={(e) => setEmailModal(prev => ({ ...prev, subject: e.target.value }))}
                       style={{ 
                         width: '100%', 
                         padding: '10px', 
                         borderRadius: '8px', 
                         border: '1px solid #d1d5db',
                         fontSize: '14px'
                       }}
                     />
                   </div>
                   <div className="form-group" style={{ marginBottom: '24px' }}>
                     <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                       Message Body
                     </label>
                     <textarea
                       value={emailModal.body}
                       onChange={(e) => setEmailModal(prev => ({ ...prev, body: e.target.value }))}
                       rows={6}
                       style={{ 
                         width: '100%', 
                         padding: '10px', 
                         borderRadius: '8px', 
                         border: '1px solid #d1d5db',
                         fontSize: '14px',
                         resize: 'vertical',
                         lineHeight: '1.5'
                       }}
                     />
                   </div>
                 </>
               )}

              {emailModal.stage === 'sending' && (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <div className="dept-inq-loading" style={{ margin: '0 0 10px' }}>Sending...</div>
                  <p>{emailModal.message}</p>
                </div>
              )}

              <div className="modal-actions">
                {emailModal.stage === 'confirm' && (
                  <>
                    <button type="button" className="btn-cancel" onClick={() => setEmailModal({ show: false, doc: null, stage: 'confirm', message: '' })}>
                      Cancel
                    </button>
                    <button type="button" className="btn-approve-material" onClick={executeSendEmail}>
                      Send Email
                    </button>
                  </>
                )}
                {(emailModal.stage === 'success' || emailModal.stage === 'error') && (
                  <button type="button" className="btn-submit" onClick={() => setEmailModal({ show: false, doc: null, stage: 'confirm', message: '' })}>
                    Close
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentDetailPage;
