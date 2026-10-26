import React, { useState } from 'react';
import {
  Building2,
  Users,
  GraduationCap,
  BookOpen,
  KeyRound,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Copy,
  Check,
  Search,
  Filter,
  Plus,
  RotateCcw,
  PauseCircle,
  FileText,
  Clock,
  Layers,
  ChevronRight,
  Info,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function InstitutionAdminDashboard() {
  const { profile, switchDemoRole } = useAuth();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'instructors' | 'students' | 'subjects' | 'code' | 'analytics'
  const [activeCode, setActiveCode] = useState('LSAI-VVCE-A7K2');
  const [copiedCode, setCopiedCode] = useState(false);
  const [enrollmentPaused, setEnrollmentPaused] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState(null);

  // Search & Filter States
  const [studentSearch, setStudentSearch] = useState('');
  const [studentSemesterFilter, setStudentSemesterFilter] = useState('all');
  const [facultySearch, setFacultySearch] = useState('');

  // Instructors Roster State
  const [instructors, setInstructors] = useState([
    {
      id: 'fac-01',
      name: 'Dr. K. S. Sharma',
      staffId: 'VVCE-FAC-ECE-108',
      designation: 'Associate Professor & Lab Coordinator',
      email: 'dr.sharma@labsense.edu',
      assignedSubjects: ['Analog Electronics Lab (21EC32)', 'Digital System Design Lab (21EC33)'],
      studentsCount: 168,
      status: 'approved',
      joinedDate: '2024-01-10',
    },
    {
      id: 'fac-02',
      name: 'Dr. Raghavendra Rao',
      staffId: 'VVCE-FAC-ECE-119',
      designation: 'Professor & Microcontroller Lead',
      email: 'raghavendra.rao@vvce.ac.in',
      assignedSubjects: ['Microcontroller & Embedded Systems Lab (21EC42)', 'Digital Signal Processing Lab (21EC62)'],
      studentsCount: 142,
      status: 'approved',
      joinedDate: '2023-08-01',
    },
    {
      id: 'fac-03',
      name: 'Prof. Lakshmi Narayana',
      staffId: 'VVCE-FAC-ECE-112',
      designation: 'Assistant Professor (Senior Scale)',
      email: 'lakshmi.n@vvce.ac.in',
      assignedSubjects: ['VLSI Design & Simulation Lab (21EC52)'],
      studentsCount: 120,
      status: 'approved',
      joinedDate: '2024-03-15',
    },
    {
      id: 'fac-04',
      name: 'Prof. Deepa Nayak',
      staffId: 'VVCE-FAC-ECE-124',
      designation: 'Assistant Professor',
      email: 'deepa.nayak@vvce.ac.in',
      assignedSubjects: ['Analog Electronics Lab (21EC32)', 'Advanced Communication & Microwave Lab (21EC63)'],
      studentsCount: 154,
      status: 'approved',
      joinedDate: '2025-01-20',
    },
    {
      id: 'fac-05',
      name: 'Prof. Harish Kumar',
      staffId: 'VVCE-FAC-ECE-131',
      designation: 'Lecturer / Lab Instructor',
      email: 'harish.k@vvce.ac.in',
      assignedSubjects: ['Analog Electronics Lab (21EC32)'],
      studentsCount: 0,
      status: 'pending',
      joinedDate: '2026-10-22',
    },
  ]);

  // Students Roster State
  const [students, setStudents] = useState([
    {
      id: 'std-01',
      name: 'Alex Morgan',
      usn: '4VV21EC042',
      semester: '6th Semester',
      section: 'A',
      enrolledSubjects: ['Analog Electronics', 'Digital Logic', 'Microcontrollers'],
      completedLabs: 14,
      avgDiagnosticScore: '94%',
      status: 'active',
    },
    {
      id: 'std-02',
      name: 'Maya Patel',
      usn: '4VV21EC055',
      semester: '6th Semester',
      section: 'A',
      enrolledSubjects: ['Analog Electronics', 'Digital Logic', 'Microcontrollers'],
      completedLabs: 12,
      avgDiagnosticScore: '88%',
      status: 'active',
    },
    {
      id: 'std-03',
      name: 'Rahul Verma',
      usn: '4VV21EC071',
      semester: '6th Semester',
      section: 'B',
      enrolledSubjects: ['Analog Electronics', 'Digital Logic', 'Microcontrollers'],
      completedLabs: 11,
      avgDiagnosticScore: '82%',
      status: 'active',
    },
    {
      id: 'std-04',
      name: 'Sneha Reddy',
      usn: '4VV22EC018',
      semester: '4th Semester',
      section: 'A',
      enrolledSubjects: ['Microcontroller & Embedded Systems Lab'],
      completedLabs: 8,
      avgDiagnosticScore: '91%',
      status: 'active',
    },
    {
      id: 'std-05',
      name: 'Tanmay Joshi',
      usn: '4VV22EC039',
      semester: '4th Semester',
      section: 'B',
      enrolledSubjects: ['Microcontroller & Embedded Systems Lab'],
      completedLabs: 7,
      avgDiagnosticScore: '79%',
      status: 'active',
    },
    {
      id: 'std-06',
      name: 'Ananya Deshmukh',
      usn: '4VV23EC011',
      semester: '3rd Semester',
      section: 'A',
      enrolledSubjects: ['Analog Electronics Lab', 'Digital System Design Lab'],
      completedLabs: 5,
      avgDiagnosticScore: '86%',
      status: 'active',
    },
  ]);

  // Subjects & Lab Modules State
  const [subjects, setSubjects] = useState([
    {
      code: '21EC32',
      name: 'Analog Electronics Laboratory',
      semester: '3rd Semester',
      department: 'ECE',
      leadInstructor: 'Dr. K. S. Sharma',
      coInstructors: ['Prof. Deepa Nayak', 'Prof. Harish Kumar'],
      experimentCount: 12,
      enrolledStudents: 168,
      status: 'active',
    },
    {
      code: '21EC33',
      name: 'Digital System Design Laboratory',
      semester: '3rd Semester',
      department: 'ECE',
      leadInstructor: 'Dr. K. S. Sharma',
      coInstructors: [],
      experimentCount: 10,
      enrolledStudents: 168,
      status: 'active',
    },
    {
      code: '21EC42',
      name: 'Microcontroller & Embedded Systems Lab',
      semester: '4th Semester',
      department: 'ECE',
      leadInstructor: 'Dr. Raghavendra Rao',
      coInstructors: [],
      experimentCount: 10,
      enrolledStudents: 142,
      status: 'active',
    },
    {
      code: '21EC52',
      name: 'VLSI Design & Simulation Lab',
      semester: '5th Semester',
      department: 'ECE',
      leadInstructor: 'Prof. Lakshmi Narayana',
      coInstructors: [],
      experimentCount: 8,
      enrolledStudents: 120,
      status: 'active',
    },
    {
      code: '21EC62',
      name: 'Digital Signal Processing Lab',
      semester: '6th Semester',
      department: 'ECE',
      leadInstructor: 'Dr. Raghavendra Rao',
      coInstructors: [],
      experimentCount: 8,
      enrolledStudents: 136,
      status: 'active',
    },
    {
      code: '21EC63',
      name: 'Advanced Communication & Microwave Lab',
      semester: '6th Semester',
      department: 'ECE',
      leadInstructor: 'Prof. Deepa Nayak',
      coInstructors: [],
      experimentCount: 6,
      enrolledStudents: 136,
      status: 'active',
    },
  ]);

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(activeCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2200);
  };

  const handleRotateCode = () => {
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const newCode = `LSAI-VVCE-${randomSuffix}`;
    setActiveCode(newCode);
    setFeedbackMsg(`Institution code rotated successfully to: ${newCode}. Previous code was revoked.`);
    setTimeout(() => setFeedbackMsg(null), 4500);
  };

  const handleToggleFacultyApproval = (facId) => {
    setInstructors(
      instructors.map((fac) => {
        if (fac.id === facId) {
          const nextStatus = fac.status === 'approved' ? 'suspended' : 'approved';
          return { ...fac, status: nextStatus };
        }
        return fac;
      })
    );
  };

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.usn.toLowerCase().includes(studentSearch.toLowerCase());
    const matchesSem = studentSemesterFilter === 'all' || s.semester === studentSemesterFilter;
    return matchesSearch && matchesSem;
  });

  const filteredInstructors = instructors.filter((fac) =>
    fac.name.toLowerCase().includes(facultySearch.toLowerCase()) ||
    fac.staffId.toLowerCase().includes(facultySearch.toLowerCase()) ||
    fac.email.toLowerCase().includes(facultySearch.toLowerCase())
  );

  return (
    <div className="portal-container inst-admin-portal">
      {/* Top Banner */}
      <div className="inst-admin-banner">
        <div className="admin-banner-info">
          <div className="inst-logo-badge">
            <Building2 size={24} className="text-white" />
          </div>
          <div>
            <div className="banner-title-row">
              <h2 className="banner-inst-name">Vidyavardhaka College of Engineering (VVCE)</h2>
              <span className="inst-badge-primary">College Admin Console</span>
            </div>
            <p className="banner-inst-dept">
              Department of Electronics & Communication Engineering • Mysore, Karnataka • Administrator: <strong>{profile?.full_name || 'Prof. B. S. Gowda'}</strong>
            </p>
          </div>
        </div>

        {/* Active Code Display in Banner */}
        <div className="banner-code-box">
          <div className="code-box-header">
            <span className="code-label">COLLEGE INVITATION CODE</span>
            <span className={`code-status-pill ${enrollmentPaused ? 'pill-paused' : 'pill-active'}`}>
              {enrollmentPaused ? 'Enrollment Paused' : 'Active'}
            </span>
          </div>
          <div className="code-action-row">
            <span className="code-text-display">{activeCode}</span>
            <button
              type="button"
              className="btn-copy-banner-code"
              onClick={handleCopyCode}
              title="Copy institution code to share with students and faculty"
            >
              {copiedCode ? <Check size={15} className="text-emerald" /> : <Copy size={15} />}
              <span>{copiedCode ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>
      </div>

      {feedbackMsg && (
        <div className="modal-alert modal-alert-success mt-3 mb-2">
          <CheckCircle2 size={18} />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Subnavigation Bar */}
      <div className="portal-subnav inst-admin-subnav">
        <div className="subnav-header">
          <div className="portal-badge admin-badge">
            <ShieldCheck size={16} />
            <span>Institution Workspace Administration</span>
          </div>
        </div>

        <nav className="portal-tabs" aria-label="Institution Admin Navigation">
          <button
            type="button"
            className={`portal-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <TrendingUp size={18} />
            <span>Overview</span>
          </button>

          <button
            type="button"
            className={`portal-tab-btn ${activeTab === 'instructors' ? 'active' : ''}`}
            onClick={() => setActiveTab('instructors')}
          >
            <Users size={18} />
            <span>Instructors</span>
            <span className="tab-counter-badge counter-secondary">{instructors.length}</span>
          </button>

          <button
            type="button"
            className={`portal-tab-btn ${activeTab === 'students' ? 'active' : ''}`}
            onClick={() => setActiveTab('students')}
          >
            <GraduationCap size={18} />
            <span>Students Roster</span>
            <span className="tab-counter-badge counter-secondary">842</span>
          </button>

          <button
            type="button"
            className={`portal-tab-btn ${activeTab === 'subjects' ? 'active' : ''}`}
            onClick={() => setActiveTab('subjects')}
          >
            <BookOpen size={18} />
            <span>Subjects & Labs</span>
            <span className="tab-counter-badge counter-secondary">{subjects.length}</span>
          </button>

          <button
            type="button"
            className={`portal-tab-btn ${activeTab === 'code' ? 'active' : ''}`}
            onClick={() => setActiveTab('code')}
          >
            <KeyRound size={18} />
            <span>Invitation Code</span>
          </button>

          <button
            type="button"
            className={`portal-tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            <Layers size={18} />
            <span>College Analytics</span>
          </button>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="portal-content">
        {/* =====================================================================
            TAB 1: COLLEGE OVERVIEW
           ===================================================================== */}
        {activeTab === 'overview' && (
          <div className="admin-tab-view">
            {/* KPI Cards */}
            <div className="kpi-metrics-grid">
              <div className="kpi-metric-card border-blue">
                <div className="metric-header">
                  <span className="metric-label">ENROLLED STUDENTS</span>
                  <div className="metric-icon-box bg-blue">
                    <GraduationCap size={18} className="text-white" />
                  </div>
                </div>
                <div className="metric-value-row">
                  <span className="metric-value">842</span>
                  <span className="metric-trend text-emerald">Active learners</span>
                </div>
                <span className="metric-footer-note">Across 3rd, 4th, 5th, and 6th semesters</span>
              </div>

              <div className="kpi-metric-card border-emerald">
                <div className="metric-header">
                  <span className="metric-label">DEPARTMENT FACULTY</span>
                  <div className="metric-icon-box bg-emerald">
                    <Users size={18} className="text-white" />
                  </div>
                </div>
                <div className="metric-value-row">
                  <span className="metric-value">28</span>
                  <span className="metric-trend text-emerald">4 leads active</span>
                </div>
                <span className="metric-footer-note">ECE Laboratory Coordinators & Professors</span>
              </div>

              <div className="kpi-metric-card border-indigo">
                <div className="metric-header">
                  <span className="metric-label">ACTIVE LAB SUBJECTS</span>
                  <div className="metric-icon-box bg-indigo">
                    <BookOpen size={18} className="text-white" />
                  </div>
                </div>
                <div className="metric-value-row">
                  <span className="metric-value">6 Labs</span>
                  <span className="metric-trend text-cyan">54 experiments</span>
                </div>
                <span className="metric-footer-note">VTU Syllabus aligned modules</span>
              </div>

              <div className="kpi-metric-card border-purple">
                <div className="metric-header">
                  <span className="metric-label">TROUBLESHOOTING RUNS</span>
                  <div className="metric-icon-box bg-purple">
                    <TrendingUp size={18} className="text-white" />
                  </div>
                </div>
                <div className="metric-value-row">
                  <span className="metric-value">14,210</span>
                  <span className="metric-trend text-cyan">Gemma 4 AI</span>
                </div>
                <span className="metric-footer-note">Physical bench telemetry checks completed</span>
              </div>
            </div>

            {/* Quick Actions & Code Distribution Banner */}
            <div className="admin-overview-grid">
              {/* Code Distribution Guide */}
              <div className="card overview-card">
                <div className="card-header-simple">
                  <div className="card-title-group">
                    <KeyRound size={18} className="text-blue" />
                    <h3 className="card-title-text">Institution Code & Student Access</h3>
                  </div>
                </div>

                <div className="overview-code-highlight">
                  <div>
                    <span className="highlight-label">CURRENT ACTIVE CODE</span>
                    <span className="highlight-code">{activeCode}</span>
                  </div>
                  <button
                    type="button"
                    className="btn btn-sm btn-primary"
                    onClick={handleCopyCode}
                  >
                    {copiedCode ? <Check size={14} /> : <Copy size={14} />}
                    <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
                  </button>
                </div>

                <p className="card-sub-instruction">
                  Share this code with incoming ECE lab batches. When creating their LabSense AI accounts, students enter this code to join the VVCE workspace and unlock departmental experiments.
                </p>

                <div className="card-actions-row">
                  <button
                    type="button"
                    className="btn btn-sm btn-secondary"
                    onClick={() => setActiveTab('code')}
                  >
                    <span>Manage Invitation Settings</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>

              {/* Faculty Review Status */}
              <div className="card overview-card">
                <div className="card-header-simple">
                  <div className="card-title-group">
                    <UserCheck size={18} className="text-emerald" />
                    <h3 className="card-title-text">Faculty Roster & Subject Assignment</h3>
                  </div>
                  <span className="status-pill status-pill-ready">
                    4 Approved • 1 Pending
                  </span>
                </div>

                <p className="card-desc-text">
                  Instructors can only author experiments and view submissions for subjects you assign to them.
                </p>

                <div className="faculty-quick-preview-list">
                  {instructors.slice(0, 3).map((fac) => (
                    <div key={fac.id} className="faculty-quick-item">
                      <div className="quick-item-details">
                        <strong>{fac.name}</strong>
                        <span>{fac.staffId} • {fac.assignedSubjects[0]}</span>
                      </div>
                      <span className={`status-pill ${fac.status === 'approved' ? 'status-pill-ready' : 'status-pill-warning'}`}>
                        {fac.status}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  className="btn btn-secondary btn-block mt-3"
                  onClick={() => setActiveTab('instructors')}
                >
                  <span>Manage All Instructors ({instructors.length})</span>
                </button>
              </div>
            </div>

            {/* Role Boundaries Explanation */}
            <div className="card role-explanation-card mt-3">
              <div className="role-explanation-header">
                <Info size={18} className="text-blue" />
                <h4>Institution Admin Role Isolation</h4>
              </div>
              <p>
                As <strong>Institution Administrator</strong> for Vidyavardhaka College of Engineering, you control student enrollment, manage faculty authorization, assign subjects, and distribute invitation codes for your college. You cannot see student records from other institutions.
              </p>
            </div>
          </div>
        )}

        {/* =====================================================================
            TAB 2: INSTRUCTORS MANAGEMENT
           ===================================================================== */}
        {activeTab === 'instructors' && (
          <div className="admin-tab-view">
            <div className="section-header-row">
              <div>
                <h3 className="section-main-title">Department Instructors & Faculty Roster</h3>
                <p className="section-main-subtitle">
                  Verify instructor privileges and assign courses. Faculty accounts require institutional administrator approval before authoring lab experiments.
                </p>
              </div>

              <div className="table-controls-row">
                <div className="search-input-wrapper">
                  <Search size={16} className="search-icon" />
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Search faculty by name, ID, or email..."
                    value={facultySearch}
                    onChange={(e) => setFacultySearch(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="card admin-table-card">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Instructor Name & Staff ID</th>
                    <th>Designation & Email</th>
                    <th>Assigned Lab Subjects</th>
                    <th>Students Under Supervision</th>
                    <th>Approval Status</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInstructors.map((fac) => (
                    <tr key={fac.id}>
                      <td>
                        <div className="table-inst-cell">
                          <strong>{fac.name}</strong>
                          <span className="code-pill-mono">{fac.staffId}</span>
                        </div>
                      </td>
                      <td>
                        <span className="cell-contact-desig">{fac.designation}</span>
                        <a href={`mailto:${fac.email}`} className="cell-contact-email">{fac.email}</a>
                      </td>
                      <td>
                        <div className="assigned-subjects-tags">
                          {fac.assignedSubjects.map((sub, i) => (
                            <span key={i} className="subject-badge">{sub}</span>
                          ))}
                        </div>
                      </td>
                      <td>
                        <span className="cell-number">{fac.studentsCount} students</span>
                      </td>
                      <td>
                        <span className={`status-pill ${fac.status === 'approved' ? 'status-pill-ready' : 'status-pill-warning'}`}>
                          {fac.status === 'approved' ? 'Approved' : 'Pending Approval'}
                        </span>
                      </td>
                      <td className="text-right">
                        <div className="action-buttons-group">
                          <button
                            type="button"
                            className={`btn btn-sm ${fac.status === 'approved' ? 'btn-ghost-amber' : 'btn-emerald'}`}
                            onClick={() => handleToggleFacultyApproval(fac.id)}
                          >
                            <span>{fac.status === 'approved' ? 'Suspend' : 'Approve Faculty'}</span>
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
            TAB 3: STUDENTS ROSTER
           ===================================================================== */}
        {activeTab === 'students' && (
          <div className="admin-tab-view">
            <div className="section-header-row">
              <div>
                <h3 className="section-main-title">Enrolled Students Roster</h3>
                <p className="section-main-subtitle">
                  Students associated with Vidyavardhaka College of Engineering who registered using institution code {activeCode}.
                </p>
              </div>

              <div className="table-controls-row">
                <div className="search-input-wrapper">
                  <Search size={16} className="search-icon" />
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Search by student name or USN..."
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                  />
                </div>

                <div className="filter-select-wrapper">
                  <Filter size={15} />
                  <select
                    className="form-control form-control-sm"
                    value={studentSemesterFilter}
                    onChange={(e) => setStudentSemesterFilter(e.target.value)}
                  >
                    <option value="all">All Semesters</option>
                    <option value="3rd Semester">3rd Semester</option>
                    <option value="4th Semester">4th Semester</option>
                    <option value="6th Semester">6th Semester</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="card admin-table-card">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Student Name & USN</th>
                    <th>Semester & Section</th>
                    <th>Enrolled Lab Subjects</th>
                    <th>Labs Completed</th>
                    <th>Diagnostic Score</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((std) => (
                    <tr key={std.id}>
                      <td>
                        <div className="table-inst-cell">
                          <strong>{std.name}</strong>
                          <span className="code-pill-mono">{std.usn}</span>
                        </div>
                      </td>
                      <td>
                        <span className="cell-location">{std.semester} (Sec {std.section})</span>
                      </td>
                      <td>
                        <div className="assigned-subjects-tags">
                          {std.enrolledSubjects.map((sub, i) => (
                            <span key={i} className="subject-badge">{sub}</span>
                          ))}
                        </div>
                      </td>
                      <td>
                        <span className="cell-number text-cyan">{std.completedLabs} labs</span>
                      </td>
                      <td>
                        <span className="score-badge text-emerald">{std.avgDiagnosticScore}</span>
                      </td>
                      <td>
                        <span className="status-pill status-pill-ready">Active</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* =====================================================================
            TAB 4: SUBJECTS & LABS
           ===================================================================== */}
        {activeTab === 'subjects' && (
          <div className="admin-tab-view">
            <div className="section-header-row">
              <div>
                <h3 className="section-main-title">Department Laboratory Curriculum</h3>
                <p className="section-main-subtitle">
                  Lab courses offered by the Department of ECE, assigned faculty leads, and active experiment procedures.
                </p>
              </div>

              <button
                type="button"
                className="btn btn-sm btn-primary"
                onClick={() => alert('Future backend capability: Add new lab course module.')}
              >
                <Plus size={15} />
                <span>Add Lab Course</span>
              </button>
            </div>

            <div className="subjects-grid">
              {subjects.map((sub) => (
                <div key={sub.code} className="card subject-card">
                  <div className="subject-card-header">
                    <div className="subject-code-pill">{sub.code}</div>
                    <span className="subject-sem-tag">{sub.semester}</span>
                  </div>

                  <h4 className="subject-name">{sub.name}</h4>

                  <div className="subject-meta-list">
                    <div className="subject-meta-item">
                      <span className="meta-label">Lead Faculty:</span>
                      <strong>{sub.leadInstructor}</strong>
                    </div>
                    {sub.coInstructors.length > 0 && (
                      <div className="subject-meta-item">
                        <span className="meta-label">Co-Instructors:</span>
                        <span>{sub.coInstructors.join(', ')}</span>
                      </div>
                    )}
                    <div className="subject-meta-item">
                      <span className="meta-label">Experiment Procedures:</span>
                      <strong className="text-cyan">{sub.experimentCount} Active Labs</strong>
                    </div>
                    <div className="subject-meta-item">
                      <span className="meta-label">Enrolled Cohort:</span>
                      <span>{sub.enrolledStudents} students</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =====================================================================
            TAB 5: INVITATION CODE MANAGEMENT
           ===================================================================== */}
        {activeTab === 'code' && (
          <div className="admin-tab-view">
            <div className="section-header-row">
              <div>
                <h3 className="section-main-title">Institution Invitation Code Management</h3>
                <p className="section-main-subtitle">
                  Configure and distribute your college's unique access code for student cohorts and faculty onboarding.
                </p>
              </div>
            </div>

            <div className="card code-management-card">
              <div className="code-display-large">
                <span className="code-meta-eyebrow">ACTIVE INSTITUTION CODE</span>
                <span className="code-large-text">{activeCode}</span>
                <p className="code-summary-line">
                  Valid for <strong>Vidyavardhaka College of Engineering</strong> • Term 2026-2027
                </p>
              </div>

              <div className="code-action-buttons-group">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleCopyCode}
                >
                  {copiedCode ? <Check size={16} /> : <Copy size={16} />}
                  <span>{copiedCode ? 'Copied to Clipboard!' : 'Copy Code'}</span>
                </button>

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleRotateCode}
                  title="Generate a new code key and revoke the previous code"
                >
                  <RotateCcw size={16} />
                  <span>Rotate Institution Code</span>
                </button>

                <button
                  type="button"
                  className={`btn ${enrollmentPaused ? 'btn-emerald' : 'btn-secondary'}`}
                  onClick={() => setEnrollmentPaused(!enrollmentPaused)}
                >
                  <PauseCircle size={16} />
                  <span>{enrollmentPaused ? 'Resume Enrollments' : 'Pause Enrollments'}</span>
                </button>
              </div>

              {/* Instructions Box */}
              <div className="code-instructions-box mt-4">
                <h5>How Code Distribution Works</h5>
                <ul>
                  <li>
                    <strong>Student Onboarding:</strong> Distribute `{activeCode}` during lab orientation. Students register their accounts with this code to automatically gain access to VVCE lab courses.
                  </li>
                  <li>
                    <strong>Faculty Verification:</strong> Faculty who use this code during sign-up appear in your <em>Instructors</em> tab and must be approved by you before authoring experiments.
                  </li>
                  <li>
                    <strong>Term Transition:</strong> At the start of a new academic term, click <em>Rotate Institution Code</em> to generate a fresh code and revoke previous access for new registrations.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
            TAB 6: COLLEGE ANALYTICS
           ===================================================================== */}
        {activeTab === 'analytics' && (
          <div className="admin-tab-view">
            <div className="section-header-row">
              <div>
                <h3 className="section-main-title">College Laboratory Analytics</h3>
                <p className="section-main-subtitle">
                  Troubleshooting trends, common student circuit mistakes identified by Gemma 4, and lab completion rates.
                </p>
              </div>
            </div>

            <div className="analytics-cards-grid">
              {/* Most Frequent Wiring Faults */}
              <div className="card analytics-card">
                <h4>Top Student Circuit Faults Identified by Gemma 4</h4>
                <p className="text-muted mb-3">Based on 14,210 breadboard analyses at VVCE</p>

                <div className="faults-breakdown-list">
                  <div className="fault-item">
                    <div className="fault-label-row">
                      <span>Semiconductor / LED Reversed Polarity</span>
                      <strong>38% (5,400 runs)</strong>
                    </div>
                    <div className="bar-track">
                      <div className="bar-fill bg-blue" style={{ width: '38%' }} />
                    </div>
                  </div>

                  <div className="fault-item">
                    <div className="fault-label-row">
                      <span>Breadboard Center Rail Discontinuity</span>
                      <strong>29% (4,120 runs)</strong>
                    </div>
                    <div className="bar-track">
                      <div className="bar-fill bg-purple" style={{ width: '29%' }} />
                    </div>
                  </div>

                  <div className="fault-item">
                    <div className="fault-label-row">
                      <span>Incorrect Current-Limiting Resistor Value</span>
                      <strong>21% (2,980 runs)</strong>
                    </div>
                    <div className="bar-track">
                      <div className="bar-fill bg-amber" style={{ width: '21%' }} />
                    </div>
                  </div>

                  <div className="fault-item">
                    <div className="fault-label-row">
                      <span>Floating Gate / Unconnected Ground</span>
                      <strong>12% (1,710 runs)</strong>
                    </div>
                    <div className="bar-track">
                      <div className="bar-fill bg-emerald" style={{ width: '12%' }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Lab Completion by Semester */}
              <div className="card analytics-card">
                <h4>Syllabus Completion by Semester Cohort</h4>
                <p className="text-muted mb-3">Mid-term progress across departmental labs</p>

                <div className="semester-progress-list">
                  <div className="sem-prog-item">
                    <div className="sem-label-row">
                      <span>3rd Semester ECE (Analog & Digital Labs)</span>
                      <strong className="text-emerald">82% Completed</strong>
                    </div>
                    <div className="bar-track">
                      <div className="bar-fill bg-emerald" style={{ width: '82%' }} />
                    </div>
                  </div>

                  <div className="sem-prog-item">
                    <div className="sem-label-row">
                      <span>4th Semester ECE (Microcontrollers)</span>
                      <strong className="text-cyan">74% Completed</strong>
                    </div>
                    <div className="bar-track">
                      <div className="bar-fill bg-cyan" style={{ width: '74%' }} />
                    </div>
                  </div>

                  <div className="sem-prog-item">
                    <div className="sem-label-row">
                      <span>5th Semester ECE (VLSI Lab)</span>
                      <strong className="text-blue">68% Completed</strong>
                    </div>
                    <div className="bar-track">
                      <div className="bar-fill bg-blue" style={{ width: '68%' }} />
                    </div>
                  </div>

                  <div className="sem-prog-item">
                    <div className="sem-label-row">
                      <span>6th Semester ECE (DSP & Microwave)</span>
                      <strong className="text-purple">61% Completed</strong>
                    </div>
                    <div className="bar-track">
                      <div className="bar-fill bg-purple" style={{ width: '61%' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
