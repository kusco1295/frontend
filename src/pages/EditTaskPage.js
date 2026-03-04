import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MdArrowBack, MdAttachFile, MdClose } from 'react-icons/md';
import { taskAPI, customerAPI, adminAPI } from '../services/adminAPI';
import { ROUTES } from '../constants/endpoints';
import '../styles/CreateTask.css';

const STATUS_OPTIONS = ['pending', 'ordered', 'in progress', 'delivered', 'finished'];

const EditTaskPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    taskName: '',
    description: '',
    requirement: '',
    status: 'pending',
    customer: '',
    members: [],
  });
  const [attachment, setAttachment] = useState(null);
  const [customers, setCustomers]   = useState([]);
  const [allMembers, setAllMembers] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [tasksRes, custRes, memRes] = await Promise.all([
          taskAPI.getAll(),
          customerAPI.getAll(),
          adminAPI.getAllMembers(),
        ]);
        const task = tasksRes.data.data.tasks.find((t) => t._id === id);
        if (!task) { setError('Task not found.'); return; }

        setForm({
          taskName:    task.taskName,
          description: task.description  || '',
          requirement: task.requirement  || '',
          status:      task.status,
          customer:    task.customer?._id || '',
          members:     task.members?.map((m) => m._id) || [],
        });
        setCustomers(custRes.data.data.customers);
        setAllMembers(memRes.data.data.admins);
      } catch {
        setError('Failed to load task data.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const toggleMember = (mid) =>
    setForm((prev) => ({
      ...prev,
      members: prev.members.includes(mid)
        ? prev.members.filter((m) => m !== mid)
        : [...prev.members, mid],
    }));

  const handleFileChange = (e) => setAttachment(e.target.files[0] || null);
  const removeFile = () => {
    setAttachment(null);
    document.getElementById('attachment-input').value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.taskName) { setError('Subject is required.'); return; }
    try {
      setSubmitting(true);
      await taskAPI.update(id, {
        ...form,
        members: JSON.stringify(form.members),
      });
      navigate(ROUTES.ADMIN_TASKS);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update task.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="page-container"><p>Loading...</p></div>;

  return (
    <div className="page-container">
      <div className="create-task-header">
        <button className="btn-back" onClick={() => navigate(ROUTES.ADMIN_TASKS)}>
          <MdArrowBack /> Back
        </button>
        <div>
          <h2 className="page-title">Edit Task</h2>
          <p className="page-subtitle">Update the task details below.</p>
        </div>
      </div>

      <form className="create-task-form" onSubmit={handleSubmit}>
        {error && <p className="form-error">{error}</p>}

        <div className="form-grid">
          <div className="form-group full-width">
            <label>Subject <span className="required">*</span></label>
            <input type="text" name="taskName" placeholder="Enter subject"
              value={form.taskName} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Customer</label>
            <select name="customer" value={form.customer} onChange={handleChange}>
              <option value="">— Select customer —</option>
              {customers.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Status</label>
            <select name="status" value={form.status} onChange={handleChange}>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </div>

          <div className="form-group full-width">
            <label>Description</label>
            <textarea name="description" placeholder="Enter task description"
              value={form.description} onChange={handleChange} rows={3} />
          </div>

          <div className="form-group full-width">
            <label>Requirement</label>
            <textarea name="requirement" placeholder="Enter task requirements"
              value={form.requirement} onChange={handleChange} rows={3} />
          </div>

          <div className="form-group full-width">
            <label>Attachment</label>
            <div className="file-upload-area">
              <label className="file-upload-label" htmlFor="attachment-input">
                <MdAttachFile />
                {attachment ? attachment.name : 'Click to upload new file (max 10MB)'}
              </label>
              <input id="attachment-input" type="file"
                onChange={handleFileChange} style={{ display: 'none' }} />
              {attachment && (
                <button type="button" className="file-remove-btn" onClick={removeFile}>
                  <MdClose />
                </button>
              )}
            </div>
          </div>

          <div className="form-group full-width">
            <label>Assign Members</label>
            {allMembers.length === 0 ? (
              <p className="field-hint">No members found.</p>
            ) : (
              <div className="members-select-grid">
                {allMembers.map((m) => {
                  const selected = form.members.includes(m.id);
                  return (
                    <div key={m.id}
                      className={`member-chip ${selected ? 'member-chip--selected' : ''}`}
                      onClick={() => toggleMember(m.id)}
                    >
                      <span className="chip-avatar">{m.name.charAt(0).toUpperCase()}</span>
                      <div className="chip-info">
                        <span className="chip-name">{m.name}</span>
                        <span className="chip-role">{m.role}</span>
                      </div>
                      {selected && <span className="chip-check">✓</span>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn-cancel" onClick={() => navigate(ROUTES.ADMIN_TASKS)}>
            Cancel
          </button>
          <button type="submit" className="btn-submit" disabled={submitting}>
            {submitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditTaskPage;
