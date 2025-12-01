import React, { useState } from 'react';
import { GameState, Player } from '../types';
import { DEFAULT_BET, TARGET_PERCENTAGE } from '../constants';
import { DollarSign, ArrowRight } from 'lucide-react';
import { Avatar } from './Avatar';

interface GameSetupProps {
  onStart: (gameState: GameState) => void;
}

export const GameSetup: React.FC<GameSetupProps> = ({ onStart }) => {
  const [bet, setBet] = useState(DEFAULT_BET);
  const [inputs, setInputs] = useState<{ name: string; weight: string }[]>(
    Array(4).fill({ name: '', weight: '' })
  );

  const handleInputChange = (index: number, field: 'name' | 'weight', value: string) => {
    const newInputs = [...inputs];
    newInputs[index] = { ...newInputs[index], [field]: value };
    setInputs(newInputs);
  };

  const isFormValid = inputs.every(p => p.name.trim() !== '' && p.weight !== '' && !isNaN(Number(p.weight)));

  const handleStart = () => {
    if (!isFormValid) return;

    const players: Player[] = inputs.map((input, idx) => {
      const initial = Number(input.weight);
      return {
        id: idx,
        name: input.name,
        initialWeight: initial,
        currentWeight: initial,
        targetWeight: Number((initial * (1 - TARGET_PERCENTAGE)).toFixed(1)),
        avatarSeed: `${input.name}-${idx}` // Generate consistent avatar based on name
      };
    });

    onStart({
      isStarted: true,
      betAmount: bet,
      startDate: new Date().toISOString(),
      players
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-slate-800 mb-4">魔都甩肉合伙人 🏃‍♂️</h1>
        <p className="text-slate-600 text-lg">Season 1: Start Your 28-Day Transformation</p>
      </div>

      <div className="bg-white rounded-3xl shadow-xl p-8 mb-8 border border-slate-100">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
          <div className="bg-orange-100 p-3 rounded-full">
            <DollarSign className="w-6 h-6 text-orange-600" />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-semibold text-slate-500 uppercase tracking-wide mb-1">
              保证金 (每人)
            </label>
            <select 
              value={bet} 
              onChange={(e) => setBet(Number(e.target.value))}
              className="w-full text-2xl font-bold text-slate-800 bg-transparent border-none focus:ring-0 p-0 cursor-pointer"
            >
              <option value={200}>¥200 (娱乐局)</option>
              <option value={500}>¥500 (标准局 - 推荐)</option>
              <option value={1000}>¥1000 (狠人局)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {inputs.map((player, idx) => (
            <div key={idx} className="bg-slate-50 rounded-2xl p-4 flex items-center gap-4 border border-slate-200 transition-all focus-within:ring-2 focus-within:ring-blue-400">
              <Avatar seed={player.name || `Player ${idx + 1}`} size="md" animate={false} />
              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  placeholder={`成员 ${idx + 1} 名字`}
                  value={player.name}
                  onChange={(e) => handleInputChange(idx, 'name', e.target.value)}
                  className="w-full bg-transparent font-bold text-slate-800 placeholder-slate-400 focus:outline-none"
                />
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="初始体重 (kg)"
                    value={player.weight}
                    onChange={(e) => handleInputChange(idx, 'weight', e.target.value)}
                    className="w-full bg-white rounded-lg px-3 py-1 text-sm border border-slate-200 focus:outline-none focus:border-blue-400"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center">
        <button
          onClick={handleStart}
          disabled={!isFormValid}
          className={`
            group relative flex items-center gap-3 px-8 py-4 rounded-full text-xl font-bold text-white shadow-xl transition-all
            ${isFormValid ? 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:scale-105' : 'bg-slate-300 cursor-not-allowed'}
          `}
        >
          {isFormValid ? '启动仪式 (Day 0)' : '请填写完整信息'}
          <ArrowRight className={`w-6 h-6 ${isFormValid ? 'group-hover:translate-x-1 transition-transform' : ''}`} />
        </button>
      </div>

      <div className="mt-8 text-center text-slate-400 text-sm">
        <p>⚠️ 建议使用电子秤，早晨空腹称重</p>
      </div>
    </div>
  );
};