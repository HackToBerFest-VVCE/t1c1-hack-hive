import React, { useState } from 'react';
import {
  MessageSquare,
  Send,
  CheckCircle2,
  Clock,
  Sparkles,
  PlusCircle,
  User,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

const INITIAL_STUDENT_QUESTIONS = [
  {
    id: 'q-101',
    title: 'Why is my series resistor measuring 3.1V instead of 5V?',
    experiment_title: 'LED Forward Characteristics & Current Limiting',
    description: 'When I measure voltage across the 220-Ohm series resistor with my multimeter, the display reads 3.12V. I thought the entire 5V supply was supposed to be across the resistor?',
    status: 'answered',
    created_at: 'Today, 2:15 PM',
    replies: [
      {
        id: 'r-1',
        author_name: 'Dr. Chethan M S',
        author_role: 'instructor',
        content: 'Hi Darshan! Remember Kirchhoff\'s Voltage Law (KVL): the sum of voltages around the loop must equal the supply voltage. The remaining ~1.88V is dropped across your forward-biased LED junction! 3.12V + 1.88V = 5.0V.',
        is_ai_drafted: true,
        created_at: 'Today, 2:24 PM',
      },
    ],
  },
  {
    id: 'q-102',
    title: 'Ohm meter reads 0.2 ohms when probes touched together',
    experiment_title: 'Ohm\'s Law Verification and Series-Parallel Networks',
    description: 'Before measuring my resistor network, I shorted the multimeter leads and noticed it says 0.2 ohms rather than 0.0 ohms. Will this throw off my experiment calculations?',
    status: 'open',
    created_at: 'Today, 3:40 PM',
    replies: [],
  },
];

export default function StudentQuestions() {
  const [questions, setQuestions] = useState(INITIAL_STUDENT_QUESTIONS);
  const [selectedQuestion, setSelectedQuestion] = useState(INITIAL_STUDENT_QUESTIONS[0]);

  // New question form state
  const [showNewForm, setShowNewForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newExp, setNewExp] = useState('LED Forward Characteristics & Current Limiting');
  const [newDesc, setNewDesc] = useState('');

  // Follow-up reply state
  const [replyText, setReplyText] = useState('');

  const handleCreateQuestion = (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDesc.trim()) return;

    const newQ = {
      id: `q-${Date.now()}`,
      title: newTitle.trim(),
      experiment_title: newExp,
      description: newDesc.trim(),
      status: 'open',
      created_at: 'Just now',
      replies: [],
    };

    setQuestions([newQ, ...questions]);
    setSelectedQuestion(newQ);
    setShowNewForm(false);
    setNewTitle('');
    setNewDesc('');
  };

  const handleSendReply = (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedQuestion) return;

    const newReply = {
      id: `r-${Date.now()}`,
      author_name: 'Darshan R',
      author_role: 'student',
      content: replyText.trim(),
      is_ai_drafted: false,
      created_at: 'Just now',
    };

    const updated = {
      ...selectedQuestion,
      replies: [...selectedQuestion.replies, newReply],
    };

    setSelectedQuestion(updated);
    setQuestions(questions.map((q) => (q.id === updated.id ? updated : q)));
    setReplyText('');
  };

  return (
    <div className="student-questions-layout">
      {/* Sidebar: Question List */}
      <div className="questions-sidebar card">
        <div className="card-header">
          <div className="card-title-group">
            <MessageSquare className="card-title-icon" size={20} />
            <div>
              <h2 className="card-title">Ask an Instructor</h2>
              <p className="card-subtitle">Direct asynchronous faculty assistance</p>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => setShowNewForm(!showNewForm)}
          >
            <PlusCircle size={15} />
            <span>New Ticket</span>
          </button>
        </div>

        <div className="card-body">
          <div className="questions-list">
            {questions.map((q) => {
              const isSelected = selectedQuestion?.id === q.id && !showNewForm;
              return (
                <div
                  key={q.id}
                  className={`question-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => {
                    setSelectedQuestion(q);
                    setShowNewForm(false);
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <div className="question-item-top">
                    <span className={`status-pill-sm status-${q.status}`}>
                      {q.status === 'open' && <Clock size={12} />}
                      {q.status === 'answered' && <CheckCircle2 size={12} />}
                      <span>{q.status.toUpperCase()}</span>
                    </span>
                    <span className="q-time">{q.created_at}</span>
                  </div>
                  <h4 className="q-title">{q.title}</h4>
                  <p className="q-exp-tag">{q.experiment_title}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Conversation Column */}
      <div className="questions-thread-col card">
        {showNewForm ? (
          /* Create New Question View */
          <div className="new-question-container">
            <div className="card-header">
              <h2 className="card-title">Ask Your Laboratory Instructor</h2>
              <p className="card-subtitle">Submit bench questions, schematic doubts, or unexpected readings</p>
            </div>

            <div className="card-body">
              <form onSubmit={handleCreateQuestion} className="new-q-form">
                <div className="form-group">
                  <label className="field-label" htmlFor="nq-exp">Associated Experiment</label>
                  <select
                    id="nq-exp"
                    className="form-control form-select"
                    value={newExp}
                    onChange={(e) => setNewExp(e.target.value)}
                  >
                    <option value="LED Forward Characteristics & Current Limiting">LED Forward Characteristics & Current Limiting</option>
                    <option value="Ohm's Law Verification and Series-Parallel Networks">Ohm's Law Verification and Series-Parallel Networks</option>
                    <option value="Voltage Divider and Potentiometric Transducer">Voltage Divider and Potentiometric Transducer</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="field-label" htmlFor="nq-title">Question Summary</label>
                  <input
                    id="nq-title"
                    type="text"
                    className="form-control"
                    placeholder="e.g. Why is my voltmeter reading fluctuating?"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="field-label" htmlFor="nq-desc">Detailed Problem Description & Bench Measurements</label>
                  <textarea
                    id="nq-desc"
                    rows={4}
                    className="form-control form-textarea"
                    placeholder="Describe what you observed, your supply voltage, and any multimeter readings..."
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    required
                  />
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">
                    <Send size={16} />
                    <span>Submit Question to Instructor</span>
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowNewForm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : selectedQuestion ? (
          /* Active Thread View */
          <div className="active-thread-container">
            <div className="card-header thread-header">
              <div>
                <div className="thread-meta-row">
                  <span className={`status-pill-sm status-${selectedQuestion.status}`}>
                    {selectedQuestion.status.toUpperCase()}
                  </span>
                  <span className="q-exp-tag">{selectedQuestion.experiment_title}</span>
                </div>
                <h2 className="card-title thread-title">{selectedQuestion.title}</h2>
              </div>
              <span className="thread-timestamp">{selectedQuestion.created_at}</span>
            </div>

            <div className="card-body thread-body">
              {/* Student Initial Post */}
              <div className="thread-message student-message">
                <div className="message-header">
                  <div className="author-info">
                    <User size={16} className="text-blue" />
                    <strong>Darshan R (Student)</strong>
                  </div>
                  <span className="message-time">{selectedQuestion.created_at}</span>
                </div>
                <p className="message-body">{selectedQuestion.description}</p>
              </div>

              {/* Replies Stream */}
              {selectedQuestion.replies.map((reply) => (
                <div
                  key={reply.id}
                  className={`thread-message ${reply.author_role === 'instructor' ? 'instructor-message' : 'student-message'}`}
                >
                  <div className="message-header">
                    <div className="author-info">
                      {reply.author_role === 'instructor' ? (
                        <>
                          <ShieldCheck size={16} className="text-blue" />
                          <strong>{reply.author_name} (Instructor)</strong>
                          {reply.is_ai_drafted && (
                            <span className="ai-assisted-pill" title="Drafted with Gemma 4 assistance & verified by instructor">
                              <Sparkles size={12} /> Gemma Co-Pilot Verified
                            </span>
                          )}
                        </>
                      ) : (
                        <>
                          <User size={16} className="text-blue" />
                          <strong>{reply.author_name}</strong>
                        </>
                      )}
                    </div>
                    <span className="message-time">{reply.created_at}</span>
                  </div>
                  <p className="message-body">{reply.content}</p>
                </div>
              ))}

              {selectedQuestion.replies.length === 0 && (
                <div className="empty-thread-notice">
                  <Clock size={20} className="text-slate" />
                  <span>Waiting for your laboratory instructor to review and reply.</span>
                </div>
              )}

              {/* Reply Input Form */}
              <form onSubmit={handleSendReply} className="thread-reply-form">
                <div className="reply-input-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Add a follow-up reply or share your latest reading..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={!replyText.trim()}
                  >
                    <Send size={16} />
                    <span>Reply</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          <div className="card-body empty-diagnosis-state">
            <MessageSquare size={36} className="empty-icon" />
            <h3>No Question Selected</h3>
            <p>Select a question ticket from the left or create a new one.</p>
          </div>
        )}
      </div>
    </div>
  );
}
