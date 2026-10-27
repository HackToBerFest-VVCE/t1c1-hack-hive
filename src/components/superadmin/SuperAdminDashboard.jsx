import React, { useState, useEffect } from 'react';
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
  Info,
  Edit2,
  UserCheck,
  Ban,
  Shield,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

export default function SuperAdminDashboard() {
  const { profile, switchDemoRole } = useAuth();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'requests' | 'directory' | 'users' | 'analytics' | 'audit'
  const [copiedCode, setCopiedCode] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [approvalFeedback, setApprovalFeedback] = useState(null);

  // Live Supabase Sync States
  const [liveLoading, setLiveLoading] = useState(false);
  const [liveError, setLiveError] = useState(null);
  const [liveSuccess, setLiveSuccess] = useState(null);
  const [isLiveConnected, setIsLiveConnected] = useState(false);

  // User Governance State
  const [users, setUsers] = useState([
    {
      id: '00000000-0000-0000-0000-000000000001',
      full_name: 'Darshan R',
      email: 'alex.student@labsense.edu',
      role: 'student',
      institution_code: 'LSAI-VVCE-A7K2',
      department: 'Electronics & Communication Engineering',
      usn: '4VV21EC042',
      status: 'active',
      created_at: '2026-09-01T10:00:00Z',
    },
    {
      id: '00000000-0000-0000-0000-000000000002',
      full_name: 'Dr. Chethan M S',
      email: 'dr.sharma@labsense.edu',
      role: 'instructor',
      institution_code: 'LSAI-VVCE-A7K2',
      department: 'Electronics & Communication Engineering',
      staff_id: 'VVCE-FAC-ECE-108',
      status: 'active',
      created_at: '2026-08-15T09:30:00Z',
    },
    {
      id: '00000000-0000-0000-0000-000000000003',
      full_name: 'Prof. Chinmayi D A',
      email: 'admin.vvce@labsense.edu',
      role: 'institution_admin',
      institution_code: 'LSAI-VVCE-A7K2',
      department: 'Office of Academic Dean & Labs',
      designation: 'Principal & Institutional Workspace Admin',
      status: 'active',
      created_at: '2026-08-01T08:00:00Z',
    },
    {
      id: '00000000-0000-0000-0000-000000000004',
      full_name: 'Harshith T S',
      email: 'superadmin@labsense.io',
      role: 'platform_super_admin',
      institution_code: 'GLOBAL-SUPER-ROOT',
      department: 'Global Governance',
      designation: 'Platform Super Administrator',
      status: 'active',
      created_at: '2026-06-01T00:00:00Z',
    },
  ]);

  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userSearch, setUserSearch] = useState('');
  const [userStatusFilter, setUserStatusFilter] = useState('all');
  const [selectedUserForEdit, setSelectedUserForEdit] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null); // { title, message, onConfirm, confirmLabel, isDestructive }

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
      adminName: 'Prof. Chinmayi D A',
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
      actor: 'Harshith T S (Platform Super Admin)',
      action: 'Super Admin Governance Console Authenticated',
      target: 'Platform Global Scope',
      severity: 'info',
    },
    {
      id: 'log-102',
      timestamp: 'Today at 09:15 AM',
      actor: 'Prof. Chinmayi D A (VVCE Admin)',
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
      actor: 'Harshith T S',
      action: 'Approved Registration Request for PSG College of Technology',
      target: 'LSAI-PSGC-K5T9 Generated',
      severity: 'info',
    },
  ]);

  // Live Database Sync
  const fetchLivePlatformData = async () => {
    if (!isSupabaseConfigured || !supabase) return;
    setLiveLoading(true);
    setLiveError(null);
    try {
      // 1. Fetch institutions
      const { data: instData, error: instErr } = await supabase
        .from('institutions')
        .select('*')
        .order('created_at', { ascending: false });

      if (instErr) throw instErr;

      if (instData) {
        setIsLiveConnected(true);
        const approved = instData.filter((i) => i.status === 'approved' || i.status === 'suspended');
        const pending = instData.filter((i) => i.status === 'pending');
        if (approved.length > 0) setInstitutions(approved);
        if (pending.length > 0) setRequests(pending);
      }

      // 2. Fetch profiles
      const { data: profData, error: profErr } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (!profErr && profData && profData.length > 0) {
        setUsers(profData);
      }

      // 3. Fetch audit logs
      const { data: auditData, error: auditErr } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (!auditErr && auditData && auditData.length > 0) {
        setAuditLogs(auditData);
      }

      setLiveSuccess('Successfully synchronized records with live Supabase database.');
      setTimeout(() => setLiveSuccess(null), 4000);
    } catch (err) {
      console.warn('Supabase live query notice:', err.message);
      setIsLiveConnected(false);
      setLiveError(
        err.message.includes('relation') || err.message.includes('does not exist')
          ? 'Database tables not yet created in your Supabase project. Apply migration files 001 and 002 in the Supabase SQL Editor. Operating in demonstration mode.'
          : `Live sync notice: ${err.message}. Operating in demonstration mode.`
      );
    } finally {
      setLiveLoading(false);
    }
  };

  useEffect(() => {
    fetchLivePlatformData();
  }, []);

  const handleCopyCode = (code) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleApproveRequest = async (req) => {
    // Generate new code
    const words = req.name.split(/\s+/);
    const prefix = words.map((w) => w[0].toUpperCase()).slice(0, 4).join('');
    const newCode = `LSAI-${prefix}-G${Math.floor(100 + Math.random() * 900)}`;

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.rpc('approve_institution', {
          p_institution_id: req.id
        });
        if (error) {
          await supabase.from('institutions').update({ status: 'approved' }).eq('id', req.id);
        }
        await fetchLivePlatformData();
      } catch (e) {
        console.warn('Live approve error:', e);
      }
    }

    const newInst = {
      id: req.id || `inst-${Date.now()}`,
      name: req.name,
      code: req.code || newCode,
      city: req.city,
      state: req.state,
      adminName: req.contactName,
      adminEmail: req.contactEmail,
      studentsCount: 0,
      facultyCount: 1,
      activeLabs: (req.proposedDepts || []).length * 2 || 4,
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
        actor: `${profile?.full_name || 'Harshith T S'} (Super Admin)`,
        action: `Approved registration for ${req.name}. Assigned unique code ${req.code || newCode}.`,
        target: req.name,
        severity: 'success',
      },
      ...auditLogs,
    ]);

    setApprovalFeedback(`Successfully approved ${req.name}! Assigned code: ${req.code || newCode}`);
    setTimeout(() => setApprovalFeedback(null), 4000);
  };

  const handleRejectRequest = async (reqId, instName) => {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('institutions').update({ status: 'rejected' }).eq('id', reqId);
        await fetchLivePlatformData();
      } catch (e) {
        console.warn('Live reject error:', e);
      }
    }

    setRequests(requests.filter((r) => r.id !== reqId));
    setSelectedRequest(null);
    setAuditLogs([
      {
        id: `log-${Date.now()}`,
        timestamp: 'Just now',
        actor: `${profile?.full_name || 'Harshith T S'} (Super Admin)`,
        action: `Rejected registration request from ${instName}.`,
        target: instName,
        severity: 'warning',
      },
      ...auditLogs,
    ]);
  };

  const handleToggleInstitutionStatus = async (instId) => {
    const inst = institutions.find((i) => i.id === instId);
    if (!inst) return;
    const nextStatus = inst.status === 'active' ? 'suspended' : 'active';

    setConfirmModal({
      title: nextStatus === 'suspended' ? 'Suspend Institution Workspace?' : 'Reactivate Institution?',
      message: nextStatus === 'suspended'
        ? `Are you sure you want to suspend workspace access for "${inst.name}" (${inst.code})? All students and faculty under this institution will be temporarily blocked from laboratory actions.`
        : `Re-enable active workspace access for "${inst.name}" (${inst.code})?`,
      confirmLabel: nextStatus === 'suspended' ? 'Suspend Institution' : 'Reactivate',
      isDestructive: nextStatus === 'suspended',
      onConfirm: async () => {
        if (isSupabaseConfigured && supabase) {
          try {
            await supabase.from('institutions').update({ status: nextStatus }).eq('id', instId);
            await fetchLivePlatformData();
          } catch (e) {
            console.warn('Live toggle institution error:', e);
          }
        }
        setInstitutions(
          institutions.map((i) => (i.id === instId ? { ...i, status: nextStatus } : i))
        );
        setAuditLogs([
          {
            id: `log-${Date.now()}`,
            timestamp: 'Just now',
            actor: `${profile?.full_name || 'Harshith T S'} (Super Admin)`,
            action: `Changed status of ${inst.name} to ${nextStatus.toUpperCase()}`,
            target: inst.name,
            severity: nextStatus === 'suspended' ? 'warning' : 'info',
          },
          ...auditLogs,
        ]);
        setConfirmModal(null);
        setApprovalFeedback(`Updated status of ${inst.name} to ${nextStatus}`);
        setTimeout(() => setApprovalFeedback(null), 3000);
      },
    });
  };

  const handleToggleUserStatus = (user) => {
    const nextStatus = user.status === 'active' ? 'suspended' : 'active';
    setConfirmModal({
      title: nextStatus === 'suspended' ? 'Suspend User Access?' : 'Reactivate User Account?',
      message: nextStatus === 'suspended'
        ? `Are you sure you want to suspend access for ${user.full_name} (${user.email})? They will be immediately blocked from logging into the platform.`
        : `Re-enable platform access for ${user.full_name} (${user.email})?`,
      confirmLabel: nextStatus === 'suspended' ? 'Suspend Account' : 'Reactivate',
      isDestructive: nextStatus === 'suspended',
      onConfirm: async () => {
        if (isSupabaseConfigured && supabase) {
          try {
            await supabase.from('profiles').update({ status: nextStatus }).eq('id', user.id);
            await fetchLivePlatformData();
          } catch (e) {
            console.warn('Live toggle user status error:', e);
          }
        }
        setUsers(users.map((u) => (u.id === user.id ? { ...u, status: nextStatus } : u)));
        setAuditLogs([
          {
            id: `log-${Date.now()}`,
            timestamp: 'Just now',
            actor: `${profile?.full_name || 'Harshith T S'} (Super Admin)`,
            action: `Changed account status of ${user.full_name} to ${nextStatus.toUpperCase()}`,
            target: user.full_name,
            severity: nextStatus === 'suspended' ? 'warning' : 'info',
          },
          ...auditLogs,
        ]);
        setConfirmModal(null);
        setApprovalFeedback(`Updated account status for ${user.full_name} to ${nextStatus}`);
        setTimeout(() => setApprovalFeedback(null), 3000);
      },
    });
  };

  const handleSaveUserEdit = async (updatedFields) => {
    if (!selectedUserForEdit) return;
    const targetId = selectedUserForEdit.id;
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase
          .from('profiles')
          .update(updatedFields)
          .eq('id', targetId);
        if (error) throw error;
        await fetchLivePlatformData();
      } catch (err) {
        console.warn('Update user profile error:', err.message);
      }
    }
    setUsers(users.map((u) => (u.id === targetId ? { ...u, ...updatedFields } : u)));
    setAuditLogs([
      {
        id: `log-${Date.now()}`,
        timestamp: 'Just now',
        actor: `${profile?.full_name || 'Harshith T S'} (Super Admin)`,
        action: `Updated role and profile details for ${selectedUserForEdit.full_name}. Role: ${updatedFields.role}, Status: ${updatedFields.status}.`,
        target: selectedUserForEdit.full_name,
        severity: 'info',
      },
      ...auditLogs,
    ]);
    setSelectedUserForEdit(null);
    setApprovalFeedback(`Successfully updated ${selectedUserForEdit.full_name}`);
    setTimeout(() => setApprovalFeedback(null), 3000);
  };

  const filteredInstitutions = institutions.filter((inst) => {
    const matchesSearch =
      (inst.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inst.code || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inst.city || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || inst.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      (u.full_name || '').toLowerCase().includes(userSearch.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(userSearch.toLowerCase()) ||
      (u.institution_code || '').toLowerCase().includes(userSearch.toLowerCase()) ||
      (u.usn || '').toLowerCase().includes(userSearch.toLowerCase()) ||
      (u.staff_id || '').toLowerCase().includes(userSearch.toLowerCase());

    const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter;
    const matchesStatus = userStatusFilter === 'all' || u.status === userStatusFilter;
    return matchesSearch && matchesRole && matchesStatus;
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
              Global administrator view for <strong>{profile?.full_name || 'Harshith T S'}</strong> ({profile?.email || 'superadmin@labsense.io'}). Platform-wide management across all member colleges.
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

      {liveLoading && (
        <div className="modal-alert mt-3 mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RefreshCw size={16} className="animate-spin text-cyan" />
            <span>Synchronizing live records from Supabase...</span>
          </div>
        </div>
      )}

      {liveSuccess && (
        <div className="modal-alert modal-alert-success mt-3 mb-2">
          <CheckCircle2 size={18} />
          <span>{liveSuccess}</span>
        </div>
      )}

      {liveError && (
        <div className="modal-alert modal-alert-warning mt-3 mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} className="text-amber flex-shrink-0" />
            <span style={{ fontSize: '13px' }}>{liveError}</span>
          </div>
          <button
            type="button"
            className="btn btn-xs btn-secondary"
            onClick={fetchLivePlatformData}
            style={{ marginLeft: '12px', whiteSpace: 'nowrap' }}
          >
            Retry Live Sync
          </button>
        </div>
      )}

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
          {isSupabaseConfigured && (
            <button
              type="button"
              className="btn btn-xs btn-ghost-cyan"
              onClick={fetchLivePlatformData}
              title="Query Supabase for real-time institution & user updates"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <RefreshCw size={12} className={liveLoading ? 'animate-spin' : ''} />
              <span>{isLiveConnected ? 'Supabase Live' : 'Sync Supabase'}</span>
            </button>
          )}
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
            className={`portal-tab-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <Users size={18} />
            <span>User Governance</span>
            <span className="tab-counter-badge counter-secondary">{users.length}</span>
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
            TAB 4: USER GOVERNANCE (STUDENTS, INSTRUCTORS, ADMINS)
           ===================================================================== */}
        {activeTab === 'users' && (
          <div className="superadmin-tab-view">
            <div className="section-header-row">
              <div>
                <h3 className="section-main-title">Platform User Governance</h3>
                <p className="section-main-subtitle">
                  Authorized roster management across Students, Instructors, College Workspace Admins, and Super Admins.
                </p>
              </div>
              <div className="flex gap-2">
                <span className="status-pill status-pill-ready">
                  {filteredUsers.length} Users Listed
                </span>
              </div>
            </div>

            {/* Filter Toolbar */}
            <div className="directory-toolbar mb-4">
              <div className="search-box-input-wrapper">
                <Search size={16} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search user by name, email, institution code, USN, or staff ID..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="search-input"
                />
              </div>

              <div className="status-filter-pills">
                <button
                  type="button"
                  className={`status-pill-btn ${userRoleFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setUserRoleFilter('all')}
                >
                  All Roles
                </button>
                <button
                  type="button"
                  className={`status-pill-btn ${userRoleFilter === 'student' ? 'active' : ''}`}
                  onClick={() => setUserRoleFilter('student')}
                >
                  Students
                </button>
                <button
                  type="button"
                  className={`status-pill-btn ${userRoleFilter === 'instructor' ? 'active' : ''}`}
                  onClick={() => setUserRoleFilter('instructor')}
                >
                  Instructors
                </button>
                <button
                  type="button"
                  className={`status-pill-btn ${userRoleFilter === 'institution_admin' ? 'active' : ''}`}
                  onClick={() => setUserRoleFilter('institution_admin')}
                >
                  College Admins
                </button>
                <button
                  type="button"
                  className={`status-pill-btn ${userRoleFilter === 'platform_super_admin' ? 'active' : ''}`}
                  onClick={() => setUserRoleFilter('platform_super_admin')}
                >
                  Super Admins
                </button>
              </div>

              <select
                className="select-status-filter"
                value={userStatusFilter}
                onChange={(e) => setUserStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="active">Active Accounts</option>
                <option value="suspended">Suspended Accounts</option>
              </select>
            </div>

            {/* Users Table */}
            <div className="card institutions-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>User & Identity</th>
                    <th>Platform Role</th>
                    <th>Institution Workspace</th>
                    <th>Identifier / Dept</th>
                    <th>Account Status</th>
                    <th className="text-right">Governance Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center p-6 text-slate-400">
                        No user accounts match the selected filters.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr key={u.id}>
                        <td>
                          <div className="inst-meta-col">
                            <span className="inst-name">{u.full_name || 'Anonymous User'}</span>
                            <span className="inst-city-state">{u.email}</span>
                          </div>
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              u.role === 'platform_super_admin'
                                ? 'badge-purple'
                                : u.role === 'institution_admin'
                                ? 'badge-amber'
                                : u.role === 'instructor'
                                ? 'badge-blue'
                                : 'badge-emerald'
                            }`}
                          >
                            {u.role === 'platform_super_admin'
                              ? 'Platform Super Admin'
                              : u.role === 'institution_admin'
                              ? 'College Admin'
                              : u.role === 'instructor'
                              ? 'Instructor'
                              : 'Student'}
                          </span>
                        </td>
                        <td>
                          <span className="font-mono text-cyan" style={{ fontSize: '13px' }}>
                            {u.institution_code || 'UNASSIGNED'}
                          </span>
                        </td>
                        <td>
                          <div className="text-xs text-slate-300">
                            <div>{u.usn ? `USN: ${u.usn}` : u.staff_id ? `Staff ID: ${u.staff_id}` : 'General'}</div>
                            <div className="text-slate-400">{u.department || 'All Departments'}</div>
                          </div>
                        </td>
                        <td>
                          <span
                            className={`status-pill ${
                              u.status === 'active' ? 'status-pill-ready' : 'status-pill-warning'
                            }`}
                          >
                            <span
                              className={`status-dot ${
                                u.status === 'active' ? 'dot-live' : 'dot-warn'
                              }`}
                            />
                            {u.status === 'active' ? 'Active' : 'Suspended'}
                          </span>
                        </td>
                        <td className="text-right">
                          <div className="row-actions-group" style={{ justifyContent: 'flex-end', gap: '8px' }}>
                            <button
                              type="button"
                              className="btn btn-sm btn-secondary"
                              onClick={() => setSelectedUserForEdit(u)}
                              title="Edit user profile, role, or institution assignment"
                            >
                              <Edit2 size={13} />
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              className={`btn btn-sm ${
                                u.status === 'active' ? 'btn-ghost-amber' : 'btn-ghost-emerald'
                              }`}
                              onClick={() => handleToggleUserStatus(u)}
                            >
                              <span>{u.status === 'active' ? 'Suspend' : 'Activate'}</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
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

      {/* Edit User Modal */}
      {selectedUserForEdit && (
        <div className="auth-modal-backdrop" onClick={() => setSelectedUserForEdit(null)}>
          <div
            className="auth-modal-card"
            style={{ maxWidth: '520px', width: '100%', margin: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="auth-modal-header">
              <div className="flex items-center gap-2">
                <Shield size={20} className="text-cyan" />
                <h3 className="auth-modal-title">Edit User Record</h3>
              </div>
              <button
                type="button"
                className="btn-modal-close"
                onClick={() => setSelectedUserForEdit(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="auth-modal-body" style={{ padding: '20px' }}>
              <div className="mb-4">
                <label className="text-xs text-slate-400 block mb-1">User Full Name</label>
                <input
                  type="text"
                  className="search-input w-full"
                  value={selectedUserForEdit.full_name || ''}
                  onChange={(e) =>
                    setSelectedUserForEdit({ ...selectedUserForEdit, full_name: e.target.value })
                  }
                />
              </div>

              <div className="mb-4">
                <label className="text-xs text-slate-400 block mb-1">Email Address</label>
                <input
                  type="email"
                  disabled
                  className="search-input w-full opacity-60 cursor-not-allowed"
                  value={selectedUserForEdit.email || ''}
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Assigned Role</label>
                  <select
                    className="select-status-filter w-full"
                    value={selectedUserForEdit.role || 'student'}
                    onChange={(e) =>
                      setSelectedUserForEdit({ ...selectedUserForEdit, role: e.target.value })
                    }
                  >
                    <option value="student">Student</option>
                    <option value="instructor">Instructor</option>
                    <option value="institution_admin">College Admin</option>
                    <option value="platform_super_admin">Platform Super Admin</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Account Status</label>
                  <select
                    className="select-status-filter w-full"
                    value={selectedUserForEdit.status || 'active'}
                    onChange={(e) =>
                      setSelectedUserForEdit({ ...selectedUserForEdit, status: e.target.value })
                    }
                  >
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label className="text-xs text-slate-400 block mb-1">Institution Code</label>
                <input
                  type="text"
                  className="search-input w-full"
                  value={selectedUserForEdit.institution_code || ''}
                  onChange={(e) =>
                    setSelectedUserForEdit({ ...selectedUserForEdit, institution_code: e.target.value })
                  }
                  placeholder="e.g. LSAI-VVCE-A7K2"
                />
              </div>

              <div className="mb-4">
                <label className="text-xs text-slate-400 block mb-1">Department</label>
                <input
                  type="text"
                  className="search-input w-full"
                  value={selectedUserForEdit.department || ''}
                  onChange={(e) =>
                    setSelectedUserForEdit({ ...selectedUserForEdit, department: e.target.value })
                  }
                  placeholder="e.g. Electronics & Communication Engineering"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setSelectedUserForEdit(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() =>
                    handleSaveUserEdit({
                      full_name: selectedUserForEdit.full_name,
                      role: selectedUserForEdit.role,
                      status: selectedUserForEdit.status,
                      institution_code: selectedUserForEdit.institution_code,
                      department: selectedUserForEdit.department,
                    })
                  }
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {confirmModal && (
        <div className="auth-modal-backdrop" onClick={() => setConfirmModal(null)}>
          <div
            className="auth-modal-card"
            style={{ maxWidth: '440px', width: '100%', margin: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="auth-modal-header">
              <div className="flex items-center gap-2">
                <AlertCircle
                  size={20}
                  className={confirmModal.isDestructive ? 'text-amber' : 'text-cyan'}
                />
                <h3 className="auth-modal-title">{confirmModal.title}</h3>
              </div>
              <button
                type="button"
                className="btn-modal-close"
                onClick={() => setConfirmModal(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="auth-modal-body" style={{ padding: '20px' }}>
              <p className="text-slate-300 text-sm mb-6 leading-relaxed">
                {confirmModal.message}
              </p>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setConfirmModal(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className={`btn ${
                    confirmModal.isDestructive ? 'btn-ghost-amber' : 'btn-primary'
                  }`}
                  onClick={confirmModal.onConfirm}
                >
                  {confirmModal.confirmLabel || 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
