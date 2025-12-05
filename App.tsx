import React, { useState, useEffect } from 'react';
import { GameSetup } from './components/GameSetup';
import { Dashboard } from './components/Dashboard';
import { Layout } from './components/Layout';
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
    <Layout gameState={gameState} onReset={handleReset}>
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
    </Layout>
  );
};

export default App;