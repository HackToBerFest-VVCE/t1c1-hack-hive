import React, { useState } from 'react';
import {
  ShieldAlert,
  Building2,
  Users,
  GraduationCap,
  Cpu,
  Sparkles,
  Activity,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Copy,
  Check,
  Search,
  Filter,
  RefreshCw,
  Eye,
  Server,
  Lock,
  ChevronRight,
  TrendingUp,
  Award,
  Layers,
  ArrowUpRight,
  Info
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function SuperAdminDashboard() {
  const { profile, switchDemoRole } = useAuth();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'requests' | 'directory' | 'analytics' | 'audit'
  const [copiedCode, setCopiedCode] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [approvalFeedback, setApprovalFeedback] = useState(null);

  // Initial Sample Requests State for Interactive Demonstration
  const [requests, setRequests] = useState([
    {
      id: 'req-001',
      name: 'BMS Institute of Technology & Management',
      type: 'Autonomous Engineering College',
      city: 'Bengaluru',
      state: 'Karnataka',
      country: 'India',
      officialEmail: 'principal@bmsit.in',
      contactName: 'Dr. Mohan Kumar R.',
      contactDesignation: 'HOD, Dept of Electronics & Telecommunication',
      contactEmail: 'hod.ete@bmsit.in',
      appliedDate: '2026-10-24',
      status: 'pending',
      proposedDepts: ['ECE', 'EEE', 'ETE'],
      estStudents: 1200,
    },
    {
      id: 'req-002',
      name: 'National Institute of Engineering (NIE)',
      type: 'Autonomous Engineering College',
      city: 'Mysuru',
      state: 'Karnataka',
      country: 'India',
      officialEmail: 'registrar@nie.ac.in',
      contactName: 'Prof. Anitha S.',
      contactDesignation: 'Vice Principal & Lab Director',
      contactEmail: 'anitha.s@nie.ac.in',
      appliedDate: '2026-10-25',
      status: 'pending',
      proposedDepts: ['ECE', 'EEE'],
      estStudents: 950,
    },
    {
      id: 'req-003',
      name: 'KLS Gogte Institute of Technology',
      type: 'Autonomous Engineering College',
      city: 'Belagavi',
      state: 'Karnataka',
      country: 'India',
      officialEmail: 'principal@git.edu',
      contactName: 'Dr. M. S. Patil',
      contactDesignation: 'Dean Academic Affairs',
      contactEmail: 'dean.academic@git.edu',
      appliedDate: '2026-10-26',
      status: 'pending',
      proposedDepts: ['ECE', 'EEE', 'VLSI'],
      estStudents: 800,
    },
  ]);

  // Initial Active Institutions Directory State
  const [institutions, setInstitutions] = useState([
    {
      id: 'inst-001',
      name: 'Vidyavardhaka College of Engineering (VVCE)',
      code: 'LSAI-VVCE-A7K2',
      city: 'Mysuru',
      state: 'Karnataka',
      adminName: 'Prof. B. S. Gowda',
      adminEmail: 'admin.vvce@labsense.edu',
      studentsCount: 842,
      facultyCount: 28,
      activeLabs: 6,
      diagnosticsCount: 14210,
      status: 'active',
      joinedDate: '2026-08-15',
    },
    {
      id: 'inst-002',
      name: 'R.V. College of Engineering (RVCE)',
      code: 'LSAI-RVCE-C3X1',
      city: 'Bengaluru',
      state: 'Karnataka',
      adminName: 'Dr. Subramanya K. N.',
      adminEmail: 'principal@rvce.edu.in',
      studentsCount: 1850,
      facultyCount: 64,
      activeLabs: 12,
      diagnosticsCount: 31400,
      status: 'active',
      joinedDate: '2026-07-20',
    },
    {
      id: 'inst-003',
      name: 'PES University (Ring Road Campus)',
      code: 'LSAI-PESU-M9L4',
      city: 'Bengaluru',
      state: 'Karnataka',
      adminName: 'Dr. J. Suryaprasad',
      adminEmail: 'dean.ec@pes.edu',
      studentsCount: 2400,
      facultyCount: 82,
      activeLabs: 14,
      diagnosticsCount: 42100,
      status: 'active',
      joinedDate: '2026-06-10',
    },
    {
      id: 'inst-004',
      name: 'M. S. Ramaiah Institute of Technology',
      code: 'LSAI-MSRI-P2R8',
      city: 'Bengaluru',
      state: 'Karnataka',
      adminName: 'Dr. N. V. R. Naidu',
      adminEmail: 'principal@msrit.edu',
      studentsCount: 1620,
      facultyCount: 55,
      activeLabs: 10,
      diagnosticsCount: 22800,
      status: 'active',
      joinedDate: '2026-08-01',
    },
    {
      id: 'inst-005',
      name: 'PSG College of Technology',
      code: 'LSAI-PSGC-K5T9',
      city: 'Coimbatore',
      state: 'Tamil Nadu',
      adminName: 'Dr. K. Prakasan',
      adminEmail: 'principal@psgtech.edu',
      studentsCount: 2100,
      facultyCount: 74,
      activeLabs: 15,
      diagnosticsCount: 38200,
      status: 'active',
      joinedDate: '2026-05-18',
    },
  ]);

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState([
    {
      id: 'log-101',
      timestamp: 'Just now (10:48 AM)',
      actor: 'Sarah Jenkins (Platform Super Admin)',
      action: 'Super Admin Governance Console Authenticated',
      target: 'Platform Global Scope',
      severity: 'info',
    },
    {
      id: 'log-102',
      timestamp: 'Today at 09:15 AM',
      actor: 'Prof. B. S. Gowda (VVCE Admin)',
      action: 'Institution Code LSAI-VVCE-A7K2 Verified for 42 Fresh Enrollments',
      target: 'Vidyavardhaka College of Engineering',
      severity: 'success',
    },
    {
      id: 'log-103',
      timestamp: 'Today at 08:32 AM',
      actor: 'Gemma 4 Diagnostic Service (Vertex AI)',
      action: 'Model Health Check Confirmed: 31B-IT Multimodal Weights Operational',
      target: 'Inference Engine Cluster-01',
      severity: 'success',
    },
    {
      id: 'log-104',
      timestamp: 'Yesterday at 04:12 PM',
      actor: 'System Firewall / Rate Limiter',
      action: 'Flagged 5 consecutive invalid institution code entries from 103.24.88.12',
      target: 'Auth Gateway Security',
      severity: 'warning',
    },
    {
      id: 'log-105',
      timestamp: 'Oct 25, 2026 02:40 PM',
      actor: 'Sarah Jenkins',
      action: 'Approved Registration Request for PSG College of Technology',
      target: 'LSAI-PSGC-K5T9 Generated',
      severity: 'info',
    },
  ]);

  const handleCopyCode = (code) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleApproveRequest = (req) => {
    // Generate new code
    const words = req.name.split(/\s+/);
    const prefix = words.map((w) => w[0].toUpperCase()).slice(0, 4).join('');
    const newCode = `LSAI-${prefix}-G${Math.floor(100 + Math.random() * 900)}`;

    const newInst = {
      id: `inst-${Date.now()}`,
      name: req.name,
      code: newCode,
      city: req.city,
      state: req.state,
      adminName: req.contactName,
      adminEmail: req.contactEmail,
      studentsCount: 0,
      facultyCount: 1,
      activeLabs: req.proposedDepts.length * 2,
      diagnosticsCount: 0,
      status: 'active',
      joinedDate: new Date().toISOString().split('T')[0],
    };

    setInstitutions([newInst, ...institutions]);
    setRequests(requests.filter((r) => r.id !== req.id));
    setSelectedRequest(null);

    // Add Audit Log
    setAuditLogs([
      {
        id: `log-${Date.now()}`,
        timestamp: 'Just now',
        actor: 'Sarah Jenkins (Super Admin)',
        action: `Approved registration for ${req.name}. Assigned unique code ${newCode}.`,
        target: req.name,
        severity: 'success',
      },
      ...auditLogs,
    ]);

    setApprovalFeedback(`Successfully approved ${req.name}! Assigned code: ${newCode}`);
    setTimeout(() => setApprovalFeedback(null), 4000);
  };

  const handleRejectRequest = (reqId, instName) => {
    setRequests(requests.filter((r) => r.id !== reqId));
    setSelectedRequest(null);
    setAuditLogs([
      {
        id: `log-${Date.now()}`,
        timestamp: 'Just now',
        actor: 'Sarah Jenkins (Super Admin)',
        action: `Rejected registration request from ${instName}.`,
        target: instName,
        severity: 'warning',
      },
      ...auditLogs,
    ]);
  };

  const handleToggleInstitutionStatus = (instId) => {
    setInstitutions(
      institutions.map((inst) => {
        if (inst.id === instId) {
          const nextStatus = inst.status === 'active' ? 'suspended' : 'active';
          setAuditLogs([
            {
              id: `log-${Date.now()}`,
              timestamp: 'Just now',
              actor: 'Sarah Jenkins (Super Admin)',
              action: `Changed status of ${inst.name} to ${nextStatus.toUpperCase()}`,
              target: inst.name,
              severity: nextStatus === 'suspended' ? 'warning' : 'info',
            },
            ...auditLogs,
          ]);
          return { ...inst, status: nextStatus };
        }
        return inst;
      })
    );
  };

  const filteredInstitutions = institutions.filter((inst) => {
    const matchesSearch =
      inst.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inst.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inst.city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || inst.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="portal-container superadmin-portal">
      {/* Top Super Admin Restriction Banner */}
      <div className="superadmin-governance-bar">
        <div className="governance-meta">
          <div className="superadmin-shield-icon">
            <ShieldAlert size={22} className="text-amber" />
          </div>
          <div>
            <div className="governance-title-row">
              <span className="governance-title">PLATFORM SUPER ADMIN GOVERNANCE</span>
              <span className="governance-badge">Restricted Access • Platform Operations</span>
            </div>
            <p className="governance-subtitle">
              Global administrator view for <strong>{profile?.full_name || 'Sarah Jenkins'}</strong> ({profile?.email || 'superadmin@labsense.io'}). Platform-wide management across all member colleges.
            </p>
          </div>
        </div>

        <div className="governance-actions">
          <button
            type="button"
            className="btn-demo-switch-role"
            onClick={() => switchDemoRole('institution_admin')}
            title="Preview how a College-scoped Administrator views the application"
          >
            <Building2 size={15} />
            <span>Switch to College Admin (VVCE)</span>
          </button>
        </div>
      </div>

      {approvalFeedback && (
        <div className="modal-alert modal-alert-success mt-3 mb-2">
          <CheckCircle2 size={18} />
          <span>{approvalFeedback}</span>
        </div>
      )}

      {/* Super Admin Subnavigation Tabs */}
      <div className="portal-subnav superadmin-subnav">
        <div className="subnav-header">
          <div className="portal-badge superadmin-badge">
            <Layers size={16} />
            <span>Platform Governance Console</span>
          </div>
        </div>

        <nav className="portal-tabs" aria-label="Super Admin Tabs">
          <button
            type="button"
            className={`portal-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <Activity size={18} />
            <span>Platform Overview</span>
          </button>

          <button
            type="button"
            className={`portal-tab-btn ${activeTab === 'requests' ? 'active' : ''}`}
            onClick={() => setActiveTab('requests')}
          >
            <Building2 size={18} />
            <span>Institution Requests</span>
            {requests.length > 0 && <span className="tab-counter-badge">{requests.length}</span>}
          </button>

          <button
            type="button"
            className={`portal-tab-btn ${activeTab === 'directory' ? 'active' : ''}`}
            onClick={() => setActiveTab('directory')}
          >
            <Server size={18} />
            <span>Institutions Directory</span>
            <span className="tab-counter-badge counter-secondary">{institutions.length}</span>
          </button>

          <button
            type="button"
            className={`portal-tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            <TrendingUp size={18} />
            <span>Platform & AI Telemetry</span>
          </button>

          <button
            type="button"
            className={`portal-tab-btn ${activeTab === 'audit' ? 'active' : ''}`}
            onClick={() => setActiveTab('audit')}
          >
            <Lock size={18} />
            <span>Audit & Security Log</span>
          </button>
        </nav>
      </div>

      {/* Main Tab Content */}
      <div className="portal-content">
        {/* =====================================================================
            TAB 1: PLATFORM OVERVIEW
           ===================================================================== */}
        {activeTab === 'overview' && (
          <div className="superadmin-tab-view">
            {/* Top Metrics Row */}
            <div className="kpi-metrics-grid">
              <div className="kpi-metric-card border-blue">
                <div className="metric-header">
                  <span className="metric-label">REGISTERED INSTITUTIONS</span>
                  <div className="metric-icon-box bg-blue">
                    <Building2 size={18} className="text-white" />
                  </div>
                </div>
                <div className="metric-value-row">
                  <span className="metric-value">{institutions.length + 9}</span>
                  <span className="metric-trend text-emerald">+3 this month</span>
                </div>
                <span className="metric-footer-note">14 total enrolled colleges across 5 states</span>
              </div>

              <div className="kpi-metric-card border-emerald">
                <div className="metric-header">
                  <span className="metric-label">ACTIVE STUDENT LEARNERS</span>
                  <div className="metric-icon-box bg-emerald">
                    <GraduationCap size={18} className="text-white" />
                  </div>
                </div>
                <div className="metric-value-row">
                  <span className="metric-value">12,840</span>
                  <span className="metric-trend text-emerald">+18% term growth</span>
                </div>
                <span className="metric-footer-note">Enrolled via unique institution codes</span>
              </div>

              <div className="kpi-metric-card border-indigo">
                <div className="metric-header">
                  <span className="metric-label">CERTIFIED INSTRUCTORS</span>
                  <div className="metric-icon-box bg-indigo">
                    <Users size={18} className="text-white" />
                  </div>
                </div>
                <div className="metric-value-row">
                  <span className="metric-value">486</span>
                  <span className="metric-trend text-emerald">Faculty active</span>
                </div>
                <span className="metric-footer-note">Authoring labs & evaluating diagnostic runs</span>
              </div>

              <div className="kpi-metric-card border-purple">
                <div className="metric-header">
                  <span className="metric-label">GEMMA 4 AI DIAGNOSTICS</span>
                  <div className="metric-icon-box bg-purple">
                    <Cpu size={18} className="text-white" />
                  </div>
                </div>
                <div className="metric-value-row">
                  <span className="metric-value">89,420</span>
                  <span className="metric-trend text-cyan">99.4% accuracy</span>
                </div>
                <span className="metric-footer-note">Physical breadboard fault detections</span>
              </div>
            </div>

            {/* Platform Health and Quick Approvals Banner */}
            <div className="superadmin-split-cards">
              {/* System and Model Health */}
              <div className="card admin-health-card">
                <div className="card-header-simple">
                  <div className="card-title-group">
                    <Server size={18} className="text-blue" />
                    <h3 className="card-title-text">Platform Infrastructure & AI Health</h3>
                  </div>
                  <span className="status-pill status-pill-ready">
                    <span className="status-dot dot-live" /> All Systems Nominal
                  </span>
                </div>

                <div className="health-metrics-list">
                  <div className="health-row">
                    <div className="health-name-col">
                      <Sparkles size={16} className="text-blue" />
                      <div>
                        <strong>Gemma 4 31B-IT Multimodal Vision</strong>
                        <span className="health-sub">Breadboard photo inspection & lead analysis</span>
                      </div>
                    </div>
                    <div className="health-val-col">
                      <span className="health-badge bg-emerald">Operational</span>
                      <span className="health-latency">~410ms latency</span>
                    </div>
                  </div>

                  <div className="health-row">
                    <div className="health-name-col">
                      <Cpu size={16} className="text-cyan" />
                      <div>
                        <strong>Circuit Simulator Physics Engines</strong>
                        <span className="health-sub">5 mathematical solver models</span>
                      </div>
                    </div>
                    <div className="health-val-col">
                      <span className="health-badge bg-emerald">Operational</span>
                      <span className="health-latency">Client WebAssembly</span>
                    </div>
                  </div>

                  <div className="health-row">
                    <div className="health-name-col">
                      <Lock size={16} className="text-purple" />
                      <div>
                        <strong>Institution Access Code Validator</strong>
                        <span className="health-sub">LSAI code prefix authentication gateway</span>
                      </div>
                    </div>
                    <div className="health-val-col">
                      <span className="health-badge bg-emerald">Operational</span>
                      <span className="health-latency">0 auth locks</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pending Approvals Summary */}
              <div className="card admin-action-card">
                <div className="card-header-simple">
                  <div className="card-title-group">
                    <Building2 size={18} className="text-amber" />
                    <h3 className="card-title-text">Pending Institution Approvals</h3>
                  </div>
                  <span className="status-pill status-pill-warning">
                    {requests.length} Requests Awaiting Review
                  </span>
                </div>

                <p className="card-desc-text">
                  New colleges that submitted registrations requesting a unique institution code and laboratory workspace.
                </p>

                <div className="pending-requests-quick-list">
                  {requests.slice(0, 2).map((req) => (
                    <div key={req.id} className="pending-quick-item">
                      <div className="quick-item-details">
                        <strong>{req.name}</strong>
                        <span>{req.city}, {req.state} • Coordinator: {req.contactName}</span>
                      </div>
                      <button
                        type="button"
                        className="btn btn-sm btn-primary"
                        onClick={() => {
                          setSelectedRequest(req);
                          setActiveTab('requests');
                        }}
                      >
                        <span>Review</span>
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  className="btn btn-secondary btn-block mt-3"
                  onClick={() => setActiveTab('requests')}
                >
                  <span>Open Full Requests Queue ({requests.length})</span>
                </button>
              </div>
            </div>

            {/* Quick Demo Guidance Card */}
            <div className="card role-explanation-card mt-3">
              <div className="role-explanation-header">
                <Info size={18} className="text-blue" />
                <h4>Super Admin Role Isolation & Boundaries</h4>
              </div>
              <p>
                <strong>Role Distinction:</strong> Platform Super Admin manages global infrastructure, reviews new college registrations, views multi-institutional telemetry, and monitors security logs. Super Admins do not grade student lab submissions or teach courses. For college-specific student and faculty administration, switch to the <strong>Institution Admin</strong> role.
              </p>
            </div>
          </div>
        )}

        {/* =====================================================================
            TAB 2: INSTITUTION REGISTRATION REQUESTS QUEUE
           ===================================================================== */}
        {activeTab === 'requests' && (
          <div className="superadmin-tab-view">
            <div className="section-header-row">
              <div>
                <h3 className="section-main-title">Institution Registration Requests Queue</h3>
                <p className="section-main-subtitle">
                  Review and verify incoming college applications. Approving a request generates a unique institution code and unlocks their departmental workspace.
                </p>
              </div>
              <div className="queue-status-counter">
                <span>{requests.length} Awaiting Review</span>
              </div>
            </div>

            {requests.length === 0 ? (
              <div className="card empty-state-card text-center p-5">
                <CheckCircle2 size={48} className="text-emerald mx-auto mb-2" />
                <h4>All Institution Requests Processed</h4>
                <p className="text-muted">
                  There are currently no pending registration requests awaiting administrative approval.
                </p>
                <button
                  type="button"
                  className="btn btn-secondary mt-2"
                  onClick={() => setActiveTab('directory')}
                >
                  <span>View Active Institutions Directory</span>
                </button>
              </div>
            ) : (
              <div className="requests-table-wrapper card">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Institution Name & Type</th>
                      <th>Location</th>
                      <th>Contact Person & Email</th>
                      <th>Est. Students</th>
                      <th>Applied Date</th>
                      <th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((req) => (
                      <tr key={req.id} className={selectedRequest?.id === req.id ? 'row-selected' : ''}>
                        <td>
                          <div className="table-inst-cell">
                            <strong>{req.name}</strong>
                            <span className="inst-type-tag">{req.type}</span>
                            <span className="inst-dept-preview">
                              Proposed Depts: {req.proposedDepts.join(', ')}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span className="cell-location">{req.city}, {req.state}</span>
                          <span className="cell-country">{req.country}</span>
                        </td>
                        <td>
                          <span className="cell-contact-name">{req.contactName}</span>
                          <span className="cell-contact-desig">{req.contactDesignation}</span>
                          <a href={`mailto:${req.contactEmail}`} className="cell-contact-email">
                            {req.contactEmail}
                          </a>
                        </td>
                        <td>
                          <span className="cell-number">~{req.estStudents.toLocaleString()}</span>
                        </td>
                        <td>
                          <span className="cell-date">{req.appliedDate}</span>
                        </td>
                        <td className="text-right">
                          <div className="action-buttons-group">
                            <button
                              type="button"
                              className="btn btn-sm btn-emerald"
                              onClick={() => handleApproveRequest(req)}
                              title="Approve and issue unique institution code"
                            >
                              <Check size={14} />
                              <span>Approve & Issue Code</span>
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-ghost-red"
                              onClick={() => handleRejectRequest(req.id, req.name)}
                              title="Reject registration request"
                            >
                              <XCircle size={14} />
                              <span>Reject</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* =====================================================================
            TAB 3: INSTITUTIONS DIRECTORY
           ===================================================================== */}
        {activeTab === 'directory' && (
          <div className="superadmin-tab-view">
            <div className="section-header-row">
              <div>
                <h3 className="section-main-title">Enrolled Institutions Directory</h3>
                <p className="section-main-subtitle">
                  Directory of all active and suspended colleges, unique institution codes, and department administrator contacts.
                </p>
              </div>

              {/* Filter Controls */}
              <div className="table-controls-row">
                <div className="search-input-wrapper">
                  <Search size={16} className="search-icon" />
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Search by college, code, or city..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="filter-select-wrapper">
                  <Filter size={15} />
                  <select
                    className="form-control form-control-sm"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">All Statuses</option>
                    <option value="active">Active Only</option>
                    <option value="suspended">Suspended Only</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="card admin-table-card">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Institution & Unique Code</th>
                    <th>Location</th>
                    <th>Assigned Admin</th>
                    <th>Students</th>
                    <th>Faculty</th>
                    <th>Diagnostic Runs</th>
                    <th>Status</th>
                    <th className="text-right">Administration</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInstitutions.map((inst) => (
                    <tr key={inst.id}>
                      <td>
                        <div className="table-inst-cell">
                          <strong>{inst.name}</strong>
                          <div className="code-pill-row">
                            <span className="code-pill-mono">{inst.code}</span>
                            <button
                              type="button"
                              className="btn-pill-copy"
                              onClick={() => handleCopyCode(inst.code)}
                              title="Copy code"
                            >
                              {copiedCode === inst.code ? <Check size={12} className="text-emerald" /> : <Copy size={12} />}
                            </button>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="cell-location">{inst.city}, {inst.state}</span>
                      </td>
                      <td>
                        <span className="cell-contact-name">{inst.adminName}</span>
                        <span className="cell-contact-email">{inst.adminEmail}</span>
                      </td>
                      <td>
                        <span className="cell-number">{inst.studentsCount.toLocaleString()}</span>
                      </td>
                      <td>
                        <span className="cell-number">{inst.facultyCount}</span>
                      </td>
                      <td>
                        <span className="cell-number text-cyan">{inst.diagnosticsCount.toLocaleString()}</span>
                      </td>
                      <td>
                        <span className={`status-pill ${inst.status === 'active' ? 'status-pill-ready' : 'status-pill-error'}`}>
                          {inst.status === 'active' ? 'Active' : 'Suspended'}
                        </span>
                      </td>
                      <td className="text-right">
                        <div className="action-buttons-group">
                          <button
                            type="button"
                            className={`btn btn-sm ${inst.status === 'active' ? 'btn-ghost-amber' : 'btn-ghost-emerald'}`}
                            onClick={() => handleToggleInstitutionStatus(inst.id)}
                          >
                            <span>{inst.status === 'active' ? 'Suspend Access' : 'Reactivate'}</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* =====================================================================
            TAB 4: PLATFORM & AI TELEMETRY
           ===================================================================== */}
        {activeTab === 'analytics' && (
          <div className="superadmin-tab-view">
            <div className="section-header-row">
              <div>
                <h3 className="section-main-title">Platform Usage & AI Model Telemetry</h3>
                <p className="section-main-subtitle">
                  Aggregated telemetry across all institutions, multimodal model inference latency, and breadboard analysis distribution.
                </p>
              </div>
              <span className="status-pill status-pill-ready">
                <span className="status-dot dot-live" /> Real-time Telemetry Active
              </span>
            </div>

            <div className="telemetry-grid">
              {/* Gemma 4 Model Metrics */}
              <div className="card telemetry-card">
                <div className="telemetry-card-header">
                  <Cpu size={20} className="text-purple" />
                  <h4>Gemma 4 31B-IT Multimodal Diagnostic Engine</h4>
                </div>
                <div className="telemetry-stats-list">
                  <div className="telemetry-stat-row">
                    <span>Average Vision Processing Time</span>
                    <strong>412 ms</strong>
                  </div>
                  <div className="telemetry-stat-row">
                    <span>Structured 8-Section Output Verification</span>
                    <strong className="text-emerald">99.8% Schema Compliance</strong>
                  </div>
                  <div className="telemetry-stat-row">
                    <span>Multimodal Image Resolutions Handled</span>
                    <strong>Up to 4096 × 3072 px</strong>
                  </div>
                  <div className="telemetry-stat-row">
                    <span>Fault Identification Confidence Knee</span>
                    <strong>94.6% High-Confidence Ratio</strong>
                  </div>
                </div>
              </div>

              {/* Lab Course Distribution */}
              <div className="card telemetry-card">
                <div className="telemetry-card-header">
                  <Layers size={20} className="text-blue" />
                  <h4>Curriculum Lab Distribution</h4>
                </div>
                <div className="distribution-bars-list">
                  <div className="distribution-bar-item">
                    <div className="dist-label-row">
                      <span>Analog Electronics & Diode Circuits</span>
                      <strong>42% (37,556 runs)</strong>
                    </div>
                    <div className="bar-track">
                      <div className="bar-fill bg-blue" style={{ width: '42%' }} />
                    </div>
                  </div>

                  <div className="distribution-bar-item">
                    <div className="dist-label-row">
                      <span>Digital Logic & Gate Characteristics</span>
                      <strong>28% (25,037 runs)</strong>
                    </div>
                    <div className="bar-track">
                      <div className="bar-fill bg-emerald" style={{ width: '28%' }} />
                    </div>
                  </div>

                  <div className="distribution-bar-item">
                    <div className="dist-label-row">
                      <span>Microcontrollers & Sensor Interfaces</span>
                      <strong>18% (16,095 runs)</strong>
                    </div>
                    <div className="bar-track">
                      <div className="bar-fill bg-purple" style={{ width: '18%' }} />
                    </div>
                  </div>

                  <div className="distribution-bar-item">
                    <div className="dist-label-row">
                      <span>Power Electronics & Rectifiers</span>
                      <strong>12% (10,732 runs)</strong>
                    </div>
                    <div className="bar-track">
                      <div className="bar-fill bg-amber" style={{ width: '12%' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
            TAB 5: AUDIT & SECURITY LOG
           ===================================================================== */}
        {activeTab === 'audit' && (
          <div className="superadmin-tab-view">
            <div className="section-header-row">
              <div>
                <h3 className="section-main-title">Platform Security & Audit Log</h3>
                <p className="section-main-subtitle">
                  Immutable record of administrative actions, institution code verification events, and security access checkpoints.
                </p>
              </div>
              <button
                type="button"
                className="btn btn-sm btn-secondary"
                onClick={() => alert('Demonstration: Full platform audit trail exported in CSV/JSON format.')}
              >
                <span>Export Audit Log</span>
              </button>
            </div>

            <div className="card audit-log-card">
              <div className="audit-list">
                {auditLogs.map((log) => (
                  <div key={log.id} className="audit-item">
                    <div className="audit-badge-col">
                      {log.severity === 'success' && <CheckCircle2 size={18} className="text-emerald" />}
                      {log.severity === 'warning' && <AlertCircle size={18} className="text-amber" />}
                      {log.severity === 'info' && <Info size={18} className="text-blue" />}
                    </div>
                    <div className="audit-content-col">
                      <div className="audit-meta-row">
                        <span className="audit-actor">{log.actor}</span>
                        <span className="audit-time">{log.timestamp}</span>
                      </div>
                      <p className="audit-action-text">{log.action}</p>
                      <span className="audit-target-badge">{log.target}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
