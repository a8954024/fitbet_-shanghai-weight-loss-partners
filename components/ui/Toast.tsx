import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

export interface ToastProps {
    id: string;
    message: string;
    type?: 'success' | 'error' | 'info';
    duration?: number;
    onClose: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({
    id,
    message,
    type = 'info',
    duration = 3000,
    onClose
}) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose(id);
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, id, onClose]);

    const icons = {
        success: <CheckCircle className="w-5 h-5 text-green-400" />,
        error: <AlertCircle className="w-5 h-5 text-red-400" />,
        info: <Info className="w-5 h-5 text-blue-400" />
    };

    const bgColors = {
        success: 'bg-stone-900/90 border-green-500/20',
        error: 'bg-stone-900/90 border-red-500/20',
        info: 'bg-stone-900/90 border-blue-500/20'
    };

    return (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-xl backdrop-blur-md animate-fade-in-up ${bgColors[type]} min-w-[300px] max-w-[90vw]`}>
            {icons[type]}
            <p className="flex-1 text-sm font-medium text-stone-200">{message}</p>
            <button onClick={() => onClose(id)} className="text-stone-500 hover:text-stone-300">
                <X className="w-4 h-4" />
            </button>
        </div>
    );
};

export const ToastContainer: React.FC<{ toasts: ToastProps[]; removeToast: (id: string) => void }> = ({ toasts, removeToast }) => {
    return (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 pointer-events-none">
            {toasts.map(toast => (
                <div key={toast.id} className="pointer-events-auto">
                    <Toast {...toast} onClose={removeToast} />
                </div>
            ))}
        </div>
    );
};
