import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    title?: string;
    description?: string;
    action?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
    children,
    className = '',
    title,
    description,
    action
}) => {
    return (
        <div className={`bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl shadow-xl shadow-slate-200/50 overflow-hidden ${className}`}>
            {(title || action) && (
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        {title && <h3 className="text-lg font-bold text-slate-900">{title}</h3>}
                        {description && <p className="text-sm text-slate-500 mt-0.5">{description}</p>}
                    </div>
                    {action && <div>{action}</div>}
                </div>
            )}
            <div className="p-6">
                {children}
            </div>
        </div>
    );
};
