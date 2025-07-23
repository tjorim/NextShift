import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { Alert, Button, Card, Container } from 'react-bootstrap';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
    errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        // Update state so the next render will show the fallback UI
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // Log the error to console in development
        if (import.meta.env.DEV) {
            console.error('ErrorBoundary caught an error:', error, errorInfo);
        }

        // Update state with error details
        this.setState({
            error,
            errorInfo,
        });

        // You can also log the error to an error reporting service here
        // Example: logErrorToService(error, errorInfo);
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: undefined,
            errorInfo: undefined,
        });
    };

    render() {
        if (this.state.hasError) {
            // Render custom fallback UI if provided
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Default error UI
            return (
                <Container className="mt-4">
                    <Card>
                        <Card.Header className="bg-danger text-white">
                            <h5 className="mb-0">⚠️ Something went wrong</h5>
                        </Card.Header>
                        <Card.Body>
                            <Alert variant="danger">
                                <Alert.Heading>Application Error</Alert.Heading>
                                <p>
                                    We're sorry, but something unexpected
                                    happened. The error has been logged and our
                                    team has been notified.
                                </p>
                                <hr />
                                <div className="d-flex gap-2">
                                    <Button
                                        variant="outline-danger"
                                        onClick={this.handleReset}
                                    >
                                        Try Again
                                    </Button>
                                    <Button
                                        variant="outline-secondary"
                                        onClick={() => window.location.reload()}
                                    >
                                        Reload Page
                                    </Button>
                                </div>
                            </Alert>

                            {import.meta.env.DEV && this.state.error && (
                                <Card className="mt-3">
                                    <Card.Header>
                                        <small className="text-muted">
                                            Debug Information
                                        </small>
                                    </Card.Header>
                                    <Card.Body>
                                        <details>
                                            <summary className="text-danger fw-bold mb-2">
                                                {this.state.error.name}:{' '}
                                                {this.state.error.message}
                                            </summary>
                                            <pre className="small text-muted">
                                                {this.state.error.stack}
                                            </pre>
                                            {this.state.errorInfo && (
                                                <div className="mt-2">
                                                    <strong>
                                                        Component Stack:
                                                    </strong>
                                                    <pre className="small text-muted">
                                                        {
                                                            this.state.errorInfo
                                                                .componentStack
                                                        }
                                                    </pre>
                                                </div>
                                            )}
                                        </details>
                                    </Card.Body>
                                </Card>
                            )}
                        </Card.Body>
                    </Card>
                </Container>
            );
        }

        return this.props.children;
    }
}

// Convenience wrapper for common use cases
export function withErrorBoundary<P extends object>(
    Component: React.ComponentType<P>,
    fallback?: ReactNode,
) {
    const WrappedComponent = (props: P) => (
        <ErrorBoundary fallback={fallback}>
            <Component {...props} />
        </ErrorBoundary>
    );

    WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
    return WrappedComponent;
}
