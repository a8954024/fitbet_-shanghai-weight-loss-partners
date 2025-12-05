import React, { useState, useEffect } from 'react';
import { GameSetup } from './components/GameSetup';
import { Dashboard } from './components/Dashboard';
import { GameState } from './types';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState | null>(() => {
    // Try to load from local storage
    const saved = localStorage.getItem('fitbet_state');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (gameState) {
      localStorage.setItem('fitbet_state', JSON.stringify(gameState));
    } else {
      localStorage.removeItem('fitbet_state');
    }
  }, [gameState]);

  const handleStart = (newState: GameState) => {
    setGameState(newState);
  };

  const handleUpdatePlayerWeight = (id: number, newWeight: number) => {
    if (!gameState) return;

    const updatedPlayers = gameState.players.map(p => {
      if (p.id === id) {
        const today = new Date().toISOString();
        // Create new history entry
        const newHistory = [...(p.weightHistory || []), { date: today, weight: newWeight }];

        return {
          ...p,
          currentWeight: newWeight,
          weightHistory: newHistory,
          lastUpdateDate: today
        };
      }
      return p;
    });

    setGameState({
      ...gameState,
      players: updatedPlayers
    });
  };

  const handlePoke = (id: number) => {
    if (!gameState) return;

    const updatedPlayers = gameState.players.map(p => {
      if (p.id === id) {
        return { ...p, cheers: (p.cheers || 0) + 1 };
      }
      return p;
    });

    setGameState({
      ...gameState,
      players: updatedPlayers
    });
  };

  const handleReset = () => {
    if (confirm('确定要重置游戏吗？所有数据将丢失。')) {
      setGameState(null);
      localStorage.removeItem('fitbet_messages');
    }
  };

  return (
    <div className="min-h-screen font-sans pb-10">
      <header className="bg-white/80 backdrop-blur-md border-b border-white/20 sticky top-0 z-30 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚖️</span>
            <span className="font-black text-xl tracking-tight bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
              FitBet
            </span>
          </div>
          {gameState && (
            <div className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
              目标: -4%
            </div>
          )}
        </div>
      </header>

      <main className="pt-6">
        {!gameState ? (
          <GameSetup onStart={handleStart} />
        ) : (
          <Dashboard
            state={gameState}
            onUpdatePlayer={handleUpdatePlayerWeight}
            onPoke={handlePoke}
            onReset={handleReset}
            onUpdateState={setGameState}
          />
        )}
      </main>
    </div>
  );
};

export default App;