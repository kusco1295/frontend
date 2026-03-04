import React, { useState, useEffect } from 'react';
import { MdPersonAdd, MdClose, MdEdit, MdDelete } from 'react-icons/md';
import { customerAPI } from '../services/adminAPI';
import '../styles/Customer.css';

const defaultForm = { name: '', email: '', phone: '', company: '', address: '' };

const FormFields = ({ form, onChange }) => (
  <>
    <div className="form-group">
      <label>Full Name <span className="required">*</span></label>
      <input type="text" name="name" placeholder="Enter full name" value={form.name} onChange={onChange} />
    </div>
    <div className="form-group">
      <label>Company</label>
      <input type="text" name="company" placeholder="Enter company name" value={form.company} onChange={onChange} />
    </div>
    <div className="form-group">
      <label>Address</label>
      <input type="text" name="address" placeholder="Enter address" value={form.address} onChange={onChange} />
    </div>
    <div className="form-group">
      <label>Email</label>
      <input type="email" name="email" placeholder="Enter email address" value={form.email} onChange={onChange} />
    </div>
    <div className="form-group">
      <label>Phone</label>
      <input type="text" name="phone" placeholder="Enter phone number" value={form.phone} onChange={onChange} />
    </div>
  </>
);

const CustomerPage = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');

  const [addOpen, setAddOpen]           = useState(false);
  const [addForm, setAddForm]           = useState(defaultForm);
  const [addError, setAddError]         = useState('');
  const [addSubmitting, setAddSubmitting] = useState(false);

  const [editOpen, setEditOpen]           = useState(false);
  const [editTarget, setEditTarget]       = useState(null);
  const [editForm, setEditForm]           = useState(defaultForm);
  const [editError, setEditError]         = useState('');
  const [editSubmitting, setEditSubmitting] = useState(false);

  const [deleteTarget, setDeleteTarget]       = useState(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await customerAPI.getAll();
      setCustomers(res.data.data.customers);
    } catch {
      setError('Failed to load customers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCustomers(); }, []);

  const openAdd  = () => { setAddForm(defaultForm); setAddError(''); setAddOpen(true); };
  const closeAdd = () => { setAddOpen(false); setAddError(''); };
  const handleAddChange  = (e) => setAddForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  const handleAddSubmit  = async (e) => {
    e.preventDefault(); setAddError('');
    if (!addForm.name) { setAddError('Customer name is required.'); return; }
    try {
      setAddSubmitting(true);
      await customerAPI.create(addForm);
      closeAdd(); fetchCustomers();
    } catch (err) {
      setAddError(err.response?.data?.message || 'Failed to add customer.');
    } finally { setAddSubmitting(false); }
  };

  const openEdit  = (c) => {
    setEditTarget(c);
    setEditForm({ name: c.name, email: c.email || '', phone: c.phone || '', company: c.company || '', address: c.address || '' });
    setEditError(''); setEditOpen(true);
  };
  const closeEdit = () => { setEditOpen(false); setEditError(''); setEditTarget(null); };
  const handleEditChange  = (e) => setEditForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  const handleEditSubmit  = async (e) => {
    e.preventDefault(); setEditError('');
    if (!editForm.name) { setEditError('Customer name is required.'); return; }
    try {
      setEditSubmitting(true);
      await customerAPI.update(editTarget._id, editForm);
      closeEdit(); fetchCustomers();
    } catch (err) {
      setEditError(err.response?.data?.message || 'Failed to update customer.');
    } finally { setEditSubmitting(false); }
  };

  const handleDelete = async () => {
    try {
      setDeleteSubmitting(true);
      await customerAPI.delete(deleteTarget._id);
      setDeleteTarget(null); fetchCustomers();
    } catch { setDeleteTarget(null); }
    finally { setDeleteSubmitting(false); }
  };

  return (
    <div className="page-container">
      <div className="customer-header">
        <div>
          <h2 className="page-title">Customers</h2>
          <p className="page-subtitle">{customers.length} customer{customers.length !== 1 ? 's' : ''} in total</p>
        </div>
        <button className="btn-add-customer" onClick={openAdd}>
          <MdPersonAdd /> Add Customer
        </button>
      </div>

      {loading && <p className="customer-loading">Loading customers...</p>}
      {error   && <p className="customer-error">{error}</p>}

      {!loading && !error && customers.length === 0 && (
        <div className="empty-state"><p>No customers found. Add your first customer to get started.</p></div>
      )}

      {!loading && customers.length > 0 && (
        <div className="table-wrapper">
          <table className="customer-table">
            <thead>
              <tr>
                <th>Company Name</th>
                <th>Name</th>
                <th>Address</th>
                <th>Phone No</th>
                <th>Email</th>
                <th>Edit</th>
                <th>Delete</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c._id}>
                  <td><span className="td-company">{c.company || '—'}</span></td>
                  <td>{c.name}</td>
                  <td>{c.address || '—'}</td>
                  <td>{c.phone   || '—'}</td>
                  <td>{c.email   || '—'}</td>
                  <td>
                    <button className="btn-tbl-edit" onClick={() => openEdit(c)} title="Edit">
                      <MdEdit />
                    </button>
                  </td>
                  <td>
                    <button className="btn-tbl-delete" onClick={() => setDeleteTarget(c)} title="Delete">
                      <MdDelete />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Modal */}
      {addOpen && (
        <div className="modal-overlay" onClick={closeAdd}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add Customer</h3>
              <button className="modal-close-btn" onClick={closeAdd}><MdClose /></button>
            </div>
            <form className="modal-form" onSubmit={handleAddSubmit}>
              {addError && <p className="modal-error">{addError}</p>}
              <FormFields form={addForm} onChange={handleAddChange} />
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={closeAdd}>Cancel</button>
                <button type="submit" className="btn-submit" disabled={addSubmitting}>
                  {addSubmitting ? 'Adding...' : 'Add Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editOpen && (
        <div className="modal-overlay" onClick={closeEdit}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Customer</h3>
              <button className="modal-close-btn" onClick={closeEdit}><MdClose /></button>
            </div>
            <form className="modal-form" onSubmit={handleEditSubmit}>
              {editError && <p className="modal-error">{editError}</p>}
              <FormFields form={editForm} onChange={handleEditChange} />
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={closeEdit}>Cancel</button>
                <button type="submit" className="btn-submit" disabled={editSubmitting}>
                  {editSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteTarget && (
        <div className="modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="modal modal--sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Delete Customer</h3>
              <button className="modal-close-btn" onClick={() => setDeleteTarget(null)}><MdClose /></button>
            </div>
            <div className="modal-form">
              <p className="delete-confirm-text">
                Are you sure you want to delete <strong>{deleteTarget.name}</strong>? This cannot be undone.
              </p>
              <div className="modal-actions">
                <button className="btn-cancel" onClick={() => setDeleteTarget(null)}>Cancel</button>
                <button className="btn-delete" onClick={handleDelete} disabled={deleteSubmitting}>
                  {deleteSubmitting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerPage;
