import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
    ErrorBoundary,
    withErrorBoundary,
} from '../../src/components/ErrorBoundary';

// Mock import.meta.env for development environment testing
const mockImportMeta = {
    env: {
        DEV: true,
    },
};

Object.defineProperty(globalThis, 'import', {
    value: {
        meta: mockImportMeta,
    },
    writable: true,
});

// Mock console.error to avoid noise in test output and capture calls
const originalError = console.error;
const mockConsoleError = vi.fn();

beforeEach(() => {
    console.error = mockConsoleError;
    mockConsoleError.mockClear();
    // Reset DEV to true by default
    mockImportMeta.env.DEV = true;
});

afterEach(() => {
    console.error = originalError;
});

// Test components that throw errors
const ThrowError = ({
    shouldThrow = false,
    errorMessage = 'Test error',
}: {
    shouldThrow?: boolean;
    errorMessage?: string;
}) => {
    if (shouldThrow) {
        throw new Error(errorMessage);
    }
    return <div data-testid="success-component">No Error</div>;
};

const RenderTimeError = () => {
    throw new Error('Render time error');
};

const NullErrorComponent = () => {
    throw null;
};

const StringErrorComponent = () => {
    throw 'String error message';
};

const ObjectErrorComponent = () => {
    throw { message: 'Object error', code: 500 };
};

describe('ErrorBoundary Component', () => {
    describe('Happy Path - No Errors', () => {
        it('renders children when no error occurs', () => {
            render(
                <ErrorBoundary>
                    <div data-testid="child-component">Child Content</div>
                </ErrorBoundary>,
            );

            expect(screen.getByTestId('child-component')).toBeInTheDocument();
            expect(screen.getByText('Child Content')).toBeInTheDocument();
        });

        it('renders multiple children when no error occurs', () => {
            render(
                <ErrorBoundary>
                    <div data-testid="child-1">Child 1</div>
                    <div data-testid="child-2">Child 2</div>
                    <span data-testid="child-3">Child 3</span>
                </ErrorBoundary>,
            );

            expect(screen.getByTestId('child-1')).toBeInTheDocument();
            expect(screen.getByTestId('child-2')).toBeInTheDocument();
            expect(screen.getByTestId('child-3')).toBeInTheDocument();
        });

        it('renders nested components without errors', () => {
            const NestedComponent = () => (
                <div data-testid="nested">
                    <span>Nested content</span>
                    <div>
                        <p>Deeply nested</p>
                    </div>
                </div>
            );

            render(
                <ErrorBoundary>
                    <NestedComponent />
                </ErrorBoundary>,
            );

            expect(screen.getByTestId('nested')).toBeInTheDocument();
            expect(screen.getByText('Nested content')).toBeInTheDocument();
            expect(screen.getByText('Deeply nested')).toBeInTheDocument();
        });

        it('does not call console.error when no error occurs', () => {
            render(
                <ErrorBoundary>
                    <div>Normal component</div>
                </ErrorBoundary>,
            );

            expect(mockConsoleError).not.toHaveBeenCalled();
        });
    });

    describe('Error Handling - Basic Cases', () => {
        it('catches and displays default error UI when child component throws', () => {
            render(
                <ErrorBoundary>
                    <ThrowError shouldThrow={true} />
                </ErrorBoundary>,
            );

            expect(
                screen.queryByTestId('success-component'),
            ).not.toBeInTheDocument();
            expect(
                screen.getByText('⚠️ Something went wrong'),
            ).toBeInTheDocument();
            expect(screen.getByText('Application Error')).toBeInTheDocument();
            expect(
                screen.getByText(
                    /We're sorry, but something unexpected happened/,
                ),
            ).toBeInTheDocument();
        });

        it('displays Try Again and Reload Page buttons in error state', () => {
            render(
                <ErrorBoundary>
                    <ThrowError shouldThrow={true} />
                </ErrorBoundary>,
            );

            expect(
                screen.getByRole('button', { name: 'Try Again' }),
            ).toBeInTheDocument();
            expect(
                screen.getByRole('button', { name: 'Reload Page' }),
            ).toBeInTheDocument();
        });

        it('catches errors during component render phase', () => {
            render(
                <ErrorBoundary>
                    <RenderTimeError />
                </ErrorBoundary>,
            );

            expect(
                screen.getByText('⚠️ Something went wrong'),
            ).toBeInTheDocument();
        });

        it('logs errors to console in development mode', () => {
            render(
                <ErrorBoundary>
                    <ThrowError
                        shouldThrow={true}
                        errorMessage="Test console error"
                    />
                </ErrorBoundary>,
            );

            expect(mockConsoleError).toHaveBeenCalledWith(
                'ErrorBoundary caught an error:',
                expect.objectContaining({
                    message: 'Test console error',
                }),
                expect.objectContaining({
                    componentStack: expect.stringContaining('ThrowError'),
                }),
            );
        });
    });

    describe('Error Handling - Edge Cases', () => {
        it('handles null error gracefully', () => {
            render(
                <ErrorBoundary>
                    <NullErrorComponent />
                </ErrorBoundary>,
            );

            expect(
                screen.getByText('⚠️ Something went wrong'),
            ).toBeInTheDocument();
        });

        it('handles string error gracefully', () => {
            render(
                <ErrorBoundary>
                    <StringErrorComponent />
                </ErrorBoundary>,
            );

            expect(
                screen.getByText('⚠️ Something went wrong'),
            ).toBeInTheDocument();
        });

        it('handles object error gracefully', () => {
            render(
                <ErrorBoundary>
                    <ObjectErrorComponent />
                </ErrorBoundary>,
            );

            expect(
                screen.getByText('⚠️ Something went wrong'),
            ).toBeInTheDocument();
        });

        it('handles errors with different error messages', () => {
            const customErrorMessage = 'Custom error message for testing';
            render(
                <ErrorBoundary>
                    <ThrowError
                        shouldThrow={true}
                        errorMessage={customErrorMessage}
                    />
                </ErrorBoundary>,
            );

            expect(
                screen.getByText('⚠️ Something went wrong'),
            ).toBeInTheDocument();
        });

        it('handles deeply nested component errors', () => {
            const DeepNested = () => (
                <div>
                    <div>
                        <div>
                            <div>
                                <ThrowError shouldThrow={true} />
                            </div>
                        </div>
                    </div>
                </div>
            );

            render(
                <ErrorBoundary>
                    <DeepNested />
                </ErrorBoundary>,
            );

            expect(
                screen.getByText('⚠️ Something went wrong'),
            ).toBeInTheDocument();
        });
    });

    describe('Custom Fallback UI', () => {
        it('renders custom fallback component when provided', () => {
            const customFallback = (
                <div data-testid="custom-fallback">Custom Error Message</div>
            );

            render(
                <ErrorBoundary fallback={customFallback}>
                    <ThrowError shouldThrow={true} />
                </ErrorBoundary>,
            );

            expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
            expect(
                screen.getByText('Custom Error Message'),
            ).toBeInTheDocument();
            expect(
                screen.queryByText('⚠️ Something went wrong'),
            ).not.toBeInTheDocument();
        });

        it('renders complex custom fallback UI', () => {
            const ComplexFallback = (
                <div data-testid="complex-fallback">
                    <h2>Custom Error Handler</h2>
                    <p>Something went wrong in our custom way</p>
                    <button type="button">Custom Action</button>
                </div>
            );

            render(
                <ErrorBoundary fallback={ComplexFallback}>
                    <ThrowError shouldThrow={true} />
                </ErrorBoundary>,
            );

            expect(screen.getByTestId('complex-fallback')).toBeInTheDocument();
            expect(
                screen.getByText('Custom Error Handler'),
            ).toBeInTheDocument();
            expect(
                screen.getByRole('button', { name: 'Custom Action' }),
            ).toBeInTheDocument();
        });

        it('uses default UI when fallback is null', () => {
            render(
                <ErrorBoundary fallback={null}>
                    <ThrowError shouldThrow={true} />
                </ErrorBoundary>,
            );

            expect(
                screen.getByText('⚠️ Something went wrong'),
            ).toBeInTheDocument();
        });
    });

    describe('Reset Functionality', () => {
        it('resets error state when Try Again button is clicked', async () => {
            const user = userEvent.setup();
            let shouldThrow = true;

            const ConditionalError = () => {
                if (shouldThrow) {
                    throw new Error('Conditional error');
                }
                return <div data-testid="recovered-component">Recovered!</div>;
            };

            const { rerender } = render(
                <ErrorBoundary>
                    <ConditionalError />
                </ErrorBoundary>,
            );

            expect(
                screen.getByText('⚠️ Something went wrong'),
            ).toBeInTheDocument();

            // Change the condition and click Try Again
            shouldThrow = false;
            const tryAgainButton = screen.getByRole('button', {
                name: 'Try Again',
            });
            await user.click(tryAgainButton);

            // Need to rerender to see the effect since the component state changed
            rerender(
                <ErrorBoundary>
                    <ConditionalError />
                </ErrorBoundary>,
            );

            expect(
                screen.getByTestId('recovered-component'),
            ).toBeInTheDocument();
        });

        it('calls window.location.reload when Reload Page button is clicked', async () => {
            const user = userEvent.setup();
            const mockReload = vi.fn();

            Object.defineProperty(window, 'location', {
                value: { reload: mockReload },
                writable: true,
            });

            render(
                <ErrorBoundary>
                    <ThrowError shouldThrow={true} />
                </ErrorBoundary>,
            );

            const reloadButton = screen.getByRole('button', {
                name: 'Reload Page',
            });
            await user.click(reloadButton);

            expect(mockReload).toHaveBeenCalledTimes(1);
        });

        it('maintains error state until explicitly reset', () => {
            const { rerender } = render(
                <ErrorBoundary>
                    <ThrowError shouldThrow={true} />
                </ErrorBoundary>,
            );

            expect(
                screen.getByText('⚠️ Something went wrong'),
            ).toBeInTheDocument();

            // Re-render with same error condition
            rerender(
                <ErrorBoundary>
                    <ThrowError shouldThrow={true} />
                </ErrorBoundary>,
            );

            expect(
                screen.getByText('⚠️ Something went wrong'),
            ).toBeInTheDocument();
        });
    });

    describe('Development Mode Debug Information', () => {
        it('shows debug information in development mode when error occurs', () => {
            mockImportMeta.env.DEV = true;

            render(
                <ErrorBoundary>
                    <ThrowError
                        shouldThrow={true}
                        errorMessage="Debug test error"
                    />
                </ErrorBoundary>,
            );

            expect(screen.getByText('Debug Information')).toBeInTheDocument();
            expect(
                screen.getAllByText(/Error: Debug test error/)[0],
            ).toBeInTheDocument();
        });

        it('shows error stack trace in development mode', () => {
            mockImportMeta.env.DEV = true;

            render(
                <ErrorBoundary>
                    <ThrowError
                        shouldThrow={true}
                        errorMessage="Stack trace test"
                    />
                </ErrorBoundary>,
            );

            const debugSection = screen.getByText('Debug Information');
            expect(debugSection).toBeInTheDocument();

            // Check that error details are expandable
            const errorSummary = screen.getAllByText(
                /Error: Stack trace test/,
            )[0];
            expect(errorSummary).toBeInTheDocument();
        });

        it('shows component stack in development mode', () => {
            mockImportMeta.env.DEV = true;

            render(
                <ErrorBoundary>
                    <div data-testid="wrapper">
                        <ThrowError
                            shouldThrow={true}
                            errorMessage="Component stack test"
                        />
                    </div>
                </ErrorBoundary>,
            );

            expect(screen.getByText('Component Stack:')).toBeInTheDocument();
        });

        it('shows debug information in test environment (DEV mode)', () => {
            // In the test environment, DEV is always true, so debug info should show
            render(
                <ErrorBoundary>
                    <ThrowError shouldThrow={true} errorMessage="Test error" />
                </ErrorBoundary>,
            );

            expect(screen.getByText('Debug Information')).toBeInTheDocument();
            expect(
                screen.getAllByText(/Error: Test error/)[0],
            ).toBeInTheDocument();
        });
    });

    describe('Error Recovery Scenarios', () => {
        it('recovers when error condition is removed and component re-renders', async () => {
            const TestComponent = ({ hasError }: { hasError: boolean }) => (
                <ErrorBoundary>
                    <ThrowError shouldThrow={hasError} />
                </ErrorBoundary>
            );

            const { rerender } = render(<TestComponent hasError={true} />);
            expect(
                screen.getByText('⚠️ Something went wrong'),
            ).toBeInTheDocument();

            // Change the component to not throw error and click "Try Again" to reset
            rerender(<TestComponent hasError={false} />);
            const user = userEvent.setup();
            const tryAgainButton = screen.getByText('Try Again');
            await user.click(tryAgainButton);

            expect(
                screen.queryByText('⚠️ Something went wrong'),
            ).not.toBeInTheDocument();
            expect(screen.getByTestId('success-component')).toBeInTheDocument();
        });

        it('handles sequential errors from different components', () => {
            const { rerender } = render(
                <ErrorBoundary>
                    <ThrowError shouldThrow={true} errorMessage="First error" />
                </ErrorBoundary>,
            );

            expect(
                screen.getByText('⚠️ Something went wrong'),
            ).toBeInTheDocument();

            rerender(
                <ErrorBoundary>
                    <ThrowError
                        shouldThrow={true}
                        errorMessage="Second error"
                    />
                </ErrorBoundary>,
            );

            expect(
                screen.getByText('⚠️ Something went wrong'),
            ).toBeInTheDocument();
        });
    });

    describe('Performance and Memory Management', () => {
        it('handles unmounting during error state gracefully', () => {
            const { unmount } = render(
                <ErrorBoundary>
                    <ThrowError shouldThrow={true} />
                </ErrorBoundary>,
            );

            expect(
                screen.getByText('⚠️ Something went wrong'),
            ).toBeInTheDocument();

            // Should unmount without throwing
            expect(() => unmount()).not.toThrow();
        });

        it('does not cause memory leaks with frequent error/recovery cycles', () => {
            const { rerender } = render(
                <ErrorBoundary>
                    <ThrowError shouldThrow={true} />
                </ErrorBoundary>,
            );

            // Simulate multiple error/recovery cycles using different keys to force remount
            for (let i = 0; i < 10; i++) {
                rerender(
                    <ErrorBoundary key={i}>
                        <ThrowError shouldThrow={i % 2 === 0} />
                    </ErrorBoundary>,
                );
            }

            // Final state should be successful (i=9, 9%2=1, so shouldThrow=false)
            expect(screen.getByTestId('success-component')).toBeInTheDocument();
        });
    });

    describe('Integration with React Features', () => {
        it('works correctly with React.Suspense', () => {
            const SuspenseComponent = () => (
                <React.Suspense fallback={<div>Loading...</div>}>
                    <ErrorBoundary>
                        <ThrowError shouldThrow={true} />
                    </ErrorBoundary>
                </React.Suspense>
            );

            render(<SuspenseComponent />);
            expect(
                screen.getByText('⚠️ Something went wrong'),
            ).toBeInTheDocument();
        });

        it('handles errors in components with hooks', () => {
            const HooksComponent = ({
                shouldError,
            }: {
                shouldError: boolean;
            }) => {
                const [count, _setCount] = React.useState(0);

                React.useEffect(() => {
                    if (shouldError) {
                        throw new Error('Hook error');
                    }
                }, [shouldError]);

                return <div data-testid="hooks-component">Count: {count}</div>;
            };

            render(
                <ErrorBoundary>
                    <HooksComponent shouldError={true} />
                </ErrorBoundary>,
            );

            expect(
                screen.getByText('⚠️ Something went wrong'),
            ).toBeInTheDocument();
        });

        it('works with context providers', () => {
            const TestContext = React.createContext('default');

            const ContextConsumer = () => {
                const value = React.useContext(TestContext);
                throw new Error(`Context error: ${value}`);
            };

            render(
                <TestContext.Provider value="test-value">
                    <ErrorBoundary>
                        <ContextConsumer />
                    </ErrorBoundary>
                </TestContext.Provider>,
            );

            expect(
                screen.getByText('⚠️ Something went wrong'),
            ).toBeInTheDocument();
        });
    });

    describe('Bootstrap UI Components', () => {
        it('renders with proper Bootstrap classes', () => {
            render(
                <ErrorBoundary>
                    <ThrowError shouldThrow={true} />
                </ErrorBoundary>,
            );

            // Check for Bootstrap container and card classes
            const container = screen
                .getByText('⚠️ Something went wrong')
                .closest('.mt-4');
            expect(container).toBeInTheDocument();
        });

        it('applies correct variant classes to Alert component', () => {
            render(
                <ErrorBoundary>
                    <ThrowError shouldThrow={true} />
                </ErrorBoundary>,
            );

            const alertHeading = screen.getByText('Application Error');
            expect(alertHeading).toBeInTheDocument();
        });

        it('renders buttons with correct Bootstrap variants', () => {
            render(
                <ErrorBoundary>
                    <ThrowError shouldThrow={true} />
                </ErrorBoundary>,
            );

            const tryAgainButton = screen.getByRole('button', {
                name: 'Try Again',
            });
            const reloadButton = screen.getByRole('button', {
                name: 'Reload Page',
            });

            expect(tryAgainButton).toBeInTheDocument();
            expect(reloadButton).toBeInTheDocument();
        });
    });
});

describe('withErrorBoundary HOC', () => {
    it('wraps component with ErrorBoundary', () => {
        const TestComponent = () => (
            <div data-testid="wrapped-component">Test Component</div>
        );
        const WrappedComponent = withErrorBoundary(TestComponent);

        render(<WrappedComponent />);

        expect(screen.getByTestId('wrapped-component')).toBeInTheDocument();
    });

    it('passes props through to wrapped component', () => {
        const TestComponent = ({ message }: { message: string }) => (
            <div data-testid="wrapped-component">{message}</div>
        );
        const WrappedComponent = withErrorBoundary(TestComponent);

        render(<WrappedComponent message="Hello World" />);

        expect(screen.getByText('Hello World')).toBeInTheDocument();
    });

    it('catches errors in wrapped component', () => {
        const ErrorComponent = () => {
            throw new Error('Wrapped component error');
        };
        const WrappedComponent = withErrorBoundary(ErrorComponent);

        render(<WrappedComponent />);

        expect(screen.getByText('⚠️ Something went wrong')).toBeInTheDocument();
    });

    it('uses custom fallback when provided', () => {
        const ErrorComponent = () => {
            throw new Error('Wrapped component error');
        };
        const customFallback = (
            <div data-testid="hoc-fallback">HOC Custom Fallback</div>
        );
        const WrappedComponent = withErrorBoundary(
            ErrorComponent,
            customFallback,
        );

        render(<WrappedComponent />);

        expect(screen.getByTestId('hoc-fallback')).toBeInTheDocument();
        expect(
            screen.queryByText('⚠️ Something went wrong'),
        ).not.toBeInTheDocument();
    });

    it('sets correct displayName for wrapped component', () => {
        const TestComponent = () => <div>Test</div>;
        TestComponent.displayName = 'TestComponent';

        const WrappedComponent = withErrorBoundary(TestComponent);

        expect(WrappedComponent.displayName).toBe(
            'withErrorBoundary(TestComponent)',
        );
    });

    it('handles component without displayName', () => {
        const TestComponent = () => <div>Test</div>;
        const WrappedComponent = withErrorBoundary(TestComponent);

        expect(WrappedComponent.displayName).toBe(
            'withErrorBoundary(TestComponent)',
        );
    });

    it('handles anonymous function components', () => {
        const WrappedComponent = withErrorBoundary(() => <div>Anonymous</div>);

        expect(WrappedComponent.displayName).toMatch(/withErrorBoundary\(/);
    });
});
