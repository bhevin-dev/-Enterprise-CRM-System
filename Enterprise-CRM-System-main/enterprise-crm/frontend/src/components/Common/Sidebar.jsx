import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'Admin': return 'badge badge-admin';
      case 'Manager': return 'badge badge-manager';
      default: return 'badge badge-rep';
    }
  };

  return (
    <aside style={styles.sidebar}>
      {/* Branding */}
      <div style={styles.brandContainer}>
        <svg style={styles.logo} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.53c-.26-.81-1-1.4-1.9-1.4h-1v-3c0-.55-.45-1-1-1h-6v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
        </svg>
        <span style={styles.brandText}>APEX CRM</span>
      </div>

      {/* Navigation */}
      <nav style={styles.nav}>
        <NavLink 
          to="/dashboard" 
          style={({ isActive }) => ({
            ...styles.navLink,
            ...(isActive ? styles.navLinkActive : {})
          })}
        >
          <svg style={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="9" rx="1" />
            <rect x="14" y="3" width="7" height="5" rx="1" />
            <rect x="14" y="12" width="7" height="9" rx="1" />
            <rect x="3" y="16" width="7" height="5" rx="1" />
          </svg>
          Dashboard
        </NavLink>

        <NavLink 
          to="/leads" 
          style={({ isActive }) => ({
            ...styles.navLink,
            ...(isActive ? styles.navLinkActive : {})
          })}
        >
          <svg style={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          Leads Pipeline
        </NavLink>

        {user && user.role === 'Admin' && (
          <NavLink 
            to="/admin" 
            style={({ isActive }) => ({
              ...styles.navLink,
              ...(isActive ? styles.navLinkActive : {})
            })}
          >
            <svg style={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            RBAC Settings
          </NavLink>
        )}
      </nav>

      {/* User profile footer info */}
      <div style={styles.userFooter}>
        <div style={styles.userDetails}>
          <div style={styles.avatar}>
            {user?.name ? user.name[0].toUpperCase() : 'U'}
          </div>
          <div style={styles.meta}>
            <div style={styles.userName}>{user?.name}</div>
            <div style={styles.userEmail}>{user?.email}</div>
          </div>
        </div>
        <div style={styles.roleContainer}>
          <span className={getRoleBadgeClass(user?.role)}>{user?.role}</span>
        </div>
        <button className="btn btn-secondary" onClick={logout} style={styles.logoutBtn}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Logout
        </button>
      </div>
    </aside>
  );
};

const styles = {
  sidebar: {
    width: '260px',
    background: 'rgba(18, 24, 38, 0.95)',
    borderRight: '1px solid var(--border-color)',
    display: 'flex',
    flexDirection: 'column',
    padding: '1.5rem',
    minHeight: '100vh',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  brandContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '2.5rem',
    paddingLeft: '0.5rem',
  },
  logo: {
    width: '32px',
    height: '32px',
    color: 'var(--primary)',
    filter: 'drop-shadow(0 0 8px rgba(99, 102, 241, 0.4))',
  },
  brandText: {
    fontFamily: 'var(--font-display)',
    fontSize: '1.25rem',
    fontWeight: 800,
    letterSpacing: '0.05em',
    color: '#fff',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    flex: 1,
  },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    textDecoration: 'none',
    color: 'var(--text-secondary)',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    fontSize: '0.95rem',
    fontWeight: 500,
    transition: 'var(--transition-smooth)',
  },
  navLinkActive: {
    background: 'rgba(99, 102, 241, 0.08)',
    color: '#fff',
    borderLeft: '3px solid var(--primary)',
  },
  navIcon: {
    width: '18px',
    height: '18px',
  },
  userFooter: {
    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
    paddingTop: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  userDetails: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  avatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '1rem',
    boxShadow: '0 2px 8px rgba(99, 102, 241, 0.3)',
  },
  meta: {
    minWidth: 0,
  },
  userName: {
    fontWeight: 600,
    fontSize: '0.9rem',
    color: '#fff',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    text-overflow: 'ellipsis',
  },
  userEmail: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    text-overflow: 'ellipsis',
  },
  roleContainer: {
    alignSelf: 'flex-start',
  },
  logoutBtn: {
    width: '100%',
    justifyContent: 'center',
    fontSize: '0.8rem',
    padding: '0.5rem',
  },
};

export default Sidebar;
