import React, { useState } from 'react';
import { Player } from '../types';
import { Avatar } from './Avatar';
import { Scale, TrendingDown, CheckCircle, AlertCircle } from 'lucide-react';
import { TARGET_PERCENTAGE } from '../constants';

interface PlayerDashboardProps {
  player: Player;
  onUpdateWeight: (id: number, newWeight: number) => void;
}

export const PlayerDashboard: React.FC<PlayerDashboardProps> = ({ player, onUpdateWeight }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newWeightStr, setNewWeightStr] = useState('');

  const lossKg = player.initialWeight - player.currentWeight;
  const lossPercent = (lossKg / player.initialWeight) * 100;
  const targetPercent = TARGET_PERCENTAGE * 100;
  const isGoalMet = lossPercent >= targetPercent;
  
  // Calculate progress relative to the 4% goal (0 to 100 scale for the bar)
  const progressToGoal = Math.min(100, Math.max(0, (lossPercent / targetPercent) * 100));

  const handleSave = () => {
    const val = parseFloat(newWeightStr);
    if (!isNaN(val) && val > 0) {
      onUpdateWeight(player.id, val);
      setIsEditing(false);
      setNewWeightStr('');
    }
  };

  return (
    <div className={`relative bg-white rounded-3xl p-6 shadow-lg border-2 transition-all duration-300 ${isGoalMet ? 'border-green-400 shadow-green-100' : 'border-transparent hover:border-blue-200'}`}>
      {isGoalMet && (
        <div className="absolute -top-3 -right-3 bg-green-500 text-white p-2 rounded-full shadow-lg z-10 animate-bounce">
          <CheckCircle className="w-6 h-6" />
        </div>
      )}
      
      <div className="flex items-center gap-4 mb-4">
        <div className="relative">
          <Avatar seed={player.avatarSeed} size="md" />
          <div className="absolute -bottom-1 -right-1 bg-slate-800 text-white text-xs px-2 py-0.5 rounded-full font-bold">
            {lossPercent > 0 ? '-' : '+'}{Math.abs(lossPercent).toFixed(1)}%
          </div>
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-800">{player.name}</h3>
          <div className="text-sm text-slate-500 flex items-center gap-1">
            <Scale className="w-3 h-3" />
            Start: {player.initialWeight}kg
          </div>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-slate-500">当前进度</span>
          <span className={`font-bold ${isGoalMet ? 'text-green-600' : 'text-blue-600'}`}>
            {player.currentWeight}kg <span className="text-slate-300">/</span> {player.targetWeight}kg
          </span>
        </div>
        <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-1000 ease-out ${isGoalMet ? 'bg-green-500' : 'bg-gradient-to-r from-blue-400 to-indigo-500'}`}
            style={{ width: `${progressToGoal}%` }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <p className="text-xs text-slate-400">已减: {lossKg.toFixed(1)}kg</p>
          {!isGoalMet && (
            <p className="text-xs text-orange-500 font-medium">还需减: {(player.currentWeight - player.targetWeight).toFixed(1)}kg</p>
          )}
        </div>
      </div>

      {isEditing ? (
        <div className="flex items-center gap-2 animate-fadeIn">
          <input
            autoFocus
            type="number"
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
            placeholder="新体重..."
            value={newWeightStr}
            onChange={(e) => setNewWeightStr(e.target.value)}
          />
          <button 
            onClick={handleSave}
            className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600"
          >
            <CheckCircle className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setIsEditing(false)}
            className="bg-slate-200 text-slate-500 p-2 rounded-lg hover:bg-slate-300"
          >
            <AlertCircle className="w-4 h-4 rotate-45" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsEditing(true)}
          className="w-full py-2 rounded-xl bg-slate-50 text-slate-600 font-semibold text-sm hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
        >
          <TrendingDown className="w-4 h-4" />
          更新体重 (Weekly Check-in)
        </button>
      )}
    </div>
  );
};