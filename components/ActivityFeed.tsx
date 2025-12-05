import React from 'react';
import { ActivityLog } from '../types';
import { Avatar } from './Avatar';

interface ActivityFeedProps {
    logs: ActivityLog[];
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ logs }) => {
    const sortedLogs = [...logs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    if (logs.length === 0) {
        return (
            <div className="text-center py-10 text-slate-500">
                <p>暂无动态</p>
            </div>
        );
    }

    return (
        <div className="space-y-4 max-h-full overflow-y-auto custom-scrollbar pr-2">
            {sortedLogs.map((log) => (
                <div key={log.id} className="flex gap-3 items-start animate-fade-in group">
                    <div className="mt-1">
                        {log.avatarSeed ? (
                            <Avatar seed={log.avatarSeed} size="sm" />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-brand-500/20 flex items-center justify-center ring-1 ring-brand-500/40">
                                <div className="w-2 h-2 rounded-full bg-brand-500" />
                            </div>
                        )}
                    </div>
                    <div className="flex-1 bg-white/5 rounded-lg p-3 border border-white/5 group-hover:bg-white/10 transition-colors">
                        <div className="flex justify-between items-start">
                            <span className="font-bold text-slate-300 text-sm">{log.playerName || '系统'}</span>
                            <span className="text-xs text-slate-500">
                                {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                        <p className="text-sm text-slate-400 mt-1">{log.message}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};
