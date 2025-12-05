import React, { useState } from 'react';
import {
  Users,
  Settings,
  Plus,
  PartyPopper,
  Activity,
  ArrowUp,
  ArrowDown,
  Minus,
  Trophy,
  Timer
} from 'lucide-react';
import { GameState, Player, ActivityLog } from '../types';
import { RULES_CONTENT } from '../constants';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { WeightChart } from './WeightChart';
import { ActivityFeed } from './ActivityFeed';
import { Avatar } from './Avatar';

interface DashboardProps {
  state: GameState;
  onUpdatePlayer: (id: number, newWeight: number) => void;
  onPoke: (id: number) => void;
  onReset: () => void;
  onUpdateState: (newState: GameState) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  state,
  onUpdatePlayer,
  onPoke,
  onReset,
  onUpdateState
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerWeight, setNewPlayerWeight] = useState('');
  const [newPlayerTargetWeight, setNewPlayerTargetWeight] = useState('');
  const [newPlayerBet, setNewPlayerBet] = useState('500');

  // Settings State
  const [editingSettings, setEditingSettings] = useState(false);
  const [tempStartDate, setTempStartDate] = useState(state.startDate.split('T')[0]);
  const [tempEndDate, setTempEndDate] = useState(state.endDate ? state.endDate.split('T')[0] : '');

  const handleWeightUpdate = (player: Player, weightStr: string) => {
    const weight = parseFloat(weightStr);
    if (isNaN(weight)) return;

    onUpdatePlayer(player.id, weight);

    // Add log
    const newLog: ActivityLog = {
      id: crypto.randomUUID(),
      type: 'WEIGHT_UPDATE',
      playerId: player.id,
      playerName: player.name,
      message: `更新了体重: ${weight}kg`,
      timestamp: new Date().toISOString(),
      avatarSeed: player.avatarSeed
    };

    onUpdateState({
      ...state,
      logs: [...(state.logs || []), newLog]
    });
  };

  const handleAddPlayer = () => {
    if (!newPlayerName || !newPlayerWeight) return;

    const weight = parseFloat(newPlayerWeight);
    const target = newPlayerTargetWeight
      ? parseFloat(newPlayerTargetWeight)
      : Number((weight * 0.96).toFixed(1));
    const bet = parseFloat(newPlayerBet) || 500;

    const newPlayer: Player = {
      id: Date.now(),
      name: newPlayerName,
      initialWeight: weight,
      currentWeight: weight,
      targetWeight: target,
      betAmount: bet,
      weightHistory: [{ date: new Date().toISOString(), weight }],
      lastUpdateDate: new Date().toISOString(),
      cheers: 0,
      badges: [],
      avatarSeed: Math.random().toString(36).substring(7),
      joinDate: new Date().toISOString(),
      streak: 0
    };

    const newLog: ActivityLog = {
      id: crypto.randomUUID(),
      type: 'JOIN',
      playerName: newPlayerName,
      message: '加入了挑战！',
      timestamp: new Date().toISOString(),
      avatarSeed: newPlayer.avatarSeed
    };

    onUpdateState({
      ...state,
      players: [...state.players, newPlayer],
      logs: [...(state.logs || []), newLog]
    });

    setNewPlayerName('');
    setNewPlayerWeight('');
    setNewPlayerTargetWeight('');
    setNewPlayerBet('500');
    setShowAddPlayer(false);
  };

  const handleCheer = (targetPlayer: Player) => {
    onPoke(targetPlayer.id);

    const newLog: ActivityLog = {
      id: crypto.randomUUID(),
      type: 'CHEER',
      playerName: '有人',
      message: `给 ${targetPlayer.name} 加油打气！`,
      timestamp: new Date().toISOString(),
      avatarSeed: undefined // Anonymous or system avatar
    };

    onUpdateState({
      ...state,
      logs: [...(state.logs || []), newLog]
    });
  };

  const handleSaveSettings = () => {
    onUpdateState({
      ...state,
      startDate: new Date(tempStartDate).toISOString(),
      endDate: tempEndDate ? new Date(tempEndDate).toISOString() : undefined
    });
    setEditingSettings(false);
  };

  const getProgress = (player: Player) => {
    const totalLoss = player.initialWeight - player.currentWeight;
    const targetLoss = player.initialWeight - player.targetWeight;
    const percentage = (totalLoss / targetLoss) * 100;
    return Math.min(Math.max(percentage, 0), 100);
  };

  const totalPool = state.players.reduce((sum, p) => sum + (p.betAmount || 0), 0);
  const totalLost = state.players.reduce((acc, p) => acc + (p.initialWeight - p.currentWeight), 0).toFixed(1);
  const daysRemaining = Math.max(0, 28 - Math.floor((new Date().getTime() - new Date(state.startDate).getTime()) / (1000 * 60 * 60 * 24)));

  return (
    <div className="space-y-8">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-enter">
        <Card className="bg-gradient-to-br from-brand-500 to-rose-600 border-none shadow-lg shadow-brand-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-white/80 text-xs font-medium uppercase tracking-wider">总奖池</div>
              <div className="text-2xl font-black text-white">¥{totalPool}</div>
            </div>
          </div>
        </Card>

        <Card variant="glass">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-stone-500/10 rounded-lg">
              <Users className="w-5 h-5 text-stone-400" />
            </div>
            <div>
              <div className="text-stone-400 text-xs font-medium uppercase tracking-wider">参赛人数</div>
              <div className="text-2xl font-bold text-stone-200">{state.players.length}</div>
            </div>
          </div>
        </Card>

        <Card variant="glass">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <Activity className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <div className="text-stone-400 text-xs font-medium uppercase tracking-wider">总减重</div>
              <div className="text-2xl font-bold text-orange-400">{totalLost}kg</div>
            </div>
          </div>
        </Card>

        <Card variant="glass">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-500/10 rounded-lg">
              <Timer className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <div className="text-stone-400 text-xs font-medium uppercase tracking-wider">剩余天数</div>
              <div className="text-2xl font-bold text-rose-400">{daysRemaining}</div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content - Left Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Weight Chart */}
          <Card className="p-1">
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <h3 className="font-bold text-stone-200 flex items-center gap-2">
                <Activity className="w-5 h-5 text-brand-500" /> 减重趋势
              </h3>
            </div>
            <div className="p-4">
              <WeightChart players={state.players} />
            </div>
          </Card>

          {/* Player List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-stone-200 flex items-center gap-2">
                <Users className="w-5 h-5 text-brand-500" /> 选手榜单
              </h3>
              <Button size="sm" variant="secondary" onClick={() => setShowAddPlayer(!showAddPlayer)} icon={<Plus className="w-4 h-4" />}>
                添加选手
              </Button>
            </div>

            {showAddPlayer && (
              <Card className="animate-fade-in border-brand-500/30 bg-brand-500/5">
                <div className="space-y-4 p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="md:col-span-1">
                      <label className="text-xs font-bold text-stone-500 uppercase mb-1 block">名字</label>
                      <input
                        className="w-full bg-stone-900/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-brand-500 outline-none"
                        value={newPlayerName}
                        onChange={e => setNewPlayerName(e.target.value)}
                        placeholder="新选手名字"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-stone-500 uppercase mb-1 block">初始体重 (kg)</label>
                      <input
                        type="number"
                        className="w-full bg-stone-900/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-brand-500 outline-none"
                        value={newPlayerWeight}
                        onChange={e => setNewPlayerWeight(e.target.value)}
                        placeholder="0.0"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-stone-500 uppercase mb-1 block">目标体重 (选填)</label>
                      <input
                        type="number"
                        className="w-full bg-stone-900/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-brand-500 outline-none"
                        value={newPlayerTargetWeight}
                        onChange={e => setNewPlayerTargetWeight(e.target.value)}
                        placeholder="默认减重4%"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-stone-500 uppercase mb-1 block">赌注 (¥)</label>
                      <input
                        type="number"
                        className="w-full bg-stone-900/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-brand-500 outline-none"
                        value={newPlayerBet}
                        onChange={e => setNewPlayerBet(e.target.value)}
                        placeholder="500"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={handleAddPlayer} className="w-full md:w-auto">确认加入</Button>
                  </div>
                </div>
              </Card>
            )}

            <div className="grid gap-4">
              {state.players.map(player => {
                const progress = getProgress(player);
                const isTargetReached = player.currentWeight <= player.targetWeight;
                const diff = player.currentWeight - player.initialWeight;

                return (
                  <Card key={player.id} className={`transition-all hover:bg-white/10 ${isTargetReached ? 'ring-1 ring-green-500/50 bg-green-500/5' : ''}`}>
                    <div className="p-4 flex items-center gap-4">
                      <Avatar seed={player.avatarSeed} size="lg" />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="font-bold text-lg text-stone-200 flex items-center gap-2">
                              {player.name}
                              {isTargetReached && <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full border border-green-500/20">达标!</span>}
                            </h4>
                            <div className="text-sm text-stone-500 flex items-center gap-3 mt-1">
                              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-stone-600"></span> 当前: {player.currentWeight}kg</span>
                              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-brand-600"></span> 目标: {player.targetWeight}kg</span>
                              <span className="flex items-center gap-1 ml-2 px-2 py-0.5 bg-white/5 rounded text-xs"><span className="text-stone-400">赌注:</span> ¥{player.betAmount}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-xl font-black ${diff <= 0 ? 'text-green-400' : 'text-rose-400'} flex items-center justify-end gap-1`}>
                              {diff > 0 ? <ArrowUp className="w-4 h-4" /> : diff < 0 ? <ArrowDown className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
                              {Math.abs(diff).toFixed(1)}kg
                            </div>
                            <div className="text-xs text-stone-500 font-medium">
                              {((diff / player.initialWeight) * 100).toFixed(1)}%
                            </div>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="relative h-2.5 bg-stone-800 rounded-full overflow-hidden mb-4 ring-1 ring-white/5">
                          <div
                            className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ${isTargetReached ? 'bg-gradient-to-r from-green-500 to-emerald-400' : 'bg-gradient-to-r from-brand-500 to-rose-500'}`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-2 flex-1">
                            <input
                              type="number"
                              className="w-24 px-3 py-1.5 bg-stone-900/50 border border-white/10 rounded-lg text-sm text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                              placeholder="新体重"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleWeightUpdate(player, (e.target as HTMLInputElement).value);
                                  (e.target as HTMLInputElement).value = '';
                                }
                              }}
                            />
                            <span className="text-xs text-stone-500 hidden sm:inline">按回车更新</span>
                          </div>

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleCheer(player)}
                            className="text-brand-400 hover:text-brand-300 hover:bg-brand-500/10"
                            icon={<PartyPopper className="w-4 h-4" />}
                          >
                            加油
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar - Right Column */}
        <div className="space-y-6">
          {/* Activity Feed */}
          <Card title="📢 实时动态" className="h-[400px] flex flex-col">
            <ActivityFeed logs={state.logs || []} />
          </Card>

          {/* Settings Card */}
          <Card title="⚙️ 游戏设置" action={<Button size="sm" variant="ghost" onClick={() => setShowSettings(!showSettings)}><Settings className="w-4 h-4" /></Button>}>
            <div className="space-y-4">
              {editingSettings ? (
                <div className="space-y-4 animate-fade-in">
                  <div>
                    <label className="text-xs font-bold text-stone-500 uppercase mb-1 block">开始日期</label>
                    <input
                      type="date"
                      className="w-full bg-stone-900/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-brand-500 outline-none"
                      value={tempStartDate}
                      onChange={e => setTempStartDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-stone-500 uppercase mb-1 block">结束日期 (选填)</label>
                    <input
                      type="date"
                      className="w-full bg-stone-900/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-brand-500 outline-none"
                      value={tempEndDate}
                      onChange={e => setTempEndDate(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleSaveSettings} className="flex-1">保存</Button>
                    <Button size="sm" variant="secondary" onClick={() => setEditingSettings(false)} className="flex-1">取消</Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                    <span className="text-stone-400">当前奖池</span>
                    <span className="font-bold text-white">¥{totalPool}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                    <span className="text-stone-400">开始日期</span>
                    <span className="font-bold text-white text-xs">{new Date(state.startDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                    <span className="text-stone-400">分配模式</span>
                    <span className="font-bold text-white text-xs">
                      {RULES_CONTENT.modes.find(m => m.id === state.payoutMode)?.name || state.payoutMode}
                    </span>
                  </div>
                </>
              )}

              {showSettings && !editingSettings && (
                <div className="pt-4 border-t border-white/10 animate-fade-in space-y-2">
                  <Button variant="secondary" className="w-full" onClick={() => setEditingSettings(true)}>
                    修改设置
                  </Button>
                  <Button variant="danger" className="w-full" onClick={onReset}>
                    重置游戏
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};