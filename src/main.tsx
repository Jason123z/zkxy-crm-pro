import React, { Component, ErrorInfo, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

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
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/';
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '30px', fontFamily: 'sans-serif', maxWidth: '600px', margin: '40px auto', border: '1px solid #fecaca', borderRadius: '12px', backgroundColor: '#fef2f2', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
          <h2 style={{ color: '#dc2626', marginTop: 0 }}>⚠️ 系统遭遇渲染错误</h2>
          <p style={{ color: '#4b5563', marginBottom: '20px', lineHeight: '1.6' }}>
            <strong>您好！系统检测到了浏览器层面的致命错误。</strong><br/>
            这通常是因为您的浏览器专属本地缓存（localStorage）中，驻留着旧版本遗留的“格式不兼容”数据，导致前端界面在解析时彻底崩溃。由于缓存数据是跟随着特定的浏览器独立的，所以这可以解释为什么在某些浏览器能进，在旧的 Chrome 上却无限白屏。
          </p>
          <div style={{ backgroundColor: '#fff', padding: '12px', borderRadius: '6px', border: '1px solid #fee2e2', overflowX: 'auto', marginBottom: '24px' }}>
            <code style={{ fontSize: '13px', color: '#991b1b', wordBreak: 'break-all' }}>{this.state.error?.toString()}</code>
          </div>
          <button 
            onClick={this.handleReset}
            style={{ padding: '12px 24px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', width: '100%', transition: 'background-color 0.2s' }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}
          >
            一键清除浏览器异常数据并重置系统
          </button>
          <p style={{ color: '#9ca3af', fontSize: '12px', marginTop: '16px', textAlign: 'center' }}>
            * 重置系统会清除您在这个浏览器存储的测试标记，但不影响云端数据库，能 100% 修复这种本地白屏。
          </p>
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
