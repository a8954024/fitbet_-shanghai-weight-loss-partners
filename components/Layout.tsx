import React from 'react';
import { GameState } from '../types';

interface LayoutProps {
    children: React.ReactNode;
    gameState: GameState | null;
    onReset?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, gameState, onReset }) => {
    return (
        <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-stone-900 via-stone-950 to-black text-slate-200 font-sans selection:bg-rose-500/30">
            {/* Background Effects */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-500/10 rounded-full blur-[120px] animate-float" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] animate-float" style={{ animationDelay: '-3s' }} />
            </div>

            <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-stone-950/50 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-lg shadow-brand-500/20">
                            <span className="text-lg">⚖️</span>
                        </div>
                        <span className="font-display font-bold text-xl tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                            FitBet
                        </span>
                    </div>

                    {gameState && (
                        <div className="flex items-center gap-4">
                            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-slate-300">
                                <span>🎯 目标: -{gameState.targetPercentage}%</span>
                            </div>
                            {onReset && (
                                <button
                                    onClick={onReset}
                                    className="text-xs text-slate-500 hover:text-red-400 transition-colors"
                                >
                                    重置
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </header>

            <main className="relative z-10 pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="animate-enter">
                    {children}
                </div>
            </main>
        </div>
    );
};
