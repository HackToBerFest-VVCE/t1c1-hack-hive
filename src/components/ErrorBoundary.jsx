import React from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="portal-container error-boundary-container" style={{ padding: '3rem 1.5rem', maxWidth: '800px', margin: '0 auto' }}>
          <div className="card" style={{
            background: 'rgba(15, 23, 42, 0.95)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            borderRadius: '16px',
            padding: '2.5rem',
            textAlign: 'center',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
              color: '#ef4444'
            }}>
              <AlertTriangle size={32} />
            </div>

            <h2 style={{ color: '#f8fafc', fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.75rem' }}>
              {this.props.fallbackTitle || 'Section Display Notice'}
            </h2>

            <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: '1.6', maxWidth: '540px', margin: '0 auto 1.5rem' }}>
              An unexpected render issue occurred while loading this view. Your session and data remain safe.
            </p>

            {this.state.error?.message && (
              <div style={{
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                padding: '0.75rem 1rem',
                color: '#fca5a5',
                fontSize: '0.85rem',
                fontFamily: 'monospace',
                marginBottom: '1.75rem',
                textAlign: 'left',
                overflowX: 'auto'
              }}>
                {this.state.error.message}
              </div>
            )}

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={this.handleReset}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.25rem' }}
              >
                <RotateCcw size={16} />
                <span>Retry View</span>
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.href = '/';
                }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.25rem' }}
              >
                <Home size={16} />
                <span>Return to Home</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
