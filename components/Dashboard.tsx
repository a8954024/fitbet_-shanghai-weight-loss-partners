import React, { useState } from 'react';
import {
  Users,
  Settings,
  Plus,
  PartyPopper,
  Activity,
  ArrowUp,
  ArrowDown,
  Minus
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
      timestamp: new Date().toISOString()
    };

    onUpdateState({
      ...state,
      logs: [...(state.logs || []), newLog]
    });
  };

  const handleAddPlayer = () => {
    if (!newPlayerName || !newPlayerWeight) return;

    const weight = parseFloat(newPlayerWeight);
    const newPlayer: Player = {
      id: Date.now(),
      name: newPlayerName,
      initialWeight: weight,
      currentWeight: weight,
      targetWeight: Number((weight * 0.96).toFixed(1)),
      weightHistory: [{ date: new Date().toISOString(), weight }],
      lastUpdateDate: new Date().toISOString(),
      cheers: 0,
      badges: [],
      avatarSeed: Math.random().toString(36).substring(7),
      joinDate: new Date().toISOString()
    };

    const newLog: ActivityLog = {
      id: crypto.randomUUID(),
      type: 'JOIN',
      playerName: newPlayerName,
      message: '加入了挑战！',
      timestamp: new Date().toISOString()
    };

    onUpdateState({
      ...state,
      players: [...state.players, newPlayer],
      logs: [...(state.logs || []), newLog]
    });

    setNewPlayerName('');
    setNewPlayerWeight('');
    setShowAddPlayer(false);
  };

  const handleCheer = (targetPlayer: Player) => {
    onPoke(targetPlayer.id);

    const newLog: ActivityLog = {
      id: crypto.randomUUID(),
      type: 'CHEER',
      playerName: '有人', // Anonymous cheer or could be current user if we had auth
      message: `给 ${targetPlayer.name} 加油打气！`,
      timestamp: new Date().toISOString()
    };

    onUpdateState({
      ...state,
      logs: [...(state.logs || []), newLog]
    });
  };

  const getProgress = (player: Player) => {
    const totalLoss = player.initialWeight - player.currentWeight;
    const targetLoss = player.initialWeight - player.targetWeight;
    const percentage = (totalLoss / targetLoss) * 100;
    return Math.min(Math.max(percentage, 0), 100);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6 pb-20">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-orange-500 to-red-600 text-white border-none">
          <div className="text-white/80 text-sm font-medium mb-1">总奖池</div>
          <div className="text-3xl font-bold">¥{state.betAmount * state.players.length}</div>
        </Card>
        <Card>
          <div className="text-slate-500 text-sm font-medium mb-1">参赛人数</div>
          <div className="text-3xl font-bold text-slate-900">{state.players.length}</div>
        </Card>
        <Card>
          <div className="text-slate-500 text-sm font-medium mb-1">总减重</div>
          <div className="text-3xl font-bold text-green-600">
            {state.players.reduce((acc, p) => acc + (p.initialWeight - p.currentWeight), 0).toFixed(1)}kg
          </div>
        </Card>
        <Card>
          <div className="text-slate-500 text-sm font-medium mb-1">剩余天数</div>
          <div className="text-3xl font-bold text-blue-600">
            {Math.max(0, 28 - Math.floor((new Date().getTime() - new Date(state.startDate).getTime()) / (1000 * 60 * 60 * 24)))}
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content - Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Weight Chart */}
          <Card title="📈 减重趋势">
            <WeightChart players={state.players} />
          </Card>

          {/* Player List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5" /> 选手榜单
              </h3>
              <Button size="sm" variant="outline" onClick={() => setShowAddPlayer(!showAddPlayer)} leftIcon={<Plus className="w-4 h-4" />}>
                添加选手
              </Button>
            </div>

            {showAddPlayer && (
              <Card className="bg-blue-50/50 border-blue-100">
                <div className="flex gap-4 items-end">
                  <div className="flex-1">
                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">名字</label>
                    <input
                      className="input-field"
                      value={newPlayerName}
                      onChange={e => setNewPlayerName(e.target.value)}
                      placeholder="新选手名字"
                    />
                  </div>
                  <div className="w-32">
                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">初始体重</label>
                    <input
                      type="number"
                      className="input-field"
                      value={newPlayerWeight}
                      onChange={e => setNewPlayerWeight(e.target.value)}
                      placeholder="kg"
                    />
                  </div>
                  <Button onClick={handleAddPlayer}>加入</Button>
                </div>
              </Card>
            )}

            {state.players.map(player => {
              const progress = getProgress(player);
              const isTargetReached = player.currentWeight <= player.targetWeight;
              const diff = player.currentWeight - player.initialWeight;

              return (
                <Card key={player.id} className={`transition-all ${isTargetReached ? 'ring-2 ring-green-500 bg-green-50/30' : ''}`}>
                  <div className="flex items-center gap-4">
                    <Avatar seed={player.avatarSeed} size="lg" />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                            {player.name}
                            {isTargetReached && <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">达标!</span>}
                          </h4>
                          <div className="text-sm text-slate-500 flex items-center gap-2">
                            <span>当前: {player.currentWeight}kg</span>
                            <span className="text-slate-300">|</span>
                            <span>目标: {player.targetWeight}kg</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-lg font-bold ${diff <= 0 ? 'text-green-600' : 'text-red-500'} flex items-center justify-end gap-1`}>
                            {diff > 0 ? <ArrowUp className="w-4 h-4" /> : diff < 0 ? <ArrowDown className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
                            {Math.abs(diff).toFixed(1)}kg
                          </div>
                          <div className="text-xs text-slate-400">
                            {((diff / player.initialWeight) * 100).toFixed(1)}%
                          </div>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden mb-4">
                        <div
                          className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ${isTargetReached ? 'bg-green-500' : 'bg-orange-500'}`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="number"
                            className="w-24 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                            placeholder="新体重"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleWeightUpdate(player, (e.target as HTMLInputElement).value);
                                (e.target as HTMLInputElement).value = '';
                              }
                            }}
                          />
                          <span className="text-xs text-slate-400">按回车更新</span>
                        </div>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleCheer(player)}
                          className="text-orange-500 hover:text-orange-600 hover:bg-orange-50"
                          leftIcon={<PartyPopper className="w-4 h-4" />}
                        >
                          加油 ({player.cheers || 0})
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Sidebar - Right Column */}
        <div className="space-y-6">
          {/* Activity Feed */}
          <Card title="📢 实时动态" action={<Activity className="w-4 h-4 text-slate-400" />}>
            <ActivityFeed logs={state.logs || []} />
          </Card>

          {/* Settings Card */}
          <Card title="⚙️ 游戏设置" action={<Button size="sm" variant="ghost" onClick={() => setShowSettings(!showSettings)}><Settings className="w-4 h-4" /></Button>}>
            {showSettings ? (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">挑战模式</label>
                  <div className="space-y-2">
                    {RULES_CONTENT.modes.map(mode => (
                      <div
                        key={mode.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${state.payoutMode === mode.id ? 'bg-orange-50 border-orange-200 ring-1 ring-orange-500' : 'bg-white border-slate-200 hover:border-orange-200'}`}
                        onClick={() => onUpdateState({ ...state, payoutMode: mode.id })}
                      >
                        <div className="font-bold text-sm text-slate-900">{mode.name}</div>
                        <div className="text-xs text-slate-500 mt-1">{mode.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <Button variant="danger" size="sm" onClick={onReset} className="w-full">
                    重置游戏
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-sm text-slate-500">
                当前模式: <span className="font-bold text-slate-900">{RULES_CONTENT.modes.find(m => m.id === state.payoutMode)?.name || '未设置'}</span>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};