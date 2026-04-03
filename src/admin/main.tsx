import React, { Component, ErrorInfo, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import '../index.css';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Admin Panel Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/admin.html';
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '30px', fontFamily: 'sans-serif', maxWidth: '600px', margin: '40px auto', border: '1px solid #fecaca', borderRadius: '12px', backgroundColor: '#fef2f2', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
          <h2 style={{ color: '#dc2626', marginTop: 0 }}>⚠️ 后台系统渲染发生错误</h2>
          <div style={{ backgroundColor: '#fff', padding: '12px', borderRadius: '6px', border: '1px solid #fee2e2', overflowX: 'auto', marginBottom: '24px' }}>
            <code style={{ fontSize: '13px', color: '#991b1b', wordBreak: 'break-all' }}>{this.state.error?.toString()}</code>
          </div>
          <button 
            onClick={this.handleReset}
            style={{ padding: '12px 24px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', width: '100%', transition: 'background-color 0.2s' }}
          >
            重置后台系统
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
