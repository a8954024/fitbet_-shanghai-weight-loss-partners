import React, { useState } from 'react';
import { Plus, Trash2, Trophy } from 'lucide-react';
import { GameState, Player, PayoutMode, ActivityLog } from '../types';
import { RULES_CONTENT } from '../constants';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

interface GameSetupProps {
  onStart: (state: GameState) => void;
}

export const GameSetup: React.FC<GameSetupProps> = ({ onStart }) => {
  const [players, setPlayers] = useState<Omit<Player, 'id' | 'weightHistory' | 'lastUpdateDate' | 'cheers' | 'badges' | 'avatarSeed' | 'joinDate'>[]>([
    { name: '', initialWeight: 0, currentWeight: 0, targetWeight: 0 }
  ]);
  const [betAmount, setBetAmount] = useState<number>(500);
  const [payoutMode, setPayoutMode] = useState<PayoutMode>(PayoutMode.HAPPY_TEAM_BUILDING);

  const handleAddPlayer = () => {
    setPlayers([...players, { name: '', initialWeight: 0, currentWeight: 0, targetWeight: 0 }]);
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
      newPlayers[index] = { ...newPlayers[index], [field]: value };
    }
    setPlayers(newPlayers);
  };

  const handleStart = () => {
    // Validate
    if (players.some(p => !p.name || !p.initialWeight)) {
      alert('请填写所有选手信息');
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
      joinDate: startDate
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
      betAmount,
      payoutMode,
      logs: [initialLog]
    };

    onStart(initialState);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8 pb-20">
      <div className="text-center space-y-4 py-10">
        <div className="inline-block p-4 rounded-full bg-orange-100 mb-4 animate-bounce">
          <Trophy className="w-12 h-12 text-orange-600" />
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight">
          魔都 <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">甩肉</span> 合伙人
        </h1>
        <p className="text-xl text-slate-500 max-w-2xl mx-auto">
          不仅仅是减肥，更是一场关于意志力与团队荣誉的较量。
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card title="📜 游戏规则">
          <div className="space-y-4 text-sm text-slate-600 leading-relaxed">
            <p>1. <strong>目标</strong>: 4周内减重 4%</p>
            <p>2. <strong>赌注</strong>: 每人投入 ¥{betAmount} 进入奖池</p>
            <p>3. <strong>结算</strong>: 达标者瓜分奖池，未达标者本金充公</p>
            <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
              <h4 className="font-bold text-orange-800 mb-2">当前模式: {RULES_CONTENT.modes.find(m => m.id === payoutMode)?.name}</h4>
              <p className="text-orange-700">{RULES_CONTENT.modes.find(m => m.id === payoutMode)?.desc}</p>
            </div>
          </div>
        </Card>

        <Card title="⚙️ 游戏设置">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">人均赌注 (¥)</label>
              <div className="grid grid-cols-3 gap-2">
                {[100, 200, 500, 1000].map(amount => (
                  <button
                    key={amount}
                    onClick={() => setBetAmount(amount)}
                    className={`px-4 py-2 rounded-lg font-bold transition-all ${betAmount === amount ? 'bg-orange-500 text-white shadow-lg shadow-orange-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                  >
                    ¥{amount}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">奖金分配模式</label>
              <select
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-orange-500"
                value={payoutMode}
                onChange={(e) => setPayoutMode(e.target.value as PayoutMode)}
              >
                {RULES_CONTENT.modes.map(mode => (
                  <option key={mode.id} value={mode.id}>{mode.name}</option>
                ))}
              </select>
            </div>
          </div>
        </Card>
      </div>

      <Card title="👥 选手列表" action={<Button size="sm" variant="outline" onClick={handleAddPlayer} leftIcon={<Plus className="w-4 h-4" />}>添加选手</Button>}>
        <div className="space-y-4">
          {players.map((player, index) => (
            <div key={index} className="flex flex-col md:flex-row gap-4 items-start md:items-end bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="flex-1 w-full">
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">名字</label>
                <input
                  className="input-field"
                  value={player.name}
                  onChange={e => handlePlayerChange(index, 'name', e.target.value)}
                  placeholder="你的大名"
                />
              </div>
              <div className="w-full md:w-32">
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">初始体重 (kg)</label>
                <input
                  type="number"
                  className="input-field"
                  value={player.initialWeight || ''}
                  onChange={e => handlePlayerChange(index, 'initialWeight', e.target.value)}
                  placeholder="0.0"
                />
              </div>
              <div className="w-full md:w-32">
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">目标体重 (kg)</label>
                <input
                  type="number"
                  className="input-field bg-slate-100 text-slate-500"
                  value={player.targetWeight || ''}
                  onChange={e => handlePlayerChange(index, 'targetWeight', Number(e.target.value))}
                  placeholder="自动计算"
                />
              </div>
              {players.length > 1 && (
                <button
                  onClick={() => handleRemovePlayer(index)}
                  className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </Card>

      <div className="flex justify-center pt-8">
        <Button
          size="lg"
          onClick={handleStart}
          className="w-full md:w-auto px-12 py-4 text-xl shadow-xl shadow-orange-200"
          rightIcon={<Trophy className="w-6 h-6" />}
        >
          开启挑战
        </Button>
      </div>
    </div>
  );
};