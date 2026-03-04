import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdAttachFile, MdClose, MdCheckCircle } from 'react-icons/md';
import { customerAPI } from '../services/adminAPI';
import '../styles/Inquiry.css';

const InquiryPage = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    company: '',
    name: '',
    phone: '',
    email: '',
    address: '',
    equipmentName: '',
    make: '',
    modelNo: '',
    liquid: '',
    temperature: '',
    pressure: '',
    description: '',
  });
  const [attachments, setAttachments] = useState([]);
  const [error, setError]           = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess]       = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    if (!newFiles.length) return;
    setAttachments((prev) => [...prev, ...newFiles]);
    e.target.value = '';
  };
  const removeFile = (idx) => {
    setAttachments((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name) { setError('Name is required.'); return; }

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    attachments.forEach(f => fd.append('attachments', f));

    try {
      setSubmitting(true);
      await customerAPI.submitInquiry(fd);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit inquiry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="inq-page">
        <div className="inq-success">
          <MdCheckCircle className="inq-success-icon" />
          <h2>Inquiry Submitted!</h2>
          <p>Thank you for reaching out. We will get back to you shortly.</p>
          <button className="inq-btn-back" onClick={() => navigate('/')}>Back to Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="inq-page">
      <div className="inq-container">
        <div className="inq-header">
          <h2>Submit an Inquiry</h2>
          <p>Fill in the form below and we'll get back to you as soon as possible.</p>
        </div>

        <form className="inq-form" onSubmit={handleSubmit}>
          {error && <p className="inq-error">{error}</p>}

          <div className="inq-section-title">Contact Details</div>
          <div className="inq-grid">
            <div className="inq-group">
              <label>Company Name</label>
              <input type="text" name="company" placeholder="Enter company name" value={form.company} onChange={handleChange} />
            </div>
            <div className="inq-group">
              <label>Name <span className="inq-required">*</span></label>
              <input type="text" name="name" placeholder="Enter your name" value={form.name} onChange={handleChange} />
            </div>
            <div className="inq-group">
              <label>Phone No</label>
              <input type="text" name="phone" placeholder="Enter phone number" value={form.phone} onChange={handleChange} />
            </div>
            <div className="inq-group">
              <label>Email</label>
              <input type="email" name="email" placeholder="Enter email address" value={form.email} onChange={handleChange} />
            </div>
            <div className="inq-group inq-full">
              <label>Address</label>
              <input type="text" name="address" placeholder="Enter address" value={form.address} onChange={handleChange} />
            </div>
          </div>

          <div className="inq-section-title">Equipment Details</div>
          <div className="inq-grid">
            <div className="inq-group">
              <label>Equipment Name</label>
              <input type="text" name="equipmentName" placeholder="Enter equipment name" value={form.equipmentName} onChange={handleChange} />
            </div>
            <div className="inq-group">
              <label>Make</label>
              <input type="text" name="make" placeholder="Enter make" value={form.make} onChange={handleChange} />
            </div>
            <div className="inq-group">
              <label>Model No</label>
              <input type="text" name="modelNo" placeholder="Enter model number" value={form.modelNo} onChange={handleChange} />
            </div>
            <div className="inq-group">
              <label>Liquid</label>
              <input type="text" name="liquid" placeholder="Enter liquid type" value={form.liquid} onChange={handleChange} />
            </div>
            <div className="inq-group">
              <label>Temperature</label>
              <input type="text" name="temperature" placeholder="e.g. 80°C" value={form.temperature} onChange={handleChange} />
            </div>
            <div className="inq-group">
              <label>Pressure</label>
              <input type="text" name="pressure" placeholder="e.g. 10 bar" value={form.pressure} onChange={handleChange} />
            </div>
            <div className="inq-group inq-full">
              <label>Description</label>
              <textarea name="description" placeholder="Describe your requirements..." rows={4} value={form.description} onChange={handleChange} />
            </div>
            <div className="inq-group inq-full">
              <label>Attachments</label>
              <div className="inq-file-area">
                <label className="inq-file-label" htmlFor="inq-attachment">
                  <MdAttachFile />
                  Click to upload files (max 10MB each)
                </label>
                <input id="inq-attachment" type="file" multiple onChange={handleFileChange} style={{ display: 'none' }} />
              </div>
              {attachments.length > 0 && (
                <div className="inq-file-list">
                  {attachments.map((f, i) => (
                    <div key={i} className="inq-file-item">
                      <span>{f.name}</span>
                      <button type="button" className="inq-file-remove" onClick={() => removeFile(i)}>
                        <MdClose />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="inq-actions">
            <button type="button" className="inq-btn-cancel" onClick={() => navigate('/')}>Cancel</button>
            <button type="submit" className="inq-btn-submit" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Inquiry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InquiryPage;
