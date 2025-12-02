import React, { Component, ErrorInfo, ReactNode } from 'react';

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
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-red-50 dark:bg-red-900/20 text-red-900 dark:text-red-100 rounded-lg border border-red-200 dark:border-red-800">
                    <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
                    <p className="mb-4">We apologize for the inconvenience. An unexpected error has occurred.</p>
                    {this.state.error && (
                        <pre className="text-left bg-white dark:bg-black/50 p-4 rounded overflow-auto max-w-full text-sm mb-4 border border-red-100 dark:border-red-900/50">
                            {this.state.error.toString()}
                        </pre>
                    )}
                    <button
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                        onClick={() => window.location.reload()}
                    >
                        Reload Application
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
