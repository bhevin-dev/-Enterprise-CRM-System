import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

const NewLeadModal = ({ isOpen, onClose, onCreated }) => {
  const { token, user } = useContext(AuthContext);
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [value, setValue] = useState('');
  const [stage, setStage] = useState('New');
  const [assignedTo, setAssignedTo] = useState('');
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fetch users for lead assignment (Admins and Managers only)
  useEffect(() => {
    if (isOpen && (user.role === 'Admin' || user.role === 'Manager')) {
      const fetchUsers = async () => {
        try {
          const response = await fetch('/api/auth/users', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (response.ok) {
            const data = await response.json();
            setUsers(data);
            // Default assignment is current user
            setAssignedTo(user._id);
          }
        } catch (err) {
          console.error('Error fetching users:', err);
        }
      };
      fetchUsers();
    }
  }, [isOpen, token, user]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !company) {
      setError('Name and company are required.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const payload = {
        name,
        company,
        email,
        phone,
        value: Number(value) || 0,
        stage,
      };

      if ((user.role === 'Admin' || user.role === 'Manager') && assignedTo) {
        payload.assignedTo = assignedTo;
      }

      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        onCreated(data);
        handleClose();
      } else {
        setError(data.message || 'Failed to create lead.');
      }
    } catch (err) {
      setError('Network error creating lead.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setName('');
    setCompany('');
    setEmail('');
    setPhone('');
    setValue('');
    setStage('New');
    setAssignedTo(user._id);
    setError('');
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2 style={{ fontSize: '1.25rem', color: '#fff', fontFamily: 'var(--font-display)' }}>Add New Lead</h2>
          <button className="modal-close" onClick={handleClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="alert alert-danger">{error}</div>}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Contact Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Sarah Jenkins"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Company *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Acme Corp"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="sarah@acme.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="+1 (555) 000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Deal Value ($)</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="5000"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Initial Stage</label>
                <select
                  className="form-input"
                  value={stage}
                  onChange={(e) => setStage(e.target.value)}
                >
                  <option value="New">New</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Proposal">Proposal</option>
                  <option value="Negotiation">Negotiation</option>
                  <option value="Won">Won</option>
                  <option value="Lost">Lost</option>
                </select>
              </div>
            </div>

            {/* Assignments (Show only to Admin & Manager) */}
            {(user.role === 'Admin' || user.role === 'Manager') && (
              <div className="form-group">
                <label className="form-label">Assigned Representative</label>
                <select
                  className="form-input"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                >
                  <option value="">Select Representative</option>
                  {users.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.name} ({u.role})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={handleClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewLeadModal;
