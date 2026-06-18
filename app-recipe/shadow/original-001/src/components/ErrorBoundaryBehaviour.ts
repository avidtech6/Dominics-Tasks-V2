/**
 * Error Boundary Behaviour Module
 * Extracted from ErrorBoundary component
 * Handles error detection, logging, and recovery logic
 */

interface ErrorInfo {
  componentStack?: string;
}

/**
 * Get derived state from error
 * @param error - The error that was thrown
 * @returns State object for error boundary
 */
export const getDerivedStateFromError = (error: Error): { hasError: boolean; error: Error | null; errorInfo: null } => {
  return { hasError: true, error, errorInfo: null };
};

/**
 * Log error details to console
 * @param error - The error that was caught
 * @param errorInfo - Additional error information
 */
export const logError = (error: Error, errorInfo: ErrorInfo) => {
  console.error('ErrorBoundary caught an error:', error);
  console.error('Error info:', errorInfo);
};

/**
 * Get CSS styles for the error container
 * @returns CSS style object for error container
 */
export const getErrorContainerStyles = () => ({
  padding: '40px',
  textAlign: 'center' as const,
  background: '#fff5f5',
  border: '2px solid #feb2b2',
  borderRadius: '12px',
  margin: '20px',
});

/**
 * Get CSS styles for the error title
 * @returns CSS style object for error title
 */
export const getErrorTitleStyles = () => ({
  color: '#c53030',
  marginBottom: '16px',
});

/**
 * Get CSS styles for the error message
 * @returns CSS style object for error message
 */
export const getErrorMessageStyles = () => ({
  color: '#742a2a',
  marginBottom: '16px',
});

/**
 * Get CSS styles for the details section
 * @returns CSS style object for details section
 */
export const getDetailsStyles = () => ({
  textAlign: 'left' as const,
  background: '#fff',
  padding: '16px',
  borderRadius: '8px',
});

/**
 * Get CSS styles for the details summary
 * @returns CSS style object for details summary
 */
export const getSummaryStyles = () => ({
  cursor: 'pointer',
  fontWeight: 'bold',
});

/**
 * Get CSS styles for the error stack trace
 * @returns CSS style object for error stack trace
 */
export const getStackTraceStyles = () => ({
  fontSize: '12px',
  overflow: 'auto' as const,
  marginTop: '12px',
});

/**
 * Get CSS styles for the reload button
 * @returns CSS style object for reload button
 */
export const getReloadButtonStyles = () => ({
  marginTop: '20px',
  padding: '12px 24px',
  background: '#c53030',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontWeight: 'bold',
});

/**
 * Format error message for display
 * @param error - The error object
 * @returns Formatted error message string
 */
export const formatErrorMessage = (error: Error | null): string => {
  return error?.message || 'Unknown error';
};

/**
 * Format error details for display
 * @param error - The error object
 * @param errorInfo - The error info object
 * @returns Formatted error details string
 */
export const formatErrorDetails = (error: Error | null, errorInfo: ErrorInfo | null): string => {
  return [
    error?.stack || '',
    '\n\n',
    errorInfo?.componentStack || ''
  ].join('');
};

/**
 * Create reload handler function
 * @returns Function that resets error state and reloads page
 */
export const createReloadHandler = () => {
  return () => {
    // Reset error state by reloading page
    window.location.reload();
  };
};

/**
 * Determine if error boundary should show error UI
 * @param hasError - Whether an error has occurred
 * @returns Whether to show error UI
 */
export const shouldShowErrorUI = (hasError: boolean) => {
  return hasError;
};