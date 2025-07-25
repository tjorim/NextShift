import { createContext, useCallback, useContext, useState } from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';

export interface ToastMessage {
    id: string;
    message: string;
    variant?: 'success' | 'danger' | 'warning' | 'info';
    icon?: string;
    delay?: number;
    autohide?: boolean;
}

interface ToastContextType {
    addToast: (message: Omit<ToastMessage, 'id'>) => void;
    removeToast: (id: string) => void;
    showSuccess: (message: string, icon?: string) => void;
    showError: (message: string, icon?: string) => void;
    showWarning: (message: string, icon?: string) => void;
    showInfo: (message: string, icon?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (context === undefined) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

interface ToastProviderProps {
    children: React.ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const addToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
        const id = Math.random().toString(36).substring(2, 9);
        const newToast: ToastMessage = {
            id,
            delay: 4000,
            autohide: true,
            variant: 'info',
            ...toast,
        };
        setToasts((prevToasts) => [...prevToasts, newToast]);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts((prevToasts) =>
            prevToasts.filter((toast) => toast.id !== id),
        );
    }, []);

    const showSuccess = useCallback(
        (message: string, icon = '✅') => {
            addToast({ message, variant: 'success', icon });
        },
        [addToast],
    );

    const showError = useCallback(
        (message: string, icon = '❌') => {
            addToast({ message, variant: 'danger', icon });
        },
        [addToast],
    );

    const showWarning = useCallback(
        (message: string, icon = '⚠️') => {
            addToast({ message, variant: 'warning', icon });
        },
        [addToast],
    );

    const showInfo = useCallback(
        (message: string, icon = 'ℹ️') => {
            addToast({ message, variant: 'info', icon });
        },
        [addToast],
    );

    const contextValue: ToastContextType = {
        addToast,
        removeToast,
        showSuccess,
        showError,
        showWarning,
        showInfo,
    };

    return (
        <ToastContext.Provider value={contextValue}>
            {children}
            <ToastContainer
                position="top-end"
                className="p-3"
                style={{ zIndex: 1050 }}
            >
                {toasts.map((toast) => (
                    <Toast
                        key={toast.id}
                        onClose={() => removeToast(toast.id)}
                        show={true}
                        autohide={toast.autohide}
                        delay={toast.delay}
                        bg={toast.variant}
                    >
                        <Toast.Body className="d-flex align-items-center">
                            {toast.icon && (
                                <span
                                    className="me-2"
                                    style={{ fontSize: '1.2em' }}
                                >
                                    {toast.icon}
                                </span>
                            )}
                            <span className="text-white">{toast.message}</span>
                        </Toast.Body>
                    </Toast>
                ))}
            </ToastContainer>
        </ToastContext.Provider>
    );
}
