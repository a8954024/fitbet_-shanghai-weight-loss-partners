import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
    children,
    className = '',
    variant = 'primary',
    size = 'md',
    isLoading = false,
    icon,
    disabled,
    ...props
}) => {
    const baseStyles = "inline-flex items-center justify-center font-semibold transition-all duration-300 rounded-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100";

    const variants = {
        primary: "bg-gradient-to-r from-orange-500 to-rose-600 text-white shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 hover:brightness-110 shine",
        secondary: "bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700 hover:border-slate-600",
        ghost: "bg-transparent text-slate-400 hover:text-white hover:bg-white/5",
        danger: "bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20"
    };

    const sizes = {
        sm: "px-3 py-1.5 text-sm",
        md: "px-5 py-2.5 text-base",
        lg: "px-8 py-3.5 text-lg"
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? (
                <span className="mr-2 animate-spin">⟳</span>
            ) : icon ? (
                <span className="mr-2">{icon}</span>
            ) : null}
            {children}
        </button>
    );
};
