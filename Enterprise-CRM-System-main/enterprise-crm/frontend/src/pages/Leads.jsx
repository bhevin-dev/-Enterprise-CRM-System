import React, { useState, useEffect, useContext } from 'react';
import Navbar from '../components/Common/Navbar';
import Sidebar from '../components/Common/Sidebar';
import NewLeadModal from '../components/Leads/NewLeadModal';
import LeadDetailsModal from '../components/Leads/LeadDetailsModal';
import { AuthContext } from '../context/AuthContext';

const Leads = () => {
  const { token, user } = useContext(AuthContext);
  const [leads, setLeads] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals state
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Fetch leads
  const fetchLeads = async () => {
    try {
      let url = '/api/leads';
      if (search.trim()) {
        url += `?search=${encodeURIComponent(search)}`;
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setLeads(data);
      } else {
        setError('Failed to fetch sales pipeline leads.');
      }
    } catch (err) {
      setError('Network error fetching pipeline.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [token, search]);

  const handleCreated = (newLead) => {
    setLeads((prev) => [newLead, ...prev]);
  };

  const handleUpdated = (updatedLead) => {
    setLeads((prev) =>
      prev.map((lead) => (lead._id === updatedLead._id ? updatedLead : lead))
    );
  };

  const handleDeleted = (deletedId) => {
    setLeads((prev) => prev.filter((lead) => lead._id !== deletedId));
  };

  // Quick Stage Change handler
  const handleStageChange = async (leadId, targetStage) => {
    try {
      const response = await fetch(`/api/leads/${leadId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ stage: targetStage }),
      });

      if (response.ok) {
        const updatedLead = await response.json();
        handleUpdated(updatedLead);
      } else {
        console.error('Failed to change stage');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  // Kanban Stage Columns definitions
  const columns = [
    { key: 'New', label: 'New Lead', icon: '📥' },
    { key: 'Contacted', label: 'Contacted', icon: '📞' },
    { key: 'Proposal', label: 'Proposal', icon: '📝' },
    { key: 'Negotiation', label: 'Negotiation', icon: '🤝' },
    { key: 'Won', label: 'Won', icon: '🏆' },
    { key: 'Lost', label: 'Lost', icon: '❌' },
  ];

  const handleCardClick = (id) => {
    setSelectedLeadId(id);
    setIsDetailsOpen(true);
  };

  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <Navbar title="Sales Pipeline" />

        {/* Filters and Add button bar */}
        <div style={styles.filterBar}>
          <div style={styles.searchWrapper}>
            <svg style={styles.searchIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search by contact name, company, email..."
              style={styles.searchInput}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <button className="btn btn-primary" onClick={() => setIsNewOpen(true)}>
            <span>➕</span> Add Lead
          </button>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh' }}>
            <div style={{
              border: '3px solid rgba(255, 255, 255, 0.05)',
              borderTop: '3px solid var(--primary)',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              animation: 'spin 1s linear infinite',
            }} />
          </div>
        ) : (
          /* Kanban Board */
          <div className="kanban-board">
            {columns.map((col) => {
              // Filter leads in this column stage
              const colLeads = leads.filter((l) => l.stage === col.key);
              const colTotalValue = colLeads.reduce((acc, l) => acc + (l.value || 0), 0);

              return (
                <div key={col.key} className="kanban-column">
                  <div className="kanban-column-header">
                    <span className="kanban-column-title">
                      <span>{col.icon}</span> {col.label}
                    </span>
                    <span className="kanban-count-badge">{colLeads.length}</span>
                  </div>
                  
                  {/* Column Value Summary */}
                  <div style={styles.columnValueSum}>
                    {formatCurrency(colTotalValue)}
                  </div>

                  <div className="kanban-cards-container">
                    {colLeads.length > 0 ? (
                      colLeads.map((lead) => (
                        <div 
                          key={lead._id} 
                          className="lead-card"
                          onClick={() => handleCardClick(lead._id)}
                        >
                          <div className="lead-card-header">
                            <div className="lead-card-name">{lead.name}</div>
                          </div>
                          
                          <div className="lead-card-company">{lead.company}</div>
                          
                          {/* Quick Stage Mover Selector */}
                          <div style={styles.quickStageRow} onClick={(e) => e.stopPropagation()}>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Move:</span>
                            <select
                              style={styles.quickStageSelect}
                              value={lead.stage}
                              onChange={(e) => handleStageChange(lead._id, e.target.value)}
                            >
                              <option value="New">New</option>
                              <option value="Contacted">Contacted</option>
                              <option value="Proposal">Proposal</option>
                              <option value="Negotiation">Negotiation</option>
                              <option value="Won">Won</option>
                              <option value="Lost">Lost</option>
                            </select>
                          </div>

                          <div className="lead-card-footer">
                            <span className="lead-card-value">{formatCurrency(lead.value)}</span>
                            <span className="lead-card-rep" title={`Owner: ${lead.assignedTo?.name}`}>
                              👤 {lead.assignedTo?.name.split(' ')[0]}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div style={styles.emptyColumnState}>
                        No deals here
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Lead Addition Modal */}
        <NewLeadModal
          isOpen={isNewOpen}
          onClose={() => setIsNewOpen(false)}
          onCreated={handleCreated}
        />

        {/* Lead Details Modal */}
        <LeadDetailsModal
          isOpen={isDetailsOpen}
          leadId={selectedLeadId}
          onClose={() => {
            setIsDetailsOpen(false);
            setSelectedLeadId(null);
          }}
          onUpdated={handleUpdated}
          onDeleted={handleDeleted}
        />
      </main>
    </div>
  );
};

const styles = {
  filterBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1.5rem',
    marginBottom: '2rem',
    flexWrap: 'wrap',
  },
  searchWrapper: {
    position: 'relative',
    flex: 1,
    maxWidth: '500px',
    minWidth: '280px',
  },
  searchIcon: {
    position: 'absolute',
    left: '1rem',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '18px',
    height: '18px',
    color: 'var(--text-muted)',
  },
  searchInput: {
    width: '100%',
    background: 'rgba(18, 24, 38, 0.6)',
    border: '1px solid var(--border-color)',
    borderRadius: '24px',
    padding: '0.6rem 1rem 0.6rem 2.8rem',
    color: 'var(--text-primary)',
    fontSize: '0.9rem',
    fontFamily: 'var(--font-primary)',
    outline: 'none',
    transition: 'var(--transition-smooth)',
  },
  columnValueSum: {
    fontSize: '0.75rem',
    fontWeight: 700,
    color: 'var(--text-secondary)',
    marginBottom: '1rem',
    padding: '4px 8px',
    background: 'rgba(255, 255, 255, 0.02)',
    borderRadius: '4px',
    alignSelf: 'flex-start',
    border: '1px solid rgba(255, 255, 255, 0.02)'
  },
  emptyColumnState: {
    color: 'var(--text-muted)',
    fontSize: '0.75rem',
    textAlign: 'center',
    padding: '2rem 1rem',
    border: '1px dashed rgba(255, 255, 255, 0.03)',
    borderRadius: '8px',
  },
  quickStageRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    marginBottom: '6px',
    paddingBottom: '6px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
  },
  quickStageSelect: {
    background: 'rgba(15, 23, 42, 0.8)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    color: 'var(--text-secondary)',
    fontSize: '0.65rem',
    borderRadius: '3px',
    padding: '2px 4px',
    outline: 'none',
    cursor: 'pointer',
  }
};

export default Leads;
