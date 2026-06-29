import React, { useState, useEffect, useContext } from 'react';
import Navbar from '../components/Common/Navbar';
import Sidebar from '../components/Common/Sidebar';
import { AuthContext } from '../context/AuthContext';

const AdminSettings = () => {
  const { token, user: currentUser } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch users
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
      } else {
        setError('Failed to fetch user profiles for RBAC operations.');
      }
    } catch (err) {
      setError('Network error fetching account registers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  // Handle changing user roles
  const handleRoleChange = async (targetUserId, newRole) => {
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`/api/auth/users/${targetUserId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(`User role updated to ${newRole} successfully.`);
        // Refresh local items
        setUsers((prev) =>
          prev.map((u) => (u._id === targetUserId ? { ...u, role: newRole } : u))
        );
      } else {
        setError(data.message || 'Failed to update user role.');
      }
    } catch (err) {
      setError('Network error changing account permission role.');
    }
  };

  // Handle deleting users
  const handleDeleteUser = async (targetUserId) => {
    if (!window.confirm('Are you sure you want to permanently delete this user account?')) return;
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`/api/auth/users/${targetUserId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setSuccess('User account removed successfully.');
        setUsers((prev) => prev.filter((u) => u._id !== targetUserId));
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to delete user.');
      }
    } catch (err) {
      setError('Network error deleting user.');
    }
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'Admin': return 'badge badge-admin';
      case 'Manager': return 'badge badge-manager';
      default: return 'badge badge-rep';
    }
  };

  // Calculate totals
  const totalReps = users.filter((u) => u.role === 'Rep').length;
  const totalManagers = users.filter((u) => u.role === 'Manager').length;
  const totalAdmins = users.filter((u) => u.role === 'Admin').length;

  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <Navbar title="Role & Access Control Console" />

        {/* Totals Section */}
        <div className="dashboard-grid" style={{ marginBottom: '2rem' }}>
          <div className="glass-card metric-card" style={{ padding: '1rem 1.25rem' }}>
            <div className="metric-info">
              <h3>System Admins</h3>
              <div className="value" style={{ fontSize: '1.5rem' }}>{totalAdmins}</div>
            </div>
            <div style={{ fontSize: '1.25rem' }}>🔴</div>
          </div>
          <div className="glass-card metric-card" style={{ padding: '1rem 1.25rem' }}>
            <div className="metric-info">
              <h3>Sales Managers</h3>
              <div className="value" style={{ fontSize: '1.5rem' }}>{totalManagers}</div>
            </div>
            <div style={{ fontSize: '1.25rem' }}>🟣</div>
          </div>
          <div className="glass-card metric-card" style={{ padding: '1rem 1.25rem' }}>
            <div className="metric-info">
              <h3>Sales Representatives</h3>
              <div className="value" style={{ fontSize: '1.5rem' }}>{totalReps}</div>
            </div>
            <div style={{ fontSize: '1.25rem' }}>🔵</div>
          </div>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {/* Users RBAC management table */}
        <div className="glass-card">
          <h2 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', fontFamily: 'var(--font-display)', color: '#fff' }}>
            Registered Users & Accounts Scoping
          </h2>

          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
              <div style={{
                border: '3px solid rgba(255, 255, 255, 0.05)',
                borderTop: '3px solid var(--primary)',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                animation: 'spin 1s linear infinite',
              }} />
            </div>
          ) : (
            <div className="table-container">
              <table className="crm-table">
                <thead>
                  <tr>
                    <th>User Details</th>
                    <th>Current Permission Role</th>
                    <th>Modify Role Access</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((account) => (
                    <tr key={account._id}>
                      <td>
                        <div style={{ fontWeight: 600, color: '#fff' }}>
                          {account.name} {account._id === currentUser._id && <span style={{ color: 'var(--primary)', fontSize: '0.75rem' }}>(You)</span>}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{account.email}</div>
                      </td>
                      <td>
                        <span className={getRoleBadgeClass(account.role)}>{account.role}</span>
                      </td>
                      <td>
                        <select
                          className="form-input"
                          style={{ padding: '4px 8px', fontSize: '0.8rem', maxWidth: '160px' }}
                          value={account.role}
                          onChange={(e) => handleRoleChange(account._id, e.target.value)}
                          disabled={account._id === currentUser._id} // can't change self
                        >
                          <option value="Rep">Sales Representative</option>
                          <option value="Manager">Sales Manager</option>
                          <option value="Admin">Admin</option>
                        </select>
                      </td>
                      <td>
                        <button
                          className="btn btn-danger"
                          style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                          onClick={() => handleDeleteUser(account._id)}
                          disabled={account._id === currentUser._id} // can't delete self
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminSettings;
