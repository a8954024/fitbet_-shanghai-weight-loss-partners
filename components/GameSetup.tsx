import React, { useState } from 'react';
import { Plus, Trash2, Trophy, Target, Wallet, Info } from 'lucide-react';
import { GameState, Player, PayoutMode, ActivityLog } from '../types';
import { RULES_CONTENT } from '../constants';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { ToastContainer, ToastProps } from './ui/Toast';

interface GameSetupProps {
  onStart: (state: GameState) => void;
}

export const GameSetup: React.FC<GameSetupProps> = ({ onStart }) => {
  const [players, setPlayers] = useState<Omit<Player, 'id' | 'weightHistory' | 'lastUpdateDate' | 'cheers' | 'badges' | 'avatarSeed' | 'joinDate' | 'streak'>[]>([
    { name: '', initialWeight: 0, currentWeight: 0, targetWeight: 0, betAmount: 500 }
  ]);
  const [payoutMode, setPayoutMode] = useState<PayoutMode>(PayoutMode.HAPPY_TEAM_BUILDING);
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substring(7);
    setToasts(prev => [...prev, { id, message, type, onClose: removeToast }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const handleAddPlayer = () => {
    setPlayers([...players, { name: '', initialWeight: 0, currentWeight: 0, targetWeight: 0, betAmount: 500 }]);
  };

  const handleRemovePlayer = (index: number) => {
    setPlayers(players.filter((_, i) => i !== index));
  };

  const handlePlayerChange = (index: number, field: keyof Player, value: string | number) => {
    const newPlayers = [...players];
    if (field === 'initialWeight') {
      const weight = Number(value);
      newPlayers[index] = {
        ...newPlayers[index],
        initialWeight: weight,
        currentWeight: weight,
        targetWeight: Number((weight * 0.96).toFixed(1)) // Default 4% target
      };
    } else {
      // @ts-ignore
      newPlayers[index] = { ...newPlayers[index], [field]: value };
    }
    setPlayers(newPlayers);
  };

  const handleStart = () => {
    if (players.some(p => !p.name || !p.initialWeight)) {
      addToast('请填写所有选手信息', 'error');
      return;
    }

    const startDate = new Date().toISOString();
    const fullPlayers: Player[] = players.map(p => ({
      ...p,
      id: Date.now() + Math.random(),
      weightHistory: [{ date: startDate, weight: p.initialWeight }],
      lastUpdateDate: startDate,
      cheers: 0,
      badges: [],
      avatarSeed: Math.random().toString(36).substring(7),
      joinDate: startDate,
      streak: 0
    }));

    const initialLog: ActivityLog = {
      id: crypto.randomUUID(),
      type: 'GAME_START',
      message: '挑战正式开始！',
      timestamp: startDate
    };

    const initialState: GameState = {
      isStarted: true,
      startDate,
      players: fullPlayers,
      betAmount: 0, // Not used anymore
      payoutMode,
      logs: [initialLog],
      targetPercentage: 4
    };

    onStart(initialState);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-32 relative">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <div className="text-center space-y-6 py-12 animate-enter">
        <div className="inline-flex p-6 rounded-full bg-gradient-to-br from-brand-500/20 to-rose-500/20 mb-4 ring-1 ring-white/10 backdrop-blur-3xl">
          <Trophy className="w-16 h-16 text-brand-500 drop-shadow-[0_0_15px_rgba(249,115,22,0.5)]" />
        </div>
        <h1 className="text-5xl md:text-7xl font-display font-black tracking-tight text-white">
          魔都 <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-rose-500">甩肉</span> 合伙人
        </h1>
        <p className="text-xl text-stone-400 max-w-2xl mx-auto font-light">
          不仅仅是减肥，更是一场关于意志力与团队荣誉的较量。
        </p>
      </div>

      <div className="grid md:grid-cols-12 gap-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
        {/* Left Column: Rules & Settings */}
        <div className="md:col-span-5 space-y-6">
          <Card title="📜 游戏规则" variant="glass" className="h-full">
            <div className="space-y-6">
              <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
                <Target className="w-6 h-6 text-brand-400 mt-1 shrink-0" />
                <div>
                  <h4 className="font-bold text-stone-200">目标</h4>
                  <p className="text-sm text-stone-400">4周内减重 <span className="text-brand-400 font-bold">4%</span></p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
                <Wallet className="w-6 h-6 text-brand-400 mt-1 shrink-0" />
                <div>
                  <h4 className="font-bold text-stone-200">赌注</h4>
                  <p className="text-sm text-stone-400">每人自定义投入金额进入奖池</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
                <Info className="w-6 h-6 text-brand-400 mt-1 shrink-0" />
                <div>
                  <h4 className="font-bold text-stone-200">结算模式</h4>
                  <div className="mt-2">
                    <select
                      className="w-full bg-stone-900/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-stone-300 focus:ring-2 focus:ring-brand-500 outline-none"
                      value={payoutMode}
                      onChange={(e) => setPayoutMode(e.target.value as PayoutMode)}
                    >
                      {RULES_CONTENT.modes.map(mode => (
                        <option key={mode.id} value={mode.id}>{mode.name}</option>
                      ))}
                    </select>
                    <p className="text-xs text-stone-500 mt-2">
                      {RULES_CONTENT.modes.find(m => m.id === payoutMode)?.desc}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Players */}
        <div className="md:col-span-7">
          <Card className="h-full" variant="glass">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                👥 参赛选手
                <span className="text-sm font-normal text-stone-500 bg-white/5 px-2 py-0.5 rounded-full">{players.length}人</span>
              </h3>
              <Button size="sm" variant="secondary" onClick={handleAddPlayer} icon={<Plus className="w-4 h-4" />}>
                添加
              </Button>
            </div>

            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {players.map((player, index) => (
                <div key={index} className="group relative bg-stone-900/40 p-5 rounded-2xl border border-white/5 hover:border-brand-500/30 transition-all duration-300">
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
                    {/* Name: 3 cols */}
                    <div className="sm:col-span-3">
                      <label className="text-xs font-bold text-stone-500 uppercase mb-1.5 block">名字</label>
                      <input
                        className="w-full bg-transparent border-b border-white/10 py-2 text-lg font-medium text-white focus:border-brand-500 focus:outline-none placeholder:text-stone-700 transition-colors"
                        value={player.name}
                        onChange={e => handlePlayerChange(index, 'name', e.target.value)}
                        placeholder="输入名字"
                      />
                    </div>
                    {/* Initial Weight: 3 cols */}
                    <div className="sm:col-span-3">
                      <label className="text-xs font-bold text-stone-500 uppercase mb-1.5 block">初始体重</label>
                      <div className="relative">
                        <input
                          type="number"
                          className="w-full bg-transparent border-b border-white/10 py-2 text-lg font-medium text-white focus:border-brand-500 focus:outline-none placeholder:text-stone-700 transition-colors"
                          value={player.initialWeight || ''}
                          onChange={e => handlePlayerChange(index, 'initialWeight', e.target.value)}
                          placeholder="0.0"
                        />
                        <span className="absolute right-0 bottom-2 text-sm text-stone-600">kg</span>
                      </div>
                    </div>
                    {/* Target Weight: 3 cols */}
                    <div className="sm:col-span-3">
                      <label className="text-xs font-bold text-stone-500 uppercase mb-1.5 block">目标体重</label>
                      <div className="relative">
                        <input
                          type="number"
                          className="w-full bg-transparent border-b border-white/10 py-2 text-lg font-medium text-white focus:border-brand-500 focus:outline-none placeholder:text-stone-700 transition-colors"
                          value={player.targetWeight || ''}
                          onChange={e => handlePlayerChange(index, 'targetWeight', e.target.value)}
                          placeholder="默认4%"
                        />
                        <span className="absolute right-0 bottom-2 text-sm text-stone-600">kg</span>
                      </div>
                    </div>
                    {/* Bet Amount: 2 cols */}
                    <div className="sm:col-span-2">
                      <label className="text-xs font-bold text-stone-500 uppercase mb-1.5 block">赌注</label>
                      <div className="relative">
                        <input
                          type="number"
                          className="w-full bg-transparent border-b border-white/10 py-2 text-lg font-medium text-brand-400 focus:border-brand-500 focus:outline-none transition-colors"
                          value={player.betAmount || ''}
                          onChange={e => handlePlayerChange(index, 'betAmount', Number(e.target.value))}
                          placeholder="500"
                        />
                        <span className="absolute right-0 bottom-2 text-sm text-stone-600">¥</span>
                      </div>
                    </div>
                    {/* Delete: 1 col */}
                    <div className="sm:col-span-1 flex justify-end pb-2">
                      {players.length > 1 && (
                        <button
                          onClick={() => handleRemovePlayer(index)}
                          className="p-2 text-stone-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/90 to-transparent z-50 flex justify-center md:relative md:bg-none md:p-0 md:pt-8 animate-fade-in" style={{ animationDelay: '0.4s' }}>
        <Button
          size="lg"
          onClick={handleStart}
          className="w-full md:w-auto px-16 py-5 text-xl font-bold shadow-2xl shadow-brand-500/30 hover:scale-105 active:scale-95 transition-transform"
          icon={<Trophy className="w-6 h-6" />}
        >
          开启挑战
        </Button>
      </div>
    </div>
  );
};