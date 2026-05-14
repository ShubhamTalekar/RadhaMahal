import React from 'react';

export class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center bg-[#fdfbf7] font-body text-primary">
                    <h2 className="text-3xl font-headline mb-4 text-red-600">Something went wrong</h2>
                    <p className="text-on-surface-variant mb-8 max-w-md">
                        We apologize for the inconvenience. Our systems have encountered an unexpected error.
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-8 py-3 bg-primary text-white uppercase tracking-widest font-bold text-xs rounded-full hover:bg-primary/90 transition-colors"
                    >
                        Reload Page
                    </button>
                    {import.meta.env.DEV && (
                        <pre className="mt-8 p-4 bg-gray-100 rounded text-left text-xs max-w-2xl overflow-auto text-red-800 border border-red-200">
                            {this.state.error?.toString()}
                        </pre>
                    )}
                </div>
            );
        }

        return this.props.children; 
    }
}
