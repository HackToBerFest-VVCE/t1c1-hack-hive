import React, { useState } from 'react';
import {
  MessageSquare,
  Sparkles,
  CheckCircle2,
  Clock,
  Send,
  User,
  ShieldCheck,
  AlertCircle,
  Activity,
  Check
} from 'lucide-react';
import { draftInstructorReply } from '../../lib/api';

const INITIAL_INBOX_QUESTIONS = [
  {
    id: 't-101',
    student_name: 'Alex Morgan',
    student_email: 'alex.student@labsense.edu',
    experiment_title: 'LED Forward Characteristics & Current Limiting',
    title: 'Why is my series resistor measuring 3.1V instead of 5V?',
    description: 'When I measure voltage across the 220-Ohm series resistor with my multimeter, the display reads 3.12V. I thought the entire 5V supply was supposed to be across the resistor?',
    telemetry: { supply_voltage: '5.0V', measured_voltage: '3.12V', current: '14.1mA' },
    status: 'open',
    created_at: 'Today, 2:15 PM',
    replies: [],
  },
  {
    id: 't-102',
    student_name: 'Priya Rao',
    student_email: 'priya.rao@labsense.edu',
    experiment_title: 'Voltage Divider and Potentiometric Transducer',
    title: 'Output voltage drops to 0.45V when I connect my 1k load resistor',
    description: 'Without load, Vout is exactly 2.50V (two 10k resistors across 5V). But as soon as I connect my 1k load across the bottom resistor, it collapses to 0.45V. Is my breadboard broken?',
    telemetry: { supply_voltage: '5.0V', measured_voltage: '0.45V', current: '0.45mA' },
    status: 'open',
    created_at: 'Today, 3:30 PM',
    replies: [],
  },
];

export default function InstructorQuestions() {
  const [inbox, setInbox] = useState(INITIAL_INBOX_QUESTIONS);
  const [selectedTicket, setSelectedTicket] = useState(INITIAL_INBOX_QUESTIONS[0]);

  // Instructor drafting state
  const [replyContent, setReplyContent] = useState('');
  const [isDraftingAi, setIsDraftingAi] = useState(false);
  const [aiDraftMeta, setAiDraftMeta] = useState(null);

  // Gemma 4 Co-Pilot Drafting
  const handleGenerateAiDraft = async () => {
    if (!selectedTicket) return;
    setIsDraftingAi(true);
    setAiDraftMeta(null);
    try {
      const res = await draftInstructorReply({
        experiment_title: selectedTicket.experiment_title,
        student_description: selectedTicket.description,
        student_symptoms: '',
        student_measurements: selectedTicket.telemetry,
      });

      setReplyContent(res.draft_reply);
      setAiDraftMeta({
        checks: res.key_diagnostic_checks,
        teaching_note: res.teaching_note,
        model: res.model_identifier,
      });
    } catch (err) {
      alert(`AI drafting error: ${err.message}`);
    } finally {
      setIsDraftingAi(false);
    }
  };

  const handleSendResponse = (e) => {
    e.preventDefault();
    if (!replyContent.trim() || !selectedTicket) return;

    const newReply = {
      id: `r-${Date.now()}`,
      author_name: 'Dr. K. S. Sharma',
      author_role: 'instructor',
      content: replyContent.trim(),
      is_ai_drafted: Boolean(aiDraftMeta),
      created_at: 'Just now',
    };

    const updated = {
      ...selectedTicket,
      status: 'answered',
      replies: [...selectedTicket.replies, newReply],
    };

    setSelectedTicket(updated);
    setInbox(inbox.map((t) => (t.id === updated.id ? updated : t)));
    setReplyContent('');
    setAiDraftMeta(null);
  };

  const handleMarkResolved = () => {
    if (!selectedTicket) return;
    const updated = { ...selectedTicket, status: 'resolved' };
    setSelectedTicket(updated);
    setInbox(inbox.map((t) => (t.id === updated.id ? updated : t)));
  };

  return (
    <div className="instructor-questions-layout">
      {/* Inbox List */}
      <div className="inbox-sidebar card">
        <div className="card-header">
          <div className="card-title-group">
            <MessageSquare className="card-title-icon" size={20} />
            <div>
              <h2 className="card-title">Student Question Inbox</h2>
              <p className="card-subtitle">Asynchronous bench help tickets awaiting review</p>
            </div>
          </div>
        </div>

        <div className="card-body">
          <div className="inbox-list">
            {inbox.map((ticket) => {
              const isSelected = selectedTicket?.id === ticket.id;
              return (
                <div
                  key={ticket.id}
                  className={`inbox-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => {
                    setSelectedTicket(ticket);
                    setReplyContent('');
                    setAiDraftMeta(null);
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <div className="inbox-item-top">
                    <span className="student-author">{ticket.student_name}</span>
                    <span className={`status-pill-sm status-${ticket.status}`}>
                      {ticket.status.toUpperCase()}
                    </span>
                  </div>
                  <h4 className="inbox-item-title">{ticket.title}</h4>
                  <p className="inbox-item-exp">{ticket.experiment_title}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Ticket Details & Gemma Co-Pilot Workspace */}
      <div className="ticket-detail-col card">
        {selectedTicket ? (
          <div>
            <div className="card-header ticket-header">
              <div>
                <div className="ticket-badge-row">
                  <span className={`status-pill-sm status-${selectedTicket.status}`}>
                    {selectedTicket.status.toUpperCase()}
                  </span>
                  <span className="q-exp-tag">{selectedTicket.experiment_title}</span>
                </div>
                <h2 className="card-title">{selectedTicket.title}</h2>
                <p className="card-subtitle">
                  Submitted by <strong>{selectedTicket.student_name}</strong> ({selectedTicket.student_email}) • {selectedTicket.created_at}
                </p>
              </div>

              {selectedTicket.status !== 'resolved' && (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleMarkResolved}
                >
                  <Check size={14} />
                  <span>Mark Resolved</span>
                </button>
              )}
            </div>

            <div className="card-body">
              {/* Student Query Box */}
              <div className="student-inquiry-detail">
                <h4 className="detail-subheading">Student Problem Description:</h4>
                <p className="detail-desc">{selectedTicket.description}</p>

                {/* Bench Telemetry */}
                {selectedTicket.telemetry && (
                  <div className="telemetry-readout-pill">
                    <Activity size={14} className="text-blue" />
                    <span>Reported Readings: Supply = {selectedTicket.telemetry.supply_voltage}, Node = {selectedTicket.telemetry.measured_voltage}, Current = {selectedTicket.telemetry.current}</span>
                  </div>
                )}
              </div>

              {/* Conversation History */}
              {selectedTicket.replies.length > 0 && (
                <div className="previous-replies-section">
                  <h4 className="detail-subheading">Conversation History:</h4>
                  {selectedTicket.replies.map((r) => (
                    <div key={r.id} className="reply-card">
                      <div className="reply-meta">
                        <strong>{r.author_name} ({r.author_role})</strong>
                        <span>{r.created_at}</span>
                      </div>
                      <p className="reply-body">{r.content}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Gemma 4 Co-Pilot Drafting Workspace */}
              <div className="gemma-draft-workspace card">
                <div className="draft-workspace-header">
                  <div className="draft-header-title">
                    <Sparkles size={18} className="text-blue" />
                    <div>
                      <h4 className="workspace-title">Gemma 4 Instructor Co-Pilot</h4>
                      <p className="workspace-subtitle">
                        Draft a suggested response with human oversight. You have full editorial authority before sending.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={handleGenerateAiDraft}
                    disabled={isDraftingAi}
                  >
                    <Sparkles size={14} className={isDraftingAi ? 'spin-icon' : ''} />
                    <span>{isDraftingAi ? 'Gemma 4 Analyzing...' : 'Generate AI Draft Reply'}</span>
                  </button>
                </div>

                {/* AI Pedagogical Meta */}
                {aiDraftMeta && (
                  <div className="ai-meta-banner">
                    <div className="teaching-note-box">
                      <strong>Private Teaching Note (Not visible to student):</strong>
                      <p>{aiDraftMeta.teaching_note}</p>
                    </div>
                    {aiDraftMeta.checks?.length > 0 && (
                      <div className="checks-box">
                        <strong>Recommended Student Diagnostic Checks:</strong>
                        <ul>
                          {aiDraftMeta.checks.map((chk, i) => (
                            <li key={i}>• {chk}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Response Textarea */}
                <form onSubmit={handleSendResponse} className="draft-form">
                  <div className="form-group">
                    <label className="field-label" htmlFor="inst-reply-box">
                      Official Instructor Response (Editable)
                    </label>
                    <textarea
                      id="inst-reply-box"
                      rows={5}
                      className="form-control form-textarea"
                      placeholder="Type your response to the student or click 'Generate AI Draft Reply' above to populate..."
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      required
                    />
                  </div>

                  <div className="draft-actions">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={!replyContent.trim()}
                    >
                      <Send size={16} />
                      <span>Send Response to Student</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        ) : (
          <div className="card-body empty-diagnosis-state">
            <MessageSquare size={36} className="empty-icon" />
            <h3>No Ticket Selected</h3>
            <p>Select a student question ticket from the left inbox to review telemetry and reply.</p>
          </div>
        )}
      </div>
    </div>
  );
}
