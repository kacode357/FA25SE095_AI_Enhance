"use client";

import { Component, ErrorInfo, ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    if (process.env.NODE_ENV === "development") {
      console.error("ErrorBoundary caught an error:", error, errorInfo);
    }

    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          <h2 className="text-base font-semibold">Something went wrong</h2>
          <p className="mt-1">
            We&apos;re sorry, but something unexpected happened. Please try
            refreshing the page.
          </p>

          {process.env.NODE_ENV === "development" && this.state.error && (
            <details className="mt-3 space-y-2 rounded-lg bg-white p-3 text-xs text-slate-800">
              <summary className="cursor-pointer font-medium">
                Error details (development only)
              </summary>
              <pre className="whitespace-pre-wrap break-words">
                <strong>Error:</strong> {this.state.error.toString()}
                {"\n\n"}
                <strong>Stack:</strong>
                {"\n"}
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>
          )}

          <div className="mt-3 flex gap-2">
            <button
              onClick={this.handleReset}
              className="inline-flex items-center rounded-xl bg-indigo-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-600"
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
