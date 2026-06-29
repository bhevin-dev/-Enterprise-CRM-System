import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

const LeadDetailsModal = ({ isOpen, leadId, onClose, onUpdated, onDeleted }) => {
  const { token, user } = useContext(AuthContext);
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  
  // Form states for updates
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [value, setValue] = useState('');
  const [stage, setStage] = useState('New');
  const [assignedTo, setAssignedTo] = useState('');
  
  // Activity Logging states
  const [activityType, setActivityType] = useState('Note');
  const [activityDesc, setActivityDesc] = useState('');
  
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [logging, setLogging] = useState(false);

  // Fetch full details of lead
  const fetchLeadDetails = async () => {
    if (!leadId) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/leads/${leadId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setLead(data);
        setName(data.name);
        setCompany(data.company);
        setEmail(data.email || '');
        setPhone(data.phone || '');
        setValue(data.value || 0);
        setStage(data.stage);
        setAssignedTo(data.assignedTo?._id || '');
      } else {
        setError('Failed to fetch lead details.');
      }
    } catch (err) {
      setError('Network error fetching lead details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && leadId) {
      fetchLeadDetails();
      setError('');
      setSuccessMsg('');
    }
  }, [isOpen, leadId]);

  // Fetch users list for managers to reassign
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
          }
        } catch (err) {
          console.error(err);
        }
      };
      fetchUsers();
    }
  }, [isOpen, token, user]);

  if (!isOpen) return null;

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccessMsg('');

    try {
      const payload = {
        name,
        company,
        email,
        phone,
        value: Number(value) || 0,
        stage,
      };

      if (user.role !== 'Rep' && assignedTo) {
        payload.assignedTo = assignedTo;
      }

      const response = await fetch(`/api/leads/${leadId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMsg('Lead details updated successfully!');
        setLead(data);
        onUpdated(data);
        // Refresh details to fetch auto-logged stage shifts
        setTimeout(() => {
          fetchLeadDetails();
        }, 800);
      } else {
        setError(data.message || 'Failed to update lead details.');
      }
    } catch (err) {
      setError('Network error updating lead.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogActivity = async (e) => {
    e.preventDefault();
    if (!activityDesc.trim()) return;

    setLogging(true);
    setError('');

    try {
      const response = await fetch(`/api/leads/${leadId}/activity`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          type: activityType,
          description: activityDesc,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setActivityDesc('');
        setSuccessMsg('Activity logged successfully!');
        fetchLeadDetails(); // refresh activity list
      } else {
        setError(data.message || 'Failed to log activity.');
      }
    } catch (err) {
      setError('Network error logging activity.');
    } finally {
      setLogging(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to permanently delete this lead?')) return;
    
    setError('');
    try {
      const response = await fetch(`/api/leads/${leadId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        onDeleted(leadId);
        onClose();
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to delete lead.');
      }
    } catch (err) {
      setError('Network error deleting lead.');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '850px' }}>
        <div className="modal-header">
          <h2 style={{ fontSize: '1.25rem', color: '#fff', fontFamily: 'var(--font-display)' }}>
            Lead Profile & Interactions
          </h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem' }}>
            <div style={{
              border: '3px solid rgba(255, 255, 255, 0.05)',
              borderTop: '3px solid var(--primary)',
              borderRadius: '50%',
              width: '30px',
              height: '30px',
              animation: 'spin 1s linear infinite',
            }} />
          </div>
        ) : (
          <div className="modal-body" style={styles.modalBodyLayout}>
            {/* Left side: Edit Form */}
            <div style={styles.leftFormPanel}>
              <h3 style={styles.sectionHeader}>Lead Profile</h3>
              
              {error && <div className="alert alert-danger" style={{ padding: '8px 12px' }}>{error}</div>}
              {successMsg && <div className="alert alert-success" style={{ padding: '8px 12px' }}>{successMsg}</div>}

              <form onSubmit={handleUpdate}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Company</label>
                    <input
                      type="text"
                      className="form-input"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-input"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input
                      type="text"
                      className="form-input"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Value ($)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Pipeline Stage</label>
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

                {/* Assignment Controls */}
                {(user.role === 'Admin' || user.role === 'Manager') ? (
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
                ) : (
                  <div className="form-group">
                    <label className="form-label">Assigned Representative</label>
                    <input
                      type="text"
                      className="form-input"
                      value={lead?.assignedTo?.name || 'Unassigned'}
                      disabled
                    />
                  </div>
                )}

                <div style={styles.formActionButtons}>
                  {(user.role === 'Admin' || user.role === 'Manager') && (
                    <button type="button" className="btn btn-danger" onClick={handleDelete}>
                      Delete Lead
                    </button>
                  )}
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? 'Saving...' : 'Update Details'}
                  </button>
                </div>
              </form>
            </div>

            {/* Right side: Log & Activities timeline */}
            <div style={styles.rightActivityPanel}>
              {/* Log Activity mini-form */}
              <div style={styles.logActivityBox}>
                <h3 style={styles.sectionHeader}>Log Communication / Note</h3>
                <form onSubmit={handleLogActivity}>
                  <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <select
                      className="form-input"
                      style={{ flex: 1, padding: '0.5rem' }}
                      value={activityType}
                      onChange={(e) => setActivityType(e.target.value)}
                    >
                      <option value="Note">📝 Note</option>
                      <option value="Email">✉️ Email Log</option>
                      <option value="Call">📞 Call Log</option>
                      <option value="Meeting">👥 Meeting Log</option>
                    </select>
                    <button 
                      type="submit" 
                      className="btn btn-primary" 
                      style={{ padding: '0.5rem 1rem' }}
                      disabled={logging || !activityDesc.trim()}
                    >
                      Log
                    </button>
                  </div>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Describe interaction details..."
                    value={activityDesc}
                    onChange={(e) => setActivityDesc(e.target.value)}
                    required
                  />
                </form>
              </div>

              {/* Activities timeline feed */}
              <div>
                <h3 style={{ ...styles.sectionHeader, marginTop: '1rem' }}>Activity History</h3>
                <div style={styles.timelineScroller}>
                  {lead?.activities && lead.activities.length > 0 ? (
                    <div className="activity-timeline">
                      {[...lead.activities].reverse().map((act) => {
                        const getActivityDotStyle = (type) => {
                          switch (type) {
                            case 'Call': return { bg: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', icon: '📞' };
                            case 'Email': return { bg: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', icon: '✉️' };
                            case 'Meeting': return { bg: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)', icon: '👥' };
                            default: return { bg: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-secondary)', icon: '📝' };
                          }
                        };
                        const badgeInfo = getActivityDotStyle(act.type);

                        return (
                          <div key={act._id} className="activity-item">
                            <div 
                              className="activity-dot" 
                              style={{ background: badgeInfo.bg, color: badgeInfo.color, width: '28px', height: '28px', fontSize: '0.75rem' }}
                            >
                              {badgeInfo.icon}
                            </div>
                            <div className="activity-content">
                              <div className="activity-meta">
                                <span className="activity-user" style={{ fontSize: '0.8rem' }}>
                                  {act.creatorName}
                                </span>
                                <span className="activity-time" style={{ fontSize: '0.7rem' }}>
                                  {new Date(act.date).toLocaleDateString()} {new Date(act.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <div className="activity-desc" style={{ fontSize: '0.8rem' }}>{act.description}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '1rem' }}>
                      No communications logged.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  modalBodyLayout: {
    display: 'flex',
    gap: '2rem',
    flexWrap: 'wrap',
  },
  leftFormPanel: {
    flex: '1.2 1 350px',
  },
  rightActivityPanel: {
    flex: '1 1 300px',
    borderLeft: '1px solid var(--border-color)',
    paddingLeft: '1.5rem',
  },
  sectionHeader: {
    fontSize: '0.95rem',
    textTransform: 'uppercase',
    color: 'var(--text-secondary)',
    letterSpacing: '0.05em',
    marginBottom: '1rem',
    fontWeight: 700,
  },
  formActionButtons: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '1.5rem',
    gap: '0.5rem',
  },
  logActivityBox: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    padding: '0.75rem',
    marginBottom: '1rem',
  },
  timelineScroller: {
    maxHeight: '220px',
    overflowY: 'auto',
    paddingRight: '4px',
  },
};

export default LeadDetailsModal;
