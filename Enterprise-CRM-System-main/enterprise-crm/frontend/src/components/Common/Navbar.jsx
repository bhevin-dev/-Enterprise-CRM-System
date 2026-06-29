import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

const Navbar = ({ title }) => {
  const { user } = useContext(AuthContext);

  const getGreeting = () => {
    const hrs = new Date().getHours();
    if (hrs < 12) return 'Good Morning';
    if (hrs < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <header style={styles.navbar}>
      <div>
        <h1 style={styles.title}>{title}</h1>
        <div style={styles.subtitle}>
          {getGreeting()}, {user?.name.split(' ')[0]}! Welcome to your pipeline dashboard.
        </div>
      </div>

      <div style={styles.rightSection}>
        <div style={styles.statusDotContainer}>
          <span style={styles.statusDot}></span>
          <span style={styles.statusText}>Live Sync Connected</span>
        </div>
      </div>
    </header>
  );
};

const styles = {
  navbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    paddingBottom: '1rem',
    borderBottom: '1px solid var(--border-color)',
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: '1.75rem',
    fontWeight: 700,
    color: '#fff',
  },
  subtitle: {
    fontSize: '0.875rem',
    color: 'var(--text-secondary)',
    marginTop: '0.25rem',
  },
  rightSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
  },
  statusDotContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'rgba(16, 185, 129, 0.08)',
    border: '1px solid rgba(16, 185, 129, 0.2)',
    padding: '6px 12px',
    borderRadius: '20px',
  },
  statusDot: {
    width: '8px',
    height: '8px',
    background: 'var(--success)',
    borderRadius: '50%',
    display: 'inline-block',
    boxShadow: '0 0 8px var(--success)',
    animation: 'pulse 2s infinite',
  },
  statusText: {
    fontSize: '0.75rem',
    fontWeight: 600,
    color: 'var(--success)',
  },
};

export default Navbar;
