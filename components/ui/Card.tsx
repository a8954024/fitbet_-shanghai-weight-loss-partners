import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    title?: string;
    action?: React.ReactNode;
    variant?: 'default' | 'glass' | 'outlined';
    hover?: boolean;
}

export const Card: React.FC<CardProps> = ({
    children,
    title,
    action,
    className = '',
    variant = 'glass',
    hover = false,
    ...props
}) => {
    const baseStyles = "rounded-2xl transition-all duration-300 relative overflow-hidden";

    const variants = {
        default: "bg-slate-900 border border-slate-800 shadow-lg",
        glass: "bg-white/5 backdrop-blur-xl border border-white/10 shadow-xl",
        outlined: "bg-transparent border border-slate-700"
    };

    const hoverStyles = hover ? "hover:translate-y-[-4px] hover:shadow-2xl hover:bg-white/10" : "";

    return (
        <div
            className={`${baseStyles} ${variants[variant]} ${hoverStyles} ${className}`}
            {...props}
        >
            {(title || action) && (
                <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
                    {title && <h3 className="font-bold text-lg text-slate-200">{title}</h3>}
                    {action && <div>{action}</div>}
                </div>
            )}
            <div className={title || action ? 'p-6' : 'p-6'}>
                {children}
            </div>
        </div>
    );
};
