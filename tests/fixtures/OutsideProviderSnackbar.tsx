import { Component, type ErrorInfo, type ReactNode } from 'react';

import { useSnackbar } from '../../src';

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  componentDidCatch(_error: Error, _info: ErrorInfo) {}
  render() {
    if (this.state.error) {
      return <span data-testid='boundary-error'>{this.state.error.message}</span>;
    }
    return this.props.children;
  }
}

function Offender() {
  // Calling useSnackbar without a SnackbarProvider must throw a clear error.
  useSnackbar();
  return <span>should-not-render</span>;
}

export function OutsideProviderSnackbar() {
  return (
    <ErrorBoundary>
      <Offender />
    </ErrorBoundary>
  );
}
