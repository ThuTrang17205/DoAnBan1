import React from 'react';
import './ErrorBoundary.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
   
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    this.setState(prevState => ({
      error,
      errorInfo,
      errorCount: prevState.errorCount + 1
    }));

    
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    this.logErrorToService(error, errorInfo);
  }

  logErrorToService(error, errorInfo) {
 
    try {
  
    } catch (e) {
      console.error('Failed to log error:', e);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });

    
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      
      return (
        <div className="error-boundary-container">
          <div className="error-boundary-content">
            {}
            <div className="error-icon">
              {this.state.errorCount > 3 ? '' : ''}
            </div>

            {}
            <h1 className="error-title">
              {this.state.errorCount > 3 
                ? 'Ối! Có vấn đề nghiêm trọng' 
                : 'Oops! Có gì đó không ổn'
              }
            </h1>

            {}
            <p className="error-description">
              {this.state.errorCount > 3
                ? 'Ứng dụng gặp nhiều lỗi liên tiếp. Vui lòng tải lại trang hoặc liên hệ hỗ trợ.'
                : 'Đã xảy ra lỗi không mong muốn. Đừng lo, chúng tôi đã ghi nhận và sẽ khắc phục sớm nhất.'}
            </p>

            {}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="error-details">
                <summary>Chi tiết lỗi (Dev only)</summary>
                <div className="error-stack">
                  <p>
                    <strong>Error:</strong> {this.state.error.toString()}
                  </p>
                  {this.state.errorInfo && (
                    <pre>
                      <strong>Component Stack:</strong>
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </div>
              </details>
            )}

            {}
            <div className="error-actions">
              <button 
                onClick={this.handleReset} 
                className="btn-primary"
              >
                 Thử lại
              </button>
              
              <button 
                onClick={this.handleGoHome} 
                className="btn-secondary"
              >
                 Về trang chủ
              </button>

              {this.state.errorCount > 2 && (
                <button 
                  onClick={this.handleReload} 
                  className="btn-warning"
                >
                   Tải lại trang
                </button>
              )}
            </div>

            {}
            <p className="error-help">
              Nếu vấn đề vẫn tiếp diễn, vui lòng{' '}
              <a href="mailto:support@example.com" className="error-link">
                liên hệ hỗ trợ
              </a>
            </p>

            {}
            {this.state.errorCount > 1 && (
              <div className="error-badge">
                Đã xảy ra {this.state.errorCount} lỗi
              </div>
            )}
          </div>
        </div>
      );
    }

    
    return this.props.children;
  }
}


export function withErrorBoundary(Component, errorBoundaryProps = {}) {
  return function WrappedComponent(props) {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}


export function SimpleErrorFallback({ error, resetError }) {
  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <h2> Có lỗi xảy ra</h2>
      <p style={{ color: '#666', marginBottom: '20px' }}>
        Xin lỗi vì sự bất tiện này.
      </p>
      {error && (
        <pre style={{ 
          background: '#f5f5f5', 
          padding: '10px', 
          borderRadius: '4px',
          fontSize: '12px',
          textAlign: 'left',
          overflow: 'auto'
        }}>
          {error.toString()}
        </pre>
      )}
      <button 
        onClick={resetError}
        style={{
          padding: '10px 20px',
          background: '#4a90e2',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          marginTop: '20px'
        }}
      >
        Thử lại
      </button>
    </div>
  );
}

export function MinimalErrorFallback() {
  return (
    <div style={{ 
      padding: '20px', 
      textAlign: 'center',
      color: '#e74c3c'
    }}>
      <p> Không thể tải nội dung này</p>
    </div>
  );
}

export default ErrorBoundary;