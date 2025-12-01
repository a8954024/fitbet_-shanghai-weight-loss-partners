import React, { useState } from 'react';
import { GameState, PayoutMode } from '../types';
import { PlayerDashboard } from './PlayerDashboard';
import { RULES_CONTENT } from '../constants';
import { Trophy, Calendar, Info, RefreshCw, Copy, Check } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell
} from 'recharts';

interface DashboardProps {
  state: GameState;
  onUpdatePlayer: (id: number, newWeight: number) => void;
  onReset: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ state, onUpdatePlayer, onReset }) => {
  const [showRules, setShowRules] = useState(false);
  const [copied, setCopied] = useState(false);

  const totalPool = state.betAmount * state.players.length;
  const winners = state.players.filter(p => p.currentWeight <= p.targetWeight);
  const losers = state.players.filter(p => p.currentWeight > p.targetWeight);

  // Data for Chart
  const chartData = state.players.map(p => ({
    name: p.name,
    progress: ((p.initialWeight - p.currentWeight) / p.initialWeight) * 100,
    target: 4 // The 4% line
  }));

  const handleCopyReport = () => {
    const daysPassed = Math.floor((new Date().getTime() - new Date(state.startDate).getTime()) / (1000 * 3600 * 24)) + 1;
    const report = `【魔都甩肉计划 Season 1】
📅 进度：Day ${daysPassed} / 28
💰 奖池：¥${totalPool}

📊 战况播报：
${state.players.map(p => {
  const loss = p.initialWeight - p.currentWeight;
  const pct = (loss / p.initialWeight) * 100;
  const isTargetMet = pct >= 4;
  return `- ${p.name}: ${loss >= 0 ? '减去' : '胖了'} ${Math.abs(loss).toFixed(1)}kg (${pct.toFixed(1)}%) ${isTargetMet ? '✅ 达标' : '⚠️ 加油'}`;
}).join('\n')}

${winners.length === 4 ? '🎉 全员达标！庄家瑟瑟发抖！' : '💪 没达标的请注意，¥' + state.betAmount + ' 正在离你而去！'}
明早记得空腹打卡！`;

    navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 pb-20">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gradient-to-br from-orange-400 to-orange-600 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
          <div className="absolute right-0 top-0 opacity-10 transform translate-x-4 -translate-y-4">
            <Trophy size={140} />
          </div>
          <div className="relative z-10">
            <p className="text-orange-100 font-medium mb-1">奖金池 (Pool)</p>
            <h2 className="text-5xl font-bold">¥{totalPool}</h2>
            <p className="text-sm mt-2 opacity-90">
              {winners.length > 0 
                ? `${winners.length} 人达标` 
                : "无人达标，加油！"}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-100 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-2 text-slate-500">
            <Calendar className="w-5 h-5" />
            <span className="font-semibold uppercase text-xs tracking-wider">时间线</span>
          </div>
          <div className="space-y-3">
             <div className="flex justify-between text-sm">
               <span>已进行</span>
               <span className="font-bold text-slate-800">Day {Math.floor((new Date().getTime() - new Date(state.startDate).getTime()) / (1000 * 3600 * 24)) + 1} / 28</span>
             </div>
             <div className="w-full bg-slate-100 rounded-full h-2">
               <div className="bg-blue-500 h-2 rounded-full" style={{ width: '4%' }}></div>
             </div>
             <p className="text-xs text-slate-400">记得每周一早晨空腹打卡!</p>
          </div>
        </div>

        <div className="bg-indigo-50 rounded-3xl p-6 shadow-md border border-indigo-100 flex flex-col justify-center relative">
          <button 
            onClick={() => setShowRules(!showRules)}
            className="absolute top-4 right-4 text-indigo-400 hover:text-indigo-600"
          >
            <Info className="w-5 h-5" />
          </button>
          <p className="text-indigo-600 font-bold mb-2">当前模式: {RULES_CONTENT.modes.find(m => m.id === PayoutMode.HAPPY_TEAM_BUILDING)?.name}</p>
          <div className="text-sm text-indigo-800 bg-white/50 p-3 rounded-xl backdrop-blur-sm">
             {losers.length > 0 ? (
               <p>
                 目前 <span className="font-bold text-red-500">{losers.map(l => l.name).join(', ')}</span> 没达标。
                 如果维持现状，这 {losers.length * state.betAmount} 元将用于请大家吃大餐！🍖
               </p>
             ) : (
               <p className="text-green-600 font-bold">全员达标！这不科学！看来要为了健康而战了！</p>
             )}
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {state.players.map(player => (
          <PlayerDashboard 
            key={player.id} 
            player={player} 
            onUpdateWeight={onUpdatePlayer} 
          />
        ))}
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
         <button
          onClick={handleCopyReport}
          className={`flex items-center justify-center gap-2 px-6 py-3 rounded-full font-bold text-white transition-all transform hover:scale-105 shadow-lg ${copied ? 'bg-green-500' : 'bg-slate-800 hover:bg-slate-900'}`}
         >
           {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
           {copied ? '已复制到剪贴板' : '复制微信群战报'}
         </button>
      </div>

      {/* Visualization */}
      <div className="bg-white rounded-3xl shadow-xl p-8 mb-12">
        <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          减重排行榜 (%)
        </h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" domain={[0, 'auto']} hide />
              <YAxis dataKey="name" type="category" width={80} tick={{fill: '#64748b', fontSize: 14}} axisLine={false} tickLine={false} />
              <Tooltip 
                cursor={{fill: '#f1f5f9'}}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
              />
              <ReferenceLine x={4} stroke="green" strokeDasharray="3 3" label={{ position: 'top', value: 'Goal (4%)', fill: 'green', fontSize: 12 }} />
              <Bar dataKey="progress" radius={[0, 10, 10, 0]} barSize={32}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.progress >= 4 ? '#22c55e' : entry.progress < 0 ? '#ef4444' : '#3b82f6'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Rules Modal / Section */}
      {showRules && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowRules(false)}>
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-8" onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-bold mb-4">{RULES_CONTENT.title}</h2>
            
            <div className="space-y-6 text-slate-700">
              <section>
                <h3 className="font-bold text-lg mb-2 text-slate-900">1. 核心机制</h3>
                <ul className="list-disc pl-5 space-y-1">
                  {RULES_CONTENT.mechanics.map((m, i) => <li key={i}>{m}</li>)}
                </ul>
              </section>
              
              <section>
                <h3 className="font-bold text-lg mb-2 text-slate-900">2. 金额设定</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {RULES_CONTENT.money.map((m, i) => (
                    <div key={i} className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <div className="font-bold text-orange-600">¥{m.amount}</div>
                      <div className="text-xs font-semibold">{m.label}</div>
                      <div className="text-xs text-slate-500 mt-1">{m.desc}</div>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="font-bold text-lg mb-2 text-slate-900">3. 奖惩分配 (推荐玩法B)</h3>
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                  <p className="font-bold text-blue-800">快乐团建 (友谊模式)</p>
                  <ul className="list-disc pl-5 mt-2 space-y-1 text-sm text-blue-700">
                    <li><strong>达标者：</strong>拿回自己的本金。</li>
                    <li><strong>未达标者：</strong>保证金充公。</li>
                    <li><strong>资金用途：</strong>充公的钱用来请所有人（包括输的人）去吃一顿上海的高端自助或火锅。</li>
                    <li><em>心理学：输的人是“金主爸爸”，赢的人免费蹭饭，大家都能聚会，感情不会破裂。</em></li>
                  </ul>
                </div>
              </section>
            </div>

            <button 
              onClick={() => setShowRules(false)}
              className="mt-8 w-full py-3 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-900"
            >
              关闭
            </button>
          </div>
        </div>
      )}

      {/* Reset Button */}
      <div className="text-center mt-12">
        <button 
          onClick={() => {
            if(confirm("确定要重置所有数据重新开始吗？这会清除本地缓存。")) onReset();
          }}
          className="inline-flex items-center gap-2 text-slate-400 hover:text-red-500 transition-colors text-sm"
        >
          <RefreshCw className="w-4 h-4" />
          重置活动
        </button>
      </div>
    </div>
  );
};