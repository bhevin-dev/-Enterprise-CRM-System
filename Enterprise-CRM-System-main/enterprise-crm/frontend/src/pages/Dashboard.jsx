import React, { useState, useEffect, useContext } from 'react';
import Navbar from '../components/Common/Navbar';
import Sidebar from '../components/Common/Sidebar';
import { AuthContext } from '../context/AuthContext';

const Dashboard = () => {
  const { token, user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/dashboard', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setStats(data);
        } else {
          setError('Failed to fetch dashboard intelligence metrics.');
        }
      } catch (err) {
        setError('Network error loading dashboard reports.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [token]);

  // Helper to format currency values
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  if (loading) {
    return (
      <div className="app-container">
        <Sidebar />
        <main className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{
            border: '3px solid rgba(255, 255, 255, 0.05)',
            borderTop: '3px solid var(--primary)',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            animation: 'spin 1s linear infinite',
          }} />
          <span style={{ marginLeft: '1rem', color: 'var(--text-secondary)' }}>Loading Dashboard Intelligence...</span>
        </main>
      </div>
    );
  }

  const summary = stats?.summary || {
    totalLeadsCount: 0,
    activeLeadsCount: 0,
    totalValue: 0,
    activeValue: 0,
    wonValue: 0,
    lostValue: 0,
    conversionRate: 0,
  };

  const stages = stats?.stages || {};
  const repPerformance = stats?.repPerformance || [];
  const recentActivities = stats?.recentActivities || [];

  // Stage order for chart rendering
  const stageKeys = ['New', 'Contacted', 'Proposal', 'Negotiation', 'Won', 'Lost'];
  const maxStageCount = Math.max(...stageKeys.map(k => stages[k]?.count || 0), 1);

  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <Navbar title="Sales Dashboard" />

        {error && <div className="alert alert-danger">{error}</div>}

        {/* 1. Metric Cards Grid */}
        <div className="dashboard-grid">
          {/* Active Pipeline Value */}
          <div className="glass-card metric-card">
            <div className="metric-info">
              <h3>Active Pipeline</h3>
              <div className="value">{formatCurrency(summary.activeValue)}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--success)', marginTop: '4px' }}>
                Active Deals Value
              </div>
            </div>
            <div className="metric-icon" style={{ background: 'var(--primary-glow)', color: 'var(--primary)' }}>
              💸
            </div>
          </div>

          {/* Won Value */}
          <div className="glass-card metric-card">
            <div className="metric-info">
              <h3>Closed Won Value</h3>
              <div className="value">{formatCurrency(summary.wonValue)}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--success)', marginTop: '4px' }}>
                Revenue Closed
              </div>
            </div>
            <div className="metric-icon" style={{ background: 'var(--success-glow)', color: 'var(--success)' }}>
              🏆
            </div>
          </div>

          {/* Active Leads count */}
          <div className="glass-card metric-card">
            <div className="metric-info">
              <h3>Active Pipeline Count</h3>
              <div className="value">{summary.activeLeadsCount}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Leads in progress (Total: {summary.totalLeadsCount})
              </div>
            </div>
            <div className="metric-icon" style={{ background: 'var(--warning-glow)', color: 'var(--warning)' }}>
              👥
            </div>
          </div>

          {/* Conversion Rate */}
          <div className="glass-card metric-card">
            <div className="metric-info">
              <h3>Win Conversion</h3>
              <div className="value">{summary.conversionRate}%</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Won / (Won + Lost) Ratio
              </div>
            </div>
            <div className="metric-icon" style={{ background: 'rgba(236, 72, 153, 0.1)', color: '#ec4899' }}>
              📈
            </div>
          </div>
        </div>

        {/* 2. Visualizations Panel */}
        <div className="dashboard-reports-grid">
          {/* Custom SVG Pipeline stage funnel */}
          <div className="glass-card">
            <h2 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', fontFamily: 'var(--font-display)', color: '#fff' }}>
              Deal Stages Funnel Analysis
            </h2>
            <div style={styles.chartWrapper}>
              <div style={styles.chartColumnsContainer}>
                {stageKeys.map((stage) => {
                  const count = stages[stage]?.count || 0;
                  const value = stages[stage]?.value || 0;
                  // Compute bar heights
                  const heightPercentage = Math.max((count / maxStageCount) * 80, 5); // min 5% for visual visibility

                  return (
                    <div key={stage} style={styles.chartColumnItem}>
                      <div style={styles.chartBarTrack}>
                        <div 
                          style={{
                            ...styles.chartBarFill,
                            height: `${heightPercentage}%`,
                            background: `linear-gradient(to top, var(--primary), var(--secondary))`
                          }}
                          title={`Stage: ${stage}\nDeals: ${count}\nValue: ${formatCurrency(value)}`}
                        >
                          {count > 0 && <span style={styles.chartBarCountLabel}>{count}</span>}
                        </div>
                      </div>
                      <div style={styles.chartStageLabel}>{stage}</div>
                      <div style={styles.chartStageValueLabel}>{formatCurrency(value)}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Quick Metrics Breakdowns */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <h2 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', fontFamily: 'var(--font-display)', color: '#fff' }}>
              Pipeline Valuation Splits
            </h2>
            <div style={styles.valuationSplits}>
              <div style={styles.splitItem}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Active Pipeline</span>
                  <span style={{ fontWeight: 600 }}>{formatCurrency(summary.activeValue)}</span>
                </div>
                <div style={styles.splitProgressTrack}>
                  <div style={{ 
                    ...styles.splitProgressBar, 
                    width: `${summary.totalValue > 0 ? (summary.activeValue / summary.totalValue) * 100 : 0}%`,
                    background: 'var(--primary)'
                  }} />
                </div>
              </div>

              <div style={styles.splitItem}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Won Revenue</span>
                  <span style={{ fontWeight: 600, color: 'var(--success)' }}>{formatCurrency(summary.wonValue)}</span>
                </div>
                <div style={styles.splitProgressTrack}>
                  <div style={{ 
                    ...styles.splitProgressBar, 
                    width: `${summary.totalValue > 0 ? (summary.wonValue / summary.totalValue) * 100 : 0}%`,
                    background: 'var(--success)'
                  }} />
                </div>
              </div>

              <div style={styles.splitItem}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Lost Deals</span>
                  <span style={{ fontWeight: 600, color: 'var(--danger)' }}>{formatCurrency(summary.lostValue)}</span>
                </div>
                <div style={styles.splitProgressTrack}>
                  <div style={{ 
                    ...styles.splitProgressBar, 
                    width: `${summary.totalValue > 0 ? (summary.lostValue / summary.totalValue) * 100 : 0}%`,
                    background: 'var(--danger)'
                  }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Sales performance & Recent activitylogs */}
        <div style={styles.bottomGrid}>
          {/* Sales Performance List */}
          <div className="glass-card" style={{ flex: 1, minWidth: '320px' }}>
            <h2 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', fontFamily: 'var(--font-display)', color: '#fff' }}>
              Sales Team Performance Ranking
            </h2>
            <div className="table-container">
              <table className="crm-table">
                <thead>
                  <tr>
                    <th>Representative</th>
                    <th>Active Deals</th>
                    <th>Won Value</th>
                  </tr>
                </thead>
                <tbody>
                  {repPerformance.length > 0 ? (
                    repPerformance.map((rep) => (
                      <tr key={rep.repId}>
                        <td>
                          <div style={{ fontWeight: 600 }}>{rep.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{rep.email}</div>
                        </td>
                        <td>{rep.totalLeads} ({formatCurrency(rep.activeValue)})</td>
                        <td style={{ color: 'var(--success)', fontWeight: 600 }}>
                          {formatCurrency(rep.wonValue)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                        No representative stats recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Activity Log Feed */}
          <div className="glass-card" style={{ flex: 1, minWidth: '320px' }}>
            <h2 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', fontFamily: 'var(--font-display)', color: '#fff' }}>
              Enterprise Activity Feed
            </h2>
            <div style={styles.activityFeedContainer}>
              {recentActivities.length > 0 ? (
                <div className="activity-timeline">
                  {recentActivities.map((act) => {
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
                      <div key={act.activityId} className="activity-item">
                        <div 
                          className="activity-dot" 
                          style={{ background: badgeInfo.bg, color: badgeInfo.color }}
                        >
                          {badgeInfo.icon}
                        </div>
                        <div className="activity-content">
                          <div className="activity-meta">
                            <span className="activity-user">
                              {act.creatorName} <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>on</span> {act.leadName}
                            </span>
                            <span className="activity-time">
                              {new Date(act.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <div className="activity-desc">{act.description}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>
                  No communications logged. Lead events will stream here.
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const styles = {
  chartWrapper: {
    height: '240px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    paddingTop: '1rem',
  },
  chartColumnsContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: '100%',
    gap: '8px',
  },
  chartColumnItem: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minWidth: 0,
  },
  chartBarTrack: {
    width: '32px',
    height: '150px',
    background: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '4px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    overflow: 'hidden',
    border: '1px solid rgba(255, 255, 255, 0.02)',
  },
  chartBarFill: {
    borderRadius: '3px',
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingTop: '6px',
    transition: 'height 0.8s ease-out',
  },
  chartBarCountLabel: {
    fontSize: '0.7rem',
    fontWeight: 700,
    color: '#fff',
  },
  chartStageLabel: {
    fontSize: '0.75rem',
    fontWeight: 600,
    color: 'var(--text-secondary)',
    marginTop: '8px',
    textAlign: 'center',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    text-overflow: 'ellipsis',
    width: '100%',
  },
  chartStageValueLabel: {
    fontSize: '0.7rem',
    color: 'var(--text-muted)',
    marginTop: '2px',
    fontWeight: 500,
  },
  valuationSplits: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
    padding: '0.5rem 0',
  },
  splitItem: {
    width: '100%',
  },
  splitProgressTrack: {
    height: '6px',
    background: 'rgba(255, 255, 255, 0.04)',
    borderRadius: '10px',
    overflow: 'hidden',
  },
  splitProgressBar: {
    height: '100%',
    borderRadius: '10px',
    transition: 'width 0.8s ease-out',
  },
  bottomGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '1.5rem',
  },
  activityFeedContainer: {
    maxHeight: '300px',
    overflowY: 'auto',
    paddingRight: '4px',
  },
};

export default Dashboard;
