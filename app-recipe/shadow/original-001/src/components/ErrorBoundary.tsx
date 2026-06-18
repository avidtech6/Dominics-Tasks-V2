import React, { Component, ReactNode } from 'react';
import {
  getDerivedStateFromError,
  logError,
  getErrorContainerStyles,
  getErrorTitleStyles,
  getErrorMessageStyles,
  getDetailsStyles,
  getSummaryStyles,
  getStackTraceStyles,
  getReloadButtonStyles,
  formatErrorMessage,
  formatErrorDetails,
  createReloadHandler,
  shouldShowErrorUI
} from './ErrorBoundaryBehaviour';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: { componentStack?: string } | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return getDerivedStateFromError(error);
  }

  public componentDidCatch(error: Error, errorInfo: { componentStack?: string }) {
    logError(error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  public render() {
    if (shouldShowErrorUI(this.state.hasError)) {
      return (
        <div style={getErrorContainerStyles()}>
          <h2 style={getErrorTitleStyles()}>
            Something went wrong
          </h2>
          <div style={getErrorMessageStyles()}>
            <p><strong>Error:</strong> {formatErrorMessage(this.state.error)}</p>
          </div>
          <details style={getDetailsStyles()}>
            <summary style={getSummaryStyles()}>
              Show technical details
            </summary>
            <pre style={getStackTraceStyles()}>
              {formatErrorDetails(this.state.error, this.state.errorInfo)}
            </pre>
          </details>
          <button
            onClick={createReloadHandler()}
            style={getReloadButtonStyles()}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
