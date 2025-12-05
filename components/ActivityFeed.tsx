import React from 'react';
import { ActivityLog } from '../types';
import { Trophy, TrendingDown, UserPlus, PartyPopper } from 'lucide-react';

interface ActivityFeedProps {
    logs: ActivityLog[];
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ logs }) => {
    const getIcon = (type: ActivityLog['type']) => {
        switch (type) {
            case 'WEIGHT_UPDATE': return <TrendingDown className="w-4 h-4 text-blue-500" />;
            case 'JOIN': return <UserPlus className="w-4 h-4 text-green-500" />;
            case 'CHEER': return <PartyPopper className="w-4 h-4 text-orange-500" />;
            case 'GAME_START': return <Trophy className="w-4 h-4 text-yellow-500" />;
            default: return <div className="w-2 h-2 rounded-full bg-slate-400" />;
        }
    };

    return (
        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {logs.length === 0 && (
                <div className="text-center text-slate-400 py-8 text-sm">
                    暂无动态
                </div>
            )}
            {logs.slice().reverse().map((log) => (
                <div key={log.id} className="flex gap-3 items-start p-3 rounded-xl bg-white/40 border border-white/40 hover:bg-white/60 transition-colors">
                    <div className="mt-1 p-2 rounded-full bg-white shadow-sm">
                        {getIcon(log.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-800 font-medium">
                            {log.playerName && <span className="text-slate-900 font-bold">{log.playerName} </span>}
                            {log.message}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                            {new Date(log.timestamp).toLocaleString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
};
