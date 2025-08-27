import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('JARVIS Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="error-boundary">
          <div className="error-content">
            <h2>⚠️ JARVIS System Error</h2>
            <p>I apologize, sir. I seem to be experiencing technical difficulties.</p>
            <button 
              onClick={() => this.setState({ hasError: false })}
              className="retry-button"
            >
              Attempt System Recovery
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
