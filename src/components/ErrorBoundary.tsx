import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "./ui/button";

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center p-4 bg-background text-foreground">
                    <div className="max-w-2xl w-full bg-card p-8 rounded-lg shadow-xl border border-destructive/20">
                        <h1 className="text-2xl font-bold text-destructive mb-4">Something went wrong</h1>
                        <div className="bg-muted p-4 rounded overflow-auto mb-4">
                            <code className="text-sm font-mono text-destructive block mb-2">
                                {this.state.error?.toString()}
                            </code>
                        </div>
                        <Button
                            onClick={() => window.location.reload()}
                            className="w-full sm:w-auto"
                        >
                            Reload Page
                        </Button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
